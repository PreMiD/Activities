import type { PageWork } from '../websites/D/DLsite Play/site.js'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { createContext, runInContext } from 'node:vm'
import { Assets } from 'premid'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { selectors } from '../websites/D/DLsite Play/site.js'

const { build } = createRequire(new URL('../cli/package.json', import.meta.url))('esbuild')
let compiled: string

beforeAll(async () => {
  const result = await build({
    entryPoints: [fileURLToPath(new URL('../websites/D/DLsite Play/presence.ts', import.meta.url))],
    bundle: true,
    minify: true,
    write: false,
    format: 'iife',
  })
  compiled = result.outputFiles[0].text
})

afterEach(() => vi.useRealTimers())

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function setup(audioMode = false, liveDom = false) {
  const handlers = new Map<string, () => Promise<void>>()
  const events = new Map<string, () => void>()
  const listeners = new Map<string, Set<() => void>>()
  const addEventListener = (name: string, callback: () => void) => {
    if (!listeners.has(name))
      listeners.set(name, new Set())
    listeners.get(name)!.add(callback)
    events.set(name, () => {
      for (const listener of listeners.get(name)!)
        listener()
    })
  }
  const removeEventListener = (name: string, callback: () => void) => listeners.get(name)?.delete(callback)
  const location = audioMode
    ? { href: 'https://play.dlsite.com/library', pathname: '/library' }
    : { href: 'https://play.dlsite.com/work/RJ000001/viewer', pathname: '/work/RJ000001/viewer' }
  const ui = { visible: audioMode, album: 'Synthetic Work', track: 'Synthetic Track', position: 20, paused: false, seeking: false }
  const button = {}
  const body = {}
  const timeline = {}
  const audioEvents = new Map<string, (event: unknown) => void>()
  const observers: { callback: () => void, observe: ReturnType<typeof vi.fn>, disconnect: ReturnType<typeof vi.fn>, active: boolean }[] = []
  class MockMutationObserver {
    active = false
    observe = vi.fn(() => { this.active = true })
    disconnect = vi.fn(() => { this.active = false })
    constructor(public callback: () => void) { observers.push(this) }
  }
  const audio = {
    addEventListener: (event: string, callback: (event: unknown) => void) => audioEvents.set(event, callback),
    removeEventListener: (event: string) => audioEvents.delete(event),
    querySelector: (selector: string) => {
      if (selector === selectors.album)
        return { textContent: ui.album }
      if (selector === selectors.trackTitle)
        return { textContent: ui.track }
      if (selector === selectors.playPause)
        return { getAttribute: () => ui.paused ? 'm0 0 80 50-80 50Z' : 'M28 100H0V0h28ZM77 0H49v100h28Z' }
      if (selector === selectors.playPauseButton)
        return button
      if (selector === selectors.timeContainer)
        return liveDom ? timeline : null
      if (selector === selectors.time) {
        return {
          getAttribute: (attribute: string) => attribute === 'aria-valuenow' ? String(ui.position) : '120',
          matches: () => ui.seeking,
          querySelector: () => null,
        }
      }
      return null
    },
  }
  const setActivity = vi.fn()
  const clearActivity = vi.fn()
  const getSetting = vi.fn(async (id: string): Promise<string | number | boolean | undefined> => id === 'lang' ? 'ja' : id === 'displayType' ? 2 : false)
  const getStrings = vi.fn(async (): Promise<{ viewWork: string, paused: string }> => ({ viewWork: 'ページを見る', paused: '一時停止中' }))
  const execInPage = vi.fn(async () => {
    throw new Error('CSP blocks code execution')
  })
  const stopRequests = vi.fn()
  const onRequest = vi.fn((_filter: unknown, _callback: (request: unknown) => void) => stopRequests)
  const warn = vi.fn()
  const lookup = vi.fn(async (id: string): Promise<PageWork> => ({ workno: id, work_type: audioMode ? 'SOU' : 'MNG', age: 'all', name: 'Synthetic Work', site_id: 'home', inservice: 1 }))
  const lookupTracks = vi.fn(async (id: string) => ({ workno: id, json: JSON.stringify({
    workno: id,
    tree: ['Synthetic Track', 'New Synthetic Track'].map((name, index) => ({ type: 'file', name: `${name}.wav`, hashname: String(index) })),
    playfile: { 0: { type: 'audio' }, 1: { type: 'audio' } },
  }) }))
  const databases = vi.fn(async () => [{ name: 'Play_synthetic202205' }])
  const open = vi.fn(() => {
    const database = {
      close: vi.fn(),
      objectStoreNames: { contains: (store: string) => store === 'Purchase' || store === 'Ziptree' },
      transaction: (_store: string, _mode: string) => ({
        objectStore: (name: string) => ({
          get: (id: string) => {
            const request = { result: null as PageWork | null, onsuccess: null as (() => void) | null, onerror: null as (() => void) | null }
            ;(name === 'Purchase' ? lookup(id) : lookupTracks(id)).then((work) => {
              request.result = work
              request.onsuccess?.()
            }, () => request.onerror?.())
            return request
          },
        }),
      }),
    }
    const request = { result: database, onsuccess: null as (() => void) | null }
    queueMicrotask(() => request.onsuccess?.())
    return request
  })
  class MockPresence {
    setActivity = setActivity
    clearActivity = clearActivity
    getSetting = getSetting
    getStrings = getStrings
    execInPage = execInPage
    onRequest = onRequest
    on(event: string, callback: () => Promise<void>) { handlers.set(event, callback) }
  }
  const context = createContext({
    Presence: MockPresence,
    location,
    URL,
    Date,
    setTimeout,
    clearTimeout,
    MutationObserver: MockMutationObserver,
    indexedDB: { databases, open },
    document: { location, body: liveDom ? body : undefined, querySelector: (selector: string) => selector === selectors.audio && ui.visible ? audio : null, querySelectorAll: () => [] },
    localStorage: { getItem: () => '1' },
    console: { warn },
    window: {
      addEventListener,
      removeEventListener,
      navigation: { addEventListener, removeEventListener },
    },
  }, { codeGeneration: { strings: false, wasm: false } })
  const reload = () => runInContext(compiled, context)
  reload()
  const observe = (id = 'RJ000001') => onRequest.mock.calls[0]![1]({
    url: `https://play.dlsite.com/api/v4/download/sign/url?workno=${id}`,
    method: 'GET',
    ok: true,
    timestamp: Date.now(),
    responseBody: null,
  })
  const changePlayback = (paused: boolean) => {
    ui.paused = paused
    for (const observer of observers.filter(observer => observer.active))
      observer.callback()
  }
  const metadata = (work: PageWork) => onRequest.mock.calls[0]![1]({
    url: `https://play.dlsite.com/api/v4/work/${work.workno}`,
    method: 'GET',
    ok: true,
    timestamp: Date.now(),
    responseBody: JSON.stringify(work),
  })
  const changeIdentity = () => {
    for (const observer of observers.filter(observer => observer.active))
      observer.callback()
  }
  const mutate = (target: object) => {
    for (const observer of observers.filter(observer => observer.active && observer.observe.mock.calls[0]?.[0] === target))
      observer.callback()
  }
  const seekCommit = () => audioEvents.get('pointerup')?.({ target: { closest: () => timeline } })
  return {
    get update() {
      return handlers.get('UpdateData')!
    },
    reload,
    listeners,
    stopRequests,
    observe,
    metadata,
    changeIdentity,
    changePlayback,
    observers,
    button,
    ui,
    events,
    location,
    setActivity,
    clearActivity,
    getSetting,
    getStrings,
    execInPage,
    onRequest,
    lookup,
    lookupTracks,
    databases,
    warn,
    mutate,
    body,
    timeline,
    seekCommit,
  }
}

