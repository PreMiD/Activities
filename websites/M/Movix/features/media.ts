import type { TmdbMediaSummary, TmdbMediaType } from '../core/types.js'
import { TMDB_API_BASE, TMDB_API_KEY } from '../core/constants.js'
import { getLanguage, s } from '../core/strings.js'
import {
  extractQuotedText,
  firstNonEmpty,
  getAttribute,
  getSearchParam,
  getText,
  normalizeText,
  stripSiteName,
  toAbsoluteUrl,
  toTmdbImageUrl,
} from '../core/utils.js'

const tmdbMediaCache = new Map<string, Promise<TmdbMediaSummary | null>>()

async function fetchTmdbMediaSummary(
  type: TmdbMediaType,
  id: string,
): Promise<TmdbMediaSummary | null> {
  const mediaId = normalizeText(id)
  if (!TMDB_API_KEY || !mediaId) {
    return null
  }

  const language = getLanguage() === 'en' ? 'en-US' : 'fr-FR'
  const cacheKey = `${type}:${mediaId}:${language}`
  const cachedPromise = tmdbMediaCache.get(cacheKey)
  if (cachedPromise) {
    return cachedPromise
  }

  const request = (async () => {
    try {
      const url = new URL(`${TMDB_API_BASE}/${type}/${mediaId}`)
      url.searchParams.set('api_key', TMDB_API_KEY)
      url.searchParams.set('language', language)

      const response = await fetch(url.toString())
      if (!response.ok) {
        return null
      }

      const data = (await response.json()) as {
        title?: string
        name?: string
        poster_path?: string
        backdrop_path?: string
      }

      const title = stripSiteName(firstNonEmpty(data.title, data.name))
      if (!title) {
        return null
      }

      return {
        title,
        image: firstNonEmpty(
          toTmdbImageUrl(data.poster_path),
          toTmdbImageUrl(data.backdrop_path, 'w780'),
        ),
      }
    }
    catch {
      return null
    }
  })()

  tmdbMediaCache.set(cacheKey, request)
  return request
}

export async function getWatchTmdbSummary(
  type: TmdbMediaType,
  id: string,
): Promise<TmdbMediaSummary | null> {
  const numericId = (normalizeText(id).match(/^\d+/) || [''])[0]
  if (!numericId) {
    return null
  }

  return fetchTmdbMediaSummary(type, numericId)
}

function getCinegraphState(type: string): string {
  if (type === 'movie') {
    return s().cinegraphMovie
  }

  if (type === 'tv') {
    return s().cinegraphSeries
  }

  if (type === 'person') {
    return s().cinegraphPerson
  }

  return s().cinegraph
}

export async function getCinegraphContext(pageTitle: string, pageImage: string) {
  const selectedTitle = firstNonEmpty(
    getText('h2.cinegraph-detail-title'),
    getText('.cinegraph-tooltip-title'),
  )
  const selectedImage = firstNonEmpty(
    getAttribute('.cinegraph-detail-backdrop img', 'src'),
    getAttribute('.cinegraph-tooltip-poster', 'src'),
  )
  const selectedBadge = normalizeText(
    firstNonEmpty(
      getText('.cinegraph-detail-meta .cinegraph-type-badge'),
      getText('.cinegraph-tooltip-meta .cinegraph-type-badge'),
    ),
  ).toLowerCase()

  const queryType = normalizeText(getSearchParam('type')).toLowerCase()
  const queryId = getSearchParam('id')

  let graphType = queryType
  if (selectedBadge.includes('film') || selectedBadge.includes('movie')) {
    graphType = 'movie'
  }
  else if (
    selectedBadge.includes('tv')
    || selectedBadge.includes('serie')
    || selectedBadge.includes('série')
  ) {
    graphType = 'tv'
  }
  else if (
    selectedBadge.includes('person')
    || selectedBadge.includes('artist')
    || selectedBadge.includes('artiste')
  ) {
    graphType = 'person'
  }

  let title = normalizeText(selectedTitle)
  let image = toAbsoluteUrl(selectedImage)

  if (!title && (queryType === 'movie' || queryType === 'tv') && queryId) {
    const summary = await fetchTmdbMediaSummary(
      queryType as TmdbMediaType,
      queryId,
    )
    title = normalizeText(summary?.title)
    image = firstNonEmpty(image, toAbsoluteUrl(summary?.image || ''))
  }

  if (!title) {
    title = firstNonEmpty(
      extractQuotedText(getText('.cinegraph-subtitle')),
      pageTitle,
      'CinéGraph',
    )
  }

  return {
    title: String(title),
    image: firstNonEmpty(image, pageImage),
    state: getCinegraphState(graphType),
  }
}
