import type { TestEvent, TestRpc } from '../WebSocketServer.js'
import type { PageSession } from './page.js'
import type { ActivityHandle, PresenceData, WaitForOptions } from './types.js'
import { CancelledError } from './errors.js'

const DEFAULT_NEXT_TIMEOUT_MS = 30_000

export function createActivity(rpc: TestRpc, opts: { session: PageSession, signal: AbortSignal }): ActivityHandle & { dispose: () => void, last: () => unknown } {
  const { session, signal } = opts

  const buffer: TestEvent[] = []
  const waiters = new Set<() => void>()
  let lastData: unknown

  const unsubscribe = rpc.onTestEvent((event) => {
    if (session.tabId === undefined || event.tabId !== session.tabId || event.kind === 'waitingForUser')
      return

    if (event.kind === 'setActivity')
      lastData = event.data
    else if (event.kind === 'clearActivity')
      lastData = undefined

    buffer.push(event)
    for (const notify of [...waiters])
      notify()
  })

  function consume(event: TestEvent): PresenceData | undefined {
    switch (event.kind) {
      case 'setActivity':
        return event.data as PresenceData
      case 'clearActivity':
        return undefined
      case 'invalid':
        throw new Error(`Invalid activity: ${event.error}`)
      case 'error':
        throw new Error(event.error)
    }
  }

  // Resolves when another event arrives. Rejects on timeout or abort.
  function waitForEvent(timeout: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const cleanups: (() => void)[] = []
      const settle = (error?: Error) => {
        for (const cleanup of cleanups.splice(0))
          cleanup()
        if (error)
          reject(error)
        else
          resolve()
      }

      const timer = setTimeout(() => settle(new Error(`No activity update within ${timeout}ms`)), timeout)
      const notify = () => settle()
      const onAbort = () => settle(new CancelledError('Test run was cancelled'))

      waiters.add(notify)
      signal.addEventListener('abort', onAbort, { once: true })
      cleanups.push(
        () => clearTimeout(timer),
        () => waiters.delete(notify),
        () => signal.removeEventListener('abort', onAbort),
      )
    })
  }

  async function next(options: WaitForOptions = {}): Promise<PresenceData | undefined> {
    const timeout = options.timeout ?? DEFAULT_NEXT_TIMEOUT_MS
    while (true) {
      if (signal.aborted)
        throw new CancelledError('Test run was cancelled')

      const event = buffer.shift()
      if (event)
        return consume(event)

      await waitForEvent(timeout)
    }
  }

  return {
    next,
    dispose: unsubscribe,
    last: () => lastData,
  }
}
