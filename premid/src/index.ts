export * from './functions/getTimestamps.js'
export * from './functions/getTimestampsFromMedia.js'
export * from './functions/timestampFromFormat.js'

/**
 * Status display types for Rich Presence
 * @since 2.8.0
 */
export enum StatusDisplayType {
  /** Display the activity name - e.g. "Listening to Spotify" */
  Name = 0,
  /** Display the state field - e.g. "Listening to Rick Astley" */
  State = 1,
  /** Display the details field - e.g. "Listening to Never Gonna Give You Up" */
  Details = 2,
}

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
