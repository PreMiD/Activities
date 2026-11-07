import type { PlaybackInfo, SiteSnapshot, WorkInfo } from './activity.js'
import { timestampFromFormat } from 'premid'
import { getViewerWorkId, resolveArtworkUrl, resolveCanonicalWorkUrl, resolveContentCategory, resolveContentRating } from './activity.js'

interface RawWork {
  id: string
  workType?: string
  age?: string
  title?: string
  trackTitle?: string
  circle?: string
  image?: string
  siteId?: string
  inservice?: number
}

export interface RawSnapshot {
  work: RawWork | null
  playback: PlaybackInfo | null
  retryAfter?: number
  refreshAfter?: number
  stale?: boolean
}

export interface PageWork {
  workno?: string
  work_type?: string
  age?: string
  name?: string | Record<string, string>
  maker?: { name?: string | Record<string, string> }
  original_maker?: { name?: string | Record<string, string> }
  is_community_translation?: boolean
  images?: { thumb?: string, main?: string }
  site_id?: string
  inservice?: number
  recommendable?: boolean
}

// CSS Module component names verified in _layout-B6obj8pg and viewer.B1TJU9ag.
// Match complete class-name prefixes, without depending on build hashes.
export const selectors = {
  audio: 'div[class^="_audioPlayer_"], div[class*=" _audioPlayer_"]',
  mini: 'div[class^="_miniPlayer_"], div[class*=" _miniPlayer_"]',
  album: '[class^="_album_"], [class*=" _album_"]',
  trackTitle: '[class^="_titleInner_"], [class*=" _titleInner_"]',
  playPause: 'button[class^="_playPause_"] svg path, button[class*=" _playPause_"] svg path',
  playPauseButton: 'button[class^="_playPause_"], button[class*=" _playPause_"]',
  time: '[class^="_time_"] [role="slider"], [class*=" _time_"] [role="slider"]',
  timeContainer: '[class^="_time_"], [class*=" _time_"]',
  seekControls: '[class^="_time_"], [class*=" _time_"], [class^="_seekBackwardButton_"], [class*=" _seekBackwardButton_"], [class^="_seekForwardButton_"], [class*=" _seekForwardButton_"]',
  elapsed: '[class^="_elapsedTime_"], [class*=" _elapsedTime_"]',
  remaining: '[class^="_remainingTime_"], [class*=" _remainingTime_"]',
  miniProgress: '[class^="_duration_"], [class*=" _duration_"]',
  video: 'div[class^="_videoPlayer_"] > video, div[class*=" _videoPlayer_"] > video',
}

const pausePath = 'M28 100H0V0h28ZM77 0H49v100h28Z'
const playPath = 'm0 0 80 50-80 50Z'

function getAudioRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(selectors.audio) ?? document.querySelector<HTMLElement>(selectors.mini)
}

function getVideoRoot(): HTMLVideoElement | null {
  if (!getViewerWorkId(document.location.pathname))
    return null
  const videos = document.querySelectorAll<HTMLVideoElement>(selectors.video)
  return videos.length === 1 ? videos[0]! : null
}

