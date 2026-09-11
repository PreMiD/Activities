export interface AnimeData {
  slug: string | null
  title: string
  season?: number
  episode?: number
  movie?: number
  coverImg?: string
}

interface KitsuAnimeResponse {
  data?: {
    attributes?: {
      posterImage?: {
        small?: string
        medium?: string
        large?: string
        original?: string
      } | null
    }
  }[]
}

const KITSU_ANIME_API = 'https://kitsu.io/api/edge/anime'

function getCoverFromPage(): string | undefined {
  const cover = document.querySelector<HTMLImageElement>('.seriesCoverBox img')
  if (!cover)
    return undefined

  //* The cover is lazy-loaded: until it enters the viewport `src` only holds a
  //* 1x1 base64 placeholder and the real file is kept in `data-src`.
  const source = cover.dataset.src ?? cover.getAttribute('src')
  if (!source || source.startsWith('data:'))
    return undefined

  return new URL(source, document.location.origin).href
}

export function getAnimeData(): AnimeData {
  const path = document.location.pathname.toLowerCase()

  return {
    slug: path.match(/^\/anime\/stream\/([^/]+)/)?.[1] ?? null,
    title: document.querySelector('h1')?.textContent?.trim() || 'AniWorld',
    season: Number(path.match(/\/staffel-(\d+)/)?.[1]) || undefined,
    episode: Number(path.match(/\/episode-(\d+)/)?.[1]) || undefined,
    movie: Number(path.match(/\/filme\/film-(\d+)/)?.[1]) || undefined,
    coverImg: getCoverFromPage(),
  }
}

export async function fetchCover(title: string): Promise<string | undefined> {
  const url = new URL(KITSU_ANIME_API)
  url.searchParams.set('filter[text]', title)
  url.searchParams.set('page[limit]', '1')
  url.searchParams.set('fields[anime]', 'posterImage')

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.api+json' },
    })
    if (!response.ok)
      return undefined

    const { data }: KitsuAnimeResponse = await response.json()
    const poster = data?.[0]?.attributes?.posterImage

    //* Discord renders the large image at roughly 300px, so `small` is enough.
    return poster?.small ?? poster?.medium ?? poster?.original ?? undefined
  }
  catch {
    return undefined
  }
}
