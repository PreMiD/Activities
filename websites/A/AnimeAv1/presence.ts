import type { IFrameData } from './iframe.js'
import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1232573225108508672',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeAv1/assets/logo.png',
}

type CacheMode = 'off' | 'session' | 'persistent'
interface CachedMainAnimeData {
  title: string
  poster: string
  cachedAt: number
}

const CACHE_KEY_PREFIX = 'PMD_AnimeAv1_'
const BROWSING_FALLBACK_TITLE = 'AnimeAV1'
const browsingTimestamp = Math.floor(Date.now() / 1000)

let iframeData: IFrameData | undefined
let currentSlug: string | null = null
let lastCacheMode: CacheMode | null = null

const memoryCache = new Map<string, CachedMainAnimeData>()

function safeJsonParse<T>(value: string | null): T | null {
  if (!value)
    return null

  try {
    return JSON.parse(value) as T
  }
  catch {
    return null
  }
}

function getCacheKey(slug: string): string {
  return `${CACHE_KEY_PREFIX}mainAnime:${slug}`
}

function getCachedMainAnimeData(
  slug: string,
  mode: CacheMode,
  ttlMinutes: number,
): CachedMainAnimeData | null {
  const now = Date.now()
  const ttlMs = Math.max(0, ttlMinutes) * 60 * 1000
  const isExpired = (cachedAt: number) => ttlMs > 0 && now - cachedAt > ttlMs

  if (mode === 'off')
    return null

  if (mode === 'session') {
    const cached = memoryCache.get(slug)
    if (!cached)
      return null
    if (isExpired(cached.cachedAt)) {
      memoryCache.delete(slug)
      return null
    }
    return cached
  }

  const raw = localStorage.getItem(getCacheKey(slug))
  const cached = safeJsonParse<CachedMainAnimeData>(raw)
  if (!cached)
    return null

  if (
    typeof cached.title !== 'string'
    || typeof cached.poster !== 'string'
    || typeof cached.cachedAt !== 'number'
    || !Number.isFinite(cached.cachedAt)
  ) {
    localStorage.removeItem(getCacheKey(slug))
    return null
  }

  if (isExpired(cached.cachedAt)) {
    localStorage.removeItem(getCacheKey(slug))
    return null
  }

  return cached
}

function setCachedMainAnimeData(
  slug: string,
  mode: CacheMode,
  value: Omit<CachedMainAnimeData, 'cachedAt'>,
): void {
  const payload: CachedMainAnimeData = {
    ...value,
    cachedAt: Date.now(),
  }

  if (mode === 'off')
    return

  if (mode === 'session') {
    memoryCache.set(slug, payload)
    return
  }

  localStorage.setItem(getCacheKey(slug), JSON.stringify(payload))
}

function clearAllCaches(): void {
  memoryCache.clear()

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key?.startsWith(CACHE_KEY_PREFIX))
      localStorage.removeItem(key)
  }
}

function getSlug(): any {
  const m = document.location.pathname.match(/^\/media\/([^/]+)/)
  return m ? m[1] : null
}

function getEpisode(): string | null {
  const m = document.location.pathname.match(/\/media\/[^/]+\/(\d+)/)
  return m ? `Episodio ${m[1]}` : null
}

function getAnimeUrl(slug: string): string {
  return new URL(`/media/${slug}`, document.location.origin).toString()
}

function getEpisodeUrl(): string | null {
  return /\/media\/[^/]+\/\d+/.test(document.location.pathname)
    ? document.location.href
    : null
}

function isCatalogPage(): boolean {
  return /^\/catalogo\/?$/.test(document.location.pathname)
}

function getCatalogPageNumber(): number {
  const params = new URLSearchParams(document.location.search)
  const raw = params.get('page')
  const n = raw ? Number(raw) : 1
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1
}

function isMainAnimePage(): boolean {
  return /^\/media\/[^/]+\/?$/.test(document.location.pathname)
}

