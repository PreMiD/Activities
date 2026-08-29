import type { RoutePresenceContext } from '../types.js'
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

export async function handleWatchRoutes(
  context: RoutePresenceContext,
): Promise<PresenceData | null> {
  const { pathname, pageImage, contentImage } = context

  if (WATCH_MOVIE_PATH_PATTERN.test(pathname)) {
    const title = getWatchTitle('Film')

    return finalizeRoutePresence(
      context,
      createWatchingPresence({
        title,
        privacyDetails: 'Regarde un film',
        image: contentImage,
      }),
      { allowPageTimestamp: false },
    )
  }

  const watchTvMatch = pathname.match(WATCH_TV_PATH_PATTERN)
  if (watchTvMatch) {
    const season = getMatchPart(watchTvMatch, 2)
    const episode = getMatchPart(watchTvMatch, 3)
    const rawTitle = getWatchTitle('Série')
    const title
      = rawTitle.replace(EPISODE_CODE_SUFFIX_PATTERN, '').trim() || 'Série'

    return finalizeRoutePresence(
      context,
      createWatchingPresence({
        title,
        season,
        episode,
        privacyDetails: 'Regarde une série',
        image: contentImage,
      }),
      { allowPageTimestamp: false },
    )
  }

  const watchAnimeMatch = pathname.match(WATCH_ANIME_PATH_PATTERN)
  if (watchAnimeMatch) {
    const season = getMatchPart(watchAnimeMatch, 2)
    const episode = getMatchPart(watchAnimeMatch, 3)
    const rawTitle = getWatchTitle('Anime')
    const title
      = rawTitle.replace(EPISODE_CODE_SUFFIX_PATTERN, '').trim() || 'Anime'

    return finalizeRoutePresence(
      context,
      createWatchingPresence({
        title,
        season,
        episode,
        privacyDetails: 'Regarde un anime',
        image: contentImage,
      }),
      { allowPageTimestamp: false },
    )
  }

  if (pathname === '/watchparty/create') {
    const title = firstNonEmpty(
      getText('h2'),
      getText('h1'),
      'Nouvelle WatchParty',
    )

    return finalizeRoutePresence(
      context,
      createPagePresence('Crée une WatchParty', String(title), pageImage),
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
        'Participe à une WatchParty',
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
          firstNonEmpty(getText('h2'), getText('h1'), 'Saisie du code'),
        )

    return finalizeRoutePresence(
      context,
      createPagePresence('Rejoint une WatchParty', state, pageImage),
    )
  }

  if (pathname === '/watchparty/list') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Parcourt les salons WatchParty',
        String(firstNonEmpty(getText('h1'), 'Salons publics')),
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
        privacyDetails: 'Regarde France.tv',
        image: contentImage,
      }),
      { allowPageTimestamp: false },
    )
  }

  return null
}
