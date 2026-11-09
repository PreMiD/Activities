import {
  ActivityType,
  getTimestampsFromMedia,
} from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

// --------------------------------------------------
// Cached content data
// --------------------------------------------------

let lastContentKey = getContentKey()

let cachedTitle: string | undefined
let cachedPoster: string | undefined
let cachedMovieYear: string | undefined

let cachedSeason: number | undefined
let cachedEpisode: number | undefined
let cachedEpisodeTitle: string | undefined

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getContentKey() {
  const movieMatch = document.location.pathname.match(/^\/movie\/([^/]+)/)
  const tvMatch = document.location.pathname.match(/^\/tv\/([^/]+)/)

  if (movieMatch) {
    return `movie:${movieMatch[1]}`
  }

  if (tvMatch) {
    return `tv:${tvMatch[1]}`
  }

  if (document.location.pathname === '/') {
    return 'home'
  }

  return document.location.pathname
}

function cleanTitle(title?: string | null) {
  if (!title) {
    return undefined
  }

  const cleaned = title
    .replace(/\s*\|\s*Movy\s*$/i, '')
    .trim()

  if (isGenericMovyTitle(cleaned)) {
    return undefined
  }

  return cleaned
}

function isGenericMovyTitle(title?: string | null) {
  if (!title) {
    return true
  }

  const cleaned = title
    .replace(/\s*\|\s*Movy\s*$/i, '')
    .trim()

  return (
    cleaned.toLowerCase() === 'movy'
    || /^Movy\s*-\s*Watch Free Movies\s*&\s*TV Shows Online$/i
      .test(cleaned)
  )
}

