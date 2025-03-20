import { compare } from 'compare-versions'
import { ActivityType, Assets } from 'premid'

/*
 * The interfaces may have some things missing,
 * I've tried to set as many properties as I could find.
 */
let version: string
let showMediaTimestamp = false

const uploadedMediaCache = new Map<string, string>()

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
      // GroupedFolders: Array; // don't know type of content of the array
      HidePlayedInLatest: boolean
      // LatestItemsExcludes: Array; // don't know type of content of the array
      // MyMediaExcludes: Array; // don't know type of content of the array
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
      // AccessSchedules: Array; // don't know type of content of the array
      AuthenticationProviderId: string
      // BlockUnratedItems: Array; // don't know type of content of the array
      // BlockedTags: Array; // don't know type of content of the array
      EnableAllChannels: boolean
      EnableAllDevices: boolean
      EnableAllFolders: boolean
      EnableAudioPlaybackTranscoding: boolean
      EnableContentDeletion: boolean
      // EnableContentDeletionFromFolders: Array; // don't know type of content of the array
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
      // EnabledChannels: Array; // don't know type of content of the array
      // EnabledDevices: Array; // don't know type of content of the array
      // EnabledFolders: Array; // don't know type of content of the array
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
  _serverInfo: Server | ServerLatest
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
  ParentId: number
  Type: string
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

