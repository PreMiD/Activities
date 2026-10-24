export const CLIENT_ID = '705139844883677224'

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Prime%20Video/assets/logo.png',
}

export const DETAIL_PATH = '/detail'

// Page elements
export const SELECTORS = {
  // Multiple players can coexist in the DOM (e.g., paused episode + live stream)
  playerVideo: 'div[id^=dv-web-player] video[src]',
  playerVideoFallback: '#dv-web-player video',
  playerTitle: '.atvwebplayersdk-player-container .fpqiyer .ffszj3z .f124tp54 h1',
  overlayTitle: '.atvwebplayersdk-title-text',
  overlayEpisode: '.atvwebplayersdk-episode-info',
  overlaySubtitle: '.atvwebplayersdk-subtitle-text',
  detailImage: '.DVWebNode-detail-atf-wrapper picture img',
  detailTitle: 'h1[data-automation-id="title"]',
  detailWrapperTitle: '.DVWebNode-detail-atf-wrapper .BaLbyy h1',
  banner: 'main div[data-automation-id="hero-background"] img',
  searchSummary: '.av-refine-bar-summaries',
} as const

// Values of the `imageType` setting
export enum ImageType {
  RightSide = 0,
  Entire = 1,
}

// Where the square crop is taken: the page banner has its main content on the right, other images are centered
export enum CropAlignment {
  Right,
  Center,
}

export const THUMBNAIL_SIZE = 320
export const RIGHT_SIDE_CROP_SIZE = 600
export const MAX_CACHED_THUMBNAILS = 20

// Player network requests
export const PLAYBACK_PATH_REGEX = /\/playback\/prs\/Get\w*PlaybackResources/
export const UPDATE_SESSION_PATH_REGEX = /\/playback\/pes\/UpdateSession/
export const VIDEO_ADS_PATH_REGEX = /\/cdp\/getVideoAds/
export const TRACKED_REQUEST_REGEX = new RegExp([PLAYBACK_PATH_REGEX, UPDATE_SESSION_PATH_REGEX, VIDEO_ADS_PATH_REGEX].map(({ source }) => source).join('|'))

// API used by the player overlay to display title / episode / live guide
export const PLAYER_CHROME_PATH = '/cdp/lumina/playerChromeResources/v1'
export const FORWARDED_PARAMS = ['deviceID', 'deviceTypeID', 'marketplaceID', 'uxLocale', 'firmware', 'gascEnabled']

export const RETRY_DELAY_MS = 10_000
export const SCHEDULE_REFRESH_MS = 15 * 60 * 1000

// Timestamp correction (jingle, ads, live lag) from the player requests
export const ENABLE_TIMELINE_CORRECTION = true
// DOM event relaying the requests from the page, for extensions without `onRequest`
export const REQUEST_EVENT = 'premid-prime-request'
export const MAX_TIMELINE_OFFSET_S = 3600
// Tolerated gap (s) between the video duration and the title duration without ads
export const DURATION_TOLERANCE_S = 2
// Titles kept in memory, and maximum ad time (s) added to a title in the video duration
export const MAX_TRACKED_TITLES = 6
export const MAX_TITLE_ADS_S = 900

// Estimated lag of the live stream behind real-time, used until Amazon's first measurement (≤ 180 s)
export const DEFAULT_LIVE_LAG_MS = 18_000
