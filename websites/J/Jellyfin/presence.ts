import type { MediaInfo, Person, Server, Session } from './types.js'
import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jellyfin/assets/logo.png',
}

const JELLYFIN_URL = 'jellyfin.org'

const presence = new Presence({
  clientId: '669359568391766018',
})

const CACHE_MAX = 50

function cacheSet<K, V>(map: Map<K, V>, key: K, value: V): void {
  if (map.size >= CACHE_MAX) {
    const oldest = map.keys().next().value!
    map.delete(oldest)
  }
  map.set(key, value)
}

const NOW_PLAYING_TTL = 5000

const mediaInfoCache = new Map<string, MediaInfo>()
const searchMediaCache = new Map<string, MediaInfo[]>()
const uploadedMediaCache = new Map<string, string>()
let nowPlayingCache: { itemId: string | null, fetchedAt: number } | null = null

// Failed lookups are remembered briefly so an unreachable or slow server
// doesn't make every update wait on the same timed-out requests again.
const FAILED_LOOKUP_TTL = 15000
const failedLookups = new Map<string, number>()

function recentlyFailed(key: string): boolean {
  const failedAt = failedLookups.get(key)
  return failedAt !== undefined && Date.now() - failedAt < FAILED_LOOKUP_TTL
}

function markFailed(key: string): void {
  cacheSet(failedLookups, key, Date.now())
}

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    watchingMovie: 'general.watchingMovie',
    watchingSeries: 'general.watchingSeries',
    listeningMusic: 'general.listeningMusic',
    search: 'general.search',
    live: 'general.live',
    reading: 'general.reading',
  })
}

let oldLang: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>

function currentHashPath(): string {
  const rawPath = location.hash.split('?')[0] ?? ''

  return rawPath
    .replace(/^#!?\/?/, '')
    .replace(/\.html$/, '')
}

function jellyfinBasenameUrl(): string {
  const { pathname } = location

  return `${location.origin}${pathname.replace(
    pathname.split('/').slice(-2).join('/'),
    '',
  )}`
}

function mediaPrimaryImage(mediaInfo: MediaInfo): string {
  let mediaId: string

  switch (mediaInfo.Type) {
    case 'Episode':
      mediaId = mediaInfo.SeriesId
      break
    case 'Audio':
      mediaId = mediaInfo.AlbumId
      break
    default:
      mediaId = mediaInfo.Id
  }

  return `${jellyfinBasenameUrl()}Items/${mediaId}/Images/Primary?fillHeight=256&fillWidth=256`
}

function truncate(text: string, max = 128): string {
  const normalizedText = text.replace(/\s+/g, ' ').trim()
  if (normalizedText.length <= max)
    return normalizedText

  const suffix = '...'
  let truncatedText = ''
  let length = 0
  for (const character of normalizedText) {
    if (length + character.length > max - suffix.length)
      break
    truncatedText += character
    length += character.length
  }

  return `${truncatedText.trimEnd()}${suffix}`
}

function peopleByType(people: Person[] | undefined, type: string): string[] {
  return people?.filter(person => person.Type === type).map(person => person.Name) ?? []
}

function bookCredits(people: Person[] | undefined): string | null {
  const authors = peopleByType(people, 'Author')
  const authorSet = new Set(authors)
  const narrators = peopleByType(people, 'Narrator').filter(name => !authorSet.has(name))

  const parts: string[] = []
  if (authors.length)
    parts.push(`by ${authors.slice(0, 2).join(', ')}`)
  if (narrators.length)
    parts.push(`narrated by ${narrators.slice(0, 2).join(', ')}`)

  return parts.join(' • ') || null
}

function isNonPublicURL(url: string): boolean {
  if (/^https?:\/\/(?:192\.168\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|127\.0\.0\.1|localhost)/.test(url))
    return true

  if (/^https?:\/\/[^/]+\.ts\.net(?:\/|:|$)/.test(url))
    return true

  return false
}

async function resolveImageUrl(
  url: string,
  forceLocal: boolean,
): Promise<string> {
  if (!isNonPublicURL(url) && !forceLocal)
    return url

  if (uploadedMediaCache.has(url))
    return uploadedMediaCache.get(url)!

  try {
    const res = await fetchWithTimeout(url)
    const blob = await res.blob()

    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = () => {
        const result = reader.result
        if (typeof result !== 'string') {
          resolve(ActivityAssets.Logo)
          return
        }
        cacheSet(uploadedMediaCache, url, result)
        resolve(result)
      }
    })
  }
  catch {
    return ActivityAssets.Logo
  }
}

