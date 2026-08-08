import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1521238188775968808',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/AEHpeDm.png',
}

interface DramaData {
  id: number
  thumbnail: string
  title: string
}

interface VideoData {
  currentTime: number
  duration: number
  paused: boolean
}

interface WatchContext {
  dramaId: string
  episode: string
  fallbackTitle: string
}

let iframeVideo: VideoData | null = null
let activeDramaId: string | null = null
let activeDrama: DramaData | null = null

presence.on('iFrameData', (data: VideoData | null) => {
  iframeVideo = data
})

function getWatchContext(): WatchContext | null {
  const url = new URL(document.location.href)
  const dramaId = url.searchParams.get('id')
  const episode = url.pathname.match(/\/Episode-([^/]+)/i)?.[1]
  const dramaTitle = url.pathname.match(/\/Drama\/([^/]+)/i)?.[1]

  if (!dramaId || !episode || !dramaTitle)
    return null

  return {
    dramaId,
    episode: decodeURIComponent(episode).replace(/-/g, ' '),
    fallbackTitle: decodeURIComponent(dramaTitle).replace(/-/g, ' '),
  }
}

function getPageVideo(): VideoData | null {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'))
  const video = videos.find(candidate => candidate.readyState > 0 && Number.isFinite(candidate.duration) && candidate.duration > 0)

  if (!video)
    return null

  return {
    currentTime: video.currentTime,
    duration: video.duration,
    paused: video.paused,
  }
}

function formatDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor(totalSeconds % 3600 / 60)
  const remainingSeconds = totalSeconds % 60

  if (hours > 0)
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getPlaybackState(episode: string, video: VideoData): string {
  const progress = `${formatDuration(video.currentTime)} / ${formatDuration(video.duration)}`
  return video.paused
    ? `Episode ${episode} - Paused at ${progress}`
    : `Episode ${episode} - ${progress}`
}

function loadDrama(dramaId: string) {
  if (activeDramaId === dramaId)
    return

  activeDramaId = dramaId
  activeDrama = null

  void fetch(`/api/DramaList/Drama/${dramaId}?isq=false`)
    .then(async (response) => {
      if (!response.ok)
        throw new Error(`Unable to load KissKH drama ${dramaId}`)

      return response.json() as Promise<DramaData>
    })
    .then((drama) => {
      if (activeDramaId === dramaId)
        activeDrama = drama
    })
    .catch(() => {
      // The URL still supplies a readable fallback title if this public endpoint is temporarily unavailable.
    })
}

presence.on('UpdateData', () => {
  const watchContext = getWatchContext()
  const video = getPageVideo() ?? iframeVideo

  if (!watchContext || !video || !Number.isFinite(video.currentTime) || !Number.isFinite(video.duration) || video.duration <= 0) {
    presence.clearActivity()
    return
  }

  loadDrama(watchContext.dramaId)

  const title = activeDrama?.title ?? watchContext.fallbackTitle
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    details: title,
    state: getPlaybackState(watchContext.episode, video),
    largeImageKey: activeDrama?.thumbnail || ActivityAssets.Logo,
    largeImageText: `${title} - Episode ${watchContext.episode}`,
    smallImageKey: video.paused ? Assets.Pause : Assets.Play,
    smallImageText: video.paused ? 'Paused' : 'Playing',
    buttons: [
      {
        label: 'Watch on KissKH',
        url: document.location.href,
      },
    ],
  }

  if (!video.paused)
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)

  presence.setActivity(presenceData)
})