function getVideoElement(): HTMLVideoElement | null {
  return document.querySelector('video')
}

function isVideoPaused(): boolean {
  const video = getVideoElement()
  return video ? video.paused : false
}

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0)
    return '0:00'

  const seconds = Math.floor(totalSeconds % 60)
  const minutes = Math.floor((totalSeconds / 60) % 60)
  const hours = Math.floor(totalSeconds / 3600)
  const paddedSeconds = seconds.toString().padStart(2, '0')
  const paddedMinutes = hours > 0 ? minutes.toString().padStart(2, '0') : minutes.toString()
  return hours > 0
    ? `${hours}:${paddedMinutes}:${paddedSeconds}`
    : `${minutes}:${paddedSeconds}`
}

function isUsingUPNShare(): boolean {
  const iframeSrc = Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe'))
    .map(el => el.src || '')
    .join(' ')

  return /(?:^|\W)(?:animeav1\.uns\.bio|solariaarchitecture\.cyou)(?:\W|$)/i.test(iframeSrc)
}

function getMediaFromIframeOrPage(): { currentTime: number, duration?: number, paused: boolean } | null {
  if (iframeData) {
    const currentTime = iframeData.currentTime
    if (typeof currentTime === 'number' && Number.isFinite(currentTime)) {
      const duration = (typeof iframeData.duration === 'number' && Number.isFinite(iframeData.duration) && iframeData.duration > 0)
        ? iframeData.duration
        : undefined

      return {
        currentTime,
        duration,
        paused: typeof iframeData.paused === 'boolean' ? iframeData.paused : false,
      }
    }
  }

  const video = getVideoElement()
  if (!video)
    return null

  const currentTime = Number(video.currentTime)
  if (!Number.isFinite(currentTime))
    return null

  const duration = Number(video.duration)
  return {
    currentTime,
    duration: Number.isFinite(duration) && duration > 0 ? duration : undefined,
    paused: video.paused,
  }
}

async function readAnimePage(
  slug: string,
  cacheMode: CacheMode,
  cacheTtlMinutes: number,
): Promise<{ title: string, poster: string }> {
  const cached = getCachedMainAnimeData(slug, cacheMode, cacheTtlMinutes)
  if (cached)
    return { title: cached.title, poster: cached.poster }

  if (isMainAnimePage()) {
    const titleEl = document.querySelector('h1, h2')
    const title = titleEl?.textContent
      ?.replace(/^Ver\s+/i, '')
      .replace(/ Online Sub Español.*$/i, '')
      .trim() ?? document.title.replace(/\s+-\s+AnimeAV1/i, '').trim()

    const img = document.querySelector<HTMLImageElement>('img[src*="/covers/"]')
    const poster = img?.src ?? ActivityAssets.Logo

    setCachedMainAnimeData(slug, cacheMode, { title, poster })
    return { title, poster }
  }

  const mainPageData = await fetchMainAnimeData(slug)
  setCachedMainAnimeData(slug, cacheMode, mainPageData)
  return mainPageData
}

async function fetchMainAnimeData(slug: string): Promise<{ title: string, poster: string }> {
  try {
    const response = await fetch(`https://animeav1.com/media/${slug}`)
    const text = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/html')

    const img = doc.querySelector<HTMLImageElement>('img[src*="/covers/"]')
    const poster = img?.src ?? ActivityAssets.Logo

    const titleEl = doc.querySelector('h1, h2')
    const title = titleEl?.textContent
      ?.replace(/^Ver\s+/i, '')
      .replace(/ Online Sub Español.*$/i, '')
      .trim() ?? 'AnimeAV1'

    return { title, poster }
  }
  catch (err) {
    console.error('Error fetching main anime page:', err)
    return { title: 'AnimeAV1', poster: ActivityAssets.Logo }
  }
}