interface ClientInfo {
  appName: string
  deviceId: string
  accessToken: string
  userId: string
  // Only known when read from the page.
  appVersion?: string
  deviceName?: string
}

const CLIENT_INFO_TTL = 5000
const PAGE_VARIABLES_RETRY = 30000
const CLIENT_VARIABLES = [
  'ApiClient._appName',
  'ApiClient._appVersion',
  'ApiClient._deviceName',
  'ApiClient._deviceId',
  'ApiClient._serverInfo.AccessToken',
  'ApiClient._serverInfo.UserId',
] as const

let clientInfo: ClientInfo | null = null
let clientInfoReadAt = 0
let pageVariablesFailedAt = 0

function storedClientInfo(): ClientInfo | null {
  try {
    const servers: Server[] = JSON.parse(
      localStorage.getItem('jellyfin_credentials') ?? '{}',
    ).Servers ?? []
    const serverId = new URLSearchParams(location.hash.split('?')[1] ?? '').get('serverId')
    const signedIn = servers.filter(s => s.AccessToken && s.UserId)
    const server = signedIn.find(s => s.Id === serverId)
      ?? signedIn.sort((a, b) => b.DateLastAccessed - a.DateLastAccessed)[0]

    if (!server)
      return null

    return {
      appName: 'Jellyfin Web',
      deviceId: localStorage.getItem('_deviceId2') ?? '',
      accessToken: server.AccessToken,
      userId: server.UserId,
    }
  }
  catch {
    return null
  }
}

async function pageClientInfo(): Promise<ClientInfo | null> {
  try {
    const vars = await presence.getPageVariable<Record<typeof CLIENT_VARIABLES[number], string | undefined>>(...CLIENT_VARIABLES)
    if (decodeURIComponent(vars['ApiClient._appName'] ?? '') !== 'Jellyfin Web')
      return null

    return {
      appName: vars['ApiClient._appName']!,
      appVersion: vars['ApiClient._appVersion'],
      deviceName: vars['ApiClient._deviceName'],
      deviceId: vars['ApiClient._deviceId'] ?? '',
      accessToken: vars['ApiClient._serverInfo.AccessToken'] ?? '',
      userId: vars['ApiClient._serverInfo.UserId'] ?? '',
    }
  }
  catch {
    return null
  }
}

async function isJellyfinWebClient(): Promise<boolean> {
  const now = Date.now()
  if (now - clientInfoReadAt < CLIENT_INFO_TTL)
    return !!clientInfo

  clientInfoReadAt = now

  // jellyfin-web keeps the login in localStorage, which the activity can read
  // directly. Page variables are only a fallback (e.g. on the login page): on
  // some setups the extension never gets an answer from the page and
  // getPageVariable stalls until it times out, so failures back off.
  clientInfo = storedClientInfo()
  if (!clientInfo && now - pageVariablesFailedAt >= PAGE_VARIABLES_RETRY) {
    clientInfo = await pageClientInfo()
    if (!clientInfo)
      pageVariablesFailedAt = Date.now()
  }

  return !!clientInfo
}

