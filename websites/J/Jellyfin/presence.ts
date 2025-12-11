import { ActivityType, Assets } from 'premid'
/*
 * The interfaces may have some things missing,
 * I've tried to set as many properties as I could find.
 */

// #region Interfaces
interface ApiClient {
  enableAutomaticBitrateDetection: boolean
  enableAutomaticNetworking: boolean
  lastDetectedBitrate: number
  lastDetectedBitrateTime: number // timestamp
  lastFetch: number // timestamp
  lastPlaybackProgressReport: number
  lastPlaybackProgressReportTicks: number
  manualAddressOnly: boolean
  _appName: string
  _appVersion: string
  _currentUser: {
    Configuration: {
      AudioLanguagePreference: string
      DisplayCollectionsView: boolean
      DisplayMissingEpisodes: boolean
      EnableLocalPassword: boolean
      EnableNextEpisodeAutoPlay: boolean
      HidePlayedInLatest: boolean
      OrderedViews: string[]
      PlayDefaultAudioTrack: boolean
      RememberAudioSelections: boolean
      RememberSubtitleSelections: boolean
      SubtitleLanguagePreference: string
      SubtitleMode: string
    }
    HasConfiguredEasyPassword: boolean
    HasConfiguredPassword: boolean
    HasPassword: boolean
    Id: string
    LastActivityDate: string // date, ex: "2020-05-30T21:51:23.9732162Z"
    LastLoginDate: string // date, ex: "2020-05-30T21:51:23.9732162Z"
    Name: string
    Policy: {
      AuthenticationProviderId: string
      EnableAllChannels: boolean
      EnableAllDevices: boolean
      EnableAllFolders: boolean
      EnableAudioPlaybackTranscoding: boolean
      EnableContentDeletion: boolean
      EnableContentDownloading: boolean
      EnableLiveTvAccess: boolean
      EnableLiveTvManagement: boolean
      EnableMediaConversion: boolean
      EnableMediaPlayback: boolean
      EnablePlaybackRemuxing: boolean
      EnablePublicSharing: boolean
      EnableRemoteAccess: boolean
      EnableRemoteControlOfOtherUsers: boolean
      EnableSharedDeviceControl: boolean
      EnableSyncTranscoding: boolean
      EnableUserPreferenceAccess: boolean
      EnableVideoPlaybackTranscoding: boolean
      ForceRemoteSourceTranscoding: boolean
      InvalidLoginAttemptCount: boolean
      IsAdministrator: boolean
      IsDisabled: boolean
      IsHidden: boolean
      LoginAttemptsBeforeLockout: number
      PasswordResetProviderId: string
      RemoteClientBitrateLimit: number
    }
    PrimaryImageAspectRatio: number
    PrimaryImageTag: string
    ServerId: string
  }
  _deviceId: string
  _deviceName: string
  _endPointInfo: {
    IsInNetwork: boolean
    IsLocal: boolean
  }
  _serverAddress: string
  _serverInfo: Server
  _serverVersion: string
  _webSocket: {
    binaryType: string
    bufferedAmount: number
    extensions: string
    protocol: string
    readyState: number
    url: string
  }
}

interface MediaStream {
  Codec: string
  TimeBase: string
  CodecTimeBase: string
  VideoRange: string
  DisplayTitle: string
  IsInterlaced: boolean
  BitRate: number
  RefFrames: number
  IsDefault: boolean
  IsForced: boolean
  Height: number
  Width: number
  AverageFrameRate: number
  RealFrameRate: number
  Profile: string
  Type: string
  AspectRatio: string
  Index: number
  IsExternal: boolean
  IsTextSubtitleStream: boolean
  SupportsExternalStream: boolean
  PixelFormat: string
  Level: number
}

interface MediaSource {
  Protocol: string
  Id: string
  Path: string
  Type: string
  Container: string
  Size: number
  Name: string
  IsRemote: boolean
  ETag: string
  RunTimeTicks: number
  ReadAtNativeFramerate: boolean
  IgnoreDts: boolean
  IgnoreIndex: boolean
  GenPtsInput: boolean
  SupportsTranscoding: true
  SupportsDirectStream: boolean
  SupportsDirectPlay: boolean
  IsInfiniteStream: boolean
  RequiresOpening: boolean
  RequiresClosing: boolean
  RequiresLooping: boolean
  SupportsProbing: true
  VideoType: string
  MediaStreams: MediaStream[]
  MediaAttachments: []
  Formats: []
  Bitrate: number
  RequiredHttpHeaders: unknown
  DefaultAudioStreamIndex: number
}

