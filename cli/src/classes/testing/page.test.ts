import type { TestEvent, TestRpc } from '../WebSocketServer.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CancelledError, SkipError } from './errors.js'
import { createPage } from './page.js'

type Handler = (method: string, params: any) => unknown

function createFakeRpc(handler: Handler) {
  const calls: { method: string, params: any }[] = []
  const timeouts = new Map<string, number | undefined>()
  const listeners = new Set<(event: TestEvent) => void>()
  // goto waits for the page to load. The fake page is complete unless a test sets this to 'loading'.
  const ready = { state: 'complete' }
  const emit = (event: TestEvent) => {
    for (const listener of [...listeners])
      listener(event)
  }
  const rpc: TestRpc = {
    request: (async (method: string, params?: object, timeoutMs?: number) => {
      calls.push({ method, params })
      timeouts.set(method, timeoutMs)
      if (method === 'evaluate' && (params as { code: string }).code.includes('readyState'))
        return { value: ready.state }
      return handler(method, params)
    }) as TestRpc['request'],
    onTestEvent: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
  return { rpc, calls, emit, listeners, ready, timeouts }
}

function evaluateCalls(calls: { method: string, params: any }[]) {
  return calls.filter(call => call.method === 'evaluate')
}

describe('createPage', () => {
  let controller: AbortController

  beforeEach(() => {
    vi.useFakeTimers()
    controller = new AbortController()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function makePage(rpc: TestRpc, overrides: Partial<Parameters<typeof createPage>[1]> = {}) {
    const session = { tabId: undefined as number | undefined }
    const onWaiting = vi.fn()
    const page = createPage(rpc, {
      service: 'Example',
      settings: { quality: 'high' },
      signal: controller.signal,
      interactive: false,
      session,
      onWaiting,
      ...overrides,
    })
    return { page, session, onWaiting }
  }

  it('goto opens a tab first then navigates', async () => {
    const { rpc, calls } = createFakeRpc((method) => {
      if (method === 'openTab')
        return { tabId: 7 }
      if (method === 'evaluate')
        return { value: 'complete' }
      return {}
    })
    const { page, session } = makePage(rpc)

    await page.goto('https://example.com/a')
    expect(calls[0]).toEqual({
      method: 'openTab',
      params: { url: 'https://example.com/a', service: 'Example', settings: { quality: 'high' } },
    })
    expect(session.tabId).toBe(7)

    await page.goto('https://example.com/b')
    expect(calls[calls.length - 2]).toEqual({
      method: 'navigate',
      params: { tabId: 7, url: 'https://example.com/b' },
    })
  })

  it('goto outwaits the extension, which allows 300s for a page that needs the user', async () => {
    const { rpc, timeouts } = createFakeRpc(method => method === 'openTab' ? { tabId: 7 } : {})
    const { page } = makePage(rpc)

    await page.goto('https://example.com/a')
    await page.goto('https://example.com/b')

    expect(timeouts.get('openTab')).toBeGreaterThan(300_000)
    expect(timeouts.get('navigate')).toBeGreaterThan(300_000)
  })

  it('goto asks the user when the tab is held on a page the activity does not match', async () => {
    let finishOpen: () => void = () => {}
    const { rpc, calls, emit } = createFakeRpc((method) => {
      if (method === 'openTab')
        return new Promise(resolve => finishOpen = () => resolve({ tabId: 7 }))
      return {}
    })
    const { page, onWaiting } = makePage(rpc, { interactive: true })

    const going = page.goto('https://example.com/a')
    await vi.advanceTimersByTimeAsync(0)
    emit({ tabId: 7, kind: 'waitingForUser', url: 'https://consent.example.com/?continue=x' })
    await vi.advanceTimersByTimeAsync(0)

    expect(onWaiting).toHaveBeenCalledWith('Finish on consent.example.com (sign in or accept), the test continues on its own')
    expect(calls).toContainEqual({ method: 'focus', params: { tabId: 7 } })

    finishOpen()
    await going
  })

  it('evaluate sends the function source', async () => {
    const { rpc, calls } = createFakeRpc((method) => {
      if (method === 'openTab')
        return { tabId: 3 }
      return { value: 42 }
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    const fn = (a: number, b: string) => `${a}${b}`
    const value = await page.evaluate(fn, 1, 'x')

    expect(value).toBe(42)
    const last = calls[calls.length - 1]
    expect(last.method).toBe('evaluate')
    expect(last.params).toEqual({ tabId: 3, code: fn.toString(), args: [1, 'x'] })
  })

  it('evaluate throws when no page is open', async () => {
    const { rpc } = createFakeRpc(() => ({ value: 1 }))
    const { page } = makePage(rpc)

    await expect(page.evaluate(() => 1)).rejects.toThrow('No page open, call page.goto first')
  })

  it('waitFor fails fast when no page is open', async () => {
    const { rpc } = createFakeRpc(() => ({ value: false }))
    const { page } = makePage(rpc)

    await expect(page.waitFor('#x')).rejects.toThrow('No page open, call page.goto first')
  })

  it('waitFor rejects when the tab reports an error', async () => {
    const { rpc, emit } = createFakeRpc((method) => {
      if (method === 'openTab')
        return { tabId: 1 }
      return { value: false }
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    const waiting = page.waitFor('#x')
    emit({ tabId: 1, kind: 'error', error: 'Test tab was closed' })

    await expect(waiting).rejects.toThrow('Test tab was closed')
  })

  it('waitFor rejects immediately when the tab already reported an error', async () => {
    const { rpc, calls, emit } = createFakeRpc((method) => {
      if (method === 'openTab')
        return { tabId: 1 }
      return { value: false }
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    emit({ tabId: 1, kind: 'error', error: 'Test tab was closed' })

    await expect(page.waitFor('#x')).rejects.toThrow('Test tab was closed')
    expect(evaluateCalls(calls).some(call => call.params.code.includes('querySelector'))).toBe(false)
  })

  it('goto rejects when the tab reports an error while loading', async () => {
    const { rpc, emit, ready } = createFakeRpc((method) => {
      if (method === 'openTab')
        return { tabId: 1 }
      return {}
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com/a')

    ready.state = 'loading'
    const navigating = page.goto('https://example.com/b')
    // Let goto reach its load wait before the tab fails.
    await vi.advanceTimersByTimeAsync(100)
    emit({ tabId: 1, kind: 'error', error: 'Test tab was closed' })

    await expect(navigating).rejects.toThrow('Test tab was closed')
  })

  it('dispose removes the tab error listener', async () => {
    const { rpc, listeners } = createFakeRpc((method) => {
      if (method === 'openTab')
        return { tabId: 1 }
      return {}
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')
    expect(listeners.size).toBe(1)

    page.dispose()

    expect(listeners.size).toBe(0)
  })

  it('waitForUser rejects when the tab reports an error', async () => {
    const { rpc, emit } = createFakeRpc((method, params) => {
      if (method === 'openTab')
        return { tabId: 1 }
      if (method === 'evaluate' && params.code.startsWith('async function pollUserBar'))
        return { value: { choice: null, done: false } }
      return { value: undefined }
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    const waiting = page.waitForUser('Log in')
    emit({ tabId: 1, kind: 'error', error: 'Test tab was closed' })

    await expect(waiting).rejects.toThrow('Test tab was closed')
  })

  it('waitFor times out with the selector in the message', async () => {
    const { rpc } = createFakeRpc((method) => {
      if (method === 'openTab')
        return { tabId: 1 }
      if (method === 'evaluate')
        return { value: false }
      return {}
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    const assertion = expect(page.waitFor('#missing')).rejects.toThrow('Timed out after 30000ms waiting for #missing')
    await vi.advanceTimersByTimeAsync(30_000)
    await assertion
  })

  it('waitForUser returns immediately when until is already true', async () => {
    const { rpc, calls } = createFakeRpc((method) => {
      if (method === 'openTab')
        return { tabId: 1 }
      if (method === 'evaluate')
        return { value: true }
      return {}
    })
    const { page, onWaiting } = makePage(rpc)
    await page.goto('https://example.com')

    await page.waitForUser('Log in', { until: () => true })

    expect(onWaiting).not.toHaveBeenCalled()
    expect(calls.some(call => call.method === 'focus')).toBe(false)
    expect(evaluateCalls(calls).some(call => call.params.code.includes('__pmd_wait_for_user'))).toBe(false)
  })

  it('waitForUser focuses only when interactive', async () => {
    const handler: Handler = (method) => {
      if (method === 'openTab')
        return { tabId: 5 }
      if (method === 'evaluate')
        return { value: { choice: 'continue', done: false } }
      return {}
    }

    const interactive = createFakeRpc(handler)
    const interactivePage = makePage(interactive.rpc, { interactive: true })
    await interactivePage.page.goto('https://example.com')
    await interactivePage.page.waitForUser('Log in')
    expect(interactive.calls.filter(call => call.method === 'focus')).toEqual([
      { method: 'focus', params: { tabId: 5 } },
    ])
    expect(interactivePage.onWaiting).toHaveBeenCalledWith('Log in')

    const headless = createFakeRpc(handler)
    const headlessPage = makePage(headless.rpc, { interactive: false })
    await headlessPage.page.goto('https://example.com')
    await headlessPage.page.waitForUser('Log in')
    expect(headless.calls.some(call => call.method === 'focus')).toBe(false)
  })

  it('waitForUser survives evaluate errors', async () => {
    let barPolls = 0
    const { rpc } = createFakeRpc((method, params) => {
      if (method === 'openTab')
        return { tabId: 2 }
      if (method === 'evaluate' && params.code.startsWith('async function pollUserBar')) {
        barPolls++
        if (barPolls === 1)
          throw new Error('Page navigated during evaluate')
        return { value: { choice: 'continue', done: false } }
      }
      return { value: undefined }
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    const waiting = page.waitForUser('Log in')
    await vi.advanceTimersByTimeAsync(500)
    await expect(waiting).resolves.toBeUndefined()
    expect(barPolls).toBe(2)
  })

  it('waitFor surfaces an exception thrown by the page instead of timing out', async () => {
    const { rpc } = createFakeRpc((method) => {
      if (method === 'openTab')
        return { tabId: 2 }
      if (method === 'evaluate')
        throw new Error('document.querySelector is not a function')
      return {}
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    await expect(page.waitFor('#x')).rejects.toThrow('document.querySelector is not a function')
  })

  it('url returns the tab location', async () => {
    const { rpc } = createFakeRpc((method, params) => {
      if (method === 'openTab')
        return { tabId: 2 }
      if (method === 'evaluate' && params.code.includes('location.href'))
        return { value: 'https://example.com/now' }
      return {}
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    await expect(page.url()).resolves.toBe('https://example.com/now')
  })

  it('reload navigates to the current url', async () => {
    const { rpc, calls } = createFakeRpc((method, params) => {
      if (method === 'openTab')
        return { tabId: 2 }
      if (method === 'evaluate' && params.code.includes('location.href'))
        return { value: 'https://example.com/redirected' }
      return {}
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    await page.reload()

    expect(calls.find(call => call.method === 'navigate')?.params).toEqual({ tabId: 2, url: 'https://example.com/redirected' })
  })

  it('back waits until the url changes, ignoring mid-navigation errors', async () => {
    const hrefs = ['https://example.com/b', undefined, 'https://example.com/b', 'https://example.com/a']
    const { rpc, calls } = createFakeRpc((method, params) => {
      if (method === 'openTab')
        return { tabId: 2 }
      if (method === 'evaluate' && params.code.includes('location.href')) {
        const href = hrefs.shift()
        if (href === undefined)
          throw new Error('Page navigated during evaluate')
        return { value: href }
      }
      return { value: undefined }
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com/b')

    const going = page.back()
    await vi.advanceTimersByTimeAsync(2000)
    await expect(going).resolves.toBeUndefined()
    expect(calls.some(call => call.method === 'evaluate' && call.params.code.includes('history.back'))).toBe(true)
    expect(hrefs).toEqual([])
  })

  it('back times out when the url never changes', async () => {
    const { rpc } = createFakeRpc((method, params) => {
      if (method === 'openTab')
        return { tabId: 2 }
      if (method === 'evaluate' && params.code.includes('location.href'))
        return { value: 'https://example.com/b' }
      return { value: undefined }
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com/b')

    const going = expect(page.back({ timeout: 1000 })).rejects.toThrow('Timed out after 1000ms waiting to go back')
    await vi.advanceTimersByTimeAsync(1500)
    await going
  })

  it('press dispatches the key through evaluate', async () => {
    const { rpc, calls } = createFakeRpc((method) => {
      if (method === 'openTab')
        return { tabId: 2 }
      return { value: undefined }
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    await page.press('Enter')

    const call = calls.filter(c => c.method === 'evaluate').at(-1)!
    expect(call.params.args).toEqual(['Enter'])
    expect(call.params.code).toContain('KeyboardEvent')
  })

  it('waitForUser throws SkipError on skip', async () => {
    const { rpc } = createFakeRpc((method, params) => {
      if (method === 'openTab')
        return { tabId: 2 }
      if (method === 'evaluate' && params.code.includes('__pmd_wait_for_user'))
        return { value: { choice: 'skip', done: false } }
      return { value: undefined }
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    await expect(page.waitForUser('Log in')).rejects.toBeInstanceOf(SkipError)
  })

  it('aborting throws CancelledError', async () => {
    const { rpc } = createFakeRpc((method) => {
      if (method === 'openTab')
        return { tabId: 1 }
      return { value: false }
    })
    const { page } = makePage(rpc)
    await page.goto('https://example.com')

    controller.abort()

    await expect(page.waitFor('#x')).rejects.toBeInstanceOf(CancelledError)
  })
})

describe('waitForUser with an async until', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('keeps waiting when an async until resolves false', async () => {
    // Stub the page so the real serialized poll runs in Node.
    const win: { __pmdUserChoice?: string } = {}
    vi.stubGlobal('window', win)
    vi.stubGlobal('document', {
      getElementById: () => ({ remove() {} }),
      createElement: () => ({}),
      documentElement: { append() {} },
    })

    let barPolls = 0
    const runInPage = (code: string, args: unknown[]) => {
      // eslint-disable-next-line no-eval
      return (0, eval)(`(${code})`)(...args)
    }
    const { rpc } = createFakeRpc(async (method, params) => {
      if (method === 'openTab')
        return { tabId: 2 }
      if (method === 'evaluate' && params.code.startsWith('async function pollUserBar')) {
        barPolls++
        const value = await runInPage(params.code, params.args)
        if (barPolls === 3)
          win.__pmdUserChoice = 'continue'
        return { value }
      }
      if (method === 'evaluate')
        return { value: await runInPage(params.code, params.args) }
      return {}
    })
    const session = { tabId: undefined as number | undefined }
    const page = createPage(rpc, {
      service: 'Example',
      signal: new AbortController().signal,
      interactive: false,
      session,
      onWaiting: vi.fn(),
    })
    await page.goto('https://example.com')

    const waiting = page.waitForUser('Log in', { until: async () => false })
    await vi.advanceTimersByTimeAsync(2000)

    await expect(waiting).resolves.toBeUndefined()
    expect(barPolls).toBe(4)
  })
})
