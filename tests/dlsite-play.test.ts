import type { PlaybackInfo, WorkInfo } from '../websites/D/DLsite Play/activity.js'
import { readFileSync } from 'node:fs'
import { ActivityType, Assets } from 'premid'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildBrowsingPresence, buildContentPresence, getViewerWorkId, resolveArtworkUrl, resolveCanonicalWorkUrl, resolveContentCategory, resolveContentRating, resolveDisplayType, WorkSession } from '../websites/D/DLsite Play/activity.js'
import { defaultMessages, stringKeys, TranslationCache } from '../websites/D/DLsite Play/i18n.js'
import { normalizeSnapshot } from '../websites/D/DLsite Play/site.js'

// All works, titles, images and IDs in this suite are synthetic.
const work: WorkInfo = {
  id: 'RJ000001',
  category: 'audio',
  rating: 'general',
  title: 'Synthetic Work',
  trackTitle: 'Synthetic Track',
  circle: 'Synthetic Circle',
  artworkUrl: 'https://img.dlsite.jp/test/cover.jpg',
  workUrl: 'https://www.dlsite.com/home/work/=/product_id/RJ000001.html',
}
const playing: PlaybackInfo = {
  currentTime: 20,
  duration: 120,
  paused: false,
  ended: false,
  seeking: false,
  readyState: 4,
  playbackRate: 1,
}
function render(info = work, playback: PlaybackInfo | null = playing, privacy = false) {
  return buildContentPresence(info, playback, privacy, 1000, 'View Page')
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('identity and supported categories', () => {
  it.each([
    ['COM', ActivityType.Watching],
    ['ICG', ActivityType.Watching],
    ['NRE', ActivityType.Watching],
    ['VCM', ActivityType.Watching],
    ['SOU', ActivityType.Listening],
    ['MUS', ActivityType.Listening],
    ['MOV', ActivityType.Watching],
    ['unsupported', ActivityType.Playing],
  ])('%s keeps the service name and correct type', (code, type) => {
    expect(render({ ...work, category: resolveContentCategory(code) })).toMatchObject({ name: 'DLsite Play', type })
  })

  it.each([undefined, 'UNKNOWN', 'mp3', 'audio', 'ET3', 'constructor', '__proto__'])('does not guess category from %s', (code) => {
    expect(resolveContentCategory(code)).toBe('unknown')
  })

  it('browsing contains no details, state, artwork, links, buttons or timers', () => {
    expect(buildBrowsingPresence()).toEqual({ name: 'DLsite Play', type: ActivityType.Playing, statusDisplayType: 0 })
  })

  it.each(['/', '/library', '/work/RJ000001', '/work/RJ000001/tree', '/work/RJ000001/tree/folder', '/settings', '/admin/work/RJ000001/viewer'])('%s is browsing', (path) => {
    expect(getViewerWorkId(path)).toBeNull()
  })

  it.each(['/work/RJ000001/viewer', '/work/RJ000001/viewer/chapter', '/work/RJ000001/view/file', '/dllibrary/work/RJ000001/view/file', '/viewer/free/RJ000001', '/viewer/sample/RJ000001'])('%s identifies the work, independent of chapter', (path) => {
    expect(getViewerWorkId(path)).toBe('RJ000001')
  })
})

describe('privacy and metadata transitions', () => {
  it.each([[undefined, 'unknown'], ['all', 'general'], ['r15', 'r15'], ['r18', 'r18'], ['All Ages', 'unknown']])('resolves official age %s', (age, rating) => {
    expect(resolveContentRating(age)).toBe(rating)
  })

  it.each(['r15'] as const)('always protects %s works with the switch off', (rating) => {
    expect(render({ ...work, rating })).toEqual({ name: 'DLsite Play', type: ActivityType.Listening, statusDisplayType: 0, startTimestamp: 1000 })
  })

  it.each([false, true])('shows only generic Playing for R-18 and still hides unknown age with privacy=%s', (privacy) => {
    expect(render({ ...work, rating: 'r18' }, playing, privacy)).toEqual({ name: 'DLsite Play', type: ActivityType.Playing, statusDisplayType: 0, startTimestamp: 1000 })
    expect(render({ ...work, rating: 'unknown' }, playing, privacy)).toBeNull()
  })

  it('the privacy switch hides even general works and playback duration', () => {
    expect(render(work, playing, true)).toEqual({ name: 'DLsite Play', type: ActivityType.Listening, statusDisplayType: 0, startTimestamp: 1000 })
  })

  it.each(['audio', 'music'] as const)('shows the track, work and circle in the requested %s fields', (category) => {
    expect(render({ ...work, category })).toMatchObject({ details: work.trackTitle, state: work.title, largeImageText: work.circle, largeImageKey: work.artworkUrl, largeImageUrl: work.workUrl, buttons: [{ label: 'View Page', url: work.workUrl }, { label: 'DLsite Play', url: 'https://play.dlsite.com/work/RJ000001' }] })
  })

  it('preserves the work title and circle fields for Watching', () => {
    const data = render({ ...work, category: 'video' })
    expect(data).toMatchObject({ details: work.title, state: work.title, largeImageText: work.circle, statusDisplayType: 1 })
  })

  it('omits unavailable track metadata without substituting the work title', () => {
    const data = render({ id: work.id, category: 'audio', rating: 'general', title: work.title })
    expect(data.state).toBe(work.title)
    expect(data).not.toHaveProperty('details')
    expect(data).not.toHaveProperty('largeImageText')
  })

  it.each(['audio', 'music', 'video', 'manga', 'novel', 'illustration', 'voiceComic'] as const)('%s uses the public work title as State and Display', (category) => {
    expect(render({ ...work, category })).toMatchObject({ state: work.title, statusDisplayType: 1, name: 'DLsite Play' })
    expect(render({ ...work, category }, playing, true)).toMatchObject({ statusDisplayType: 0 })
    expect(render({ ...work, category }, playing, true)).not.toHaveProperty('state')
  })

  it('public → unknown → general → another work never retains metadata', () => {
    const session = new WorkSession()
    const started = session.update(work.id, 1000000)
    expect(render()).toHaveProperty('details')
    const unknown = normalizeSnapshot({ work: { id: work.id, workType: 'SOU' }, playback: playing }, false)
    expect(render(unknown.work!)).toBeNull()
    expect(session.update(work.id, 2000000)).toBe(started)
    expect(render()).toHaveProperty('details', work.trackTitle)
    const next = normalizeSnapshot({ work: { id: 'RJ000002', workType: 'MNG', age: 'all' }, playback: null }, false)
    const data = render(next.work!, null)
    for (const key of ['details', 'state', 'largeImageKey', 'largeImageUrl', 'buttons'])
      expect(data).not.toHaveProperty(key)
    expect(session.update('RJ000002', 2000000)).toBe(2000)
    session.update(null, 3000000)
    expect(session.update('RJ000002', 4000000)).toBe(4000)
  })

  it('track switching and pause do not reset a private work session', () => {
    const session = new WorkSession()
    const start = session.update(work.id, 1000000)
    for (const playback of [playing, { ...playing, paused: true }, { ...playing, currentTime: 0 }]) {
      expect(buildContentPresence(work, playback, true, session.update(work.id, 2000000), 'View Page').startTimestamp).toBe(start)
    }
  })

  it('omits missing titles and circles instead of inventing fallbacks', () => {
    expect(render({ id: work.id, rating: 'general', category: 'manga' }, null)).toEqual({ name: 'DLsite Play', type: ActivityType.Watching, statusDisplayType: 0 })
  })
})

describe('playback synchronization', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(2000000)
  })

  it('uses playback position and native timestamps in seconds', () => {
    expect(render()).toMatchObject({ startTimestamp: 1980, endTimestamp: 2100 })
    vi.advanceTimersByTime(5000)
    expect(render(work, { ...playing, currentTime: 25 })).toMatchObject({ startTimestamp: 1980, endTimestamp: 2100 })
  })

  it.each(['audio', 'music', 'video'] as const)('%s replaces the running bar with a Pause indicator and resynchronizes on resume', (category) => {
    const info = { ...work, category }
    expect(render(info)).not.toHaveProperty('smallImageKey')
    expect(render(info)).not.toHaveProperty('smallImageText')
    const paused = render(info, { ...playing, paused: true })
    expect(paused).toMatchObject({ smallImageKey: Assets.Pause, smallImageText: 'Paused' })
    expect(paused).not.toHaveProperty('startTimestamp')
    expect(paused).not.toHaveProperty('endTimestamp')
    vi.advanceTimersByTime(60000)
    const resumed = render(info, { ...playing, sampledAt: Date.now() })
    expect(resumed).toMatchObject({ startTimestamp: 2040, endTimestamp: 2160 })
    expect(resumed).not.toHaveProperty('smallImageKey')
    expect(resumed).not.toHaveProperty('smallImageText')
    expect(render(info, { ...playing, ended: true })).toHaveProperty('smallImageKey', Assets.Pause)
    expect(render(info, { ...playing, paused: true }, true)).not.toHaveProperty('smallImageKey')
  })

  it('resynchronizes on resume, seek, new track and rate change', () => {
    expect(render(work, { ...playing, currentTime: 60 })).toMatchObject({ startTimestamp: 1940, endTimestamp: 2060 })
    expect(render(work, { ...playing, currentTime: 0 })).toMatchObject({ startTimestamp: 2000, endTimestamp: 2120 })
    expect(render(work, { ...playing, playbackRate: 2 })).toMatchObject({ startTimestamp: 1990, endTimestamp: 2050 })
    expect(render(work, { ...playing, playbackRate: 0.5 })).toMatchObject({ startTimestamp: 1960, endTimestamp: 2200 })
  })

  it('keeps both progress timestamps stable when the UI repeats an older media sample', () => {
    const sample = { ...playing, sampledAt: Date.now() }
    const first = render(work, sample)
    vi.advanceTimersByTime(15000)
    expect(render(work, sample)).toMatchObject({ startTimestamp: first.startTimestamp, endTimestamp: first.endTimestamp })
  })

  it.each([[0, 0], [1, 2], [2, 1]])('display setting %s selects the intended field %s', (setting, expected) => {
    const selected = resolveDisplayType(setting)
    expect(buildContentPresence(work, playing, false, 1000, 'View Page', selected).statusDisplayType).toBe(expected)
    expect(buildContentPresence(work, playing, true, 1000, 'View Page', selected).statusDisplayType).toBe(0)
  })

  it.each([
    { paused: true },
    { ended: true },
    { seeking: true },
    { readyState: 2 },
    { duration: Number.NaN },
    { duration: Infinity },
    { duration: 0 },
    { currentTime: -1 },
    { currentTime: Number.NaN },
    { currentTime: 120 },
    { playbackRate: 0 },
    { playbackRate: Infinity },
  ])('removes progress for %j without losing work metadata', (change) => {
    const data = render(work, { ...playing, ...change })
    expect(data).not.toHaveProperty('startTimestamp')
    expect(data).not.toHaveProperty('endTimestamp')
    expect(data.details).toBe(work.trackTitle)
  })

  it.each(['manga', 'illustration', 'novel', 'voiceComic'] as const)('%s never uses audio progress', (category) => {
    expect(render({ ...work, category })).not.toHaveProperty('endTimestamp')
    expect(render({ ...work, category })).not.toHaveProperty('smallImageKey')
  })

  it('video uses playback progress and tolerates player replacement', () => {
    expect(render({ ...work, category: 'video' })).toHaveProperty('endTimestamp')
    expect(render(work, null)).not.toHaveProperty('endTimestamp')
    expect(render(work, { ...playing, duration: 80, currentTime: 5 })).toHaveProperty('endTimestamp', 2075)
  })
})

