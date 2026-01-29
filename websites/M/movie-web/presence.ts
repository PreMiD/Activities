import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1120627624377589820',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

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

  if (pathname.startsWith('/media')) {
    const video = document.querySelector<HTMLVideoElement>('video#video-element')
    if (!video)
      return

    const title = document.title
    const isPlaying = !video.paused
    const isLoading = video.readyState < 3

    const titleMatch = title.match(/S(\d+)\s*-\s*E(\d+)/)

    presenceData.name = title
    presenceData.details = titleMatch
      ? `Season ${titleMatch[1]}, Episode ${titleMatch[2]}`
      : title

    if (video.currentTime && video.duration) {
      presenceData.state = createProgressBar(video.currentTime, video.duration, {
        barLengthString,
        barFill,
        barTrack,
        showLabel,
      })
    }

    if (showWatchButton) {
      presenceData.buttons = [
        {
          label: titleMatch ? 'Watch Show' : 'Watch Movie',
          url: href,
        },
      ]
    }

    if (isLoading) {
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/movie-web/assets/0.gif'
      presenceData.smallImageText = 'Loading'
    }
    else if (isPlaying) {
      const currentTime = Math.floor(Date.now() / 1000)
      const videoElapsed = Math.floor(video.currentTime)
      const timeRemaining = Math.floor(video.duration - video.currentTime)
      presenceData.startTimestamp = currentTime - videoElapsed
      presenceData.endTimestamp = currentTime + timeRemaining
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
  }
  else {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.name = 'Browsing'
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