interface ExternalUrl {
  Name: string
  Url: string
}

interface Person {
  Name: string
  Id: string
  Role: string
  Type: string
  PrimaryImageTag: string
}

interface UserData {
  PlaybackPositionTicks: number
  PlayCount: number
  IsFavorite: boolean
  LastPlayedDate: string // date, ex: "2020-05-30T21:51:23.9732162Z"
  Played: boolean
  Key: string
}

interface Chapter {
  StartPositionTicks: number
  Name: string
  ImageDateModified: string // date, ex: "2020-05-30T21:51:23.9732162Z"
}

interface MediaInfo {
  AlbumArtist: string
  AlbumArtists: { Name: string, Id: string }[]
  AlbumId: string
  AlbumPrimaryImageTag: string
  ArtistsItems: { Name: string, Id: string }[]
  Artists: string[]
  Name: string
  OriginalTitle: string
  ServerId: string
  Id: string
  Etag: string
  DateCreated: string // date, ex: "2020-05-30T21:51:23.9732162Z"
  CanDelete: boolean
  CanDownload: boolean
  HasSubtitles: boolean
  Container: string
  SortName: string
  PremiereDate: string // date, ex: "2020-05-30T21:51:23.9732162Z"
  ExternalUrls: ExternalUrl[]
  MediaSources: MediaSource[]
  Path: string
  EnableMediaSourceDisplay: boolean
  Overview: string
  // TagLines: Array;
  // Genres: Array;
  CommunityRating: number
  RunTimeTicks: number
  PlayAccess: string
  ProductionYear: number
  IndexNumber: number
  ParentIndexNumber: number
  // RemoteTrailers: Array;
  ProviderIds: {
    Tvdb?: number
  }
  IsHD: boolean
  IsFolder: boolean
  ParentId: string
  Type:
    | 'Audio'
    | 'MusicAlbum'
    | 'MusicArtist'
    | 'Movie'
    | 'Series'
    | 'Season'
    | 'Episode'
    | 'TvChannel'
    | 'Person'
  People: Person[]
  // Studios: Array;
  // GenreItems: Array;
  ParentBackdropItemId: string
  ParentBackdropImageTags: string[]
  LocalTrailerCount: number
  UserData: UserData
  RecursiveItemCount: number
  Status: string
  SeriesName: string
  SeriesId: string
  SeasonId: string
  SpecialFeatureCount: number
  DisplayPreferencesId: string
  // Tags: Array;
  PrimaryImageAspectRatio: number
  SeriesPrimaryImageTag: string
  SeasonName: string
  MediaStreams: MediaStream[]
  VideoType: string
  ImageTags: {
    Primary: string
  }
  // BackdropImageTags: Array;
  // ScreenshotImageTags: Array;
  SeriesStudio: string
  Chapters: Chapter[]
  LocationType: string
  MediaType: string
  // LockedFields: Array;
  LockData: boolean
  Width: number
  Height: number
}

interface Server {
  AccessToken: string
  DateLastAccessed: number // timestamp
  Id: string
  IsLocalServer: boolean
  LastConnectionMode: number
  LocalAddress: string
  ManualAddress: string
  Name: string
  RemoteAddress: string
  Type: 'Server'
  UserId: string
  manualAddressOnly: boolean
}

// #endregion
enum ActivityAssets {
  logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jellyfin/assets/logo.png',
}
const JELLYFIN_URL = 'jellyfin.org'
// all the presence art assets uploaded to discord
const presenceData: PresenceData = {
  largeImageKey: ActivityAssets.logo,
  startTimestamp: Math.floor(Date.now() / 1000),
}

let apiClient: ApiClient
let presence: Presence
let wasLogin = false

/**
 * Obtain the base name Url of the server
 */
