import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '808758769424138252',
})

// Localized strings: displayed in the viewer's Discord language.
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
  episode: 'general.episode',
  season: 'general.season',
  viewingAnAnime: 'general.viewAnAnime',
  buttonWatchEpisode: 'general.buttonViewEpisode',
  buttonViewPage: 'general.buttonViewPage',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimationDigitalNetwork/assets/logo.png',
}

interface EpisodeLd {
  name?: string
  episodeNumber?: number | string
  partOfSeason?: { seasonNumber?: number | string }
  partOfSeries?: { name?: string }
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatching = false

function getMeta(property: string): string | undefined {
  return (
    document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)?.content
    ?? document.querySelector<HTMLMetaElement>(`meta[name="${property}"]`)?.content
    ?? undefined
  )
}

function parseEpisode(): EpisodeLd | null {
  const raw = document.querySelector('script[type="application/ld+json"]')?.textContent
  if (!raw)
    return null
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? (data[0] ?? null) : data
  }
  catch {
    return null
  }
}

/**
 * Cache of show ID -> poster URL (from the ADN API).
 */
const posterUrlCache = new Map<string, string | null>()
/** Show IDs whose poster URL is currently being fetched. */
const posterUrlPending = new Set<string>()
/**
 * Cache of already downloaded covers (URL -> Blob).
 * Avoids re-downloading on every UpdateData tick.
 */
const coverCache = new Map<string, Blob>()
/** URLs currently being downloaded, to avoid starting multiple fetches. */
const coverPending = new Set<string>()

/** Extracts the show ID from the current URL (e.g. /video/444-jojo... -> "444"). */
function getShowId(): string | undefined {
  return document.location.pathname.match(/\/video\/(\d+)/)?.[1]
}

/**
 * Fetches the show's poster URL from the ADN API and caches it.
 * Runs in the background; does not block UpdateData.
 */
function fetchPosterUrl(showId: string): void {
  if (posterUrlCache.has(showId) || posterUrlPending.has(showId))
    return

  posterUrlPending.add(showId)
  fetch(`https://gw.api.animationdigitalnetwork.com/show/${showId}`)
    .then(res => (res.ok ? res.json() : null))
    .then((data) => {
      const url: string | null = data?.show?.image2x ?? data?.show?.image ?? null
      posterUrlCache.set(showId, url)
    })
    .catch(() => {})
    .finally(() => posterUrlPending.delete(showId))
}

/**
 * Gets the anime cover for the CURRENT show.
 *
 * The reliable source is the ADN API (`/show/{id}`), keyed off the show ID in
 * the URL — never a random DOM image (which would pick up "watch next"
 * recommendation thumbnails).
 *
 * Discord's image proxy is finicky with ADN URLs, and the ADN CDN allows CORS,
 * so the poster is downloaded as a Blob and sent directly to Discord (raw
 * pixels). Both the poster URL and the blob are cached; the lookup is fully
 * non-blocking (the logo is shown until everything is ready).
 */
function getCover(): string | Blob {
  const showId = getShowId()
  if (!showId)
    return ActivityAssets.Logo

  // Step 1: resolve the poster URL from the ADN API.
  if (!posterUrlCache.has(showId)) {
    fetchPosterUrl(showId)
    return ActivityAssets.Logo
  }
  const url = posterUrlCache.get(showId)
  if (!url)
    return ActivityAssets.Logo

  // Step 2: download the poster as a blob and cache it.
  const cached = coverCache.get(url)
  if (cached)
    return cached

  if (!coverPending.has(url)) {
    coverPending.add(url)
    fetch(url)
      .then(res => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (blob)
          coverCache.set(url, blob)
      })
      .catch(() => {})
      .finally(() => coverPending.delete(url))
  }

  // While waiting, show the ADN logo.
  return ActivityAssets.Logo
}

/**
 * Extracts the real episode title by removing the series name and the
 * "Episode N" boilerplate present in ADN's raw title.
 */
