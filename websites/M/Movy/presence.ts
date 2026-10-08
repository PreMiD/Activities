import {
  ActivityType,
  getTimestampsFromMedia,
} from "premid"

const presence = new Presence({
  clientId: "503557087041683458",
})

// --------------------------------------------------
// Cached content data
// --------------------------------------------------

let lastContentKey = getContentKey()

let cachedTitle: string | undefined
let cachedPoster: string | undefined
let cachedMovieYear: string | undefined

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getContentKey() {
  const movieMatch = location.pathname.match(/^\/movie\/([^/]+)/)
  const tvMatch = location.pathname.match(/^\/tv\/([^/]+)/)

  if (movieMatch) {
    return `movie:${movieMatch[1]}`
  }

  if (tvMatch) {
    return `tv:${tvMatch[1]}`
  }

  if (location.pathname === "/") {
    return "home"
  }

  return location.pathname
}

function cleanTitle(title?: string | null) {
  if (!title) {
    return undefined
  }

  const cleaned = title
    .replace(/\s*\|\s*Movy\s*$/i, "")
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
    .replace(/\s*\|\s*Movy\s*$/i, "")
    .trim()

  return (
    cleaned.toLowerCase() === "movy" ||
    /^Movy\s*-\s*Watch Free Movies\s*&\s*TV Shows Online$/i
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

presence.on("UpdateData", async () => {
  const currentPath = location.pathname

  const isHome = currentPath === "/"
  const isMovie = currentPath.startsWith("/movie/")
  const isTV = currentPath.startsWith("/tv/")

  // --------------------------------------------------
  // Detect actual content changes
  //
  // movie/10363 -> movie/10363?play=true
  // keeps the cache.
  //
  // movie/10363 -> movie/12345
  // clears the cache.
  // --------------------------------------------------

  const currentContentKey = getContentKey()

  if (currentContentKey !== lastContentKey) {
    lastContentKey = currentContentKey

    cachedTitle = undefined
    cachedPoster = undefined
    cachedMovieYear = undefined
  }

  // --------------------------------------------------
  // Page title
  // --------------------------------------------------

  const documentTitle = cleanTitle(document.title)

  const ogTitle = cleanTitle(
    document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content")
  )

  if (!isHome) {
    if (ogTitle && documentTitle && ogTitle === documentTitle) {
      cachedTitle = ogTitle
    }
    else if (documentTitle && !ogTitle) {
      cachedTitle = documentTitle
    }
  }

  // --------------------------------------------------
  // Poster
  // --------------------------------------------------

  const currentPoster = document
    .querySelector('meta[property="og:image"]')
    ?.getAttribute("content")
    ?.trim()

  if (
    !isHome &&
    currentPoster &&
    /^https?:\/\//i.test(currentPoster)
  ) {
    cachedPoster = currentPoster
  }

  // --------------------------------------------------
  // Visible page text
  // --------------------------------------------------

  const lines = document.body.innerText
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)

  // --------------------------------------------------
  // Movie year
  //
  // Example:
  // 7.6 · 0 · 0 · 1960 · 1h 58m · PG-13
  // --------------------------------------------------

  if (isMovie) {
    const year = lines
      .flatMap(line =>
        line.split(/\s*[·•]\s*/)
      )
      .map(part => part.trim())
      .find(part =>
        /^(19|20)\d{2}$/.test(part)
      )

    if (year) {
      cachedMovieYear = year
    }
  }

  // --------------------------------------------------
  // Actual Movy player
  //
  // Important:
  // Do NOT use document.querySelector("video")
  // because Movy also has trailer/background videos.
  // --------------------------------------------------

  const video =
    document.querySelector<HTMLVideoElement>(
      "#vp-shell video"
    )

  // Player states

  const videoReady =
    !!video &&
    video.readyState >= HTMLMediaElement.HAVE_METADATA &&
    Number.isFinite(video.duration) &&
    video.duration > 0

  const hasStarted =
    !!video &&
    video.currentTime > 0

  const isPlaying =
    !!video &&
    videoReady &&
    !video.paused &&
    !video.ended

  const isPaused =
    !!video &&
    videoReady &&
    video.paused &&
    !video.ended &&
    hasStarted

  const isEnded =
    !!video &&
    videoReady &&
    video.ended

  // --------------------------------------------------
  // TV episode
  //
  // Example:
  // S1 E1 Red Light, Green Light · 1h 1m
  // --------------------------------------------------

  let season: number | undefined
  let episode: number | undefined
  let episodeTitle: string | undefined

  if (isTV) {
    const episodeLine = lines.find(line =>
      /^S\d+\s+E\d+\s+/i.test(line)
    )

    if (episodeLine) {
      const match = episodeLine.match(
        /^S(\d+)\s+E(\d+)\s+(.+?)(?:\s*·\s*.+)?$/i
      )

      if (match) {
        season = Number(match[1])
        episode = Number(match[2])

        if (match[3]) {
          episodeTitle = truncate(
            match[3].trim(),
            90
          )
        }
      }
    }
  }

  // --------------------------------------------------
  // Display title
  // --------------------------------------------------

  let displayTitle = "Movy"

  if (
    isMovie &&
    cachedTitle
  ) {
    displayTitle = cachedMovieYear
      ? `${cachedTitle} (${cachedMovieYear})`
      : cachedTitle
  }
  else if (
    isTV &&
    cachedTitle
  ) {
    displayTitle = cachedTitle
  }
  else if (
    !isHome &&
    cachedTitle
  ) {
    displayTitle = cachedTitle
  }

  // Final protection against:
  //
  // Movy - Watch Free Movies & TV Shows Online
  //
  // ever reaching Discord.

  if (isGenericMovyTitle(displayTitle)) {
    displayTitle = "Movy"
  }

  displayTitle = truncate(displayTitle)

  // --------------------------------------------------
  // Presence
  // --------------------------------------------------

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    details: displayTitle,
  }

  // --------------------------------------------------
  // Poster
  // --------------------------------------------------

  presenceData.largeImageKey =
    !isHome && cachedPoster
      ? cachedPoster
      : "https://i.imgur.com/JTtBezM.png"

  // --------------------------------------------------
  // Large image hover text
  // --------------------------------------------------

  if (
    isTV &&
    season !== undefined &&
    episode !== undefined
  ) {
    presenceData.largeImageText =
      `Season ${season}, Episode ${episode}`
  }
  else {
    presenceData.largeImageText =
      displayTitle
  }

  // --------------------------------------------------
  // HOME
  //
  // Movy
  // Browsing
  // --------------------------------------------------

  if (isHome) {
    presenceData.state = "Browsing"
  }

  // --------------------------------------------------
  // MOVIE
  //
  // Purple Noon (1960)
  // Watching
  // --------------------------------------------------

  else if (isMovie) {
    if (isEnded) {
      presenceData.state = "Finished watching"
    }
    else if (isPaused) {
      presenceData.state = "Paused"
    }
    else if (isPlaying) {
      presenceData.state = "Watching"
    }
    else {
      presenceData.state = "Browsing"
    }
  }

  // --------------------------------------------------
  // TV
  //
  // Squid Game
  // S1 E1 • Red Light, Green Light
  // --------------------------------------------------

  else if (
    isTV &&
    season !== undefined &&
    episode !== undefined
  ) {
    const episodePrefix =
      `S${season} E${episode}`

    if (isEnded) {
      presenceData.state =
        `${episodePrefix} • Finished`
    }
    else if (isPaused) {
      presenceData.state = episodeTitle
        ? truncate(
            `${episodePrefix} • ${episodeTitle} • Paused`
          )
        : `${episodePrefix} • Paused`
    }
    else if (episodeTitle) {
      presenceData.state =
        truncate(
          `${episodePrefix} • ${episodeTitle}`
        )
    }
    else {
      presenceData.state =
        episodePrefix
    }
  }

  // TV page before an episode is playing
  else if (isTV) {
    presenceData.state = "Browsing"
  }

  // --------------------------------------------------
  // Other Movy pages
  // --------------------------------------------------

  else {
    presenceData.state = "Browsing"
  }

  // --------------------------------------------------
  // Playback timestamps
  //
  // Only show countdown while actually playing.
  // --------------------------------------------------

  if (
    video &&
    isPlaying &&
    Number.isFinite(video.currentTime) &&
    Number.isFinite(video.duration) &&
    video.duration > 0
  ) {
    const [
      startTimestamp,
      endTimestamp,
    ] = getTimestampsFromMedia(video)

    presenceData.startTimestamp =
      startTimestamp

    presenceData.endTimestamp =
      endTimestamp
  }

  // --------------------------------------------------
  // Send to Discord
  // --------------------------------------------------

  presence.setActivity(presenceData)
})