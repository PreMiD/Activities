export enum Images {
  Logo = 'https://mido.anlayana.com/premid/images/stigstream/logo.png',
}

export interface Settings {
  privacy: boolean
  showButtons: boolean
  showTimestamp: boolean
  showPosters: boolean
}

export interface IframeData {
  duration: number
  currentTime: number
  paused: boolean
}