function cleanEpisodeTitle(
  rawTitle: string | undefined,
  seriesName: string | undefined,
): string | undefined {
  if (!rawTitle)
    return undefined

  let title = rawTitle.trim()

  // Capture what follows "Episode N: ".
  const afterMarker = title.match(/[ée]pisode\s*\d+\s*[:\-–—]\s*(\S.*)$/i)?.[1]
  if (afterMarker)
    return afterMarker.trim()

  // Remove the series name prefix.
  if (seriesName)
    title = title.replace(seriesName, '').trim()
  // Remove leftover separators.
  title = title.replace(/^[\s:\-–—|]+/, '').trim()

  // If only an "Episode N" without a title remains, return undefined.
  if (/^[ée]pisode\s*\d+$/i.test(title))
    return undefined

  return title || undefined
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  const [showButtons, showCover, showTimestamps, logoAsSmallImage] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('logoAsSmallImage'),
  ])

  const localized = await strings
  const episode = parseEpisode()
  const video
    = document.querySelector<HTMLVideoElement>('video.vjs-tech')
      ?? document.querySelector<HTMLVideoElement>('video')

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    name: 'Animation Digital Network',
    // ADN logo as the small icon (bottom-right) in place of play/pause.
    smallImageKey: ActivityAssets.Logo,
    smallImageText: 'Animation Digital Network',
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Animation Digital Network',
    startTimestamp: browsingTimestamp,
  }

  const onVideoPage = pathname.includes('/video/')
  const isWatching
    = onVideoPage
      && !!video
      && !Number.isNaN(video.duration)
      && video.duration > 0

  if (isWatching && video) {
    const seriesName
      = episode?.partOfSeries?.name
        ?? getMeta('og:title')?.split(' - ')[0]
        ?? 'Animation Digital Network'

    const seasonNumber = episode?.partOfSeason?.seasonNumber
    const episodeNumber = episode?.episodeNumber
    const episodeTitle = cleanEpisodeTitle(episode?.name, seriesName)

    presenceData.name = seriesName

    // Top line: episode title or number.
    presenceData.details
      = episodeTitle
        ?? (episodeNumber ? `${localized.episode} ${episodeNumber}` : seriesName)

    // Bottom line: season / episode.
    if (seasonNumber && episodeNumber)
      presenceData.state = `${localized.season} ${seasonNumber} • ${localized.episode} ${episodeNumber}`
    else if (episodeNumber)
      presenceData.state = `${localized.episode} ${episodeNumber}`

    // Large image: cover of the CURRENT anime (via ADN API).
    presenceData.largeImageKey = showCover === false
      ? ActivityAssets.Logo
      : getCover()

    // Discord's "S1E2" badge.
    presenceData.largeImageText
      = seasonNumber && episodeNumber
        ? `${localized.season} ${seasonNumber}, ${localized.episode} ${episodeNumber}`
        : seriesName

    // Small icon: ADN logo or play/pause icon depending on the setting.
    presenceData.smallImageKey = logoAsSmallImage === false
      ? (video.paused ? Assets.Pause : Assets.Play)
      : ActivityAssets.Logo
    presenceData.smallImageText = video.paused ? localized.pause : localized.play

    // Timestamps.
    if (!video.paused && showTimestamps !== false) {
      [presenceData.startTimestamp, presenceData.endTimestamp]
        = getTimestampsFromMedia(video)
    }
    else {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presenceData.buttons = [{ label: localized.buttonWatchEpisode, url: href }]
    wasWatching = true
  }
  else if (onVideoPage) {
    const seriesName
      = episode?.partOfSeries?.name ?? getMeta('og:title')?.split(' - ')[0]

    if (wasWatching) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatching = false
    }

    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = localized.viewingAnAnime
    if (seriesName)
      presenceData.state = seriesName

    presenceData.largeImageKey = showCover === false
      ? ActivityAssets.Logo
      : getCover()

    presenceData.buttons = [{ label: localized.buttonViewPage, url: href }]
  }
  else {
    if (wasWatching) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatching = false
    }

    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = localized.browsing
  }

  if (!showButtons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
