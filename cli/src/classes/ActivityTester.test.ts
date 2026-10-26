import type { TestEvent, TestRpc } from './WebSocketServer.js'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import chalk from 'chalk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ActivityTester, findTestFiles } from './ActivityTester.js'
import { createReporter, printSummary } from './testing/reporter.js'

const FIXTURES = resolve(import.meta.dirname, '__fixtures__/tester')

interface Call {
  method: string
  params: any
}

// Answers the test RPC like a page that loads at once and sets presence on openTab.
function createFakeRpc(options: { onOpenTab?: () => void, helloFails?: boolean } = {}) {
  const calls: Call[] = []
  const listeners = new Set<(event: TestEvent) => void>()
  let nextTabId = 1

  const emit = (event: TestEvent) => {
    for (const listener of [...listeners])
      listener(event)
  }

  const rpc: TestRpc = {
    request: (async (method: string, params?: object) => {
      calls.push({ method, params })
      switch (method) {
        case 'hello':
          if (options.helloFails)
            throw new Error('Timed out')
          return { version: 1 }
        case 'openTab': {
          const tabId = nextTabId++
          options.onOpenTab?.()
          // Set presence after the tab id is returned, so the activity handle is listening for it.
          setTimeout(emit, 0, { tabId, kind: 'setActivity', data: { details: 'Hello' } })
          return { tabId }
        }
        case 'evaluate': {
          const code = (params as { code: string }).code
          if (code.includes('readyState'))
            return { value: 'complete' }
          // The user bar reports that the user clicked "Skip test".
          if (code.includes('__pmd_wait_for_user'))
            return { value: { choice: 'skip', done: false } }
          return { value: undefined }
        }
        default:
          return {}
      }
    }) as TestRpc['request'],
    onTestEvent: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }

  return { rpc, calls }
}

function callsTo(calls: Call[], method: string) {
  return calls.filter(call => call.method === method)
}

async function writeTree(root: string, files: Record<string, string>) {
  for (const [path, contents] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true })
    await writeFile(join(root, path), contents)
  }
}

const TEST_FILE = `import { test } from 'premid/test'\ntest('hangs', { timeout: 100 }, async ({ activity }) => {\n  await activity.next({ timeout: 10_000 })\n})\n`

