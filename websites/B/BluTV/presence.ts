import { Assets } from 'premid'

const presence = new Presence({
  clientId: '664216462038401066',
})
const strings = presence.getStrings({
  playing: 'general.playing',
  paused: 'general.paused',
  browsing: 'general.browsing',
})

function seriesName(name: string): string {
  return name.replace(/([^\W_][^\s-]*) */g, (text) => {
    return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()
  })
}

const startTimestamp = Math.floor(Date.now() / 1000)

let data: Data | null,
  video: {
    paused: boolean
    duration: number
    currentTime: number
  } | null

interface Data {
  video: {
    paused: boolean
    duration: number
    currentTime: number
  }
  series?: {
    name: string
    ep: string
    season: string
  }
  movie?: {
    name: string
  }
}

presence.on('iFrameData', (msg: unknown) => {
  if (!msg)
    return
  ({ video } = msg as Data)
  data = msg as Data
})

presence.on('UpdateData', async () => {
  const path = document.location.pathname
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/BluTV/assets/logo.png',
  }

  if (!path.includes('izle')) {
    video = null
    data = null
  }

  if (data) {
    if (data.series) {
      presenceData.details = data.series.name ?? seriesName(path.split('/')[3]!.replace(/-/g, ' '))
      presenceData.state = `${data.series.season} | ${data.series.ep}`
    }
    else {
      presenceData.details = path.startsWith('/canli-yayin')
        ? 'Bir televizyon yayını izliyor:'
        : 'Bir film izliyor:'
      presenceData.state = data.movie?.name
    }

    if (video) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused
        ? (await strings).paused
        : (await strings).playing

      const [startTimestamp, endTimestamp] = presence.getTimestamps(
        Math.floor(video.currentTime),
        Math.floor(video.duration),
      )
      if (
        video.duration
        && !video.paused
        && !document.location.pathname.startsWith('/canli-yayin')
      ) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = [
          startTimestamp,
          endTimestamp,
        ]
      }
    }
  }
  else {
    presenceData.startTimestamp = startTimestamp
    presenceData.details = (await strings).browsing
  }

  presence.setActivity(presenceData)
})
