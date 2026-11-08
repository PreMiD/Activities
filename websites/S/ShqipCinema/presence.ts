import { ActivityType, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1444429479438188685',
})

const BASE_URL = 'https://shqipcinema.org'
const LOGO_URL = `${BASE_URL}/wp-content/uploads/fbrfg/apple-touch-icon.png`

interface IFrameData {
  frameUrl?: string
  video?: {
    found?: boolean
    paused?: boolean
    ended?: boolean
    currentTime?: number
    duration?: number
    readyState?: number
  }
}

interface WatchInfo {
  title: string
  episodeNumber?: string
  episodeTitle?: string
  isMovie: boolean
  cover?: string
  animeUrl?: string
}

type PlaybackStatus = 'playing' | 'paused' | 'ended' | 'unknown'

const iFrameDataByUrl = new Map<string, IFrameData & { receivedAt: number }>()
let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPathname = document.location.pathname

presence.on('iFrameData', (data: IFrameData) => {
  const frameKey = data.frameUrl || 'unknown-frame'
  iFrameDataByUrl.set(frameKey, { ...data, receivedAt: Date.now() })
})

function cleanText(value?: string | null): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function truncate(value: string, maxLength = 128): string {
  const cleaned = cleanText(value)
  return cleaned.length <= maxLength ? cleaned : `${cleaned.slice(0, Math.max(0, maxLength - 1)).trim()}…`
}

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/'
}

