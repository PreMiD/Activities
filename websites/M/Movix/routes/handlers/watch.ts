import type { RoutePresenceContext } from '../types.js'
import { ActivityType } from 'premid'
import {
  EPISODE_CODE_SUFFIX_PATTERN,
  FALLBACK_LOGO,
  ROUTE_WATCHPARTY_JOIN_PATTERN,
  ROUTE_WATCHPARTY_ROOM_PATTERN,
  WATCH_ANIME_PATH_PATTERN,
  WATCH_MOVIE_PATH_PATTERN,
  WATCH_TV_PATH_PATTERN,
} from '../../core/constants.js'
import { format, s } from '../../core/strings.js'
import {
  applyVideoPlaybackToPresence,
  buildBasePresence,
  createPagePresence,
  createSpecificPagePresence,
  createWatchingPresence,
  firstNonEmpty,
  getAttribute,
  getMatchPart,
  getPartyContext,
  getText,
  getWatchTitle,
  isImageUrlAllowed,
  isPrivacyModeEnabled,
  safeDecode,
  shortenId,
  toAbsoluteUrl,
} from '../../core/utils.js'
import { getWatchTmdbSummary } from '../../features/media.js'
import { finalizeRoutePresence } from '../helpers.js'

export async function handleWatchRoutes(
  context: RoutePresenceContext,
): Promise<PresenceData | null> {
  const { pathname, pageImage, contentImage } = context

  const watchMovieMatch = pathname.match(WATCH_MOVIE_PATH_PATTERN)
  if (watchMovieMatch) {
    const movieId = getMatchPart(watchMovieMatch, 1)
    const tmdbSummary = await getWatchTmdbSummary('movie', movieId)
    const title = getWatchTitle(tmdbSummary?.title || s().fallbackMovie)

    return finalizeRoutePresence(
      context,
      createWatchingPresence({
        title,
        privacyDetails: s().watchMovie,
        image: tmdbSummary?.image || contentImage,
      }),
      { allowPageTimestamp: false },
    )
  }

  const watchTvMatch = pathname.match(WATCH_TV_PATH_PATTERN)
  if (watchTvMatch) {
    const showId = getMatchPart(watchTvMatch, 1)
    const season = getMatchPart(watchTvMatch, 2)
    const episode = getMatchPart(watchTvMatch, 3)
    const tmdbSummary = await getWatchTmdbSummary('tv', showId)
    const rawTitle = getWatchTitle(tmdbSummary?.title || s().fallbackSeries)
    const title
      = rawTitle.replace(EPISODE_CODE_SUFFIX_PATTERN, '').trim()
        || s().fallbackSeries

    return finalizeRoutePresence(
      context,
      createWatchingPresence({
        title,
        season,
        episode,
        privacyDetails: s().watchSeries,
        image: tmdbSummary?.image || contentImage,
      }),
      { allowPageTimestamp: false },
    )
  }

  const watchAnimeMatch = pathname.match(WATCH_ANIME_PATH_PATTERN)
  if (watchAnimeMatch) {
    const animeId = getMatchPart(watchAnimeMatch, 1)
    const season = getMatchPart(watchAnimeMatch, 2)
    const episode = getMatchPart(watchAnimeMatch, 3)
    const tmdbSummary = await getWatchTmdbSummary('tv', animeId)
    const rawTitle = getWatchTitle(tmdbSummary?.title || s().fallbackAnime)
    const title
      = rawTitle.replace(EPISODE_CODE_SUFFIX_PATTERN, '').trim()
        || s().fallbackAnime

    return finalizeRoutePresence(
      context,
      createWatchingPresence({
        title,
        season,
        episode,
        privacyDetails: s().watchAnime,
        image: tmdbSummary?.image || contentImage,
      }),
      { allowPageTimestamp: false },
    )
  }

  if (pathname === '/watchparty/create') {
    const party = getPartyContext()
    let episodeCode
      = party.season && party.episode ? `S${party.season}E${party.episode}` : ''

    if (!episodeCode) {
      const badgeMatch = (document.body.textContent || '').match(
        /\bS(\d{1,2})\s?E(\d{1,3})\b/,
      )
      if (badgeMatch) {
        episodeCode = `S${badgeMatch[1]}E${badgeMatch[2]}`
      }
    }

    const baseTitle
      = party.title || String(firstNonEmpty(getText('h2'), getText('h1'), ''))
    const title = baseTitle
      ? episodeCode
        ? `${baseTitle} - ${episodeCode}`
        : baseTitle
      : s().newParty
    const posterCandidate = toAbsoluteUrl(
      party.poster || getAttribute('img[src*="image.tmdb.org"]', 'src'),
    )

    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().createParty,
        title,
        posterCandidate && isImageUrlAllowed(posterCandidate)
          ? posterCandidate
          : pageImage,
      ),
    )
  }

  const watchpartyRoomMatch = pathname.match(ROUTE_WATCHPARTY_ROOM_PATTERN)
  if (watchpartyRoomMatch) {
    const roomId = getMatchPart(watchpartyRoomMatch, 1)
    const party = getPartyContext()
    const fallbackImage
      = contentImage === FALLBACK_LOGO ? pageImage : contentImage

    if (party.title && !isPrivacyModeEnabled()) {
      const episodeCode
        = party.season && party.episode
          ? `S${party.season}E${party.episode}`
          : ''
      const partyPoster = toAbsoluteUrl(party.poster)
      const presenceData = buildBasePresence(
        partyPoster && isImageUrlAllowed(partyPoster)
          ? partyPoster
          : fallbackImage,
      )

      presenceData.type = ActivityType.Watching
      presenceData.details = episodeCode
        ? `${party.title} - ${episodeCode}`
        : party.title
      presenceData.state
        = party.participants > 0
          ? `${s().inParty} - ${
            party.participants === 1
              ? s().participantsOne
              : format(s().participantsMany, party.participants)
          }`
          : s().inParty

      applyVideoPlaybackToPresence(presenceData)

      return finalizeRoutePresence(context, presenceData)
    }

    const roomTitle = firstNonEmpty(
      getAttribute('h1[title]', 'title'),
      getText('h1'),
      getText('h2'),
      format(s().roomId, shortenId(roomId)),
    )

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(String(roomTitle), s().inParty, fallbackImage),
    )
  }

  const watchpartyJoinMatch = pathname.match(ROUTE_WATCHPARTY_JOIN_PATTERN)
  if (watchpartyJoinMatch) {
    const joinCode = getMatchPart(watchpartyJoinMatch, 1)
    const state = joinCode
      ? format(s().codeValue, safeDecode(joinCode).toUpperCase())
      : String(firstNonEmpty(getText('h2'), getText('h1'), s().codeEntry))

    return finalizeRoutePresence(
      context,
      createPagePresence(s().joinParty, state, pageImage),
    )
  }

  if (pathname === '/watchparty/list') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().browseRooms,
        String(firstNonEmpty(getText('h1'), s().publicRooms)),
        pageImage,
      ),
    )
  }

  return null
}
