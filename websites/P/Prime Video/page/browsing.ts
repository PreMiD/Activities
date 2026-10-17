import { Assets } from 'premid'
import { DETAIL_PATH, SELECTORS } from '../config/constants.js'
import { applyCover } from './thumbnail.js'

export interface BrowsingContext {
  pathname: string
  pageTitle?: string
  bannerImg?: string
  showCover: boolean
  imageType: number
}

interface BrowsingRule {
  match: (pathname: string) => boolean
  apply: (presenceData: PresenceData, context: BrowsingContext) => void
}

function browsing(details: string): BrowsingRule['apply'] {
  return (presenceData) => {
    presenceData.details = details
    presenceData.state = 'Browsing...'
  }
}

// Order matters: the first matching rule is applied
const RULES: BrowsingRule[] = [
  {
    match: pathname => pathname.includes('/storefront') || pathname === '/',
    apply: browsing('Viewing Home'),
  },
  {
    match: pathname => pathname.includes(DETAIL_PATH),
    apply: (presenceData, { pageTitle, bannerImg, showCover, imageType }) => {
      presenceData.details = 'Viewing page for:'
      presenceData.state = pageTitle || 'Prime Video'

      applyCover(presenceData, bannerImg, { showCover, imageType })
    },
  },
  { match: pathname => pathname.includes('/movie'), apply: browsing('Viewing Movies') },
  { match: pathname => pathname.includes('/tv'), apply: browsing('Viewing TV-Series') },
  { match: pathname => pathname.includes('/sports'), apply: browsing('Viewing Sports') },
  { match: pathname => pathname.includes('/categories'), apply: browsing('Viewing Categories') },
  { match: pathname => pathname.includes('/kids/'), apply: browsing('Viewing Movies for kids') },
  { match: pathname => pathname.includes('/livetv'), apply: browsing('Viewing Live TV') },
  {
    match: pathname => pathname.includes('/search/') && !!document.querySelector(SELECTORS.searchSummary),
    apply: (presenceData) => {
      presenceData.details = 'Searching for:';
      [presenceData.state] = document
        .querySelector(SELECTORS.searchSummary)
        ?.textContent
        ?.split(/["„]/)[1]
        ?.split(/[”"]/) ?? []
      presenceData.smallImageKey = Assets.Search
    },
  },
  { match: pathname => pathname.includes('/genre/'), apply: browsing('Viewing Genres') },
  {
    match: pathname => pathname.includes('shop'),
    apply: (presenceData) => {
      presenceData.details = 'Browsing the store...'
    },
  },
]

export function applyBrowsingPresence(presenceData: PresenceData, context: BrowsingContext): void {
  RULES.find(rule => rule.match(context.pathname))?.apply(presenceData, context)
}
