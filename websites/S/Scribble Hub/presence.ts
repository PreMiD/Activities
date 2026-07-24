import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.ibb.co/S7M6V6kV/SH.png',
}

function truncate(text: string, maxLength = 128): string {
  return text.length > maxLength
    ? `${text.slice(0, maxLength - 3)}...`
    : text
}

function getText(selector: string): string {
  return document.querySelector(selector)?.textContent?.trim() ?? ''
}

function getImage(selector: string): string {
  return document.querySelector<HTMLImageElement>(selector)?.src ?? ''
}

function getNovelTitle(): string {
  return getText('.chp_byauthor a:first-child')
    || getText('.fic_title')
    || document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content.trim()
    || ''
}

function getNovelCover(): string {
  return getImage('.novel-cover .fic_image img, .s_novel_img img')
    || document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content.trim()
    || ''
}

function setLargeImage(
  presenceData: PresenceData,
  image: string,
  smallImageText: string,
): void {
  if (!image)
    return

  presenceData.largeImageKey = image
  presenceData.smallImageKey = ActivityAssets.Logo
  presenceData.smallImageText = smallImageText
}

function updateForumActivity(
  presenceData: PresenceData,
  pathname: string,
): void {
  const pageTitle = getText('.p-title-value')

  if (pathname.startsWith('/threads/')) {
    presenceData.details = 'Reading a Thread'
    if (pageTitle)
      presenceData.state = truncate(pageTitle)
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading'
  }
  else if (pathname.startsWith('/forums/')) {
    presenceData.details = 'Viewing a Forum'
    if (pageTitle)
      presenceData.state = truncate(pageTitle)
  }
  else if (pathname.startsWith('/members/')) {
    const profileName = getText('.memberHeader-name .username')

    presenceData.details = 'Viewing a Forum Profile'
    if (profileName)
      presenceData.state = truncate(profileName)
    setLargeImage(
      presenceData,
      getImage('.memberHeader-avatar img'),
      'Viewing',
    )
  }
  else if (pathname.startsWith('/search/')) {
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[name="keywords"], input[name="q"]',
    )
    const searchQuery = searchInput?.value.trim()

    presenceData.details = searchQuery
      ? 'Searching the Forum for:'
      : 'Searching the Forum'
    if (searchQuery)
      presenceData.state = truncate(searchQuery)
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
  }
  else if (pathname.startsWith('/whats-new/')) {
    presenceData.details = 'Viewing What\'s New'
  }
  else if (pathname.startsWith('/conversations/')) {
    presenceData.details = 'Viewing Conversations'
  }
  else if (pathname.startsWith('/account/')) {
    presenceData.details = 'Managing Their Account'
  }
}

function updateMainSiteActivity(
  presenceData: PresenceData,
  pathname: string,
): void {
  if (/^\/read\/[^/]+\/chapter\/\d+\/?$/.test(pathname)) {
    const novelTitle = getNovelTitle()
    const chapterTitle = getText('.chapter-title')

    presenceData.details = truncate(`Reading: ${novelTitle || 'a Novel'}`)
    presenceData.state = truncate(chapterTitle || 'Reading a Chapter')
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading'
    setLargeImage(presenceData, getNovelCover(), 'Reading')
  }
  else if (pathname.startsWith('/series/')) {
    const novelTitle = getNovelTitle()

    presenceData.details = 'Viewing a Novel'
    if (novelTitle)
      presenceData.state = truncate(novelTitle)
    setLargeImage(presenceData, getNovelCover(), 'Browsing')
  }
  else if (pathname.startsWith('/series-finder') || pathname.startsWith('/genre/')) {
    presenceData.details = 'Searching Novels'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
  }
  else if (pathname.startsWith('/profile/')) {
    const profileName = getText('.auth_name_fic') || getText('h1')

    presenceData.details = 'Viewing a Profile'
    if (profileName)
      presenceData.state = truncate(profileName)
    setLargeImage(
      presenceData,
      getImage('.fic_useravatar_profile img'),
      'Viewing',
    )
  }
}

presence.on('UpdateData', () => {
  const { hostname, pathname } = document.location
  const isForum = hostname === 'scribblehubforum.com'
    || hostname === 'www.scribblehubforum.com'
  const presenceData: PresenceData = {
    name: 'Scribble Hub',
    details: isForum ? 'Browsing the Forum' : 'Browsing Scribble Hub',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Viewing,
    smallImageText: 'Browsing',
  }

  if (isForum)
    updateForumActivity(presenceData, pathname)
  else
    updateMainSiteActivity(presenceData, pathname)

  presence.setActivity(presenceData)
})
