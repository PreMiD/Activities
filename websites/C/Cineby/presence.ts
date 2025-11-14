import type { MovieDetails, TvDetails } from './api.js'
import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'
import { CinebyApi } from './api.js'

const presence = new Presence({
  clientId: '1325115346696273993',
})
const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Cineby/assets/logo.png',
    details: 'Browsing',
    type: ActivityType.Watching,
    startTimestamp,
  }
  const { pathname } = document.location
  const [showBrowsing, useActivityName, showCover] = await Promise.all([
    presence.getSetting<boolean>('showBrowsing'),
    presence.getSetting<boolean>('useActivityName'),
    presence.getSetting<boolean>('showCover'),
  ])

  switch (pathname.split('/')[1]) {
    case 'movie': {
      const {
        title,
        poster_path: posterPath,
        release_date: releaseDate,
        runtime,
      } = await CinebyApi.getCurrent<MovieDetails>(pathname)

      if (useActivityName)
        presenceData.name = title
      presenceData.details = title
      presenceData.state = `${releaseDate
        ?.split('-')
        .shift()} • ${runtime} minutes`

      if (showCover)
        presenceData.largeImageKey = `https://image.tmdb.org/t/p/original${posterPath}`
      break
    }
    case 'tv': {
      const {
        name: title,
        season_poster: seasonPoster,
        episode_title: episodeTitle,
        season_number: seasonNumber,
        episode_number: episodeNumber,
      } = await CinebyApi.getCurrent<TvDetails>(pathname)

      if (useActivityName)
        presenceData.name = title

      presenceData.details = useActivityName ? episodeTitle : title
      presenceData.state = useActivityName
        ? `Season ${seasonNumber}, Episode ${episodeNumber}`
        : `S${seasonNumber}:E${episodeNumber} ${episodeTitle}`

      if (showCover)
        presenceData.largeImageKey = `https://image.tmdb.org/t/p/original${seasonPoster}`

      break
    }
    case 'anime': {
      const { details } = await CinebyApi.getCurrentAnime(pathname)
      const { title, thumbnail, episodes } = details
      const { episode, title: episodeTitle } = episodes.find(
        ({ episode }) =>
          episode === (Number.parseInt(pathname.split('/').pop() ?? '0') || 1),
      )!

      if (useActivityName)
        presenceData.name = title

      presenceData.details = useActivityName
        ? episodeTitle.replace(/E\d+: /, '').trim()
        : title
      presenceData.state = `Episode ${episode}`

      if (showCover)
        presenceData.largeImageKey = thumbnail
      break
    }
    default:
      if (!showBrowsing)
        return presence.clearActivity()
  }

  const video = document.querySelector('video')

  if (video) {
    if (!video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    }
    else {
      presenceData.smallImageKey = Assets.Pause
    }
  }

  presence.setActivity(presenceData)
})
