import { Assets } from 'premid'

const presence = new Presence({
  clientId: '829466407321731082',
})
const timestamp = Math.floor(Date.now() / 1000)

let articleTitle: string,
  authorName: string,
  authorUrl: string,
  feedTop: string,
  feedTag: string,
  feedListings: string,
  listingTitle: string,
  podcastTitle: string,
  searchTerm: string,
  searchLength: number,
  contentStateKey: string,
  contentStateText: string

// checkmate javascript
function pathIncludes(string: string): boolean {
  return document.location.pathname.toLowerCase().includes(string)
}

function isShop(): boolean {
  if (document.location.host.includes('shop'))
    return true
  return false
}

function isProfile(): boolean {
  if (document.querySelectorAll('.profile-header__meta').length === 1) {
    authorUrl = document.location.href.toString()
    authorName = document.querySelector(
      '#page-content-inner > div.brand-bg > div > header > div.profile-header__details > h1',
    )?.textContent ?? ''

    return true
  }
  return false
}
function isArticle(): boolean {
  if (
    document.querySelectorAll('.article-wrapper').length === 1
    && document.querySelectorAll('.crayons-article__video').length === 0
  ) {
    articleTitle = document.querySelector(
      '#main-title > div.crayons-article__header__meta > h1',
    )?.textContent ?? ''
    authorName = document.querySelector(
      '#main-title > div.crayons-article__header__meta > div.crayons-article__subheader > a',
    )?.textContent ?? ''
    authorUrl = document
      .querySelector(
        '#main-title > div.crayons-article__header__meta > div.crayons-article__subheader > a',
      )
      ?.getAttribute('href') ?? ''

    return true
  }
  return false
}

function isVideo(): boolean {
  if (
    document.querySelectorAll('.article-wrapper').length === 1
    && document.querySelectorAll('.crayons-article__video').length === 1
  ) {
    articleTitle = document.querySelector(
      '#main-title > div.crayons-article__header__meta > h1',
    )?.textContent ?? ''
    authorName = document.querySelector(
      '#main-title > div.crayons-article__header__meta > div.crayons-article__subheader > a',
    )?.textContent ?? ''
    authorUrl = document
      .querySelector(
        '#main-title > div.crayons-article__header__meta > div.crayons-article__subheader > a',
      )
      ?.getAttribute('href') ?? ''

    return true
  }
  return false
}

function isPodcast(): boolean {
  if (document.querySelectorAll('.podcast-episode-container').length === 1) {
    podcastTitle = document.querySelector('h1')?.textContent ?? ''
    authorName = document.querySelector('div.title > h2 > a')?.textContent ?? ''
    authorUrl = (<HTMLAnchorElement>(
      document.querySelector('div.title > h2 > a')
    )
    )?.href ?? ''
    return true
  }
  return false
}

