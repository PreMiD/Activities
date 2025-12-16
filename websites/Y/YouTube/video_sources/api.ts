import type { Resolver } from '../util/index.js'
import { presence } from '../util/index.js'
import { getVideoID as getDefaultVideoID } from './default.js'
import { getVideoID as getShortsVideoID } from './shorts.js'

const videoCache = new Map<string, YouTubeAPIResponse>()
const videoCacheLoading = new Set<string>()

interface YouTubeAPIResponse {
  videoDetails: {
    title: string
    lengthSeconds: string
    channelId: string
    shortDescription: string
    thumbnail: {
      thumbnails: {
        url: string
      }[]
    }
    allowRatings: boolean
    viewCount: string
    author: string
    isPrivate: boolean
    isLiveContent: boolean
  }
  microformat: {
    category: string
  }
}

async function fetchVideoData(id: string) {
  const data = await presence.getPageVariable(
    'yt.config_.INNERTUBE_API_KEY',
    'yt.config_.INNERTUBE_CLIENT_NAME',
    'yt.config_.INNERTUBE_CLIENT_VERSION',
  )
  const request = fetch(
    `https://www.youtube.com/youtubei/v1/player?key=${data['yt.config_.INNERTUBE_API_KEY']}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: id,
        context: {
          client: {
            clientName: data['yt.config_.INNERTUBE_CLIENT_NAME'],
            clientVersion: data['yt.config_.INNERTUBE_CLIENT_VERSION'],
          },
        },
      }),
    },
  ).then(res => res.json() as Promise<YouTubeAPIResponse>)
  videoCacheLoading.add(id)
  videoCache.set(id, await request)
  videoCacheLoading.delete(id)
}

function isActive(): boolean {
  const currentVideoID = getVideoID()
  if (
    !videoCache.has(currentVideoID)
    && !videoCacheLoading.has(currentVideoID)
  ) {
    fetchVideoData(currentVideoID).catch(() => {
      presence.error('Failed to fetch video data through API')
    })
    return false
  }
  else if (videoCacheLoading.has(currentVideoID)) {
    return false
  }

  return (
    !!getTitle() && !!getUploader() && !!currentVideoID && !!getChannelURL()
  )
}

function getTitle(): string | undefined {
  return videoCache.get(getVideoID())?.videoDetails?.title
}

function getUploader(): string | undefined {
  return videoCache.get(getVideoID())?.videoDetails?.author
}

export function getVideoID(): string {
  return getDefaultVideoID() ?? getShortsVideoID()
}

export function getChannelURL(): string {
  return `https://www.youtube.com/channel/${
    videoCache.get(getVideoID())?.videoDetails?.channelId
  }`
}

export function isMusic(): boolean {
  return videoCache.get(getVideoID())?.microformat?.category === 'Music'
}

const resolver: Resolver = {
  isActive,
  getTitle,
  getUploader,
  getChannelURL,
  getVideoID,
  isMusic,
}

export default resolver
