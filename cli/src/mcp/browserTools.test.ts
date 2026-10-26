import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  connected: false,
  request: vi.fn(),
  send: vi.fn(),
  onTestEvent: vi.fn(),
  instances: [] as unknown[],
  listenError: undefined as (Error & { code?: string }) | undefined,
  waitForExtension: vi.fn(),
  runCli: vi.fn(),
  findActivity: vi.fn(),
  findTestFiles: vi.fn(),
  close: vi.fn(),
}))

vi.mock('../classes/WebSocketServer.js', async () => {
  const { EventEmitter: Emitter } = await import('node:events')

  class WebSocketServer {
    readonly server = new Emitter()
    cwd: string

    constructor(cwd: string) {
      this.cwd = cwd
      mocks.instances.push(this)
      setImmediate(() => {
        if (mocks.listenError)
          this.server.emit('error', mocks.listenError)
        else
          this.server.emit('listening')
      })
    }

    get isConnected() {
      return mocks.connected
    }

    request(...args: unknown[]) {
      return mocks.request(...args)
    }

    onTestEvent(listener: unknown) {
      return mocks.onTestEvent(listener)
    }

    send() {
      return mocks.send()
    }

    close() {
      return mocks.close()
    }
  }

  return { WebSocketServer }
})
vi.mock('../commands/test.js', () => ({ waitForExtension: mocks.waitForExtension }))
vi.mock('./projectTools.js', () => ({ runCli: mocks.runCli, findActivity: mocks.findActivity }))
vi.mock('../classes/ActivityTester.js', () => ({
  findTestFiles: mocks.findTestFiles,
  ActivityTester: class {},
}))

const activity = { metadata: { service: 'YouTube', apiVersion: 1, version: '1.0.0', url: 'youtube.com' }, folder: '/repo/websites/Y/YouTube', versionized: false }

let browserTools: typeof import('./browserTools.js')

// Pulls the listener that getConnection subscribed to the test event stream.
function testEventListener(): (event: unknown) => void {
  const call = mocks.onTestEvent.mock.calls.at(-1)
  if (!call)
    throw new Error('onTestEvent was not subscribed')
  return call[0] as (event: unknown) => void
}

describe('browserTools', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mocks.connected = true
    mocks.instances.length = 0
    mocks.listenError = undefined
    mocks.waitForExtension.mockResolvedValue(true)
    mocks.send.mockResolvedValue(undefined)
    mocks.runCli.mockResolvedValue({ success: true, output: '' })
    mocks.findActivity.mockResolvedValue(activity)
    // A fresh module per test gives each test its own lazy connection.
    vi.resetModules()
    browserTools = await import('./browserTools.js')
  })

  it('open_page returns the tab id and sends openTab with the service', async () => {
    await browserTools.loadActivity('YouTube')
    mocks.request.mockResolvedValue({ tabId: 7 })

    const result = await browserTools.openPage({ service: 'YouTube', url: 'https://youtube.com/watch' })

    expect(result).toEqual({ tabId: 7 })
    expect(mocks.request).toHaveBeenCalledWith(
      'openTab',
      expect.objectContaining({ service: 'YouTube', url: 'https://youtube.com/watch' }),
    )
  })

  it('open_page requires load_activity first', async () => {
    const result = await browserTools.openPage({ service: 'YouTube', url: 'https://youtube.com' })

    expect(result).toEqual({ error: 'Load the activity with load_activity first' })
    expect(mocks.request).not.toHaveBeenCalled()
  })

  it('evaluate sends code with empty args and returns the value', async () => {
    mocks.request.mockResolvedValue({ value: 'Home' })

    const result = await browserTools.evaluate({ tabId: 3, code: '() => document.title' })

    expect(result).toEqual({ value: 'Home' })
    expect(mocks.request).toHaveBeenCalledWith('evaluate', { tabId: 3, code: '() => document.title', args: [] })
  })

  it('get_activity returns the buffered latest event once', async () => {
    await browserTools.getConnection()
    const listener = testEventListener()
    listener({ tabId: 3, kind: 'setActivity', data: { details: 'first' } })
    listener({ tabId: 3, kind: 'setActivity', data: { details: 'second' } })

    const first = await browserTools.getActivity({ tabId: 3, timeoutMs: 5000 })
    const second = await browserTools.getActivity({ tabId: 3, timeoutMs: 10 })

    expect(first).toEqual({ kind: 'setActivity', activity: { details: 'second' } })
    expect(second).toEqual({ kind: 'none', activity: null })
  })

  it('get_activity waits for the next event before returning', async () => {
    await browserTools.getConnection()
    const listener = testEventListener()

    const pending = browserTools.getActivity({ tabId: 5, timeoutMs: 5000 })
    setTimeout(listener, 10, { tabId: 5, kind: 'clearActivity' })

    expect(await pending).toEqual({ kind: 'clearActivity', activity: null })
  })

  it('get_activity times out to kind none', async () => {
    vi.useFakeTimers()
    try {
      const pending = browserTools.getActivity({ tabId: 9, timeoutMs: 5000 })
      await vi.advanceTimersByTimeAsync(5000)

      expect(await pending).toEqual({ kind: 'none', activity: null })
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('load_activity errors when the extension never connects', async () => {
    mocks.waitForExtension.mockResolvedValue(false)

    const result = await browserTools.loadActivity('YouTube')

    expect(result).toEqual({ error: 'Extension not connected. Is developer mode on?' })
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('reports the port error on EADDRINUSE, then retries and connects', async () => {
    mocks.listenError = Object.assign(new Error('listen EADDRINUSE: address already in use :::3021'), { code: 'EADDRINUSE' })
    mocks.request.mockResolvedValue({})

    const first = await browserTools.extensionStatus()
    expect(first).toEqual({ error: 'Port 3021 is in use. Stop pmd dev or pmd test first.' })

    mocks.listenError = undefined
    const second = await browserTools.extensionStatus()

    expect(second).toEqual({ connected: true, supportsTests: true })
    expect(mocks.instances).toHaveLength(2)
    // Only the successful server subscribes to test events.
    expect(mocks.onTestEvent).toHaveBeenCalledTimes(1)
  })

  it('get_activity returns an invalid event as a normal result with its error', async () => {
    await browserTools.getConnection()
    testEventListener()({ tabId: 4, kind: 'invalid', error: 'Missing details' })

    expect(await browserTools.getActivity({ tabId: 4, timeoutMs: 10 })).toEqual({ kind: 'invalid', activity: null, error: 'Missing details' })
  })

  it('closeConnection closes the server and the next call creates a new one', async () => {
    await browserTools.getConnection()
    await browserTools.closeConnection()

    expect(mocks.close).toHaveBeenCalledTimes(1)

    await browserTools.getConnection()
    expect(mocks.instances).toHaveLength(2)
  })

  it('closeConnection does nothing when no server was created', async () => {
    await browserTools.closeConnection()

    expect(mocks.close).not.toHaveBeenCalled()
  })

  it('run_tests reports a service without test files', async () => {
    mocks.findTestFiles.mockResolvedValue([])

    const result = await browserTools.runTests({ service: 'YouTube' })

    expect(result).toEqual({ error: 'No tests found for YouTube' })
    expect(mocks.runCli).not.toHaveBeenCalled()
  })
})
