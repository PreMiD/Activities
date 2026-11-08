import { ActivityType, Assets, getTimestampsFromMedia, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1490262611995000872',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/Kiite/assets/logo.png',
}

const SELECTORS = {
  // kiite.jp player
  nowPlayingRow: 'li.media-info.nowplaying',
  playPauseIcon: '#player .pl-fn-cont .pl-btn-play .material-icons',
  playerBarCreator: '#player .pl-now-creator',
  playerThumb: '#player .pl-thum',
  playerTitle: '.pl-now-title .jp-title',
  video: '#jp_video_container video',
  // cafe.kiite.jp
  cafeTitle: '#now_playing_info .title',
  cafeArtist: '#now_playing_info .artist',
  cafeThumbIcon: '#now_playing_info .thumbnail .icon',
  cafePlayer: '#cafe_player',
  cafeBgBlur: '#cafe .bg_blur',
  // check.kiite.jp
  checkTitle: '[class*="[grid-area:title]"] p',
  checkArtist: '[class*="[grid-area:artist]"] p',
  checkThumb: '[class*="[grid-area:thumbnail]"] img',
} as const

const NICO_CDN_THUMB_RE
  = /https:\/\/nicovideo\.cdn\.nimg\.jp\/thumbnails\/[^"');}\s]+/g

function normalizeText(s: string | null | undefined): string {
  return s?.replaceAll('\u00A0', ' ').trim() ?? ''
}

function dataAttr(
  el: Element | null | undefined,
  name: string,
): string | undefined {
  const v = el?.getAttribute(name)?.trim()
  return v || undefined
}

function nowPlayingRow(): Element | null {
  return document.querySelector(SELECTORS.nowPlayingRow)
}

function isPlaceholderThumbnail(url: string): boolean {
  return url.includes('no_thumbnail')
}

function urlFromCssBackground(bg: string): string | undefined {
  if (!bg || bg === 'none')
    return undefined
  const m = bg.match(/url\(["']?([^"')]+)["']?\)/)
  const url = m?.[1]
  if (!url || isPlaceholderThumbnail(url))
    return undefined
  return url
}

function backgroundImageFromElement(el: HTMLElement | null): string | undefined {
  if (!el)
    return undefined
  return (
    urlFromCssBackground(el.style.backgroundImage)
    ?? urlFromCssBackground(getComputedStyle(el).backgroundImage)
  )
}

function nicoThumbnailUrlsInCssText(css: string): string[] {
  return Array.from(css.matchAll(NICO_CDN_THUMB_RE))
    .map(m => m[0])
    .filter(url => !isPlaceholderThumbnail(url))
}

function pickBestNicoThumbnailUrl(urls: string[]): string | undefined {
  if (urls.length === 0)
    return undefined
  const rank = (u: string) => (u.endsWith('.L') ? 3 : u.endsWith('.M') ? 2 : 1)
  return urls.reduce((best, curr) => (rank(curr) > rank(best) ? curr : best))
}

function thumbnailFromNicoHeadStyles(): string | undefined {
  const { head } = document
  if (!head)
    return undefined
  const urls: string[] = []
  for (const style of head.querySelectorAll('style')) {
    const text = style.textContent
    if (text)
      urls.push(...nicoThumbnailUrlsInCssText(text))
  }
  return pickBestNicoThumbnailUrl(urls)
}

function playerVideo(): HTMLVideoElement | null {
  return document.querySelector(SELECTORS.video)
}

function playerTitle(): string | null {
  const text = normalizeText(
    document.querySelector(SELECTORS.playerTitle)?.textContent,
  )
  if (!text || text === '-')
    return null
  return text
}

function playerCreator(): string | undefined {
  const bar = document.querySelector(SELECTORS.playerBarCreator)
  const fromArtist = normalizeText(
    bar?.querySelector('.jp-artist')?.textContent,
  )
  if (fromArtist)
    return fromArtist
  const fromLink = normalizeText(bar?.querySelector('a')?.textContent)
  if (fromLink)
    return fromLink
  return dataAttr(nowPlayingRow(), 'data-creator-name')
}

function playerThumbnail(): string | undefined {
  const video = playerVideo()
  const fromThumb = backgroundImageFromElement(
    document.querySelector<HTMLElement>(SELECTORS.playerThumb),
  )
  const fromRow = dataAttr(nowPlayingRow(), 'data-thumbnail')
  const fromPoster = (() => {
    if (!video)
      return undefined
    const poster = video.getAttribute('poster') || video.poster
    return poster && !isPlaceholderThumbnail(poster) ? poster : undefined
  })()

  return (
    fromThumb
    ?? (fromRow && !isPlaceholderThumbnail(fromRow) ? fromRow : undefined)
    ?? fromPoster
    ?? thumbnailFromNicoHeadStyles()
  )
}

function isTrackPlaying(video: HTMLVideoElement | null): boolean {
  const icon = document
    .querySelector(SELECTORS.playPauseIcon)
    ?.textContent
    ?.trim()
  if (icon === 'pause')
    return true
  return !!(video && !video.paused && video.readyState > 0)
}

function applyMediaTimestamps(
  data: PresenceData,
  playing: boolean,
  video: HTMLVideoElement | null,
): void {
  if (!playing || !video)
    return
  const [start, end] = getTimestampsFromMedia(video)
  if (start && end) {
    data.startTimestamp = start
    data.endTimestamp = end
  }
}

async function fetchStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    searchSomething: 'general.searchSomething',
    searchFor: 'general.searchFor',
    buttonViewPage: 'general.buttonViewPage',
    viewHome: 'general.viewHome',
    viewPlaylist: 'general.viewPlaylist',
    viewAPlaylist: 'general.viewAPlaylist',
    viewUser: 'general.viewUser',
    viewProfile: 'general.viewProfile',
    viewAccount: 'general.viewAccount',
    viewAHelpPage: 'general.viewAHelpPage',
    readingAbout: 'general.readingAbout',
    playing: 'general.playing',
    paused: 'general.paused',
  })
}