function jellyfinBasenameUrl(): string {
  const { pathname } = location

  return `${location.origin}${pathname.replace(
    pathname.split('/').slice(-2).join('/'),
    '',
  )}`
}

/**
 * Obtain the url of the primary image of a media given its id
 */
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

/**
 * Handle the presence when the audio player is active
 */
async function handleAudioPlayback(): Promise<void> {
  const regexResult = /\/Audio\/(\w+)\/universal/.exec(
    document.querySelector('audio')?.src ?? '',
  )

  if (!regexResult) {
    presence.error('Could not obtain audio itemId')
    return
  }

  await setPresenceByMediaId(regexResult[1]!)
}

/**
 * Handle the presence while the user is in the official website
 */
function handleOfficialWebsite(): void {
  presenceData.details = 'At jellyfin.org'

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
      // reading the docs
      if (location.pathname.indexOf('/docs/') === 0) {
        presenceData.state = `Reading the docs: ${document.title
          .split('|')[0]
          ?.trim()}`
        presenceData.smallImageKey = Assets.Reading
      }
  }
}

/**
 * Obtain the authenticated user id
 */
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

/**
 * Cache performed mediaInfo
 */
const mediaInfoCache = new Map<string, MediaInfo>()

/**
 * Obtain media info given an itemId
 */
async function obtainMediaInfo(itemId: string): Promise<MediaInfo> {
  if (mediaInfoCache.has(itemId))
    return mediaInfoCache.get(itemId)!

  const res = await fetch(
    `${jellyfinBasenameUrl()}Users/${getUserId()}/Items/${itemId}`,
    {
      credentials: 'include',
      headers: {
        'x-emby-authorization': `MediaBrowser Client="${apiClient._appName}",`
          + `Device="${apiClient._deviceName}",`
          + `DeviceId="${apiClient._deviceId}",`
          + `Version="${apiClient._appVersion}",`
          + `Token="${apiClient._serverInfo.AccessToken}"`,
      },
    },
  )
  const mediaInfo: MediaInfo = await res.json()

  mediaInfoCache.set(itemId, mediaInfo)

  return mediaInfoCache.get(itemId)!
}

/**
 * Cache performed media searches
 */
const searchMediaCache = new Map<string, MediaInfo[]>()
const uploadedMediaCache = new Map<string, string>()

/**
 * Search Movie and Series given a term
 */
async function searchMedia(searchTerm: string): Promise<MediaInfo[]> {
  if (searchMediaCache.has(searchTerm))
    return searchMediaCache.get(searchTerm)!

  if (/- S\d+:E\d+ -/.test(searchTerm))
    searchTerm = searchTerm.split(' - ').pop() ?? ''

  // The API does not like the year in the search term
  searchTerm = searchTerm.replace(/\(\d{4}\)/, '').trim()

  const res = await fetch(
    `${jellyfinBasenameUrl()}Users/${getUserId()}/Items/?searchTerm=${searchTerm}`
    + '&IncludePeople=false&IncludeMedia=true&IncludeGenres=false&IncludeStudios=false'
    + '&IncludeArtists=false&IncludeItemTypes=Movie,Episode&Limit=3'
    + '&Fields=PrimaryImageAspectRatio%2CCanDelete%2CBasicSyncInfo%2CMediaSourceCount'
    + '&Recursive=true&EnableTotalRecordCount=false&ImageTypeLimit=1',
    {
      credentials: 'include',
      headers: {
        'x-emby-authorization': `MediaBrowser Client="${apiClient._appName}",`
          + `Device="${apiClient._deviceName}",`
          + `DeviceId="${apiClient._deviceId}",`
          + `Version="${apiClient._appVersion}",`
          + `Token="${apiClient._serverInfo.AccessToken}"`,
      },
    },
  )
  const resJson = await res.json()

  searchMediaCache.set(searchTerm, resJson.Items)

  return searchMediaCache.get(searchTerm)!
}

/**
 * Handles the presence when the user is using the video player
 */
