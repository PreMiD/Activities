import type { PageWork } from '../websites/D/DLsite Play/site.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DlsiteReader, normalizeSnapshot, readStoredTrackTitles, readStoredWork, selectors } from '../websites/D/DLsite Play/site.js'

const record: PageWork = {
  workno: 'RJ000001',
  work_type: 'SOU',
  age: 'all',
  name: { ja_JP: 'Synthetic Work', en_US: 'Synthetic Work English' },
  maker: { name: 'Synthetic Circle' },
  images: { thumb: 'https://img.dlsite.jp/test/cover.jpg' },
  site_id: 'home',
  inservice: 1,
}

function signing(reader: DlsiteReader, id = 'RJ000001', timestamp = 100) {
  reader.observeRequest({
    url: `https://play.dlsite.com/api/v4/download/sign/url?workno=${id}`,
    method: 'GET',
    ok: true,
    responseBody: 'Synthetic signed URL must never be parsed or retained',
    timestamp,
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('cSP-independent player reader', () => {
  let readWork: ReturnType<typeof vi.fn<(id: string) => Promise<PageWork | null>>>
  let readTracks: ReturnType<typeof vi.fn<() => Promise<ReadonlySet<string> | null>>>
  let page: { href: string, pathname: string }
  let ui: { visible: boolean, album: string, track: string, position: number, duration: number, icon: string, seeking: boolean, slider: boolean }
  let documentMock: { location: typeof page, querySelector: ReturnType<typeof vi.fn>, querySelectorAll: ReturnType<typeof vi.fn> }
  let audio: { querySelector: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    readWork = vi.fn(async () => record)
    readTracks = vi.fn(async () => new Set(['Synthetic Track', 'Next Synthetic Track', 'New Synthetic Track', 'Another Synthetic Track']))
    page = { href: 'https://play.dlsite.com/library', pathname: '/library' }
    ui = { visible: true, album: 'Synthetic Work', track: 'Synthetic Track', position: 20, duration: 120, icon: 'M28 100H0V0h28ZM77 0H49v100h28Z', seeking: false, slider: true }
    const slider = {
      getAttribute: (name: string) => name === 'aria-valuenow' ? String(ui.position) : name === 'aria-valuemax' ? String(ui.duration) : null,
      matches: () => ui.seeking,
      querySelector: () => null,
    }
    audio = {
      querySelector: vi.fn((selector: string) => {
        if (selector === selectors.album)
          return { textContent: ui.album }
        if (selector === selectors.trackTitle)
          return { textContent: ui.track }
        if (selector === selectors.playPause)
          return { getAttribute: () => ui.icon }
        if (selector === selectors.time)
          return ui.slider ? slider : null
        return null
      }),
    }
    documentMock = {
      location: page,
      querySelector: vi.fn((selector: string) => selector === selectors.audio && ui.visible ? audio : null),
      querySelectorAll: vi.fn(() => []),
    }
    vi.stubGlobal('location', page)
    vi.stubGlobal('document', documentMock)
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => '1.5') })
  })

  it('binds a playing work through its signing request and reads one local record', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    const result = await reader.read(false)
    expect(result.work).toMatchObject({ id: 'RJ000001', workType: 'SOU', age: 'all', title: 'Synthetic Work', trackTitle: 'Synthetic Track', circle: 'Synthetic Circle' })
    expect(readWork).toHaveBeenCalledExactlyOnceWith('RJ000001')
    expect(reader.issue).toBeNull()
  })

  it('does not need a signing request when the player album confirms the current work route', async () => {
    page.pathname = '/work/RJ000001'
    const reader = new DlsiteReader(readWork, readTracks)
    expect((await reader.read(false)).work?.id).toBe('RJ000001')
  })

  it('can rebind a matching work route when a previous work owns the last cached signing response', async () => {
    page.pathname = '/work/RJ000001'
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader, 'RJ000002')
    expect((await reader.read(false)).work).toMatchObject({ id: 'RJ000001', age: 'all', trackTitle: 'Synthetic Track' })
  })

  it('never assumes that a different work currently browsed is playing', async () => {
    page.pathname = '/work/RJ000002'
    readWork.mockResolvedValue({ ...record, workno: 'RJ000002', name: 'Another Synthetic Work' })
    const reader = new DlsiteReader(readWork, readTracks)
    expect((await reader.read(false)).work).toBeNull()
    expect(reader.issue).toBe('audio-work-unresolved')
  })

  it('retains a signing hint received before the first player mounts', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    ui.visible = false
    signing(reader)
    expect(await reader.read(false)).toMatchObject({ work: null, refreshAfter: 200 })
    ui.visible = true
    expect((await reader.read(false)).work).toMatchObject({ id: 'RJ000001', trackTitle: 'Synthetic Track' })
  })

  it('binds the signed playing work when a different folder route is still open', async () => {
    page.pathname = '/work/RJ000002/tree/Folder'
    readWork.mockImplementation(async id => id === 'RJ000001' ? record : { ...record, workno: id, name: 'Browsed Work' })
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    expect((await reader.read(false)).work).toMatchObject({ id: 'RJ000001', trackTitle: 'Synthetic Track' })
    expect(readWork.mock.calls.map(([id]) => id)).toEqual(['RJ000002', 'RJ000001'])
  })

  it('never retains an activity when only the live track identity changes', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    await reader.read(false)
    ui.track = 'Restricted Synthetic Track'
    expect(reader.canKeepAudioPresence()).toBe(false)
  })

  it.each(['r15', 'r18', undefined])('hides identifying fields for age %s while preserving category', async (age) => {
    readWork.mockResolvedValue({ ...record, age })
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    const result = await reader.read(false)
    expect(result.work?.workType).toBe('SOU')
    expect(result.work).not.toHaveProperty('title')
    expect(result.work).not.toHaveProperty('trackTitle')
    expect(result.work).not.toHaveProperty('circle')
    expect(result.work).not.toHaveProperty('image')
    expect(result.playback).toBeNull()
    expect(normalizeSnapshot(result, false).work?.category).toBe('audio')
  })

  it('hides general work details with privacy enabled', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    expect(await reader.read(true)).toEqual({ work: { id: 'RJ000001', workType: 'SOU', age: 'all' }, playback: null })
    expect(readTracks).not.toHaveBeenCalled()
  })

  it('updates the track within the same work without retaining the previous track', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    expect((await reader.read(false)).work?.trackTitle).toBe('Synthetic Track')
    ui.track = 'Next Synthetic Track'
    expect((await reader.read(false)).work?.trackTitle).toBe('Next Synthetic Track')
    ui.track = ''
    expect(await reader.read(false)).toMatchObject({ work: null, playback: null, retryAfter: 200 })
  })

  it('refuses a track absent from the confirmed general work file tree, even with its old album still visible', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    await reader.read(false)
    ui.track = 'Restricted Synthetic Track'
    expect(await reader.read(false)).toEqual({ work: null, playback: null, retryAfter: 200 })
  })

  it('does not commit a stale file-tree read after a restricted work replaces it', async () => {
    let resolveTracks!: (titles: ReadonlySet<string>) => void
    readTracks.mockReturnValueOnce(new Promise((resolve) => {
      resolveTracks = resolve
    }))
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    const old = reader.read(false)
    await vi.waitFor(() => expect(readTracks).toHaveBeenCalledOnce())
    ui.album = 'Restricted Synthetic Work'
    ui.track = 'Restricted Synthetic Track'
    readWork.mockResolvedValue({ workno: 'RJ000002', work_type: 'SOU', age: 'r18', name: 'Restricted Synthetic Work' })
    signing(reader, 'RJ000002', 200)
    expect((await reader.read(false)).work).toEqual({ id: 'RJ000002', workType: 'SOU', age: 'r18' })
    resolveTracks(new Set(['Synthetic Track']))
    expect(await old).toEqual({ work: null, playback: null, stale: true })
    expect((await reader.read(false)).work).toEqual({ id: 'RJ000002', workType: 'SOU', age: 'r18' })
  })

  it('uses passive work metadata if the local record is unavailable', async () => {
    readWork.mockResolvedValue(null)
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    reader.observeRequest({ url: 'https://play.dlsite.com/api/viewer/work/RJ000001', method: 'GET', ok: true, timestamp: 100, responseBody: JSON.stringify(record) })
    expect((await reader.read(false)).work?.title).toBe('Synthetic Work')
  })

  it('restricted evidence overrides a general local record without caching its title', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    reader.observeRequest({ url: 'https://play.dlsite.com/api/v4/work/RJ000001', method: 'GET', ok: true, timestamp: 100, responseBody: JSON.stringify({ ...record, age: 'r15' }) })
    const result = await reader.read(false)
    expect(result.work).toEqual({ id: 'RJ000001', workType: 'SOU', age: 'r15' })
    expect(result.playback).toBeNull()
  })

  it('ignores stale signing responses and responses from another origin', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader, 'RJ000001', 200)
    signing(reader, 'RJ000002', 100)
    reader.observeRequest({ url: 'https://other.example/api/v4/download/sign/url?workno=RJ000003', method: 'GET', ok: true, timestamp: 300, responseBody: null })
    expect((await reader.read(false)).work?.id).toBe('RJ000001')
  })

  it('publishes a complete media timeline on the first sample and tolerates duplicate callbacks', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    expect((await reader.read(false)).playback?.readyState).toBe(3)
    ui.position = 25
    expect((await reader.read(false)).playback).toMatchObject({ currentTime: 25, duration: 120, readyState: 3, playbackRate: 1.5, paused: false })
    expect((await reader.read(false)).playback?.readyState).toBe(3)
  })

  it('preserves the measured time origin when background UI values stop updating', async () => {
    vi.useFakeTimers()
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    const first = (await reader.read(false)).playback!
    vi.advanceTimersByTime(10000)
    const repeated = (await reader.read(false)).playback!
    expect(repeated.readyState).toBe(3)
    expect(repeated.sampledAt).toBe(first.sampledAt)
    ui.position = 21
    expect((await reader.read(false)).playback?.readyState).toBe(3)
  })

  it('uses verified elapsed and remaining labels when slider values are absent', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    ui.slider = false
    const query = audio.querySelector.getMockImplementation()!
    audio.querySelector.mockImplementation((selector: string) => {
      if (selector === selectors.elapsed)
        return { textContent: '1:20' }
      if (selector === selectors.remaining)
        return { textContent: '2:40' }
      return query(selector)
    })
    expect((await reader.read(false)).playback).toMatchObject({ currentTime: 80, duration: 240, readyState: 3 })
  })

  it.each(['90:10', '1:30:10'])('preserves long playback times with native conversion: %s', async (elapsed) => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    ui.slider = false
    const query = audio.querySelector.getMockImplementation()!
    audio.querySelector.mockImplementation((selector: string) => {
      if (selector === selectors.elapsed)
        return { textContent: elapsed }
      if (selector === selectors.remaining)
        return { textContent: '0:50' }
      return query(selector)
    })
    expect((await reader.read(false)).playback).toMatchObject({ currentTime: 5410, duration: 5460 })
  })

  it.each(['', '1:60', 'not a time'])('does not convert an invalid time label into playback progress: %s', async (elapsed) => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    ui.slider = false
    const query = audio.querySelector.getMockImplementation()!
    audio.querySelector.mockImplementation((selector: string) => selector === selectors.elapsed
      ? { textContent: elapsed }
      : query(selector))
    expect((await reader.read(false)).playback).toBeNull()
  })

  it('mini progress uses a measured duration for the same track and never reuses it for another track', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    await reader.read(false)
    ui.slider = false
    const query = audio.querySelector.getMockImplementation()!
    audio.querySelector.mockImplementation((selector: string) => selector === selectors.miniProgress
      ? { style: { transform: 'scaleX(0.5)' } }
      : query(selector))
    expect((await reader.read(false)).playback).toMatchObject({ currentTime: 60, duration: 120 })
    ui.track = 'Another Synthetic Track'
    expect((await reader.read(false)).playback).toBeNull()
  })

  it('does not reuse an old position when both absolute time and mini progress are unavailable', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    await reader.read(false)
    ui.slider = false
    expect((await reader.read(false)).playback).toBeNull()
  })

  it('uses a new elapsed position with the previously verified duration when the remaining label is missing', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    await reader.read(false)
    ui.slider = false
    const query = audio.querySelector.getMockImplementation()!
    audio.querySelector.mockImplementation((selector: string) => selector === selectors.elapsed ? { textContent: '1:10' } : query(selector))
    expect((await reader.read(false)).playback).toMatchObject({ currentTime: 70, duration: 120 })
  })

  it('keeps the current work through a temporary metadata failure without keeping an old track title', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    await reader.read(false)
    readWork.mockRejectedValue(new Error('Synthetic storage unavailable'))
    ui.track = 'New Synthetic Track'
    expect((await reader.read(false)).work).toMatchObject({ id: 'RJ000001', title: 'Synthetic Work', trackTitle: 'New Synthetic Track' })
    readWork.mockResolvedValue({ ...record, age: 'r15' })
    expect((await reader.read(false)).work).toEqual({ id: 'RJ000001', workType: 'SOU', age: 'r15' })
  })

  it('a full/mini DOM replacement during a database read does not end the work', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    readWork.mockImplementation(async () => {
      audio = { querySelector: audio.querySelector }
      return record
    })
    expect((await reader.read(false)).work?.id).toBe('RJ000001')
    expect(reader.canKeepAudioPresence()).toBe(true)
  })

  it('keeps the verified category but hides all fields when same-work metadata becomes incomplete', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    await reader.read(false)
    readWork.mockResolvedValue({ workno: 'RJ000001' })
    expect(normalizeSnapshot(await reader.read(false), false)).toEqual({
      work: { id: 'RJ000001', category: 'audio', rating: 'unknown' },
      playback: null,
    })
  })

  it('retries a brief full/mini transition instead of declaring the work closed', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    await reader.read(false)
    vi.useFakeTimers()
    ui.visible = false
    expect(await reader.read(false)).toMatchObject({ retryAfter: 200 })
    expect(vi.getTimerCount()).toBe(0)
    await vi.advanceTimersByTimeAsync(100)
    ui.visible = true
    expect((await reader.read(false)).work?.id).toBe('RJ000001')
  })

  it('recognizes paused, seeking and ended UI states', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    ui.icon = 'm0 0 80 50-80 50Z'
    expect((await reader.read(false)).playback?.paused).toBe(true)
    ui.icon = 'M28 100H0V0h28ZM77 0H49v100h28Z'
    ui.seeking = true
    expect((await reader.read(false)).playback?.seeking).toBe(true)
    ui.position = ui.duration
    expect((await reader.read(false)).playback?.ended).toBe(true)
  })

  it('mini players without absolute times keep metadata without inventing progress', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    ui.slider = false
    const result = await reader.read(false)
    expect(result.work?.title).toBe('Synthetic Work')
    expect(result.playback).toBeNull()
  })

  it('voice comics never borrow audio progress', async () => {
    readWork.mockResolvedValue({ ...record, work_type: 'VCM' })
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    const result = await reader.read(false)
    expect(normalizeSnapshot(result, false).work?.category).toBe('voiceComic')
    expect(result.playback).toBeNull()
  })

  it('uses the original circle and omits publishers and translation uploaders', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    readWork.mockResolvedValue({ ...record, original_maker: { name: 'Original Synthetic Circle' } })
    expect((await reader.read(false)).work?.circle).toBe('Original Synthetic Circle')
    readWork.mockResolvedValue({ ...record, is_community_translation: true })
    expect((await reader.read(false)).work).not.toHaveProperty('circle')
  })

  it('keeps audio across unrelated navigation during a read, but rejects a player identity change', async () => {
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    readWork.mockImplementation(async () => {
      page.href = 'https://play.dlsite.com/settings'
      return record
    })
    expect((await reader.read(false)).work?.trackTitle).toBe('Synthetic Track')
    readWork.mockImplementation(async () => {
      ui.album = 'Another Synthetic Work'
      return record
    })
    const changed = (await reader.read(false)).work
    expect(changed).toBeNull()
  })

  it('stopping the audio UI ends the session', async () => {
    vi.useFakeTimers()
    const reader = new DlsiteReader(readWork, readTracks)
    signing(reader)
    await reader.read(false)
    ui.visible = false
    expect(await reader.read(false)).toMatchObject({ retryAfter: 200 })
    await vi.advanceTimersByTimeAsync(1000)
    expect(await reader.read(false)).toEqual({ work: null, playback: null })
  })

  it('video uses exactly one scoped native media element', async () => {
    vi.useFakeTimers()
    page.pathname = '/work/RJ000001/view/file'
    readWork.mockResolvedValue({ ...record, work_type: 'MOV' })
    const video = { currentTime: 20, duration: 120, paused: false, ended: false, seeking: false, readyState: 4, playbackRate: 2 }
    const events = new Map<string, () => void>()
    const media = {
      ...video,
      addEventListener: vi.fn((name: string, callback: () => void) => events.set(name, callback)),
      removeEventListener: vi.fn(),
    }
    documentMock.querySelectorAll.mockReturnValue([media])
    const reader = new DlsiteReader(readWork, readTracks)
    const changed = vi.fn()
    const timelineChanged = vi.fn()
    reader.onTimelineChange = timelineChanged
    reader.onPlaybackChange = changed
    expect((await reader.read(false)).playback).toEqual(video)
    media.paused = true
    events.get('pause')!()
    expect(changed).toHaveBeenLastCalledWith(true)
    media.paused = false
    events.get('play')!()
    expect(changed).toHaveBeenLastCalledWith(false)
    media.ended = true
    events.get('ended')!()
    expect(changed).toHaveBeenLastCalledWith(true)
    events.get('seeked')!()
    events.get('ratechange')!()
    await vi.advanceTimersByTimeAsync(100)
    expect(timelineChanged).toHaveBeenCalledOnce()
    documentMock.querySelectorAll.mockReturnValue([media, media])
    expect((await reader.read(false)).playback).toBeNull()
    expect(media.removeEventListener.mock.calls.map(([event]) => event)).toEqual(['pause', 'play', 'ended', 'seeking', 'seeked', 'ratechange', 'durationchange', 'loadedmetadata'])
  })
})

