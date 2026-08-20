import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1539375669799293119',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.postimg.cc/wB7mrPS2/chicken-ICON-BLKBG.png',
}

function getEpisodeInfo(title: string | null | undefined): {
  name: string
  episodeInfo: string
} | null {
  if (!title)
    return null
  const match = title.match(/\(S(\d+)E(\d+)\)/i)
  if (!match)
    return null
  return {
    name: title.replace(/\s*\(S\d+E\d+\)\s*$/i, '').trim(),
    episodeInfo: `Season ${Number(match[1])}, Episode ${Number(match[2])}`,
  }
}

function getCurrentPoster(): string | undefined {
  return document
    .querySelector<HTMLImageElement>('#loader-movie-poster')
    ?.src
    || document.querySelector<HTMLImageElement>('#tv-sel-poster')
      ?.src
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Mvies',
  }
  const { pathname } = document.location
  const playerActive = document
    .querySelector('#video-overlay')
    ?.classList
    .contains('active')
  const tvSelector = document.querySelector<HTMLElement>('#tv-selector-container')
  const directory = document.querySelector<HTMLElement>('#directorySection')
  const tmdbSection = document.querySelector<HTMLElement>('#tmdbSection')
  const searchInput = document.querySelector<HTMLInputElement>('#searchInput')
  const watchParty = document.body.classList.contains('wp-active')
  const title = document
    .querySelector<HTMLElement>('#player-title-overlay')
    ?.textContent
    ?.trim() || ''

  if (playerActive) {
    const video = Array.from(document.querySelectorAll<HTMLVideoElement>('video'))
      .find(video => Number.isFinite(video.duration) && video.duration > 0)
      ?? document.querySelector<HTMLVideoElement>('#my-video')
    if (!video)
      return
    const playing = document.querySelector('.video-js.vjs-playing') !== null
      || (!video.paused && video.duration > 0)
    const episode = getEpisodeInfo(title)
    if (episode) {
      presenceData.details = document
        .querySelector<HTMLElement>('#tv-sel-title')
        ?.textContent
        ?.trim() || episode.name
      presenceData.state = `${episode.name} · ${episode.episodeInfo}`
    }
    else {
      presenceData.details = title
      presenceData.state = 'Watching a movie'
    }
    const now = Math.floor(Date.now() / 1000)
    if (Number.isFinite(video.duration) && video.duration > 0) {
      if (playing) {
        const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)
        presenceData.startTimestamp = startTimestamp || now
        presenceData.endTimestamp = endTimestamp
      }
      else {
        presenceData.startTimestamp = now - Math.max(0, Math.floor(video.currentTime))
        presenceData.endTimestamp = presenceData.startTimestamp + Math.floor(video.duration)
      }
    }
    else if (playing) {
      presenceData.startTimestamp = now
      delete presenceData.endTimestamp
    }
    presenceData.largeImageKey = getCurrentPoster() || ActivityAssets.Logo
    presenceData.smallImageKey = playing ? Assets.Play : Assets.Pause
    presenceData.smallImageText = playing
      ? (watchParty ? 'Playing in a watch party' : 'Playing')
      : 'Paused'
    presence.setActivity(presenceData)
    return
  }

  if (playerActive && tvSelector?.style.display === 'block') {
    presenceData.details = 'Browsing a TV show'
    presenceData.state = document
      .querySelector<HTMLElement>('#tv-sel-title')
      ?.textContent
      ?.trim() || 'Selecting an episode'
    presenceData.smallImageKey = Assets.Viewing
    presence.setActivity(presenceData)
    return
  }

  const searchQuery = searchInput?.value.trim()
  if (searchQuery) {
    presenceData.details = tmdbSection?.style.display === 'block'
      ? 'Viewing search results for'
      : 'Searching for'
    presenceData.state = searchQuery
    presenceData.smallImageKey = Assets.Search
    presence.setActivity(presenceData)
    return
  }

  if (directory?.style.display === 'block') {
    presenceData.details = 'Browsing the library'
    presenceData.state = document
      .querySelector<HTMLElement>('#navPath')
      ?.textContent
      ?.trim() || 'Mvies'
    presence.setActivity(presenceData)
    return
  }

  switch (pathname) {
    case '/':
      presenceData.details = 'Viewing the homepage'
      break
    case '/terms.html':
      presenceData.details = 'Viewing the terms of service'
      break
    case '/privacy.html':
      presenceData.details = 'Viewing the privacy policy'
      break
    default:
      presenceData.details = 'Browsing Mvies'
  }

  presence.setActivity(presenceData)
})
