import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1555816425556414554',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/5OqXGcI.png',
}

interface PlayerVideoData {
  paused: boolean
  ended: boolean
  currentTime: number
  duration: number
  playbackRate?: number
}

interface IFrameData {
  video?: PlayerVideoData | null
  videoId?: string | null
}

interface ActivityStrings {
  browsing: string
  playing: string
  paused: string
  homepage: string
  videoPage: string
  loadingVideo: string
  watchingVideo: string
  videoEnded: string
  viewVideo: string
}

let iFrameData: IFrameData = {}
let iFrameUpdatedAt = 0
let browsingTimestamp = Math.floor(Date.now() / 1000)
let previousPath = document.location.pathname
let wasWatchingVideo = false

presence.on('iFrameData', (data: IFrameData) => {
  const videoId = getVideoId(document.location.pathname)
  if (!videoId || data.videoId !== videoId)
    return

  iFrameData = data
  iFrameUpdatedAt = Date.now()
})

function getVideoId(pathname: string): string | null {
  return pathname.match(/^\/(?:d|e)\/([A-Za-z0-9]+)(?:\/|$)/)?.[1] ?? null
}

function getDirectVideoData(): PlayerVideoData | null {
  const video = document.querySelector<HTMLVideoElement>('video')

  if (!video)
    return null

  return {
    paused: video.paused,
    ended: video.ended,
    currentTime: Number.isFinite(video.currentTime) ? video.currentTime : 0,
    duration: Number.isFinite(video.duration) ? video.duration : 0,
    playbackRate: video.playbackRate,
  }
}

function getOriginalVideoTitle(): string {
  const heading = (document.querySelector<HTMLElement>('.video-title')
    ?? document.querySelector<HTMLElement>('h4'))
    ?.textContent
    ?.trim()

  if (heading)
    return heading

  return document.title
    .replace(/\s*[-|]\s*(?:DoodStream|PlayMogo)(?:\.com)?\s*$/i, '')
    .trim()
}

function cleanVideoTitle(title: string): string {
  return title
    .replace(/\s*[-|]\s*(?:DoodStream|PlayMogo)(?:\.com)?\s*$/i, '')
    .replace(/\s*\/\s*Fullmatchshows(?:\.com)?\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text: string, maxLength = 128): string {
  if (text.length <= maxLength)
    return text

  return `${text.slice(0, maxLength - 1).trimEnd()}\u2026`
}

function getVideoPageUrl(videoId: string | null): string | null {
  if (!videoId)
    return null

  return `${document.location.origin}/d/${videoId}`
}

function applyMediaTimestamps(
  presenceData: PresenceData,
  currentTime: number,
  duration: number,
  mode: number,
  playbackRate = 1,
): void {
  if (
    !Number.isFinite(currentTime)
    || !Number.isFinite(duration)
    || currentTime < 0
    || duration <= 0
    || !Number.isFinite(playbackRate)
    || playbackRate <= 0
  ) {
    return
  }

  const [startTimestamp, endTimestamp] = getTimestamps(
    Math.min(currentTime, duration) / playbackRate,
    duration / playbackRate,
  )

  if (mode === 1) {
    presenceData.startTimestamp = startTimestamp
    return
  }

  if (mode === 2) {
    presenceData.endTimestamp = endTimestamp
    return
  }

  presenceData.startTimestamp = startTimestamp
  presenceData.endTimestamp = endTimestamp
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const videoId = getVideoId(pathname)
  const isVideoPage = videoId !== null

  if (pathname !== previousPath) {
    previousPath = pathname
    browsingTimestamp = Math.floor(Date.now() / 1000)
    iFrameData = {}
  }

  const [
    privacyMode,
    showBrowsing,
    titleFormat,
    showPlaybackState,
    showPlaybackIcon,
    hidePaused,
    showTimestamp,
    timestampMode,
    showButtons,
    strings,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('showBrowsing'),
    presence.getSetting<number>('titleFormat'),
    presence.getSetting<boolean>('showPlaybackState'),
    presence.getSetting<boolean>('showPlaybackIcon'),
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<number>('timestampMode'),
    presence.getSetting<boolean>('showButtons'),
    presence.getStrings({
      browsing: 'general.browsing',
      playing: 'general.playing',
      paused: 'general.paused',
      homepage: 'playmogo.homepage',
      videoPage: 'playmogo.videoPage',
      loadingVideo: 'playmogo.loadingVideo',
      watchingVideo: 'playmogo.watchingVideo',
      videoEnded: 'playmogo.videoEnded',
      viewVideo: 'playmogo.viewVideo',
    }) as Promise<ActivityStrings>,
  ])

  const video = getDirectVideoData()
    ?? (Date.now() - iFrameUpdatedAt < 15000 ? iFrameData.video : null)
    ?? null

  if (video && isVideoPage) {
    wasWatchingVideo = true

    if (!privacyMode && hidePaused && video.paused && !video.ended) {
      presence.clearActivity()
      return
    }

    const originalTitle = getOriginalVideoTitle()
    const formattedTitle = titleFormat === 1
      ? originalTitle
      : cleanVideoTitle(originalTitle)

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'PlayMogo',
      details: privacyMode
        ? strings.watchingVideo
        : truncate(formattedTitle || strings.watchingVideo),
    }

    if (showPlaybackState) {
      if (video.ended)
        presenceData.state = strings.videoEnded
      else if (video.paused)
        presenceData.state = strings.paused
      else
        presenceData.state = strings.playing
    }

    if (showPlaybackIcon && !video.ended) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? strings.paused : strings.playing
    }

    if (!privacyMode && showTimestamp && !video.paused && !video.ended) {
      applyMediaTimestamps(
        presenceData,
        video.currentTime,
        video.duration,
        timestampMode,
        video.playbackRate,
      )
    }

    if (!privacyMode && showButtons) {
      const videoPageUrl = getVideoPageUrl(videoId)

      if (videoPageUrl) {
        presenceData.buttons = [
          {
            label: strings.viewVideo,
            url: videoPageUrl,
          },
        ]
      }
    }

    presence.setActivity(presenceData)
    return
  }

  if (wasWatchingVideo) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    wasWatchingVideo = false
  }

  if (isVideoPage) {
    const originalTitle = getOriginalVideoTitle()
    const formattedTitle = titleFormat === 1
      ? originalTitle
      : cleanVideoTitle(originalTitle)

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'PlayMogo',
      details: privacyMode
        ? strings.watchingVideo
        : truncate(formattedTitle || strings.videoPage),
    }

    if (showPlaybackState)
      presenceData.state = strings.loadingVideo

    if (!privacyMode && showButtons) {
      const videoPageUrl = getVideoPageUrl(videoId)

      if (videoPageUrl) {
        presenceData.buttons = [
          {
            label: strings.viewVideo,
            url: videoPageUrl,
          },
        ]
      }
    }

    presence.setActivity(presenceData)
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'PlayMogo',
    details: strings.browsing,
    state: pathname === '/' ? strings.homepage : 'PlayMogo',
  }

  if (!privacyMode && showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  presence.setActivity(presenceData)
})
