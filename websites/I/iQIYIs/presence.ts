import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1378531046588678164',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/I/iQIYIs/assets/logo.png',
  Thumbnail = 'https://cdn.rcd.gg/PreMiD/websites/I/iQIYIs/assets/thumbnail.jpg',
}

interface PlayerMeta {
  id: string
  type: 'movie' | 'tv'
  title: string
  poster: string
  year: number
  runtime: number
  progress: number | null
  season?: number
  episode?: number
  eps_name?: string
}

const barLength = 8
const barTrack = '▱'
const barFill = '▰'

let latestPlayerMeta: PlayerMeta | any = {}

// 监听消息
window.addEventListener('message', (event) => {
  if (event.data.type === 'PREMID_PLAYER_META') {
    latestPlayerMeta = { ...latestPlayerMeta, ...event.data.data }
  }
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
  }
  const [
    showTimestamp,
    showWatchButton,
    showProgressBar,
    showLabel,
  ] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('watch'),
    presence.getSetting<boolean>('progress'),
    presence.getSetting<boolean>('showLabel'),
  ])
  const { pathname, href } = document.location
  if (pathname.startsWith('/tv') || pathname.startsWith('/movie')) {
    const { type, title, poster, year, runtime, progress, eps_name } = latestPlayerMeta
    presenceData.largeImageKey = poster || ActivityAssets.Thumbnail
    presenceData.smallImageKey = ActivityAssets.Logo || Assets.Pause
    presenceData.smallImageText = `watching\`${title}\`in ${document.location.hostname}`
    if (showProgressBar && runtime > 0) {
      if (progress != null && progress > 0) {
        presenceData.state = createProgressBar(progress, runtime * 60, {
          barFill,
          barTrack,
          showLabel,
        })
      }
      else {
        const elapsedTime = Math.floor((Date.now() / 1000) - browsingTimestamp)
        presenceData.state = createProgressBar(elapsedTime, runtime * 60, {
          barFill,
          barTrack,
          showLabel,
        })
      }
    }

    if (showWatchButton) {
      presenceData.buttons = [
        {
          label: `Watch ${capitalize(type)}`,
          url: href,
        },
      ]
    }

    const titleWithYear = `${title} (${year})`
    presenceData.name = title ? titleWithYear : document.title
    if (type === 'tv') {
      presenceData.details = eps_name
    }
    else {
      presenceData.details = title
    }

    if (showTimestamp && runtime > 0) {
      if (progress != null && progress > 0) {
        presenceData.startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(progress)
        presenceData.endTimestamp = presenceData.startTimestamp + (runtime * 60)
      }
      else {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.endTimestamp = browsingTimestamp + (runtime * 60)
      }
    }
  }
  else {
    presenceData.details = 'Browsing'
    presenceData.startTimestamp = browsingTimestamp
  }

  if (!showTimestamp) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (!showProgressBar) {
    delete presenceData.state
  }

  presence.setActivity(presenceData)
})

function createProgressBar(
  time: number,
  duration: number,
  barOptions: {
    barTrack: string
    barFill: string
    showLabel: boolean
  },
): string {
  const { barTrack, barFill, showLabel } = barOptions
  const progress = Math.min(Math.floor((time / duration) * 100), 100)
  const numChars = Math.floor((progress / 100) * barLength)

  return `${barFill.repeat(numChars)}${barTrack.repeat(barLength - numChars)} ${showLabel ? `${progress}%` : ''}`.trimEnd()
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
