import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { transformSync } from 'esbuild'
import { vi } from 'vitest'

export const syncScriptsDir = resolve(import.meta.dirname, '../../../syncScripts')

/**
 * old: the stable 2.14 runtime surface (no runtime, no log, ad and buffering reports deduplicated).
 * new: adds ctx.runtime and ctx.log.
 */
export type RuntimeFlavour = 'old' | 'new'

export interface PageEnvironment {
  window?: Record<string, unknown>
  pathname?: string
  hostname?: string
  querySelector?: (selector: string) => unknown
  mediaSession?: unknown
}

type Handler = (data: any) => void

function createChannel() {
  const handlers = new Map<string, Set<Handler>>()
  return {
    sent: [] as { key: string, data: any }[],
    on(key: string, handler: Handler) {
      if (!handlers.has(key))
        handlers.set(key, new Set())
      handlers.get(key)!.add(handler)
      return () => handlers.get(key)?.delete(handler)
    },
    emit(key: string, data: any) {
      for (const handler of handlers.get(key) ?? []) handler(data)
    },
  }
}

function compile(file: string) {
  return transformSync(readFileSync(file, 'utf8'), { loader: 'ts', format: 'cjs' }).code
}

/** Runs a sync script folder's content.ts (and mainworld.ts) against a fake runtime and page. */
export function runSyncScript(folder: string, flavour: RuntimeFlavour, page: PageEnvironment = {}) {
  const toMainworld = createChannel()
  const toContent = createChannel()

  const document = { querySelector: vi.fn(page.querySelector ?? (() => null)) }
  const location = { pathname: page.pathname ?? '/', hostname: page.hostname ?? 'localhost' }
  const navigator = { mediaSession: page.mediaSession }
  const window = { ...page.window }

  const bridged = { ad: [] as boolean[], buffering: [] as boolean[], blocked: [] as string[], unblocked: 0 }
  let lastAd: boolean | null = null
  let lastBuffering: boolean | null = null
  const reportAd = vi.fn((isInAd: boolean) => {
    if (isInAd === lastAd)
      return
    lastAd = isInAd
    bridged.ad.push(isInAd)
  })
  const reportBuffering = vi.fn((isBuffering: boolean) => {
    if (isBuffering === lastBuffering)
      return
    lastBuffering = isBuffering
    bridged.buffering.push(isBuffering)
  })

  const handles: { options: any, reportPlayback: ReturnType<typeof vi.fn>, release: ReturnType<typeof vi.fn> }[] = []

  const ctx: Record<string, any> = {
    features: vi.fn(),
    video: {
      attach: vi.fn(),
      takeControl: vi.fn((options: any) => {
        const handle = {
          options,
          reportPlayback: vi.fn(),
          onSyncCommand: vi.fn(() => () => {}),
          reportAd,
          reportBuffering,
          release: vi.fn(),
        }
        handles.push(handle)
        return handle
      }),
      reportAd,
      reportBuffering,
    },
    setPageInfo: vi.fn(),
    reportBlocked: vi.fn((reason: string) => bridged.blocked.push(reason)),
    reportUnblocked: vi.fn(() => bridged.unblocked++),
    sendCustomData: vi.fn(),
    onCustomData: vi.fn(() => () => {}),
    mainworld: {
      send: (key: string, data: unknown) => toMainworld.emit(key, data),
      request: vi.fn(),
      onMessage: (key: string, handler: Handler) => toContent.on(key, handler),
      onRequest: vi.fn(() => () => {}),
    },
    party: { role: 'follower', paused: false, active: true, isHost: false },
  }
  if (flavour === 'new') {
    ctx.runtime = { version: '2.15.0', capabilities: [] }
    ctx.log = vi.fn()
  }

  const mainworldCtx = {
    content: {
      send: (key: string, data: unknown) => {
        toContent.sent.push({ key, data })
        toContent.emit(key, data)
      },
      request: vi.fn(),
      onMessage: (key: string, handler: Handler) => toMainworld.on(key, handler),
      onRequest: vi.fn(() => () => {}),
    },
  }

  const cleanups: (() => void)[] = []
  const register = (setupCtx: unknown) => ({
    register: (definition: { setup: (ctx: any) => (() => void) | void }) => {
      const cleanup = definition.setup(setupCtx)
      if (typeof cleanup === 'function')
        cleanups.push(cleanup)
      return { destroy: () => {} }
    },
  })

  const globals = { window, document, location, navigator }
  const run = (file: string, registration: Record<string, unknown>) => {
    const names = [...Object.keys(globals), ...Object.keys(registration)]
    // eslint-disable-next-line no-new-func
    new Function(...names, compile(file))(...Object.values(globals), ...Object.values(registration))
  }

  const mainworldFile = resolve(syncScriptsDir, folder, 'mainworld.ts')
  let hasMainworld = true
  try {
    readFileSync(mainworldFile)
  }
  catch {
    hasMainworld = false
  }

  run(resolve(syncScriptsDir, folder, 'content.ts'), { SyncScript: register(ctx) })
  if (hasMainworld)
    run(mainworldFile, { SyncMainworldScript: register(mainworldCtx) })

  return {
    ctx,
    window,
    document,
    location,
    bridged,
    handles,
    /** Messages the page-world script posted to the content script. */
    posted: toContent.sent,
    stop: () => cleanups.forEach(cleanup => cleanup()),
  }
}
