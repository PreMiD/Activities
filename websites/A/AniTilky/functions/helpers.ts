import type { Anime, AnimeEpisode, AnimeSeason } from '../types.js'

export const BASE_URL = 'https://anitilky.com'
export const API_URL = 'https://api.anitilky.com/api'

export enum ActivityAssets {
  Logo = 'https://i.imgur.com/9us39uh.png',
}

/** GIFs above this are flattened to JPEG — PreMiD silently drops multi‑MB GIFs. */
const MAX_GIF_BYTES = 400_000
const MAX_IMAGE_EDGE = 512
const dataCache = new Map<string, { data: unknown, expires: number }>()
const blobCache = new Map<string, Blob>()
const inflight = new Set<string>()
const failedUrls = new Set<string>()
const CACHE_TTL = 120_000
const API_TIMEOUT_MS = 1200

let logoBlob: Blob | undefined
let logoPrefetchStarted = false

export async function fetchCached<T>(key: string, fetcher: () => Promise<T | null>): Promise<T | null> {
  const cached = dataCache.get(key)
  if (cached && cached.expires > Date.now())
    return cached.data as T

  try {
    const data = await Promise.race([
      fetcher(),
      new Promise<null>(resolve => window.setTimeout(resolve, API_TIMEOUT_MS, null)),
    ])
    if (data)
      dataCache.set(key, { data, expires: Date.now() + CACHE_TTL })
    return data
  }
  catch {
    return null
  }
}

export function getAnimeTitle(anime?: Anime | null): string | undefined {
  if (!anime?.title)
    return undefined
  return anime.title.romaji || anime.title.english || anime.title.native
}

export function findSeason(anime: Anime | null | undefined, seasonNumber: number): AnimeSeason | undefined {
  return anime?.seasons?.find(s => Number(s.seasonNumber) === Number(seasonNumber))
}

export function findEpisode(season: AnimeSeason | undefined, episodeNumber: number): AnimeEpisode | undefined {
  return season?.episodes?.find(e => Number(e.episodeNumber) === Number(episodeNumber))
}

export function getPageTitle(): string {
  return document.title
    .replace(/\s*\|\s*ANITILKY.*$/i, '')
    .replace(/\s*Türkçe.*$/i, '')
    .trim()
}

export function getStoredUsername(): string | undefined {
  try {
    const raw = localStorage.getItem('userData') || sessionStorage.getItem('userData')
    if (!raw)
      return undefined
    return (JSON.parse(raw) as { username?: string }).username
  }
  catch {
    return undefined
  }
}

export function getProfileUsernameFromDom(): string | undefined {
  return document.querySelector<HTMLElement>('main h4, [class*="MuiTypography-h4"]')?.textContent?.trim()
    || getStoredUsername()
}

export function getProfileImageUrl(): string | undefined {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>(
    '.MuiAvatar-img, img[src*="profile-images"], img[src*="b-cdn.net"][src*="profile"]',
  ))

  images.sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight))

  for (const img of images) {
    const src = img.currentSrc || img.src
    if (src && !src.startsWith('data:') && !/logo|placeholder/i.test(src))
      return src
  }

  return undefined
}

export function parsePathSegments(pathname: string): string[] {
  return pathname.split('/').filter(Boolean)
}

export function formatEpisodeState(
  season: number,
  episode: number,
  episodeTitle?: string,
): string {
  const base = `S${season} E${episode}`
  return episodeTitle ? `${base} — ${episodeTitle}` : base
}

function normalizeUrl(url?: string | null): string | undefined {
  if (!url)
    return undefined
  try {
    return new URL(url, document.location.origin).href
  }
  catch {
    return undefined
  }
}

function isGifUrl(url: string): boolean {
  return /\.gif(?:$|\?)/i.test(url)
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.crossOrigin = 'anonymous'
    img.referrerPolicy = 'origin'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('img failed'))
    img.src = url
  })
}

