export interface ApiClient {
  enableAutomaticBitrateDetection: boolean
  enableAutomaticNetworking: boolean
  lastDetectedBitrate: number
  lastDetectedBitrateTime: number
  lastFetch: number
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
    LastActivityDate: string
    LastLoginDate: string
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

export interface MediaStream {
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

export interface MediaSource {
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

export interface ExternalUrl {
  Name: string
  Url: string
}

export interface Person {
  Name: string
  Id: string
  Role: string
  Type: string
  PrimaryImageTag: string
}

export interface UserData {
  PlaybackPositionTicks: number
  PlayCount: number
  IsFavorite: boolean
  LastPlayedDate: string
  Played: boolean
  Key: string
}

export interface Chapter {
  StartPositionTicks: number
  Name: string
  ImageDateModified: string
}

export interface MediaInfo {
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
  DateCreated: string
  CanDelete: boolean
  CanDownload: boolean
  HasSubtitles: boolean
  Container: string
  SortName: string
  PremiereDate: string
  ExternalUrls: ExternalUrl[]
  MediaSources: MediaSource[]
  Path: string
  EnableMediaSourceDisplay: boolean
  Overview: string
  Genres: string[]
  CommunityRating: number
  RunTimeTicks: number
  PlayAccess: string
  ProductionYear: number
  IndexNumber: number
  ParentIndexNumber: number
  ProviderIds: {
    Imdb?: string
    Tmdb?: string
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
  PrimaryImageAspectRatio: number
  SeriesPrimaryImageTag: string
  SeasonName: string
  MediaStreams: MediaStream[]
  VideoType: string
  ImageTags: {
    Primary: string
  }
  SeriesStudio: string
  Chapters: Chapter[]
  LocationType: string
  MediaType: string
  LockData: boolean
  Width: number
  Height: number
}

export interface Server {
  AccessToken: string
  DateLastAccessed: number
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
