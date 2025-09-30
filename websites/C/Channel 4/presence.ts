import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1413510232507813918',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Channel%204/assets/logo.png',
  newsLogo = 'https://cdn.rcd.gg/PreMiD/websites/C/Channel%204/assets/0.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
const urlpath = document.location.pathname.split('/')
const page = urlpath[1] ?? ''
const secondPage = urlpath[2] ?? ''

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const setting = {
    privacy: await presence.getSetting<boolean>('privacy'),
  }
  const video = document.querySelector<HTMLVideoElement>('video')

  const liveChannels: Record<string, string> = {
    'c4': 'Channel 4',
    'C4': 'Channel 4',
    'e4': 'E4',
    'E4': 'E4',
    'm4': 'More4',
    'M4': 'More4',
    'f4': 'Film4',
    'F4': 'Film4',
    '4s': '4Seven',
    '4S': '4Seven',
  }

  const sitePages: Record<string, { details: string, state: string, key: string, button: string }> = { // list of all page RPCs that don't require extra code
    'tv-guide': { details: 'TV Guide', state: 'Looking at TV schedule', key: Assets.Reading, button: 'y' },
    'categories': { details: 'Browsing', state: 'Looking at all TV shows', key: Assets.Search, button: 'n' },
    'my4': { details: 'My4', state: 'Looking at saved shows', key: Assets.Downloading, button: 'n' },
    'settings': { details: 'Settings', state: 'Managing account', key: Assets.Downloading, button: 'n' },
    'plus': { details: 'Channel 4+', state: 'Managing subscription', key: Assets.Downloading, button: 'n' },
    '4viewers': { details: 'FAQ', state: 'Reading about Channel 4', key: Assets.Reading, button: 'y' },
    'channel': { details: 'Channels', state: 'Looking at programming', key: Assets.Search, button: 'n' },
    'collection': { details: 'Collections', state: 'Looking at programming', key: Assets.Search, button: 'n' },
    'press': { details: 'Press', state: 'Viewing the press site', key: Assets.Search, button: 'y' },
    'corporate': { details: 'Corporate', state: 'Reading Channel 4 Corporate', key: Assets.Reading, button: 'y' },
  }

  if (setting.privacy) {
    presenceData.details = 'Browsing Channel 4'
    presenceData.smallImageText = 'Privacy mode enabled'
    presenceData.smallImageKey = Assets.Question
  }
  else if (!page) {
    presenceData.details = 'Homepage'
    presenceData.state = 'Browsing Channel 4'
  }
  else if (sitePages[page]) {
    presenceData.details = sitePages[page].details
    presenceData.state = sitePages[page].state
    presenceData.smallImageKey = sitePages[page].key
    if (!setting.privacy && sitePages[page].button === 'y') {
      presenceData.buttons = [
        {
          label: `View ${sitePages[page].details}`,
          url: document.location.href,
        },
      ]
    }
  }
  else if (video?.duration) {
    const title = document.querySelector<HTMLMetaElement>('[class="all4-brandhubs-details__title--text"]')
    const episodeSummary = document.querySelector<HTMLMetaElement>('[class="all4-body-tight-text-label all4-typography-body-tight secondary"]')
    const episodeNumber = document.querySelector<HTMLMetaElement>('[class="all4-brandhubs-details__episode-number"]')?.textContent ?? ''
    const numberText = episodeNumber.match(/Series\s*(\d+)\s*Episode\s*(\d+)/i)

    presenceData.details = title?.textContent
    presenceData.state = episodeSummary?.textContent
    presenceData.name = `${title?.textContent ?? 'Channel 4'}`
    presenceData.buttons = [
      {
        label: 'Watch Now',
        url: document.location.href,
      },
    ]

    if (numberText) {
      const season = numberText[1]
      const episode = numberText[2]
      presenceData.largeImageText = `Season ${season}, Episode ${episode}`
    }
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play;
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)

    if (urlpath[1] === 'now') {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
      const liveTitle = document.querySelector('h2.watchLive__title')?.textContent?.replace(/^Watch Live:\s*/i, '')
      const episodeSummary = document.querySelector<HTMLMetaElement>('[class="watchLive__summary"]')
      presenceData.smallImageKey = Assets.Live
      presenceData.details = liveTitle ?? 'Live TV'
      presenceData.name = liveTitle ?? 'Channel 4'
      presenceData.state = episodeSummary?.textContent ?? `${liveChannels[secondPage]}`
      if (liveChannels[secondPage]) {
        presenceData.smallImageText = `Watching live on ${liveChannels[secondPage]}`
      }
      presenceData.buttons = [
        {
          label: 'Watch Live',
          url: document.location.href,
        },
      ]
    }
  }
  else if (page === 'programmes') {
    const assetTitle = document.querySelector<HTMLMetaElement>('[class="breadcrumb-navigation__text shadow"]')?.textContent
    presenceData.details = 'Viewing'
    presenceData.state = assetTitle ?? 'Looking at a show'
  }
  else if (page === 'news') {
    const newsCategories: Record<string, string> = {
      uk: 'UK',
      world: 'World News',
      politics: 'Politics',
      business: 'Business',
      science: 'Science',
      tech: 'Tech',
      culture: 'Culture',
      factcheck: 'Fact Check',
      team: 'News Team',
    }
    presenceData.largeImageKey = ActivityAssets.newsLogo
    presenceData.name = 'Channel 4 News'
    if (!secondPage) {
      presenceData.details = 'Homepage'
      presenceData.state = 'Browsing articles'
    }
    else if (newsCategories[secondPage]) {
      presenceData.state = newsCategories[secondPage]
      presenceData.details = 'Looking at'
    }
    else {
      const articleTitle = document.querySelector<HTMLDivElement>('div.article-header > h1')?.textContent
      const videoArticle = document.querySelector<HTMLDivElement>('div.video-detail > h1')?.textContent
      presenceData.details = 'Reading article'
      presenceData.state = articleTitle ?? videoArticle ?? ''
      presenceData.smallImageKey = Assets.Reading
      presenceData.buttons = [
        {
          label: 'View Article',
          url: document.location.href,
        },
      ]
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
