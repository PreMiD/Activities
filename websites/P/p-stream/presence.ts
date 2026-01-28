import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1463157769053016239',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
let pausedTimestamp: number | null = null

enum CustomAssets {
  Logo = 'https://iili.io/friz2yB.png',
  LogoNoBG = 'https://iili.io/frizFTP.png',
}

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

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  const [
    showWhileMain,
    showWhileWatching,
    showTimestamp,
    showProgressBar,
    barLengthString,
    barTrack,
    barFill,
    showLabel,
  ] = await Promise.all([
    presence.getSetting<boolean>('showWhileMain'),
    presence.getSetting<boolean>('showWhileWatching'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('progress'),
    presence.getSetting<string>('barLength'),
    presence.getSetting<string>('barTrack'),
    presence.getSetting<string>('barFill'),
    presence.getSetting<boolean>('showLabel'),
  ])

  const presenceData: PresenceData = {
    name: 'P-Stream',
    type: ActivityType.Watching,
    largeImageKey: CustomAssets.Logo,
  }

  const isBrowsing
    = pathname === ''
      || pathname === '/'
      || pathname.startsWith('/browse')
      || pathname.startsWith('/discover')
      || pathname.startsWith('/search')

  if (isBrowsing) {
    presenceData.details = 'P-Stream'
    presenceData.state = 'Browsing'
    presenceData.startTimestamp = browsingTimestamp
    presenceData.largeImageText = 'P-Stream'

    return showWhileMain
      ? presence.setActivity(presenceData)
      : presence.clearActivity()
  }

  if (!pathname.startsWith('/media'))
    return

  const pageMeta
    = await presence.getPageVariable<{ meta?: { player?: MWPlayerData } }>('meta')

  const media = pageMeta?.meta?.player
  const video = document.querySelector('video') as HTMLVideoElement | null

  if (!media || !video)
    return

  const { meta, season, episode, progress, controls } = media

  presenceData.largeImageKey
    = meta.poster?.trim()
      || CustomAssets.Logo

  presenceData.details = meta.title

  if (meta.type === 'show' && season && episode) {
    presenceData.state
      = `S${season.number} · E${episode.number} · ${episode.title}`
  }
  else {
    presenceData.details
      = `${meta.title} (${meta.year})`
  }

  if (showProgressBar && progress?.time != null && progress.duration > 0) {
    presenceData.state = createProgressBar(progress.time, progress.duration, {
      barLengthString,
      barTrack,
      barFill,
      showLabel,
    })
  }

  presenceData.buttons = [
    {
      label: `Watch ${capitalize(meta.type)}`,
      url: href,
    },
    {
      label: 'Join the P-Stream Community',
      url: 'https://discord.gg/cYEt84BdXy',
    },
  ]

  presenceData.largeImageKey
    = navigator.mediaSession?.metadata?.artwork?.[0]?.src
      ?? presenceData.largeImageKey

  presenceData.smallImageKey = CustomAssets.LogoNoBG
  presenceData.smallImageText = 'P-Stream'

  if (controls.isLoading) {
    presenceData.smallImageText = 'Loading'
  }
  else if (controls.isPlaying && video.duration) {
    ;[presenceData.startTimestamp, presenceData.endTimestamp]
      = getTimestamps(
        Math.floor(video.currentTime),
        Math.floor(video.duration),
      )

    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Playing'
    pausedTimestamp = null
  }
  else {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    if (!pausedTimestamp)
      pausedTimestamp = Math.floor(Date.now() / 1000)

    presenceData.startTimestamp = pausedTimestamp
    delete presenceData.endTimestamp
  }

  if (!showTimestamp) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (!showProgressBar && !presenceData.state)
    delete presenceData.state

  showWhileWatching
    ? presence.setActivity(presenceData)
    : presence.clearActivity()
})

function createProgressBar(
  time: number,
  duration: number,
  options: {
    barLengthString: string
    barTrack: string
    barFill: string
    showLabel: boolean
  },
): string {
  const { barLengthString, barTrack, barFill, showLabel } = options
  const progress = Math.min(100, Math.floor((time / duration) * 100))
  const barLength = Number.parseInt(barLengthString, 10) || 10
  const filled = Math.floor((progress / 100) * barLength)

  const bar
    = `${barFill.repeat(filled)}${barTrack.repeat(barLength - filled)}`

  return showLabel ? `${bar} ${progress}%` : bar
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
