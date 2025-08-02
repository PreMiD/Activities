import type ActivityStrings from './MyFigureCollection.net.json'
import { Assets } from 'premid'

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
    submit: 'myfigurecollection.submit',
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
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/MyFigureCollection.net/assets/logo.png',
}

// mostly needed because the site's images don't load on Discord
const imageCache: Record<string, Promise<Blob | string>> = {}
export function squareImage(inputImage: HTMLImageElement | string | null): Promise<Blob | string> {
  if (inputImage === null) {
    return Promise.resolve(ActivityAssets.Logo)
  }
  let src = ''
  if (inputImage instanceof HTMLImageElement) {
    if (!inputImage.complete) {
      return Promise.resolve(ActivityAssets.Logo)
    }
    src = inputImage.src
  }
  else {
    src = inputImage
  }
  if (src in imageCache) {
    return imageCache[src]!
  }
  const image = document.createElement('img')
  image.crossOrigin = 'anonymous'
  const render = () => {
    const { naturalHeight: height, naturalWidth: width } = image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const size = 512

    const scale = Math.min(size / width, size / height)
    const scaledWidth = width * scale
    const scaledHeight = height * scale
    const offsetX = (size - scaledWidth) / 2
    const offsetY = (size - scaledHeight) / 2

    canvas.width = size
    canvas.height = size
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight)
    const output = new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      })
    })
    imageCache[src] = output
    return output
  }
  imageCache[src] = Promise.resolve(Assets.Uploading)
  return new Promise((resolve) => {
    image.onload = () => {
      resolve(render())
    }
    image.src = src
  })
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