describe('read-only local metadata access', () => {
  it.each(['RJ000001', 'RJ000002'])('validates the local file-tree work identity (%s) and admits only audio file names', async (treeId) => {
    const get = vi.fn(() => {
      const request = { result: { workno: 'RJ000001', json: JSON.stringify({
        workno: treeId,
        tree: [{ type: 'file', name: 'Synthetic Track.wav', hashname: 'audio' }, { type: 'file', name: 'Image.jpg', hashname: 'image' }, { type: 'folder', name: 'Folder', children: [{ type: 'folder', children: [{ type: 'file', name: 'Nested Track.FLAC', hashname: 'nested' }] }] }],
        playfile: { audio: { type: 'audio' }, image: { type: 'image' }, nested: { type: 'audio' } },
      }) }, onsuccess: null as (() => void) | null }
      queueMicrotask(() => request.onsuccess?.())
      return request
    })
    const transaction = vi.fn(() => ({ objectStore: () => ({ get }) }))
    const close = vi.fn()
    const open = vi.fn(() => {
      const request = { result: { close, transaction, objectStoreNames: { contains: (name: string) => name === 'Ziptree' } }, onsuccess: null as (() => void) | null }
      queueMicrotask(() => request.onsuccess?.())
      return request
    })
    vi.stubGlobal('indexedDB', { databases: async () => [{ name: 'Play_synthetic202205' }], open })
    expect(await readStoredTrackTitles('RJ000001')).toEqual(treeId === 'RJ000001' ? new Set(['Synthetic Track', 'Nested Track']) : null)
    expect(transaction).toHaveBeenCalledExactlyOnceWith('Ziptree', 'readonly')
    expect(get).toHaveBeenCalledExactlyOnceWith('RJ000001')
    expect(close).toHaveBeenCalledOnce()
  })
  it('does not open a database if there are multiple possible accounts', async () => {
    const open = vi.fn()
    vi.stubGlobal('indexedDB', { databases: async () => [{ name: 'Play_synthetic1202205' }, { name: 'Play_synthetic2202205' }], open })
    expect(await readStoredWork('RJ000001')).toBeNull()
    expect(open).not.toHaveBeenCalled()
  })

  it('does not create a database when none exists', async () => {
    const open = vi.fn()
    vi.stubGlobal('indexedDB', { databases: async () => [], open })
    expect(await readStoredWork('RJ000001')).toBeNull()
    expect(open).not.toHaveBeenCalled()
  })

  it('reads one key through a readonly transaction and closes its connection', async () => {
    const get = vi.fn(() => {
      const request = { result: record, onsuccess: null as (() => void) | null }
      queueMicrotask(() => request.onsuccess?.())
      return request
    })
    const close = vi.fn()
    const transaction = vi.fn(() => ({ objectStore: () => ({ get }) }))
    const open = vi.fn(() => {
      const request = { result: { close, transaction, objectStoreNames: { contains: () => true } }, onsuccess: null as (() => void) | null }
      queueMicrotask(() => request.onsuccess?.())
      return request
    })
    vi.stubGlobal('indexedDB', { databases: async () => [{ name: 'Play_synthetic202205' }], open })
    expect(await readStoredWork('RJ000001')).toEqual(record)
    expect(transaction).toHaveBeenCalledExactlyOnceWith('Purchase', 'readonly')
    expect(get).toHaveBeenCalledExactlyOnceWith('RJ000001')
    expect(close).toHaveBeenCalledOnce()
  })

  it('aborts an unexpected upgrade rather than creating or migrating a database', async () => {
    const abort = vi.fn()
    const open = vi.fn(() => {
      const request = { transaction: { abort }, onupgradeneeded: null as (() => void) | null, onerror: null as (() => void) | null }
      queueMicrotask(() => {
        request.onupgradeneeded?.()
        request.onerror?.()
      })
      return request
    })
    vi.stubGlobal('indexedDB', { databases: async () => [{ name: 'Play_synthetic202205' }], open })
    expect(await readStoredWork('RJ000001')).toBeNull()
    expect(abort).toHaveBeenCalledOnce()
  })
})