type PresenceStrings = Awaited<ReturnType<typeof fetchStrings>>

function listeningPresence(
  strings: PresenceStrings,
  href: string,
  title: string,
  artist: string | undefined,
  thumbnail: string | undefined,
  playing: boolean,
  video: HTMLVideoElement | null = null,
): PresenceData {
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    statusDisplayType: StatusDisplayType.Details,
    largeImageKey: thumbnail ?? ActivityAssets.Logo,
    details: title,
    smallImageKey: playing ? Assets.Play : Assets.Pause,
    smallImageText: playing ? strings.playing : strings.paused,
    buttons: [{ label: strings.buttonViewPage, url: href }],
  }
  if (artist)
    presenceData.state = artist
  applyMediaTimestamps(presenceData, playing, video)
  return presenceData
}

function applyMainBrowsingState(
  pathname: string,
  search: string,
  strings: PresenceStrings,
  data: PresenceData,
): void {
  delete data.state
  data.smallImageKey = Assets.Reading

  if (pathname === '/' || pathname === '') {
    data.details = strings.viewHome
  }
  else if (pathname.startsWith('/playlist/')) {
    const title = document
      .querySelector('h1.playlist-dtl-title')
      ?.textContent
      ?.trim()
    data.details = title ? strings.viewPlaylist : strings.viewAPlaylist
    if (title)
      data.state = title
  }
  else if (pathname.startsWith('/user/')) {
    const name
      = document.querySelector('h1.user-dtl-name')?.textContent?.trim()
        ?? document.querySelector('#user-info')?.getAttribute('data-nickname')
    data.details = strings.viewUser
    if (name)
      data.state = name
  }
  else if (pathname.startsWith('/creator/')) {
    const name = document
      .querySelector('h1.playlist-dtl-title')
      ?.textContent
      ?.trim()
    data.details = strings.viewProfile
    if (name)
      data.state = name
  }
  else if (pathname.startsWith('/search')) {
    const keyword = new URLSearchParams(search).get('keyword')?.trim()
    data.details = keyword ? strings.searchFor : strings.searchSomething
    if (keyword)
      data.state = keyword
    data.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/about')) {
    data.details = strings.readingAbout
    data.state = 'Kiite'
  }
  else if (pathname.startsWith('/my/')) {
    data.details = strings.viewAccount
  }
  else if (pathname.startsWith('/faq')) {
    data.details = strings.viewAHelpPage
  }
  else {
    data.details = strings.browsing
  }
}

function handleMainSite(
  strings: PresenceStrings,
  href: string,
  pathname: string,
  search: string,
): PresenceData {
  const title = playerTitle()
  const video = playerVideo()
  const playing = isTrackPlaying(video)

  if (title) {
    return listeningPresence(
      strings,
      href,
      title,
      playerCreator(),
      playerThumbnail(),
      playing,
      video,
    )
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: strings.browsing,
    buttons: [{ label: strings.buttonViewPage, url: href }],
  }
  applyMainBrowsingState(pathname, search, strings, presenceData)
  return presenceData
}

function cafeThumbnail(): string | undefined {
  return (
    backgroundImageFromElement(
      document.querySelector<HTMLElement>(SELECTORS.cafeThumbIcon),
    )
    ?? backgroundImageFromElement(
      document.querySelector<HTMLElement>(SELECTORS.cafeBgBlur),
    )
    ?? backgroundImageFromElement(
      document.querySelector<HTMLElement>('#cafe_player .videos'),
    )
  )
}

