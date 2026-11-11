import type { PageState } from '../config/types.js'
import { ActivityType } from 'premid'
import { ActivityAssets, browsingTimestamp } from '../config/constants.js'
import { buildButtons } from '../util/activity.js'
import { clean, safeDecode } from '../util/dom.js'
import { stripEpisode } from './watch.js'

/** Returns a display name for the current browsing page. */
export function getPageName(): string {
  const pathname = document.location.pathname
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return 'Home'
  }

  const firstSegment = segments[0]

  if (!firstSegment) {
    return 'Home'
  }

  const pageNames: Record<string, string> = {
    anisto: 'Anime',
    mangasto: 'Manga',
    movisto: 'Movies',
    novelsto: 'Novels',
    booksto: 'Books',
    tvsto: 'Live TV',
    gamesto: 'Games',
    codesto: 'Code Tools',
    toolsto: 'Tools',
    studysto: 'Study',
    plansto: 'Plans',
    roomsto: 'Rooms',
    r: 'Rooms',
  }

  const subPages: Record<string, Record<string, string>> = {
    studysto: { library: 'My teachers', desk: 'My study' },
    tvsto: { favorites: 'Favorites' },
    plansto: {
      tasks: 'Tasks',
      calendar: 'Calendar',
      study: 'Study',
      settings: 'Settings',
      day: 'Day',
    },
    codesto: { new: 'Templates', plans: 'Plans', usage: 'Usage' },
    toolsto: {
      images: 'Images',
      pdf: 'PDF',
      text: 'Text',
      developer: 'Developer',
    },
  }

  const pageName = pageNames[firstSegment.toLowerCase()]
  const subPage = segments[1]
    ? subPages[firstSegment.toLowerCase()]?.[segments[1].toLowerCase()]
    : undefined

  if (pageName) {
    return subPage ? `${pageName} • ${subPage}` : pageName
  }

  const title = clean(document.title)

  if (
    title
    && !/^(?:storm|stormd|storm tempest)$/i.test(title)
  ) {
    return stripEpisode(title)
  }

  return 'Storm Tempest'
}

/** Collects the name and URL of the current browsing page, noting a search query or a profile. */
export function getPageState(): PageState {
  const url = document.location.href
  const [first, second] = document.location.pathname.split('/').filter(Boolean)

  if (first?.toLowerCase() === 'u' && second) {
    return {
      name: 'Profile',
      url,
      kind: 'profile',
      subject: safeDecode(second),
    }
  }

  const params = new URLSearchParams(document.location.search)
  const query = clean(
    ['q', 'query', 'search'].map(key => params.get(key)).find(Boolean),
  )

  return query
    ? { name: getPageName(), url, kind: 'search', subject: query }
    : { name: getPageName(), url }
}

/** Picks the button for a browsing page: the profile, the search results, or the page itself, but never the home page. */
export function pageButton(page: PageState): ButtonData | undefined {
  if (new URL(page.url).pathname === '/') {
    return undefined
  }

  if (page.kind === 'profile') {
    return { label: 'View Profile', url: page.url }
  }

  if (page.kind === 'search') {
    return { label: 'View Results', url: page.url }
  }

  const name = page.name.split(' • ').pop() ?? page.name

  return { label: `Open ${name}`.slice(0, 32), url: page.url }
}

/** Builds the presence shown while browsing, keeping the elapsed time fixed. */
export function buildPageActivity(page: PageState, privacy: boolean): PresenceData {
  const details = page.kind === 'profile'
    ? 'Viewing a profile'
    : page.kind === 'search'
      ? privacy ? 'Searching Storm Tempest' : `Searching ${page.name}`
      : privacy ? 'Browsing Storm Tempest' : `Browsing ${page.name}`
  const state = privacy || !page.subject
    ? 'Storm Tempest'
    : page.kind === 'profile' ? `@${page.subject}` : `"${page.subject}"`

  return {
    type: ActivityType.Watching,
    details,
    state,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    buttons: privacy ? buildButtons() : buildButtons(pageButton(page)),
  }
}
