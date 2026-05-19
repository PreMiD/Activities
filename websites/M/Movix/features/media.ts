import type { TmdbMediaSummary, TmdbMediaType } from '../core/types.js'
import { TMDB_API_BASE, TMDB_API_KEY } from '../core/constants.js'
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

  const cacheKey = `${type}:${mediaId}`
  const cachedPromise = tmdbMediaCache.get(cacheKey)
  if (cachedPromise) {
    return cachedPromise
  }

  const request = (async () => {
    try {
      const url = new URL(`${TMDB_API_BASE}/${type}/${mediaId}`)
      url.searchParams.set('api_key', TMDB_API_KEY)
      url.searchParams.set('language', 'fr-FR')

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

function getCinegraphVariants(type: string): readonly string[] {
  if (type === 'movie') {
    return [
      'Connexions d\'un film passées au scanner 🕸️',
      'Univers d\'un film disséqué dans CinéGraph 🎬',
      'Réseau d\'un film analysé comme un dossier secret 🧠',
    ]
  }

  if (type === 'tv') {
    return [
      'Connexions d\'une série passées au scanner 🕸️',
      'Univers d\'une série disséqué dans CinéGraph 📺',
      'Réseau d\'une série analysé comme un complot premium 🧠',
    ]
  }

  if (type === 'person') {
    return [
      'Connexions d\'une personne passées au scanner 👤',
      'Carrière disséquée dans CinéGraph 🎭',
      'Réseau créatif observé comme un tableau d\'enquête 🕵️',
    ]
  }

  return [
    'Cartographie ciné en cours dans CinéGraph 🧠',
    'Connexions ciné passées au scanner 🕸️',
    'Univers Movix disséqué comme un dossier top secret 🧪',
  ]
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
    variants: getCinegraphVariants(graphType),
  }
}
