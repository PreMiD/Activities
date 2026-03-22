export interface AppStrings {
  // General
  play: string
  pause: string
  browsing: string
  menu: string
  common_menu: string
  overview: string
  library: string
  vs_separator: string
  min: string
  survival: string

  // Chess specific
  home: string

  // Computer
  computer_vs: string
  computer_selecting: string
  computer_ai: string
  computer_name: string
  playing_as_white: string
  playing_as_black: string

  // Puzzles
  puzzle_solving: string
  puzzle_rush: string
  puzzle_battle: string
  puzzle_tactics: string
  score: string
  level: string
  rating: string

  // Play / Game
  play_online: string
  play_daily: string
  play_match: string
  play_live: string
  play_lobby: string
  game_online: string
  searching: string
  game_finished: string
  game_over: string
  game_reviewing: string
  watching_replay: string
  spectating: string
  waiting: string
  match_in_progress: string
  archive: string

  // Media
  media_analysis: string
  media_learning: string
  media_lessons: string
  media_tv: string
  media_video: string
  media_finished: string
  tv_checking: string
  video_browsing: string
  video_watching: string
  video_library: string

  // Social
  friends_list: string
  friends_single: string
  friends_plural: string
  profile: string
  profile_general_alt: string
  profile_viewing: string
  viewing_profile: string

  // Buttons & Menus
  button_view_game: string
  button_watch_video: string
  variants_menu: string
  game_review: string

  // Classroom
  classroom_title: string
  classroom_session: string

  // Practice
  practice_title: string

  // Learn
  learn_openings: string
  learn_all_lessons: string

  // Insights
  insights_title: string
  insights_stats: string
}

export interface Button {
  label: string
  url: string
}

export type ButtonTuple = [Button, (Button | undefined)?]

export interface Resolver {
  isActive: (pathname: string) => boolean
  getDetails?: (t: AppStrings, doc: Document, lang?: string) => string | undefined
  getState?: (t: AppStrings, doc: Document, displayFormat?: number, hideRating?: boolean) => string | undefined
  getLargeImageKey?: (t: AppStrings, doc: Document) => string | undefined
  getSmallImageKey?: (t: AppStrings, doc: Document) => string | undefined
  getSmallImageText?: (t: AppStrings, doc: Document) => string | undefined
  getType?: (t: AppStrings, doc: Document) => number | undefined
  getButtons?: (t: AppStrings, doc: Document) => ButtonTuple | undefined
  getTimestamps?: (t: AppStrings, doc: Document) => { start: number, end: number } | undefined
}
