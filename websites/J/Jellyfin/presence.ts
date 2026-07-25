import type { ApiClient, MediaInfo, Server } from './types.js'
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

const mediaInfoCache = new Map<string, MediaInfo>()
const searchMediaCache = new Map<string, MediaInfo[]>()
const uploadedMediaCache = new Map<string, string>()

let apiClient: ApiClient
let wasLogin = false

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
  })
}

let oldLang: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>

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
  if (text.length <= max)
    return text
  return `${text.slice(0, max - 3)}...`
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
    const res = await fetch(url)
    const blob = await res.blob()

    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = () => {
        const result = reader.result as string
        cacheSet(uploadedMediaCache, url, result)
        resolve(result)
      }
    })
  }
  catch {
    return ActivityAssets.Logo
  }
}

function getUserId(): string {
  try {
    return apiClient._currentUser.Id
  }
  catch {
    const servers: Server[] = JSON.parse(
      localStorage.getItem('jellyfin_credentials') ?? '{}',
    ).Servers

    return (
      servers.length === 1
        ? servers[0]
        : servers.find(
            (s: Server) =>
              s.Id
              === new URLSearchParams(location.hash.split('?')[1]).get('serverId'),
          )
    )?.UserId ?? ''
  }
}

function authHeaders(): Record<string, string> {
  return {
    'x-emby-authorization': `MediaBrowser Client="${apiClient._appName}",`
      + `Device="${apiClient._deviceName}",`
      + `DeviceId="${apiClient._deviceId}",`
      + `Version="${apiClient._appVersion}",`
      + `Token="${apiClient._serverInfo.AccessToken}"`,
  }
}

async function obtainMediaInfo(itemId: string): Promise<MediaInfo | null> {
  if (mediaInfoCache.has(itemId))
    return mediaInfoCache.get(itemId)!

  try {
    const res = await fetch(
      `${jellyfinBasenameUrl()}Users/${getUserId()}/Items/${itemId}`,
      { credentials: 'include', headers: authHeaders() },
    )
    if (!res.ok)
      return null

    const mediaInfo: MediaInfo = await res.json()
    cacheSet(mediaInfoCache, itemId, mediaInfo)

    return mediaInfoCache.get(itemId)!
  }
  catch {
    return null
  }
}

async function searchMedia(searchTerm: string): Promise<MediaInfo[]> {
  if (searchMediaCache.has(searchTerm))
    return searchMediaCache.get(searchTerm)!

  if (/- S\d+:E\d+ -/.test(searchTerm))
    searchTerm = searchTerm.split(' - ').pop() ?? ''

  searchTerm = searchTerm.replace(/\(\d{4}\)/, '').trim()

  try {
    const res = await fetch(
      `${jellyfinBasenameUrl()}Users/${getUserId()}/Items/?searchTerm=${searchTerm}`
      + '&IncludePeople=false&IncludeMedia=true&IncludeGenres=false&IncludeStudios=false'
      + '&IncludeArtists=false&IncludeItemTypes=Movie,Episode&Limit=3'
      + '&Fields=PrimaryImageAspectRatio%2CCanDelete%2CBasicSyncInfo%2CMediaSourceCount'
      + '&Recursive=true&EnableTotalRecordCount=false&ImageTypeLimit=1',
      { credentials: 'include', headers: authHeaders() },
    )
    if (!res.ok)
      return []

    const resJson = await res.json()
    cacheSet(searchMediaCache, searchTerm, resJson.Items)

    return searchMediaCache.get(searchTerm)!
  }
  catch {
    return []
  }
}

async function refreshApiClient(): Promise<void> {
  apiClient ??= (
    await presence.getPageVariable<Record<'ApiClient', ApiClient>>('ApiClient')
  ).ApiClient
}

async function isJellyfinWebClient(): Promise<boolean> {
  if (!apiClient)
    await refreshApiClient()

  return !!(
    apiClient
    && typeof apiClient === 'object'
    && apiClient._appName === 'Jellyfin Web'
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms))
}