describe('links, images and localization', () => {
  it('uses the site helper relationship without guessing a shop from an ID', () => {
    expect(resolveCanonicalWorkUrl(work.id, 'home-touch', 1)).toBe(work.workUrl)
    expect(resolveCanonicalWorkUrl('BJ000001', 'comic', 1)).toBe('https://www.comipo.app/product/BJ000001')
    expect(resolveCanonicalWorkUrl(work.id, undefined, 1)).toBeNull()
    expect(resolveCanonicalWorkUrl(work.id, 'home', 0)).toBeNull()
    expect(resolveCanonicalWorkUrl('../private', 'home', 1)).toBeNull()
    expect(resolveCanonicalWorkUrl(work.id, 'home?token=secret', 1)).toBeNull()
  })

  it.each(['', 'javascript:alert(1)', 'blob:https://play.dlsite.com/a', '/private/cover.jpg', 'https://play.dl.dlsite.com/cover.jpg', 'http://img.dlsite.jp/cover.jpg', 'https://user:password@img.dlsite.jp/cover.jpg', 'https://img.dlsite.jp/cover.jpg?token=secret', 'https://img.dlsite.jp.evil.example/cover.jpg'])('rejects unsafe or unverified artwork %s', (value) => {
    expect(resolveArtworkUrl(value)).toBeNull()
  })

  it('rejects links for another work and protected viewer links', () => {
    expect(render({ ...work, workUrl: 'https://play.dlsite.com/work/RJ000001/viewer' })).not.toHaveProperty('buttons')
    expect(render({ ...work, id: 'RJ000002' })).not.toHaveProperty('largeImageUrl')
  })

  it('uses the official language setting and preserves privacy and Display defaults', () => {
    const metadata = JSON.parse(readFileSync(new URL('../websites/D/DLsite Play/metadata.json', import.meta.url), 'utf8'))
    expect(metadata.settings).toMatchObject([{ id: 'lang', multiLanguage: true }, { id: 'privacyMode', value: false }, { id: 'displayType', value: 2, values: [expect.any(String), 'Track Title', 'Content Title'] }])
    expect(metadata.settings.some((setting: { id: string }) => setting.id === 'language')).toBe(false)
    expect(Object.keys(metadata.description).sort()).toEqual(['ja', 'en', 'zh', 'zh-tw', 'ko', 'es', 'de', 'fr', 'id', 'it', 'pt', 'sv', 'th', 'vi'].sort())
  })
})