async function imageFromBlobOrBuffer(source: Blob | ArrayBuffer): Promise<HTMLImageElement | undefined> {
  const blob = source instanceof Blob ? source : new Blob([source])
  const objectUrl = URL.createObjectURL(blob)
  try {
    return await loadImage(objectUrl)
  }
  catch {
    return undefined
  }
  finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function toJpegBlob(
  source: HTMLImageElement | Blob | ArrayBuffer,
  fallbackUrl?: string,
): Promise<Blob | undefined> {
  try {
    let img: HTMLImageElement | undefined

    if (source instanceof HTMLImageElement) {
      img = source
    }
    else {
      img = await imageFromBlobOrBuffer(source)
      if (!img && fallbackUrl)
        img = await loadImage(fallbackUrl).catch(() => undefined)
    }

    if (!img?.naturalWidth && fallbackUrl)
      img = await loadImage(fallbackUrl).catch(() => undefined)

    if (!img?.naturalWidth)
      return undefined

    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.max(1, Math.round(img.naturalWidth * scale))
    const height = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx)
      return undefined

    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    return await new Promise(resolve =>
      canvas.toBlob(b => resolve(b || undefined), 'image/jpeg', 0.9),
    )
  }
  catch {
    return undefined
  }
}

async function ensureLogoBlob(): Promise<Blob | undefined> {
  if (logoBlob)
    return logoBlob

  if (!logoPrefetchStarted) {
    logoPrefetchStarted = true
    void (async () => {
      try {
        const response = await fetch(ActivityAssets.Logo, { mode: 'cors', credentials: 'omit' })
        if (response.ok) {
          const blob = await response.blob()
          if (blob.size > 100) {
            logoBlob = blob.type.startsWith('image/') ? blob : await toJpegBlob(blob)
            return
          }
        }
      }
      catch {
        // ignore — CDN string still works as fallback
      }

      try {
        logoBlob = await toJpegBlob(await loadImage(ActivityAssets.Logo))
      }
      catch {
        // keep ActivityAssets.Logo string
      }
    })()
  }

  return logoBlob
}

void ensureLogoBlob()

/** curl-style BunnyCDN fetch (needs site referer). GIFs → JPEG. */
async function curlImageBlob(url: string): Promise<Blob | undefined> {
  try {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      referrer: `${BASE_URL}/`,
      referrerPolicy: 'origin',
      signal: controller.signal,
      headers: {
        Accept: 'image/gif,image/webp,image/avif,image/apng,image/*,*/*;q=0.8',
      },
    })

    window.clearTimeout(timer)

    if (!response.ok) {
      const img = await loadImage(url).catch(() => undefined)
      return img ? toJpegBlob(img) : undefined
    }

    const buffer = await response.arrayBuffer()
    if (buffer.byteLength < 100)
      return undefined

    const headerType = (response.headers.get('content-type') || '').split(';')[0]!.trim().toLowerCase()
    const wantGif = isGifUrl(url) || headerType === 'image/gif'

    // GIFs (esp. large ones) fail PreMiD upload → always prefer JPEG
    if (wantGif) {
      const jpeg = await toJpegBlob(buffer, url)
      if (jpeg)
        return jpeg
    }

    const type = headerType.startsWith('image/') ? headerType : 'image/jpeg'
    const blob = new Blob([buffer], { type })

    if (buffer.byteLength > MAX_GIF_BYTES || buffer.byteLength > 1_500_000) {
      const jpeg = await toJpegBlob(blob, url)
      if (jpeg)
        return jpeg
    }

    return blob
  }
  catch {
    const img = await loadImage(url).catch(() => undefined)
    return img ? toJpegBlob(img) : undefined
  }
}

function prefetchBlob(url: string): void {
  if (blobCache.has(url) || inflight.has(url) || failedUrls.has(url))
    return

  inflight.add(url)
  void curlImageBlob(url).then((blob) => {
    inflight.delete(url)
    if (blob)
      blobCache.set(url, blob)
    else
      failedUrls.add(url)
  }).catch(() => {
    inflight.delete(url)
    failedUrls.add(url)
  })
}

function fallbackLogo(): string | Blob {
  return logoBlob || ActivityAssets.Logo
}

/**
 * Sync — never blocks UpdateData.
 * Cached BunnyCDN blob, otherwise logo (blob if ready, else CDN URL).
 */
export function resolvePresenceImage(
  ...candidates: Array<string | undefined>
): string | Blob {
  void ensureLogoBlob()

  const urls = candidates
    .map(normalizeUrl)
    .filter((url): url is string => Boolean(url))

  for (const url of urls) {
    const cached = blobCache.get(url)
    if (cached)
      return cached
  }

  for (const url of urls)
    prefetchBlob(url)

  return fallbackLogo()
}
