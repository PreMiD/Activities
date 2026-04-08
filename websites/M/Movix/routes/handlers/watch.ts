import {
  EPISODE_CODE_SUFFIX_PATTERN,
  FALLBACK_LOGO,
  ROUTE_FTV_WATCH_PATTERN,
  ROUTE_WATCHPARTY_JOIN_PATTERN,
  ROUTE_WATCHPARTY_ROOM_PATTERN,
  WATCH_ANIME_PATH_PATTERN,
  WATCH_MOVIE_PATH_PATTERN,
  WATCH_TV_PATH_PATTERN,
} from '../../core/constants.js'
import {
  createPagePresence,
  createSpecificPagePresence,
  createWatchingPresence,
  firstNonEmpty,
  getAttribute,
  getMatchPart,
  getText,
  getWatchTitle,
  safeDecode,
  shortenId,
} from '../../core/utils.js'
import { finalizeRoutePresence } from '../helpers.js'
import type { RoutePresenceContext } from '../types.js'

export async function handleWatchRoutes(
  context: RoutePresenceContext,
): Promise<PresenceData | null> {
  const { pathname, pageImage, contentImage } = context

  if (WATCH_MOVIE_PATH_PATTERN.test(pathname)) {
    const title = getWatchTitle('Film mystère')

    return finalizeRoutePresence(
      context,
      createWatchingPresence({
        title,
        playingText: 'lecture en cours, canapé en surchauffe',
        pausedText: 'pause stratégique, le drame attend',
        waitingText: 'cherche la bonne source sans paniquer',
        image: contentImage,
      }),
      { allowPageTimestamp: false },
    )
  }

  const watchTvMatch = pathname.match(WATCH_TV_PATH_PATTERN)
  if (watchTvMatch) {
    const season = getMatchPart(watchTvMatch, 2)
    const episode = getMatchPart(watchTvMatch, 3)
    const rawTitle = getWatchTitle('Série mystère')
    const title
      = rawTitle.replace(EPISODE_CODE_SUFFIX_PATTERN, '').trim() || 'Série mystère'

    return finalizeRoutePresence(
      context,
      createWatchingPresence({
        title,
        season,
        episode,
        playingText: 'binge hors de contrôle',
        pausedText: 'pause très dramatique',
        waitingText: 'sélectionne une source avec panique élégante',
        image: contentImage,
      }),
      { allowPageTimestamp: false },
    )
  }

  const watchAnimeMatch = pathname.match(WATCH_ANIME_PATH_PATTERN)
  if (watchAnimeMatch) {
    const season = getMatchPart(watchAnimeMatch, 2)
    const episode = getMatchPart(watchAnimeMatch, 3)
    const rawTitle = getWatchTitle('Anime mystère')
    const title
      = rawTitle.replace(EPISODE_CODE_SUFFIX_PATTERN, '').trim() || 'Anime mystère'

    return finalizeRoutePresence(
      context,
      createWatchingPresence({
        title,
        season,
        episode,
        playingText: 'anime en cours, théorie du fanclub activée',
        pausedText: 'pause technique, hype toujours intacte',
        waitingText: 'cherche son épisode comme un héros secondaire',
        image: contentImage,
      }),
      { allowPageTimestamp: false },
    )
  }

  if (pathname === '/watchparty/create') {
    const title = firstNonEmpty(
      getText('h2'),
      getText('h1'),
      'Création de WatchParty',
    )

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Prépare une WatchParty comme un maître de cérémonie chaotique',
        String(title),
        pageImage,
      ),
    )
  }

  const watchpartyRoomMatch = pathname.match(ROUTE_WATCHPARTY_ROOM_PATTERN)
  if (watchpartyRoomMatch) {
    const roomId = getMatchPart(watchpartyRoomMatch, 1)
    const roomTitle = firstNonEmpty(
      getAttribute('h1[title]', 'title'),
      getText('h1'),
      getText('h2'),
      `Salon ${shortenId(roomId)}`,
    )

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        String(roomTitle),
        [
          'Salon WatchParty en ébullition 💬',
          'WatchParty pilotée comme un chaos organisé 🎉',
          'Salle commune tenue d\'une main très popcorn 🍿',
        ],
        contentImage === FALLBACK_LOGO ? pageImage : contentImage,
      ),
    )
  }

  const watchpartyJoinMatch = pathname.match(ROUTE_WATCHPARTY_JOIN_PATTERN)
  if (watchpartyJoinMatch) {
    const joinCode = getMatchPart(watchpartyJoinMatch, 1)
    const state = joinCode
      ? `Code ${safeDecode(joinCode).toUpperCase()}`
      : String(
          firstNonEmpty(
            getText('h2'),
            getText('h1'),
            'Rejoindre une WatchParty',
          ),
        )

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Essaie d\'entrer dans une WatchParty sans rater le code',
        state,
        pageImage,
      ),
    )
  }

  if (pathname === '/watchparty/list') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Fouille les salons WatchParty comme un videur curieux',
        String(firstNonEmpty(getText('h1'), 'Liste des salons WatchParty')),
        pageImage,
      ),
    )
  }

  if (ROUTE_FTV_WATCH_PATTERN.test(pathname)) {
    const title = getWatchTitle('Programme France.tv')

    return finalizeRoutePresence(
      context,
      createWatchingPresence({
        title,
        playingText:
          'programme en cours, télécommande officiellement au chômage',
        pausedText: 'pause stratégique du direct',
        waitingText: 'cherche le bon flux avec dignité',
        image: contentImage,
      }),
      { allowPageTimestamp: false },
    )
  }

  return null
}