presence.on('UpdateData', async () => {
  const slug = getSlug() as string | null

  const showProgress = await presence.getSetting<boolean>('showProgress')
  const cacheMode = await presence.getSetting<CacheMode>('cacheMode')
  const cacheTtlMinutes = await presence.getSetting<number>('cacheTtlMinutes')

  if (cacheMode === 'off' && lastCacheMode !== 'off')
    clearAllCaches()
  lastCacheMode = cacheMode

  if (!slug) {
    if (isCatalogPage()) {
      const page = getCatalogPageNumber()

      const presenceData: PresenceData = {
        type: ActivityType.Watching,
        details: 'Explorando el catálogo',
        state: `Página ${page}`,
        largeImageKey: ActivityAssets.Logo,
        largeImageText: BROWSING_FALLBACK_TITLE,
        smallImageKey: Assets.Search,
        smallImageText: 'Explorando el catálogo',
        startTimestamp: browsingTimestamp,
      }

      currentSlug = null
      return presence.setActivity(presenceData)
    }

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      details: 'Navegando',
      state: 'Buscando qué anime ver...',
      largeImageKey: ActivityAssets.Logo,
      largeImageText: BROWSING_FALLBACK_TITLE,
      smallImageKey: Assets.Search,
      smallImageText: 'Explorando el catálogo',
      startTimestamp: browsingTimestamp,
    }

    currentSlug = null
    return presence.setActivity(presenceData)
  }

  if (currentSlug !== slug) {
    currentSlug = slug
  }

  const { title, poster } = await readAnimePage(slug, cacheMode, cacheTtlMinutes)

  const episode = getEpisode()
  const media = getMediaFromIframeOrPage()
  const videoPaused = media?.paused ?? isVideoPaused()
  const isUpnShare = isUsingUPNShare()
  const hasDuration = typeof media?.duration === 'number' && Number.isFinite(media.duration) && media.duration > 0
  const animeUrl = getAnimeUrl(slug)
  const episodeUrl = getEpisodeUrl()

  let stateText: string
  let smallIcon: string
  let smallIconText: string

  if (isMainAnimePage()) {
    stateText = 'Buscando episodio...'
    smallIcon = Assets.Search
    smallIconText = 'Explorando'
  }
  else if (media) {
    stateText = episode ?? 'Viendo'
    smallIcon = videoPaused ? Assets.Pause : Assets.Play
    smallIconText = videoPaused ? 'En pausa' : 'Reproduciendo'
  }
  else {
    stateText = episode ?? 'Viendo'
    smallIcon = Assets.Play
    smallIconText = 'Viendo'
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    details: title || BROWSING_FALLBACK_TITLE,
    state: stateText,
    largeImageKey: poster || ActivityAssets.Logo,
    largeImageText: title || BROWSING_FALLBACK_TITLE,
    smallImageKey: smallIcon,
    smallImageText: smallIconText,
  }

  presenceData.largeImageUrl = animeUrl
  if (episodeUrl) {
    presenceData.stateUrl = episodeUrl
    presenceData.smallImageUrl = episodeUrl
  }

  if (!isMainAnimePage() && episode && media && showProgress) {
    if (hasDuration) {
      const totalDuration = media.duration as number

      if (!videoPaused) {
        const [startTimestamp, endTimestamp] = getTimestamps(
          Math.floor(media.currentTime),
          Math.floor(totalDuration),
        )
        if (startTimestamp !== endTimestamp) {
          presenceData.startTimestamp = startTimestamp
          presenceData.endTimestamp = endTimestamp
        }
      }
    }
    else if (isUpnShare) {
      presenceData.smallImageText = episode
        ? `${episode} • ${formatTime(media.currentTime)}`
        : `${smallIconText} • ${formatTime(media.currentTime)}`
    }
  }

  return presence.setActivity(presenceData)
})

presence.on('iFrameData', async (receivedData) => {
  iframeData = receivedData as IFrameData
})

export default presence
