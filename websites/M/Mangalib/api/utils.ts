export enum SiteId {
  MangaLib = '1',
  RanobeLib = '3',
  AnimeLib = '5',
}

enum CustomAssets {
  MangaLibLogo = 'https://cdn.rcd.gg/PreMiD/websites/M/Mangalib/assets/logo.png',
  RanobeLibLogo = 'https://cdn.rcd.gg/PreMiD/websites/M/Mangalib/assets/0.png',
  AnimeLibLogo = 'https://cdn.rcd.gg/PreMiD/websites/M/Mangalib/assets/1.png',
}

export function getSiteId(hostname: string) {
  switch (hostname) {
    case 'mangalib.me':
    case 'mangalib.org':
      return SiteId.MangaLib
    case 'ranobelib.me':
    case 'v1.novelslib.me':
      return SiteId.RanobeLib
    case 'anilib.me':
    case 'animelib.org':
    case 'v1.animelib.org':
    case 'v2.animelib.org':
    case 'v3.animelib.org':
      return SiteId.AnimeLib
    default:
      throw new Error('MangaLib Activity: An unknown host name was received.')
  }
}

export function switchLogo(siteId: SiteId) {
  switch (siteId) {
    case SiteId.MangaLib:
      return CustomAssets.MangaLibLogo
    case SiteId.RanobeLib:
      return CustomAssets.RanobeLibLogo
    case SiteId.AnimeLib:
      return CustomAssets.AnimeLibLogo
  }
}

export function cleanUrl(href: string) {
  return href.replace(/\/(?:watch|read).*$/, '')
}

const pdPrefix = '?assurePd='

export function assurePd(src: string | null | undefined, siteId: SiteId): string {
  if (!src)
    return switchLogo(siteId)

  // Make sure the src is at least 256 characters long, otherwise pd won't "shorten" it, we need it shortened because of cors issues if discord handles it on their side.
  if (src.length < 256)
    src += `${pdPrefix}${'a'.repeat(256 - src.length - pdPrefix.length + 1)}`
  return src
}
