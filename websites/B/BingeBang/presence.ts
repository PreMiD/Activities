import { ActivityType, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1564637288045088949',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/4jb06Gm.png',
  Play = 'https://cdn.rcd.gg/PreMiD/resources/play.png',
  Pause = 'https://cdn.rcd.gg/PreMiD/resources/pause.png',
}

interface VideoData {
  currentTime: number
  duration: number
  paused: boolean
}

/** "Cyberpunk: Edgerunners S01E01 · Player · BingeBang" -> "Cyberpunk: Edgerunners S01E01" */
function getRawTitle(): string {
  return document.title.split(' · ')[0]?.trim() ?? ''
}

function getCover(): string | undefined {
  return document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content || undefined
}

function getVideo(): VideoData | null {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (video && !Number.isNaN(video.duration)) {
    return {
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    }
  }
  return null
}

presence.on('UpdateData', async () => {
  const [showButtons, showCover] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
  ])
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
  })

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { href, pathname } = document.location
  const path = pathname.split('/').filter(Boolean)
  const rawTitle = getRawTitle()
  const cover = showCover ? getCover() : undefined

  // Home
  if (path.length === 0) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Home'
  }
  // Catalog: /movies and /tv
  else if (path.length === 1 && path[0] === 'movies') {
    presenceData.details = 'Exploring catalog'
    presenceData.state = 'Movies'
  }
  else if (path.length === 1 && path[0] === 'tv') {
    presenceData.details = 'Exploring catalog'
    presenceData.state = 'TV Shows'
  }
  // Movie player: /movie/play/<slug>
  else if (path[0] === 'movie' && path[1] === 'play') {
    const yearMatch = rawTitle.match(/\s*\((\d{4})\)\s*$/)
    const title = rawTitle.replace(/\s*\(\d{4}\)\s*$/, '').trim()

    presenceData.name = title
    presenceData.details = title
    presenceData.state = yearMatch?.[1] ?? 'Movie'
    if (cover)
      presenceData.largeImageKey = cover

    applyVideoState(presenceData, strings)

    if (showButtons)
      presenceData.buttons = [{ label: 'Watch Movie', url: href }]
  }
  // Series player: /tv/play/<slug>/<season>/<episode>
  else if (path[0] === 'tv' && path[1] === 'play') {
    const episodeMatch = rawTitle.match(/\s+S(\d+)E(\d+)\s*$/i)
    const title = rawTitle.replace(/\s+S\d+E\d+\s*$/i, '').trim()
    const season = episodeMatch?.[1] ?? path[3]
    const episode = episodeMatch?.[2] ?? path[4]
    const episodeLabel = season && episode
      ? `S${season.padStart(2, '0')}E${episode.padStart(2, '0')}`
      : 'Series'

    presenceData.name = title
    presenceData.details = title
    presenceData.state = episodeLabel
    if (cover)
      presenceData.largeImageKey = cover

    applyVideoState(presenceData, strings)

    if (showButtons)
      presenceData.buttons = [{ label: 'Watch Series', url: href }]
  }
  // Any other page (calendar, explore, my-space, etc.): show nothing
  else {
    presence.clearActivity()
    return
  }

  presence.setActivity(presenceData)
})

function applyVideoState(
  presenceData: PresenceData,
  strings: { play: string, pause: string },
) {
  const video = getVideo()
  if (!video)
    return

  if (video.paused) {
    presenceData.smallImageKey = ActivityAssets.Pause
    presenceData.smallImageText = strings.pause
    delete presenceData.startTimestamp
  }
  else {
    const [startTimestamp, endTimestamp] = getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )
    presenceData.smallImageKey = ActivityAssets.Play
    presenceData.smallImageText = strings.play
    presenceData.startTimestamp = startTimestamp
    presenceData.endTimestamp = endTimestamp
  }
}
