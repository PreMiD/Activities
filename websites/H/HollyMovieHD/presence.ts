import { ActivityType, Assets, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1527392816966402270',
})

const LOGO = 'https://i.imgur.com/eNrh6LG.png'

interface VideoData {
  currentTime: number
  duration: number
  paused: boolean
}

let videoData: VideoData | null = null
let videoDataReceivedAt = 0
let lastShowTimestamps: boolean | null = null

presence.on('iFrameData', (data) => {
  videoData = data as VideoData
  videoDataReceivedAt = Date.now()
})

function toSquare(url: string): string {
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=512&h=512&fit=contain&cbg=0000&output=png`
}

presence.on('UpdateData', async () => {
  const [hideWebsite, showTimestamps, largeImage] = await Promise.all([
    presence.getSetting<boolean>('hideWebsite'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<number>('largeImage'),
  ])

  // Clears activity and sets again without progress bar
  if (lastShowTimestamps === true && !showTimestamps) {
    lastShowTimestamps = showTimestamps
    presence.clearActivity()
    return
  }
  lastShowTimestamps = showTimestamps

  const data: PresenceData = {
    type: ActivityType.Watching,
    name: hideWebsite ? 'a movie' : 'HollyMovieHD',
    statusDisplayType: StatusDisplayType.Details,
    largeImageKey: LOGO,
  }

  if (!hideWebsite)
    data.largeImageText = 'HollyMovieHD'

  const slug = decodeURIComponent(window.location.pathname.replace(/^\/|\/$/g, ''))
  const match = slug.match(/^(.+)[-_]((?:19|20)\d{2})$/)

  if (!match) {
    videoData = null
    data.details = 'Browsing movies'
    data.state = slug ? 'Looking around' : 'Homepage'
    presence.setActivity(data)
    return
  }

  const rawTitle = match[1] ?? ''
  const year = match[2] ?? ''

  data.details = rawTitle
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
  data.state = year

  if (largeImage === 0) {
    const posterMatch = document.documentElement.innerHTML.match(
      /https:\/\/image\.tmdb\.org\/t\/p\/w342\/[\w-]+\.jpg/,
    )
    if (posterMatch)
      data.largeImageKey = toSquare(posterMatch[0].replace('/w342/', '/w500/'))
  }
  else if (largeImage === 1) {
    const backdrop = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
    if (backdrop)
      data.largeImageKey = backdrop
  }

  if (videoData) {
    if (videoData.paused) {
      data.smallImageKey = Assets.Pause
      data.smallImageText = 'Paused'
    }
    else {
      if (showTimestamps) {
        const elapsed = (Date.now() - videoDataReceivedAt) / 1000
        const currentTime = Math.min(videoData.currentTime + elapsed, videoData.duration)

        ;[data.startTimestamp, data.endTimestamp] = presence.getTimestamps(
          currentTime,
          videoData.duration,
        )
      }
      data.smallImageKey = Assets.Play
      data.smallImageText = 'Playing'
    }
  }

  presence.setActivity(data)
})
