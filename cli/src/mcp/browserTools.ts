import type { TestEvent } from '../classes/WebSocketServer.js'
import type { ToolError } from './projectTools.js'
import { once } from 'node:events'
import process from 'node:process'
import { ActivityTester, findTestFiles } from '../classes/ActivityTester.js'
import { createReporter } from '../classes/testing/reporter.js'
import { WebSocketServer } from '../classes/WebSocketServer.js'
import { waitForExtension } from '../commands/test.js'
import { findActivity, runCli } from './projectTools.js'

const PORT_IN_USE = 'Port 3021 is in use. Stop pmd dev or pmd test first.'
const NOT_CONNECTED = 'Extension not connected. Is developer mode on?'
const NOT_LOADED = 'Load the activity with load_activity first'
const NO_TESTS_SUPPORT = 'Your extension doesn\'t support tests yet, or developer mode is off'
const HELLO_TIMEOUT_MS = 3000
const DEFAULT_EVENT_TIMEOUT_MS = 5000

let connection: Promise<WebSocketServer> | undefined
// The latest event per tab, kept until get_activity reads it.
const latestEvents = new Map<number, TestEvent>()
const eventWaiters = new Map<number, Set<(event: TestEvent) => void>>()
// The service whose folder the extension currently runs. Only one activity is loaded at a time.
let loadedService: string | undefined

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

// Maps low-level failures to the copy the agent should see.
function toToolError(error: unknown): ToolError {
  const message = errorMessage(error)
  if (message === 'Extension not connected')
    return { error: NOT_CONNECTED }
  return { error: message }
}

function handleTestEvent(event: TestEvent) {
  latestEvents.set(event.tabId, event)
  for (const notify of [...(eventWaiters.get(event.tabId) ?? [])])
    notify(event)
}

async function createConnection(): Promise<WebSocketServer> {
  const ws = new WebSocketServer(process.cwd())
  try {
    await once(ws.server, 'listening')
  }
  catch (error) {
    // Reset so the next call retries the port.
    connection = undefined
    if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE')
      throw new Error(PORT_IN_USE)
    throw error
  }

  ws.onTestEvent(handleTestEvent)
  return ws
}

export function getConnection(): Promise<WebSocketServer> {
  connection ??= createConnection()
  return connection
}

export async function extensionStatus(): Promise<{ connected: boolean, supportsTests: boolean } | ToolError> {
  try {
    const ws = await getConnection()
    if (!ws.isConnected)
      return { connected: false, supportsTests: false }

    const supportsTests = await ws.request('hello', {}, HELLO_TIMEOUT_MS).then(() => true, () => false)
    return { connected: true, supportsTests }
  }
  catch (error) {
    return toToolError(error)
  }
}

// Builds the activity and points the extension at its folder. Shared by load_activity and run_tests.
async function loadFolder(service: string): Promise<{ folder: string, canonical: string } | ToolError> {
  try {
    const activity = await findActivity(service)
    const canonical = activity.metadata.service

    const build = await runCli(['build', canonical, '--no-kill'])
    if (!build.success)
      return { error: build.output || `Build failed for ${canonical}` }

    const ws = await getConnection()
    ws.cwd = activity.folder

    if (!(await waitForExtension(ws)))
      return { error: NOT_CONNECTED }

    await ws.send()
    loadedService = canonical
    return { folder: activity.folder, canonical }
  }
  catch (error) {
    return toToolError(error)
  }
}

export async function loadActivity({ service }: { service: string }): Promise<{ loaded: string } | ToolError> {
  const result = await loadFolder(service)
  if ('error' in result)
    return result
  return { loaded: service }
}

export async function openPage({ service, url, settings }: {
  service: string
  url: string
  settings?: Record<string, string | number | boolean>
}): Promise<{ tabId: number } | ToolError> {
  if (loadedService?.toLowerCase() !== service.toLowerCase())
    return { error: NOT_LOADED }

  try {
    const ws = await getConnection()
    const { tabId } = await ws.request<{ tabId: number }>('openTab', { url, service, settings })
    return { tabId }
  }
  catch (error) {
    return toToolError(error)
  }
}

export async function navigate({ tabId, url }: { tabId: number, url: string }): Promise<{ ok: true } | ToolError> {
  try {
    const ws = await getConnection()
    await ws.request('navigate', { tabId, url })
    return { ok: true }
  }
  catch (error) {
    return toToolError(error)
  }
}

export async function evaluate({ tabId, code }: { tabId: number, code: string }): Promise<{ value: unknown } | ToolError> {
  try {
    const ws = await getConnection()
    const { value } = await ws.request<{ value: unknown }>('evaluate', { tabId, code, args: [] })
    return { value }
  }
  catch (error) {
    return toToolError(error)
  }
}

// Resolves with the next event for the tab, or undefined on timeout.
function nextTabEvent(tabId: number, timeoutMs: number): Promise<TestEvent | undefined> {
  return new Promise((resolve) => {
    const waiters = eventWaiters.get(tabId) ?? new Set<(event: TestEvent | undefined) => void>()
    eventWaiters.set(tabId, waiters)

    let timer: ReturnType<typeof setTimeout> | undefined
    const settle = (event: TestEvent | undefined) => {
      clearTimeout(timer)
      waiters.delete(settle)
      if (waiters.size === 0)
        eventWaiters.delete(tabId)
      resolve(event)
    }

    timer = setTimeout(settle, timeoutMs, undefined)
    waiters.add(settle)
  })
}

export async function getActivity({ tabId, timeoutMs = DEFAULT_EVENT_TIMEOUT_MS }: { tabId: number, timeoutMs?: number }): Promise<{ kind: string, activity: unknown, error?: string } | ToolError> {
  try {
    const event = latestEvents.get(tabId) ?? await nextTabEvent(tabId, timeoutMs)
    latestEvents.delete(tabId)

    if (!event)
      return { kind: 'none', activity: null }

    if (event.kind === 'setActivity')
      return { kind: event.kind, activity: event.data }
    if (event.kind === 'clearActivity')
      return { kind: event.kind, activity: null }
    return { kind: event.kind, activity: null, error: event.error }
  }
  catch (error) {
    return toToolError(error)
  }
}

export async function closePage({ tabId }: { tabId: number }): Promise<{ ok: true } | ToolError> {
  try {
    const ws = await getConnection()
    await ws.request('closeTab', { tabId })
    latestEvents.delete(tabId)
    return { ok: true }
  }
  catch (error) {
    return toToolError(error)
  }
}

export async function runTests({ service }: { service: string }): Promise<unknown> {
  try {
    const activity = await findActivity(service)
    if ((await findTestFiles(activity.folder)).length === 0)
      return { error: `No tests found for ${activity.metadata.service}` }

    const loaded = await loadFolder(service)
    if ('error' in loaded)
      return loaded

    const ws = await getConnection()
    const tester = new ActivityTester(loaded.folder, loaded.canonical, ws, createReporter(loaded.canonical))
    if (!(await tester.isSupported()))
      return { error: NO_TESTS_SUPPORT }

    return await tester.run({ signal: new AbortController().signal, interactive: true })
  }
  catch (error) {
    return toToolError(error)
  }
}