interface ServerLatest {
  ManualAddress: string
  ManualAddressOnly: boolean
  IsLocalServer: true
  UserId: string
  DateLastAccessed: number
  LastConnectionMode: number
  Type: string
  Name: string
  Id: string
  Users: [
    {
      UserId: string
      AccessToken: string
    },
    {
      UserId: string
      AccessToken: string
    },
  ]
  LocalAddress: string
  RemoteAddress: string
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

const // official website
  EMBY_URL = 'emby.media'
  // web client app name
  // all the presence art assets uploaded to discord
const PRESENCE_ART_ASSETS = {
  download: Assets.Downloading,
  live: Assets.Live,
  logo: 'https://cdn.rcd.gg/PreMiD/websites/E/Emby/assets/0.png',
  pause: Assets.Pause,
  play: Assets.Play,
  read: Assets.Reading,
  search: Assets.Search,
  write: Assets.Writing,
}
const presenceData: PresenceData = {
  largeImageKey: PRESENCE_ART_ASSETS.logo,
}

let presence: Presence, apiClient: ApiClient

async function createImageBlob() {
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
}

/**
 * handleOfficialWebsite - handle the presence while the user is in the official website
 */
function handleOfficialWebsite(): void {
  presenceData.details = `At ${EMBY_URL}`

  switch (location.pathname) {
    case '/':
    case '/index.html':
      presenceData.state = 'On landing page'
      break
    case '/about.html':
      presenceData.state = 'On about page'
      break
    case '/blog.html':
      presenceData.state = 'Reading the blog'
      presenceData.smallImageKey = PRESENCE_ART_ASSETS.read
      break
    case '/download.html':
      presenceData.state = 'On downloads'
      presenceData.smallImageKey = PRESENCE_ART_ASSETS.download
      break
    case '/premiere.html':
    case '/premiere-ext.html': // extended premiere options
    case '/premiereterms.html': // tos
      presenceData.state = 'Learning about premiere'
      break
    case '/support.html':
      presenceData.state = 'On support page'
      break
    default:
      // reading the docs
      if (location.pathname.startsWith('/community')) {
        presenceData.state = 'On community page'
      }
      else if (
        document.querySelector('.w-pagehead > h1')
        && document.querySelector('.w-pagehead > h1')?.textContent === 'Emby Blog'
      ) {
        presenceData.state = 'Reading the blog'
        presenceData.smallImageKey = PRESENCE_ART_ASSETS.read
      }
  }
}
/**
 * getApiClient - Obtains the ApiClient variable from the web client
 *
 * @return {ApiClient} ApiClient object
 */
async function getApiClient() {
  const actualData = await presence.getPageVariable('ApiClient')
  return actualData.ApiClient as ApiClient
}

/**
 * isEmbyWebClient - imports the ApiClient variable and
 * verifies that we are in the emby web client
 *
 * @return {boolean} true once the variable has been imported, otherwise false
 */
async function isEmbyWebClient(): Promise<boolean> {
  apiClient ??= await getApiClient()

  if (
    typeof apiClient === 'object'
    && apiClient._appName
    && apiClient._appName === 'Emby Web'
  ) {
    return true
  }

  return false
}

function embyBasenameURL(): string {
  const { pathname } = location

  return `${location.origin}${pathname.replace(
    pathname.split('/').slice(-2).join('/'),
    '',
  )}`
}

function mediaPrimaryImage(mediaId: string): string {
  return `${embyBasenameURL()}/emby/Items/${mediaId}/Images/Primary?height=256`
}

function audioVariablesReplaced(str: string, info: MediaInfo) {
  if (!str || !info) {
    presence.error(
      'Can\'t find audio variables str or info. Contact the presence developer.',
    )
    return ''
  }
  return str
    ?.replace('%title%', info?.Name ?? 'unknown title')
    ?.replace(
      '%artist%',
      info?.Artists.length === 0 ? 'unknown artists' : info?.Artists?.join(', '),
    )
    ?.replace('%releasedate%', info?.DateCreated ?? 'unknown date')
    ?.replace(
      '%albumartist%',
      info?.AlbumArtists?.map(x => x.Name).join(', ') ?? 'unknown album artists',
    )
}
/**
 * handleAudioPlayback - handles the presence when the audio player is active
 */
async function handleAudioPlayback(): Promise<void> {
  // sometimes the buttons are not created fast enough
  try {
    const [audioDetails, audioState] = await Promise.all([
      presence.getSetting<string>('audDetail'),
      presence.getSetting<string>('audState'),
    ])
    presenceData.type = ActivityType.Listening
    const audioElement = document.querySelector<HTMLAudioElement>('audio')
    const regexResult = /\/Audio\/(\w+)\/universal/.exec(audioElement?.src ?? '')
      || /(\d+)/.exec(
        document.querySelector('.nowPlayingBar')?.getAttribute('data-id') ?? '',
      )

    if (!regexResult) {
      presence.error('Could not obtain audio itemId')
      return
    }

    const [, mediaId] = regexResult
    const info = await obtainMediaInfo(mediaId!)
    presenceData.details = audioVariablesReplaced(audioDetails, info)
    presenceData.state = audioVariablesReplaced(audioState, info)

    if (
      (await presence.getSetting('showThumbnails'))
      // some songs might not have albumart
      && document.querySelector<HTMLDivElement>('.nowPlayingBarImage')?.style.backgroundImage
    ) {
      presenceData.largeImageKey = mediaPrimaryImage(mediaId!)
      createImageBlob()
    }

    // playing
    if (audioElement && !audioElement.paused) {
      presenceData.smallImageKey = PRESENCE_ART_ASSETS.play
      presenceData.smallImageText = 'Playing'

      if (showMediaTimestamp) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(audioElement)
      }
      else {
        delete presenceData.endTimestamp
      }

      // paused
    }
    else {
      presenceData.smallImageKey = PRESENCE_ART_ASSETS.pause
      presenceData.smallImageText = 'Paused'

      delete presenceData.endTimestamp
    }
  }
  catch {
    // do nothing
  }
}

/**
 * getUserId - obtains the user id
 *
 * @return {string}  user id
 */
function getUserId(): string {
  try {
    return apiClient._currentUser.Id
  }
  catch {
    const servers: Server[] = JSON.parse(
      localStorage.getItem('servercredentials3')!,
    ).Servers

    return (
      servers.length === 1
        ? servers[0]
        : servers.find(
            (s: Server) =>
              s.Id
              === new URLSearchParams(location.hash.split('?')[1]).get('serverId'),
          )
    )!.UserId
  }
}

// cache the requested media
const mediaInfoCache = new Map<string, MediaInfo>()