function authHeaders(): Record<string, string> {
  // Fields we couldn't read are left out rather than sent empty, so the server
  // falls back to what it has stored for the token instead of overwriting it.
  const fields = {
    Client: clientInfo?.appName,
    Device: clientInfo?.deviceName,
    DeviceId: clientInfo?.deviceId,
    Version: clientInfo?.appVersion,
    Token: clientInfo?.accessToken,
  }

  return {
    // Servers with legacy authorization disabled (the default since Jellyfin
    // began deprecating it) ignore X-Emby-Authorization entirely, so use the
    // standard Authorization header instead, which every version accepts.
    Authorization: `MediaBrowser ${Object.entries(fields)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}="${value}"`)
      .join(', ')}`,
  }
}

async function obtainMediaInfo(itemId: string): Promise<MediaInfo | null> {
  if (mediaInfoCache.has(itemId))
    return mediaInfoCache.get(itemId)!

  const failureKey = `item:${itemId}`
  if (recentlyFailed(failureKey))
    return null

  try {
    const res = await fetchWithTimeout(
      `${jellyfinBasenameUrl()}Users/${clientInfo?.userId}/Items/${itemId}`,
      { credentials: 'include', headers: authHeaders() },
    )
    if (!res.ok) {
      markFailed(failureKey)
      return null
    }

    const mediaInfo: MediaInfo = await res.json()
    cacheSet(mediaInfoCache, itemId, mediaInfo)

    return mediaInfoCache.get(itemId)!
  }
  catch {
    markFailed(failureKey)
    return null
  }
}

async function obtainNowPlayingItemId(): Promise<string | null> {
  if (nowPlayingCache && Date.now() - nowPlayingCache.fetchedAt < NOW_PLAYING_TTL)
    return nowPlayingCache.itemId

  let itemId: string | null = null
  try {
    const res = await fetchWithTimeout(
      `${jellyfinBasenameUrl()}Sessions?deviceId=${encodeURIComponent(clientInfo?.deviceId ?? '')}`,
      { credentials: 'include', headers: authHeaders() },
    )
    if (res.ok) {
      const sessions: Session[] = await res.json()
      itemId = sessions.find(s => s.NowPlayingItem)?.NowPlayingItem?.Id ?? null
    }
  }
  catch {
    itemId = null
  }

  nowPlayingCache = { itemId, fetchedAt: Date.now() }
  return itemId
}

async function searchMedia(searchTerm: string): Promise<MediaInfo[]> {
  if (/- S\d+:E\d+ -/.test(searchTerm))
    searchTerm = searchTerm.split(' - ').pop() ?? ''

  searchTerm = searchTerm.replace(/\(\d{4}\)/, '').trim()

  if (!searchTerm)
    return []

  if (searchMediaCache.has(searchTerm))
    return searchMediaCache.get(searchTerm)!

  const failureKey = `search:${searchTerm}`
  if (recentlyFailed(failureKey))
    return []

  try {
    const res = await fetchWithTimeout(
      `${jellyfinBasenameUrl()}Users/${clientInfo?.userId}/Items/?searchTerm=${encodeURIComponent(searchTerm)}`
      + '&IncludePeople=false&IncludeMedia=true&IncludeGenres=false&IncludeStudios=false'
      + '&IncludeArtists=false&IncludeItemTypes=Movie,Episode&Limit=3'
      + '&Fields=PrimaryImageAspectRatio%2CCanDelete%2CBasicSyncInfo%2CMediaSourceCount'
      + '&Recursive=true&EnableTotalRecordCount=false&ImageTypeLimit=1',
      { credentials: 'include', headers: authHeaders() },
    )
    if (!res.ok) {
      markFailed(failureKey)
      return []
    }

    const resJson = await res.json()
    cacheSet(searchMediaCache, searchTerm, resJson.Items)

    return searchMediaCache.get(searchTerm)!
  }
  catch {
    markFailed(failureKey)
    return []
  }
}

function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 5000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id))
}

interface Settings {
  lang: string
  usePresenceName: boolean
  showMediaTimestamps: boolean
  showTimestamps: boolean
  showCover: boolean
  showSeries: boolean
  showMovies: boolean
  showMusic: boolean
  showSmallImages: boolean
  showBrowsingStatus: boolean
  showOverview: boolean
  privacy: boolean
  localImageExtraction: boolean
}

const SETTINGS_CACHE_TTL = 5000
let settingsCache: Settings | null = null
let settingsFetchedAt = 0

async function fetchSettings(): Promise<Settings> {
  const now = Date.now()
  if (settingsCache && now - settingsFetchedAt < SETTINGS_CACHE_TTL)
    return settingsCache

  const [
    lang,
    usePresenceName,
    showMediaTimestamps,
    showTimestamps,
    showCover,
    showSeries,
    showMovies,
    showMusic,
    showSmallImages,
    showBrowsingStatus,
    showOverview,
    privacy,
    localImageExtraction,
  ] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('showMediaTimestamps'),
    presence.getSetting<boolean>('showTimestamps'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showSeries'),
    presence.getSetting<boolean>('showMovies'),
    presence.getSetting<boolean>('showMusic'),
    presence.getSetting<boolean>('showSmallImages'),
    presence.getSetting<boolean>('showBrowsingStatus'),
    presence.getSetting<boolean>('showOverview'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('localImageExtraction'),
  ])

  settingsCache = {
    lang,
    usePresenceName,
    showMediaTimestamps,
    showTimestamps,
    showCover,
    showSeries,
    showMovies,
    showMusic,
    showSmallImages,
    showBrowsingStatus,
    showOverview,
    privacy,
    localImageExtraction,
  }
  settingsFetchedAt = Date.now()

  return settingsCache
}

async function getCoverUrl(
  mediaInfo: MediaInfo,
  settings: Settings,
): Promise<string> {
  if (!settings.showCover || settings.privacy)
    return ActivityAssets.Logo

  const imageUrl = mediaPrimaryImage(mediaInfo)
  return resolveImageUrl(imageUrl, settings.localImageExtraction)
}

function getImdbButton(mediaInfo: MediaInfo): ButtonData | null {
  const imdbId = mediaInfo.ProviderIds?.Imdb
  if (!imdbId)
    return null

  return {
    label: 'View on IMDb',
    url: `https://www.imdb.com/title/${imdbId}`,
  }
}

