import type { TestResult } from '../ActivityTester.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DevTestLoop } from './DevTestLoop.js'

const PASSED: TestResult = { file: 'a.test.ts', name: 'works', status: 'passed', durationMs: 1 }

interface RunOptions { signal: AbortSignal, interactive: boolean }

function setup(run: (opts: RunOptions) => Promise<TestResult[]> = async () => [PASSED]) {
  const send = vi.fn(async () => {})
  const log = vi.fn((_line: string) => {})
  const runSpy = vi.fn(run)
  const loop = new DevTestLoop({
    service: 'Svc',
    send,
    tester: { run: runSpy, isSupported: async () => true },
    hasTests: async () => true,
    log,
  })
  return { loop, send, run: runSpy, log }
}

describe('devTestLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces rapid builds into one run', async () => {
    const { loop, send, run } = setup()

    loop.onBuild()
    await vi.advanceTimersByTimeAsync(100)
    loop.onBuild()
    await vi.advanceTimersByTimeAsync(100)
    loop.onBuild()
    await vi.advanceTimersByTimeAsync(300)

    expect(send).toHaveBeenCalledTimes(1)
    expect(run).toHaveBeenCalledTimes(1)
    expect(run).toHaveBeenCalledWith(expect.objectContaining({ interactive: false }))
  })

  it('a new build aborts the running test run', async () => {
    let calls = 0
    const { loop, send, run, log } = setup(({ signal }) => {
      calls++
      if (calls === 1) {
        return new Promise(resolve => signal.addEventListener('abort', () => resolve([{ ...PASSED, status: 'cancelled' }]), { once: true }))
      }
      return Promise.resolve([PASSED])
    })

    loop.onBuild()
    await vi.advanceTimersByTimeAsync(300)
    expect(run).toHaveBeenCalledTimes(1)

    loop.onBuild()
    await vi.advanceTimersByTimeAsync(300)

    expect(run.mock.calls[0][0].signal.aborted).toBe(true)
    expect(run).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenCalledTimes(2)
    // Only the newest run prints a summary.
    expect(log.mock.calls.filter(([line]) => line.startsWith('Tests:'))).toHaveLength(1)
  })

  it('paused builds send nothing until resume', async () => {
    const { loop, send, run, log } = setup()

    loop.togglePause()
    loop.onBuild()
    await vi.advanceTimersByTimeAsync(300)
    expect(send).not.toHaveBeenCalled()
    expect(run).not.toHaveBeenCalled()

    loop.togglePause()
    await vi.advanceTimersByTimeAsync(300)

    expect(send).toHaveBeenCalledTimes(1)
    expect(run).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith('PAUSED, press p to resume')
    expect(log).toHaveBeenCalledWith('Resumed')
  })

  it('runNow runs while paused with interactive true', async () => {
    const { loop, send, run } = setup()

    loop.togglePause()
    loop.runNow()
    await vi.advanceTimersByTimeAsync(1)

    expect(loop.paused).toBe(true)
    expect(send).toHaveBeenCalledTimes(1)
    expect(run).toHaveBeenCalledWith(expect.objectContaining({ interactive: true }))
  })

  it('a failing run is logged and the loop keeps working', async () => {
    let calls = 0
    const { loop, run, log } = setup(async () => {
      calls++
      if (calls === 1)
        throw new Error('Unexpected token')
      return [PASSED]
    })

    loop.onBuild()
    await vi.advanceTimersByTimeAsync(300)
    expect(log).toHaveBeenCalledWith(expect.stringContaining('✗ Svc: Unexpected token'))

    loop.onBuild()
    await vi.advanceTimersByTimeAsync(300)

    expect(run).toHaveBeenCalledTimes(2)
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Tests: 1 passed'))
  })
})