/**
 * obtainMediaInfo - obtain the metadata of the given id
 *
 * @param  {string} itemId id of the item to get metadata of
 * @return {object}        metadata of the item
 */
async function obtainMediaInfo(itemId: string): Promise<MediaInfo> {
  if (mediaInfoCache.has(itemId))
    return mediaInfoCache.get(itemId)!
  let ae, accessToken: string
  if (compare(version, '4.7.0', '>')) {
    ae = apiClient._serverInfo as ServerLatest
    accessToken = ae?.Users?.[1]?.AccessToken
  }
  else {
    ae = apiClient._serverInfo as Server
    accessToken = ae?.AccessToken
  }

  if (!accessToken) {
    // refresh the ApiClient
    apiClient = await getApiClient()
    if (compare(version, '4.7.0', '>')) {
      ae = apiClient._serverInfo as ServerLatest
      accessToken = ae?.Users?.[1]?.AccessToken
    }
    else {
      ae = apiClient._serverInfo as Server
      accessToken = ae?.AccessToken
    }
  }
  const url = `${embyBasenameURL()}emby/Users/${getUserId()}/Items/${itemId.replace(
    /\//g,
    '',
  )}?`
  + `X-Emby-Client=${apiClient._appName.replace(/ /g, '_')}&`
  + `X-Emby-Device-Name=${apiClient._deviceName}&`
  + `X-Emby-Device-Id=${apiClient._deviceId}&`
  + `X-Emby-Client-Version=${apiClient._appVersion}&`
  + `X-Emby-Token=${accessToken}`
  const res = await fetch(url.replace(/ /g, '_'))
  const mediaInfo: MediaInfo = await res.json()

  mediaInfoCache.set(itemId, mediaInfo)

  return mediaInfoCache.get(itemId)!
}

/**
 * handleVideoPlayback - handles the presence when the user is using the video player
 */
async function handleVideoPlayback(): Promise<void> {
  const videoPlayerPage = document.querySelector('[data-type=\'video-osd\']')
    || document.querySelector('.htmlVideoPlayerContainer')

  if (videoPlayerPage === null) {
    // elements not loaded yet
    return
  }
  getApiClient()

  const videoPlayerElem = document.querySelector<HTMLVideoElement>('video')

  // this variables content will be replaced in details and status properties on presenceData
  let title
  let subtitle
  let largeImage = PRESENCE_ART_ASSETS.logo

  const regexResult = /\/Items\/(\d+)\//.exec(
    document.querySelector<HTMLDivElement>('.pageTitle')?.style.backgroundImage ?? '',
  )
  || /\/Items\/(\d+)\//.exec(
    document.querySelector<HTMLDivElement>('.itemBackdrop')?.style?.backgroundImage ?? '',
  )
  || /\/\d+\//.exec(document.querySelector<HTMLVideoElement>('video')?.src ?? '')

  if (!regexResult || !videoPlayerElem) {
    presence.error('Could not obtain video itemId')
    return
  }

  const mediaInfo = await obtainMediaInfo(regexResult[1] || regexResult[0])

  // display generic info
  if (!mediaInfo || typeof mediaInfo === 'string') {
    title = 'Watching unknown content'
    subtitle = 'No metadata could be obtained'
  }
  else {
    switch (mediaInfo.Type) {
      case 'Movie':
        title = 'Watching a Movie'
        subtitle = mediaInfo.Name

        if (await presence.getSetting('showThumbnails'))
          largeImage = mediaPrimaryImage(mediaInfo.Id)
        break
      case 'Series':
        title = `Watching ${mediaInfo.Name}`
        subtitle = videoPlayerPage.querySelector('h3.videoOsdTitle')?.textContent

        if (await presence.getSetting('showThumbnails'))
          largeImage = mediaPrimaryImage(mediaInfo.Id)
        break
      case 'TvChannel':
        title = 'Watching Live Tv'
        subtitle = mediaInfo.Name
        break
      default:
        title = `Watching ${mediaInfo.Type}`
        subtitle = mediaInfo.Name
    }

    presenceData.largeImageKey = largeImage
    createImageBlob()

    // watching live tv
    if (mediaInfo && mediaInfo.Type === 'TvChannel') {
      presenceData.type = ActivityType.Watching
      presenceData.smallImageKey = PRESENCE_ART_ASSETS.live
      presenceData.smallImageText = 'Live TV'

      // playing
    }
    else if (!videoPlayerElem.paused) {
      presenceData.type = ActivityType.Watching
      presenceData.smallImageKey = PRESENCE_ART_ASSETS.play
      presenceData.smallImageText = 'Playing'

      if (showMediaTimestamp) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(videoPlayerElem)
      }
      else {
        delete presenceData.endTimestamp
      }

      // paused
    }
    else {
      presenceData.type = ActivityType.Watching
      presenceData.smallImageKey = PRESENCE_ART_ASSETS.pause
      presenceData.smallImageText = 'Paused'

      delete presenceData.endTimestamp
    }
  }
  presenceData.details = title
  presenceData.state = subtitle
  if (!presenceData.state)
    delete presenceData.state
}

