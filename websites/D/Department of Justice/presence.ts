import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://images.weserv.nl/?url=www.justice.gov%2Fd9%2Fstyles%2Fcoh_medium%2Fpublic%2F2025-03%2Fdoj-seal-257x257.png%3Fitok%3DqL5GWp29&w=512&h=512&fit=contain&output=png&filename=logo.png',
}

function getPageTitle(): string {
  const heading = document.querySelector('main h1')?.textContent?.trim()
  const openGraphTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content.trim()
  const documentTitle = document.title
    .split('|')
    .map(part => part.trim())
    .find(part => part && part !== 'United States Department of Justice')

  const title = heading || openGraphTitle || documentTitle || ''
  return title.length > 128 ? `${title.slice(0, 125)}...` : title
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const [privacyMode, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('showButtons'),
  ])
  const pageTitle = getPageTitle()
  const presenceData: PresenceData = {
    name: 'Department of Justice',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Viewing,
  }

  let buttonLabel = 'View Page'

  if (pathname === '/') {
    presenceData.details = 'Viewing the homepage'
  }
  else if (pathname.startsWith('/search')) {
    const query = new URLSearchParams(search).get('search_api_fulltext')?.trim()
    presenceData.details = 'Searching the website'
    presenceData.state = query ? `Searching for: ${query}` : 'Viewing search results'
    presenceData.smallImageKey = Assets.Search
    buttonLabel = 'View Search Results'
  }
  else if (pathname.toLowerCase().endsWith('.pdf')) {
    const fileName = decodeURIComponent(pathname.split('/').pop() || '')
    presenceData.details = 'Viewing a document'
    presenceData.state = fileName || 'Department document'
    presenceData.smallImageKey = Assets.Reading
    buttonLabel = 'View Document'
  }
  else if (/\/pr\//.test(pathname)) {
    presenceData.details = 'Reading a press release'
    presenceData.state = pageTitle
    presenceData.smallImageKey = Assets.Reading
    buttonLabel = 'Read Press Release'
  }
  else if (/\/speech\//.test(pathname)) {
    presenceData.details = 'Reading a speech'
    presenceData.state = pageTitle
    presenceData.smallImageKey = Assets.Reading
    buttonLabel = 'Read Speech'
  }
  else if (/\/video\//.test(pathname)) {
    presenceData.details = 'Watching a video'
    presenceData.state = pageTitle
    buttonLabel = 'Watch Video'
  }
  else if (/\/(?:blog|podcast)\//.test(pathname)) {
    presenceData.details = pathname.includes('/podcast/') ? 'Viewing a podcast' : 'Reading a blog post'
    presenceData.state = pageTitle
    presenceData.smallImageKey = Assets.Reading
    buttonLabel = pathname.includes('/podcast/') ? 'View Podcast' : 'Read Blog Post'
  }
  else if (/\/(?:media|document)\//.test(pathname)) {
    presenceData.details = 'Viewing a document'
    presenceData.state = pageTitle || 'Department document'
    presenceData.smallImageKey = Assets.Reading
    buttonLabel = 'View Document'
  }
  else if (/(?:^|\/)news(?:\/|$)/.test(pathname)) {
    presenceData.details = 'Browsing news'
    presenceData.state = pageTitle
  }
  else if (/\/(?:select-)?(?:publications?|documents?)(?:\/|$)/.test(pathname) || /\/(?:foia|legal-policies)(?:\/|$)/.test(pathname)) {
    presenceData.details = 'Browsing documents'
    presenceData.state = pageTitle
    presenceData.smallImageKey = Assets.Reading
  }
  else {
    presenceData.details = 'Browsing the website'
    presenceData.state = pageTitle
  }

  if (privacyMode) {
    presenceData.details = 'Browsing the Department of Justice'
    delete presenceData.state
    delete presenceData.buttons
  }
  else if (showButtons && pathname !== '/') {
    presenceData.buttons = [{ label: buttonLabel, url: href }]
  }

  presence.setActivity(presenceData)
})
