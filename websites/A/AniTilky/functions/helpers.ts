import type { Anime, AnimeEpisode, AnimeSeason } from '../types.js'

export const BASE_URL = 'https://anitilky.com'
export const API_URL = 'https://api.anitilky.com/api'

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniTilky/assets/logo.png',
}

const dataCache = new Map<string, { data: unknown, expires: number }>()
const coverCache = new Map<string, string>()
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

export function getProfileImageElement(): HTMLImageElement | undefined {
  const selectors = [
    'img[src*="profile-images"]',
    'img[src*="b-cdn.net"][src*="profile"]',
    '[class*="MuiAvatar"] img',
  ]

  for (const selector of selectors) {
    const img = document.querySelector<HTMLImageElement>(selector)
    if (img?.complete && img.naturalWidth > 0)
      return img
  }

  return undefined
}

export function getCoverImageElement(): HTMLImageElement | undefined {
  const selectors = [
    'img[src*="cover.jpg"]',
    'img[src*="cover.png"]',
    'img[src*="/cover"]',
    'img[src*="anilist.co"]',
    '[class*="MuiPaper"] img',
  ]

  for (const selector of selectors) {
    const img = document.querySelector<HTMLImageElement>(selector)
    if (img?.complete && img.naturalWidth > 40)
      return img
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

async function fetchAniListCover(title?: string): Promise<string | undefined> {
  if (!title)
    return undefined

  const cached = coverCache.get(`anilist:${title}`)
  if (cached)
    return cached

  try {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 2000)
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: `query ($search: String) {
          Media(search: $search, type: ANIME) {
            coverImage { extraLarge large }
          }
        }`,
        variables: { search: title },
      }),
    })
    window.clearTimeout(timer)

    if (!response.ok)
      return undefined

    const json = await response.json() as {
      data?: { Media?: { coverImage?: { extraLarge?: string, large?: string } } }
    }
    const cover = json.data?.Media?.coverImage?.extraLarge
      || json.data?.Media?.coverImage?.large

    if (cover)
      coverCache.set(`anilist:${title}`, cover)

    return cover
  }
  catch {
    return undefined
  }
}

/**
 * Safe covers only:
 * - Already-loaded DOM <img> (PreMiD uploads locally)
 * - AniList public CDN URL (Discord can fetch)
 * - Logo fallback
 * Never use BunnyCDN URLs as strings (Discord 403) and never block on blobs.
 */
export async function resolveCoverImage(
  title?: string,
): Promise<string | HTMLImageElement> {
  const fromDom = getCoverImageElement()
  if (fromDom)
    return fromDom

  const aniList = await fetchAniListCover(title)
  if (aniList)
    return aniList

  return ActivityAssets.Logo
}

export function resolveProfileImage(): string | HTMLImageElement {
  return getProfileImageElement() || ActivityAssets.Logo
}