/**
 * handleItemDetails - handles the presence when the user is viewing the details of an item
 */
async function handleItemDetails(): Promise<void> {
  const data = await obtainMediaInfo(
    new URLSearchParams(location.hash.split('?')[1]).get('id')!,
  )
  delete presenceData.startTimestamp
  delete presenceData.endTimestamp

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
          description = data.Overview.substr(0, 40)
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
  }
}

/**
 * handleWebClient - handle the presence while the user is in the web client
 */
async function handleWebClient(): Promise<void> {
  const audioElement = document.body.querySelector<HTMLAudioElement>('audio')

  // audio player active
  if (
    audioElement
    && audioElement.classList.contains('mediaPlayerAudio')
    && document.querySelector('.nowPlayingBarInfoContainer')
    && audioElement.src
  ) {
    await handleAudioPlayback()
    return
  }

  presenceData.details = 'At web client'

  // obtain the path, on the example would return "login.html"
  // https://media.domain.tld/web/index.html#!/login.html?serverid=randomserverid
  const path = location.hash.split('?')[0]?.substring(3)

  switch (path) {
    case 'startup/login.html':
    case 'startup/manuallogin.html':
    case 'startup/forgotpassword.html':
      presenceData.state = 'Logging in'
      break
    case 'home':
      presenceData.state = 'At home'
      break
    case 'search':
      presenceData.state = 'Searching'
      presenceData.smallImageKey = PRESENCE_ART_ASSETS.search
      break

      // user preferences
    case 'settings':
    case 'settings/display.html': // display
    case 'settings/homescreen.html': // home screen
    case 'settings/playback.html': // playback
    case 'settings/subtitles.html': // subtitles
    case 'settings/profile.html': // profile
    case 'settings/password.html': // password
    case 'settings/keyboard.html': // keyboard and remote
      presenceData.state = 'On user preferences'
      break

      // admin dashboard
    case 'dashboard': // server section
    case 'dashboardgeneral.html': // general
    case 'users': // user profiles
    case 'useredit.html': // editing user profile
    case 'userlibraryaccess.html': // editing user library access
    case 'userparentalcontrol.html': // editing user parental control
    case 'userpassword.html': // editing user password
    case 'supporterkey.html': // emby premiere key
    case 'librarysetup/library.html': // managing library
    case 'librarysetup/advanced.html': // managing library advanced
    case 'network': // network section
    case 'transcoding': // transcode settings
    case 'syncactivity.html': // conversions && downloads
    case 'syncsettings.html': // conversions settings
    case 'configurationpage': // generic config page // devices section
    case 'devices': // devices
    case 'devices/device.html': // editing device
    case 'devices/cameraupload.html': // camera upload // live tv section
    case 'livetvsetup/livetvstatus.html': // manage live tv
    case 'livetvsetup/livetvtuner.html': // add/manage tv tuner
    case 'livetvsetup/guideprovider.html': // add/manage tv guide provider
    case 'livetvsetup/livetvsettings.html': // live tv settings (dvr) // advanced section
    case 'logs': // logs
    case 'notificationsettings.html': // notification settings
    case 'plugins/plugins.html': // plugins
    case 'plugins/plugincatalog.html': // plugins catalog
    case 'plugins/addplugin.html': // add plugin
    case 'scheduledtasks': // scheduled tasks
    case 'scheduledtask': // scheduled task settings
    case 'apikeys': // api keys
      presenceData.state = 'On admin dashboard'
      break

    case 'movies':
      presenceData.state = 'Browsing movies'
      break

    case 'tv':
      presenceData.state = 'Browsing tv series'
      break

    case 'music':
      presenceData.state = 'Browsing music'
      break

    case 'metadatamanager':
      presenceData.state = 'Editing media metadata'
      break

    case 'item':
      await handleItemDetails()
      break

    case 'videoosd/videoosd.html': {
      await handleVideoPlayback()
      break
    }
    default:
      if (path?.substr(0, 3) !== 'dlg')
        presence.info(`path: ${path}`)
  }
}

