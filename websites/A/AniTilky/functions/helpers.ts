import type { Anime, AnimeEpisode, AnimeSeason } from '../types.js'

export const BASE_URL = 'https://anitilky.com'
export const API_URL = 'https://api.anitilky.com/api'

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniTilky/assets/logo.png',
}

const dataCache = new Map<string, { data: unknown, expires: number }>()
const blobCache = new Map<string, Blob>()
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
    'main img[alt]',
  ]

  for (const selector of selectors) {
    const img = document.querySelector<HTMLImageElement>(selector)
    const src = img?.currentSrc || img?.src
    if (src && !src.includes('data:') && img && img.naturalWidth > 0)
      return src
  }

  return undefined
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

async function blobFromCanvas(img: HTMLImageElement): Promise<Blob | undefined> {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx)
      return undefined

    ctx.drawImage(img, 0, 0)
    return await new Promise((resolve) => {
      canvas.toBlob(blob => resolve(blob || undefined), 'image/jpeg', 0.92)
    })
  }
  catch {
    return undefined
  }
}

async function blobFromUrl(url: string): Promise<Blob | undefined> {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'strict-origin-when-cross-origin',
    })
    if (response.ok) {
      const blob = await response.blob()
      if (blob.type.startsWith('image/') && blob.size > 100) {
        // Discord RPC handles static images more reliably than GIFs
        if (blob.type === 'image/gif') {
          const img = await loadImage(url)
          return (await blobFromCanvas(img)) || blob
        }
        return blob
      }
    }
  }
  catch {
    // fall through to canvas path
  }

  try {
    const img = await loadImage(url)
    return await blobFromCanvas(img)
  }
  catch {
    return undefined
  }
}

/**
 * BunnyCDN blocks Discord remote fetches (403 without site referer).
 * Always download in-page and return a Blob for PreMiD to upload.
 */
export async function resolveCoverImage(
  ...candidates: Array<string | undefined>
): Promise<string | Blob> {
  const urls = [...candidates, getOgImage()]
    .map(normalizeUrl)
    .filter((url): url is string => Boolean(url))

  for (const url of urls) {
    const cached = blobCache.get(url)
    if (cached)
      return cached

    const blob = await blobFromUrl(url)
    if (blob) {
      blobCache.set(url, blob)
      return blob
    }
  }

  return ActivityAssets.Logo
}
