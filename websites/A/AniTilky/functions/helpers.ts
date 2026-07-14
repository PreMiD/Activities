import type { Anime, AnimeEpisode, AnimeSeason } from '../types.js'

export const BASE_URL = 'https://anitilky.com'
export const API_URL = 'https://api.anitilky.com/api'

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniTilky/assets/logo.png',
}

const dataCache = new Map<string, { data: unknown, expires: number }>()
const blobCache = new Map<string, Blob>()
const inflight = new Map<string, Promise<Blob | undefined>>()
const CACHE_TTL = 60_000

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
  const selectors = [
    'img[src*="profile-images"]',
    'img[src*="b-cdn.net"][src*="profile"]',
    '[class*="MuiAvatar"] img',
  ]

  for (const selector of selectors) {
    const img = document.querySelector<HTMLImageElement>(selector)
    const src = img?.currentSrc || img?.src
    if (src && !src.startsWith('data:'))
      return src
  }

  return undefined
}

export function getOgImage(): string | undefined {
  return document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
    || document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.content
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

/**
 * BunnyCDN needs a site Referer (curl -e anitilky.com). Browser fetch from the page works.
 * Return raw Blob — GIF stays GIF, everything else kept as fetched (or JPEG if mistyped).
 */
async function curlImageBlob(url: string): Promise<Blob | undefined> {
  try {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 5000)

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

    if (!response.ok)
      return undefined

    const buffer = await response.arrayBuffer()
    if (buffer.byteLength < 100)
      return undefined

    const headerType = (response.headers.get('content-type') || '').split(';')[0]!.trim().toLowerCase()
    const wantGif = isGifUrl(url) || headerType === 'image/gif'
    const type = wantGif
      ? 'image/gif'
      : (headerType.startsWith('image/') ? headerType : 'image/jpeg')

    return new Blob([buffer], { type })
  }
  catch {
    return undefined
  }
}

function ensureBlobFetch(url: string): void {
  if (blobCache.has(url) || inflight.has(url))
    return

  const job = curlImageBlob(url).then((blob) => {
    if (blob)
      blobCache.set(url, blob)
    inflight.delete(url)
    return blob
  }).catch(() => {
    inflight.delete(url)
    return undefined
  })

  inflight.set(url, job)
}

/**
 * Non-blocking: return cached Blob immediately, otherwise Logo and prefetch in background.
 * Next UpdateData tick will show the BunnyCDN image / GIF.
 */
export function resolvePresenceImage(
  ...candidates: Array<string | undefined>
): string | Blob {
  const urls = [...candidates, getOgImage()]
    .map(normalizeUrl)
    .filter((url): url is string => Boolean(url))

  for (const url of urls) {
    const cached = blobCache.get(url)
    if (cached)
      return cached
  }

  for (const url of urls)
    ensureBlobFetch(url)

  return ActivityAssets.Logo
}

/** Optional short wait used once when we already have an inflight fetch. */
export async function resolvePresenceImageAsync(
  ...candidates: Array<string | undefined>
): Promise<string | Blob> {
  const urls = [...candidates, getOgImage()]
    .map(normalizeUrl)
    .filter((url): url is string => Boolean(url))

  for (const url of urls) {
    const cached = blobCache.get(url)
    if (cached)
      return cached
  }

  for (const url of urls)
    ensureBlobFetch(url)

  // Wait briefly for the first candidate only (does not hang presence forever)
  const first = urls[0]
  if (first) {
    const pending = inflight.get(first)
    if (pending) {
      const blob = await Promise.race([
        pending,
        new Promise<undefined>(resolve => window.setTimeout(() => resolve(undefined), 1200)),
      ])
      if (blob)
        return blob
    }
  }

  return ActivityAssets.Logo
}
