import type { Anime, AnimeEpisode, AnimeSeason } from '../types.js'

export const BASE_URL = 'https://anitilky.com'
export const API_URL = 'https://api.anitilky.com/api'

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniTilky/assets/logo.png',
}

const dataCache = new Map<string, { data: unknown, expires: number }>()
const blobCache = new Map<string, Blob>()
const pendingBlob = new Map<string, Promise<Blob | undefined>>()
const CACHE_TTL = 60_000
const FETCH_TIMEOUT_MS = 4000

export async function fetchCached<T>(key: string, fetcher: () => Promise<T | null>): Promise<T | null> {
  const cached = dataCache.get(key)
  if (cached && cached.expires > Date.now())
    return cached.data as T

  const data = await fetcher()
  if (data)
    dataCache.set(key, { data, expires: Date.now() + CACHE_TTL })

  return data
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

export function getOgImage(): string | undefined {
  return document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
    || document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.content
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

export function getProfileImageFromDom(): string | undefined {
  const selectors = [
    'img[src*="profile-images"]',
    'img[src*="b-cdn.net"][src*="profile"]',
    '[class*="MuiAvatar"] img',
  ]

  for (const selector of selectors) {
    const img = document.querySelector<HTMLImageElement>(selector)
    const src = img?.currentSrc || img?.src
    if (src && !src.startsWith('data:') && img && img.naturalWidth > 0)
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

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(undefined), ms)
    promise
      .then((value) => {
        window.clearTimeout(timer)
        resolve(value)
      })
      .catch(() => {
        window.clearTimeout(timer)
        resolve(undefined)
      })
  })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.referrerPolicy = 'strict-origin-when-cross-origin'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = url
  })
}

/** Resize / flatten (incl. GIF) to a Discord-friendly JPEG blob. */
async function toJpegBlob(source: Blob | HTMLImageElement, maxSize = 512): Promise<Blob | undefined> {
  try {
    let img: HTMLImageElement
    if (source instanceof HTMLImageElement) {
      img = source
    }
    else {
      const objectUrl = URL.createObjectURL(source)
      try {
        img = await loadImage(objectUrl)
      }
      finally {
        URL.revokeObjectURL(objectUrl)
      }
    }

    if (!img.naturalWidth || !img.naturalHeight)
      return undefined

    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.max(1, Math.round(img.naturalWidth * scale))
    const height = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx)
      return undefined

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    return await new Promise((resolve) => {
      canvas.toBlob(blob => resolve(blob || undefined), 'image/jpeg', 0.86)
    })
  }
  catch {
    return undefined
  }
}

/**
 * Curl-equivalent: fetch image bytes in-page (site referer).
 * GIFs stay animated when preserveGif=true; otherwise flatten to JPEG for Discord.
 */
export async function fetchCoverBlob(
  url: string,
  options: { preserveGif?: boolean } = {},
): Promise<Blob | undefined> {
  const preserveGif = options.preserveGif === true
    || /\.gif(?:$|\?)/i.test(url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'strict-origin-when-cross-origin',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/gif,image/*,*/*;q=0.8',
      },
    })

    if (response.ok) {
      const blob = await response.blob()
      if (blob.size > 100) {
        const isGif = blob.type === 'image/gif'
          || (preserveGif && /\.gif(?:$|\?)/i.test(url))

        if (isGif) {
          return blob.type === 'image/gif'
            ? blob
            : new Blob([await blob.arrayBuffer()], { type: 'image/gif' })
        }

        const jpeg = await toJpegBlob(blob)
        if (jpeg)
          return jpeg
      }
    }
  }
  catch {
    // fall through
  }

  // Animated GIF cannot be rebuilt from <img> draw — only static fallback
  if (preserveGif)
    return undefined

  try {
    const img = await loadImage(url)
    return await toJpegBlob(img)
  }
  catch {
    return undefined
  }
}

/**
 * Always returns a Blob (or logo URL). Uses cache so UpdateData is not blocked twice.
 */
export async function resolveCoverImage(
  _title?: string,
  ...candidates: Array<string | undefined>
): Promise<string | Blob> {
  return resolveImageBlob(candidates, false)
}

/** Profile avatars: keep animated GIFs intact. */
export async function resolveProfileImage(
  ...candidates: Array<string | undefined>
): Promise<string | Blob> {
  return resolveImageBlob(candidates, true)
}

async function resolveImageBlob(
  candidates: Array<string | undefined>,
  preserveGif: boolean,
): Promise<string | Blob> {
  const cachePrefix = preserveGif ? 'gif:' : 'still:'
  const urls = [...candidates, preserveGif ? undefined : getOgImage()]
    .map(normalizeUrl)
    .filter((url): url is string => Boolean(url))

  for (const url of urls) {
    const cacheKey = cachePrefix + url
    const cached = blobCache.get(cacheKey)
    if (cached)
      return cached

    let pending = pendingBlob.get(cacheKey)
    if (!pending) {
      pending = fetchCoverBlob(url, { preserveGif }).then((blob) => {
        if (blob)
          blobCache.set(cacheKey, blob)
        return blob
      })
      pendingBlob.set(cacheKey, pending)
    }

    const blob = await withTimeout(pending, FETCH_TIMEOUT_MS)
    if (blob)
      return blob
  }

  return ActivityAssets.Logo
}