function getPlaybackState(): { paused: boolean, mediaElement: HTMLMediaElement | null } {
  const mediaElement = document.querySelector<HTMLMediaElement>('audio, video')
  const paused = mediaElement
    ? mediaElement.paused
    : !!document
        .querySelector<HTMLSpanElement>(
          '.nowPlayingBar .playPauseButton span',
        )
        ?.classList
        .contains('play_arrow')

  return { paused, mediaElement }
}

function applyPlaybackInfo(
  presenceData: MediaPresenceData,
  settings: Settings,
): void {
  const { paused, mediaElement } = getPlaybackState()

  if (paused) {
    if (settings.showSmallImages) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.pause
    }
  }
  else {
    if (settings.showSmallImages) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.play
    }

    if (mediaElement && settings.showMediaTimestamps && !settings.privacy) {
      [presenceData.startTimestamp, presenceData.endTimestamp]
        = getTimestampsFromMedia(mediaElement)
    }
  }
}

async function buildMediaPresence(
  mediaInfo: MediaInfo,
  settings: Settings,
): Promise<PresenceData | null> {
  switch (mediaInfo.Type) {
    case 'Audio': {
      if (!settings.showMusic)
        return null

      if (settings.privacy) {
        return {
          type: ActivityType.Listening,
          details: strings.listeningMusic,
          largeImageKey: ActivityAssets.Logo,
        }
      }

      const artist = mediaInfo.AlbumArtist ?? 'Unknown artist'
      const albumParts = [artist]
      if (mediaInfo.Genres?.length)
        albumParts.push(mediaInfo.Genres.slice(0, 2).join(', '))

      const presenceData: MediaPresenceData = {
        type: ActivityType.Listening,
        details: mediaInfo.Name ?? 'Unknown title',
        state: albumParts.join(' • '),
        largeImageKey: await getCoverUrl(mediaInfo, settings),
      }

      if (settings.usePresenceName)
        presenceData.name = mediaInfo.Name

      applyPlaybackInfo(presenceData, settings)
      return presenceData
    }

    case 'Movie': {
      if (!settings.showMovies)
        return null

      if (settings.privacy) {
        return {
          type: ActivityType.Watching,
          details: strings.watchingMovie,
          largeImageKey: ActivityAssets.Logo,
        }
      }

      const parts: string[] = []
      if (mediaInfo.ProductionYear)
        parts.push(`${mediaInfo.ProductionYear}`)
      if (mediaInfo.Genres?.length)
        parts.push(mediaInfo.Genres.slice(0, 2).join(', '))
      const rating = mediaInfo.CommunityRating
        ? `★ ${mediaInfo.CommunityRating.toFixed(1)}`
        : undefined
      const overview = settings.showOverview && mediaInfo.Overview
        ? truncate(mediaInfo.Overview)
        : undefined

      // The overview takes the state line, so fold the rating into details
      // instead of losing it entirely.
      if (overview && rating)
        parts.push(rating)

      const presenceData: MediaPresenceData = {
        type: ActivityType.Watching,
        details: parts.join(' • ') || (mediaInfo.Name ?? 'Movie'),
        state: overview ?? rating,
        largeImageKey: await getCoverUrl(mediaInfo, settings),
        largeImageText: truncate(
          mediaInfo.ProductionYear
            ? `${mediaInfo.Name ?? 'Movie'} (${mediaInfo.ProductionYear})`
            : mediaInfo.Name ?? 'Movie',
        ),
      }

      if (settings.usePresenceName)
        presenceData.name = mediaInfo.Name

      const movieImdb = getImdbButton(mediaInfo)
      if (movieImdb)
        presenceData.buttons = [movieImdb]

      applyPlaybackInfo(presenceData, settings)
      return presenceData
    }

    case 'Episode': {
      if (!settings.showSeries)
        return null

      if (settings.privacy) {
        return {
          type: ActivityType.Watching,
          details: strings.watchingSeries,
          largeImageKey: ActivityAssets.Logo,
        }
      }

      const season = mediaInfo.ParentIndexNumber
      const episode = mediaInfo.IndexNumber
      const hasFilename = /[.\\/]/.test(mediaInfo.Name ?? '')
      const epName = hasFilename
        ? (season && episode ? `Episode ${episode}` : 'Episode')
        : (mediaInfo.Name ?? 'Episode')

      const seasonEpisode = season && episode
        ? `Season ${season} • Episode ${episode}`
        : null
      const overview = settings.showOverview && mediaInfo.Overview
        ? truncate(mediaInfo.Overview)
        : undefined

      const presenceData: MediaPresenceData = {
        type: ActivityType.Watching,
        details: mediaInfo.SeriesName,
        state: overview ?? (seasonEpisode ? `${seasonEpisode} • ${epName}` : epName),
        largeImageKey: await getCoverUrl(mediaInfo, settings),
      }

      if (season && episode)
        presenceData.largeImageText = `Season ${season}, Episode ${episode}`

      if (settings.usePresenceName) {
        presenceData.name = mediaInfo.SeriesName
        presenceData.details = epName
        presenceData.state = overview ?? (seasonEpisode ?? epName)
      }

      const episodeImdb = getImdbButton(mediaInfo)
      if (episodeImdb)
        presenceData.buttons = [episodeImdb]

      applyPlaybackInfo(presenceData, settings)
      return presenceData
    }

    case 'Series': {
      if (!settings.showSeries)
        return null

      if (settings.privacy) {
        return {
          type: ActivityType.Watching,
          details: strings.watchingSeries,
          largeImageKey: ActivityAssets.Logo,
        }
      }

      const presenceData: MediaPresenceData = {
        type: ActivityType.Watching,
        details: mediaInfo.Name,
        state: `Series • ${mediaInfo.Status}`,
        largeImageKey: await getCoverUrl(mediaInfo, settings),
      }

      if (settings.usePresenceName)
        presenceData.name = mediaInfo.Name

      applyPlaybackInfo(presenceData, settings)
      return presenceData
    }

    case 'Book':
    case 'AudioBook': {
      const isAudioBook = mediaInfo.Type === 'AudioBook'
      const activityType = isAudioBook ? ActivityType.Listening : ActivityType.Watching

      if (settings.privacy) {
        return {
          type: activityType,
          details: isAudioBook ? strings.listeningMusic : strings.reading,
          largeImageKey: ActivityAssets.Logo,
        }
      }

      const credits = bookCredits(mediaInfo.People)
      const overview = mediaInfo.Overview ? truncate(mediaInfo.Overview) : null
      const genreText = mediaInfo.Genres?.length ? mediaInfo.Genres.slice(0, 2).join(', ') : null

      const presenceData: MediaPresenceData = {
        type: activityType,
        details: credits ?? mediaInfo.Name ?? (isAudioBook ? 'Audiobook' : 'Book'),
        state: overview ?? genreText ?? strings.reading,
        largeImageKey: await getCoverUrl(mediaInfo, settings),
      }

      if (settings.usePresenceName)
        presenceData.name = mediaInfo.Name

      applyPlaybackInfo(presenceData, settings)
      return presenceData
    }

    case 'TvChannel': {
      if (settings.privacy) {
        return {
          type: ActivityType.Watching,
          details: 'Watching Live TV',
          largeImageKey: ActivityAssets.Logo,
        }
      }

      const presenceData: MediaPresenceData = {
        type: ActivityType.Watching,
        details: mediaInfo.Name ?? 'Live TV',
        largeImageKey: await getCoverUrl(mediaInfo, settings),
      }

      if (settings.showSmallImages) {
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = strings.live
      }

      if (settings.usePresenceName)
        presenceData.name = mediaInfo.Name

      return presenceData
    }

    default: {
      if (settings.privacy) {
        return {
          type: ActivityType.Watching,
          details: strings.watchingMovie,
          largeImageKey: ActivityAssets.Logo,
        }
      }

      const presenceData: MediaPresenceData = {
        type: ActivityType.Watching,
        details: mediaInfo.Name,
        largeImageKey: await getCoverUrl(mediaInfo, settings),
      }

      if (settings.usePresenceName)
        presenceData.name = mediaInfo.Name

      applyPlaybackInfo(presenceData, settings)
      return presenceData
    }
  }
}

