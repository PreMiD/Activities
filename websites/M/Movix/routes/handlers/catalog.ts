import type { RoutePresenceContext } from '../types.js'
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
      createPagePresence(
        'Farfouille l\'accueil comme un critique sous caféine',
        'Accueil Movix',
        pageImage,
      ),
    )
  }

  if (pathname === '/search') {
    const query = getSearchParam('q')

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Traque la perle rare avec un calme très relatif',
        query ? `Recherche : ${query}` : 'Recherche globale',
        pageImage,
      ),
    )
  }

  if (pathname === '/movies') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Passe le catalogue films au rayon X',
        'Catalogue films',
        pageImage,
      ),
    )
  }

  if (pathname === '/tv-shows') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Collectionne les séries sans finir les précédentes',
        'Catalogue séries',
        pageImage,
      ),
    )
  }

  if (pathname === '/collections') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Fouille les collections comme un conservateur insomniaque',
        pageTitle || 'Collections Movix',
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
        [
          'Collection passée au scanner 🗂️',
          'Saga observée avec un sérieux disproportionné 🎞️',
          'Collection inspectée comme un trésor du canapé 📚',
        ],
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
        [
          'Fiche film sous la loupe 🎬',
          'Film inspecté comme un dossier brûlant 🍿',
          'Autopsie ciné en cours sur Movix 🎞️',
        ],
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
        [
          'Fiche série sous surveillance 📺',
          'Série inspectée comme un complot à cliffhangers 🍿',
          'Binge en préparation devant la fiche série 🎞️',
        ],
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
          ? [
              'Téléchargement film en préparation ⬇️',
              'Plan B cinéma armé jusqu\'aux dents 📦',
              'Mode furtif: aucun spoiler autorisé 🕶️',
            ]
          : [
              'Téléchargement série en préparation ⬇️',
              'Plan B binge prêt à décoller 📺',
              'Rechargement stratégique des buffers 🔄',
            ],
        contentImage,
      ),
    )
  }

  if (pathname === '/debrid') {
    const provider = getSearchParam('provider')
    const state = provider
      ? `Debrid via ${provider}`
      : 'Atelier anti-liens capricieux'

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Dompte des liens récalcitrants à mains nues',
        state,
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
        'Trie le chaos par genre parce qu\'il le peut',
        pageTitle || `${mediaLabel} par genre`,
        pageImage,
      ),
    )
  }

  if (pathname === '/roulette') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Laisse le destin choisir quelle idée brillante',
        pageTitle || 'Roulette Movix',
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
        'Retourne un catalogue provider dans tous les sens',
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
        'Espionne un provider avec une curiosité très assumée',
        getProviderName(providerId),
        pageImage,
      ),
    )
  }

  if (pathname === '/auth' || pathname === '/auth/google') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Négocie avec l\'authentification sans perdre la face',
        'Connexion en cours',
        pageImage,
      ),
    )
  }

  if (pathname === '/create-account' || pathname === '/link-bip39/create') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Forge un compte comme un druide numérique',
        'Création de compte',
        pageImage,
      ),
    )
  }

  if (pathname === '/login-bip39' || pathname === '/link-bip39') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Récite sa phrase magique sans cligner des yeux',
        'Connexion BIP39',
        pageImage,
      ),
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
        [
          'Filmo disséquée comme un détective du générique 🎭',
          'Carrière passée au scanner plan par plan 🎬',
          'Profil ciné observé comme une archive sacrée 📚',
        ],
        pageImage,
      ),
    )
  }

  if (pathname === '/profile') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Range son profil puis dérange tout à nouveau',
        'Profil utilisateur',
        pageImage,
      ),
    )
  }

  if (pathname === '/alerts') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Surveille ses alertes comme une tour de contrôle du binge',
        pageTitle || 'Mes alertes',
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

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Zappe plus vite que la télécommande ne l\'accepte',
        String(liveTitle),
        pageImage,
      ),
    )
  }

  return null
}
