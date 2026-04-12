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
    play: 'chess.com.play',
    pause: 'chess.com.pause',
    browsing: 'chess.com.browsing',
    menu: 'chess.com.menu',
    common_menu: 'chess.com.menu',
    overview: 'chess.com.overview',
    library: 'chess.com.library',
    vs_separator: 'chess.com.vs_separator',
    min: 'chess.com.min',
    survival: 'chess.com.survival',
    home: 'chess.com.home',

    // Computer
    computer_vs: 'chess.com.computerVs',
    computer_selecting: 'chess.com.computerSelecting',
    computer_ai: 'chess.com.computerAi',
    computer_name: 'chess.com.computerName',
    playing_as_white: 'chess.com.computerWhite',
    playing_as_black: 'chess.com.computerBlack',

    // Puzzles
    puzzle_solving: 'chess.com.puzzleSolving',
    puzzle_rush: 'chess.com.puzzleRush',
    puzzle_battle: 'chess.com.puzzleBattle',
    puzzle_tactics: 'chess.com.puzzleTactics',
    score: 'chess.com.puzzleScore',
    level: 'chess.com.puzzleLevel',
    rating: 'chess.com.puzzleRating',

    // Play
    play_online: 'chess.com.playOnline',
    play_daily: 'chess.com.playDaily',
    play_match: 'chess.com.playMatch',
    play_live: 'chess.com.playLive',
    play_lobby: 'chess.com.playLobby',
    game_online: 'chess.com.gameOnline',
    searching: 'chess.com.gameSearching',
    game_finished: 'chess.com.gameFinished',
    game_over: 'chess.com.gameOver',
    game_reviewing: 'chess.com.gameReviewing',
    watching_replay: 'chess.com.gameReplay',
    spectating: 'chess.com.gameSpectating',
    waiting: 'chess.com.gameWaiting',
    match_in_progress: 'chess.com.gameProgress',
    archive: 'chess.com.gameArchive',
    game_review: 'chess.com.gameReview',

    // Media
    media_analysis: 'chess.com.mediaAnalysis',
    media_learning: 'chess.com.mediaLearning',
    media_lessons: 'chess.com.mediaLessons',
    media_tv: 'chess.com.mediaTv',
    media_video: 'chess.com.mediaVideo',
    media_finished: 'chess.com.mediaFinished',
    tv_checking: 'chess.com.tvChecking',
    video_browsing: 'chess.com.videoBrowsing',
    video_watching: 'chess.com.videoWatching',
    video_library: 'chess.com.videoLibrary',

    // Social
    friends_list: 'chess.com.friendsList',
    friends_single: 'chess.com.friendsSingle',
    friends_plural: 'chess.com.friendsPlural',
    profile_viewing: 'chess.com.profileViewing',
    viewing_profile: 'chess.com.profileViewing',
    profile_general_alt: 'chess.com.profileGeneralAlt',
    profile: 'chess.com.profileGeneral',

    // UI
    button_view_game: 'chess.com.buttonViewGame',
    button_watch_video: 'chess.com.buttonWatchVideo',
    variants_menu: 'chess.com.variantsMenu',

    // Classroom
    classroom_title: 'chess.com.classroomTitle',
    classroom_session: 'chess.com.classroomSession',

    // Practice
    practice_title: 'chess.com.practiceTitle',

    // Learn
    learn_openings: 'chess.com.learnOpenings',
    learn_all_lessons: 'chess.com.learnAllLessons',

    // Insights
    insights_title: 'chess.com.insightsTitle',
    insights_stats: 'chess.com.insightsStats',
  })

  const [isPrivacyMode, hideButtons, displayFormat, hideRating, lang] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('hideButtons'),
    presence.getSetting<number>('displayFormat'),
    presence.getSetting<boolean>('hideRating'),
    presence.getSetting<string>('lang'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: strings.browsing,
    type: ActivityType.Playing,
  }

  const activeResolver = resolvers.find(r => r.isActive(pathname))

  if (activeResolver) {
    if (activeResolver.getDetails) {
      const details = activeResolver.getDetails(strings, doc, lang)
      if (details)
        presenceData.details = details
    }

    if (activeResolver.getState) {
      const state = activeResolver.getState(strings, doc, displayFormat, hideRating)
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
    presence.clearActivity()
  }
})
