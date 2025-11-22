import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1429935781719572490',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/w0UZLGG.png',
  Timer = 'https://i.imgur.com/Ag11522.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const [privacy, buttons, cover] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
  ])
  const { pathname, href } = document.location

  switch (true) {
    case /^\/(?:[a-z]{2})?$/.test(pathname):
      presenceData.details = 'Viewing home page'
      break
    case /^\/search$/.test(pathname):
      presenceData.details = 'Searching quizzes'
      presenceData.state = privacy ? '' : document.querySelector('#term-display > span:nth-child(2)')?.textContent
      presenceData.smallImageKey = Assets.Search
      break
    case /^\/(?:user-)?quizzes.*$/.test(pathname):
      if (/\/(?:friend-)?stats\/?$/.test(pathname)) {
        presenceData.details = `Viewing: ${document.querySelector('.quiz-stats-content h1')?.textContent || document.title}`
      }
      else if (
        /^\/(?:user-)?quizzes\/(?:\d+\/)?[^/]+\/?$/.test(pathname)
        && !/^\/(?:user-)?quizzes\/\d+\/?$/.test(pathname)
      ) {
        const timer = document.querySelector('.timer-cell > .timer')
        presenceData.details = privacy ? 'Take a quiz' : 'Take the quiz:'
        presenceData.state = privacy ? '' : document.querySelector('.quiz-container > .quiz-top > .thumb-right > h1') || document.title
        if (!privacy && cover)
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.quiz-container > .quiz-top > .thumb > img')?.src || ActivityAssets.Logo
        if (timer && window.getComputedStyle(timer).display === 'block') {
          presenceData.smallImageKey = ActivityAssets.Timer
          presenceData.smallImageText = timer?.textContent
        }
        if (!privacy && buttons) {
          presenceData.buttons = [
            {
              label: 'View Quiz',
              url: href,
            },
          ]
        }
      }
      else if (/\/\d+\/?$/.test(pathname)) {
        presenceData.details = `Viewing page: ${document.querySelector('.user-quiz-index-content h1')?.textContent || document.title}`
      }
      else {
        presenceData.details = `Viewing page: ${document.querySelector('.user-quiz-directory-content h1')?.textContent || document.title}`
      }
      break
    case /^\/users.*$/.test(pathname):
      if (/^\/users\/[^/]+\/playlists\/[^/]+$/.test(pathname)) {
        presenceData.details = 'Viewing playlist:'
        presenceData.state = document.querySelector('.playlist-content h1')?.textContent || document.title
      }
      else if (/^\/users\/[^/]+\/playlists\/?$/.test(pathname)) {
        presenceData.details = `Viewing ${document.querySelector('.playlist-user-content h1')?.textContent || document.title}`
      }
      else if (/^\/users\/[^/]+\/charts\/[^/]+$/.test(pathname)) {
        presenceData.details = 'Viewing chart:'
        presenceData.state = document.querySelector('.chart-page-content h1')?.textContent || document.title
      }
      else if (/^\/users\/[^/]+\/charts\/?$/.test(pathname)) {
        presenceData.details = `Viewing ${document.querySelector('.chart-user-content h1')?.textContent || document.title}`
      }
      else if (/^\/users\/[^/]+\/blog\/[^/]+$/.test(pathname)) {
        presenceData.details = 'Viewing blog:'
        presenceData.state = document.querySelector('.blog-page-content h1')?.textContent || document.title
        presenceData.largeImageKey = (!privacy && cover) ? document.querySelector<HTMLImageElement>('.blog-page-content .blog img')?.src || ActivityAssets.Logo : ActivityAssets.Logo
      }
      else if (/^\/users\/[^/]+\/blog\/?$/.test(pathname)) {
        presenceData.details = `Viewing ${document.querySelector('.blog-user-content h1')?.textContent || document.title}`
      }
      else {
        presenceData.details = `Viewing page: ${document.querySelector('.user-profile-content h1')?.textContent || document.title}`
      }
      break
    case /^\/series.*$/.test(pathname):
      if (/^\/series\/(?:\d+\/)?[^/]+\/?$/.test(pathname) && !/^\/series\/\d+\/?$/.test(pathname)) {
        presenceData.details = 'Viewing serie:'
        presenceData.state = document.querySelector('.series-content h1')?.textContent || document.title
      }
      else if (/^\/series\/\d+\/?$/.test(pathname)) {
        presenceData.details = 'Viewing:'
        presenceData.state = document.querySelector('.series-content h1')?.textContent || document.title
      }
      else {
        presenceData.details = `Viewing page: ${document.title}`
      }
      break
    case /^\/blog-series.*$/.test(pathname):
      if (/^\/blog-series\/[^/]+\/[^/]+$/.test(pathname)) {
        presenceData.details = 'Viewing blog series:'
        presenceData.state = document.querySelector('.blog-series-content h1')?.textContent || document.title
      }
      else if (/^\/blog-series\/[^/]+$/.test(pathname)) {
        presenceData.details = `Viewing ${document.querySelector('.blog-series-index-content h1')?.textContent || document.title}`
      }
      else {
        presenceData.details = `Viewing page: ${document.title}`
      }
      break
    case /^\/word-search.*$/.test(pathname):
      if (/^\/word-search(?:\/mega)?(?:\/\d+)?$/.test(pathname)) {
        presenceData.details = `Solving puzzle in ${document.querySelector('.word-search-index-content h1')?.textContent || document.title}`
      }
      else if (/^\/word-search\/puzzle\/(?:mega-)?\d+\/stats$/.test(pathname)) {
        presenceData.details = `Viewing ${document.querySelector('.word-search-puzzle-stats-content h1')?.textContent || document.title}`
      }
      else if (/^\/word-search\/puzzle\/(?:mega-)?\d+$/.test(pathname)) {
        presenceData.details = `Solving puzzle: ${document.querySelector('.word-search-content h1')?.textContent || document.title}`
        presenceData.state = document.querySelector('.word-search-content h2')?.textContent
        if (!privacy && buttons) {
          presenceData.buttons = [
            {
              label: 'View Puzzle',
              url: href,
            },
          ]
        }
      }
      else {
        presenceData.details = `Viewing page: ${document.title}`
      }
      break
    case /^\/minigames.*$/.test(pathname):
      if (/^\/minigames\/[^/]+\/?$/.test(pathname)) {
        presenceData.details = 'Playing minigame:'
        presenceData.state = document.querySelector('h1')?.textContent || document.title
        if (!privacy && buttons) {
          presenceData.buttons = [
            {
              label: 'Play Minigame',
              url: href,
            },
          ]
        }
      }
      else {
        presenceData.details = `Viewing page: ${document.title}`
      }
      break
    default:
      presenceData.details = 'Viewing page:'
      presenceData.state = document.title
      break
  }

  presence.setActivity(presenceData)
})
