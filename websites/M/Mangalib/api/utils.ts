import { ActivityAssets } from '../presence.js'

export enum SiteId {
  MangaLib = '1',
  RanobeLib = '3',
  AnimeLib = '5',
}

export function getSiteId(hostname: string) {
  switch (hostname) {
    case 'mangalib.me':
      return SiteId.MangaLib
    case 'ranobelib.me':
      return SiteId.RanobeLib
    case 'anilib.me':
      return SiteId.AnimeLib
    default:
      throw new Error('An unknown host name was received.')
  }
}

export function switchLogo(siteId: SiteId) {
  switch (siteId) {
    case SiteId.MangaLib:
      return ActivityAssets.MangaLibLogo
    case SiteId.RanobeLib:
      return ActivityAssets.RanobeLibLogo
    case SiteId.AnimeLib:
      return ActivityAssets.AnimeLibLogo
  }
}

export function cleanUrl(href: string) {
  return href.replace(/\/(?:watch|read).*$/, '')
}
