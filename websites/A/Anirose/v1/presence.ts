import { ActivityType, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1444691269455446172',
})

enum ActivityAssets {
  Logo = 'icon',
  Small = 'icon',
}

let watchStartedAt = Math.floor(Date.now() / 1000)
let lastEpisodeKey: string | null = null
let lastKnownCurrentTime: number | null = null
let lastKnownDuration: number | null = null
let messageListenerAttached = false

let frameData: {
  currTime: number
  duration: number
  paused: boolean
} | null = null

presence.on(
  'iFrameData',
  (data: {
    currTime: number
    duration: number
    paused: boolean
  }) => {
    frameData = data
  },
)

function extractAnimeTitle(title: string): string {
  return title
    .replace(/\s*[\|\-]\s*AniRose.*$/i, '')
    .replace(/^watch\s*[:\-]?\s*/i, '')
    .replace(/\s+(?:english\s+)?(?:sub|dub)(?:bed)?\b.*$/i, '')
    .replace(/\s+online\s+free.*$/i, '')
    .trim()
}

function getEpisodeNumbers(): { current: string | null, total: string | null } {
  const episodeParam = new URLSearchParams(location.search).get('ep')
  const currentFromUrl = episodeParam && /^\d+$/.test(episodeParam) ? episodeParam : null

  const epCounter
    = Array.from(document.querySelectorAll('button, a, span, div'))
      .map(node => node.textContent?.trim() ?? '')
      .find(text => /^Ep\s*\d+\s*\/\s*\d+/i.test(text))

  const counterMatch = epCounter?.match(/^Ep\s*(\d+)\s*\/\s*(\d+)/i)
  if (counterMatch) {
    return {
      current: currentFromUrl ?? counterMatch[1] ?? null,
      total: counterMatch[2] ?? null,
    }
  }

  if (currentFromUrl) {
    return { current: currentFromUrl, total: null }
  }

  return { current: null, total: null }
}

function getWatchEpisodeState(): { state: string, key: string | null } {
  const numbers = getEpisodeNumbers()
  if (numbers.current) {
    return {
      state: `Episode ${numbers.current}`,
      key: numbers.current,
    }
  }

  return { state: 'Watching', key: null }
}

function getElapsedTimestamp(): number | null {
  if (frameData && Number.isFinite(frameData.currTime) && frameData.currTime > 0) {
    return Math.floor(Date.now() / 1000 - frameData.currTime)
  }

  const video = document.querySelector('video')
  if (video && Number.isFinite(video.currentTime) && video.currentTime > 0) {
    return Math.floor(Date.now() / 1000 - video.currentTime)
  }

  if (lastKnownCurrentTime !== null && lastKnownCurrentTime > 0) {
    return Math.floor(Date.now() / 1000 - lastKnownCurrentTime)
  }

  return watchStartedAt
}

function extractCurrentTimeFromMessage(data: unknown): number | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const payload = data as Record<string, unknown>
  const candidates = [
    payload.currentTime,
    payload.current_time,
    payload.position,
    payload.playedSeconds,
    payload.played_seconds,
    payload.time,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= 0) {
      return candidate
    }
  }

  return null
}

function extractDurationFromMessage(data: unknown): number | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const payload = data as Record<string, unknown>
  const candidates = [
    payload.duration,
    payload.total,
    payload.length,
    payload.fullDuration,
    payload.full_duration,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0) {
      return candidate
    }
  }

  return null
}

function attachMessageListener() {
  if (messageListenerAttached) {
    return
  }

  messageListenerAttached = true

  window.addEventListener('message', (event) => {
    const objectTime = extractCurrentTimeFromMessage(event.data)
    const objectDuration = extractDurationFromMessage(event.data)

    if (objectTime !== null) {
      lastKnownCurrentTime = objectTime
    }

    if (objectDuration !== null) {
      lastKnownDuration = objectDuration
    }

    if (typeof event.data === 'string') {
      try {
        const parsed = JSON.parse(event.data) as unknown
        const parsedTime = extractCurrentTimeFromMessage(parsed)
        const parsedDuration = extractDurationFromMessage(parsed)

        if (parsedTime !== null) {
          lastKnownCurrentTime = parsedTime
        }

        if (parsedDuration !== null) {
          lastKnownDuration = parsedDuration
        }
      }
      catch {
        // Ignore non-JSON string messages from unrelated frames
      }
    }
  })
}

function getPageTitle(): string {
  const ogTitle = document
    .querySelector('meta[property="og:title"]')
    ?.getAttribute('content')

  const heading
    = document.querySelector('main h1')?.textContent
    ?? document.querySelector('h1')?.textContent
    ?? ogTitle
    ?? document.title

  return extractAnimeTitle(heading)
}

presence.on('UpdateData', async () => {
  attachMessageListener()
  const isWatching = /^\/watch$/i.test(location.pathname)

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: ActivityAssets.Small,
    smallImageText: isWatching ? 'Watching' : 'Browsing',
  }

  const animeTitle = getPageTitle()

  if (isWatching) {
    presenceData.name = animeTitle || 'Anirose'

    const watchState = getWatchEpisodeState()
    presenceData.details = watchState.state
    presenceData.state = animeTitle

    if (watchState.key !== lastEpisodeKey) {
      watchStartedAt = Math.floor(Date.now() / 1000)
      lastEpisodeKey = watchState.key
      lastKnownCurrentTime = null
      lastKnownDuration = null
      frameData = null
    }

    if (
      frameData
      && Number.isFinite(frameData.currTime)
      && Number.isFinite(frameData.duration)
      && frameData.duration > 0
    ) {
      ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
        frameData.currTime,
        frameData.duration,
      )
    }
    else if (
      lastKnownCurrentTime !== null
      && lastKnownDuration !== null
      && lastKnownDuration > 0
    ) {
      ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
        lastKnownCurrentTime,
        lastKnownDuration,
      )
    }
    else {
      delete presenceData.endTimestamp
      const elapsed = getElapsedTimestamp()
      if (elapsed) {
        presenceData.startTimestamp = elapsed
      }
    }

    presenceData.buttons = [
      {
        label: 'Watch Anime',
        url: location.href,
      },
    ]
  }
  else {
    presenceData.name = 'Anirose'
    presenceData.details = 'Browsing Anirose'
    presenceData.state = animeTitle
    lastEpisodeKey = null
    frameData = null
  }

  presence.setActivity(presenceData)
})