describe('findTestFiles', () => {
  let root: string

  beforeEach(async () => {
    await mkdir(join(process.cwd(), 'node_modules/.cache'), { recursive: true })
    root = await mkdtemp(join(process.cwd(), 'node_modules/.cache/pmd-tester-find-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('finds nested test files and skips node_modules', async () => {
    await writeTree(root, {
      'a.test.ts': '',
      'nested/deep/b.test.ts': '',
      'nested/notes.ts': '',
      'node_modules/pkg/c.test.ts': '',
      'dist/d.test.ts': '',
    })

    expect(await findTestFiles(root)).toEqual([
      join(root, 'a.test.ts'),
      join(root, 'nested/deep/b.test.ts'),
    ])
  })
})

describe('activityTester', () => {
  let outDir: string
  let root: string
  let controller: AbortController

  beforeEach(async () => {
    await mkdir(join(process.cwd(), 'node_modules/.cache'), { recursive: true })
    outDir = await mkdtemp(join(process.cwd(), 'node_modules/.cache/pmd-tester-bundles-'))
    root = await mkdtemp(join(process.cwd(), 'node_modules/.cache/pmd-tester-tests-'))
    controller = new AbortController()
  })

  afterEach(async () => {
    await rm(outDir, { recursive: true, force: true })
    await rm(root, { recursive: true, force: true })
  })

  it('runs passing failing and skipped tests', async () => {
    const { rpc } = createFakeRpc()
    const tester = new ActivityTester(FIXTURES, 'Example', rpc, vi.fn(), { outDir })

    const results = await tester.run({ signal: controller.signal, interactive: false })

    expect(results.map(({ name, status }) => [name, status])).toEqual([
      ['fails', 'failed'],
      ['passes', 'passed'],
      ['skips', 'skipped'],
    ])
    expect(results[0]!.error).toBe('boom')
    expect(results[0]!.lastActivity).toEqual({ details: 'Hello' })
    expect(results[0]!.file).toBe(join(FIXTURES, 'fail.test.ts'))
  })

  it('closes the tab after each test', async () => {
    const { rpc, calls } = createFakeRpc()
    const tester = new ActivityTester(FIXTURES, 'Example', rpc, vi.fn(), { outDir })

    await tester.run({ signal: controller.signal, interactive: false })

    expect(callsTo(calls, 'closeTab').map(call => call.params.tabId)).toEqual([1, 2, 3])
  })

  it('stops on cancel and reports cancelled', async () => {
    const abortRun = new AbortController()
    const { rpc, calls } = createFakeRpc({ onOpenTab: () => abortRun.abort() })
    const tester = new ActivityTester(FIXTURES, 'Example', rpc, vi.fn(), { outDir })

    const results = await tester.run({ signal: abortRun.signal, interactive: false })

    expect(results.map(({ name, status }) => [name, status])).toEqual([['fails', 'cancelled']])
    expect(callsTo(calls, 'openTab')).toHaveLength(1)
    expect(callsTo(calls, 'closeTab')).toHaveLength(1)
  })

  it('fails a test that exceeds its timeout', async () => {
    await writeFile(join(root, 'hang.test.ts'), TEST_FILE)
    const { rpc } = createFakeRpc()
    const tester = new ActivityTester(root, 'Example', rpc, vi.fn(), { outDir })

    const results = await tester.run({ signal: controller.signal, interactive: false })

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ name: 'hangs', status: 'failed', error: 'Test timed out after 100ms' })
  })

  it('isSupported is false when hello times out', async () => {
    const { rpc, calls } = createFakeRpc({ helloFails: true })
    const tester = new ActivityTester(FIXTURES, 'Example', rpc, vi.fn(), { outDir })

    expect(await tester.isSupported()).toBe(false)
    expect(calls).toEqual([{ method: 'hello', params: {} }])
  })

  it('isSupported is true when hello answers', async () => {
    const { rpc } = createFakeRpc()
    const tester = new ActivityTester(FIXTURES, 'Example', rpc, vi.fn(), { outDir })

    expect(await tester.isSupported()).toBe(true)
  })
})

describe('reporter', () => {
  beforeEach(() => {
    chalk.level = 0
  })

  it('reporter prints the waiting line exactly', () => {
    const log = vi.fn()
    const report = createReporter('Example', log)

    report({ type: 'waiting', name: 'logs in', message: 'Log in to continue' })

    expect(log).toHaveBeenCalledWith('⏸ Example › logs in: waiting for you: Log in to continue')
  })

  it('prints pass, fail, skip and summary lines', () => {
    const log = vi.fn()
    const report = createReporter('Example', log)
    const base = { file: 'a.test.ts', durationMs: 1500 }

    report({ type: 'result', result: { ...base, name: 'ok', status: 'passed' } })
    report({ type: 'result', result: { ...base, name: 'bad', status: 'failed', error: 'nope', lastActivity: { details: 'x' } } })
    report({ type: 'result', result: { ...base, name: 'later', status: 'skipped' } })
    report({ type: 'result', result: { ...base, name: 'stopped', status: 'cancelled' } })
    printSummary([
      { ...base, name: 'ok', status: 'passed' },
      { ...base, name: 'bad', status: 'failed' },
      { ...base, name: 'later', status: 'skipped' },
    ], log)

    expect(log.mock.calls.map(([line]) => line)).toEqual([
      '✓ Example › ok (1.5s)',
      '✗ Example › bad',
      '  nope',
      '  Last activity: {"details":"x"}',
      '↷ Example › later (skipped)',
      'Tests: 1 passed, 1 failed, 1 skipped',
    ])
  })
})