function truncate(text: string, maxLength = 120) {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength - 1).trim()}…`
}

// --------------------------------------------------
// Presence update
// --------------------------------------------------

presence.on('UpdateData', async () => {
  const currentPath = document.location.pathname

  const isHome = currentPath === '/'
  const isMovie = currentPath.startsWith('/movie/')
  const isTV = currentPath.startsWith('/tv/')

  // --------------------------------------------------
  // Detect content changes
  // --------------------------------------------------

  const currentContentKey = getContentKey()

  if (currentContentKey !== lastContentKey) {
    lastContentKey = currentContentKey

    cachedTitle = undefined
    cachedPoster = undefined
    cachedMovieYear = undefined

    cachedSeason = undefined
    cachedEpisode = undefined
    cachedEpisodeTitle = undefined
  }

  // --------------------------------------------------
  // Page title
  // --------------------------------------------------

  const documentTitle = cleanTitle(document.title)

  const ogTitle = cleanTitle(
    document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute('content'),
  )

  if (!isHome) {
    if (ogTitle) {
      cachedTitle = ogTitle
    }
    else if (documentTitle) {
      cachedTitle = documentTitle
    }
  }

  // --------------------------------------------------
  // Poster
  // --------------------------------------------------

  const currentPoster = document
    .querySelector('meta[property="og:image"]')
    ?.getAttribute('content')
    ?.trim()

  if (
    !isHome
    && currentPoster
    && /^https?:\/\//i.test(currentPoster)
  ) {
    cachedPoster = currentPoster
  }

  // --------------------------------------------------
  // Visible page text
  //
  // innerText preserves rendered line breaks.
  // This is important for episode detection.
  // --------------------------------------------------

  // eslint-disable-next-line unicorn/prefer-dom-node-text-content
  const lines = document.body.innerText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  // --------------------------------------------------
  // Movie year
  // --------------------------------------------------

  if (isMovie) {
    const year = lines
      .flatMap(line =>
        line.split(/\s*[·•]\s*/),
      )
      .map(part => part.trim())
      .find(part =>
        /^(?:19|20)\d{2}$/.test(part),
      )

    if (year) {
      cachedMovieYear = year
    }
  }

  // --------------------------------------------------
  // Actual Movy video player
  // --------------------------------------------------

  const video
    = document.querySelector<HTMLVideoElement>(
      '#vp-shell video',
    )

  const videoReady
    = !!video
      && video.readyState >= HTMLMediaElement.HAVE_METADATA
      && Number.isFinite(video.duration)
      && video.duration > 0

  const hasStarted
    = !!video
      && video.currentTime > 0

  const isPlaying
    = !!video
      && videoReady
      && !video.paused
      && !video.ended

  const isPaused
    = !!video
      && videoReady
      && video.paused
      && !video.ended
      && hasStarted

  const isEnded
    = !!video
      && videoReady
      && video.ended

  // --------------------------------------------------
  // TV episode detection
  //
  // Example:
  // S1 E1 Red Light, Green Light · 1h 1m
  // --------------------------------------------------

  if (isTV) {
    const episodeLine = lines.find(line =>
      /^S\d+\s+E\d+\s+/i.test(line),
    )

    if (episodeLine) {
      const match = episodeLine.match(
        /^S(\d+)\s+E(\d+)\s+/i,
      )

      if (match) {
        cachedSeason = Number(match[1])
        cachedEpisode = Number(match[2])

        const rawEpisodeTitle = episodeLine
          .slice(match[0].length)
          .split('·')[0]
          ?.trim()

        if (rawEpisodeTitle) {
          cachedEpisodeTitle = truncate(
            rawEpisodeTitle,
            90,
          )
        }
      }
    }
  }

  // --------------------------------------------------
  // Display title
  // --------------------------------------------------

  let displayTitle = 'Movy'

  if (
    isMovie
    && cachedTitle
  ) {
    displayTitle = cachedMovieYear
      ? `${cachedTitle} (${cachedMovieYear})`
      : cachedTitle
  }
  else if (
    isTV
    && cachedTitle
  ) {
    displayTitle = cachedTitle
  }
  else if (
    !isHome
    && cachedTitle
  ) {
    displayTitle = cachedTitle
  }

  if (isGenericMovyTitle(displayTitle)) {
    displayTitle = 'Movy'
  }

  displayTitle = truncate(displayTitle)

  // --------------------------------------------------
  // Presence data
  // --------------------------------------------------

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    details: displayTitle,
    largeImageKey: cachedPoster
      ?? 'https://cdn.rcd.gg/PreMiD/websites/M/Movy/assets/logo.png',
  }

  // --------------------------------------------------
  // Large image hover text
  // --------------------------------------------------

  if (
    isTV
    && cachedSeason !== undefined
    && cachedEpisode !== undefined
  ) {
    presenceData.largeImageText
      = `Season ${cachedSeason}, Episode ${cachedEpisode}`
  }
  else {
    presenceData.largeImageText = displayTitle
  }

  // --------------------------------------------------
  // HOME
  // --------------------------------------------------

  if (isHome) {
    presenceData.state = 'Browsing'
  }

  // --------------------------------------------------
  // MOVIE
  // --------------------------------------------------

  else if (isMovie) {
    if (isEnded) {
      presenceData.state = 'Finished watching'
    }
    else if (isPaused) {
      presenceData.state = 'Paused'
    }
    else if (isPlaying) {
      presenceData.state = 'Watching'
    }
    else {
      presenceData.state = 'Browsing'
    }
  }

  // --------------------------------------------------
  // TV
  // --------------------------------------------------

  else if (isTV) {
    if (
      cachedSeason !== undefined
      && cachedEpisode !== undefined
    ) {
      const episodePrefix
        = `S${cachedSeason} E${cachedEpisode}`

      if (isEnded) {
        presenceData.state
          = `${episodePrefix} • Finished`
      }
      else if (isPaused) {
        presenceData.state = cachedEpisodeTitle
          ? truncate(
              `${episodePrefix} • ${cachedEpisodeTitle} • Paused`,
            )
          : `${episodePrefix} • Paused`
      }
      else if (cachedEpisodeTitle) {
        presenceData.state = truncate(
          `${episodePrefix} • ${cachedEpisodeTitle}`,
        )
      }
      else {
        presenceData.state = episodePrefix
      }
    }
    else if (isEnded) {
      presenceData.state = 'Finished watching'
    }
    else if (isPaused) {
      presenceData.state = 'Paused'
    }
    else if (isPlaying) {
      presenceData.state = 'Watching'
    }
    else {
      presenceData.state = 'Browsing'
    }
  }

  // --------------------------------------------------
  // Other Movy pages
  // --------------------------------------------------

  else {
    presenceData.state = 'Browsing'
  }

  // --------------------------------------------------
  // Playback timestamps
  // --------------------------------------------------

  if (
    video
    && isPlaying
    && Number.isFinite(video.currentTime)
    && Number.isFinite(video.duration)
    && video.duration > 0
  ) {
    const [
      startTimestamp,
      endTimestamp,
    ] = getTimestampsFromMedia(video)

    presenceData.startTimestamp = startTimestamp
    presenceData.endTimestamp = endTimestamp
  }

  // --------------------------------------------------
  // Send to Discord
  // --------------------------------------------------

  presence.setActivity(presenceData)
})