const assets: Record<string, string> = {
  play: Assets.Play,
  pause: Assets.Pause,
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DEV%20Community/assets/logo.png',
    startTimestamp: timestamp,
  }
  const buttons = await presence.getSetting<boolean>('buttons')

  switch (true) {
    case isShop():
      presenceData.details = 'Browsing Shop'
      break
    case isProfile():
      presenceData.details = authorName
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/DEV%20Community/assets/0.png'
      presenceData.smallImageText = 'Profile'
      if (buttons) {
        presenceData.buttons = [
          {
            label: 'View Profile',
            url: document.location.origin + authorUrl,
          },
        ]
      }
      break
    case isArticle():
      presenceData.details = articleTitle
      presenceData.state = authorName
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      if (buttons) {
        presenceData.buttons = [
          {
            label: 'View Article',
            url: document.location.href,
          },
          {
            label: 'View Author',
            url: document.location.origin + authorUrl,
          },
        ]
      }
      break
    case isVideo():
      presenceData.details = articleTitle
      presenceData.state = authorName
      if (buttons) {
        presenceData.buttons = [
          {
            label: 'View Video',
            url: document.location.href,
          },
          {
            label: 'View Author',
            url: document.location.origin + authorUrl,
          },
        ]
      }
      contentStateKey = (<HTMLVideoElement>document.querySelector('video'))
        ?.paused
        ? 'pause'
        : 'play'
      contentStateText = contentStateKey === 'pause' ? 'Paused' : 'Playing'

      presenceData.smallImageKey = assets[contentStateKey]
      presenceData.smallImageText = contentStateText

      if (contentStateKey === 'play') {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(document.querySelector('video')!)
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
      break
    case isPodcast():
      presenceData.details = podcastTitle
      presenceData.state = authorName

      if (buttons) {
        presenceData.buttons = [
          {
            label: 'View Podcast',
            url: document.location.href,
          },
          {
            label: 'View Author',
            url: document.location.origin + authorUrl,
          },
        ]
      }
      contentStateKey = (<HTMLAudioElement>document.querySelector('#audio'))
        .paused
        ? 'pause'
        : 'play'
      contentStateText = contentStateKey === 'pause' ? 'Paused' : 'Listening'

      presenceData.smallImageKey = assets[contentStateKey]
      presenceData.smallImageText = contentStateText

      if (contentStateKey === 'play') {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(document.querySelector('video')!)
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
      break
    case pathIncludes('/top/'):
      feedTop = document.querySelector(
        '#main-content > header > nav > a.crayons-tabs__item.crayons-tabs__item--current',
      )?.textContent ?? ''
      presenceData.details = `${feedTop} Feed`
      break
    case pathIncludes('/t/'):
      feedTag = document.querySelector('h1')?.textContent ?? ''
      presenceData.details = `${feedTag} Articles`
      break
    case pathIncludes('/tags'):
      presenceData.details = 'Tags'
      break
    case pathIncludes('/listings'):
      feedListings = document.querySelector(
        '.crayons-link--current',
      )?.textContent ?? ''
      listingTitle = document.querySelector(
        '.crayons-modal__box__body > div > div >div > div > header > h2 > a',
      )?.textContent ?? ''
      presenceData.details = listingTitle || feedListings
      presenceData.state = listingTitle ? feedListings : null
      break
    case pathIncludes('/pod'):
      presenceData.details = 'Podcasts'
      break
    case pathIncludes('/videos'):
      presenceData.details = 'Videos'
      break
    case pathIncludes('/new'):
      presenceData.details = 'Writing a Post'
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Writing'
      break
    case pathIncludes('/readinglist'):
      presenceData.details = 'Viewing Read List'
      break
    case pathIncludes('/series'):
      authorName = document.querySelector('h1')?.textContent ?? ''
      presenceData.details = authorName
      if (buttons) {
        presenceData.buttons = [
          {
            label: 'View Series',
            url: document.location.href,
          },
        ]
      }
      break
    case pathIncludes('/search'):
      searchTerm = document.querySelector<HTMLInputElement>('.crayons-textfield')?.value ?? ''
      searchLength = document.querySelector('#substories')?.children.length ?? 0
      presenceData.details = `Search: ${searchTerm}`
      presenceData.state = `${searchLength} Results`
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching...'
      break
    case pathIncludes('/settings'):
      presenceData.details = 'Updating settings'
      break
    case pathIncludes('/notifications'):
      presenceData.details = 'Notifications'
      break
    case pathIncludes('/connect'):
      presenceData.details = 'Messages'
      break
    case pathIncludes('/dashboard'):
      presenceData.details = 'Dashboard Analytics'
      break
    case pathIncludes('/code-of-conduct'):
      presenceData.details = 'Code of Conduct'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      break
    case pathIncludes('/faq'):
      presenceData.details = 'FAQ 🤔'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      break
    case pathIncludes('/sponsors'):
      presenceData.details = 'Sponsors'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      break
    case pathIncludes('/about'):
      presenceData.details = 'About'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      break
    case pathIncludes('/privacy'):
      presenceData.details = 'Privacy'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      break
    case pathIncludes('/terms'):
      presenceData.details = 'Terms and Conditions'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      break
    case pathIncludes('/contact'):
      presenceData.details = 'Contact'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      break
    case pathIncludes('/onboarding'):
      presenceData.details = 'Setting up Profile'
      break
    default:
      presenceData.details = 'General Feed'
  }
  presence.setActivity(presenceData)
})
