import { Assets } from 'premid'

const presence = new Presence({
  clientId: '736516965748834336',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const start = Date.now()

let videoTitle: string,
  videoCurrentTime: number,
  videoDuration: number,
  videoPaused: boolean

interface DataInterface {
  title: string
  currentTime: number
  duration: number
  paused: boolean
}

const assets: Record<string, string> = {
  git: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/0.png',
  html: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/1.png',
  css: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/2.png',
  the_command_line: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/3.png',
  node_with_sqlite: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/4.png',
  ruby_on_rails: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/5.png',
  python_2: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/6.png',
  javascript: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/7.png',
  go: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/8.png',
  authentication_with_ruby_on_rails: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/9.png',
  java: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/10.png',
  python_3: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/11.png',
  swift: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/12.png',
  r: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/13.png',
  kotlin: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/14.png',
  ruby: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/15.png',
  sql: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/16.png',
  php: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/17.png',
  csharp: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/18.png',
  cplusplus: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/19.png',
}

presence.on('iFrameData', (inc: unknown) => {
  const data = inc as DataInterface
  videoTitle = data.title
  videoCurrentTime = data.currentTime
  videoDuration = data.duration
  videoPaused = data.paused
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Codecademy/assets/logo.png',
  }
  const pathArray: string[] = window.location.pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
  let heading: Element | string = document.querySelector('[class^=headerTitle__]')
    || document.querySelector('[class^=trackTitle__]')!
  let premiumPath: boolean

  switch (pathArray[0]) {
    case 'learn':
      switch (pathArray.length) {
        case 1:
          presenceData.details = 'At the dashboard'
          break
        case 2:
          presenceData.details = 'Looking at a course'
          presenceData.state = `"${
            document.querySelector('main h1')?.textContent
          }"`
          presenceData.smallImageKey = assets[
            document
              .querySelector('main h1')
              ?.textContent
              ?.split(' ')
              ?.slice(1)
              ?.join(' ')
              ?.toLowerCase()
              ?.replace(' ', '_')
              ?.replace('+', 'plus')
              ?.replace('#', 'sharp') ?? ''
          ]
          presenceData.smallImageText = document
            .querySelector('main h1')
            ?.textContent
            ?.split(' ')
            ?.slice(1)
            ?.join(' ')
          break
        case 3:
          presenceData.details = 'Looking at a path'
          presenceData.state = `"${
            document.querySelector('[class^=goalHeader__]')
              ? document
                  .querySelector('main h1')
                  ?.textContent
                  ?.slice(
                    document.querySelector('[class^=goalHeader__]')?.textContent?.length,
                  )
              : document.querySelector('main h1')?.textContent
          }"`
          break
        case 4:
          presenceData.details = 'Looking at a course module'
          presenceData.state = `"${
            document.querySelector('main h1')?.textContent
          }"`
      }
      break
    case 'courses':
    case 'paths':
      premiumPath = false
      if (heading.className.startsWith('trackTitle__'))
        premiumPath = true
      heading = heading.textContent!
      if (pathArray[0] === 'courses' && heading.startsWith('Learn ')) {
        presenceData.smallImageKey = assets[
          heading
            .split(' ')
            .slice(1)
            .join(' ')
            .toLowerCase()
            .replace(' ', '_')
            .replace('+', 'plus')
            .replace('#', 'sharp')
        ]
        presenceData.smallImageText = heading.split(' ').slice(1).join(' ')
      }
      presenceData.details = heading.startsWith('Learn ')
        ? `Learning ${heading.split(' ').slice(1).join(' ')}`
        : premiumPath
          ? 'Looking at a path'
          : heading
      if (videoTitle) {
        presenceData.details = 'Watching a video'
        presenceData.state = videoTitle
        presenceData.smallImageKey = videoPaused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = videoPaused
          ? (await strings).pause
          : (await strings).play
        if (videoDuration && !videoPaused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(videoDuration, videoCurrentTime)
        }
      }
      else {
        presenceData.startTimestamp = start
        const bodyHeading = document.querySelector(
          '[class^=contentItemTitle__]',
        )
        const articleTitle = document.querySelector('[class^=articleTitle_]')
        if (bodyHeading)
          presenceData.state = bodyHeading.textContent
        if (articleTitle) {
          presenceData.details = 'Reading an article'
          presenceData.state = articleTitle.textContent
        }
        if (premiumPath) {
          presenceData.state = heading
          delete presenceData.startTimestamp
        }
      }
      presenceData.state = `"${presenceData.state}"`
      break
    case 'login':
      presenceData.details = 'Logging in'
      break
    case 'register':
      presenceData.details = 'Registering'
      break
    case 'catalog':
      if (pathArray[1] === 'language') {
        presenceData.details = `Looking at ${
          document.querySelector('#catalog-heading')?.textContent
        }`
        presenceData.state = 'in the catalog'
        presenceData.smallImageKey = assets[
          document
            .querySelector('#catalog-heading')!.textContent!.toLowerCase()
            .replace(' ', '_')
            .replace('+', 'plus')
            .replace('#', 'sharp')
        ]
        presenceData.smallImageText = document.querySelector('#catalog-heading')?.textContent
      }
      else if (pathArray[1] === 'subject') {
        presenceData.details = 'Looking at a subject'
        presenceData.state = `"${
          document.querySelector('#catalog-heading')?.textContent
        }"`
      }
      else {
        presenceData.details = 'Browsing the catalog'
        presenceData.state = 'of available languages'
      }
      break
    case 'subscriptions':
      presenceData.details = 'Considering the PRO'
      presenceData.state = 'subscription'
      break
    case 'explore':
      presenceData.details = 'Exploring...'
      break
    case '':
      if (window.location.hostname === 'news.codecademy.com')
        presenceData.details = 'Browsing articles'
      else presenceData.details = 'At the homepage'

      break
    case 'pricing':
      presenceData.details = 'Checking out the'
      presenceData.state = 'paid plans'
      break
    case 'business':
      presenceData.details = 'Checking out the'
      presenceData.state = 'bussiness plans'
      break
    case 'articles':
      if (pathArray[1]) {
        presenceData.details = 'Reading an article'
        presenceData.state = `"${
          document.querySelector('[class^=articleHeader__]')?.textContent
        }"`
      }
      else {
        presenceData.details = 'Browsing articles'
      }

      break
    default:
      if (window.location.hostname === 'news.codecademy.com') {
        presenceData.details = 'Reading an article'
        presenceData.state = `"${
          document.querySelector('.post-full-title')?.textContent
        }"`
      }
      else {
        presenceData.details = 'Idle'
      }
      break
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
