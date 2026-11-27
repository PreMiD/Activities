interface PlaybackState {
  currentTime: number
  duration: number
  sampledAt: number
  paused: boolean
  stagnantSamples: number
}

interface IframeVideoState {
  currentTime: number
  duration: number
  paused: boolean
  referrer?: string
}

interface PresenceState {
  browsingTimestamp: number
  lastMode: string
  lastPlaybackHref: string
  lastPlaybackRead: number
  playbackState: PlaybackState
  iframePlayback: IframeVideoState
}

const state: PresenceState = {
  browsingTimestamp: Math.floor(Date.now() / 1000),
  lastMode: 'browse',
  lastPlaybackHref: '',
  lastPlaybackRead: 0,
  playbackState: {
    currentTime: 0,
    duration: 0,
    sampledAt: 0,
    paused: false,
    stagnantSamples: 0,
  },
  iframePlayback: {
    currentTime: 0,
    duration: 0,
    paused: true,
  },
}

export function getState() {
  return state
}

export function updateState(partial: Partial<PresenceState>) {
  Object.assign(state, partial)
}

export function setMode(mode: string): void {
  if (mode !== state.lastMode && mode !== 'watch') {
    state.browsingTimestamp = Math.floor(Date.now() / 1000)
  }

  state.lastMode = mode
}