function parseTime(value: string | null | undefined): number | null {
  const text = value?.trim()
  if (!text || !/^\d+(?::[0-5]\d){1,2}$/.test(text))
    return null
  // Preserve minute-only labels longer than an hour while using the native
  // converter, which expects minutes below 60 when parsing MM:SS.
  const parts = text.split(':')
  const minutes = parts.length === 2 ? Number(parts[0]) : 0
  if (!Number.isSafeInteger(minutes))
    return null
  const format = minutes >= 60
    ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${parts[1]}`
    : text
  const seconds = timestampFromFormat(format)
  return Number.isFinite(seconds) ? seconds : null
}

function workName(value: unknown): string | null {
  if (typeof value === 'string')
    return value.trim() || null
  if (value && typeof value === 'object') {
    const names = value as Record<string, unknown>
    const name = names.ja_JP || names.en_US
    return typeof name === 'string' ? name.trim() || null : null
  }
  return null
}

function matchesAlbum(work: PageWork, album: string): boolean {
  if (!album)
    return false
  const names = typeof work.name === 'object' && work.name ? Object.values(work.name) : [work.name]
  return names.some(name => typeof name === 'string' && name.trim() === album)
}

function extractWork(id: string, candidates: PageWork[], privacyMode: boolean): RawWork {
  const matching = candidates.filter(work => work.workno === id)
  const work = matching.find(work => work.age === 'r18') ?? matching.find(work => work.age === 'r15')
    ?? matching.find(work => work.age === 'all') ?? matching[0]
  const result: RawWork = { id }
  if (typeof work?.work_type === 'string')
    result.workType = work.work_type
  if (typeof work?.age === 'string')
    result.age = work.age
  if (!work || work.age !== 'all' || privacyMode || resolveContentCategory(work.work_type) === 'unknown')
    return result
  const title = workName(work.name)
  const maker = work.original_maker ?? work.maker
  const circle = id.startsWith('RJ') && (!work.is_community_translation || work.original_maker) ? workName(maker?.name) : null
  if (title)
    result.title = title
  if (circle)
    result.circle = circle
  const image = work.images?.thumb || work.images?.main
  if (typeof image === 'string')
    result.image = image
  if (typeof work.site_id === 'string')
    result.siteId = work.site_id
  if ('recommendable' in work)
    result.inservice = Number(work.recommendable === true)
  else if (typeof work.inservice === 'number')
    result.inservice = work.inservice
  return result
}

/** Read one key through a readonly transaction in an existing, unambiguous DB. */
async function readStoredRecord<T extends { workno?: string }>(store: string, id: string): Promise<T | null> {
  if (typeof indexedDB === 'undefined' || typeof indexedDB.databases !== 'function')
    return null
  // The public client creates Play_<account>202205. No session/token reads.
  const names = (await indexedDB.databases()).flatMap(database =>
    database.name && /^Play_[^/]+202205$/.test(database.name) ? [database.name] : [])
  if (names.length !== 1)
    return null
  return new Promise((resolve) => {
    let finished = false
    let database: IDBDatabase | null = null
    let timeout: ReturnType<typeof setTimeout> | null = null
    const finish = (work: T | null) => {
      if (finished)
        return
      finished = true
      if (timeout !== null)
        clearTimeout(timeout)
      database?.close()
      resolve(work)
    }
    timeout = setTimeout(finish, 2000, null)
    const request = indexedDB.open(names[0]!)
    // Abort if the database disappeared after enumeration. Never create/upgrade it.
    request.onupgradeneeded = () => {
      request.transaction?.abort()
    }
    request.onerror = () => finish(null)
    request.onblocked = () => finish(null)
    request.onsuccess = () => {
      database = request.result
      if (finished) {
        database.close()
        return
      }
      if (!database.objectStoreNames.contains(store)) {
        finish(null)
        return
      }
      try {
        const transaction = database.transaction(store, 'readonly')
        const record = transaction.objectStore(store).get(id)
        record.onsuccess = () => finish(record.result?.workno === id ? record.result : null)
        record.onerror = () => finish(null)
        transaction.onabort = () => finish(null)
      }
      catch {
        finish(null)
      }
    }
  })
}

export function readStoredWork(id: string): Promise<PageWork | null> {
  return readStoredRecord<PageWork>('Purchase', id)
}

export async function readStoredTrackTitles(id: string): Promise<ReadonlySet<string> | null> {
  // The native player resolves mediaTitle from Ziptree.tree[].name, removing
  // the extension. Only inspect this one confirmed general work's local record.
  const record = await readStoredRecord<{ workno?: string, json?: string }>('Ziptree', id)
  if (typeof record?.json !== 'string' || record.json.length > 2000000)
    return null
  try {
    const tree = JSON.parse(record.json)
    if (tree?.workno !== id || !Array.isArray(tree.tree) || !tree.playfile || typeof tree.playfile !== 'object')
      return null
    const titles = new Set<string>()
    const pending = [...tree.tree]
    while (pending.length) {
      const file = pending.pop()
      if (!file || typeof file !== 'object')
        continue
      if (file.type === 'folder' && Array.isArray(file.children)) {
        for (const child of file.children)
          pending.push(child)
      }
      else if (file.type === 'file' && typeof file.name === 'string' && typeof file.hashname === 'string'
        && Object.hasOwn(tree.playfile, file.hashname) && tree.playfile[file.hashname]?.type === 'audio') {
        titles.add(file.name.replace(/\.[a-z0-9]+$/i, '').trim())
      }
    }
    return titles
  }
  catch {
    return null
  }
}

type ObservedRequest = Pick<InterceptedRequest, 'url' | 'method' | 'ok' | 'responseBody' | 'timestamp'>

export class DlsiteReader {
  onPlaybackChange?: (paused: boolean | null) => void
  onIdentityChange?: () => void
  onTimelineChange?: () => void
  issue: 'audio-work-unresolved' | 'metadata-unavailable' | null = null
  progressState = 'not-read'
  private signedWork: { id: string, timestamp: number } | null = null
  private metadata = new Map<string, PageWork>()
  private lastProgress: { key: string, playback: PlaybackInfo } | null = null
  private trackDuration: { key: string, duration: number } | null = null
  private verifiedAudio: { album: string, identity: string, signingHint?: string, work: RawWork } | null = null
  private discoverAudioUntil = 0
  private controls: Element | null = null
  private controlsObserver: MutationObserver | null = null
  private video: HTMLVideoElement | null = null
  private observedPaused: boolean | null = null
  private missingAudioSince: number | null = null
  private identityRoot: HTMLElement | null = null
  private identityObserver: MutationObserver | null = null
  private observedIdentity = ''
  private revision = 0
  private readGeneration = 0
  private restricted = new Map<string, PageWork>()
  private tracks = new Map<string, { titles: ReadonlySet<string>, checkedAt: number }>()
  private mountObserver: MutationObserver | null = null
  private mountedAudio: HTMLElement | null = null
  private mountedVideo: HTMLVideoElement | null = null
  private timelineObserver: MutationObserver | null = null
  private timelineTimer: ReturnType<typeof setTimeout> | null = null
  private timelineRoot: Element | null = null

  constructor(private readWork = readStoredWork, private readTracks = readStoredTrackTitles) {}

  isR18(id: string): boolean {
    return this.restricted.get(id)?.age === 'r18'
  }

  invalidate() {
    ++this.revision
    ++this.readGeneration
  }

  private rememberWork(work: PageWork) {
    const id = work.workno
    if (!id)
      return
    if (work.age === 'r18' || (work.age === 'r15' && !this.isR18(id))) {
      this.restricted.set(id, { workno: id, age: work.age, work_type: work.work_type })
      this.tracks.delete(id)
    }
    const safe = this.restricted.get(id) ?? (work.age === 'all'
      ? {
          workno: id,
          age: work.age,
          work_type: work.work_type,
          name: work.name,
          maker: work.maker,
          original_maker: work.original_maker,
          is_community_translation: work.is_community_translation,
          images: work.images,
          site_id: work.site_id,
          inservice: work.inservice,
          ...('recommendable' in work ? { recommendable: work.recommendable } : {}),
        }
      : { workno: id, age: work.age, work_type: work.work_type })
    this.metadata.set(id, safe)
    if (this.metadata.size > 8)
      this.metadata.delete(this.metadata.keys().next().value!)
  }

  private audioIdentity() {
    const audio = getAudioRoot()
    return `${audio?.querySelector(selectors.album)?.textContent?.trim() ?? ''}\n${audio?.querySelector(selectors.trackTitle)?.textContent?.trim() ?? ''}`
  }

  getContextKey(): string {
    const viewer = getViewerWorkId(document.location.pathname)
    return viewer ? `viewer:${viewer}` : `audio:${this.audioIdentity()}`
  }

  isBrowsing(): boolean {
    return !getAudioRoot() && !getViewerWorkId(document.location.pathname)
  }

  getReadKey(): string {
    return `${this.revision}:${this.getContextKey()}:${this.getPlaybackPaused()}`
  }

  getLifecycleDiagnostic(): string {
    const audio = getAudioRoot()
    const album = audio?.querySelector(selectors.album)?.textContent?.trim() ?? ''
    const track = audio?.querySelector(selectors.trackTitle)?.textContent?.trim() ?? ''
    const previous = this.verifiedAudio
    const match = (value: string, known: string | undefined) => !value ? 'empty' : value === known ? 'same' : 'different'
    const grace = this.missingAudioSince === null ? 'none' : Date.now() - this.missingAudioSince < 1000 ? 'active' : 'expired'
    return `audio=${Boolean(audio)}; album=${match(album, previous?.album)}; track=${match(track, previous?.identity.split('\n')[1])}; viewer=${Boolean(getViewerWorkId(document.location.pathname))}; grace=${grace}; issue=${this.issue ?? 'none'}`
  }

  private notifyTimelineChange = () => {
    if (!this.onTimelineChange || this.timelineTimer !== null)
      return
    // Coalesce slider/label mutations and wait for the native seek commit.
    this.timelineTimer = setTimeout(() => {
      this.timelineTimer = null
      this.onTimelineChange?.()
    }, 100)
  }

  private notifySeekCommit = (event: Event) => {
    const target = event.target as Element | null
    if (target?.closest?.(selectors.seekControls)) {
      this.lastProgress = null
      this.notifyTimelineChange()
    }
  }

  private watchMounts() {
    if (this.mountObserver || typeof MutationObserver === 'undefined' || !document.body)
      return
    this.mountedAudio = getAudioRoot()
    this.mountedVideo = getVideoRoot()
    this.mountObserver = new MutationObserver(() => {
      const audio = getAudioRoot()
      const video = getVideoRoot()
      if (audio === this.mountedAudio && video === this.mountedVideo)
        return
      this.mountedAudio = audio
      this.mountedVideo = video
      this.onIdentityChange?.()
    })
    // Only element insertion/removal: clock text and attributes are excluded.
    this.mountObserver.observe(document.body, { childList: true, subtree: true })
  }

  private notifyIdentityChange = () => {
    const identity = this.audioIdentity()
    if (identity !== this.observedIdentity) {
      this.observedIdentity = identity
      ++this.revision
      this.onIdentityChange?.()
    }
  }

  getPlaybackPaused(): boolean | null {
    const video = getVideoRoot()
    if (video)
      return video.paused || video.ended
    const icon = getAudioRoot()?.querySelector(selectors.playPause)?.getAttribute('d')
    return icon === playPath ? true : icon === pausePath ? false : null
  }

  private notifyPlaybackChange = () => {
    const paused = this.getPlaybackPaused()
    if (paused !== this.observedPaused) {
      this.observedPaused = paused
      this.onPlaybackChange?.(paused)
    }
  }

  disconnectPlaybackObserver() {
    this.mountObserver?.disconnect()
    this.mountObserver = null
    this.disconnectPlayerObservers()
  }

  private disconnectPlayerObservers() {
    this.controlsObserver?.disconnect()
    this.controlsObserver = null
    this.controls = null
    this.identityObserver?.disconnect()
    this.identityObserver = null
    for (const event of ['pointerup', 'keyup'])
      this.identityRoot?.removeEventListener?.(event, this.notifySeekCommit)
    this.identityRoot = null
    this.timelineObserver?.disconnect()
    this.timelineObserver = null
    this.timelineRoot = null
    if (this.timelineTimer !== null)
      clearTimeout(this.timelineTimer)
    this.timelineTimer = null
    for (const event of ['pause', 'play', 'ended'])
      this.video?.removeEventListener(event, this.notifyPlaybackChange)
    for (const event of ['seeking', 'seeked', 'ratechange', 'durationchange', 'loadedmetadata'])
      this.video?.removeEventListener(event, this.notifyTimelineChange)
    this.video = null
  }

  private watchPlayback() {
    this.watchMounts()
    const audio = getAudioRoot()
    const controls = audio?.querySelector(selectors.playPauseButton) ?? null
    const video = getVideoRoot()
    const timeline = audio?.querySelector(selectors.timeContainer) ?? audio?.querySelector(selectors.miniProgress) ?? null
    if (controls === this.controls && video === this.video && audio === this.identityRoot && timeline === this.timelineRoot)
      return
    this.disconnectPlayerObservers()
    this.controls = controls
    this.video = video
    this.observedPaused = this.getPlaybackPaused()
    this.identityRoot = audio
    this.timelineRoot = timeline
    this.observedIdentity = this.audioIdentity()
    if (audio && typeof MutationObserver !== 'undefined') {
      this.identityObserver = new MutationObserver(this.notifyIdentityChange)
      this.identityObserver.observe(audio, { childList: true, subtree: true, characterData: true })
    }
    if (timeline && typeof MutationObserver !== 'undefined') {
      this.timelineObserver = new MutationObserver(this.notifyTimelineChange)
      this.timelineObserver.observe(timeline, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-valuenow', 'aria-valuemax', 'style'] })
    }
    for (const event of ['pointerup', 'keyup'])
      audio?.addEventListener?.(event, this.notifySeekCommit)
    // Observe only the native button, not the player clock or the whole page.
    if (controls && typeof MutationObserver !== 'undefined') {
      this.controlsObserver = new MutationObserver(this.notifyPlaybackChange)
      this.controlsObserver.observe(controls, { childList: true, subtree: true, attributes: true, attributeFilter: ['d'] })
    }
    for (const event of ['pause', 'play', 'ended'])
      video?.addEventListener(event, this.notifyPlaybackChange)
    for (const event of ['seeking', 'seeked', 'ratechange', 'durationchange', 'loadedmetadata'])
      video?.addEventListener(event, this.notifyTimelineChange)
  }

  observeRequest(request: ObservedRequest): boolean {
    if (!request.ok || request.method.toUpperCase() !== 'GET')
      return false
    let url: URL
    try {
      url = new URL(request.url, 'https://play.dlsite.com')
    }
    catch {
      return false
    }
    if (url.origin !== 'https://play.dlsite.com')
      return false
    if (url.pathname === '/api/v4/download/sign/url') {
      const id = url.searchParams.get('workno')
      // Only the work identity is read. Never inspect/store signed response URLs.
      if (id && /^[A-Z]{2}\d+$/.test(id) && (!this.signedWork || request.timestamp >= this.signedWork.timestamp)) {
        this.signedWork = { id, timestamp: request.timestamp }
        this.discoverAudioUntil = Date.now() + 3000
        ++this.revision
        return true
      }
      return false
    }
    const id = url.pathname.match(/^\/api\/(?:v4\/work|viewer\/work)\/([A-Z]{2}\d+)$/)?.[1]
    if (!id || !request.responseBody)
      return false
    try {
      const work: PageWork = JSON.parse(request.responseBody)
      if (work.workno !== id)
        return false
      const relevant = id === this.signedWork?.id || id === this.verifiedAudio?.work.id
        || id === getViewerWorkId(document.location.pathname) || matchesAlbum(work, getAudioRoot()?.querySelector(selectors.album)?.textContent?.trim() ?? '')
      this.rememberWork(work)
      if (relevant)
        ++this.revision
      return relevant
    }
    catch {
      // Ignore non-JSON responses; no response bodies or exception objects in logs.
    }
    return false
  }

  audioContinuity(id?: string): 'same' | 'transient' | 'invalid' {
    const previous = this.verifiedAudio
    if (!previous || (id && previous.work.id !== id))
      return 'invalid'
    const metadata = this.metadata.get(previous.work.id)
    if (this.restricted.has(previous.work.id) || (metadata && metadata.age !== 'all'))
      return 'invalid'
    const viewerId = getViewerWorkId(document.location.pathname)
    if (viewerId)
      return 'invalid'
    const identity = this.audioIdentity()
    if (identity === previous.identity) {
      this.missingAudioSince = null
      return 'same'
    }
    const [album, track] = identity.split('\n')
    const [, previousTrack] = previous.identity.split('\n')
    // Missing DOM is not a new media selection. Keep only the already sent
    // public payload briefly; any positive mismatch revokes it immediately.
    if ((album && album !== previous.album) || (track && track !== previousTrack)
      || this.signedWork?.id !== previous.signingHint) {
      return 'invalid'
    }
    this.missingAudioSince ??= Date.now()
    return Date.now() - this.missingAudioSince < 1000 ? 'transient' : 'invalid'
  }

  canKeepAudioPresence(id?: string): boolean {
    return this.audioContinuity(id) === 'same'
  }

  private retryAudioTransition(): RawSnapshot {
    if (this.verifiedAudio) {
      this.missingAudioSince ??= Date.now()
      const remaining = 1000 - (Date.now() - this.missingAudioSince)
      if (remaining > 0)
        return { work: null, playback: null, retryAfter: Math.min(200, remaining) }
    }
    if (getAudioRoot())
      return { work: null, playback: null, retryAfter: 1000 }
    return { work: null, playback: null }
  }

  async read(privacyMode: boolean): Promise<RawSnapshot> {
    const generation = ++this.readGeneration
    const revision = this.revision
    this.watchPlayback()
    this.issue = null
    this.progressState = 'not-read'
    const context = this.getContextKey()
    const viewerId = getViewerWorkId(document.location.pathname)
    let audio = getAudioRoot()
    if (audio)
      this.discoverAudioUntil = 0
    if (this.audioContinuity() === 'transient')
      return this.retryAudioTransition()
    // Recheck transient absence without awaiting timers inside UpdateData.
    // The same bounded grace also covers replacement during an IndexedDB read.
    if (!audio && this.verifiedAudio && !viewerId) {
      const pending = this.retryAudioTransition()
      if (pending.retryAfter !== undefined)
        return pending
    }
    const album = audio?.querySelector(selectors.album)?.textContent?.trim() ?? ''
    const identity = this.audioIdentity()
    const routeId = document.location.pathname.match(/^\/(?:dllibrary\/)?work\/([^/]+)(?:\/|$)/)?.[1]
    const previous = this.verifiedAudio
    const retainedId = previous?.album === album ? previous.work.id : null
    // Signed URLs are cached by the site. Returning to a known work may not
    // produce another signing request; bind using uniquely matched metadata.
    const matching = [...this.metadata.values()].filter(work => work.age === 'all' && matchesAlbum(work, album))
    const cachedId = matching.length === 1 ? matching[0]!.workno : null
    const audioId = cachedId ?? retainedId ?? routeId ?? this.signedWork?.id
    let id = viewerId ?? (audio ? audioId : null)
    if (!audio) {
      // Signing can finish before the player mounts. Keep its ID as a hint;
      // album and track membership must still independently authorize sharing.
      this.lastProgress = null
      this.trackDuration = null
      this.verifiedAudio = null
      this.missingAudioSince = null
    }
    if (!id) {
      if (audio) {
        this.issue = 'audio-work-unresolved'
        return this.retryAudioTransition()
      }
      return { work: null, playback: null, ...(Date.now() < this.discoverAudioUntil ? { refreshAfter: 200 } : {}) }
    }
    let stored: PageWork | null = null
    try {
      stored = await this.readWork(id)
    }
    catch {
      this.issue = 'metadata-unavailable'
    }
    if (generation !== this.readGeneration || revision !== this.revision || context !== this.getContextKey())
      return { work: null, playback: null, stale: true }
    if (stored?.workno === id)
      this.rememberWork(stored)
    // A folder route is only a hint. A playlist can start a different work
    // without navigating away; conversely an old signing hint can be stale.
    // Try the other observed ID only when the first has no matching album.
    const alternateId = this.signedWork?.id
    if (!viewerId && audio && ![stored, this.metadata.get(id)].some(work => work && matchesAlbum(work, album))
      && !(previous?.work.id === id && previous.album === album)
      && alternateId && alternateId !== id) {
      id = alternateId
      stored = null
      try {
        stored = await this.readWork(id)
      }
      catch {
        this.issue = 'metadata-unavailable'
      }
      if (generation !== this.readGeneration || revision !== this.revision || context !== this.getContextKey())
        return { work: null, playback: null, stale: true }
      if (stored?.workno === id)
        this.rememberWork(stored)
    }
    const candidates = [stored, this.metadata.get(id), this.restricted.get(id)].filter((work): work is PageWork => work?.workno === id)
    // Re-read after IndexedDB completes: switching full/mini DOM nodes is not
    // a work change. A changed album or signing identity still invalidates it.
    if (!viewerId) {
      audio = getAudioRoot()
      if (!audio)
        return this.retryAudioTransition()
      const currentAlbum = audio.querySelector(selectors.album)?.textContent?.trim() ?? ''
      if (currentAlbum !== album) {
        this.issue = 'audio-work-unresolved'
        if (previous)
          return this.retryAudioTransition()
        return { work: { id }, playback: null }
      }
    }
    // Audio UI survives navigation. Bind it using its own request identity and
    // album text, rather than assuming the work currently browsed is playing.
    const boundPrivateWork = this.signedWork?.id === id && candidates.some(work => work.age !== 'all')
    const sameVerifiedWork = previous?.work.id === id && previous.album === album
    if (!viewerId && (!audio || (!boundPrivateWork && !sameVerifiedWork && !candidates.some(work => matchesAlbum(work, album))))) {
      this.issue = 'audio-work-unresolved'
      return this.retryAudioTransition()
    }
    const raw = candidates.length || !sameVerifiedWork
      ? extractWork(id, candidates, privacyMode)
      : { ...previous.work }
    // Missing metadata must hide details, but does not invalidate a category
    // already verified for this exact work and album.
    if (!raw.workType && sameVerifiedWork)
      raw.workType = previous.work.workType
    // Never reuse a previous track title; the live player owns this field.
    delete raw.trackTitle
    if (privacyMode) {
      delete raw.title
      delete raw.circle
      delete raw.image
      delete raw.siteId
      delete raw.inservice
    }
    if (!candidates.length)
      this.issue = 'metadata-unavailable'
    let playback: PlaybackInfo | null = null
    if (raw.age === 'all' && !privacyMode) {
      if (!viewerId && audio && ['SOU', 'MUS'].includes(raw.workType ?? '')) {
        const trackTitle = audio.querySelector(selectors.trackTitle)?.textContent?.trim()
        const cachedTracks = this.tracks.get(id)
        let titles = cachedTracks?.titles
        if (!titles || (trackTitle && !titles.has(trackTitle) && Date.now() - cachedTracks!.checkedAt >= 1000)) {
          try {
            titles = await this.readTracks(id) ?? undefined
          }
          catch { /* Missing local evidence must never authorize a track title. */ }
          if (generation !== this.readGeneration || revision !== this.revision || context !== this.getContextKey())
            return { work: null, playback: null, stale: true }
          if (titles) {
            this.tracks.set(id, { titles, checkedAt: Date.now() })
            if (this.tracks.size > 8)
              this.tracks.delete(this.tracks.keys().next().value!)
          }
        }
        // The player can expose the next track while its old album is still
        // visible. Only the confirmed general work's own file tree authorizes it.
        if (!trackTitle || !titles?.has(trackTitle)) {
          this.issue = 'audio-work-unresolved'
          return { work: null, playback: null, retryAfter: titles ? 200 : 1000 }
        }
        if (trackTitle)
          raw.trackTitle = trackTitle
      }
      if (!viewerId && audio && ['SOU', 'MUS', 'MOV'].includes(raw.workType ?? '')) {
        playback = this.readAudioProgress(id, audio, raw.trackTitle ?? '')
      }
      else if (viewerId && raw.workType === 'MOV') {
        const videos = document.querySelectorAll<HTMLVideoElement>(selectors.video)
        const video = videos.length === 1 ? videos[0] : null
        if (video) {
          playback = {
            currentTime: video.currentTime,
            duration: video.duration,
            paused: video.paused,
            ended: video.ended,
            seeking: video.seeking,
            readyState: video.readyState,
            playbackRate: video.playbackRate,
          }
        }
      }
    }
    if (context !== this.getContextKey())
      return { work: null, playback: null, stale: true }
    if (!viewerId && identity !== this.audioIdentity()) {
      return this.retryAudioTransition()
    }
    if (!viewerId && album && raw.age === 'all')
      this.verifiedAudio = { album, identity, signingHint: this.signedWork?.id, work: { ...raw } }
    this.missingAudioSince = null
    this.watchPlayback()
    return { work: raw, playback }
  }

  private readAudioProgress(id: string, audio: HTMLElement, track: string): PlaybackInfo | null {
    this.progressState = 'slider'
    const slider = audio.querySelector<HTMLElement>(selectors.time)
    const icon = audio.querySelector(selectors.playPause)?.getAttribute('d')
    if (icon !== playPath && icon !== pausePath) {
      this.progressState = 'controls-unavailable'
      return null
    }
    const key = `${id}\n${track}`
    const previous = track && this.lastProgress?.key === key ? this.lastProgress.playback : null
    const position = slider?.getAttribute('aria-valuenow')
    const maximum = slider?.getAttribute('aria-valuemax')
    let currentTime = position == null ? Number.NaN : Number(position)
    let duration = maximum == null ? Number.NaN : Number(maximum)
    // Verified adjacent time labels are available even when the UI library
    // does not expose the values on its slider thumb.
    if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) {
      const elapsed = parseTime(audio.querySelector(selectors.elapsed)?.textContent)
      const remaining = parseTime(audio.querySelector(selectors.remaining)?.textContent)
      if (elapsed !== null)
        currentTime = elapsed
      if (elapsed !== null && remaining !== null) {
        this.progressState = 'time-labels'
        currentTime = elapsed
        duration = elapsed + remaining
      }
    }
    if ((!Number.isFinite(duration) || duration <= 0) && track && this.trackDuration?.key === key) {
      const transform = audio.querySelector<HTMLElement>(selectors.miniProgress)?.style.transform
      const match = transform?.match(/^scaleX\(([\d.eE+-]+)\)$/)
      const ratio = match ? Number(match[1]) : Number.NaN
      if (Number.isFinite(ratio) && ratio >= 0 && ratio <= 1) {
        this.progressState = 'mini-ratio'
        duration = this.trackDuration.duration
        currentTime = ratio * duration
      }
      else if (Number.isFinite(currentTime)) {
        this.progressState = 'elapsed-with-known-duration'
        duration = this.trackDuration.duration
      }
    }
    if (!Number.isFinite(currentTime) || currentTime < 0 || !Number.isFinite(duration) || duration <= 0) {
      this.progressState = 'time-unavailable'
      return null
    }
    if (track)
      this.trackDuration = { key, duration }
    let playbackRate = Number.NaN
    try {
      // The native player writes this value whenever its speed changes.
      playbackRate = Number(localStorage.getItem('playbackSpeed') ?? '1')
    }
    catch {
      return null
    }
    const paused = icon === playPath
    const seeking = Boolean(slider?.matches(':active') || slider?.querySelector(':active'))
    const sampledAt = previous && previous.currentTime === currentTime
      && previous.duration === duration && previous.playbackRate === playbackRate
      && previous.paused === paused && previous.seeking === seeking
      ? previous.sampledAt ?? Date.now()
      : Date.now()
    const playback: PlaybackInfo = {
      currentTime,
      duration,
      paused,
      ended: currentTime >= duration,
      seeking,
      // Lack of a DOM update is not evidence that the native audio is buffering.
      readyState: 3,
      playbackRate,
      sampledAt,
    }
    this.lastProgress = { key, playback }
    return playback
  }
}

export function normalizeSnapshot(snapshot: RawSnapshot, privacyMode: boolean): SiteSnapshot {
  const raw = snapshot.work
  if (!raw)
    return { work: null, playback: null }
  const work: WorkInfo = {
    id: raw.id,
    category: resolveContentCategory(raw.workType),
    rating: resolveContentRating(raw.age),
  }
  if (privacyMode || work.rating !== 'general' || work.category === 'unknown')
    return { work, playback: null }
  if (raw.title)
    work.title = raw.title
  if (raw.trackTitle)
    work.trackTitle = raw.trackTitle
  if (raw.circle)
    work.circle = raw.circle
  const image = resolveArtworkUrl(raw.image)
  const link = resolveCanonicalWorkUrl(raw.id, raw.siteId, raw.inservice)
  if (image)
    work.artworkUrl = image
  if (link)
    work.workUrl = link
  return { work, playback: snapshot.playback }
}
