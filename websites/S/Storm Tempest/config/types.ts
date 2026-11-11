export interface WatchState {
  title: string
  source?: string
  episode?: string
  totalEpisodes?: string
  url: string
  image?: string
  video?: HTMLVideoElement
}

export interface ReadState {
  kind: string
  title: string
  source: string
  chapter?: string
  chapterLabel?: string
  page?: number
  pages?: number
  progress?: number
  position?: { partySize: number, maxPartySize: number }
  url: string
  image?: string
}

export interface CodestoState {
  project?: string
  file?: string
  running: boolean
  url: string
}

export interface SectionState {
  details: string
  state: string
  privateDetails: string
  privateState: string
  buttonLabel: string
  url: string
  image?: string
  video?: HTMLVideoElement
  media?: boolean
  teacher?: { source: string, id: string }
}

export interface Playback {
  paused: boolean
  ended?: boolean
  currentTime: number
  duration: number
}

export interface PageState {
  name: string
  url: string
  kind?: 'search' | 'profile'
  subject?: string
}

export interface RoomState {
  joined: boolean
  name?: string
  title?: string
  episode?: string
  members?: number
  hosting?: boolean
  titleHref?: string
  url: string
  image?: string
  video?: HTMLVideoElement
}

export interface Options {
  buttons: boolean
  cover: boolean
  time: boolean
}