function handleOfficialWebsite(settings: Settings): PresenceData | null {
  if (!settings.showBrowsingStatus)
    return null

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'At jellyfin.org',
  }

  switch (location.pathname) {
    case '/':
      presenceData.state = 'On landing page'
      break
    case '/posts/':
      presenceData.state = 'Reading the latest posts'
      if (settings.showSmallImages)
        presenceData.smallImageKey = Assets.Reading
      break
    case '/clients/':
      presenceData.state = 'Checking clients'
      if (settings.showSmallImages)
        presenceData.smallImageKey = Assets.Search
      break
    case '/downloads/':
      presenceData.state = 'On downloads'
      if (settings.showSmallImages)
        presenceData.smallImageKey = Assets.Downloading
      break
    case '/contribute/':
      presenceData.state = 'Learning how to contribute'
      break
    case '/contact/':
      presenceData.state = 'On contact page'
      break
    default:
      if (location.pathname.indexOf('/docs/') === 0) {
        presenceData.state = `Reading the docs: ${document.title
          .split('|')[0]
          ?.trim()}`
        if (settings.showSmallImages)
          presenceData.smallImageKey = Assets.Reading
      }
  }

  return presenceData
}

async function handleItemDetails(settings: Settings): Promise<PresenceData | null> {
  if (!settings.showBrowsingStatus)
    return null

  if (settings.privacy) {
    return {
      largeImageKey: ActivityAssets.Logo,
      details: strings.browse,
    }
  }

  const itemId = new URLSearchParams(location.hash.split('?')[1] ?? '').get('id')
  if (!itemId) {
    return {
      largeImageKey: ActivityAssets.Logo,
      details: strings.browse,
    }
  }

  const data = await obtainMediaInfo(itemId)

  if (!data) {
    return {
      largeImageKey: ActivityAssets.Logo,
      details: strings.browse,
    }
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: data.Name,
  }

  if (settings.showSmallImages) {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.browse
  }

  switch (data.Type) {
    case 'Movie': {
      const movieParts: string[] = []
      if (data.ProductionYear)
        movieParts.push(`${data.ProductionYear}`)
      if (data.Genres?.length)
        movieParts.push(data.Genres.slice(0, 2).join(', '))
      if (data.CommunityRating)
        movieParts.push(`★ ${data.CommunityRating.toFixed(1)}`)
      presenceData.state = movieParts.join(' • ') || 'Movie'
      break
    }
    case 'Series': {
      const seriesParts: string[] = []
      if (data.ProductionYear)
        seriesParts.push(`${data.ProductionYear}`)
      if (data.Genres?.length)
        seriesParts.push(data.Genres.slice(0, 2).join(', '))
      if (data.CommunityRating)
        seriesParts.push(`★ ${data.CommunityRating.toFixed(1)}`)
      presenceData.state = seriesParts.length
        ? seriesParts.join(' • ')
        : `Series • ${data.Status}`
      break
    }
    case 'Season':
      presenceData.details = data.SeriesName
      presenceData.state = data.Name
      break
    case 'Episode': {
      presenceData.details = data.SeriesName
      const isFilename = /[.\\/]/.test(data.Name ?? '')
      const episodeName = isFilename ? null : data.Name
      if (data.SeasonName && data.IndexNumber) {
        presenceData.state = episodeName
          ? `${data.SeasonName} • Episode ${data.IndexNumber} - ${episodeName}`
          : `${data.SeasonName} • Episode ${data.IndexNumber}`
      }
      else {
        presenceData.state = episodeName ?? data.SeasonName ?? 'Episode'
      }
      break
    }
    case 'MusicAlbum':
      presenceData.state = `Album • ${data.RecursiveItemCount} songs`
      break
    case 'MusicArtist':
      presenceData.state = 'Artist'
      break
    case 'Person': {
      presenceData.state = data.Overview
        ? truncate(data.Overview, 60)
        : 'Person'
      break
    }
    case 'TvChannel':
      presenceData.state = 'Live TV Channel'
      break
    case 'Book':
    case 'AudioBook': {
      const credits = bookCredits(data.People)
      const genreText = data.Genres?.length ? data.Genres.slice(0, 2).join(', ') : null
      const fallback = data.Type === 'AudioBook' ? 'Audiobook' : 'Book'
      presenceData.state = credits ?? genreText ?? fallback
      break
    }
    default:
      presenceData.state = data.Type
  }

  if (settings.showCover) {
    const imageUrl = mediaPrimaryImage(data)
    presenceData.largeImageKey = await resolveImageUrl(imageUrl, settings.localImageExtraction)
  }

  const imdbButton = getImdbButton(data)
  if (imdbButton)
    presenceData.buttons = [imdbButton]

  return presenceData
}

