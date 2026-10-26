import net from 'node:net'
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

  it('browser tools report the port error when 3021 is taken', async (context) => {
    // The real WebSocketServer is needed here, so the file-level mock is removed for this module instance.
    // The import happens before the port is bound, so 3021 is held only for the connection attempt.
    vi.resetModules()
    vi.doUnmock('../classes/WebSocketServer.js')
    const real = await import('./browserTools.js')

    const blocker = net.createServer()
    const bound = await new Promise<boolean>((resolve) => {
      blocker.once('error', () => resolve(false))
      blocker.listen(3021, () => resolve(true))
    })
    if (!bound)
      return context.skip()

    try {
      const result = await real.extensionStatus()

      expect(result).toEqual({ error: 'Port 3021 is in use. Stop pmd dev or pmd test first.' })
    }
    finally {
      await new Promise<void>(resolve => blocker.close(() => resolve()))
    }
  })

  it('run_tests reports a service without test files', async () => {
    mocks.findTestFiles.mockResolvedValue([])

    const result = await browserTools.runTests({ service: 'YouTube' })

    expect(result).toEqual({ error: 'No tests found for YouTube' })
    expect(mocks.runCli).not.toHaveBeenCalled()
  })
})
