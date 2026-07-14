import type { Anime, AnimeEpisode, AnimeSeason } from '../types.js'

export const BASE_URL = 'https://anitilky.com'
export const API_URL = 'https://api.anitilky.com/api'

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniTilky/assets/logo.png',
  Thumbnail = 'https://cdn.rcd.gg/PreMiD/websites/A/AniTilky/assets/logo.png',
}

const cache = new Map<string, { data: unknown, expires: number }>()
const CACHE_TTL = 60_000
const imageElementCache = new Map<string, HTMLImageElement>()
const aniListCoverCache = new Map<string, string | null>()

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

function isUsableImage(img: HTMLImageElement): boolean {
  return Boolean(img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)
}

function matchesCoverUrl(src: string, candidates: string[]): boolean {
  return candidates.some(candidate => candidate && (src === candidate || src.includes(candidate) || candidate.includes(src)))
}

/**
 * BunnyCDN blocks Discord/PreMiD remote fetches (403). Prefer an already-loaded
 * DOM image so PreMiD can upload it as a blob instead of re-fetching the URL.
 */
export function getCoverImageElement(...candidates: Array<string | undefined>): HTMLImageElement | undefined {
  const normalized = candidates.map(normalizeUrl).filter((url): url is string => Boolean(url))
  const urls = [...normalized, normalizeUrl(getOgImage())].filter((url): url is string => Boolean(url))

  for (const url of urls) {
    const cached = imageElementCache.get(url)
    if (cached && isUsableImage(cached))
      return cached
  }

  const selectors = [
    'img[src*="cover"]',
    'img[src*="banner"]',
    'img[src*="b-cdn.net"]',
    'img[src*="anilist"]',
    'main img',
    '[class*="MuiPaper"] img',
    'img[alt]',
  ]

  for (const selector of selectors) {
    const images = document.querySelectorAll<HTMLImageElement>(selector)
    for (const img of images) {
      const src = normalizeUrl(img.currentSrc || img.src)
      if (!src || !isUsableImage(img))
        continue
      if (urls.length === 0 || matchesCoverUrl(src, urls) || /cover|banner|poster|anilist|b-cdn/i.test(src)) {
        imageElementCache.set(src, img)
        return img
      }
    }
  }

  for (const url of urls) {
    let img = imageElementCache.get(url)
    if (!img) {
      img = new Image()
      img.decoding = 'async'
      img.referrerPolicy = 'strict-origin-when-cross-origin'
      img.src = url
      imageElementCache.set(url, img)
    }
    if (isUsableImage(img))
      return img
  }

  return undefined
}

/**
 * Public AniList CDN covers work with Discord; BunnyCDN covers usually do not.
 */
export async function fetchAniListCover(title?: string): Promise<string | undefined> {
  if (!title)
    return undefined

  const key = title.toLowerCase()
  if (aniListCoverCache.has(key))
    return aniListCoverCache.get(key) || undefined

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: `
          query ($search: String) {
            Media(search: $search, type: ANIME) {
              coverImage {
                extraLarge
                large
              }
            }
          }
        `,
        variables: { search: title },
      }),
    })

    if (!response.ok) {
      aniListCoverCache.set(key, null)
      return undefined
    }

    const json = await response.json() as {
      data?: {
        Media?: {
          coverImage?: {
            extraLarge?: string
            large?: string
          }
        }
      }
    }

    const cover = json.data?.Media?.coverImage?.extraLarge || json.data?.Media?.coverImage?.large || null
    aniListCoverCache.set(key, cover)
    return cover || undefined
  }
  catch {
    aniListCoverCache.set(key, null)
    return undefined
  }
}

export async function resolveCoverImage(
  preferred?: string,
  fallback?: string,
  title?: string,
): Promise<string | HTMLImageElement> {
  const element = getCoverImageElement(preferred, fallback)
  if (element)
    return element

  const aniListCover = await fetchAniListCover(title)
  if (aniListCover)
    return aniListCover

  // Avoid sending BunnyCDN URLs directly — Discord gets 403.
  return ActivityAssets.Logo
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
