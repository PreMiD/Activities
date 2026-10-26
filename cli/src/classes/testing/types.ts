// Structural copies of the public types in premid/src/test.ts. The CLI cannot
// import across its rootDir, so keep these in sync by hand.

export type PresenceData = Record<string, unknown>

export interface TestOptions {
  /** Activity settings to apply for this test. */
  settings?: Record<string, string | number | boolean>
  /** Maximum time the whole test may run, in milliseconds. Defaults to 120s. */
  timeout?: number
}

export interface WaitForOptions {
  /** Maximum time to wait, in milliseconds. Defaults to 30s. */
  timeout?: number
}

export interface WaitForUserOptions {
  /**
   * Polled until it returns a truthy value, which ends the wait early.
   * Lets the test continue once the user has done what was asked.
   */
  until?: () => unknown
  /** Maximum time to wait for the user, in milliseconds. Defaults to 300s. */
  timeout?: number
}

export interface Page {
  /**
   * Navigates the test tab to `url`.
   * @param url The URL to open. It must match the activity's `regExp`.
   */
  goto: (url: string) => Promise<void>
  /**
   * Clicks the first element matching `selector`.
   * @param selector CSS selector of the element to click.
   */
  click: (selector: string) => Promise<void>
  /**
   * Fills the first input matching `selector` with `value`.
   * @param selector CSS selector of the input to fill.
   * @param value The value to type into the input.
   */
  fill: (selector: string, value: string) => Promise<void>
  /**
   * Waits until an element matching `selector` exists on the page.
   * Defaults to a 30s timeout.
   * @param selector CSS selector of the element to wait for.
   * @param options Timeout settings.
   */
  waitFor: (selector: string, options?: WaitForOptions) => Promise<void>
  /**
   * Runs `fn` inside the test tab with `args` and returns its awaited result.
   * `fn` is serialized, so it cannot capture variables from the test file.
   * Pass them through `args` instead. If the page navigates while `fn` is
   * pending, the call rejects with `Page navigated during evaluate`.
   * @param fn The function to run in the page.
   * @param args Arguments passed to `fn`.
   */
  evaluate: <A extends unknown[], R>(fn: (...args: A) => R | Promise<R>, ...args: A) => Promise<Awaited<R>>
  /**
   * Pauses the test and asks the user to do something in the browser.
   * Defaults to a 300s timeout. Polling continues across page reloads.
   * @param message Shown to the user in the terminal.
   * @param options Optional `until` condition and timeout.
   */
  waitForUser: (message: string, options?: WaitForUserOptions) => Promise<void>
}

export interface ActivityHandle {
  /**
   * Waits for the activity's next `setActivity` and returns its data.
   * Resolves to `undefined` if the activity clears its presence.
   * Defaults to a 30s timeout.
   * @param options Timeout settings.
   */
  next: (options?: WaitForOptions) => Promise<PresenceData | undefined>
}

export interface TestContext {
  page: Page
  activity: ActivityHandle
}

export type TestFn = (context: TestContext) => Promise<void> | void

export interface RegisteredTest {
  name: string
  options: TestOptions
  fn: TestFn
}
