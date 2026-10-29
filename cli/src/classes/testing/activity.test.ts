import type { TestEvent, TestRpc } from '../WebSocketServer.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createActivity } from './activity.js'
import { CancelledError } from './errors.js'

function createFakeRpc() {
  const listeners = new Set<(event: TestEvent) => void>()
  const rpc: TestRpc = {
    request: (async () => ({})) as TestRpc['request'],
    onTestEvent: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
  const emit = (event: TestEvent) => {
    for (const listener of [...listeners])
      listener(event)
  }
  return { rpc, emit, listenerCount: () => listeners.size }
}

describe('createActivity', () => {
  let controller: AbortController

  beforeEach(() => {
    vi.useFakeTimers()
    controller = new AbortController()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('next() returns a buffered event immediately', async () => {
    const { rpc, emit } = createFakeRpc()
    const session = { tabId: 4 as number | undefined }
    const activity = createActivity(rpc, { session, signal: controller.signal })

    emit({ tabId: 4, kind: 'setActivity', data: { details: 'Watching' } })

    await expect(activity.next()).resolves.toEqual({ details: 'Watching' })
    expect(activity.last()).toEqual({ details: 'Watching' })
    activity.dispose()
  })

  it('next() skips waitingForUser events, which are not activity updates', async () => {
    const { rpc, emit } = createFakeRpc()
    const session = { tabId: 4 as number | undefined }
    const activity = createActivity(rpc, { session, signal: controller.signal })

    emit({ tabId: 4, kind: 'waitingForUser', url: 'https://consent.example.com/' })
    emit({ tabId: 4, kind: 'setActivity', data: { details: 'Watching' } })

    await expect(activity.next()).resolves.toEqual({ details: 'Watching' })
    activity.dispose()
  })

  it('next() resolves undefined on clearActivity', async () => {
    const { rpc, emit } = createFakeRpc()
    const session = { tabId: 4 as number | undefined }
    const activity = createActivity(rpc, { session, signal: controller.signal })

    const pending = activity.next()
    emit({ tabId: 4, kind: 'clearActivity' })

    await expect(pending).resolves.toBeUndefined()
    activity.dispose()
  })

  it('next() rejects when tab error event arrives', async () => {
    const { rpc, emit } = createFakeRpc()
    const session = { tabId: 4 as number | undefined }
    const activity = createActivity(rpc, { session, signal: controller.signal })

    const pending = activity.next()
    emit({ tabId: 4, kind: 'error', error: 'Tab was closed' })

    await expect(pending).rejects.toThrow('Tab was closed')
    activity.dispose()
  })

  it('next() rejects with Invalid activity on invalid events', async () => {
    const { rpc, emit } = createFakeRpc()
    const session = { tabId: 4 as number | undefined }
    const activity = createActivity(rpc, { session, signal: controller.signal })

    emit({ tabId: 4, kind: 'invalid', error: 'details is required' })

    await expect(activity.next()).rejects.toThrow('Invalid activity: details is required')
    activity.dispose()
  })

  it('next() times out and ignores events from other tabs', async () => {
    const { rpc, emit } = createFakeRpc()
    const session = { tabId: 4 as number | undefined }
    const activity = createActivity(rpc, { session, signal: controller.signal })

    emit({ tabId: 99, kind: 'setActivity', data: { details: 'Other tab' } })

    const pending = expect(activity.next({ timeout: 1000 })).rejects.toThrow('No activity update within 1000ms')
    await vi.advanceTimersByTimeAsync(1000)
    await pending
    activity.dispose()
  })

  it('ignores events while no tab is open', async () => {
    const { rpc, emit } = createFakeRpc()
    const session = { tabId: undefined as number | undefined }
    const activity = createActivity(rpc, { session, signal: controller.signal })

    emit({ tabId: 4, kind: 'setActivity', data: { details: 'Early' } })

    const pending = expect(activity.next({ timeout: 500 })).rejects.toThrow('No activity update within 500ms')
    await vi.advanceTimersByTimeAsync(500)
    await pending
    activity.dispose()
  })

  it('dispose unsubscribes from test events', () => {
    const { rpc, listenerCount } = createFakeRpc()
    const session = { tabId: 4 as number | undefined }
    const activity = createActivity(rpc, { session, signal: controller.signal })

    expect(listenerCount()).toBe(1)
    activity.dispose()
    expect(listenerCount()).toBe(0)
  })

  it('aborting rejects a pending next() with CancelledError', async () => {
    const { rpc } = createFakeRpc()
    const session = { tabId: 4 as number | undefined }
    const activity = createActivity(rpc, { session, signal: controller.signal })

    const pending = activity.next()
    controller.abort()

    await expect(pending).rejects.toBeInstanceOf(CancelledError)
    activity.dispose()
  })
})
