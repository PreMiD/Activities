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
const creatorSections: Record<string, string> = {
  about: 'Viewing creator about page',
  chats: 'Viewing creator chats',
  collections: 'Viewing creator collections',
  gift: 'Viewing gift options',
  membership: 'Viewing membership options',
  memberships: 'Viewing membership options',
  posts: 'Browsing creator posts',
  recommendations: 'Viewing creator recommendations',
  shop: 'Viewing creator shop',
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Patreon/assets/logo.png',
}

function getTextContent(selector: string) {
  return document.querySelector(selector)?.textContent?.trim()
}

function getPageTitle(...suffixes: string[]) {
  let title = document.title.trim()

  for (const suffix of suffixes)
    title = title.replace(suffix, '').trim()

  return title
}

function getSearchQuery() {
  const params = new URLSearchParams(document.location.search)

  return params.get('q')
    ?? params.get('query')
    ?? document.querySelector<HTMLInputElement>('input[type="search"], input')?.value
}

function getPostTitle() {
  return getTextContent('[data-tag="post-title"]')
    ?? getTextContent('h1')
    ?? document.title.replace(/\s+\|\s+Patreon$/, '')
}

function getPostCreatorName() {
  const ogTitle = document
    .querySelector('meta[property="og:title"]')
    ?.getAttribute('content')
    ?.trim()

  if (ogTitle?.includes(' | '))
    return ogTitle.split(' | ').slice(1).join(' | ').trim()

  return [...document.querySelectorAll<HTMLAnchorElement>('a[href]')]
    .find(anchor =>
      /^https:\/\/www\.patreon\.com\/[\w.-]+\/?$/.test(anchor.href)
      && anchor.textContent?.trim(),
    )
    ?.textContent
    ?.trim()
}

