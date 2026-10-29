import type { PageSession } from './testing/page.js'
import type { RegisteredTest } from './testing/types.js'
import type { TestRpc } from './WebSocketServer.js'
import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import { globby } from 'globby'
import { createActivity } from './testing/activity.js'
import { CancelledError, SkipError } from './testing/errors.js'
import { createPage } from './testing/page.js'
import { MULTIPLE_BROWSERS } from './WebSocketServer.js'

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'cancelled'

export interface TestResult {
  file: string
  name: string
  status: TestStatus
  durationMs: number
  error?: string
  lastActivity?: unknown
}

export type TesterEvent
  = | { type: 'run', count: number }
    | { type: 'start', file: string, name: string }
    | { type: 'waiting', name: string, message: string }
    | { type: 'result', result: TestResult }

const DEFAULT_TEST_TIMEOUT_MS = 120_000
const HELLO_TIMEOUT_MS = 3000

type TestGlobal = typeof globalThis & { __PMD_TESTS__?: RegisteredTest[] }

export async function findTestFiles(cwd: string): Promise<string[]> {
  const files = await globby('**/*.test.ts', {
    cwd,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**'],
  })
  return files.sort()
}

// Rejects when the test runs past `ms`. `onTimeout` runs first, so pending waits can stop.
function withTimeout<T>(task: Promise<T>, ms: number, onTimeout: () => void): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timedOut = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      onTimeout()
      reject(new Error(`Test timed out after ${ms}ms`))
    }, ms)
  })
  return Promise.race([task, timedOut]).finally(() => clearTimeout(timer))
}

export class ActivityTester {
  private readonly outDir: string

  constructor(
    public readonly cwd: string,
    public readonly service: string,
    private readonly rpc: TestRpc,
    private readonly onEvent: (event: TesterEvent) => void,
    options: { outDir?: string } = {},
  ) {
    this.outDir = options.outDir ?? resolve(process.cwd(), 'node_modules/.cache/pmd-tests', service)
  }

  async isSupported(): Promise<boolean> {
    try {
      await this.rpc.request('hello', {}, HELLO_TIMEOUT_MS)
      return true
    }
    catch (error) {
      if (error instanceof Error && error.message === MULTIPLE_BROWSERS)
        throw error
      return false
    }
  }

  async run(opts: { signal: AbortSignal, interactive: boolean }): Promise<TestResult[]> {
    const tests = await this.load()
    const results: TestResult[] = []
    this.onEvent({ type: 'run', count: tests.length })

    for (const { file, test } of tests) {
      if (opts.signal.aborted)
        break
      const result = await this.runTest(file, test, opts)
      results.push(result)
      if (result.status === 'cancelled')
        break
    }

    return results
  }

  // Bundles each test file and imports it. The test() calls register on the global registry.
  private async load(): Promise<{ file: string, test: RegisteredTest }[]> {
    const files = await findTestFiles(this.cwd)
    await mkdir(this.outDir, { recursive: true })

    const loaded: { file: string, test: RegisteredTest }[] = []
    const registry = globalThis as TestGlobal

    for (const [index, file] of files.entries()) {
      const outfile = join(this.outDir, `${index}.mjs`)
      await build({
        entryPoints: [file],
        outfile,
        bundle: true,
        platform: 'node',
        format: 'esm',
        external: ['vitest'],
        absWorkingDir: process.cwd(),
        logLevel: 'silent',
      })

      registry.__PMD_TESTS__ = []
      await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`)
      for (const test of registry.__PMD_TESTS__ ?? [])
        loaded.push({ file, test })
    }

    registry.__PMD_TESTS__ = []
    return loaded
  }

  private async runTest(
    file: string,
    test: RegisteredTest,
    { signal, interactive }: { signal: AbortSignal, interactive: boolean },
  ): Promise<TestResult> {
    const { name, options, fn } = test
    this.onEvent({ type: 'start', file, name })

    // Aborts when the whole run is cancelled, or when this test times out.
    const controller = new AbortController()
    const abortTest = () => controller.abort()
    signal.addEventListener('abort', abortTest, { once: true })

    const session: PageSession = { tabId: undefined }
    const page = createPage(this.rpc, {
      service: this.service,
      settings: options.settings,
      signal: controller.signal,
      interactive,
      session,
      onWaiting: message => this.onEvent({ type: 'waiting', name, message }),
    })
    const activity = createActivity(this.rpc, { session, signal: controller.signal })

    const startedAt = Date.now()
    let status: TestStatus = 'passed'
    let error: string | undefined
    let lastActivity: unknown

    try {
      await withTimeout(
        Promise.resolve().then(() => fn({ page, activity })),
        options.timeout ?? DEFAULT_TEST_TIMEOUT_MS,
        () => controller.abort(),
      )
    }
    catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (err instanceof SkipError) {
        status = 'skipped'
      }
      else if (err instanceof CancelledError || signal.aborted) {
        status = 'cancelled'
      }
      else {
        status = 'failed'
        error = message
      }
    }
    finally {
      lastActivity = activity.last()
      activity.dispose()
      page.dispose()
      signal.removeEventListener('abort', abortTest)
      if (session.tabId !== undefined) {
        try {
          await this.rpc.request('closeTab', { tabId: session.tabId })
        }
        catch {
          // The tab may already be gone, for example when the user closed it.
        }
      }
    }

    const result: TestResult = {
      file,
      name,
      status,
      durationMs: Date.now() - startedAt,
      lastActivity,
    }
    if (error !== undefined)
      result.error = error

    this.onEvent({ type: 'result', result })
    return result
  }
}