async function handleVideoPlayback(): Promise<void> {
  if (!document.querySelector('#videoOsdPage')) {
    // elements not loaded yet
    return
  }

  // title on the header
  const [mediaInfo] = await searchMedia(
    document.querySelector<HTMLHeadingElement>('h3.pageTitle')?.textContent ?? '',
  )

  if (mediaInfo) {
    await setPresenceByMediaId(mediaInfo.Id)
    return
  }

  // display generic info
  presenceData.details = 'Watching:'
  presenceData.state = 'Unknown Content'

  if (!presenceData.state)
    delete presenceData.state
}

/**
 * Handle the presence when the user is playing back content remotely
 */
async function handleRemotePlayback(): Promise<void> {
  const [, mediaId] = /\/Items\/(\w+)\/Images/.exec(
    document.querySelector<HTMLDivElement>('.nowPlayingImage')?.style.backgroundImage ?? '',
  ) ?? []

  await setPresenceByMediaId(mediaId!)
}

/**
 * Handle the presence when the user is viewing the details of an item
 */
async function handleItemDetails(): Promise<void> {
  const data = await obtainMediaInfo(
    new URLSearchParams(location.hash.split('?')[1]).get('id')!,
  )

  if (!data) {
    presenceData.details = 'Browsing details of an item'
    presenceData.state = 'Could not get item details'
  }
  else if (typeof data !== 'string') {
    presenceData.details = `Browsing details of: ${data.Name}`

    switch (data.Type) {
      case 'Movie':
        presenceData.state = `${data.Type} ─ ${data.OriginalTitle} (${data.ProductionYear})`
        break
      case 'Series':
        presenceData.state = `${data.Type} ─ (${data.Status})`
        break
      case 'Season':
        presenceData.state = `${data.Type} ─ ${data.SeriesName}`
        break
      case 'Episode':
        presenceData.state = `${data.Type} ─ ${data.SeriesName} - ${data.SeasonName}`
        break
      case 'Person': {
        let description = 'Description not available'

        if (data.Overview) {
          description = data.Overview.substring(0, 40)
            + (data.Overview.length > 40 ? '...' : '')
        }
        presenceData.state = `${data.Type} ─ ${description}`
        break
      }
      case 'MusicAlbum':
        presenceData.state = `${data.Type} ─ ${data.RecursiveItemCount} songs`
        break
      case 'MusicArtist':
      case 'TvChannel':
        presenceData.state = `${data.Type} ─ No further information available`
        break
      default:
        presenceData.state = 'No further information available'
    }

    if (await presence.getSetting('showThumbnails'))
      presenceData.largeImageKey = mediaPrimaryImage(data)
  }
}

/**
 * Sets a presence based on the given multimedia mediaId
 */
async function setPresenceByMediaId(mediaId: string): Promise<void> {
  const mediaInfo = await obtainMediaInfo(mediaId)

  let title: string | undefined, subtitle: string | undefined

  switch (mediaInfo.Type) {
    case 'Audio':
      presenceData.type = ActivityType.Listening
      title = `Listening to ${mediaInfo.Name ?? 'Unknown title'}`
      subtitle = `By ${mediaInfo.AlbumArtist ?? 'Unknown artist'}`
      break
    case 'Movie':
    case 'Series':
      title = `Watching ${mediaInfo.Type}`
      subtitle = mediaInfo.Name
      break
    case 'Episode':
      title = `Watching: ${mediaInfo.SeriesName}`
      subtitle = `${/S\d+:E\d+/.exec(
        document.querySelector<HTMLHeadingElement>('.pageTitle')?.textContent ?? '',
      )} - ${mediaInfo.Name}`
      break
    case 'TvChannel':
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live TV'
      break
    default:
      title = `Watching ${mediaInfo.Type}`
      subtitle = mediaInfo.Name
  }

  if (presenceData.type !== ActivityType.Listening)
    presenceData.type = ActivityType.Watching

  if (await presence.getSetting('showThumbnails'))
    presenceData.largeImageKey = mediaPrimaryImage(mediaInfo)

  if (mediaInfo.Type !== 'TvChannel') {
    const mediaElement = document.querySelector<HTMLMediaElement>('audio, video')
    const paused = mediaElement
      ? mediaElement.paused
      : document
          .querySelector<HTMLSpanElement>(
            '.nowPlayingBar .playPauseButton span',
          )
          ?.classList
          .contains('play_arrow')

    if (paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'

      delete presenceData.endTimestamp
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'

      // TODO: worth setting timestamps on remote playback? Requires WS connection
      if (mediaElement && (await presence.getSetting('showMediaTimestamps'))) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(mediaElement)
      }
    }
  }

  presenceData.details = title
  presenceData.state = subtitle

  if (!presenceData.state)
    delete presenceData.state
}