async function handleAudioPlayback(settings: Settings): Promise<PresenceData | null> {
  const regexResult = /\/Audio\/(\w+)\/universal/.exec(
    document.querySelector('audio')?.src ?? '',
  )

  if (!regexResult) {
    presence.error('Could not obtain audio itemId')
    return null
  }

  const mediaInfo = await obtainMediaInfo(regexResult[1]!)
  if (!mediaInfo)
    return null

  return buildMediaPresence(mediaInfo, settings)
}

async function handleVideoPlayback(settings: Settings): Promise<PresenceData | null> {
  // The page title is only the series name for episodes on some versions, so
  // ask the server what this device is playing and search by title as a fallback.
  const nowPlayingId = await obtainNowPlayingItemId()
  const nowPlayingInfo = nowPlayingId ? await obtainMediaInfo(nowPlayingId) : null
  if (nowPlayingInfo)
    return buildMediaPresence(nowPlayingInfo, settings)

  const pageTitle = document.title.trim()
  const [mediaInfo] = pageTitle ? await searchMedia(pageTitle) : []

  if (mediaInfo) {
    const info = await obtainMediaInfo(mediaInfo.Id)
    if (!info)
      return null

    return buildMediaPresence(info, settings)
  }

  if (settings.privacy)
    return { type: ActivityType.Watching, largeImageKey: ActivityAssets.Logo, details: strings.watchingMovie } as MediaPresenceData

  return {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    details: 'Watching',
    state: 'Unknown Content',
  } as MediaPresenceData
}

