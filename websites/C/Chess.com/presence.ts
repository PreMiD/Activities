import type { AppStrings, Resolver } from './util/interfaces.js'
import { ActivityType } from 'premid'
import analysisResolver from './sources/analysis.js'

import classroomResolver from './sources/classroom.js'
import computerResolver from './sources/computer.js'
import friendsResolver from './sources/friends.js'
import gameResolver from './sources/game.js'
import insightsResolver from './sources/insights.js'
import learnResolver from './sources/learn.js'
import memberResolver from './sources/member.js'
import practiceResolver from './sources/practice.js'
import puzzleResolver from './sources/puzzle.js'
import tvResolver from './sources/tv.js'
import variantsResolver from './sources/variants.js'
import videoResolver from './sources/video.js'
import { ActivityAssets, presence } from './util/index.js'

const resolvers: Resolver[] = [
  tvResolver,
  analysisResolver,
  insightsResolver,
  gameResolver,
  classroomResolver,
  memberResolver,
  friendsResolver,
  learnResolver,
  practiceResolver,
  variantsResolver,
  videoResolver,
  computerResolver,
  puzzleResolver,
]

presence.on('UpdateData', async () => {
  const pathname = document.location.pathname
  const doc = document

  const strings: AppStrings = await presence.getStrings({
    play: 'chesscom.common.play',
    pause: 'chesscom.common.pause',
    browsing: 'chesscom.browsing',
    menu: 'chesscom.common.menu',
    common_menu: 'chesscom.common.menu',
    overview: 'chesscom.common.overview',
    library: 'chesscom.common.library',
    vs_separator: 'chesscom.common.vs_separator',
    min: 'chesscom.common.min',
    survival: 'chesscom.common.survival',
    home: 'chesscom.home',

    // Computer
    computer_vs: 'chesscom.computer.vs',
    computer_selecting: 'chesscom.computer.selecting',
    computer_ai: 'chesscom.computer.ai',
    computer_name: 'chesscom.computer.name',
    playing_as_white: 'chesscom.computer.white',
    playing_as_black: 'chesscom.computer.black',

    // Puzzles
    puzzle_solving: 'chesscom.puzzle.solving',
    puzzle_rush: 'chesscom.puzzle.rush',
    puzzle_battle: 'chesscom.puzzle.battle',
    puzzle_tactics: 'chesscom.puzzle.tactics',
    score: 'chesscom.puzzle.score',
    level: 'chesscom.puzzle.level',
    rating: 'chesscom.puzzle.rating',

    // Play
    play_online: 'chesscom.play.online',
    play_daily: 'chesscom.play.daily',
    play_match: 'chesscom.play.match',
    play_live: 'chesscom.play.live',
    play_lobby: 'chesscom.play.lobby',
    game_online: 'chesscom.game.online',
    searching: 'chesscom.game.searching',
    game_finished: 'chesscom.game.finished',
    game_over: 'chesscom.game.over',
    game_reviewing: 'chesscom.game.reviewing',
    watching_replay: 'chesscom.game.replay',
    spectating: 'chesscom.game.spectating',
    waiting: 'chesscom.game.waiting',
    match_in_progress: 'chesscom.game.progress',
    archive: 'chesscom.game.archive',
    game_review: 'chesscom.game.review',

    // Media
    media_analysis: 'chesscom.media.analysis',
    media_learning: 'chesscom.media.learning',
    media_lessons: 'chesscom.media.lessons',
    media_tv: 'chesscom.media.tv',
    media_video: 'chesscom.media.video',
    media_finished: 'chesscom.media.finished',
    tv_checking: 'chesscom.tv.checking',
    video_browsing: 'chesscom.video.browsing',
    video_watching: 'chesscom.video.watching',
    video_library: 'chesscom.video.library',

    // Social
    friends_list: 'chesscom.friends.list',
    friends_single: 'chesscom.friends.single',
    friends_plural: 'chesscom.friends.plural',
    profile_viewing: 'chesscom.profile.viewing',
    viewing_profile: 'chesscom.profile.viewing',
    profile_general_alt: 'chesscom.profile.general_alt',
    profile: 'chesscom.profile.general',

    // UI
    button_view_game: 'chesscom.button.view_game',
    button_watch_video: 'chesscom.button.watch_video',
    variants_menu: 'chesscom.variants.menu',

    // Classroom
    classroom_title: 'chesscom.classroom.title',
    classroom_session: 'chesscom.classroom.session',

    // Practice
    practice_title: 'chesscom.practice.title',

    // Learn
    learn_openings: 'chesscom.learn.openings',
    learn_all_lessons: 'chesscom.learn.all_lessons',

    // Insights
    insights_title: 'chesscom.insights.title',
    insights_stats: 'chesscom.insights.stats',
  })

  const isPrivacyMode = await presence.getSetting('privacyMode')
  const hideButtons = await presence.getSetting('hideButtons')
  const displayFormat = await presence.getSetting('displayFormat')
  const hideRating = await presence.getSetting('hideRating')

  const presenceData: any = {
    largeImageKey: ActivityAssets.Logo,
    details: strings.browsing,
    type: ActivityType.Playing,
  }

  const activeResolver = resolvers.find(r => r.isActive(pathname))

  if (activeResolver) {
    if (activeResolver.getDetails) {
      const details = activeResolver.getDetails(strings, doc)
      if (details)
        presenceData.details = details
    }

    if (activeResolver.getState) {
      const state = activeResolver.getState(strings, doc, displayFormat as number, hideRating as boolean)
      if (state)
        presenceData.state = state
    }

    if (activeResolver.getType) {
      const type = activeResolver.getType(strings, doc)
      if (type !== undefined)
        presenceData.type = type
    }

    if (activeResolver.getLargeImageKey) {
      const largeImage = activeResolver.getLargeImageKey(strings, doc)
      if (largeImage)
        presenceData.largeImageKey = largeImage
    }

    if (activeResolver.getSmallImageKey) {
      presenceData.smallImageKey = activeResolver.getSmallImageKey(strings, doc)
    }

    if (activeResolver.getSmallImageText) {
      presenceData.smallImageText = activeResolver.getSmallImageText(strings, doc)
    }

    if (!isPrivacyMode && !hideButtons && activeResolver.getButtons) {
      const buttons = activeResolver.getButtons(strings, doc)
      if (buttons)
        presenceData.buttons = buttons
    }

    if (isPrivacyMode) {
      delete presenceData.state

      if (activeResolver === computerResolver
        || activeResolver === gameResolver
        || activeResolver === variantsResolver) {
        presenceData.details = strings.play
      }
      else if (activeResolver === analysisResolver) {
        presenceData.details = strings.media_analysis
      }
      else if (activeResolver === puzzleResolver) {
        presenceData.details = strings.puzzle_solving
      }
    }

    if (activeResolver.getTimestamps) {
      const times = activeResolver.getTimestamps(strings, doc)
      if (times) {
        presenceData.startTimestamp = times.start
        presenceData.endTimestamp = times.end
      }
      else if (
        activeResolver === videoResolver
        && activeResolver.getType
        && activeResolver.getType(strings, doc) === ActivityType.Watching
      ) {
        delete presenceData.startTimestamp
        if (!presenceData.smallImageText) {
          presenceData.smallImageText = strings.pause
        }
      }
    }
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
