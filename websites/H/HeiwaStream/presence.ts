import type HeiwaStreamStrings from './HeiwaStream.json'
import { ActivityType, Assets, getTimestamps } from 'premid'

declare global {
  interface StringKeys {
    heiwastream: keyof typeof HeiwaStreamStrings
  }
}

const presence = new Presence({
  clientId: '1142417275966738503',
})
const browsingTimestamp = Math.floor(Date.now() / 1_000)
const heartbeatAttribute = 'data-premid-extension-heartbeat'

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/HeiwaStream/assets/logo.png',
}

const supportedHosts = new Set([
  'heiwastream.fr',
  'www.heiwastream.fr',
])

/** Discord cuts `details` and `state` at 128 characters. */
const textLimit = 128

/**
 * Room codes minted by the website: six characters from an alphabet without
 * look-alike characters (no I, O, 0 or 1). Anything else is ignored.
 */
const roomCodePattern = /^[A-HJ-NP-Z2-9]{4,12}$/

async function getStrings() {
  return presence.getStrings({
    choosing: 'heiwastream.choosing',
    duration: 'heiwastream.duration',
    joinWatchParty: 'heiwastream.joinWatchParty',
    loading: 'heiwastream.loading',
    paused: 'general.paused',
    playing: 'general.playing',
    viewAnime: 'general.buttonViewAnime',
    viewMovie: 'general.buttonViewMovie',
    viewSeries: 'general.buttonViewSeries',
    watchEpisode: 'general.buttonViewEpisode',
    watchingAnime: 'general.watchingAnime',
    watchingMovie: 'general.watchingMovie',
    watchingSeries: 'general.watchingSeries',
    watchMovie: 'general.buttonWatchMovie',
    watchParty: 'heiwastream.watchParty',
  })
}

interface Settings {
  privacy: boolean
  showBrowsing: boolean
  usePresenceName: boolean
  showCover: boolean
  showSynopsis: boolean
  showWatchParty: boolean
  showTimestamp: boolean
  showButtons: boolean
}

let strings: Awaited<ReturnType<typeof getStrings>> | null = null
let language: string | null = null
let settings: Settings = {
  privacy: false,
  showBrowsing: true,
  usePresenceName: true,
  showCover: true,
  showSynopsis: true,
  showWatchParty: true,
  showTimestamp: true,
  showButtons: true,
}

function readToggle(id: string, fallback: boolean): Promise<boolean> {
  return presence.getSetting<boolean>(id).catch(() => fallback)
}

/**
 * Settings and strings are refreshed on each `UpdateData` tick and cached, so
 * the MutationObserver below can update the activity synchronously.
 */
async function refreshSettings(): Promise<void> {
  const [lang, privacy, showBrowsing, usePresenceName, showCover, showSynopsis, showWatchParty, showTimestamp, showButtons]
    = await Promise.all([
      presence.getSetting<string>('lang').catch(() => 'en'),
      readToggle('privacy', false),
      readToggle('showBrowsing', true),
      readToggle('usePresenceName', true),
      readToggle('showCover', true),
      readToggle('showSynopsis', true),
      readToggle('showWatchParty', true),
      readToggle('showTimestamp', true),
      readToggle('showButtons', true),
    ])

  settings = { privacy, showBrowsing, usePresenceName, showCover, showSynopsis, showWatchParty, showTimestamp, showButtons }

  if (!strings || language !== lang) {
    language = lang
    strings = await getStrings()
  }
}

function readNumber(value: string | undefined): number | null {
  if (!value)
    return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function readHeiwaUrl(value: string | undefined): string | null {
  if (!value)
    return null

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && supportedHosts.has(url.hostname) ? url.href : null
  }
  catch {
    return null
  }
}

/** Resolves a website path against the current origin and validates it. */
function heiwaPath(path: string): string | null {
  try {
    return readHeiwaUrl(new URL(path, document.location.origin).href)
  }
  catch {
    return null
  }
}

