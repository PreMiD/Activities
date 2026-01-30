export interface PlaybackInfo {
  currTime: number
  duration: number
  paused: boolean
}

export interface Playback {
  animeID: string
  episode: string
}

export interface PictureCache {
  id: string
  url: string
  date: Date
}

export interface SeasonResponse {
  found: boolean
  name: string
  season: number
}