function handleCafe(strings: PresenceStrings, href: string): PresenceData {
  const title = normalizeText(
    document.querySelector(SELECTORS.cafeTitle)?.textContent,
  )
  const artist = normalizeText(
    document.querySelector(SELECTORS.cafeArtist)?.textContent,
  )
  const playing = !!document.querySelector(`${SELECTORS.cafePlayer}.playing`)

  if (title) {
    return listeningPresence(
      strings,
      href,
      title,
      artist || undefined,
      cafeThumbnail(),
      playing || !!title,
    )
  }

  return {
    largeImageKey: ActivityAssets.Logo,
    details: strings.browsing,
    state: 'Kiite Cafe',
    smallImageKey: Assets.Reading,
    buttons: [{ label: strings.buttonViewPage, url: href }],
  }
}

function handleCheck(strings: PresenceStrings, href: string): PresenceData {
  const title = normalizeText(
    document.querySelector(SELECTORS.checkTitle)?.textContent,
  )
  const artist = normalizeText(
    document.querySelector(SELECTORS.checkArtist)?.textContent,
  )
  const thumbEl = document.querySelector<HTMLImageElement>(SELECTORS.checkThumb)
  const thumbnail = thumbEl?.currentSrc || thumbEl?.src || undefined

  if (title) {
    return listeningPresence(
      strings,
      href,
      title,
      artist || undefined,
      thumbnail && !isPlaceholderThumbnail(thumbnail) ? thumbnail : undefined,
      true,
    )
  }

  return {
    largeImageKey: ActivityAssets.Logo,
    details: strings.browsing,
    state: 'Kiite Check',
    smallImageKey: Assets.Reading,
    buttons: [{ label: strings.buttonViewPage, url: href }],
  }
}

function handleWorld(strings: PresenceStrings, href: string): PresenceData {
  // World map / visit UI — prefer NP song text when the mini player is visible.
  const playerRoot
    = document.querySelector('.safe_player')
      ?? document.querySelector('[class*="player"]')
  const title = normalizeText(
    playerRoot?.querySelector('.title')?.textContent
    ?? document.querySelector('.video_info .title')?.textContent,
  )
  const artist = normalizeText(
    playerRoot?.querySelector('.artist')?.textContent
    ?? document.querySelector('.video_info .artist')?.textContent,
  )
  const thumb
    = backgroundImageFromElement(
      playerRoot?.querySelector<HTMLElement>('.thumbnail') ?? null,
    )
    ?? backgroundImageFromElement(
      document.querySelector<HTMLElement>('.video_info .thumbnail'),
    )

  if (title) {
    return listeningPresence(
      strings,
      href,
      title,
      artist || undefined,
      thumb,
      true,
    )
  }

  return {
    largeImageKey: ActivityAssets.Logo,
    details: strings.browsing,
    state: 'Kiite World',
    smallImageKey: Assets.Reading,
    buttons: [{ label: strings.buttonViewPage, url: href }],
  }
}

function handleRadar(strings: PresenceStrings, href: string): PresenceData {
  const selected = document.querySelector('.selected .title, .active .title, li.active')
  const title = normalizeText(selected?.textContent)

  return {
    largeImageKey: ActivityAssets.Logo,
    details: strings.browsing,
    state: title || 'Kiite Radar',
    smallImageKey: Assets.Reading,
    buttons: [{ label: strings.buttonViewPage, url: href }],
  }
}

function handleGenericHost(
  strings: PresenceStrings,
  href: string,
  hostname: string,
): PresenceData {
  const label = hostname.replace(/\.kiite\.jp$/, '') || 'Kiite'
  return {
    largeImageKey: ActivityAssets.Logo,
    details: strings.browsing,
    state: label === 'kiite' ? 'Kiite' : `Kiite ${label.charAt(0).toUpperCase()}${label.slice(1)}`,
    smallImageKey: Assets.Reading,
    buttons: [{ label: strings.buttonViewPage, url: href }],
  }
}

let strings: PresenceStrings | null = null
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const { pathname, href, search, hostname } = document.location
  const lang = await presence.getSetting<string>('lang').catch(() => 'en')
  if (oldLang !== lang || !strings) {
    oldLang = lang
    strings = await fetchStrings()
  }

  let presenceData: PresenceData

  switch (hostname) {
    case 'cafe.kiite.jp':
      presenceData = handleCafe(strings, href)
      break
    case 'check.kiite.jp':
      presenceData = handleCheck(strings, href)
      break
    case 'world.kiite.jp':
    case 'mobile.kiite.jp':
      presenceData = handleWorld(strings, href)
      break
    case 'radar.kiite.jp':
      presenceData = handleRadar(strings, href)
      break
    case 'kiite.jp':
    case 'www.kiite.jp':
      presenceData = handleMainSite(strings, href, pathname, search)
      break
    default:
      // Other *.kiite.jp hosts (doc, report, …) — generic browsing,
      // unless the main Kiite player markup is present on the page.
      presenceData = playerTitle()
        ? handleMainSite(strings, href, pathname, search)
        : handleGenericHost(strings, href, hostname)
      break
  }

  presence.setActivity(presenceData)
})