/**
 * Suspend execution of code for an interval, see <https://manpage.me/?q=sleep>
 */
function sleep(ms: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, ms)
  })
}

/**
 * Refreshes the ApiClient object
 */
async function loggedIn(): Promise<void> {
  let newApiClient: ApiClient

  do {
    await sleep(125)
    newApiClient = await presence.getPageletiable<ApiClient>('ApiClient')
  } while (!apiClient._serverInfo.AccessToken)

  apiClient = newApiClient
}

/**
 * Handle the presence while the user is in the web client
 */
async function handleWebClient(): Promise<void> {
  const audioElement = document.body.querySelector<HTMLAudioElement>('audio')
  const nowPlayingBar = document.querySelector('.nowPlayingBar')

  // audio player active
  if (
    audioElement
    && audioElement.classList.contains('mediaPlayerAudio')
    && audioElement.src
  ) {
    await handleAudioPlayback()
    return
  }
  else if (
    nowPlayingBar
    && !nowPlayingBar.classList.contains('nowPlayingBar-hidden')
  ) {
    await handleRemotePlayback()
    return
  }

  presenceData.details = 'At web client'

  // obtain the path, on the example would return "login.html"
  // https://media.domain.tld/web/index.html#!/login.html?serverid=randomserverid

  const path = location.hash.split('?')[0]?.substring(2)

  if (path === 'login.html') {
    wasLogin = true
    presenceData.state = 'Logging in'
  }
  else if (wasLogin) {
    loggedIn()
    wasLogin = false
  }

  switch (path) {
    case 'home.html':
      presenceData.state = 'At home'
      break
    case 'search.html':
      presenceData.state = 'Searching'
      presenceData.smallImageKey = Assets.Search
      break

      // user preferences
    case 'mypreferencesmenu.html':
    case 'myprofile.html': // profile
    case 'mypreferencesdisplay.html': // display
    case 'mypreferenceshome.html': // home
    case 'mypreferencesplayback.html': // playback
    case 'mypreferencessubtitles.html': // subtitles
      presenceData.state = 'On user preferences'
      break

      // admin dashboard
    case 'dashboard.html': // server section
    case 'dashboardgeneral.html': // general
    case 'userprofiles.html': // user profiles
    case 'useredit.html': // editing user profile
    case 'userlibraryaccess.html': // editing user profile > library access
    case 'userparentalcontrol.html': // editing user profile > parental control
    case 'userpassword.html': // editing user profile > password
    case 'library.html': // managing library
    case 'librarydisplay.html': // library display settings
    case 'metadataimages.html': // library metadata settings
    case 'metadatanfo.html': // library NFO settings
    case 'encodingsettings.html': // encoding settings > transcoding
    case 'playbackconfiguration.html': // encoding settings > resume
    case 'streamingsettings.html': // encoding settings > streaming
    case 'devices.html': // devices
    case 'device.html': // editing device
    case 'serveractivity.html': // server activity
    case 'dlnasettings.html': // dlna settings > settings
    case 'dlnaprofiles.html': // dlna settings > profiles
    case 'dlnaprofile.html': // dlna settings > add profile
    case 'livetvstatus.html': // manage live tv
    case 'livetvtuner.html': // add/manage tv tuner
    case 'livetvguideprovider.html': // add/manage tv guide provider
    case 'livetvsettings.html': // live tv settings (dvr) // advanced section
    case 'networking.html': // networking
    case 'apikeys.html': // api keys
    case 'log.html': // logs
    case 'notificationsettings.html': // notification settings
    case 'installedplugins.html': // plugins
    case 'availableplugins.html': // plugins catalog
    case 'scheduledtasks.html': // scheduled tasks
    case 'configurationpage': // plugins configuration page
      presenceData.state = 'On admin dashboard'
      break

    case 'movies.html':
      presenceData.state = 'Browsing movies'
      break

    case 'tv.html':
      presenceData.state = 'Browsing tv series'
      break

    case 'music.html':
      presenceData.state = 'Browsing music'
      break

    case 'livetv.html':
      presenceData.state = 'Browsing Live TV'
      break

    case 'edititemmetadata.html':
      presenceData.state = 'Editing media metadata'
      break

    case 'details':
      await handleItemDetails()
      break

    case 'video':
      await handleVideoPlayback()
      break

    case 'nowplaying.html':
      presenceData.state = 'Viewing the audio playlist'
      break
  }
}

