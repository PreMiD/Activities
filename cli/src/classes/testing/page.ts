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
// The extension waits up to 300s itself when the tab needs the user, so its error arrives before ours.
const OPEN_TIMEOUT_MS = DEFAULT_USER_TIMEOUT_MS + 30_000

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

const TRANSIENT_EVALUATE_ERROR = /^(?:Page navigated during evaluate|Test tab is not ready|Test tab did not load|Test evaluate timed out)$/

export function createPage(rpc: TestRpc, opts: {
  service: string
  settings?: Record<string, string | number | boolean>
  signal: AbortSignal
  interactive: boolean
  session: PageSession
  onWaiting: (message: string) => void
}): Page & { dispose: () => void } {
  const { session, signal } = opts

  // The first error the test tab reports. It stays set for the rest of the test.
  let tabError: Error | undefined
  let rejectOnTabError: (error: Error) => void = () => {}
  const tabFailure = new Promise<never>((_, reject) => {
    rejectOnTabError = reject
  })
  // Nothing awaits tabFailure until a wait races it, so keep it from being reported as unhandled.
  tabFailure.catch(() => {})

  // Set while goto waits, so a page that needs the user can be reported before openTab returns the tab id.
  let opening = false

  const unsubscribe = rpc.onTestEvent((event) => {
    if (event.kind === 'waitingForUser') {
      if (opening && (session.tabId === undefined || event.tabId === session.tabId)) {
        opts.onWaiting(`Finish on ${new URL(event.url).host} (sign in or accept), the test continues on its own`)
        if (opts.interactive)
          rpc.request('focus', { tabId: event.tabId }).catch(() => {})
      }
      return
    }
    if (event.kind !== 'error' || event.tabId !== session.tabId || tabError)
      return
    tabError = new Error(event.error)
    rejectOnTabError(tabError)
  })

  function throwIfTabFailed() {
    if (tabError)
      throw tabError
  }

  // Rejects as soon as the test tab reports an error, or at once if it already has.
  function untilTabFails<T>(task: Promise<T>): Promise<T> {
    return Promise.race([task, tabFailure])
  }

  const sleep = (ms: number) => untilTabFails(new Promise<void>(resolve => setTimeout(resolve, ms)))

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
    throwIfTabFailed()
    const result = await untilTabFails(rpc.request<{ value: Awaited<R> }>('evaluate', { tabId, code: fn.toString(), args }))
    return result.value
  }

  // Used while polling. Errors from a page that is loading or navigating are ignored, anything else is a real failure.
  async function tryEvaluate<A extends unknown[], R>(fn: (...args: A) => R | Promise<R>, ...args: A): Promise<Awaited<R> | undefined> {
    try {
      return await evaluate(fn, ...args)
    }
    catch (error) {
      throwIfAborted()
      throwIfTabFailed()
      if (error instanceof Error && TRANSIENT_EVALUATE_ERROR.test(error.message))
        return undefined
      throw error
    }
  }

  async function waitForLoad() {
    const deadline = Date.now() + LOAD_TIMEOUT_MS
    throwIfTabFailed()
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
    opening = true
    try {
      if (session.tabId === undefined) {
        const result = await rpc.request<{ tabId: number }>('openTab', { url, service: opts.service, settings: opts.settings }, OPEN_TIMEOUT_MS)
        session.tabId = result.tabId
      }
      else {
        await rpc.request('navigate', { tabId: session.tabId, url }, OPEN_TIMEOUT_MS)
      }
    }
    finally {
      opening = false
    }
    await waitForLoad()
  }

  async function waitFor(selector: string, waitOptions: WaitForOptions = {}): Promise<void> {
    const timeout = waitOptions.timeout ?? DEFAULT_WAIT_TIMEOUT_MS
    requireTab()
    throwIfTabFailed()
    const deadline = Date.now() + timeout
    while (true) {
      throwIfAborted()
      if (await tryEvaluate((s: string) => !!document.querySelector(s), selector))
        return
      if (Date.now() >= deadline)
        throw new Error(`Timed out after ${timeout}ms waiting for ${selector}`)
      await sleep(POLL_INTERVAL_MS)
    }
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

  async function waitForUser(message: string, userOptions: WaitForUserOptions = {}): Promise<void> {
    throwIfAborted()
    throwIfTabFailed()
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
      await sleep(USER_POLL_INTERVAL_MS)
    }
  }

  const currentUrl = () => evaluate(() => location.href)

  async function reload() {
    await goto(await currentUrl())
  }

  async function back(options: WaitForOptions = {}) {
    const timeout = options.timeout ?? DEFAULT_WAIT_TIMEOUT_MS
    const before = await currentUrl()
    await evaluate(() => {
      history.back()
    })
    const deadline = Date.now() + timeout
    while (true) {
      throwIfAborted()
      // undefined means the page is mid-navigation, which is not arrival yet
      const now = await tryEvaluate(() => location.href)
      if (now !== undefined && now !== before)
        break
      if (Date.now() >= deadline)
        throw new Error(`Timed out after ${timeout}ms waiting to go back from ${before}`)
      await sleep(POLL_INTERVAL_MS)
    }
    await waitForLoad()
  }

  async function press(key: string) {
    await evaluate((k: string) => {
      const target = document.activeElement ?? document.body
      for (const type of ['keydown', 'keypress', 'keyup'])
        target.dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true, cancelable: true }))
    }, key)
  }

  return { goto, click, fill, waitFor, evaluate, waitForUser, url: currentUrl, reload, back, press, dispose: unsubscribe }
}
