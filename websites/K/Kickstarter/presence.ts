import { Assets } from 'premid'

const presence = new Presence({ clientId: '1014441192106229790' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()
const staticsTabsProject: { [name: string]: string } = {
  description: 'Reading Project Description',
  faqs: 'Reading Project FAQ',
  posts: 'Reading Project News',
  comments: 'Reading Project Comments',
  community: 'Viewing Project Contributors',
  pledge: 'Contributing to the Project',
}
const staticPages: { [name: string]: string } = {
  '': 'Viewing homepage',
  'start': 'Starting a new project',
  'arts': 'Browsing arts projects',
  'comics-illustration': 'Browsing comic and illustration projects',
  'design-tech': 'Browsing design and tech projects',
  'film': 'Browsing film projects',
  'food-craft': 'Browsing food craft projects',
  'games': 'Browsing game projects',
  'music': 'Browsing music projects',
  'publishing': 'Browsing publishing projects',
  'blog': 'Reading blog posts',
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/Kickstarter/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const presenceDataSlide: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname } = document.location
  const pathArr = pathname.split('/')
  const showButtons = await presence.getSetting<boolean>('buttons')

  if (pathArr[1] === 'projects') {
    presenceData.details = presenceDataSlide.details = pathArr.length > 4 ? staticsTabsProject[pathArr[4]!] : 'Viewing a project'
    presenceData.state = document.querySelector('.project-name')?.textContent
      ?? document.querySelector('span > a')?.textContent
    if (!pathname.includes('pledge')) {
      presenceDataSlide.state = document.querySelector('a#back-project-button')
        ? `${document.querySelector('.ksr-green-500')?.textContent} on ${
          document.querySelector('.money')?.textContent
        }`
        : `${document.querySelector('.money')?.textContent} obtained`
      slideshow.addSlide('moneySlide', presenceDataSlide, 5000)
    }

    presenceData.smallImageKey = presenceDataSlide.smallImageKey = Assets.Reading
    presenceData.buttons = presenceDataSlide.buttons = [
      { label: 'View Project', url: href.split('pledge')[0]! },
    ]

    slideshow.addSlide('projectName', presenceData, 5000)
  }
  else if (Object.keys(staticPages).includes(pathArr[1]!)) {
    presenceData.details = staticPages[pathArr[1]!]
  }
  else {
    presenceData.details = 'Browsing'
  }

  if (!showButtons) {
    delete presenceData.buttons
    delete presenceDataSlide.buttons
  }

  if (slideshow.getSlides().length > 1)
    presence.setActivity(slideshow)
  else presence.setActivity(presenceData)
})