function normalizeForCompare(value: string): string {
  return cleanText(value)
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function dedupeExactRepeatedTitle(value: string): string {
  const words = cleanText(value).split(' ')
  if (words.length < 2 || words.length % 2 !== 0)
    return cleanText(value)

  const half = words.length / 2
  const first = words.slice(0, half).join(' ')
  const second = words.slice(half).join(' ')
  return normalizeForCompare(first) === normalizeForCompare(second) ? first : cleanText(value)
}

function getHeading(): string {
  return cleanText(document.querySelector('h1')?.textContent)
}

function getEpisodeNumber(heading: string): string | undefined {
  const headingMatch = heading.match(/\b(?:Episodi|Episode)\s*(\d+(?:[.,]\d+)?)/i)
  if (headingMatch?.[1])
    return headingMatch[1].replace(',', '.')

  const pathMatch = document.location.pathname.match(/(?:episode|episodi)-(\d+(?:-\d+)?)(?:\/|$)/i)
  if (pathMatch?.[1])
    return pathMatch[1].replace('-', '.')

  return undefined
}

function getTitleFromWatchHeading(heading: string, episodeNumber?: string): string {
  if (!episodeNumber)
    return dedupeExactRepeatedTitle(heading)

  const episodeLabel = heading.match(/\s+(?:Episodi|Episode)\s*\d+(?:[.,]\d+)?/i)
  const stripped = episodeLabel?.index === undefined ? heading : heading.slice(0, episodeLabel.index)
  return dedupeExactRepeatedTitle(cleanText(stripped) || heading)
}

function getCurrentEpisodeTitle(episodeNumber: string): string | undefined {
  const currentPath = normalizePath(document.location.pathname)
  const escapedEpisode = episodeNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const titlePattern = new RegExp(`^${escapedEpisode}\\s+(.+)$`, 'i')

  for (const anchor of Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    try {
      const url = new URL(anchor.href, document.location.href)
      if (normalizePath(url.pathname) !== currentPath)
        continue

      const text = cleanText(anchor.textContent)
      const match = text.match(titlePattern)
      if (match?.[1])
        return cleanText(match[1])
    }
    catch {
      // Ignore malformed links.
    }
  }

  return undefined
}

function getImageUrl(image?: HTMLImageElement | null): string | undefined {
  if (!image)
    return undefined

  // Prefer the original lazy-load source. On ShqipCinema this is the wanted
  // 448x631 poster, while currentSrc may pick a smaller srcset candidate.
  const candidates = [
    image.dataset.src,
    image.getAttribute('data-src'),
    image.src,
    image.currentSrc,
  ]

  for (const candidate of candidates) {
    if (!candidate)
      continue

    try {
      const url = new URL(candidate, document.location.href)
      if (url.protocol === 'http:' || url.protocol === 'https:')
        return url.href
    }
    catch {
      // Try the next candidate.
    }
  }

  return undefined
}

function getPoster(title: string): string | undefined {
  const normalizedTitle = normalizeForCompare(title)
  const posterImages = Array.from(
    document.querySelectorAll<HTMLImageElement>('img[alt*="me titra shqip" i], img[alt*="dubluar" i]'),
  )

  const best = posterImages.find((image) => {
    const alt = normalizeForCompare(image.alt)
    return normalizedTitle.length > 0 && (alt.includes(normalizedTitle) || normalizedTitle.includes(alt))
  }) ?? posterImages[0]

  const poster = getImageUrl(best)
  if (poster)
    return poster

  const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"], meta[name="twitter:image"]')?.content
  if (ogImage) {
    try {
      const url = new URL(ogImage, document.location.href)
      if (url.protocol === 'http:' || url.protocol === 'https:')
        return url.href
    }
    catch {
      // No usable cover image.
    }
  }

  return undefined
}

function getAnimePagePoster(): string | undefined {
  // Use only the real 2:3 poster on /anime/ pages, never the large hero cover.
  const mainPoster = document.querySelector<HTMLImageElement>('img.anime-main-image')
  return getImageUrl(mainPoster)
}

function getAnimeUrl(title: string): string | undefined {
  const wanted = normalizeForCompare(title)
  if (!wanted)
    return undefined

  let fallback: string | undefined

  for (const anchor of Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/anime/"]'))) {
    try {
      const url = new URL(anchor.href, document.location.href)
      if (url.hostname !== document.location.hostname)
        continue

      fallback ??= url.href
      const text = normalizeForCompare(dedupeExactRepeatedTitle(cleanText(anchor.textContent)))
      if (text && (text.includes(wanted) || wanted.includes(text)))
        return url.href
    }
    catch {
      // Ignore malformed links.
    }
  }

  return fallback
}

function getWatchInfo(): WatchInfo | undefined {
  const heading = getHeading()
  if (!heading)
    return undefined

  const episodeNumber = getEpisodeNumber(heading)
  const title = getTitleFromWatchHeading(heading, episodeNumber)
  const bodyText = cleanText(document.body.textContent)
  const isMovie = !episodeNumber && /\bMOVIE\b/i.test(bodyText)

  return {
    title,
    episodeNumber,
    episodeTitle: episodeNumber ? getCurrentEpisodeTitle(episodeNumber) : undefined,
    isMovie,
    cover: getPoster(title),
    animeUrl: getAnimeUrl(title),
  }
}

function getAnimePageTitle(): string {
  return dedupeExactRepeatedTitle(getHeading())
}

function getWatchNowUrl(): string | undefined {
  const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/watch/"]'))
  const preferred = anchors.find(anchor => /\b(?:Shiko Tani|Watch Now)\b/i.test(cleanText(anchor.textContent)))
  const anchor = preferred ?? anchors[0]
  if (!anchor)
    return undefined

  try {
    return new URL(anchor.href, document.location.href).href
  }
  catch {
    return undefined
  }
}

function getActiveIFrameData(): IFrameData {
  const now = Date.now()
  const activeEntries: Array<IFrameData & { receivedAt: number }> = []

  for (const [frameUrl, data] of iFrameDataByUrl) {
    if (now - data.receivedAt > 8_000) {
      iFrameDataByUrl.delete(frameUrl)
      continue
    }

    if (data.video?.found)
      activeEntries.push(data)
  }

  if (!activeEntries.length)
    return {}

  activeEntries.sort((a, b) => {
    const aPlaying = a.video?.paused === false && a.video?.ended !== true ? 1 : 0
    const bPlaying = b.video?.paused === false && b.video?.ended !== true ? 1 : 0

    if (aPlaying !== bPlaying)
      return bPlaying - aPlaying

    return b.receivedAt - a.receivedAt
  })

  return activeEntries[0] ?? {}
}

function isPrivateOrAdminPath(pathname: string): boolean {
  return /^\/(?:wp-admin(?:\/|$)|wp-login\.php(?:\/|$)|wp-json(?:\/|$)|wp-cron\.php(?:\/|$)|xmlrpc\.php(?:\/|$))/i.test(pathname)
}

function setBrandImage(presenceData: PresenceData, text = 'ShqipCinema'): void {
  presenceData.smallImageKey = LOGO_URL
  presenceData.smallImageText = text
  presenceData.smallImageUrl = document.location.href
}

function setGenericBrowsingPresence(presenceData: PresenceData, privatePage = false): void {
  presenceData.details = 'Duke shfletuar ShqipCinema'
  presenceData.state = 'Anime & filma në shqip'
  presenceData.startTimestamp = browsingTimestamp
  presenceData.largeImageKey = LOGO_URL
  presenceData.largeImageText = 'ShqipCinema'

  if (!privatePage) {
    presenceData.detailsUrl = document.location.href
    presenceData.largeImageUrl = document.location.href
  }
}

function applyPlaybackState(presenceData: PresenceData, showPlaybackTimer: boolean): PlaybackStatus {
  const video = getActiveIFrameData().video
  const hasUsableVideo = Boolean(video?.found)

  if (!hasUsableVideo) {
    setBrandImage(presenceData, 'ShqipCinema • Duke parë')
    return 'unknown'
  }

  if (video?.ended) {
    setBrandImage(presenceData, 'ShqipCinema • Përfundoi')
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
    return 'ended'
  }

  if (video?.paused) {
    setBrandImage(presenceData, 'ShqipCinema • Në pauzë')
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
    return 'paused'
  }

  setBrandImage(presenceData, 'ShqipCinema • Duke parë')

  if (showPlaybackTimer) {
    const currentTime = video?.currentTime
    const duration = video?.duration
    if (
      typeof currentTime === 'number'
      && Number.isFinite(currentTime)
      && currentTime >= 0
      && typeof duration === 'number'
      && Number.isFinite(duration)
      && duration > 0
      && currentTime <= duration
    ) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
    }
  }

  return 'playing'
}