/**
 * setDefaultsToPresence - set defaul values to the presenceData object
 */
async function setDefaultsToPresence(): Promise<void> {
  presenceData.largeImageKey = PRESENCE_ART_ASSETS.logo

  if (presenceData.smallImageKey)
    delete presenceData.smallImageKey

  if (presenceData.smallImageText)
    delete presenceData.smallImageText

  if (presenceData.startTimestamp)
    delete presenceData.startTimestamp

  if (Number.isNaN(presenceData.endTimestamp as number))
    delete presenceData.endTimestamp

  if (await presence.getSetting<boolean>('showTimestamps'))
    presenceData.startTimestamp = Date.now()
}

/**
 * updateData - tick function, this is called several times a second by UpdateData event
 */
async function updateData(): Promise<void> {
  showMediaTimestamp = await presence.getSetting<boolean>(
    'showMediaTimestamps',
  )
  await setDefaultsToPresence()

  let showPresence = false

  const tempversion = apiClient?._appVersion ?? (await getApiClient())?._appVersion

  if (!version || version !== tempversion)
    version = tempversion

  // we are on the official emby page
  if (location.host.toLowerCase() === EMBY_URL) {
    showPresence = true
    handleOfficialWebsite()

    // we are on the web client and has been verified
  }
  else if (await isEmbyWebClient()) {
    showPresence = true
    await handleWebClient()
  }

  // hide start timestamp on media playback
  if (
    presenceData.smallImageKey === PRESENCE_ART_ASSETS.play
    || presenceData.smallImageKey === PRESENCE_ART_ASSETS.pause
  ) {
    delete presenceData.startTimestamp
  }

  // if emby is detected init/update the presence status
  if (showPresence) {
    if (!presenceData.largeImageKey)
      presenceData.largeImageKey = PRESENCE_ART_ASSETS.logo
    if (!presenceData.details)
      presence.setActivity()
    else presence.setActivity(presenceData)
  }
}

/**
 * init - check if the presence should be initialized, if so start doing the magic
 *
 * @return {void}
 */
async function init(): Promise<void> {
  let validPage = false
  let isWebClient = false

  // emby website
  if (location.host === EMBY_URL) {
    validPage = true
    presence.info('Emby website detected')

    // web client
  }
  else {
    try {
      for (const server of JSON.parse(
        localStorage.getItem('servercredentials3')!,
      ).Servers) {
        // user has accessed in the last 30 seconds, should be enough for slow connections
        if (
          Date.now() - new Date(server.DateLastAccessed).getTime()
          < 30 * 1000
        ) {
          validPage = true
          isWebClient = true
        }
      }
    }
    catch {
      validPage = false
    }
  }

  if (validPage) {
    presence = new Presence({
      clientId: '671807692297207828',
    })
    presence.on('UpdateData', updateData)
    if (isWebClient)
      presence.info('Emby web client detected')
  }
}

function isPrivateIP(ip: string): boolean {
  return /http:\/\/(?:192\.168\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.|127\.0\.0\.1|localhost)|firehostredux/.test(
    ip,
  )
}

init()
