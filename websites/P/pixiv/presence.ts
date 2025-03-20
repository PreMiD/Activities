import { Assets } from 'premid'

const presence = new Presence({
  clientId: '640234287525920834',
})
const typeURL = new URL(document.location.href)
const typeResult = typeURL.searchParams.get('type')
const staticPages: Record<string, PresenceData> = {
  '': { details: 'Viewing homepage' },
  'fanbox': { details: 'Viewing fanbox' },
  'event': { details: 'Browsing events...' },
  'history.php': { details: 'Browsing history' },
  'bookmark': { details: 'Viewing bookmarks' },
  'mypixivall.php': { details: 'Browsing my pixiv' },
  'group': { details: 'Browsing group' },
  'idea': { details: 'Browsing idea' },
  'howto': { details: 'Browsing how-to' },
  'eventadd': { details: 'Ready to create an event' },
  'profileevent': { details: 'Manage event...' },
  'premium': { details: 'Viewing Premier Registered info' },
  'messages.php': { details: 'Browsing private message' },
  'ugoiraupload.php': { details: 'Submiting new Ugoira(Animations)' },
  'manage': { details: 'Managing artworks' },
  'settinguser.php': { details: 'User settings', state: 'Basic settings' },
  'settingsnspost': {
    details: 'User settings',
    state: 'Post on social media',
  },
  'settingprofile.php': {
    details: 'Profile settings',
    state: 'Profile information',
  },
  'settingprofileimg.php': {
    details: 'Profile settings',
    state: 'Profile images',
  },
  'settingworkspace.php': {
    details: 'Profile settings',
    state: 'Workspace',
  },
  'settinginfophp': { details: 'Notification settings' },
  'lives': { details: 'Sketch- Browsing livestreams' },
  'popular': { details: 'Sketch- Viewing popular posts' },
  'followings': { details: 'Sketch- Viewing following posts' },
  'tagshistory': { details: 'Sketch- Viewing tags:', state: 'Featured tags' },
  'upload.php': { details: 'Submitting new novel' },
  'discovery': { details: 'Viewing recommended novels' },
  'ranking.php': { details: 'Viewing novels ranking' },
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/pixiv/assets/logo.png',
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath: string

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, hostname } = document.location
  const arrPath = pathname.replace('/en/', '/').replace('_', '').split('/')
  const [buttons] = await Promise.all([presence.getSetting<boolean>('buttons')])
  if (lastPath !== pathname) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    presenceData.startTimestamp = browsingTimestamp
    lastPath = pathname
  }

  switch (arrPath[1]) {
    case 'users':
      presenceData.details = 'Viewing user:'
      presenceData.state = document.querySelector('h1')?.textContent
        ?? document.querySelector('div:nth-child(2) > div > a:nth-child(3)')
          ?.textContent
      presenceData.buttons = [{ label: 'View User', url: href }]
      break
    case 'tags':
      presenceData.details = 'Sketch- Viewing tags:'
      presenceData.state = 'Featured tags'
      if (hostname === 'www.pixiv.net') {
        presenceData.details = 'Viewing tags:'
        presenceData.state = document.querySelector('div > span')?.textContent
        presenceData.buttons = [{ label: 'View Tag', url: href }]
      }
      else if (arrPath.length > 2) {
        presenceData.state = document.querySelector('.title')?.textContent
        presenceData.buttons = [{ label: 'View Tag', url: href }]
      }
      break
    case 'searchuser.php':
      presenceData.details = 'Searching for user:'
      presenceData.state = typeURL.searchParams.get('nick')
      presenceData.smallImageKey = Assets.Search
      break
    case 'dashboard':
      if (arrPath[2] === 'works') {
        presenceData.details = `Managing ${
          arrPath[3] === 'series' ? 'Series' : 'Artworks'
        }`
      }
      else if (pathname.includes('/report/artworks')) {
        presenceData.details = 'Viewing access analytics'
      }
      else if (pathname.includes('report/ranking')) {
        presenceData.details = 'Viewing ranking report'
      }
      else {
        presenceData.details = 'Viewing dashboard'
      }
      break
    case 'stacc':
      presenceData.details = 'Auto Feed activity'
      if (arrPath[2] !== 'my') {
        presenceData.details = 'Browsing Feed'
        presenceData.state = document.querySelector<HTMLElement>(
          '#stacc_center_title',
        )?.textContent
      }
      break
    case 'eventdetail':
      presenceData.details = 'Viewing event:'
      presenceData.state = document.querySelector('h1')?.textContent
      break
    case 'ranking.php':
      presenceData.details = 'Viewing ranking:'
      presenceData.state = document.querySelector('.current')?.textContent
      break
    case 'discovery':
      presenceData.details = `Viewing Recommanded ${
        arrPath[2] === 'users' ? 'Users' : 'Works'
      }`
      break
    case 'sociallogin':
    case 'linkedservices':
      presenceData.details = 'User settings'
      presenceData.state = 'Link other accounts to pixiv'
      break
    case 'settingmute.php':
      presenceData.details = `Mute setting | ${
        typeResult === 'user' ? 'User' : 'Tags'
      }`
      break
    case 'upload.php':
      presenceData.details = `Submiting New ${
        typeResult === 'manga' ? 'Manga' : 'Illustrations'
      }`
      break
    case 'artworks':
      presenceData.details = 'Viewing artwork:'
      presenceData.smallImageKey = Assets.Search
      presenceData.state = `${document.querySelector('h1')?.textContent} (${
        document.querySelector('div:nth-child(2) > a > div')?.textContent
      })`
      presenceData.buttons = [
        {
          label: 'View Artwork',
          url: href,
        },
      ]
      break
    case 'novel': {
      presenceData.details = 'Browsing for novels...'
      const title = document.querySelector('h1')
      if (Object.keys(staticPages).includes(arrPath[2]!)) {
        presenceData = { ...presenceData, ...staticPages[arrPath[2]!] }
      }
      else if (title) {
        presenceData.details = 'Viewing novel:'
        presenceData.state = `${title.textContent} (${
          document.querySelector('h2')?.textContent
        })`
        presenceData.buttons = [{ label: 'Read Novel', url: href }]
      }
      break
    }
    default:
      if (Object.keys(staticPages).includes(arrPath[1]!))
        presenceData = { ...presenceData, ...staticPages[arrPath[1]!] }
  }

  if (hostname === 'sketch.pixiv.net')
    presenceData.smallImageKey = Assets.Writing
  if (
    (pathname === '/' || pathname.includes('/public'))
    && hostname === 'sketch.pixiv.net'
  ) {
    presenceData.details = 'Viewing sketch page'
  }
  else if (pathname.includes('/lives/')) {
    presenceData.details = 'Sketch- Viewing livestream'
    presenceData.state = `by user: ${
      document.querySelector<HTMLElement>('div.name')?.textContent
    }`
    presenceData.buttons = [{ label: 'Watch Live', url: href }]
    presenceData.smallImageKey = Assets.Live
  }
  else if (pathname.includes('/@')) {
    presenceData.details = 'Sketch- Viewing user:'
    presenceData.state = document.querySelector('div.name')?.textContent
    presenceData.buttons = [{ label: 'View User', url: href }]
  }

  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
