import { Assets } from 'premid'

enum PresenceClients {
  Reddit = '609183409440555018',
  RedditNetflix = '869992823854870588',
}
let presence = new Presence({ clientId: PresenceClients.Reddit })
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Reddit/assets/logo.png',
  NetflixLogo = 'https://cdn.rcd.gg/PreMiD/websites/R/Reddit/assets/0.gif',
}

async function getStrings() {
  return presence.getStrings(
    {
      browsing: 'general.browsing',
      live: 'general.live',
      profile: 'general.viewProfile',
      searchSomething: 'general.searchSomething',
      searching: 'general.search',
      reading: 'general.readingPost',
      watching: 'general.watching',
      readButton: 'general.buttonReadArticle',
      viewProfileButton: 'general.buttonViewProfile',
      streamButton: 'general.buttonWatchStream',
      insubreddit: 'In a subreddit',
    },

  )
}

const presences: { [key in PresenceClients]?: Presence } = {
  [PresenceClients.Reddit]: presence,
}
const startTimestamp = Math.floor(Date.now() / 1000)
const oldReddit = !!(
  document.querySelector('.default-header')
  ?? document.querySelector('#header')
)

function setClient(clientId: PresenceClients) {
  presence.clearActivity()
  if (presences[clientId]) {
    presence = presences[clientId]
    presence.setActivity()
  }
  else {
    presence = new Presence({ clientId })
    presences[clientId] = presence
  }
  presence.info('Switched presence client!')
}

let containsNetflix: boolean = false
presence.on('UpdateData', async () => {
  const [newLang, buttons, privacy] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('privacy'),
  ])
  const { href, pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: !pathname.includes('/r/netflix')
      ? ActivityAssets.Logo
      : ActivityAssets.NetflixLogo,
    ...(pathname.includes('/r/netflix') && { smallImageKey: ActivityAssets.Logo }),
    startTimestamp,
  }

  if (pathname.includes('/r/netflix') && !containsNetflix) {
    setClient(PresenceClients.RedditNetflix)

    containsNetflix = true
    presenceData.largeImageKey = ActivityAssets.NetflixLogo
    presenceData.smallImageKey = ActivityAssets.Logo
  }
  else if (!pathname.includes('/r/netflix') && containsNetflix) {
    setClient(PresenceClients.Reddit)
    containsNetflix = false
    presenceData.largeImageKey = ActivityAssets.Logo
  }

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (oldReddit) {
    const subReddit = document.querySelector('.redditname')
      ? `${
        !privacy
          ? `r/${document.querySelector('.redditname')?.textContent}`
          : strings.insubreddit
      }`
      : 'Home'
    if (pathname.includes('/comments/')) {
      if (!privacy) {
        const postTitle = document.querySelector('p.title > a')?.textContent
        presenceData.details = `${strings.reading} '${postTitle}'`
        presenceData.state = subReddit
        presenceData.buttons = [
          {
            url: href,
            label: strings.readButton,
          },
        ]
      }
      else {
        presenceData.details = strings.reading.slice(0, -1)
        presenceData.state = subReddit
      }
    }
    else if (pathname.startsWith('/user/')) {
      if (!privacy) {
        presenceData.state = document.querySelector('.titlebox > h1')?.textContent
        presenceData.details = strings.profile
        presenceData.buttons = [
          {
            url: href,
            label: strings.viewProfileButton,
          },
        ]
      }
      else {
        presenceData.details = strings.profile.slice(0, -4)
      }
    }
    else if (pathname.startsWith('/search')) {
      presenceData.details = strings.searchSomething
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.searching
    }
    else {
      presenceData.details = strings.browsing
      presenceData.state = subReddit
    }
  }
  else if (pathname.includes('/comments/')) {
    if (!privacy) {
      const postTitle = document.querySelector('shreddit-title')?.getAttribute('title') ?? ''
      const subReddit = getSubreddit()
      presenceData.details = `${strings.reading} '${postTitle}'`
      presenceData.state = subReddit
      presenceData.buttons = [
        {
          url: href,
          label: strings.readButton,
        },
      ]
    }
    else {
      presenceData.details = strings.reading.slice(0, -1)
    }
  }
  else if (pathname.startsWith('/user/')) {
    if (!privacy) {
      const username = document.querySelector('p')?.textContent
      const nickname = document.querySelector('h1')?.textContent
      presenceData.details = strings.profile
      presenceData.state = nickname ?? username
      presenceData.buttons = [
        {
          url: href,
          label: strings.viewProfileButton,
        },
      ]
    }
    else {
      presenceData.details = strings.profile.slice(0, -4)
    }
  }
  else if (pathname.startsWith('/search')) {
    presenceData.details = strings.searchSomething
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.searching
  }
  else if (pathname.startsWith('/rpan')) {
    presenceData.details = `${strings.watching} (RPAN)`
    if (!privacy) {
      const rpanTitle = document.querySelector('h1')
        ? document.querySelector('h1')?.textContent
        : 'Loading title...'
      presenceData.state = rpanTitle
      presenceData.buttons = [
        {
          url: href,
          label: strings.streamButton,
        },
      ]
    }
    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = strings.live
  }
  else if (!privacy) {
    presenceData.details = strings.browsing
    presenceData.state = getSubreddit() ?? 'Home'
  }
  else if (getSubreddit()) {
    presenceData.details = strings.insubreddit
  }
  else {
    presenceData.details = strings.browsing
    presenceData.state = 'Home'
  }

  if (!buttons || privacy)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})

function getSubreddit(): string | null | undefined {
  return document
    .querySelector('shreddit-subreddit-header')
    ?.getAttribute('prefixed-name')
}
