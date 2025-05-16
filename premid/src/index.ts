import type GeneralStrings from '../../websites/general.json'

export * from './functions/getTimestamps.js'
export * from './functions/getTimestampsFromMedia.js'
export * from './functions/timestampFromFormat.js'

/**
 * Interface which holds keys usable for `Presence#getStrings` for type hints.
 *
 * Can be extended with code like this:
 * ```ts
 * import type ExampleStrings from './Example.json'
 *
 * declare module 'premid' {
 *   interface StringKeys {
 *     custom: keyof typeof ExampleStrings
 *   }
 * }
 * ```
 */
export interface StringKeys {
  general: keyof typeof GeneralStrings
}

export type StringKeysResolved = StringKeys[keyof StringKeys]

export enum ActivityType {
  /**
   * Playing {name}
   */
  Playing = 0,
  /**
   * Listening to {name}
   */
  Listening = 2,
  /**
   * Watching {name}
   */
  Watching = 3,
  /**
   * Competing in {name}
   */
  Competing = 5,
}

export enum Assets {
  Play = 'https://cdn.rcd.gg/PreMiD/resources/play.png',
  Pause = 'https://cdn.rcd.gg/PreMiD/resources/pause.png',
  Stop = 'https://cdn.rcd.gg/PreMiD/resources/stop.png',
  Search = 'https://cdn.rcd.gg/PreMiD/resources/search.png',
  Question = 'https://cdn.rcd.gg/PreMiD/resources/question.png',
  Live = 'https://cdn.rcd.gg/PreMiD/resources/live.png',
  Reading = 'https://cdn.rcd.gg/PreMiD/resources/reading.png',
  Writing = 'https://cdn.rcd.gg/PreMiD/resources/writing.png',
  Call = 'https://cdn.rcd.gg/PreMiD/resources/call.png',
  VideoCall = 'https://cdn.rcd.gg/PreMiD/resources/video-call.png',
  Downloading = 'https://cdn.rcd.gg/PreMiD/resources/downloading.png',
  Uploading = 'https://cdn.rcd.gg/PreMiD/resources/uploading.png',
  Repeat = 'https://cdn.rcd.gg/PreMiD/resources/repeat.png',
  RepeatOne = 'https://cdn.rcd.gg/PreMiD/resources/repeat-one.png',
  Premiere = 'https://cdn.rcd.gg/PreMiD/resources/premiere.png',
  PremiereLive = 'https://cdn.rcd.gg/PreMiD/resources/premiere-live.png',
  Viewing = 'https://cdn.rcd.gg/PreMiD/resources/viewing.png',
}
