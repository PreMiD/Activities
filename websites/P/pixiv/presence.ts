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
  'bookmarknewillust.php': { details: 'Viewing bookmarks' },
  'newillust.php': { details: 'Viewing latest artworks' },
  'mypixivall.php': { details: 'Browsing my pixiv' },
  'request': { details: 'Viewing pixiv Requests' },
  'collection': { details: 'Viewing collections' },
  'group': { details: 'Browsing group' },
  'idea': { details: 'Browsing idea' },
  'howto': { details: 'Browsing how-to' },
  'eventadd': { details: 'Ready to create an event' },
  'profileevent': { details: 'Manage event...' },
  'premium': { details: 'Viewing Premier Registered info' },
  'info.php': { details: 'Reading information' },
  'messages.php': { details: 'Browsing private message' },
  'ugoiraupload.php': { details: 'Submiting new Ugoira(Animations)' },
  'userevent.php': { details: 'Viewing Users\' projects' },
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
  'discovery': { details: 'Viewing recommended novels' },
}

enum ActivityAssets {
  Logo = 'https://i.imgur.com/05FmTQ1.jpeg',
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath: string

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, hostname } = document.location
  const arrPath = pathname.replace('/en/', '').replace('_', '').split('/').filter(Boolean)
  const [buttons, privacyMode] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('privacyMode'),

  ])
  if (lastPath !== pathname) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    presenceData.startTimestamp = browsingTimestamp
    lastPath = pathname
  }

  switch (arrPath[0]) {
    case 'users':
      if (privacyMode) {
        presenceData.details = 'Viewing a user'
        break
      }
      presenceData.details = 'Viewing user:'
      presenceData.state = document.querySelector('h1')?.textContent
        ?? document.querySelector('div:nth-child(2) > div > a:nth-child(3)')
          ?.textContent
      presenceData.buttons = [{ label: 'View User', url: href }]
      break
    case 'tags':
      if (privacyMode || arrPath.length === 1) {
        presenceData.details = 'Viewing tags'
        break
      }
      if (arrPath[1]) {
        presenceData.details = 'Viewing tags:'
        presenceData.state = decodeURIComponent(arrPath[1])
        presenceData.buttons = [{ label: 'View Tag', url: href }]
      }
      break
    case 'search':
      presenceData.smallImageKey = Assets.Search
      if (privacyMode) {
        presenceData.details = 'Searching...'
        break
      }
      presenceData.details = 'Searching for user:'
      presenceData.state = typeURL.searchParams.get('nick')
      break
    case 'dashboard':
      if (arrPath[1] === 'works') {
        presenceData.details = `Managing ${
          arrPath[2] === 'series' ? 'Series' : 'Artworks'
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
      if (arrPath[1] !== 'my') {
        presenceData.details = 'Browsing Feed'
        if (!privacyMode) {
          presenceData.state = document.querySelector<HTMLElement>(
            '#stacc_center_title',
          )?.textContent
        }
      }
      break
    case 'eventdetail.php':
      if (privacyMode) {
        presenceData.details = 'Viewing an event'
        break
      }
      presenceData.details = 'Viewing event:'
      presenceData.state = document.querySelector('h1')?.textContent
      break
    case 'ranking.php':
      presenceData.details = 'Viewing ranking:'
      presenceData.state = document.querySelector('.current')?.textContent
      break
    case 'discovery':
      presenceData.details = `Viewing Recommanded ${
        arrPath[1] === 'users' ? 'Users' : 'Works'
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
      if (privacyMode) {
        presenceData.details = 'Viewing an artwork'
        break
      }
      presenceData.details = 'Viewing artwork:'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.state = `${document.querySelector('h1')?.textContent} (by: ${
        document.querySelector('section h2')?.textContent
      })`
      presenceData.buttons = [
        {
          label: 'View Artwork',
          url: href,
        },
      ]
      break
    case 'novel': {
      if (arrPath[1] === 'ranking.php') {
        presenceData.details = 'Viewing ranking:'
        presenceData.state = document.querySelector('.current')?.textContent
        break
      }
      if (pathname.endsWith('/upload.php')) {
        presenceData.details = 'Submitting new novel'
        break
      }
      else if (pathname.endsWith('/new.php')) {
        presenceData.details = 'Viewing latest novels'
        break
      }
      presenceData.details = 'Browsing for novels...'
      const title = document.querySelector('h1')
      if (Object.keys(staticPages).includes(arrPath[1]!)) {
        presenceData = { ...presenceData, ...staticPages[arrPath[1]!] }
      }
      else if (title) {
        presenceData.smallImageKey = Assets.Reading
        presenceData.details = 'Reading novel'
        if (!privacyMode) {
          presenceData.details += ':'
          presenceData.state = `${title.textContent} (${
            document.querySelector('h2')?.textContent
          })`
          presenceData.buttons = [{ label: 'Read Novel', url: href }]
        }
      }
      break
    }
    case 'illustration': {
      if (pathname.endsWith('/create')) {
        presenceData.details = 'Submitting new illustration'
      }
      else {
        presenceData.details = 'Browsing illustrations'
      }
      break
    }
    case 'manga': {
      if (pathname.endsWith('/create')) {
        presenceData.details = 'Submitting new manga'
      }
      else {
        presenceData.details = 'Browsing manga'
      }
      break
    }
    default:
      if (Object.keys(staticPages).includes(arrPath[0]!))
        presenceData = { ...presenceData, ...staticPages[arrPath[0]!] }
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
    presenceData.smallImageKey = Assets.Live
    if (!privacyMode) {
      presenceData.state = `by user: ${
        document.querySelector<HTMLElement>('div.name')?.textContent
      }`
      presenceData.buttons = [{ label: 'Watch Live', url: href }]
    }
  }
  else if (pathname.includes('/@')) {
    presenceData.details = 'Sketch- Viewing user'
    if (!privacyMode) {
      presenceData.details += ':'
      presenceData.state = document.querySelector('div.name')?.textContent
      presenceData.buttons = [{ label: 'View User', url: href }]
    }
  }

  if (!buttons || privacyMode)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
