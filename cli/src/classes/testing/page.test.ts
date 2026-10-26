import type { TestEvent, TestRpc } from '../WebSocketServer.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CancelledError, SkipError } from './errors.js'
import { createPage } from './page.js'

type Handler = (method: string, params: any) => unknown

function createFakeRpc(handler: Handler) {
  const calls: { method: string, params: any }[] = []
  const listeners = new Set<(event: TestEvent) => void>()
  const rpc: TestRpc = {
    request: (async (method: string, params?: object) => {
      calls.push({ method, params })
      // goto waits for the page to load, so the fake page is always complete.
      if (method === 'evaluate' && (params as { code: string }).code.includes('readyState'))
        return { value: 'complete' }
      return handler(method, params)
    }) as TestRpc['request'],
    onTestEvent: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
  return { rpc, calls }
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
      if (method === 'evaluate' && params.code.startsWith('function pollUserBar')) {
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