function getPlaybackSymbol(status: PlaybackStatus): string {
  if (status === 'paused')
    return '⏸'
  if (status === 'ended')
    return '✓'
  return '▶'
}

presence.on('UpdateData', async () => {
  const pathname = document.location.pathname
  if (pathname !== lastPathname) {
    lastPathname = pathname
    iFrameDataByUrl.clear()
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }

  const [
    showBrowsing,
    showCover,
    showPlaybackTimer,
    showEpisodeTitle,
    showButtons,
  ] = await Promise.all([
    presence.getSetting<boolean>('showBrowsing'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showPlaybackTimer'),
    presence.getSetting<boolean>('showEpisodeTitle'),
    presence.getSetting<boolean>('showButtons'),
  ])

  const presenceData: PresenceData = {
    name: 'ShqipCinema',
    type: ActivityType.Watching,
    largeImageKey: LOGO_URL,
  }

  // Never expose WordPress/admin page names, plugin screens, query strings or
  // admin URLs in Discord. These routes intentionally collapse to a generic state.
  if (isPrivateOrAdminPath(pathname)) {
    setGenericBrowsingPresence(presenceData, true)
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/watch/')) {
    const info = getWatchInfo()
    if (!info) {
      presence.clearActivity()
      return
    }

    const currentUrl = document.location.href

    // Discord's collapsed activity row becomes: Watching <anime title>.
    // Keep ShqipCinema branding in the images/text, not as the media name.
    presenceData.name = truncate(info.title)

    if (showCover && info.cover)
      presenceData.largeImageKey = info.cover

    presenceData.details = truncate(info.title)
    presenceData.detailsUrl = currentUrl
    presenceData.largeImageUrl = info.animeUrl ?? currentUrl

    const playbackStatus = applyPlaybackState(presenceData, showPlaybackTimer)
    const symbol = getPlaybackSymbol(playbackStatus)

    if (info.episodeNumber) {
      const episodeInfo = showEpisodeTitle && info.episodeTitle
        ? `Episodi ${info.episodeNumber} • ${info.episodeTitle}`
        : `Episodi ${info.episodeNumber}`

      presenceData.state = truncate(`${symbol} ${episodeInfo}`)
      presenceData.stateUrl = currentUrl
      presenceData.largeImageText = truncate(`${info.title} • Episodi ${info.episodeNumber}`)
    }
    else {
      // Do not use the visible "MOVIE 24M" badge as a runtime: on ShqipCinema
      // that value can represent views/other metadata rather than movie duration.
      presenceData.state = `${symbol} Film`
      presenceData.stateUrl = currentUrl
      presenceData.largeImageText = truncate(info.title)
    }

    const buttons: { label: string, url: string }[] = [
      {
        label: info.episodeNumber ? 'Shiko episodin' : 'Shiko filmin',
        url: currentUrl,
      },
    ]

    if (info.animeUrl && normalizePath(new URL(info.animeUrl).pathname) !== normalizePath(pathname)) {
      buttons.push({
        label: 'Detajet e anime-s',
        url: info.animeUrl,
      })
    }

    if (showButtons)
      presenceData.buttons = buttons.slice(0, 2) as NonNullable<PresenceData['buttons']>
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/anime/')) {
    const title = getAnimePageTitle()
    if (!title) {
      presence.clearActivity()
      return
    }

    const currentUrl = document.location.href
    presenceData.name = truncate(title)
    presenceData.details = truncate(title)
    presenceData.detailsUrl = currentUrl
    presenceData.state = 'Duke parë detajet e anime-s'
    presenceData.stateUrl = currentUrl
    presenceData.startTimestamp = browsingTimestamp
    presenceData.largeImageText = truncate(title)
    presenceData.largeImageUrl = currentUrl
    setBrandImage(presenceData, 'ShqipCinema')

    if (showCover) {
      const cover = getAnimePagePoster()
      if (cover)
        presenceData.largeImageKey = cover
    }

    const buttons: { label: string, url: string }[] = [
      {
        label: 'Hap anime-n',
        url: currentUrl,
      },
    ]

    const watchUrl = getWatchNowUrl()
    if (watchUrl) {
      buttons.push({
        label: 'Shiko tani',
        url: watchUrl,
      })
    }

    if (showButtons)
      presenceData.buttons = buttons.slice(0, 2) as NonNullable<PresenceData['buttons']>
    presence.setActivity(presenceData)
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  setGenericBrowsingPresence(presenceData)
  const pageTitle = cleanText(document.title.replace(/\s*[|–-]\s*ShqipCinema.*$/i, ''))
  if (pageTitle && normalizeForCompare(pageTitle) !== 'shqipcinema')
    presenceData.state = truncate(pageTitle)

  presence.setActivity(presenceData)
})