describe('bundled UpdateData handler under strict CSP', () => {
  it('retains generic browsing across folder navigation without clearing or resending it', async () => {
    const app = setup(true, true)
    app.ui.visible = false
    await app.update()
    expect(app.setActivity).toHaveBeenCalledExactlyOnceWith({ name: 'DLsite Play', type: 0, statusDisplayType: 0 })
    for (const folder of ['one', 'two', 'three']) {
      app.location.pathname = `/work/RJ000001/tree/${folder}`
      app.location.href = `https://play.dlsite.com${app.location.pathname}`
      for (const event of ['navigatesuccess', 'popstate', 'hashchange']) {
        app.events.get(event)!()
        await app.update()
      }
    }
    expect(app.clearActivity).not.toHaveBeenCalled()
    expect(app.setActivity).toHaveBeenCalledTimes(1)
    app.events.get('pagehide')!()
  })

  it.each(['viewer', 'audio'])('withdraws browsing immediately for an unverified %s and never publishes R-18 data', async (mode) => {
    vi.useFakeTimers()
    const app = setup(true, true)
    app.ui.visible = false
    await app.update()
    const pending = deferred<PageWork>()
    app.lookup.mockReturnValue(pending.promise)
    app.location.pathname = `/work/RJ000002/${mode === 'viewer' ? 'viewer' : 'tree'}`
    app.location.href = `https://play.dlsite.com${app.location.pathname}`
    app.ui.visible = mode === 'audio'
    app.events.get('navigatesuccess')!()
    expect(app.clearActivity).toHaveBeenCalledTimes(1)
    pending.resolve({ workno: 'RJ000002', age: 'r18', work_type: 'SOU', name: 'Synthetic Work' })
    await app.update()
    await vi.advanceTimersByTimeAsync(1000)
    expect(app.setActivity).toHaveBeenLastCalledWith({ name: 'DLsite Play', type: 0, statusDisplayType: 0, startTimestamp: expect.any(Number) })
    expect(app.clearActivity).toHaveBeenCalledTimes(1)
    app.events.get('pagehide')!()
  })

  it.each([false, true])('keeps R-18 generic Playing stable through updates, folder navigation and pause with privacy=%s', async (privacy) => {
    const app = setup(true, true)
    app.getSetting.mockImplementation(async id => id === 'privacyMode' ? privacy : 2)
    app.lookup.mockResolvedValue({ workno: 'RJ000001', age: 'r18', work_type: 'SOU', name: 'Synthetic Work' })
    app.observe()
    await app.update()
    const safe = app.setActivity.mock.calls.at(-1)![0]
    expect(safe).toEqual({ name: 'DLsite Play', type: 0, statusDisplayType: 0, startTimestamp: expect.any(Number) })
    app.clearActivity.mockClear()
    for (const paused of [true, false, true]) {
      app.location.pathname = `/work/RJ000001/tree/${paused}`
      app.events.get('navigatesuccess')!()
      await app.update()
      app.changePlayback(paused)
      await app.update()
      expect(app.setActivity).toHaveBeenLastCalledWith(safe)
    }
    expect(app.clearActivity).not.toHaveBeenCalled()
    expect(app.lookupTracks).not.toHaveBeenCalled()
    // A different, unclassified viewer must still follow the existing policy.
    app.lookup.mockResolvedValue({ workno: 'RJ000002', work_type: 'MNG' })
    app.location.pathname = '/work/RJ000002/viewer'
    const count = app.setActivity.mock.calls.length
    app.events.get('navigatesuccess')!()
    expect(app.clearActivity).toHaveBeenCalledOnce()
    await app.update()
    expect(app.setActivity).toHaveBeenCalledTimes(count)
    app.events.get('pagehide')!()
  })

  it('disposes old listeners, observers and scheduled updates when reloaded in the same page', async () => {
    vi.useFakeTimers()
    const app = setup(true, true)
    app.observe()
    await app.update()
    const oldUpdate = app.update
    app.mutate(app.timeline) // Queue an old instance's timeline update.
    const oldObservers = [...app.observers]
    const count = app.setActivity.mock.calls.length
    app.clearActivity.mockClear()
    app.reload()
    expect(app.clearActivity).not.toHaveBeenCalled()
    expect(app.stopRequests).toHaveBeenCalledOnce()
    expect(oldObservers.every(observer => !observer.active)).toBe(true)
    expect([...app.listeners.values()].every(callbacks => callbacks.size === 1)).toBe(true)
    for (const observer of oldObservers)
      observer.callback() // A callback already queued before disconnect.
    await oldUpdate()
    await vi.advanceTimersByTimeAsync(200)
    expect(app.setActivity).toHaveBeenCalledTimes(count)
    expect(app.clearActivity).not.toHaveBeenCalled()
    app.ui.visible = false
    await app.update()
    app.events.get('navigatesuccess')!()
    await app.update()
    expect(app.clearActivity).not.toHaveBeenCalled()
    app.events.get('pagehide')!()
    expect(app.clearActivity).toHaveBeenCalledOnce()
  })

  it('ignores an old pending read after a replacement instance publishes', async () => {
    const app = setup()
    const pending = deferred<PageWork>()
    app.lookup.mockReturnValueOnce(pending.promise)
    const oldUpdate = app.update()
    await vi.waitFor(() => expect(app.lookup).toHaveBeenCalledOnce())
    app.reload()
    app.location.pathname = '/library'
    app.location.href = 'https://play.dlsite.com/library'
    await app.update()
    pending.resolve({ workno: 'RJ000001', age: 'all', work_type: 'MNG', name: 'Old Synthetic Work' })
    await oldUpdate
    expect(app.setActivity).toHaveBeenCalledExactlyOnceWith({ name: 'DLsite Play', type: 0, statusDisplayType: 0 })
    expect(app.clearActivity).not.toHaveBeenCalled()
    app.events.get('pagehide')!()
  })

  it('completes startup reads under continuous updates instead of invalidating each pending read', async () => {
    vi.useFakeTimers()
    const app = setup(true)
    const work = app.lookup.getMockImplementation()!
    const tracks = app.lookupTracks.getMockImplementation()!
    app.lookup.mockImplementation(id => new Promise(resolve => setTimeout(async () => resolve(await work(id)), 150)))
    app.lookupTracks.mockImplementation(id => new Promise(resolve => setTimeout(async () => resolve(await tracks(id)), 150)))
    app.observe()
    const updates: Promise<void>[] = []
    for (let step = 0; step < 7; step++) {
      updates.push(app.update())
      await vi.advanceTimersByTimeAsync(50)
    }
    expect(app.setActivity).toHaveBeenCalledWith(expect.objectContaining({ type: 2, details: 'Synthetic Track' }))
    expect(app.lookupTracks).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(200)
    await Promise.all(updates)
    app.events.get('pagehide')!()
  })

  it('discovers a late-mounted player after startup polling ends without a periodic update', async () => {
    vi.useFakeTimers()
    const app = setup(true, true)
    app.ui.visible = false
    app.observe()
    await app.update()
    await vi.advanceTimersByTimeAsync(4000)
    const count = app.setActivity.mock.calls.length
    app.ui.visible = true
    app.mutate(app.body)
    await vi.advanceTimersByTimeAsync(1)
    expect(app.setActivity.mock.calls.length).toBeGreaterThan(count)
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ type: 2, details: 'Synthetic Track' }))
    app.events.get('pagehide')!()
    expect(app.observers.every(observer => !observer.active)).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('updates forward/backward seek timestamps on commit without periodic updates or clearing the activity', async () => {
    vi.useFakeTimers()
    const app = setup(true, true)
    app.observe()
    await app.update()
    const clears = app.clearActivity.mock.calls.length
    app.ui.position = 90
    app.ui.seeking = true
    app.mutate(app.timeline)
    await vi.advanceTimersByTimeAsync(100)
    expect(app.setActivity.mock.calls.at(-1)![0]).not.toHaveProperty('endTimestamp')
    for (const position of [90, 10]) {
      app.ui.position = position
      app.ui.seeking = false
      app.seekCommit()
      await vi.advanceTimersByTimeAsync(100)
      const data = app.setActivity.mock.calls.at(-1)![0]
      expect(Math.abs(data.startTimestamp - (Date.now() / 1000 - position))).toBeLessThan(1)
      expect(data.endTimestamp - data.startTimestamp).toBe(120)
      expect(data.statusDisplayType).toBe(1)
    }
    await vi.advanceTimersByTimeAsync(5000)
    app.seekCommit()
    await vi.advanceTimersByTimeAsync(100)
    expect(Math.abs(app.setActivity.mock.calls.at(-1)![0].startTimestamp - (Date.now() / 1000 - 10))).toBeLessThan(1)
    expect(app.clearActivity).toHaveBeenCalledTimes(clears)
    app.events.get('pagehide')!()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('rechecks Privacy Mode before a shared pending startup read can publish', async () => {
    vi.useFakeTimers()
    const app = setup(true)
    const pending = deferred<PageWork>()
    app.lookup.mockReturnValueOnce(pending.promise)
    app.observe()
    const reading = app.update()
    await vi.advanceTimersByTimeAsync(1)
    app.getSetting.mockImplementation(async id => id === 'lang' ? 'ja' : id === 'displayType' ? 2 : true)
    const joined = app.update()
    pending.resolve({ workno: 'RJ000001', age: 'all', work_type: 'SOU', name: 'Synthetic Work' })
    await Promise.all([reading, joined])
    await vi.advanceTimersByTimeAsync(1)
    for (const [data] of app.setActivity.mock.calls) {
      expect(data).not.toHaveProperty('details')
      expect(data).not.toHaveProperty('state')
    }
    app.events.get('pagehide')!()
  })

  it.each(['absent', 'empty album', 'empty track'])('retains the verified activity across repeated folder URLs with a temporarily %s player', async (gap) => {
    vi.useFakeTimers()
    const app = setup(true)
    app.observe()
    await app.update()
    const clears = app.clearActivity.mock.calls.length
    const count = app.setActivity.mock.calls.length
    const original = app.setActivity.mock.calls.at(-1)![0]
    for (const folder of ['one', 'two', 'three']) {
      app.ui.visible = gap !== 'absent'
      app.ui.album = gap === 'empty album' ? '' : 'Synthetic Work'
      app.ui.track = gap === 'empty track' ? '' : 'Synthetic Track'
      app.location.pathname = `/work/RJ000001/tree/${folder}`
      app.location.href = `https://play.dlsite.com${app.location.pathname}`
      app.changeIdentity()
      app.events.get('navigatesuccess')!()
      await app.update()
      await vi.advanceTimersByTimeAsync(600)
      expect(app.clearActivity).toHaveBeenCalledTimes(clears)
      expect(app.setActivity).toHaveBeenCalledTimes(count)
      app.ui.visible = true
      app.ui.album = 'Synthetic Work'
      app.ui.track = 'Synthetic Track'
      await vi.advanceTimersByTimeAsync(200)
      expect(app.clearActivity).toHaveBeenCalledTimes(clears)
      expect(app.setActivity).toHaveBeenLastCalledWith(original)
    }
    app.events.get('pagehide')!()
  })

  it('does not cancel an in-flight audio read just because the folder URL changes', async () => {
    const app = setup(true)
    app.observe()
    await app.update()
    const clears = app.clearActivity.mock.calls.length
    const count = app.setActivity.mock.calls.length
    const pending = deferred<PageWork>()
    app.lookup.mockReturnValueOnce(pending.promise)
    const updating = app.update()
    await vi.waitFor(() => expect(app.lookup).toHaveBeenCalledTimes(2))
    app.location.pathname = '/work/RJ000001/tree/Folder'
    app.location.href = `https://play.dlsite.com${app.location.pathname}`
    app.events.get('navigatesuccess')!()
    pending.resolve({ workno: 'RJ000001', age: 'all', work_type: 'SOU', name: 'Synthetic Work' })
    await updating
    expect(app.clearActivity).toHaveBeenCalledTimes(clears)
    expect(app.setActivity.mock.calls.length).toBeGreaterThan(count)
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ type: 2, details: 'Synthetic Track' }))
  })

  it.each(['rating', 'new signing', 'new track'])('revokes retained playback immediately for %s during a DOM gap', async (signal) => {
    vi.useFakeTimers()
    const app = setup(true)
    app.observe()
    await app.update()
    const count = app.setActivity.mock.calls.length
    const clears = app.clearActivity.mock.calls.length
    app.ui.album = ''
    await app.update()
    expect(app.clearActivity).toHaveBeenCalledTimes(clears)
    if (signal === 'rating') {
      app.metadata({ workno: 'RJ000001', age: 'r18', work_type: 'SOU' })
    }
    else if (signal === 'new signing') {
      app.observe('RJ000002')
    }
    else {
      app.ui.track = 'Restricted Synthetic Track'
      app.changeIdentity()
    }
    expect(app.clearActivity).toHaveBeenCalledTimes(clears + 1)
    await app.update()
    await vi.advanceTimersByTimeAsync(200)
    if (signal === 'rating') {
      expect(app.setActivity.mock.calls.length).toBeGreaterThan(count)
      for (const [data] of app.setActivity.mock.calls.slice(count))
        expect(data).toEqual({ name: 'DLsite Play', type: 0, statusDisplayType: 0, startTimestamp: expect.any(Number) })
    }
    else {
      expect(app.setActivity).toHaveBeenCalledTimes(count)
    }
    expect(JSON.stringify(app.setActivity.mock.calls)).not.toContain('Restricted')
    app.events.get('pagehide')!()
  })

  it('does not keep extending the DOM grace period or publish browsing for an unresolved visible player', async () => {
    vi.useFakeTimers()
    const app = setup(true)
    app.observe()
    await app.update()
    const count = app.setActivity.mock.calls.length
    const clears = app.clearActivity.mock.calls.length
    app.ui.album = ''
    await app.update()
    for (let step = 0; step < 6; step++) {
      app.location.pathname = `/work/RJ000001/tree/${step}`
      app.location.href = `https://play.dlsite.com${app.location.pathname}`
      app.events.get('navigatesuccess')!()
      await vi.advanceTimersByTimeAsync(200)
    }
    expect(app.clearActivity).toHaveBeenCalledTimes(clears + 1)
    expect(app.setActivity).toHaveBeenCalledTimes(count)
    app.events.get('pagehide')!()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('discovers playback after signing finishes before the player mounts, without another periodic event', async () => {
    vi.useFakeTimers()
    const app = setup(true)
    app.ui.visible = false
    app.observe()
    await app.update()
    app.ui.visible = true
    await vi.advanceTimersByTimeAsync(250)
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ type: 2, details: 'Synthetic Track' }))
    app.events.get('pagehide')!()
  })

  it('does not clear or resend unchanged playback for folder navigation and repeated signing responses', async () => {
    vi.useFakeTimers()
    const app = setup(true)
    app.observe()
    await app.update()
    const count = app.setActivity.mock.calls.length
    const clears = app.clearActivity.mock.calls.length
    const reads = app.lookup.mock.calls.length
    for (const folder of ['one', 'two', 'three']) {
      app.location.pathname = `/work/RJ000001/tree/${folder}`
      app.location.href = `https://play.dlsite.com${app.location.pathname}`
      app.events.get('navigatesuccess')!()
    }
    expect(app.lookup).toHaveBeenCalledTimes(reads)
    app.observe()
    await vi.advanceTimersByTimeAsync(1)
    app.metadata({ workno: 'RJ000001', work_type: 'SOU', age: 'all', name: 'Synthetic Work', site_id: 'home', inservice: 1 })
    await vi.advanceTimersByTimeAsync(1)
    expect(app.clearActivity).toHaveBeenCalledTimes(clears)
    expect(app.setActivity).toHaveBeenCalledTimes(count)
    app.events.get('pagehide')!()
  })

  it('starts a different work from a playlist while another work folder stays open', async () => {
    const app = setup(true)
    app.location.pathname = '/work/RJ000002/tree/Folder'
    app.location.href = `https://play.dlsite.com${app.location.pathname}`
    app.lookup.mockImplementation(async id => ({ workno: id, age: 'all', work_type: 'SOU', name: id === 'RJ000001' ? 'Synthetic Work' : 'Browsed Work' }))
    app.observe()
    await app.update()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ type: 2, details: 'Synthetic Track', state: 'Synthetic Work' }))
  })

  it('never sends a next work track under the previous general album, even before its signing response arrives', async () => {
    vi.useFakeTimers()
    const app = setup(true)
    app.observe()
    await app.update()
    const count = app.setActivity.mock.calls.length
    app.ui.track = 'Restricted Synthetic Track'
    app.changeIdentity()
    expect(app.clearActivity).toHaveBeenCalled()
    await app.update()
    await vi.advanceTimersByTimeAsync(600)
    expect(app.setActivity).toHaveBeenCalledTimes(count)
    expect(JSON.stringify(app.setActivity.mock.calls)).not.toContain('Restricted')
    app.events.get('pagehide')!()
  })

  it('alternates general and R-18 repeatedly without fresh signing responses, allowing only generic R-18 payloads', async () => {
    vi.useFakeTimers()
    const app = setup(true)
    app.lookup.mockImplementation(async id => ({
      workno: id,
      work_type: 'SOU',
      age: id === 'RJ000002' ? 'r18' : 'all',
      name: id === 'RJ000002' ? 'Restricted Synthetic Work' : 'Synthetic Work',
      site_id: 'home',
      inservice: 1,
    }))
    app.observe()
    await app.update()
    for (let iteration = 0; iteration < 4; iteration++) {
      const count = app.setActivity.mock.calls.length
      app.ui.album = 'Restricted Synthetic Work'
      app.ui.track = 'Restricted Synthetic Track'
      if (iteration === 0)
        app.observe('RJ000002')
      app.changeIdentity()
      await app.update()
      expect(app.setActivity.mock.calls.length).toBeGreaterThan(count)
      for (const [data] of app.setActivity.mock.calls.slice(count))
        expect(data).toEqual({ name: 'DLsite Play', type: 0, statusDisplayType: 0, startTimestamp: expect.any(Number) })
      expect(app.clearActivity).toHaveBeenCalled()
      app.ui.album = 'Synthetic Work'
      app.ui.track = 'Synthetic Track'
      app.changeIdentity()
      await app.update()
      expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ details: 'Synthetic Track', state: 'Synthetic Work', endTimestamp: expect.any(Number) }))
    }
    expect(JSON.stringify(app.setActivity.mock.calls)).not.toContain('Restricted')
    expect(app.lookupTracks.mock.calls.every(([id]) => id === 'RJ000001')).toBe(true)
    app.events.get('pagehide')!()
  })

  it('withdraws before awaiting settings and rejects old general completions or metadata after R-18 evidence arrives', async () => {
    const app = setup(true)
    app.observe()
    await app.update()
    const pending = deferred<PageWork>()
    app.lookup.mockReturnValueOnce(pending.promise)
    const oldUpdate = app.update()
    await vi.waitFor(() => expect(app.lookup).toHaveBeenCalledTimes(2))
    const count = app.setActivity.mock.calls.length
    const restricted: PageWork = { workno: 'RJ000001', work_type: 'SOU', age: 'r18', name: 'Restricted Synthetic Work' }
    app.lookup.mockResolvedValue(restricted)
    const clears = app.clearActivity.mock.calls.length
    app.metadata(restricted)
    expect(app.clearActivity.mock.calls.length).toBeGreaterThan(clears)
    await app.update()
    pending.resolve({ workno: 'RJ000001', work_type: 'SOU', age: 'all', name: 'Synthetic Work' })
    await oldUpdate
    app.lookup.mockResolvedValue({ workno: 'RJ000001', work_type: 'SOU', age: 'all', name: 'Synthetic Work' })
    app.metadata({ workno: 'RJ000001', work_type: 'SOU', age: 'all', name: 'Synthetic Work' })
    await app.update()
    expect(app.setActivity.mock.calls.length).toBeGreaterThan(count)
    for (const [data] of app.setActivity.mock.calls.slice(count))
      expect(data).toEqual({ name: 'DLsite Play', type: 0, statusDisplayType: 0, startTimestamp: expect.any(Number) })
    expect(JSON.stringify(app.setActivity.mock.calls)).not.toContain('Restricted')
  })

  it('keeps playback and pause updates independent of the translation service', async () => {
    const app = setup(true)
    app.getStrings.mockRejectedValue(new Error('Synthetic translation unavailable'))
    app.observe()
    await app.update()
    await app.update()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ details: 'Synthetic Track', endTimestamp: expect.any(Number) }))
    expect(app.getStrings).toHaveBeenCalledOnce()
    app.changePlayback(true)
    await app.update()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ smallImageText: 'Paused' }))
    expect(app.getStrings).toHaveBeenCalledOnce()
  })

  it('does not wait for slow translations before publishing playback or freezing a paused bar', async () => {
    const app = setup(true)
    const pending = deferred<{ viewWork: string, paused: string }>()
    app.getStrings.mockReturnValue(pending.promise)
    app.observe()
    await app.update()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ details: 'Synthetic Track', endTimestamp: expect.any(Number) }))
    app.changePlayback(true)
    await app.update()
    const paused = app.setActivity.mock.calls.at(-1)![0]
    expect(paused.smallImageText).toBe('Paused')
    expect(paused).not.toHaveProperty('endTimestamp')
    pending.resolve({ viewWork: 'ページを見る', paused: '一時停止中' })
    await vi.waitFor(() => expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ smallImageText: '一時停止中' })))
    expect(app.getStrings).toHaveBeenCalledOnce()
    app.events.get('pagehide')!()
  })

  it('does not restore public work fields when a translation completes after privacy was enabled', async () => {
    const app = setup(true)
    const pending = deferred<{ viewWork: string, paused: string }>()
    app.getStrings.mockReturnValue(pending.promise)
    app.observe()
    await app.update()
    app.getSetting.mockImplementation(async id => id === 'lang' ? 'ja' : id === 'displayType' ? 2 : true)
    await app.update()
    const count = app.setActivity.mock.calls.length
    pending.resolve({ viewWork: 'ページを見る', paused: '一時停止中' })
    await pending.promise
    await app.update()
    for (const [data] of app.setActivity.mock.calls.slice(count - 1))
      expect(Object.keys(data).sort()).toEqual(['name', 'startTimestamp', 'statusDisplayType', 'type'])
    app.events.get('pagehide')!()
  })

  it('uses official translations and refreshes them when the lang setting changes', async () => {
    const app = setup(true)
    app.observe()
    await app.update()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({
      statusDisplayType: 1,
      buttons: [
        { label: 'ページを見る', url: 'https://www.dlsite.com/home/work/=/product_id/RJ000001.html' },
        { label: 'DLsite Play', url: 'https://play.dlsite.com/work/RJ000001' },
      ],
    }))
    app.getSetting.mockImplementation(async id => id === 'lang' ? 'en' : id === 'displayType' ? 2 : false)
    app.getStrings.mockResolvedValue({ viewWork: 'View Page', paused: 'Paused' })
    app.changePlayback(true)
    await app.update()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({
      smallImageText: 'Paused',
      buttons: [
        { label: 'View Page', url: 'https://www.dlsite.com/home/work/=/product_id/RJ000001.html' },
        { label: 'DLsite Play', url: 'https://play.dlsite.com/work/RJ000001' },
      ],
    }))
    expect(app.getStrings).toHaveBeenCalledTimes(2)
    expect(app.getStrings).toHaveBeenCalledWith({ viewWork: 'general.buttonViewPage', paused: 'general.paused' })
  })

  it('returns immediately during full/mini replacement, resamples later and clears a closed player after the grace period', async () => {
    vi.useFakeTimers()
    const app = setup(true)
    app.observe()
    await app.update()
    const count = app.setActivity.mock.calls.length
    const clears = app.clearActivity.mock.calls.length
    app.ui.visible = false
    await app.update()
    expect(app.setActivity).toHaveBeenCalledTimes(count)
    expect(app.clearActivity).toHaveBeenCalledTimes(clears)
    expect(app.lookup).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(200)
    app.ui.visible = true
    await vi.advanceTimersByTimeAsync(200)
    expect(app.setActivity).toHaveBeenCalledTimes(count)
    expect(app.setActivity.mock.calls.every(([data]) => data.type === 2)).toBe(true)
    app.ui.visible = false
    await app.update()
    await vi.advanceTimersByTimeAsync(1000)
    expect(app.setActivity).toHaveBeenLastCalledWith({ name: 'DLsite Play', type: 0, statusDisplayType: 0 })
    expect(vi.getTimerCount()).toBe(0)
  })

  it('hides public fields immediately when privacy is enabled during the player transition grace period', async () => {
    vi.useFakeTimers()
    const app = setup(true)
    app.observe()
    await app.update()
    app.ui.visible = false
    app.getSetting.mockImplementation(async id => id === 'lang' ? 'ja' : id === 'displayType' ? 2 : true)
    await app.update()
    expect(Object.keys(app.setActivity.mock.calls.at(-1)![0]).sort()).toEqual(['name', 'startTimestamp', 'statusDisplayType', 'type'])
    app.events.get('pagehide')!()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('reads a general work without eval, Function, or function-form execInPage', async () => {
    const app = setup()
    await app.update()
    expect(app.execInPage).not.toHaveBeenCalled()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ details: 'Synthetic Work', type: 3 }))
  })

  it('registers passive metadata and signing observation, excluding media streams', () => {
    const app = setup()
    const [filter] = app.onRequest.mock.calls[0]!
    expect(filter.method).toBe('GET')
    expect(filter.url.test('https://play.dlsite.com/api/v4/download/sign/url?workno=RJ000001')).toBe(true)
    expect(filter.url.test('https://play.dlsite.com/api/viewer/work/RJ000001')).toBe(true)
    expect(filter.url.test('https://play.dl.dlsite.com/private/audio.mp3')).toBe(false)
  })

  it('drops an older update that completes after a newer work', async () => {
    const app = setup()
    const old = deferred<PageWork>()
    const fresh = deferred<PageWork>()
    app.lookup.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise)
    const first = app.update()
    await vi.waitFor(() => expect(app.lookup).toHaveBeenCalledTimes(1))
    app.location.href = 'https://play.dlsite.com/work/RJ000002/viewer'
    app.location.pathname = '/work/RJ000002/viewer'
    const second = app.update()
    await vi.waitFor(() => expect(app.lookup).toHaveBeenCalledTimes(2))
    fresh.resolve({ workno: 'RJ000002', work_type: 'VCM', age: 'all', name: 'New Synthetic Work' })
    await second
    const count = app.setActivity.mock.calls.length
    old.resolve({ workno: 'RJ000001', work_type: 'MNG', age: 'all', name: 'Old Synthetic Work' })
    await first
    expect(app.setActivity.mock.calls).toHaveLength(count)
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ details: 'New Synthetic Work', type: 3 }))
  })

  it('keeps the same viewer type on chapter navigation and hides stale fields on a different work without provisional Playing', async () => {
    const app = setup()
    await app.update()
    app.events.get('navigatesuccess')!()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ type: 3, details: 'Synthetic Work' }))
    app.location.href = 'https://play.dlsite.com/work/RJ000002/viewer'
    app.location.pathname = '/work/RJ000002/viewer'
    const count = app.setActivity.mock.calls.length
    app.events.get('navigatesuccess')!()
    expect(app.setActivity).toHaveBeenCalledTimes(count)
    expect(app.clearActivity).toHaveBeenCalled()
    const cleared = app.clearActivity.mock.calls.length
    app.events.get('pagehide')!()
    expect(app.clearActivity).toHaveBeenCalledTimes(cleared + 1)
  })

  it('failed privacy settings hide work fields even if metadata is general', async () => {
    const app = setup()
    app.getSetting.mockRejectedValue(new Error('Synthetic unavailable setting'))
    await app.update()
    const last = app.setActivity.mock.calls.at(-1)![0]
    expect(Object.keys(last).sort()).toEqual(['name', 'startTimestamp', 'statusDisplayType', 'type'])
  })

  it('missing metadata protects identifiers and logs a fixed diagnostic only once', async () => {
    const app = setup()
    app.databases.mockRejectedValue(new Error('Synthetic private data must never be logged'))
    await app.update()
    await app.update()
    expect(app.setActivity).not.toHaveBeenCalled()
    expect(app.clearActivity).toHaveBeenCalled()
    expect(app.warn.mock.calls.filter(([message]) => message === 'DLsite Play: metadata-unavailable. No work information is being shared.')).toHaveLength(1)
  })

  it('logs only fixed lifecycle reasons and comparison results, never work identifiers or URLs', async () => {
    const app = setup(true)
    app.observe()
    await app.update()
    app.events.get('navigatesuccess')!()
    app.ui.track = 'Restricted Synthetic Track'
    app.changeIdentity()
    await app.update()
    app.events.get('pagehide')!()
    const messages = app.warn.mock.calls.map(([message]) => message).filter(message => message.startsWith('DLsite Play: lifecycle'))
    expect(messages.some(message => message.includes('reason=identity-change'))).toBe(true)
    expect(messages.some(message => message.includes('lifecycle navigation'))).toBe(true)
    expect(messages.some(message => message.includes('reason=pagehide'))).toBe(true)
    expect(messages.join('\n')).not.toMatch(/Synthetic|Restricted|RJ000001|https:/)
  })

  it('never sends a provisional Playing activity during normal audio updates', async () => {
    const app = setup(true)
    app.observe()
    await app.update()
    app.ui.position = 25
    await app.update()
    for (const [data] of app.setActivity.mock.calls) {
      expect(data).toMatchObject({ type: 2, statusDisplayType: 1, state: 'Synthetic Work', details: 'Synthetic Track' })
      expect(data.endTimestamp).toBeGreaterThan(data.startTimestamp)
    }
  })

  it('removes both timestamps after reading settings without waiting for metadata, and restores the bar on resume', async () => {
    const app = setup(true)
    app.observe()
    await app.update()
    const pending = deferred<PageWork>()
    app.lookup.mockReturnValueOnce(pending.promise)
    app.changePlayback(true)
    await vi.waitFor(() => expect(app.lookup).toHaveBeenCalledTimes(2))
    const paused = app.setActivity.mock.calls.at(-1)![0]
    expect(paused).toMatchObject({ smallImageKey: Assets.Pause, smallImageText: '一時停止中', type: 2, details: 'Synthetic Track' })
    expect(paused).not.toHaveProperty('startTimestamp')
    expect(paused).not.toHaveProperty('endTimestamp')
    pending.resolve({ workno: 'RJ000001', work_type: 'SOU', age: 'all', name: 'Synthetic Work' })
    await vi.waitFor(() => expect(app.setActivity.mock.calls.length).toBeGreaterThan(2))
    const count = app.setActivity.mock.calls.length
    app.changePlayback(false)
    await vi.waitFor(() => expect(app.setActivity.mock.calls.length).toBeGreaterThan(count))
    const resumed = app.setActivity.mock.calls.at(-1)![0]
    expect(resumed).not.toHaveProperty('smallImageKey')
    expect(resumed).not.toHaveProperty('smallImageText')
    expect(resumed.endTimestamp).toBeGreaterThan(resumed.startTimestamp)
    expect(app.observers).toHaveLength(2)
    const controls = app.observers.find(observer => observer.observe.mock.calls[0]?.[0] === app.button)!
    expect(controls.observe).toHaveBeenCalledExactlyOnceWith(app.button, { childList: true, subtree: true, attributes: true, attributeFilter: ['d'] })
    app.events.get('pagehide')!()
    for (const observer of app.observers)
      expect(observer.disconnect).toHaveBeenCalledOnce()
  })

  it('pause events preserve the separate private session timer and never add status icons', async () => {
    const app = setup(true)
    app.getSetting.mockImplementation(async id => id === 'lang' ? 'ja' : id === 'displayType' ? 2 : true)
    app.observe()
    await app.update()
    const count = app.setActivity.mock.calls.length
    app.changePlayback(true)
    await vi.waitFor(() => expect(app.setActivity.mock.calls.length).toBeGreaterThan(count))
    for (const [data] of app.setActivity.mock.calls)
      expect(Object.keys(data).sort()).toEqual(['name', 'startTimestamp', 'statusDisplayType', 'type'])
  })

  it('applies Name, Details and State setting changes while the work remains open', async () => {
    const app = setup(true)
    let display = 0
    app.getSetting.mockImplementation(async id => id === 'lang' ? 'ja' : id === 'displayType' ? display : false)
    app.observe()
    await app.update()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ statusDisplayType: 0 }))
    display = 1
    await app.update()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ statusDisplayType: 2, details: 'Synthetic Track' }))
    display = 2
    await app.update()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ statusDisplayType: 1, state: 'Synthetic Work' }))
  })

  it.each([0, 1, 2])('does not resend an old Display choice on pause or resume (setting %s)', async (setting) => {
    const app = setup(true)
    let display = 2
    const types = [0, 2, 1]
    app.getSetting.mockImplementation(async id => id === 'lang' ? 'ja' : id === 'displayType' ? display : false)
    app.observe()
    await app.update()
    const pending = deferred<PageWork>()
    app.lookup.mockReturnValueOnce(pending.promise)
    const count = app.setActivity.mock.calls.length
    display = setting
    app.changePlayback(true)
    await vi.waitFor(() => expect(app.lookup).toHaveBeenCalledTimes(2))
    const paused = app.setActivity.mock.calls.slice(count)
    expect(paused.length).toBeGreaterThan(0)
    for (const [data] of paused) {
      expect(data.statusDisplayType).toBe(types[display])
      expect(data.smallImageKey).toBe(Assets.Pause)
      expect(data).not.toHaveProperty('endTimestamp')
    }
    pending.resolve({ workno: 'RJ000001', work_type: 'SOU', age: 'all', name: 'Synthetic Work' })
    await vi.waitFor(() => expect(app.setActivity.mock.calls.length).toBeGreaterThan(count + paused.length))
    const resumedCount = app.setActivity.mock.calls.length
    display = (setting + 1) % 3
    app.changePlayback(false)
    await vi.waitFor(() => expect(app.setActivity.mock.calls.at(-1)![0]).toHaveProperty('endTimestamp'))
    for (const [data] of app.setActivity.mock.calls.slice(resumedCount))
      expect(data.statusDisplayType).toBe(types[display])
  })

  it('applies Display before metadata finishes and rechecks it before publishing the completed read', async () => {
    const app = setup(true)
    let display = 2
    app.getSetting.mockImplementation(async id => id === 'lang' ? 'ja' : id === 'displayType' ? display : false)
    app.observe()
    await app.update()
    const pending = deferred<PageWork>()
    app.lookup.mockReturnValueOnce(pending.promise)
    display = 1
    const update = app.update()
    await vi.waitFor(() => expect(app.lookup).toHaveBeenCalledTimes(2))
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ statusDisplayType: 2 }))
    display = 0
    pending.resolve({ workno: 'RJ000001', work_type: 'SOU', age: 'all', name: 'Synthetic Work' })
    await update
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ statusDisplayType: 0 }))
  })

  it.each([0, 1])('retains the last valid Display setting %s when settings temporarily fail or disappear', async (display) => {
    const app = setup(true)
    app.getSetting.mockImplementation(async id => id === 'lang' ? 'ja' : id === 'displayType' ? display : false)
    app.observe()
    await app.update()
    const count = app.setActivity.mock.calls.length
    for (const fail of [false, true]) {
      app.getSetting.mockImplementation(async (id) => {
        if (id === 'displayType') {
          if (fail)
            throw new Error('Synthetic settings failure')
          return undefined
        }
        return id === 'lang' ? 'ja' : false
      })
      await app.update()
    }
    for (const [data] of app.setActivity.mock.calls.slice(count))
      expect(data.statusDisplayType).toBe(display === 0 ? 0 : 2)
  })

  it('background audio remains Listening when navigating to another library screen', async () => {
    const app = setup(true)
    app.observe()
    await app.update()
    app.location.href = 'https://play.dlsite.com/settings'
    app.location.pathname = '/settings'
    app.events.get('navigatesuccess')!()
    await app.update()
    expect(app.setActivity.mock.calls.every(([data]) => data.type === 2)).toBe(true)
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ state: 'Synthetic Work', details: 'Synthetic Track', statusDisplayType: 1 }))
  })

  it.each(['event', 'periodic'])('does not publish Playing when navigation and audio DOM replacement overlap (%s)', async (notification) => {
    vi.useFakeTimers()
    const app = setup(true)
    app.observe()
    await app.update()
    app.ui.visible = false
    app.location.href = 'https://play.dlsite.com/settings'
    app.location.pathname = '/settings'
    if (notification === 'event')
      app.events.get('navigatesuccess')!()
    await app.update()
    expect(app.setActivity.mock.calls.every(([data]) => data.type === 2)).toBe(true)
    // A slow replacement can outlast the previous 300ms grace period.
    await vi.advanceTimersByTimeAsync(600)
    app.ui.visible = true
    await vi.advanceTimersByTimeAsync(200)
    expect(app.setActivity.mock.calls.every(([data]) => data.type === 2)).toBe(true)
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ details: 'Synthetic Track', state: 'Synthetic Work', endTimestamp: expect.any(Number) }))
    app.events.get('pagehide')!()
  })

  it('resamples a player that disappears during an IndexedDB read instead of publishing Playing', async () => {
    vi.useFakeTimers()
    const app = setup(true)
    app.observe()
    await app.update()
    app.lookup.mockImplementationOnce(async (id) => {
      app.ui.visible = false
      return { workno: id, work_type: 'SOU', age: 'all', name: 'Synthetic Work' }
    })
    await app.update()
    expect(app.setActivity.mock.calls.every(([data]) => data.type === 2)).toBe(true)
    app.ui.visible = true
    await vi.advanceTimersByTimeAsync(200)
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ type: 2, details: 'Synthetic Track' }))
    app.events.get('pagehide')!()
  })

  it('withdraws the activity while album binding is incomplete and restores verified fields after it recovers', async () => {
    vi.useFakeTimers()
    const app = setup(true)
    app.observe()
    await app.update()
    const count = app.setActivity.mock.calls.length
    app.ui.album = ''
    await app.update()
    expect(app.setActivity).toHaveBeenCalledTimes(count)
    expect(app.clearActivity).toHaveBeenCalled()
    app.ui.album = 'Synthetic Work'
    await vi.advanceTimersByTimeAsync(200)
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ type: 2, state: 'Synthetic Work', endTimestamp: expect.any(Number) }))
    expect(app.setActivity.mock.calls.every(([data]) => data.type === 2)).toBe(true)
    app.events.get('pagehide')!()
  })

  it('a temporary metadata failure does not drop a verified playing work', async () => {
    const app = setup(true)
    app.observe()
    await app.update()
    app.databases.mockRejectedValue(new Error('Synthetic storage unavailable'))
    app.ui.track = 'New Synthetic Track'
    await app.update()
    expect(app.setActivity).toHaveBeenLastCalledWith(expect.objectContaining({ type: 2, details: 'New Synthetic Track', state: 'Synthetic Work' }))
    expect(app.setActivity.mock.calls.every(([data]) => data.type === 2)).toBe(true)
  })

  it('switching privacy on hides the work immediately without reverting to Playing', async () => {
    const app = setup(true)
    app.observe()
    await app.update()
    app.setActivity.mockClear()
    app.getSetting.mockImplementation(async id => id === 'lang' ? 'ja' : true)
    await app.update()
    for (const [data] of app.setActivity.mock.calls) {
      expect(Object.keys(data).sort()).toEqual(['name', 'startTimestamp', 'statusDisplayType', 'type'])
      expect(data.type).toBe(2)
      expect(data.statusDisplayType).toBe(0)
    }
  })
})
