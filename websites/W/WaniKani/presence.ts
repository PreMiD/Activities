const presence: Presence = new Presence({
  clientId: '800166344023867443',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/logo.png',
  Avatar = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/0.png',
  Kanji = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/1.png',
  Radical = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/2.png',
  Vocabulary = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/3.png',
  Lessons0 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/4.png',
  Lessons1 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/5.png',
  Lessons25 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/6.png',
  Lessons50 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/7.png',
  Lessons100 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/8.png',
  Lessons250 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/9.png',
  Lessons500 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/10.png',
  Reviews0 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/11.png',
  Reviews1 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/12.png',
  Reviews50 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/13.png',
  Reviews100 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/14.png',
  Reviews250 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/15.png',
  Reviews500 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/16.png',
  Reviews1000 = 'https://cdn.rcd.gg/PreMiD/websites/W/WaniKani/assets/17.png',
}

function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function getTypeAsset(string: string) {
  switch (string.toLowerCase()) {
    case 'kanji':
      return ActivityAssets.Kanji
    case 'radical':
      return ActivityAssets.Radical
    case 'vocabulary':
      return ActivityAssets.Vocabulary
    default:
      return null
  }
}

function getReviewPresence(): PresenceData {
  const data: PresenceData = {}
  const characterType = [
    ...document.querySelector<HTMLDivElement>(
      '[data-quiz-header-base-class="character-header"]',
    )?.classList ?? [],
  ]
    .find(cls => cls?.startsWith('character-header--'))
    ?.split('--')[1]
  const completeCount = document.querySelector<HTMLDivElement>(
    '[data-quiz-statistics-target="completeCount"]',
  )

  data.state = `${
    document.querySelector<HTMLDivElement>(
      '[data-quiz-header-target="characters"]',
    )?.textContent
  } | ${capitalize(characterType ?? '')} ${capitalize(
    document.querySelector<HTMLDivElement>(
      '[data-quiz-input-target="questionTypeContainer"]',
    )?.dataset?.questionType ?? '',
  )}`
  if (completeCount) {
    data.smallImageText = `${completeCount.textContent} complete, ${
      document.querySelector<HTMLDivElement>(
        '[data-quiz-statistics-target="remainingCount"]',
      )?.textContent
    } remaining. (${
      document.querySelector<HTMLDivElement>(
        '[data-quiz-statistics-target="percentCorrect"]',
      )?.textContent
    }%)`
  }
  data.smallImageKey = getTypeAsset(characterType ?? '')
  return data
}

function getLessonPresence(): PresenceData {
  const presenceData: PresenceData = {}
  const totalStats = document.querySelectorAll<HTMLDivElement>(
    '[data-controller="subject-count-statistics"] [data-subject-count-statistics-target="count"]',
  )
  presenceData.state = `${
    document.querySelector<HTMLDivElement>(
      '[data-quiz-header-target="characters"]',
    )?.textContent
  } - ${
    document.querySelector<HTMLDivElement>(
      '[data-quiz-header-target="meaning"]',
    )?.textContent
  }`
  presenceData.smallImageKey = getTypeAsset(
    [
      ...document.querySelector<HTMLDivElement>(
        '[data-quiz-header-base-class="character-header"]',
      )?.classList ?? [],
    ]
      .find(cls => cls?.startsWith('character-header--'))
      ?.split('--')[1] ?? '',
  )
  if (totalStats.length === 3)
    presenceData.smallImageText = `${totalStats[0]?.textContent} radicals | ${totalStats[1]?.textContent} kanji | ${totalStats[2]?.textContent} vocab`
  return presenceData
}

presence.on('UpdateData', () => {
  const { hostname, pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  switch (hostname) {
    case 'wanikani.com':
    case 'www.wanikani.com': {
      switch (pathname) {
        case '/':
        case '/dashboard':
        case '/login': {
          const buttons = document.querySelector(
            '.dashboard__lessons-and-reviews',
          )?.children ?? []
          if (buttons.length === 2) {
            let lessonsText = document.querySelector<HTMLSpanElement>('.todays-lessons__count-text')!.textContent!
            let lessons;
            if (lessonsText.includes('Done'))
              lessons = 0
            else  
              lessons = +lessonsText
            const reviews = +document.querySelector<HTMLSpanElement>('.reviews-dashboard__count-text')!.textContent!
            presenceData.details = 'Viewing Dashboard'
            presenceData.state = `${lessons} lessons | ${reviews} reviews`
            presenceData.smallImageText = document.querySelector<HTMLAnchorElement>(
              '.user-summary__attribute > a',
            )?.textContent
            if (lessons > reviews) {
              if (lessons < 25)
                presenceData.smallImageKey = ActivityAssets.Lessons1
              else if (lessons < 50)
                presenceData.smallImageKey = ActivityAssets.Lessons25
              else if (lessons < 100)
                presenceData.smallImageKey = ActivityAssets.Lessons50
              else if (lessons < 250)
                presenceData.smallImageKey = ActivityAssets.Lessons100
              else if (lessons < 500)
                presenceData.smallImageKey = ActivityAssets.Lessons250
              else presenceData.smallImageKey = ActivityAssets.Lessons500
            }
            else if (reviews < 1) {
              presenceData.smallImageKey = ActivityAssets.Reviews0
            }
            else if (reviews < 50) {
              presenceData.smallImageKey = ActivityAssets.Reviews1
            }
            else if (reviews < 100) {
              presenceData.smallImageKey = ActivityAssets.Reviews50
            }
            else if (reviews < 250) {
              presenceData.smallImageKey = ActivityAssets.Reviews100
            }
            else if (reviews < 500) {
              presenceData.smallImageKey = ActivityAssets.Reviews250
            }
            else if (reviews < 1000) {
              presenceData.smallImageKey = ActivityAssets.Reviews500
            }
            else {
              presenceData.smallImageKey = ActivityAssets.Reviews1000
            }
          }
          else {
            presenceData.details = 'Browsing'
            presenceData.state = 'Viewing Home Page'
          }
          break
        }
        case '/subject-lessons/picker': {
          presenceData.details = 'Choosing Lessons'
          break
        }
        case '/subjects/extra_study': {
          presenceData.details = `Doing ${
            document.querySelector<HTMLDivElement>(
              '.character-header__menu-title',
            )?.textContent
          }`
          Object.assign(presenceData, getReviewPresence())
          break
        }
        case pathname.match(/^\/recent-mistakes\/.*?\/quiz$/)?.input: {
          presenceData.details = 'Doing Extra Study: Recent Mistakes'
          Object.assign(presenceData, getReviewPresence())
          break
        }
        case pathname.match(/^\/recent-mistakes\/.*?\/subjects\/\d+\/lesson$/)
          ?.input: {
          presenceData.details = 'Doing Extra Study: Recent Mistakes Lessons'
          Object.assign(presenceData, getLessonPresence())
          break
        }
        case '/subjects/review': {
          presenceData.details = 'Doing Reviews'
          Object.assign(presenceData, getReviewPresence())
          break
        }
        case pathname.match(/^\/subject-lessons\/[-\d/]+\/quiz$/)?.input: {
          presenceData.details = 'Practicing Lessons'
          Object.assign(presenceData, getReviewPresence())
          break
        }
        case pathname.match(/^\/subject-lessons\/[-\d/]+/)?.input: {
          presenceData.details = 'Learning Lessons'
          Object.assign(presenceData, getLessonPresence())
          break
        }
        case pathname.match(/^\/(radicals|kanji|vocabulary)\/.+$/)?.input: {
          const [, type] = pathname.split('/')
          let textDescription = document.querySelector<HTMLElement>(
            '.mnemonic-content',
          )?.textContent
          if (textDescription && textDescription.length >= 50)
            textDescription = `${textDescription.substring(0, 50)}...`

          presenceData.details = `Browsing ${capitalize(type!)}`
          presenceData.state = `${
            document.querySelector<HTMLSpanElement>(
              `.${type!.replace(/s$/, '')}-icon`,
            )?.textContent
          } | ${
            document.querySelector<HTMLSpanElement>(
              `.${type!.replace(/s$/, '')}-icon`,
            )?.parentNode?.childNodes[4]?.textContent
          }`
          presenceData.smallImageText = textDescription
          presenceData.smallImageKey = getTypeAsset(type!.replace(/s$/, ''))
          break
        }
        case pathname.match(/^\/users\/.+$/)?.input: {
          presenceData.details = 'Viewing User Profile'
          presenceData.state = document.querySelector<HTMLSpanElement>('.username')?.textContent
          presenceData.smallImageKey = ActivityAssets.Avatar
          break
        }
        default: {
          presenceData.details = 'Browsing'
          presenceData.state = `Viewing ${document.title
            .split(' / ')
            .slice(1)
            .join(' / ')}`
        }
      }
      break
    }
    case 'knowledge.wanikani.com': {
      presenceData.details = 'Browsing WaniKani Knowledge'
      presenceData.state = document.title.split(' | ')[0]
      break
    }
    case 'community.wanikani.com': {
      if (/^\/u\/.+$/.test(pathname)) {
        presenceData.details = 'Viewing User Profile'
        presenceData.smallImageKey = ActivityAssets.Avatar
        presenceData.state = document.querySelector<HTMLHeadingElement>('.username')?.textContent
        break
      }
      presenceData.details = 'Browsing WaniKani Community'
      presenceData.state = document.title.split(' - ')[0]
      break
    }
  }

  presence.setActivity(presenceData)
})