function getCreatorName() {
  return getTextContent('h1')
    ?? document.title.split(' | ')[0]?.trim()
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
  const [privacy, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { pathname, href, hostname } = document.location
  const searchParams = new URLSearchParams(document.location.search)
  const pathArr = pathname.split('/')
  const creatorSlugIndex = pathArr[1] === 'cw' ? 2 : 1
  const creatorSlug = pathArr[creatorSlugIndex]
  const creatorSection = pathArr[creatorSlugIndex + 1]

  if (slideshow.getSlides().length > 0)
    slideshow.deleteAllSlides()

  if (hostname === 'support.patreon.com') {
    switch (pathArr[1]) {
      case 'hc':
        if (pathArr[3] === 'requests' && pathArr[4] === 'new') {
          presenceData.details = searchParams.get('ticket_form_id') === '28810449009677'
            ? 'Submitting a feature request'
            : 'Submitting a help request'
        }
        else if (pathArr[3] === 'articles') {
          presenceData.details = 'Reading a help article'
          if (!privacy)
            presenceData.state = getPageTitle(' – Patreon Help Center', ' - Patreon Help Center')
        }
        else {
          presenceData.details = 'Browsing the Help Center'
        }
        break
      default:
        presenceData.details = 'Browsing the Help Center'
    }
  }
  else if (hostname === 'privacy.patreon.com') {
    presenceData.details = pathArr[1] === 'policies'
      ? 'Reading privacy policies'
      : 'Viewing Patreon privacy information'
  }
  else {
    switch (pathArr[1]) {
      case 'product':
        presenceData.details = 'Viewing a plan'
        if (!privacy && pathArr[2])
          presenceData.state = `Plan: ${pathArr[2]}`
        break
      case 'c': {
        presenceData.details = 'Viewing a page for creators'
        if (!privacy) {
          const creatorType = ({
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
          } as Record<string, string>)[pathArr[2]!]
          if (creatorType)
            presenceData.state = `For: ${creatorType}`
        }
        break
      }
      case 'explore':
        if (pathArr[2] === 'search') {
          const searchQuery = getSearchQuery()
          const searchType = searchParams.get('type')

          presenceData.details = searchQuery
            ? {
                post: 'Searching posts',
                creator: 'Searching creators',
              }[searchType ?? ''] ?? 'Searching Patreon'
            : 'On searching page'
          if (!privacy && searchQuery)
            presenceData.state = `Query: ${searchQuery}`
          presenceData.smallImageKey = Assets.Search
        }
        else {
          presenceData.details = pathArr[2] === 'creators'
            ? searchParams.get('type') === 'suggested-campaigns'
              ? 'Exploring suggested creators'
              : 'Exploring creators'
            : 'Exploring Patreon'
          if (!privacy) {
            const topic = searchParams
              .get('topic')
              ?.replace(/_/g, ' ')
              ?? (pathArr[2] && !['all', 'creators'].includes(pathArr[2])
                ? pathArr[2].replace(/-/g, ' ')
                : undefined)
            if (topic)
              presenceData.state = `Topic: ${topic}`
          }
        }
        break
      case 'apps':
        if (pathArr.length === 2) {
          presenceData.details = 'Viewing apps available'
        }
        else {
          presenceData.details = 'Viewing an app'
          if (!privacy) {
            presenceData.state = document.querySelector(
              '.Text_variantDisplayTextLg__NwCo5',
            )?.textContent
            presenceData.buttons = [{ label: 'View app', url: href }]
          }
        }
        break
      case 'settings': {
        presenceData.details = 'Editing their settings'
        if (!privacy) {
          const settingPage = document.querySelectorAll('a[aria-current="page"]')[1]?.textContent
          if (settingPage)
            presenceData.state = `Page: ${settingPage}`
        }
        break
      }
      case 'search': {
        const legacySearchQuery = getSearchQuery()
        if (legacySearchQuery) {
          presenceData.details = 'Searching creators'
          if (!privacy)
            presenceData.state = `Query: ${legacySearchQuery}`
          presenceData.smallImageKey = Assets.Search
        }
        else {
          presenceData.details = 'On searching page'
        }
        break
      }
      case 'notifications':
        presenceData.details = 'Viewing notifications'
        break
      case 'messages':
        if (searchParams.get('tab') === 'direct-messages') {
          presenceData.details = pathArr[2]
            ? 'Viewing a direct message'
            : 'Browsing direct messages'
        }
        else if (searchParams.get('tab') === 'chats') {
          presenceData.details = pathArr[2]
            ? 'Viewing a group chat'
            : 'Browsing group chats'
        }
        else {
          presenceData.details = 'Reading their messages'
        }
        break
      case 'policy':
        presenceData.details = pathArr[2] === 'legal'
          ? 'Reading terms of use'
          : 'Reading community policies'
        break
      case 'posts':
        presenceData.details = 'Viewing a post'

        if (!privacy) {
          const postTitle = getPostTitle()
          const creatorName = getPostCreatorName()

          if (postTitle) {
            presenceData.state = postTitle
            slideshow.addSlide('slidePostName', presenceData, 5000)
          }

          if (creatorName) {
            presenceDataSlide.details = 'Viewing a post'
            presenceDataSlide.state = `From ${creatorName}`
            slideshow.addSlide('slideCreatorName', presenceDataSlide, 5000)
          }

          if (showButtons)
            presenceData.buttons = presenceDataSlide.buttons = [{ label: 'View Post', url: href }]
        }
        break
      case 'collection':
        presenceData.details = 'Viewing a collection'
        if (!privacy)
          presenceData.state = getTextContent('h1') ?? undefined
        break
      case 'cw':
        presenceData.details = creatorSlug === 'patreon' && !creatorSection
          ? 'Viewing Patreon news'
          : creatorSection && creatorSections[creatorSection]
            ? creatorSections[creatorSection]
            : 'Viewing a creator'
        if (!privacy && creatorSlug !== 'patreon')
          presenceData.state = getCreatorName()
        if (!privacy && showButtons && !creatorSection)
          presenceData.buttons = [{ label: 'View Creator', url: href }]
        break
      default:
        if (Object.keys(statics).includes(pathArr[1]!)) {
          presenceData.details = statics[pathArr[1]!]
        }
        else if (pathArr[1]!.includes('messages')) {
          presenceData.details = 'Reading their messages'
        }
        else {
          presenceData.details = creatorSection && creatorSections[creatorSection]
            ? creatorSections[creatorSection]
            : 'Viewing a creator'
          if (!privacy) {
            presenceData.state = creatorSlug === 'patreon' && !creatorSection
              ? undefined
              : getCreatorName()
            if (!creatorSection)
              presenceData.buttons = [{ label: 'View Creator', url: href }]
          }
        }
    }
  }

  if (!showButtons || privacy) {
    delete presenceData.buttons
    delete presenceDataSlide.buttons
  }

  if (!privacy && slideshow.getSlides().length > 0)
    presence.setActivity(slideshow)
  else if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
