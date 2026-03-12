export enum Images {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Moikatsu/assets/logo.png',
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
