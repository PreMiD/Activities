import type ActivityStrings from './MyFigureCollection.net.json'

declare global {
  interface StringKeys {
    MyFigureCollection: keyof typeof ActivityStrings
  }
}

export const presence = new Presence({
  clientId: '503557087041683458',
})
export const browsingTimestamp = Math.floor(Date.now() / 1000)
export const slideshow = presence.createSlideshow()

export const BACKGROUND_URL_REGEX = /url\("(.*)"\)/

export function getStrings() {
  return presence.getStrings({
    browseArticles: 'myfigurecollection.browseArticles',
    browseClubs: 'myfigurecollection.browseClubs',
    browseEntries: 'myfigurecollection.browseEntries',
    browseItems: 'myfigurecollection.browseItems',
    browseTag: 'myfigurecollection.browseTag',
    browsing: 'general.browsing',
    buttonReadArticle: 'general.buttonReadArticle',
    buttonViewAd: 'myfigurecollection.buttonViewAd',
    buttonViewClub: 'myfigurecollection.buttonViewClub',
    buttonViewEntry: 'myfigurecollection.buttonViewEntry',
    buttonViewItem: 'myfigurecollection.buttonViewItem',
    buttonViewList: 'myfigurecollection.buttonViewList',
    buttonViewPage: 'general.buttonViewPage',
    buttonViewPicture: 'myfigurecollection.buttonViewPicture',
    buttonViewProfile: 'general.buttonViewProfile',
    buttonViewShop: 'myfigurecollection.buttonViewShop',
    byAuthor: 'myfigurecollection.byAuthor',
    readingAnArticle: 'general.readingAnArticle',
    viewAd: 'myfigurecollection.viewAd',
    viewClub: 'myfigurecollection.viewClub',
    viewEntry: 'myfigurecollection.viewEntry',
    viewHome: 'general.viewHome',
    viewItem: 'myfigurecollection.viewItem',
    viewItemComments: 'myfigurecollection.viewItemComments',
    viewList: 'general.viewList',
    viewPage: 'general.viewPage',
    viewPicture: 'myfigurecollection.viewPicture',
    viewPictureComments: 'myfigurecollection.viewPictureComments',
    viewProfile: 'general.viewProfile',
    viewShop: 'myfigurecollection.viewShop',
    viewThread: 'general.viewThread',
  })
}

export enum ActivityAssets {
  Logo = 'https://i.imgur.com/bRgn1zR.png',
}

export function getTitle(): HTMLHeadingElement | null {
  return document.querySelector('h1')
}

export function getSubtitle(): HTMLDivElement | null {
  return document.querySelector('.subtitle')
}

export function getThumbnail(): HTMLImageElement | null {
  return document.querySelector<HTMLImageElement>('.thumbnail')
}

export function getCurrentLink(): HTMLAnchorElement | null {
  return document.querySelector('.current')
}

export function getButton(label: string, url = document.location.href): ButtonData {
  return { label, url }
}
