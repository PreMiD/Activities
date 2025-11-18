import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1120627624377589820',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

interface MWMediaMeta {
  title: string
  type: 'show' | 'movie'
  tmdbId: string
  year: number
  poster: string
}

interface MWControls {
  isPlaying: boolean
  isLoading: boolean
}

interface MWSeason {
  number: number
  tmdbId: string
  title: string
}

interface MWEpisode {
  number: number
  tmdbId: string
  title: string
}

interface MWProgress {
  time: number
  duration: number
}

interface MWPlayerData {
  meta: MWMediaMeta
  controls: MWControls
  season?: MWSeason
  episode?: MWEpisode
  progress: MWProgress
}

let lastPlayerData: MWPlayerData | null = null
let isActuallyPlaying = false
let isLoading = false
let lastUpdateTime = 0

function getCurrentSite(): string {
  const { hostname } = document.location
  const siteMap: { [key: string]: string } = {
    'pstream.mov': 'P-Stream',
    'beta.pstream.mov': 'P-Stream Beta',
    'mirror.pstream.mov': 'P-Stream Mirror',
    'movies.levrx.de': 'Levrx Movies',
    'streamerflix.xyz': 'StreamerFlix',
    'streamwatch.online': 'StreamWatch',
    'movies.samj.app': 'SamJ Movies',
    'sudo-flix.nl': 'Sudo-Flix',
    'lordflix.club': 'LordFlix',
  }
  return siteMap[hostname] || 'movie-web'
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const currentSite = getCurrentSite()

  const [
    showTimestamp,
    showProgressBar,
    barLengthString,
    barTrack,
    barFill,
    showLabel,
  ] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('progress'),
    presence.getSetting<string>('barLength'),
    presence.getSetting<string>('barTrack'),
    presence.getSetting<string>('barFill'),
    presence.getSetting<boolean>('showLabel'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/movie-web/assets/logo.png',
    type: ActivityType.Watching,
  }

  let mediaPlayer: MWPlayerData | null = null
  try {
    const { meta } = await presence.getPageVariable<{ meta?: { player?: MWPlayerData } }>('meta')
    if (meta?.player) mediaPlayer = meta.player
  } catch {}

  if (mediaPlayer) {
    const { meta, progress, episode, season, controls } = mediaPlayer
    lastPlayerData = mediaPlayer
    presenceData.largeImageKey = meta.poster || presenceData.largeImageKey
    presenceData.buttons = [{ label: `Watch on ${currentSite}`, url: href }]
    presenceData.name = `${currentSite} - ${document.title}`

    if (meta.type === 'show' && episode && season) {
      presenceData.details = `${meta.title} - S${season.number}E${episode.number}`
      if (episode.title) presenceData.details += `: ${episode.title}`
      presenceData.smallImageText = 'TV Series'
    } else {
      presenceData.details = `${meta.title} (${meta.year})`
      presenceData.smallImageText = 'Movie'
    }

    if (showProgressBar && progress.time && progress.duration) {
      presenceData.state = createProgressBar(progress.time, progress.duration, {
        barLengthString,
        barFill,
        barTrack,
        showLabel,
      })
    }

    const videoElement = document.querySelector('video')
    const currentTime = Date.now()

    if (controls.isLoading || (videoElement && videoElement.readyState < 3)) {
      isLoading = true
      isActuallyPlaying = false
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/movie-web/assets/0.gif'
      presenceData.smallImageText = 'Loading...'
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    } else if (controls.isPlaying || (videoElement && !videoElement.paused && videoElement.readyState >= 3)) {
      isLoading = false
      isActuallyPlaying = true
      if (videoElement && progress.time && progress.duration && showTimestamp) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          Math.floor(progress.time),
          Math.floor(progress.duration)
        )
      }
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
      lastUpdateTime = currentTime
    } else {
      isLoading = false
      isActuallyPlaying = false
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presence.setActivity(presenceData)
  } else if (pathname.startsWith('/settings')) {
    presenceData.details = `Changing settings on ${currentSite}`
    presenceData.state = 'Preferences'
    presenceData.startTimestamp = browsingTimestamp
    presence.setActivity(presenceData)
  } else if (pathname === '' || pathname === '/' || pathname.startsWith('/search') || pathname.startsWith('/discover')) {
    let state = 'Homepage'
    let details = `Browsing ${currentSite}`
    if (pathname.startsWith('/search')) {
      const query = new URLSearchParams(document.location.search).get('q')
      details = `Searching on ${currentSite}`
      state = query ? `"${query}"` : 'Searching...'
    } else if (pathname.startsWith('/discover')) {
      details = `Discovering on ${currentSite}`
      state = 'Browse content'
    }
    presenceData.details = details
    presenceData.state = state
    presenceData.startTimestamp = browsingTimestamp
    presence.setActivity(presenceData)
  } else {
    presence.clearActivity()
  }
})

window.addEventListener('beforeunload', () => {
  presence.clearActivity()
})

window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    presence.clearActivity()
  }
})

function createProgressBar(
  time: number,
  duration: number,
  barOptions: {
    barLengthString: string
    barTrack: string
    barFill: string
    showLabel: boolean
  },
): string {
  const { barLengthString, barTrack, barFill, showLabel } = barOptions
  const progress = Math.floor((time / duration) * 100)
  const barLength = Number.isNaN(Number.parseInt(barLengthString, 10))
    ? 8
    : Number.parseInt(barLengthString, 10)
  const numChars = Math.floor((progress / 100) * barLength)

  return `${barFill.repeat(numChars)}${barTrack.repeat(
    barLength - numChars,
  )}  ${showLabel ? `${progress}%` : ''}`.trimEnd()
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
