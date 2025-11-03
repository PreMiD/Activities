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

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const [
    showTimestamp,
    showWatchButton,
    showProgressBar,
    barLengthString,
    barTrack,
    barFill,
    showLabel,
  ] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('watch'),
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

  if (pathname === '' || pathname.startsWith('/search') || pathname.startsWith('/discover')) {
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.startsWith('/media')) {
    const { meta: media } = await presence.getPageVariable<{
      meta: { player: MWPlayerData }
    }>('meta')
    if (!media?.player)
      return

    const { meta, progress, episode, season, controls } = media.player

    presenceData.largeImageKey = meta.poster

    if ((progress.time && progress.duration) !== 0) {
      presenceData.state = createProgressBar(progress.time, progress.duration, {
        barLengthString,
        barFill,
        barTrack,
        showLabel,
      })
    }

    if (showWatchButton) {
      presenceData.buttons = [
        {
          label: `Watch ${capitalize(meta.type)}`,
          url: href,
        },
      ]
    }

    const title = `${meta.title} (${meta.year})`
    presenceData.name = document.title

    if (meta.type === 'show' && episode && season)
      presenceData.details = `Season ${season.number}, Episode ${episode.number}`
    else presenceData.details = title

    if (controls.isLoading) {
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/movie-web/assets/0.gif'
      presenceData.smallImageText = 'Loading'
    }
    else if (controls.isPlaying) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(document.querySelector('video')!)
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
  }

  if (!showTimestamp)
    delete presenceData.endTimestamp

  if (!showProgressBar)
    delete presenceData.state

  presence.setActivity(presenceData)
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
    ? 10
    : Number.parseInt(barLengthString, 10)
  const numChars = Math.floor((progress / 100) * barLength)

  return `${barFill.repeat(numChars)}${barTrack.repeat(
    barLength - numChars,
  )}  ${showLabel ? `${progress}%` : ''}`.trimEnd()
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
