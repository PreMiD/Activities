import type { RoutePresenceContext } from '../types.js'
import {
  PRESENCE_ICONS,
  ROUTE_COLLECTION_PATTERN,
  ROUTE_DOWNLOAD_PATTERN,
  ROUTE_GENRE_PATTERN,
  ROUTE_MOVIE_PATTERN,
  ROUTE_PERSON_PATTERN,
  ROUTE_PROVIDER_CATALOG_PATTERN,
  ROUTE_PROVIDER_PATTERN,
  ROUTE_TV_PATTERN,
} from '../../core/constants.js'
import { format, s } from '../../core/strings.js'
import {
  createPagePresence,
  createSpecificPagePresence,
  firstNonEmpty,
  getLiveTvContext,
  getMatchPart,
  getProviderName,
  getSearchParam,
  getText,
  isImageUrlAllowed,
  shortenId,
  toAbsoluteUrl,
} from '../../core/utils.js'
import { finalizeRoutePresence } from '../helpers.js'

export async function handleCatalogRoutes(
  context: RoutePresenceContext,
): Promise<PresenceData | null> {
  const { pathname, pageTitle, pageImage, contentImage } = context

  if (pathname === '/') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().browseHome, s().home, pageImage),
    )
  }

  if (pathname === '/search') {
    const query = getSearchParam('q')
    const presenceData = createPagePresence(
      s().searching,
      query ? format(s().searchQuery, query) : s().searchGlobal,
      pageImage,
    )

    presenceData.smallImageKey = PRESENCE_ICONS.search
    presenceData.smallImageText = s().searchLabel

    return finalizeRoutePresence(context, presenceData)
  }

  if (pathname === '/movies') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().browseMovies, s().movies, pageImage),
    )
  }

  if (pathname === '/tv-shows') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().browseSeries, s().series, pageImage),
    )
  }

  if (pathname === '/collections') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().browseCollections,
        pageTitle || s().collections,
        pageImage,
      ),
    )
  }

  const collectionMatch = pathname.match(ROUTE_COLLECTION_PATTERN)
  if (collectionMatch) {
    const collectionId = getMatchPart(collectionMatch, 1)
    const collectionTitle
      = pageTitle || format(s().collectionId, shortenId(collectionId))

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        collectionTitle,
        s().viewCollection,
        pageImage,
      ),
    )
  }

  const movieMatch = pathname.match(ROUTE_MOVIE_PATTERN)
  if (movieMatch) {
    const movieId = getMatchPart(movieMatch, 1)
    const movieTitle = pageTitle || format(s().movieId, shortenId(movieId))

    return finalizeRoutePresence(
      context,
      createPagePresence(s().viewMovie, movieTitle, contentImage),
    )
  }

  const tvMatch = pathname.match(ROUTE_TV_PATTERN)
  if (tvMatch) {
    const showId = getMatchPart(tvMatch, 1)
    const showTitle = pageTitle || format(s().seriesId, shortenId(showId))

    return finalizeRoutePresence(
      context,
      createPagePresence(s().viewSeries, showTitle, contentImage),
    )
  }

  const downloadMatch = pathname.match(ROUTE_DOWNLOAD_PATTERN)
  if (downloadMatch) {
    const contentType = getMatchPart(downloadMatch, 1)
    const title = firstNonEmpty(
      getText('h2'),
      pageTitle,
      contentType === 'movie' ? s().movieToDownload : s().seriesToDownload,
    )

    return finalizeRoutePresence(
      context,
      createPagePresence(
        contentType === 'movie' ? s().downloadMovie : s().downloadSeries,
        String(title),
        contentImage,
      ),
    )
  }

  if (pathname === '/debrid') {
    const provider = getSearchParam('provider')

    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().useDebrid,
        provider ? format(s().debridService, provider) : s().debrid,
        pageImage,
      ),
    )
  }

  const genreMatch = pathname.match(ROUTE_GENRE_PATTERN)
  if (genreMatch) {
    const mediaType = getMatchPart(genreMatch, 1)

    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().browseGenre,
        pageTitle
        || (mediaType === 'movie' ? s().moviesByGenre : s().seriesByGenre),
        pageImage,
      ),
    )
  }

  if (pathname === '/roulette') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().useRoulette,
        pageTitle || s().randomPick,
        pageImage,
      ),
    )
  }

  const providerCatalogMatch = pathname.match(ROUTE_PROVIDER_CATALOG_PATTERN)
  if (providerCatalogMatch) {
    const providerId = getMatchPart(providerCatalogMatch, 1)
    const mediaType = getMatchPart(providerCatalogMatch, 2)
    const providerName = getProviderName(providerId)
    const mediaLabel = mediaType === 'movies' ? s().movies : s().series

    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().browsePlatformCatalog,
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
        s().viewPlatform,
        getProviderName(providerId),
        pageImage,
      ),
    )
  }

  if (pathname === '/auth' || pathname === '/auth/google') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().signIn, s().signInState, pageImage),
    )
  }

  if (pathname === '/create-account' || pathname === '/link-bip39/create') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().createAccount, s().accountCreation, pageImage),
    )
  }

  if (pathname === '/login-bip39' || pathname === '/link-bip39') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().signIn, s().bip39, pageImage),
    )
  }

  const personMatch = pathname.match(ROUTE_PERSON_PATTERN)
  if (personMatch) {
    const personId = getMatchPart(personMatch, 1)
    const personTitle = pageTitle || format(s().personId, shortenId(personId))

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(personTitle, s().viewPerson, pageImage),
    )
  }

  if (pathname === '/profile') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().viewProfile, s().userProfile, pageImage),
    )
  }

  if (pathname === '/alerts') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().viewAlerts, pageTitle || s().alerts, pageImage),
    )
  }

  if (pathname === '/live-tv') {
    const live = getLiveTvContext()
    const liveTitle
      = live.channel
        || String(
          firstNonEmpty(getText('h1'), getText('h2'), pageTitle, 'Live TV'),
        )
    const livePoster = toAbsoluteUrl(live.poster)
    const presenceData = createPagePresence(
      s().watchLiveTv,
      liveTitle,
      livePoster && isImageUrlAllowed(livePoster) ? livePoster : pageImage,
    )

    presenceData.smallImageKey = PRESENCE_ICONS.live
    presenceData.smallImageText = s().live

    return finalizeRoutePresence(context, presenceData)
  }

  return null
}
