const presence = new Presence({
  clientId: '612793327510749210',
})

async function getStrings() {
  return presence.getStrings({
    buttonJoinGame: 'kahoot.buttonJoinGame',
    joiningGame: 'kahoot.joiningGame',
    waiting: 'kahoot.waiting',
    gameStarting: 'kahoot.gameStarting',
    playing: 'kahoot.playing',
    questionLoading: 'kahoot.questionLoading',
    incorrectAnswer: 'kahoot.incorrectAnswer',
    correctAnswer: 'kahoot.correctAnswer',
    resultsQuestion: 'kahoot.resultsQuestion',
    slideViewing: 'kahoot.slideViewing',
    gameOver: 'kahoot.gameOver',
    gameCreate: 'kahoot.gameCreate',
    loadingPage: 'kahoot.loadingPage',
    firstPlace: 'kahoot.firstPlace',
    points: 'kahoot.points',
    questionsCorrect: 'kahoot.questionsCorrect',
    slideShowing: 'kahoot.slideShowing',
    questionShowing: 'kahoot.questionShowing',
    stString: 'kahoot.stString',
    ndString: 'kahoot.ndString',
    rdString: 'kahoot.rdString',
    topX: 'kahoot.topX',
    onPodium: 'kahoot.onPodium',
    of: 'kahoot.of',
    questionNumber: 'kahoot.questionNumber',
    feedback: 'kahoot.feedback',
    waitingAnswer: 'kahoot.waitingAnswer',
    drumRoll: 'kahoot.drumRoll',
    position: 'kahoot.position',
    teamTalk: 'kahoot.teamTalk',
    gameSummary: 'kahoot.gameSummary',
    login: 'kahoot.login',
    createHome: 'kahoot.createHome',
    discover: 'kahoot.discover',
    searchKahoots: 'kahoot.searchKahoots',
    kahootDetails: 'kahoot.kahootDetails',
    kahootProfile: 'kahoot.kahootProfile',
    myKahoots: 'kahoot.myKahoots',
    userReports: 'kahoot.userReports',
    myCourses: 'kahoot.myCourses',
    editingCourse: 'kahoot.editingCourse',
    viewingCourse: 'kahoot.viewingCourse',
    editingKahoot: 'kahoot.editingKahoot',
    previewingKahoot: 'kahoot.previewingKahoot',
    liveCourse: 'kahoot.liveCourse',
    liveCourseActivity: 'kahoot.liveCourseActivity',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
let browsingTimestamp = Math.floor(Date.now() / 1000)
// 0 - ready to be updated if needed
// 1 - updated, ready to be reset to 0
let timestampUpdateState = 0
let iframeKahootName: string

function findRanking(rankingSelector: Element) {
  return (
    rankingSelector.textContent === strings.stString
    || rankingSelector.textContent === strings.ndString
    || rankingSelector.textContent === strings.rdString
    || rankingSelector.textContent?.replace(/\d+/, '{0}') === strings.topX
  )
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Kahoot/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const [buttons, newLang] = await Promise.all([
    await presence.getSetting<boolean>('buttons'),
    await presence.getSetting<string>('lang').catch(() => 'en'),
  ])

  oldLang ??= newLang
  strings ??= await getStrings()
  if (oldLang !== newLang) {
    oldLang = newLang
    strings = await getStrings()
  }

  const { host, pathname } = document.location
  switch (host) {
    case 'kahoot.it': {
      if (
        pathname === '/'
        || pathname.includes('/join')
        || pathname === '/v2/'
      ) {
        // Home/Join screen
        presenceData.details = strings.joiningGame
      }
      else if (pathname.includes('/instructions')) {
        // Waiting for game to start
        presenceData.details = strings.waiting
        // Set start timestamp after joining game
        if (timestampUpdateState === 0) {
          browsingTimestamp = Math.floor(Date.now() / 1000)
          timestampUpdateState = 1
        }
      }
      else if (pathname.includes('/start')) {
        // Game is starting
        presenceData.details = strings.gameStarting
        // Allow timestamp to be reset upon a potential replay
        if (timestampUpdateState === 1)
          timestampUpdateState = 0
      }
      else if (pathname.includes('/gameblock')) {
        // Playing/Answering a question
        const [currentQuestion, totalQuestions] = document
          .querySelector(
            '[data-functional-selector="question-index-counter"]',
          )
          ?.textContent
          ?.match(/\d+/g) ?? []
        presenceData.details = strings.playing
        presenceData.state = `${strings.questionNumber.replace(
          '{0}',
          strings.of
            .replace('{0}', currentQuestion ?? '')
            .replace('{1}', totalQuestions ?? ''),
        )} | ${strings.points.replace(
          '{0}',
          document.querySelector(
            '[data-functional-selector="bottom-bar-score"]',
          )?.textContent ?? '',
        )}`
      }
      else if (pathname.includes('/getready')) {
        // Next question is loading
        const [currentQuestion, totalQuestions] = document
          .querySelector(
            '[data-functional-selector="question-index-counter"]',
          )
          ?.textContent
          ?.match(/\d+/g) ?? []
        presenceData.details = strings.questionLoading
        presenceData.state = `${strings.questionNumber.replace(
          '{0}',
          strings.of
            .replace('{0}', currentQuestion ?? '')
            .replace('{1}', totalQuestions ?? ''),
        )}`
      }
      else if (pathname.includes('/teamtalk')) {
        // Team discussion time
        presenceData.details = strings.teamTalk
      }
      else if (
        pathname.includes('/answer')
        && !pathname.includes('/result')
      ) {
        // Waiting for question to end
        presenceData.details = strings.waitingAnswer
      }
      else if (pathname.includes('/result')) {
        // Answer result screen
        const rankingSelector = document.querySelector(
          '[data-functional-selector="player-rank"]',
        )
        if (!rankingSelector) {
          presenceData.details = strings.resultsQuestion
        }
        else {
          presenceData.details = strings.resultsQuestion
          presenceData.state = `${
            document.querySelector(
              '[data-functional-selector="correct-answer"]',
            )
              ? strings.correctAnswer
              : strings.incorrectAnswer
          } | ${
            /\d+/.test(rankingSelector?.textContent ?? '')
              ? strings.position.replace(
                  '{0}',
                  rankingSelector?.textContent?.match(/\d+/)?.[0] ?? '',
                )
              : strings.onPodium
          } | ${strings.points.replace(
            '{0}',
            document.querySelector(
              '[data-functional-selector="bottom-bar-score"]',
            )?.textContent ?? '',
          )}`
        }
      }
      else if (pathname.includes('/contentblock')) {
        // Viewing a slide with content
        presenceData.details = strings.slideViewing
      }
      else if (pathname.includes('/ranking')) {
        // Viewing the final ranking
        const rankingSelector = document.querySelector(
          '[data-functional-selector="ranking-header"],[data-functional-selector="ranking-header-winners"]',
        )
        if (!rankingSelector) {
          presenceData.details = strings.drumRoll
        }
        else {
          const score = document.querySelector(
            '[data-functional-selector="bottom-bar-score"]',
          )?.textContent
          presenceData.details = findRanking(rankingSelector)
            ? `${strings.gameOver} | ${
              rankingSelector.textContent
            } | ${strings.points.replace('{0}', score ?? '')}`
            : `${strings.gameOver} | ${strings.points.replace('{0}', score ?? '')}`
        }
      }
      else if (pathname.includes('/feedback')) {
        // Providing feedback
        presenceData.details = strings.feedback
      }
      else {
        presenceData.details = strings.loadingPage
      }

      presence.setActivity(presenceData)
      break
    }
    case 'play.kahoot.it': {
      switch (pathname) {
        case '/v2/': {
          // Settings/game creation
          presenceData.details = strings.gameCreate
          break
        }
        case '/v2/lobby': {
          // Lobby screen
          presenceData.details = strings.waiting
          // Set start timestamp after game has been created
          if (timestampUpdateState === 0) {
            browsingTimestamp = Math.floor(Date.now() / 1000)

            presenceData.startTimestamp = browsingTimestamp
            timestampUpdateState = 1
          }

          if (buttons) {
            const pin = document.querySelector(
              '[data-functional-selector="game-pin"]',
            )?.textContent
            if (pin) {
              presenceData.buttons = [
                {
                  label: `${strings.buttonJoinGame.replace('{0}', pin)}`,
                  url: `https://kahoot.it/?pin=${pin}`,
                },
              ]
            }
          }
          break
        }
        case '/v2/start': {
          // Game start
          presenceData.details = strings.gameStarting
          // Allow timestamp to be reset upon a potential replay
          if (timestampUpdateState === 1)
            timestampUpdateState = 0
          break
        }
        case '/v2/gameover': {
          presenceData.details = `${strings.firstPlace.replace(
            '{0}',
            document.querySelector('[data-functional-selector="winner"]')
              ?.textContent ?? '',
          )} | ${strings.points.replace(
            '{0}',
            document.querySelector(
              '[data-functional-selector="place-1"] > [data-functional-selector="total-score"]',
            )?.textContent ?? '',
          )}`
          const correctCount = document.querySelector(
            '[data-functional-selector="correct-count-gold"]',
          )
          if (correctCount) {
            const [correct, total] = correctCount.textContent?.match(/\d+/g) ?? []
            presenceData.state = strings.questionsCorrect.replace(
              '{0}',
              strings.of
                .replace('{0}', correct ?? '')
                .replace('{1}', total ?? ''),
            )
          }
          else {
            presenceData.state = strings.questionsCorrect.replace('{0}', '0')
          }
          break
        }
        case '/v2/gameblock': {
          if (
            document.querySelector(
              '[data-functional-selector="content-block-page"]',
            )
          ) {
            // Showing a Slide with Content
            presenceData.details = strings.slideShowing
          }
          else {
            // Question in progress
            const questionCounter = document.querySelector(
              '[data-functional-selector="bottom-bar-question-counter"]',
            )
            if (!questionCounter) {
              // Question is starting
              presenceData.details = strings.questionLoading
            }
            else {
              // Question is in progress
              const [currentQuestion, totalQuestions] = questionCounter.textContent?.split('/') ?? []
              presenceData.details = strings.questionShowing
              presenceData.state = `${strings.questionNumber.replace(
                '{0}',
                `${strings.of
                  .replace('{0}', currentQuestion ?? '')
                  .replace('{1}', totalQuestions ?? '')}`,
              )}`
            }
          }
          break
        }
        case '/v2/game-summary': {
          // Game summary
          presenceData.details = strings.gameSummary
          break
        }
        default:
          presenceData.details = strings.loadingPage
      }

      presence.setActivity(presenceData)
      break
    }
    case 'create.kahoot.it': {
      switch (pathname) {
        case '/': {
          // Kahoot! Create home page
          presenceData.details = strings.createHome
          presenceData.state = 'create.kahoot.it'
          break
        }
        case '/after/login':
        case '/auth/login': {
          // Login
          presenceData.details = strings.login
          break
        }
        case '/discover': {
          // Discover
          presenceData.details = strings.discover
          break
        }
        case '/search': {
          // Search
          presenceData.details = strings.searchKahoots
          presenceData.state = document.querySelector<HTMLInputElement>(
            '[data-functional-selector="search-box__input-field"]',
          )?.value
          break
        }
        default:
          if (pathname.startsWith('/details/')) {
            // Kahoot details
            presenceData.details = strings.kahootDetails
            presenceData.state = document.querySelector(
              '[data-functional-selector="kahoot-detail__title"]',
            )?.textContent
          }
          else if (pathname.startsWith('/profiles/')) {
            // Kahoot profile
            presenceData.details = strings.kahootProfile
            presenceData.state = (
              document.querySelector(
                '[data-functional-selector="verified-user-profile-information"] > div > div',
              )
              ?? document.querySelector(
                '[data-functional-selector="default-user-profile"] > div > div > div:nth-of-type(2) > div',
              )
            )?.firstChild?.textContent?.replace(/\n/g, ' ')
          }
          else if (pathname.startsWith('/my-library/kahoots/')) {
            // My Kahoots
            presenceData.details = strings.myKahoots
          }
          else if (pathname === '/user-reports') {
            // Game Reports
            presenceData.details = strings.userReports
          }
          else if (pathname === '/my-library/courses') {
            // My Courses
            presenceData.details = strings.myCourses
          }
          else if (pathname.startsWith('/course/')) {
            if (pathname.endsWith('/edit')) {
              // Editing a course
              presenceData.details = strings.editingCourse
              presenceData.state = document.querySelector<HTMLInputElement>(
                '[data-functional-selector="course-title-input__course_title_input"]',
              )?.value
            }
            else {
              // Viewing a course
              presenceData.details = strings.viewingCourse
              presenceData.state = document.querySelector(
                '[data-functional-selector="course-details"] h2',
              )?.textContent
            }
          }
          else if (pathname.startsWith('/creator/')) {
            // Editing a Kahoot!
            presenceData.details = strings.editingKahoot
            presenceData.state = document.querySelector(
              '[data-functional-selector="top-bar__kahoot-summary-button"] > span',
            )?.textContent
          }
          else if (pathname.startsWith('/preview/')) {
            // Previewing a Kahoot!
            presenceData.details = strings.previewingKahoot
            presenceData.state = iframeKahootName
          }
          else if (pathname.startsWith('/v2/live-course/')) {
            // Live course
            presenceData.details = strings.liveCourse
            const preview = document.querySelector(
              '[data-functional-selector="mega-menu__session-title"]',
            )
            if (preview) {
              presenceData.state = preview.textContent
            }
            else {
              const course = document.querySelector(
                '[data-functional-selector="live-course-menu__toggle-mega-menu"] > span:nth-of-type(2)',
              )
              const [number] = course?.textContent?.match(/^\d+/) ?? []
              presenceData.state = strings.liveCourseActivity
                .replace('{0}', number ?? '')
                .replace(
                  '{1}',
                  course?.textContent?.substring((number?.length ?? 0) + 2)
                  ?? '',
                )
            }
          }
          else {
            presenceData.details = strings.loadingPage
          }
      }

      presence.setActivity(presenceData)
      break
    }
  }
})

presence.on('iFrameData', (data: unknown) => {
  iframeKahootName = data as string
})
