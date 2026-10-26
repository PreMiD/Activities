import type { TestRpc } from '../WebSocketServer.js'
import type { Page, WaitForOptions, WaitForUserOptions } from './types.js'
import { CancelledError, SkipError } from './errors.js'

export interface PageSession {
  tabId: number | undefined
}

const POLL_INTERVAL_MS = 250
const USER_POLL_INTERVAL_MS = 500
const DEFAULT_WAIT_TIMEOUT_MS = 30_000
const DEFAULT_USER_TIMEOUT_MS = 300_000
const LOAD_TIMEOUT_MS = 30_000

interface UserBarState {
  choice: 'continue' | 'skip' | null
  done: boolean
}

// Runs inside the test tab. It must not use anything outside its own parameters.
async function pollUserBar(message: string, untilCode: string | null): Promise<UserBarState> {
  const barId = '__pmd_wait_for_user'
  const state = window as unknown as { __pmdUserChoice?: 'continue' | 'skip' }

  if (!document.getElementById(barId)) {
    state.__pmdUserChoice = undefined

    const host = document.createElement('div')
    host.id = barId
    const root = host.attachShadow({ mode: 'open' })
    root.innerHTML = `<style>
      .bar { position: fixed; top: 0; left: 0; right: 0; z-index: 2147483647; display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: #1e1e2e; color: #fff; font: 14px system-ui, sans-serif; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4); }
      .msg { flex: 1; }
      button { font: inherit; padding: 6px 12px; border: 0; border-radius: 4px; cursor: pointer; }
      .continue { background: #5865f2; color: #fff; }
      .skip { background: transparent; color: #fff; border: 1px solid #888; }
    </style>
    <div class="bar"><span class="msg"></span><button class="continue">Continue</button><button class="skip">Skip test</button></div>`

    const msg = root.querySelector('.msg')
    if (msg)
      msg.textContent = message
    root.querySelector('.continue')?.addEventListener('click', () => {
      state.__pmdUserChoice = 'continue'
    })
    root.querySelector('.skip')?.addEventListener('click', () => {
      state.__pmdUserChoice = 'skip'
    })
    document.documentElement.append(host)
  }

  // Indirect eval runs the until condition in the extension's isolated user-script world.
  // The DOM is shared with the page, but page JavaScript globals are not.
  // eslint-disable-next-line no-eval
  const done = untilCode ? !!(await (0, eval)(`(${untilCode})`)()) : false
  return { choice: state.__pmdUserChoice ?? null, done }
}

export function createPage(rpc: TestRpc, opts: {
  service: string
  settings?: Record<string, string | number | boolean>
  signal: AbortSignal
  interactive: boolean
  session: PageSession
  onWaiting: (message: string) => void
}): Page {
  const { session, signal } = opts

  const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

  function throwIfAborted() {
    if (signal.aborted)
      throw new CancelledError('Test run was cancelled')
  }

  function requireTab(): number {
    if (session.tabId === undefined)
      throw new Error('No page open, call page.goto first')
    return session.tabId
  }

  async function evaluate<A extends unknown[], R>(fn: (...args: A) => R | Promise<R>, ...args: A): Promise<Awaited<R>> {
    throwIfAborted()
    const tabId = requireTab()
    const result = await rpc.request<{ value: Awaited<R> }>('evaluate', { tabId, code: fn.toString(), args })
    return result.value
  }

  // Used while polling. The page may be navigating, so errors are ignored.
  async function tryEvaluate<A extends unknown[], R>(fn: (...args: A) => R | Promise<R>, ...args: A): Promise<Awaited<R> | undefined> {
    try {
      return await evaluate(fn, ...args)
    }
    catch {
      throwIfAborted()
      return undefined
    }
  }

  async function waitForLoad() {
    const deadline = Date.now() + LOAD_TIMEOUT_MS
    while (true) {
      throwIfAborted()
      if (await tryEvaluate(() => document.readyState) === 'complete')
        return
      if (Date.now() >= deadline)
        throw new Error(`Timed out after ${LOAD_TIMEOUT_MS}ms waiting for the page to load`)
      await sleep(POLL_INTERVAL_MS)
    }
  }

  async function goto(url: string) {
    throwIfAborted()
    if (session.tabId === undefined) {
      const result = await rpc.request<{ tabId: number }>('openTab', { url, service: opts.service, settings: opts.settings })
      session.tabId = result.tabId
    }
    else {
      await rpc.request('navigate', { tabId: session.tabId, url })
    }
    await waitForLoad()
  }

  // Runs a wait that rejects as soon as the test tab reports an error, such as being closed.
  function withTabErrors<T>(task: (wait: (ms: number) => Promise<void>) => Promise<T>): Promise<T> {
    let fail: (error: Error) => void = () => {}
    const tabError = new Promise<never>((_, reject) => {
      fail = reject
    })
    const unsubscribe = rpc.onTestEvent((event) => {
      if (event.kind === 'error' && event.tabId === session.tabId)
        fail(new Error(event.error))
    })
    const wait = (ms: number) => Promise.race([sleep(ms), tabError])
    return Promise.race([task(wait), tabError]).finally(unsubscribe)
  }

  function waitFor(selector: string, waitOptions: WaitForOptions = {}): Promise<void> {
    const timeout = waitOptions.timeout ?? DEFAULT_WAIT_TIMEOUT_MS
    return withTabErrors(async (wait) => {
      requireTab()
      const deadline = Date.now() + timeout
      while (true) {
        throwIfAborted()
        if (await tryEvaluate((s: string) => !!document.querySelector(s), selector))
          return
        if (Date.now() >= deadline)
          throw new Error(`Timed out after ${timeout}ms waiting for ${selector}`)
        await wait(POLL_INTERVAL_MS)
      }
    })
  }

  async function click(selector: string) {
    await waitFor(selector)
    await evaluate((s: string) => {
      const el = document.querySelector<HTMLElement>(s)
      if (!el)
        throw new Error(`No element matches ${s}`)
      el.click()
    }, selector)
  }

  async function fill(selector: string, value: string) {
    await waitFor(selector)
    await evaluate((s: string, v: string) => {
      const el = document.querySelector<HTMLInputElement>(s)
      if (!el)
        throw new Error(`No element matches ${s}`)
      el.value = v
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }, selector, value)
  }

  async function removeUserBar() {
    await tryEvaluate(() => {
      document.getElementById('__pmd_wait_for_user')?.remove()
    })
  }

  function waitForUser(message: string, userOptions: WaitForUserOptions = {}): Promise<void> {
    return withTabErrors(async (wait) => {
      throwIfAborted()
      const tabId = requireTab()
      const timeout = userOptions.timeout ?? DEFAULT_USER_TIMEOUT_MS

      if (userOptions.until && await tryEvaluate(userOptions.until))
        return

      opts.onWaiting(message)
      if (opts.interactive)
        await rpc.request('focus', { tabId })

      const untilCode = userOptions.until?.toString() ?? null
      const deadline = Date.now() + timeout
      while (true) {
        throwIfAborted()
        const state = await tryEvaluate(pollUserBar, message, untilCode)
        if (state?.choice === 'skip') {
          await removeUserBar()
          throw new SkipError(`Skipped by user: ${message}`)
        }
        if (state?.done || state?.choice === 'continue') {
          await removeUserBar()
          return
        }
        if (Date.now() >= deadline)
          throw new Error(`Timed out waiting for user: ${message}`)
        await wait(USER_POLL_INTERVAL_MS)
      }
    })
  }

  return { goto, click, fill, waitFor, evaluate, waitForUser }
}
