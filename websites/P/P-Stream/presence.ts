import { ActivityType, Assets, getTimestamps } from 'premid'

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
    largeImageKey: 'https://i.ibb.co/V0w7PwJ3/logo-1.png',
    type: ActivityType.Watching,
  }

  if (pathname === '/' || pathname.startsWith('/search') || pathname.startsWith('/discover')) {
    presenceData.details = 'Browsing...'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.startsWith('/media')) {
    const pageMeta = await presence.getPageVariable<{ meta?: { player?: MWPlayerData } }>('meta')
    const media = pageMeta?.meta?.player

    if (!media)
      return

    const { meta, progress, episode, season, controls } = media

    presenceData.largeImageKey = meta.poster.trim()

    const title = `${meta.title} (${meta.year})`
    if (meta.type === 'show' && episode && season) {
      presenceData.details = meta.title
      presenceData.state = `S${season.number} · E${episode.number} · ${episode.title}`
    }
    else {
      presenceData.details = title
    }

    if (showProgressBar && progress?.time != null && progress?.duration > 0) {
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

    if (controls.isLoading) {
      presenceData.smallImageKey = 'https://i.ibb.co/V0w7PwJ3/logo-1.png'
      presenceData.smallImageText = 'Loading'
    }
    else if (controls.isPlaying) {
      const video = document.querySelector('video')
      if (video?.duration) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )
      }
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
  }

  if (!showTimestamp) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (!showProgressBar && !presenceData.state) {
    delete presenceData.state
  }

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
  const progress = Math.min(100, Math.max(0, Math.floor((time / duration) * 100)))
  const barLength = Number.isNaN(Number.parseInt(barLengthString, 10))
    ? 10
    : Number.parseInt(barLengthString, 10)
  const numChars = Math.floor((progress / 100) * barLength)

  const bar = `${barFill.repeat(numChars)}${barTrack.repeat(barLength - numChars)}`
  return showLabel ? `${bar} ${progress}%` : bar
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