async function handleRemotePlayback(settings: Settings): Promise<PresenceData | null> {
  const [, mediaId] = /\/Items\/(\w+)\/Images/.exec(
    document.querySelector<HTMLDivElement>('.nowPlayingImage')?.style.backgroundImage ?? '',
  ) ?? []

  if (!mediaId) {
    if (settings.privacy)
      return null
    return {
      type: ActivityType.Watching,
      largeImageKey: ActivityAssets.Logo,
      details: 'Watching',
    } as MediaPresenceData
  }

  const mediaInfo = await obtainMediaInfo(mediaId)
  if (!mediaInfo)
    return null

  return buildMediaPresence(mediaInfo, settings)
}

async function handleWebClient(settings: Settings): Promise<PresenceData | null> {
  const audioElement = document.body.querySelector<HTMLAudioElement>('audio')
  const nowPlayingBar = document.querySelector('.nowPlayingBar')

  if (
    audioElement
    && audioElement.classList.contains('mediaPlayerAudio')
    && audioElement.src
  ) {
    return handleAudioPlayback(settings)
  }

  if (
    nowPlayingBar
    && !nowPlayingBar.classList.contains('nowPlayingBar-hidden')
  ) {
    return handleRemotePlayback(settings)
  }

  const path = currentHashPath()

  if (path === 'video')
    return handleVideoPlayback(settings)

  if (path === 'details')
    return handleItemDetails(settings)

  if (!settings.showBrowsingStatus || settings.privacy)
    return null

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: strings.browse,
  }

  if (settings.showSmallImages) {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = strings.browse
  }

  switch (path) {
    case 'login':
      presenceData.state = 'Logging in'
      break
    case 'home':
      presenceData.state = 'Home'
      break
    case 'search':
      presenceData.state = 'Searching'
      if (settings.showSmallImages) {
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = strings.search
      }
      break
    case 'movies':
      presenceData.state = 'Movies'
      break
    case 'tv':
      presenceData.state = 'TV Series'
      break
    case 'music':
      presenceData.state = 'Music'
      break
    case 'livetv':
      presenceData.state = 'Live TV'
      break
    case 'queue':
    case 'nowplaying':
      presenceData.state = 'Audio Playlist'
      break
    default:
      break
  }

  return presenceData
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const settings = await fetchSettings()

  if (oldLang !== settings.lang) {
    oldLang = settings.lang
    strings = await getStrings()
  }

  let presenceData: PresenceData | null = null

  if (location.host.toLowerCase() === JELLYFIN_URL) {
    presenceData = handleOfficialWebsite(settings)
  }
  else if (await isJellyfinWebClient()) {
    presenceData = await handleWebClient(settings)
  }

  if (!presenceData) {
    presence.clearActivity()
    return
  }

  if (settings.showTimestamps && !presenceData.startTimestamp && !presenceData.endTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  presence.setActivity(presenceData)
})
