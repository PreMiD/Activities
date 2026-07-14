import type { Anime, AnimeEpisode, AnimeSeason } from '../types.js'

export const BASE_URL = 'https://anitilky.com'
export const API_URL = 'https://api.anitilky.com/api'

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniTilky/assets/logo.png',
  Thumbnail = 'https://cdn.rcd.gg/PreMiD/websites/A/AniTilky/assets/logo.png',
}

const cache = new Map<string, { data: unknown, expires: number }>()
const CACHE_TTL = 60_000
const coverBlobCache = new Map<string, Blob>()

export async function fetchCached<T>(key: string, fetcher: () => Promise<T | null>): Promise<T | null> {
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now())
    return cached.data as T

  const data = await fetcher()
  if (data)
    cache.set(key, { data, expires: Date.now() + CACHE_TTL })

  return data
}

export function getAnimeTitle(anime?: Anime | null): string | undefined {
  if (!anime?.title)
    return undefined
  return anime.title.romaji || anime.title.english || anime.title.native
}

export function findSeason(anime: Anime | null | undefined, seasonNumber: number): AnimeSeason | undefined {
  return anime?.seasons?.find(s => s.seasonNumber === seasonNumber)
}

export function findEpisode(season: AnimeSeason | undefined, episodeNumber: number): AnimeEpisode | undefined {
  return season?.episodes?.find(e => e.episodeNumber === episodeNumber)
}

export function getOgImage(): string | undefined {
  return document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
    || document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.content
}

export function getPageTitle(): string {
  return document.title.replace(/\s*\|\s*ANITILKY.*$/i, '').trim()
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

/**
 * BunnyCDN requires a site Referer (403 without it). Discord cannot fetch those
 * URLs directly, so we download the image here and hand PreMiD a Blob.
 */
export async function fetchCoverBlob(...candidates: Array<string | undefined>): Promise<Blob | undefined> {
  const urls = [...candidates, getOgImage()]
    .map(normalizeUrl)
    .filter((url): url is string => Boolean(url))

  for (const url of urls) {
    const cached = coverBlobCache.get(url)
    if (cached)
      return cached

    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        referrer: `${BASE_URL}/`,
        referrerPolicy: 'strict-origin-when-cross-origin',
        headers: {
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
      })

      if (!response.ok)
        continue

      const blob = await response.blob()
      if (!blob.type.startsWith('image/') || blob.size < 100)
        continue

      coverBlobCache.set(url, blob)
      return blob
    }
    catch {
      continue
    }
  }

  return undefined
}

export async function resolveCoverImage(
  preferred?: string,
  fallback?: string,
): Promise<string | Blob> {
  const blob = await fetchCoverBlob(preferred, fallback)
  return blob || ActivityAssets.Logo
}

export function getStoredUsername(): string | undefined {
  try {
    const raw = localStorage.getItem('userData') || sessionStorage.getItem('userData')
    if (!raw)
      return undefined
    const parsed = JSON.parse(raw) as { username?: string }
    return parsed.username
  }
  catch {
    return undefined
  }
}

export function getProfileUsernameFromDom(): string | undefined {
  return document.querySelector<HTMLElement>('main h4, [class*="MuiTypography-h4"]')?.textContent?.trim()
    || getStoredUsername()
}

export function parsePathSegments(pathname: string): string[] {
  return pathname.split('/').filter(Boolean)
}

export function formatEpisodeState(
  template: string,
  season: number,
  episode: number,
  episodeTitle?: string,
): string {
  const base = template
    .replace('{0}', String(season))
    .replace('{1}', String(episode))

  return episodeTitle ? `${base} — ${episodeTitle}` : base
}
