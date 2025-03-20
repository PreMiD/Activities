import { Assets } from 'premid'

const presence = new Presence({ clientId: '1013183483750907904' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const statics: {
  [name: string]: string
} = {
  '': 'Viewing homepage',
  'pricing': 'Comparing all plans',
  'explore': 'Exploring Patreon',
  'home': 'Viewing their feed',
  'login': 'Log in Patreon',
}
const slideshow = presence.createSlideshow()
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Patreon/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: ActivityAssets.Logo,
  }
  const presenceDataSlide: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const showButtons = await presence.getSetting<boolean>('buttons')
  const { pathname, href } = document.location
  const pathArr = pathname.split('/')

  switch (pathArr[1]) {
    case 'product':
      presenceData.details = 'Viewing a plan'
      presenceData.state = `Plan: ${pathArr[2]}`
      break
    case 'c':
      presenceData.details = 'Viewing a page for creators'
      presenceData.state = `For: ${
        {
          'podcasts': 'podcasters',
          'video': 'video creators',
          'music': 'musicians',
          'visualartists': 'visual artists',
          'communities': 'community leaders',
          'writing': 'writers & journalists',
          'gaming': 'gaming creators',
          'nonprofits': 'nonprofit organizations',
          'tutorials-and-education': 'education & tutorial creators',
          'local-businesses': 'local businesses',
        }[pathArr[2]!]
      }`
      break
    case 'apps':
      if (pathArr.length === 2) {
        presenceData.details = 'Viewing apps available'
      }
      else {
        presenceData.details = 'Viewing an app'
        presenceData.state = document.querySelector(
          '.Text_variantDisplayTextLg__NwCo5',
        )?.textContent
        presenceData.buttons = [{ label: 'View app', url: href }]
      }
      break
    case 'settings':
      presenceData.details = 'Editing their settings'
      presenceData.state = `Page: ${
        document.querySelectorAll('a[aria-current="page"]')[1]?.textContent
      }`
      break
    case 'search':
      if (href.includes('?q=')) {
        presenceData.details = 'Searching'
        presenceData.state = `Query: ${document
          .querySelector('input')
          ?.getAttribute('value')}`
        presenceData.smallImageKey = Assets.Search
      }
      else {
        presenceData.details = 'On searching page'
      }
      break
    case 'posts':
      presenceData.details = presenceDataSlide.details = 'Viewing a post'
      presenceData.state = document.querySelector(
        'span[data-tag="post-title"]',
      )?.textContent
      presenceDataSlide.state = `From ${
        document.querySelector('div[data-tag="metadata-wrapper"] > div > div')
          ?.textContent
      }`

      presenceData.buttons = presenceDataSlide.buttons = [
        { label: 'View Post', url: href },
      ]

      slideshow.addSlide('slidePostName', presenceData, 5000)
      slideshow.addSlide('slideCreatorName', presenceDataSlide, 5000)
      break
    default:
      if (Object.keys(statics).includes(pathArr[1]!)) {
        presenceData.details = statics[pathArr[1]!]
      }
      else if (pathArr[1]!.includes('messages')) {
        presenceData.details = 'Reading their messages'
      }
      else {
        presenceData.details = 'Viewing a creator'
        presenceData.state = document.querySelector('h1')?.textContent?.trim()
        presenceData.buttons = [{ label: 'View Creator', url: href }]
      }
  }

  if (!showButtons) {
    delete presenceData.buttons
    delete presenceDataSlide.buttons
  }

  if (slideshow.getSlides().length > 0)
    presence.setActivity(slideshow)
  else if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
