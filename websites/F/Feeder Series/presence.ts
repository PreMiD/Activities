import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1452251315399819274'
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/4dATceI.jpeg',
}

presence.on('UpdateData', () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Browsing homepage',
    startTimestamp: browsingTimestamp
  }

  // Homepage
  if (pathname === '/') {
    presenceData.details = 'Browsing homepage'
  }
  // About page
  else if (pathname.includes('/our-team')) {
    presenceData.details = 'Reading about us'
  }
  // How we work page
    else if (pathname.includes('/how-we-work')) {
    presenceData.details = 'Reading how the team works'
  }
  // Join us page
    else if (pathname.includes('/join-us')) {
    presenceData.details = 'Wanting to join the team'
  }
  // Support us page
    else if (pathname.includes('/support-us')) {
    presenceData.details = 'Wanting to support the team'
  }
  // Contact us page
    else if (pathname.includes('/contact')) {
    presenceData.details = 'Wanting to contact the team'
  }
  // Calendar page
    else if (pathname.includes('/feeder-series-calendar')) {
    presenceData.details = 'Looking at the feeder series calendar'
  }
  // Article pages
  else if (pathname.includes('/2')) {
    const articleTitle =
      document
        .querySelector<HTMLHeadingElement>('h1.entry-title')
        ?.textContent
        ?.trim()

    presenceData.details = 'Reading an article'
    presenceData.state = articleTitle ?? 'Article'
  }
  // Category pages
  else if (pathname.includes('/category/')) {
    const categoryName =
      document
        .querySelector<HTMLSpanElement>('h1.page-title span')
        ?.textContent
        ?.trim()

    presenceData.details = 'Browsing a category'
    presenceData.state = categoryName ?? 'Category'
  }
  // Tags pages
  else if (pathname.includes('/tag/')) {
    const tagName =
      document
        .querySelector<HTMLSpanElement>('h1.page-title span')
        ?.textContent
        ?.trim()

    presenceData.details = 'Browsing a tag'
    presenceData.state = tagName ?? 'Tag'
  }

  presence.setActivity(presenceData)
})