/** Truncates on a word boundary, where Discord would cut mid-word. */
function clamp(text: string, limit = textLimit): string {
  if (text.length <= limit)
    return text
  const cut = text.slice(0, limit - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > limit / 2 ? cut.slice(0, space) : cut).trimEnd()}…`
}

function join(...parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(' · ')
}

function updateActivity(): void {
  // The site reads this signal to stop offering PreMiD once the HeiwaStream
  // activity is actually loaded by the extension.
  document.documentElement.setAttribute(heartbeatAttribute, String(Date.now()))

  // Strings arrive with the first `UpdateData` tick. Attribute changes seen
  // before that are picked up by the next tick.
  if (!strings)
    return

  const data = document.documentElement.dataset
  const title = data.premidWatching

  /**
   * Outside the player, only title pages show an activity (poster, title and a
   * link to the page). Home, catalogue, search and profile pages clear it: they
   * carried little information, and search pages used to expose the query.
   */
  if (!title) {
    const browseTitle = data.premidBrowseTitle?.trim()
    if (!browseTitle || settings.privacy || !settings.showBrowsing) {
      presence.clearActivity()
      return
    }

    const browseType = data.premidBrowseType
    const browseYear = readNumber(data.premidBrowseYear)
    const browseRuntime = readNumber(data.premidBrowseRuntime)
    const pageUrl = readHeiwaUrl(data.premidPageUrl)
    const presenceData: PresenceData = {
      name: 'HeiwaStream',
      type: ActivityType.Watching,
      details: clamp(browseTitle),
      state: strings.choosing,
      largeImageKey: settings.showCover ? (data.premidBrowsePoster ?? ActivityAssets.Logo) : ActivityAssets.Logo,
      largeImageText: join(
        browseYear ? String(browseYear) : null,
        browseType === 'movie' && browseRuntime ? strings.duration.replace('{0}', String(browseRuntime)) : null,
      ) || 'HeiwaStream',
      smallImageKey: Assets.Viewing,
      smallImageText: strings.choosing,
    }

    if (settings.showTimestamp)
      presenceData.startTimestamp = readNumber(data.premidSince) ?? browsingTimestamp

    if (pageUrl) {
      presenceData.detailsUrl = pageUrl
      presenceData.largeImageUrl = pageUrl
      if (settings.showButtons) {
        presenceData.buttons = [{
          label: browseType === 'movie'
            ? strings.viewMovie
            : browseType === 'anime'
              ? strings.viewAnime
              : strings.viewSeries,
          url: pageUrl,
        }]
      }
    }

    presence.setActivity(presenceData)
    return
  }

  const playbackState = data.premidState ?? 'playing'
  const paused = playbackState === 'paused'
  const stateLabel = paused
    ? strings.paused
    : playbackState === 'loading'
      ? strings.loading
      : strings.playing

  const contentType = data.premidContentType
  const isMovie = contentType === 'movie' || data.premidMediaType === 'movie'

  if (settings.privacy) {
    presence.setActivity({
      name: 'HeiwaStream',
      type: ActivityType.Watching,
      details: isMovie
        ? strings.watchingMovie
        : contentType === 'anime'
          ? strings.watchingAnime
          : strings.watchingSeries,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HeiwaStream',
      smallImageKey: paused ? Assets.Pause : Assets.Play,
      smallImageText: stateLabel,
    })
    return
  }

  /**
   * The website exposes the episode label already formatted (`S03E11`, or
   * `E1089` for shows with absolute numbering). Concatenating season and
   * episode would produce `S22E1089`, so it is only a fallback for older
   * versions of the website.
   */
  const episodeCode = data.premidEpisodeCode
    || [data.premidSeason, data.premidEpisode].filter(Boolean).join('')
  const episodeTitle = data.premidEpisodeTitle?.trim()
  const runtime = readNumber(data.premidRuntime)
  const year = readNumber(data.premidYear)
  const audio = data.premidLanguage
  const runtimeLabel = runtime ? strings.duration.replace('{0}', String(runtime)) : null
  const synopsis = settings.showSynopsis ? data.premidOverview?.trim() : undefined

  const roomCode = settings.showWatchParty ? data.premidRoom : undefined
  const roomSize = readNumber(data.premidRoomSize)
  const roomSeats = readNumber(data.premidRoomMax)
  const roomLabel = roomCode && roomSize !== null && roomSeats !== null
    ? strings.watchParty.replace('{0}', String(roomSize)).replace('{1}', String(roomSeats))
    : null
  // A full room keeps its counter but not its join button: the invitation page
  // of a full room cannot be joined.
  const roomFull = roomSize !== null && roomSeats !== null && roomSize >= roomSeats
  const roomUrl = roomCode && !roomFull && roomCodePattern.test(roomCode)
    ? heiwaPath(`/rooms/${roomCode}`)
    : null

  // Large image badge: episode, runtime and audio language. Movies already show
  // their year and runtime on the details line, so their badge shows quality
  // and audio language instead.
  const badge = isMovie
    ? join(data.premidQuality, audio)
    : join(episodeCode || null, runtimeLabel, audio)
  const secondLine = isMovie
    ? join(year ? String(year) : null, runtimeLabel)
    : join(episodeCode || null, episodeTitle)

  const presenceData: PresenceData = {
    name: 'HeiwaStream',
    type: ActivityType.Watching,
    details: title,
    state: secondLine || stateLabel,
    largeImageKey: settings.showCover ? (data.premidPoster ?? ActivityAssets.Logo) : ActivityAssets.Logo,
    largeImageText: badge || 'HeiwaStream',
    smallImageKey: paused ? Assets.Pause : Assets.Play,
    smallImageText: stateLabel,
  }

  /**
   * Uses the title as the activity name ("Watching Chicago P.D.") with the
   * episode below. Optional, since it changes the activity name shown on the
   * user's profile.
   */
  if (settings.usePresenceName) {
    presenceData.name = clamp(title)
    // Without a year or runtime, a movie has nothing to add under its title:
    // the details line is dropped and the synopsis moves up.
    const topLine = isMovie ? secondLine : (episodeTitle || episodeCode)
    if (topLine)
      presenceData.details = topLine
    else
      delete presenceData.details
    presenceData.state = synopsis || stateLabel
  }

  if (roomLabel)
    presenceData.state = join(roomLabel, presenceData.state as string)

  if (presenceData.details)
    presenceData.details = clamp(String(presenceData.details))
  presenceData.state = clamp(String(presenceData.state))

  const mediaUrl = readHeiwaUrl(data.premidMediaUrl)
  const pageUrl = readHeiwaUrl(data.premidPageUrl)
  const detailsUrl = mediaUrl ?? pageUrl

  // `detailsUrl` needs a details line to attach to.
  if (detailsUrl && presenceData.details)
    presenceData.detailsUrl = detailsUrl

  if (pageUrl) {
    presenceData.stateUrl = pageUrl
    presenceData.largeImageUrl = pageUrl
  }

  if (settings.showButtons) {
    const buttons: ButtonData[] = []

    // In a room, the first button joins it and the second opens the title page.
    // A solo watch link would take the viewer away from the room.
    if (roomUrl) {
      buttons.push({ label: strings.joinWatchParty, url: roomUrl })
      if (pageUrl) {
        buttons.push({
          label: isMovie ? strings.viewMovie : contentType === 'anime' ? strings.viewAnime : strings.viewSeries,
          url: pageUrl,
        })
      }
    }
    else if (isMovie && mediaUrl) {
      buttons.push({ label: strings.watchMovie, url: mediaUrl })
    }
    else if (episodeCode && mediaUrl) {
      buttons.push({ label: strings.watchEpisode, url: mediaUrl })
      if (pageUrl && pageUrl !== mediaUrl)
        buttons.push({ label: contentType === 'anime' ? strings.viewAnime : strings.viewSeries, url: pageUrl })
    }

    // Only pass the buttons that exist.
    if (buttons[0])
      presenceData.buttons = buttons[1] ? [buttons[0], buttons[1]] : [buttons[0]]
  }

  if (
    settings.showTimestamp
    && playbackState === 'playing'
  ) {
    const position = readNumber(data.premidPosition)
    const duration = readNumber(data.premidDuration)
    if (position !== null && duration !== null && duration > position)
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(position, duration)
  }

  presence.setActivity(presenceData)
}

let updateScheduled = false

function scheduleUpdate(): void {
  if (updateScheduled)
    return

  updateScheduled = true
  queueMicrotask(() => {
    updateScheduled = false
    updateActivity()
  })
}

presence.on('UpdateData', async () => {
  await refreshSettings()
  updateActivity()
})

// Attribute changes are observed directly, so that play/pause, the timecode and
// room changes show up at once instead of waiting for the next tick.
new MutationObserver(scheduleUpdate).observe(document.documentElement, {
  attributes: true,
  attributeFilter: [
    'data-premid-watching',
    'data-premid-episode',
    'data-premid-episode-code',
    'data-premid-episode-title',
    'data-premid-overview',
    'data-premid-runtime',
    'data-premid-year',
    'data-premid-season',
    'data-premid-media-type',
    'data-premid-content-type',
    'data-premid-provider',
    'data-premid-language',
    'data-premid-quality',
    'data-premid-poster',
    'data-premid-media-url',
    'data-premid-position',
    'data-premid-duration',
    'data-premid-state',
    'data-premid-page-url',
    'data-premid-since',
    'data-premid-browse-title',
    'data-premid-browse-type',
    'data-premid-browse-poster',
    'data-premid-browse-year',
    'data-premid-browse-runtime',
    'data-premid-room',
    'data-premid-room-size',
    'data-premid-room-max',
  ],
})
