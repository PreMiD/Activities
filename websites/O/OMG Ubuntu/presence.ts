import { Assets } from 'premid'

const presence = new Presence({
  clientId: '901490472046968843',
})
const pages: Record<string, string> = {
  '/': 'Home',
  '/about-us': 'About',
  '/commenting-conduct': 'Code of Conduct',
  '/privacy-policy': 'Privacy Policy',
  '/tip': 'Contact',
}
const startTimestamp = Math.round(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const page = location.pathname
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/OMG%20Ubuntu/assets/logo.png',
    startTimestamp,
  }
  const header = document
    .querySelector('div.u--box.content-container > div.loop > header > h2')
    ?.lastChild
    ?.textContent
    ?.trim()
    .replaceAll('“|”', '')
  const articleHeader = document.querySelector('div.post__hero > div.u--box > header > h1')
    ?.textContent
    || document.querySelector(
      'div.u--box > div.primary > article.type-post > header > h1',
    )?.textContent

  if (page.includes('/tag/')) {
    presenceData.details = 'Looking at a tag:'
    presenceData.state = header || 'Unknown Tag'
  }
  else if (page.includes('/category/')) {
    presenceData.details = 'Looking at a category:'
    presenceData.state = header || 'Unknown Category'
  }
  else if (page.includes('/page/')) {
    presenceData.details = 'Looking at article pages'
    presenceData.state = `Page: ${
      location.pathname.split('/')[2] || 'Unknown'
    }`
  }
  else if (page === '/' && location.search?.includes('?s=')) {
    presenceData.details = 'Searching for:'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
    presenceData.state = decodeURI(location.search).replace('?s=', '').replaceAll('+', ' ')
      || 'Unknown Search'
  }
  else if (page.includes('/') && articleHeader) {
    presenceData.details = 'Reading an article:'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading'
    presenceData.state = articleHeader
    presenceData.buttons = [{ label: 'Read Article', url: location.href }]
  }
  else if (pages[page]) {
    presenceData.details = `Looking at the ${pages[page]} page`
  }

  presence.setActivity(presenceData)
})
