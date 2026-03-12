export interface dataObject {
  acc: number
  author: string
  combo: number
  ranked: boolean
  score: number
  screen: {
    0: string
    1: number
  }
  special: boolean
  stars: number
  through: number
  title: string
  type: string
}

export interface PageVars {
  'Tt.time': number
  'Tt.timeEnd': number
  'Tt.paused': boolean
  'Tt.failed': boolean
  'Bt.screen': string
  'Bt.online.mode': string
  'Bt.song.mode': string
  'Tt.bpm': number
}
