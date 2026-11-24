export interface LiveAiring {
  title: string
  seriesTitle?: string
  seasonNumber?: number
  episodeNumber?: number
  startTime: number
  endTime: number
  image?: string
}

export interface LiveSchedule {
  airings: LiveAiring[]
  // Offset between the server clock and the client clock (ms)
  clockOffset: number
  // Channel logo, used when the program has no artwork
  stationLogo?: string
}

export interface PlaybackRequest {
  gti: string
  origin: string
  params: URLSearchParams
  startTime: number
}

export interface PlaybackMetadata {
  type?: string
  title?: string
  seriesTitle?: string
  seasonNumber?: number
  episodeNumber?: number
  // Live event (sports...)
  eventTitle?: string
  image?: string
  schedule?: LiveSchedule
  fetchedAt: number
}

export interface PlaybackDisplay {
  title?: string
  subtitle?: string
  // largeImageText: "Season X, Episode Y" is converted to SxEy by Discord
  episodeText?: string
  // Live TV: current program
  airing?: LiveAiring
  station?: string
  // Live event: `currentTime` = elapsed time since it began
  liveEvent?: boolean
  // Artwork specific to the content, replacing the page banner
  image?: string
}

// Request data used by the timeline, from `onRequest` or the fetch forwarder
export interface RequestData {
  url: string
  requestBody: string | null
  responseBody: string | null
}

// State of one title, built from the player requests (cf. timelineTracker.ts)
export interface TimelineState {
  gti: string
  // Duration (s) of items before the content (Prime Video jingle)
  intro: number
  // Duration (s) of the title without ads
  full: number | null
  // Ad breaks: position (s) in the ad-free video, ad marker and duration (s)
  breaks: { cue: number, marker: string | null, a: number }[]
  // Last real position (VOD) reported by Amazon, with the corresponding `currentTime`
  anchor: { ct: number, cp: number } | null
  // Last real time (live, ms, server clock) reported by Amazon, with the corresponding `currentTime`
  live: { ct: number, t: number, src: string } | null
}

export interface TimelineInfo {
  // Real content position (s)
  position: number
  // Real content duration (s)
  duration: number
  inAd: boolean
}