describe('official translation cache', () => {
  it.each([
    ['en', 'View Page', 'Paused'],
    ['ja', 'ページを見る', '一時停止中'],
    ['zh', '浏览页面', '暂停中'],
    ['zh-tw', '查看頁面', '已暫停'],
    ['ko', '페이지 보기', '일시중지됨'],
    ['es', 'Ver página', 'Pausado'],
    ['de', 'Seite anzeigen', 'Pausiert'],
    ['fr', 'Voir la page', 'En pause'],
    ['id', 'Lihat Halaman', 'Dijeda'],
    ['it', 'Guarda la pagina', 'In pausa'],
    ['pt', 'Ver página', 'Em pausa'],
    ['sv', 'Visa sida', 'Pausad'],
    ['th', 'ดูหน้า', 'หยุดชั่วคราว'],
    ['vi', 'Xem trang', 'Tạm dừng'],
  ])('uses extension translations for %s without translating work metadata', async (language, viewWork, paused) => {
    const read = vi.fn(async () => ({ viewWork, paused }))
    const changed = vi.fn()
    const cache = new TranslationCache(read, changed)
    cache.refresh(language)
    await Promise.resolve()
    const data = buildContentPresence(work, { ...playing, paused: true }, false, 1000, cache.messages.viewWork, resolveDisplayType(2), cache.messages)!
    expect(data.buttons).toEqual([{ label: viewWork, url: work.workUrl }, { label: 'DLsite Play', url: 'https://play.dlsite.com/work/RJ000001' }])
    expect(data.smallImageText).toBe(paused)
    expect(data.details).toBe(work.trackTitle)
    expect(data.state).toBe(work.title)
    expect(data.largeImageText).toBe(work.circle)
  })

  it('refreshes Auto periodically without repeated requests on every playback update', async () => {
    vi.useFakeTimers()
    const read = vi.fn(async () => ({ viewWork: 'View Page', paused: 'Paused' }))
    const cache = new TranslationCache(read, vi.fn())
    cache.refresh(undefined)
    await vi.advanceTimersByTimeAsync(1)
    for (let count = 0; count < 100; count++)
      cache.refresh(undefined)
    expect(read).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(60000)
    read.mockResolvedValue({ viewWork: 'ページを見る', paused: '一時停止中' })
    cache.refresh(undefined)
    await vi.advanceTimersByTimeAsync(1)
    expect(read).toHaveBeenCalledTimes(2)
    expect(cache.messages.paused).toBe('一時停止中')
  })

  it('discards late translations from an earlier language or disposed instance', async () => {
    let resolve!: (messages: typeof defaultMessages) => void
    const read = vi.fn(() => new Promise<typeof defaultMessages>((done) => {
      resolve = done
    }))
    const changed = vi.fn()
    const cache = new TranslationCache(read, changed)
    cache.refresh('ja')
    const resolveJapanese = resolve
    cache.refresh('en')
    resolve({ viewWork: 'View Page', paused: 'Paused' })
    await Promise.resolve()
    resolveJapanese({ viewWork: 'ページを見る', paused: '一時停止中' })
    await Promise.resolve()
    expect(cache.messages).toEqual(defaultMessages)
    cache.refresh('fr')
    cache.dispose()
    resolve({ viewWork: 'Voir la page', paused: 'En pause' })
    await Promise.resolve()
    expect(cache.messages).toEqual(defaultMessages)
    expect(changed).not.toHaveBeenCalled()
  })

  it('retries a stalled translation request without blocking playback or accepting its late result', async () => {
    vi.useFakeTimers()
    let resolve!: (messages: typeof defaultMessages) => void
    const read = vi.fn(() => new Promise<typeof defaultMessages>((done) => {
      resolve = done
    }))
    const cache = new TranslationCache(read, vi.fn())
    cache.refresh('ja')
    const stale = resolve
    cache.refresh('ja')
    expect(read).toHaveBeenCalledOnce()
    expect(cache.messages).toEqual(defaultMessages)
    await vi.advanceTimersByTimeAsync(60000)
    cache.refresh('ja')
    expect(read).toHaveBeenCalledTimes(2)
    resolve({ viewWork: 'ページを見る', paused: '一時停止中' })
    await vi.advanceTimersByTimeAsync(1)
    stale({ viewWork: 'Stale label', paused: 'Stale pause' })
    await vi.advanceTimersByTimeAsync(1)
    expect(cache.messages.paused).toBe('一時停止中')
  })

  it('rejects untranslated keys, blank and overlong translations and retries after failure', async () => {
    vi.useFakeTimers()
    const read = vi.fn(async () => ({ ...stringKeys }))
    const cache = new TranslationCache(read, vi.fn())
    cache.refresh('en')
    await vi.advanceTimersByTimeAsync(1)
    expect(cache.messages).toEqual(defaultMessages)
    read.mockResolvedValue({ viewWork: 'x'.repeat(33), paused: ' ' })
    cache.refresh('fr')
    await vi.advanceTimersByTimeAsync(1)
    expect(cache.messages).toEqual(defaultMessages)
    read.mockRejectedValueOnce(new Error('Synthetic translation failure'))
    cache.refresh('ja')
    await vi.advanceTimersByTimeAsync(1)
    expect(cache.messages).toEqual(defaultMessages)
    await vi.advanceTimersByTimeAsync(60000)
    read.mockResolvedValue({ viewWork: 'ページを見る', paused: '一時停止中' })
    cache.refresh('ja')
    await vi.advanceTimersByTimeAsync(1)
    expect(cache.messages.paused).toBe('一時停止中')
  })
})