/**
 * Sets default values to the presenceData object
 */
async function setDefaultsToPresence(): Promise<void> {
  presenceData.largeImageKey = ActivityAssets.logo

  if (presenceData.smallImageKey)
    delete presenceData.smallImageKey

  if (presenceData.smallImageText)
    delete presenceData.smallImageText

  if (presenceData.state)
    delete presenceData.state

  if (presenceData.startTimestamp)
    delete presenceData.startTimestamp

  if (Number.isNaN(presenceData.endTimestamp as number))
    delete presenceData.endTimestamp

  if ((await presence.getSetting<boolean>('showTimestamps')) === false)
    delete presenceData.startTimestamp
}

/**
 * Initializes the ApiClient object
 */
async function refreshApiClient(): Promise<void> {
  apiClient ??= (
    await presence.getPageVariable<Record<'ApiClient', ApiClient>>('ApiClient')
  ).ApiClient
}

/**
 * Imports the ApiClient variable and verifies that we are in the jellyfin web client
 */
async function isJellyfinWebClient(): Promise<boolean> {
  if (!apiClient)
    await refreshApiClient()

  if (
    apiClient
    && typeof apiClient === 'object'
    && apiClient._appName
    && apiClient._appName === 'Jellyfin Web'
  ) {
    return true
  }

  return false
}

/**
 * PreMiD tick function
 */
async function updateData(): Promise<void> {
  await setDefaultsToPresence()

  let showPresence = false

  // we are on the official jellyfin page
  if (location.host.toLowerCase() === JELLYFIN_URL) {
    showPresence = true
    handleOfficialWebsite()

    // we are on the web client and has been verified
  }
  else if (await isJellyfinWebClient()) {
    showPresence = true
    await handleWebClient()
  }

  // if jellyfin is detected init/update the presence status
  if (showPresence) {
    const largeImageKey = presenceData.largeImageKey as string
    if (isPrivateIP(largeImageKey)) {
      if (uploadedMediaCache.has(largeImageKey)) {
        presenceData.largeImageKey = uploadedMediaCache.get(largeImageKey)
      }
      else {
        await fetch(largeImageKey)
          .then(res => res.blob())
          .then((blob) => {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
              const result = reader.result as string
              uploadedMediaCache.set(largeImageKey, result)
              presenceData.largeImageKey = result
            }
          })
      }
    }

    if (!presenceData.details)
      presence.setActivity()
    else presence.setActivity(presenceData)
  }
}

function isPrivateIP(ip: string): boolean {
  return /^http:\/\/(?:192\.168\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.|127\.0\.0\.1|localhost)/.test(
    ip,
  )
}
/**
 * Check if the presence should be initialized, if so start doing the magic
 */
async function init(): Promise<void> {
  let validPage = false
  let infoMessage

  // jellyfin website
  if (location.host === JELLYFIN_URL) {
    validPage = true
    infoMessage = 'Jellyfin website detected'

    // web client
  }
  else {
    try {
      for (const server of JSON.parse(
        localStorage.getItem('jellyfin_credentials') ?? '{}',
      ).Servers) {
        // user has accessed in the last 30 seconds, should be enough for slow connections
        if (
          Date.now() - new Date(server.DateLastAccessed).getTime()
          < 30 * 1000
        ) {
          validPage = true
          infoMessage = 'Jellyfin web client detected'
        }
      }
    }
    catch {
      validPage = false
    }
  }

  if (validPage) {
    presence = new Presence({
      clientId: '669359568391766018',
    })

    presence.info(infoMessage ?? '')
    presence.on('UpdateData', updateData)
  }
}
init()
