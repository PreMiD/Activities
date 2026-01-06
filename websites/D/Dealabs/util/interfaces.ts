export interface Button { label: string, url: string }
export type ButtonArray = [Button, Button?]

export interface DealabsSettings {
  privacyMode: boolean
  hideDealTitles: boolean
  hideDiscussionTitles: boolean
  hideImages: boolean
  hidePrices: boolean
}

export interface Translation {
  navigating: string
  hunting: string
  viewDeal: string
  onDealabs: string
  onForum: string
  readDiscuss: string
  searchCode: string
  viewCodes: string
  browseDiscuss: string
  detail: string
  free: string
  hiddenDeal: string
  hiddenTopic: string
  viewPage: string
  exploreCat: string
  homepage: string
  forYou: string
  searchDeal: string
  newDeals: string
  hotDeals: string
  topDeals: string
  searching: string
  searchingEllipsis: string
  unknown: string
  unknownCategory: string
}

export interface Resolver {
  isActive: (pathname: string) => boolean
  getDetails: (t: Translation, settings: DealabsSettings) => string | undefined
  getState: (t: Translation, settings: DealabsSettings) => string | undefined
  getLargeImage?: () => string | undefined
  getButtons?: (t: Translation) => ButtonArray | undefined
}
