import type { Resolver } from '../util/interfaces.js'
import { ActivityType } from 'premid'
import { ActivityAssets, getText } from '../util/index.js'

function getMainVideo(doc: Document): HTMLVideoElement | null {
  const playerContainer = doc.querySelector('.video-player-player')

  if (playerContainer) {
    return playerContainer.querySelector('video')
  }
  return null
}

function isPlaying(doc: Document, video: HTMLVideoElement): boolean {
  if (video.seeking)
    return false

  const pauseIcon = doc.querySelector('.video-player-controls .icon-font-chess.pause')
  if (pauseIcon)
    return true

  return !video.paused
}

const videoResolver: Resolver = {
  isActive: pathname => pathname.includes('/video'),

  getDetails: (t, doc) => doc.location.pathname.includes('/player/') ? t.media_video : t.video_browsing,

  getState: (t, doc) => {
    if (doc.location.pathname.includes('/player/')) {
      const ogTitle = doc.querySelector('meta[property="og:title"]')
      if (ogTitle) {
        const content = ogTitle.getAttribute('content')
        if (content)
          return content.replace(' - Chess.com', '').trim()
      }
      return getText(['h1']) || t.video_watching
    }
    return t.video_library
  },

  getTimestamps: (t, doc) => {
    if (doc.location.pathname.includes('/player/')) {
      const video = getMainVideo(doc)

      if (!video || !Number.isFinite(video.duration))
        return undefined

      if (isPlaying(doc, video) && video.currentTime > 0) {
        const now = Date.now()
        const startTimeMs = now - (video.currentTime * 1000)
        const endTimeMs = startTimeMs + (video.duration * 1000)

        return {
          start: Math.floor(startTimeMs / 1000),
          end: Math.floor(endTimeMs / 1000),
        }
      }
    }
    return undefined
  },

  getType: (t, doc) => doc.location.pathname.includes('/player/') ? ActivityType.Watching : undefined,

  getButtons: (t, doc) => {
    if (doc.location.pathname.includes('/player/')) {
      return [{ label: t.button_watch_video, url: doc.location.href }]
    }
    return undefined
  },

  getLargeImageKey: (t, doc) => {
    if (doc.location.pathname.includes('/player/')) {
      const ogImage = doc.querySelector('meta[property="og:image"]')
      if (ogImage) {
        return ogImage.getAttribute('content') || ActivityAssets.Logo
      }
    }
    return ActivityAssets.Logo
  },

  getSmallImageKey: (t, doc) => {
    if (doc.location.pathname.includes('/player/')) {
      const video = getMainVideo(doc)

      if (video && !isPlaying(doc, video)) {
        return ActivityAssets.IconPause
      }

      return ActivityAssets.IconPlay
    }
    return undefined
  },

  getSmallImageText: (t, doc) => {
    if (doc.location.pathname.includes('/player/')) {
      const video = getMainVideo(doc)

      if (video && !isPlaying(doc, video))
        return t.pause
      return t.play
    }
    return undefined
  },
}

export default videoResolver