async function loggedIn(): Promise<void> {
  let newApiClient: ApiClient

  do {
    await sleep(125)
    newApiClient = (await presence.getPageVariable<{ ApiClient: ApiClient }>('ApiClient')).ApiClient
  } while (!apiClient._serverInfo.AccessToken)

  apiClient = newApiClient
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
  privacy: boolean
  localImageExtraction: boolean
}

async function fetchSettings(): Promise<Settings> {
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
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('localImageExtraction'),
  ])

  return {
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
    privacy,
    localImageExtraction,
  }
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

      const parts: string[] = [`${mediaInfo.ProductionYear}`]
      if (mediaInfo.Genres?.length)
        parts.push(mediaInfo.Genres.slice(0, 2).join(', '))
      if (mediaInfo.CommunityRating)
        parts.push(`★ ${mediaInfo.CommunityRating.toFixed(1)}`)
      const stateText = parts.join(' • ')

      const overview = mediaInfo.Overview
        ? truncate(mediaInfo.Overview)
        : null

      const presenceData: MediaPresenceData = {
        type: ActivityType.Watching,
        details: stateText,
        state: overview ?? stateText,
        largeImageKey: await getCoverUrl(mediaInfo, settings),
        largeImageText: `${mediaInfo.Name} (${mediaInfo.ProductionYear})`,
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
        : mediaInfo.Name

      const overview = mediaInfo.Overview
        ? truncate(mediaInfo.Overview)
        : null

      const presenceData: MediaPresenceData = {
        type: ActivityType.Watching,
        details: mediaInfo.SeriesName,
        state: overview ?? epName,
        largeImageKey: await getCoverUrl(mediaInfo, settings),
      }

      if (season && episode)
        presenceData.largeImageText = `Season ${season}, Episode ${episode}`

      if (settings.usePresenceName) {
        presenceData.name = mediaInfo.SeriesName
        presenceData.details = epName
        presenceData.state = overview ?? epName
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
      presenceData.smallImageKey = Assets.Reading
      break
    case '/clients/':
      presenceData.state = 'Checking clients'
      presenceData.smallImageKey = Assets.Search
      break
    case '/downloads/':
      presenceData.state = 'On downloads'
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

  const data = await obtainMediaInfo(
    new URLSearchParams(location.hash.split('?')[1]).get('id')!,
  )

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
      const movieParts: string[] = [`${data.ProductionYear}`]
      if (data.Genres?.length)
        movieParts.push(data.Genres.slice(0, 2).join(', '))
      if (data.CommunityRating)
        movieParts.push(`★ ${data.CommunityRating.toFixed(1)}`)
      presenceData.state = movieParts.join(' • ')
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
  if (!document.querySelector('#videoOsdPage'))
    return null

  const [mediaInfo] = await searchMedia(
    document.querySelector<HTMLHeadingElement>('h3.pageTitle')?.textContent ?? '',
  )

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

  if (!mediaId)
    return null

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

  const path = location.hash.split('?')[0]?.substring(2)

  if (path === 'login.html') {
    wasLogin = true
  }
  else if (wasLogin) {
    loggedIn().catch(() => {})
    wasLogin = false
  }

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
    case 'login.html':
      presenceData.state = 'Logging in'
      break
    case 'home.html':
      presenceData.state = 'Home'
      break
    case 'search.html':
      presenceData.state = 'Searching'
      if (settings.showSmallImages) {
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = strings.search
      }
      break
    case 'movies.html':
      presenceData.state = 'Movies'
      break
    case 'tv.html':
      presenceData.state = 'TV Series'
      break
    case 'music.html':
      presenceData.state = 'Music'
      break
    case 'livetv.html':
      presenceData.state = 'Live TV'
      break
    case 'nowplaying.html':
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
