import type { RoutePresenceContext } from '../types.js'
import { Assets } from 'premid'
import {
  ROUTE_COLLECTION_PATTERN,
  ROUTE_DOWNLOAD_PATTERN,
  ROUTE_GENRE_PATTERN,
  ROUTE_MOVIE_PATTERN,
  ROUTE_PERSON_PATTERN,
  ROUTE_PROVIDER_CATALOG_PATTERN,
  ROUTE_PROVIDER_PATTERN,
  ROUTE_TV_PATTERN,
} from '../../core/constants.js'
import {
  createPagePresence,
  createSpecificPagePresence,
  firstNonEmpty,
  getMatchPart,
  getProviderName,
  getSearchParam,
  getText,
  shortenId,
} from '../../core/utils.js'
import { finalizeRoutePresence } from '../helpers.js'

export async function handleCatalogRoutes(
  context: RoutePresenceContext,
): Promise<PresenceData | null> {
  const { pathname, pageTitle, pageImage, contentImage } = context

  if (pathname === '/') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Parcourt la page d\'accueil', 'Accueil', pageImage),
    )
  }

  if (pathname === '/search') {
    const query = getSearchParam('q')
    const presenceData = createPagePresence(
      'Effectue une recherche',
      query ? `Recherche : ${query}` : 'Recherche globale',
      pageImage,
    )

    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Recherche'

    return finalizeRoutePresence(context, presenceData)
  }

  if (pathname === '/movies') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Parcourt le catalogue de films', 'Films', pageImage),
    )
  }

  if (pathname === '/tv-shows') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Parcourt le catalogue de séries',
        'Séries',
        pageImage,
      ),
    )
  }

  if (pathname === '/collections') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Parcourt les collections',
        pageTitle || 'Collections',
        pageImage,
      ),
    )
  }

  const collectionMatch = pathname.match(ROUTE_COLLECTION_PATTERN)
  if (collectionMatch) {
    const collectionId = getMatchPart(collectionMatch, 1)
    const collectionTitle = pageTitle || `Collection ${shortenId(collectionId)}`

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        collectionTitle,
        'Consulte une collection',
        pageImage,
      ),
    )
  }

  const movieMatch = pathname.match(ROUTE_MOVIE_PATTERN)
  if (movieMatch) {
    const movieId = getMatchPart(movieMatch, 1)
    const movieTitle = pageTitle || `Film ${shortenId(movieId)}`

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        movieTitle,
        'Consulte la fiche d\'un film',
        contentImage,
      ),
    )
  }

  const tvMatch = pathname.match(ROUTE_TV_PATTERN)
  if (tvMatch) {
    const showId = getMatchPart(tvMatch, 1)
    const showTitle = pageTitle || `Série ${shortenId(showId)}`

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        showTitle,
        'Consulte la fiche d\'une série',
        contentImage,
      ),
    )
  }

  const downloadMatch = pathname.match(ROUTE_DOWNLOAD_PATTERN)
  if (downloadMatch) {
    const contentType = getMatchPart(downloadMatch, 1)
    const typeLabel = contentType === 'movie' ? 'Film' : 'Série'
    const title = firstNonEmpty(
      getText('h2'),
      pageTitle,
      `${typeLabel} à télécharger`,
    )

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        String(title),
        contentType === 'movie'
          ? 'Prépare le téléchargement d\'un film'
          : 'Prépare le téléchargement d\'une série',
        contentImage,
      ),
    )
  }

  if (pathname === '/debrid') {
    const provider = getSearchParam('provider')

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Utilise le débrideur de liens',
        provider ? `Service : ${provider}` : 'Débridage de liens',
        pageImage,
      ),
    )
  }

  const genreMatch = pathname.match(ROUTE_GENRE_PATTERN)
  if (genreMatch) {
    const mediaType = getMatchPart(genreMatch, 1)
    const mediaLabel = mediaType === 'movie' ? 'Films' : 'Séries'

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Parcourt le catalogue par genre',
        pageTitle || `${mediaLabel} par genre`,
        pageImage,
      ),
    )
  }

  if (pathname === '/roulette') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Utilise la roulette de suggestions',
        pageTitle || 'Sélection aléatoire',
        pageImage,
      ),
    )
  }

  const providerCatalogMatch = pathname.match(ROUTE_PROVIDER_CATALOG_PATTERN)
  if (providerCatalogMatch) {
    const providerId = getMatchPart(providerCatalogMatch, 1)
    const mediaType = getMatchPart(providerCatalogMatch, 2)
    const providerName = getProviderName(providerId)
    const mediaLabel = mediaType === 'movies' ? 'Films' : 'Séries'

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Parcourt le catalogue d\'une plateforme',
        pageTitle || `${providerName} - ${mediaLabel}`,
        pageImage,
      ),
    )
  }

  const providerMatch = pathname.match(ROUTE_PROVIDER_PATTERN)
  if (providerMatch) {
    const providerId = getMatchPart(providerMatch, 1)

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Consulte une plateforme',
        getProviderName(providerId),
        pageImage,
      ),
    )
  }

  if (pathname === '/auth' || pathname === '/auth/google') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Se connecte', 'Connexion', pageImage),
    )
  }

  if (pathname === '/create-account' || pathname === '/link-bip39/create') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Crée un compte', 'Création de compte', pageImage),
    )
  }

  if (pathname === '/login-bip39' || pathname === '/link-bip39') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Se connecte', 'Connexion BIP39', pageImage),
    )
  }

  const personMatch = pathname.match(ROUTE_PERSON_PATTERN)
  if (personMatch) {
    const personId = getMatchPart(personMatch, 1)
    const personTitle = pageTitle || `Personne ${shortenId(personId)}`

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        personTitle,
        'Consulte la fiche d\'une personne',
        pageImage,
      ),
    )
  }

  if (pathname === '/profile') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Consulte son profil', 'Profil utilisateur', pageImage),
    )
  }

  if (pathname === '/alerts') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Consulte ses alertes',
        pageTitle || 'Alertes',
        pageImage,
      ),
    )
  }

  if (pathname === '/live-tv') {
    const liveTitle = firstNonEmpty(
      getText('h1'),
      getText('h2'),
      pageTitle,
      'Live TV',
    )
    const presenceData = createPagePresence(
      'Regarde la TV en direct',
      String(liveTitle),
      pageImage,
    )

    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = 'En direct'

    return finalizeRoutePresence(context, presenceData)
  }

  return null
}
