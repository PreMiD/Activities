import type { Anime, AnimeEpisode, AnimeSeason } from '../types.js'

export const BASE_URL = 'https://anitilky.com'
export const API_URL = 'https://api.anitilky.com/api'

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniTilky/assets/logo.png',
}

const dataCache = new Map<string, { data: unknown, expires: number }>()
const imageCache = new Map<string, string | HTMLImageElement>()
const pendingImage = new Map<string, Promise<string | HTMLImageElement>>()
const CACHE_TTL = 60_000
const IMAGE_TIMEOUT_MS = 2500

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

export function getCoverImageFromDom(): HTMLImageElement | undefined {
  const selectors = [
    'img[src*="/cover"]',
    'img[src*="cover.jpg"]',
    'img[src*="cover.png"]',
    'img[src*="anilist.co"]',
    '[class*="MuiPaper"] img',
    'main img[alt]',
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

async function fetchAniListCover(title?: string): Promise<string | undefined> {
  if (!title)
    return undefined

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
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

    if (!response.ok)
      return undefined

    const json = await response.json() as {
      data?: { Media?: { coverImage?: { extraLarge?: string, large?: string } } }
    }

    return json.data?.Media?.coverImage?.extraLarge
      || json.data?.Media?.coverImage?.large
      || undefined
  }
  catch {
    return undefined
  }
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.referrerPolicy = 'no-referrer-when-downgrade'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image failed'))
    img.src = url
  })
}

/**
 * Prefer Discord-safe public URLs / already-loaded DOM images.
 * BunnyCDN remote URLs 403 for Discord — use DOM element so PreMiD uploads locally.
 * Never block UpdateData longer than IMAGE_TIMEOUT_MS.
 */
export async function resolveCoverImage(
  title?: string,
  ...candidates: Array<string | undefined>
): Promise<string | HTMLImageElement> {
  const fromDom = getCoverImageFromDom()
  if (fromDom)
    return fromDom

  const urls = [...candidates, getOgImage()]
    .map(normalizeUrl)
    .filter((url): url is string => Boolean(url))

  for (const url of urls) {
    // Public CDNs Discord can fetch directly
    if (/anilist\.co|cdn\.rcd\.gg|imgur\.com|discordapp|media\.discordapp/i.test(url)) {
      imageCache.set(url, url)
      return url
    }

    const cached = imageCache.get(url)
    if (cached)
      return cached

    let pending = pendingImage.get(url)
    if (!pending) {
      pending = (async () => {
        const img = await withTimeout(loadImageElement(url), IMAGE_TIMEOUT_MS)
        if (img && img.naturalWidth > 0) {
          imageCache.set(url, img)
          return img
        }
        return ActivityAssets.Logo
      })()
      pendingImage.set(url, pending)
    }

    const result = await withTimeout(pending, IMAGE_TIMEOUT_MS)
    if (result && result !== ActivityAssets.Logo)
      return result
  }

  const aniList = await withTimeout(fetchAniListCover(title), IMAGE_TIMEOUT_MS)
  if (aniList) {
    imageCache.set(`anilist:${title}`, aniList)
    return aniList
  }

  return ActivityAssets.Logo
}
