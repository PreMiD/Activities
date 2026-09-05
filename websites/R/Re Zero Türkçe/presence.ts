import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1508449680340549835',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
const homeUrl = 'https://www.rezeroturkce.com/'
const serviceName = 'Re:Zero Türkçe'
let pageTimestamp = browsingTimestamp
let previousUrl = document.location.href

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Re%20Zero%20T%C3%BCrk%C3%A7e/assets/logo.png',
}

const storySections = new Set(['ana-hikaye', 'if-hikayeleri', 'yan-hikayeler'])
const storySectionLabels: Record<string, string> = {
  'ana-hikaye': 'Ana Hikâye',
  'if-hikayeleri': 'IF Hikâyesi',
  'yan-hikayeler': 'Yan Hikâye',
}

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

function updatePageTimestamp(): void {
  if (previousUrl !== document.location.href) {
    previousUrl = document.location.href
    pageTimestamp = nowInSeconds()
  }
}

function cleanText(value: string | null | undefined, fallback = '', maxLength = 128): string {
  const text = Array.from(value ?? '', (char) => {
    const code = char.charCodeAt(0)

    return code <= 31 || code === 127 ? ' ' : char
  })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()

  return (text || fallback).slice(0, maxLength)
}

function cleanQuotedText(value: string | null | undefined, fallback = '', maxLength = 128): string {
  return cleanText(value, fallback, maxLength).replace(/^["“”„«»]+|["“”„«»]+$/g, '').trim()
}

function splitEpisodeTitle(title: string): { main: string, subtitle?: string } {
  const separator = [' – ', ' - '].find(value => title.includes(value))

  if (!separator)
    return { main: title }

  const separatorIndex = title.indexOf(separator)

  return {
    main: cleanText(title.slice(0, separatorIndex), title),
    subtitle: cleanQuotedText(title.slice(separatorIndex + separator.length)),
  }
}

function getMetaContent(selector: string): string {
  return cleanText(document.querySelector<HTMLMetaElement>(selector)?.content)
}

function getTitle(preferMeta = false): string {
  const h1 = cleanText(document.querySelector('h1')?.textContent)
  const ogTitle = getMetaContent('meta[property="og:title"]')
  const title = cleanText(document.title.replace(/\s*\|\s*Re:Zero Türkçe.*$/i, ''))

  if (preferMeta)
    return cleanText(ogTitle || h1 || title || serviceName)

  return cleanText(h1 || ogTitle || title || serviceName)
}

function isOwnHost(hostname: string): boolean {
  return hostname === 'rezeroturkce.com' || hostname.endsWith('.rezeroturkce.com')
}

function getSafeUrl(rawUrl: string | null | undefined, allowSubdomains = false): string | undefined {
  if (!rawUrl)
    return undefined

  try {
    const url = new URL(rawUrl, homeUrl)

    if (url.protocol !== 'https:')
      return undefined
    if (allowSubdomains ? !isOwnHost(url.hostname) : url.hostname !== 'www.rezeroturkce.com' && url.hostname !== 'rezeroturkce.com')
      return undefined

    return url.href
  }
  catch {
    return undefined
  }
}

function getCurrentUrl(): string {
  const canonicalUrl = getSafeUrl(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href)
  const currentUrl = getSafeUrl(document.location.href)

  return canonicalUrl ?? currentUrl ?? homeUrl
}

function getLargeImage(): string {
  return getSafeUrl(document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content, true) ?? ActivityAssets.Logo
}

function getButtons(pageLabel: string): PresenceData['buttons'] {
  const buttons: PresenceData['buttons'] = [
    {
      label: 'Siteye Git',
      url: homeUrl,
    },
  ]
  const currentUrl = getCurrentUrl()

  if (currentUrl !== homeUrl) {
    buttons.push({
      label: cleanText(pageLabel, 'Bulunduğu Sayfa', 32),
      url: currentUrl,
    })
  }

  return buttons
}

function getLinkData(): { detailsUrl: string, stateUrl: string, largeImageUrl: string } {
  const currentUrl = getCurrentUrl()

  return {
    detailsUrl: currentUrl,
    stateUrl: currentUrl,
    largeImageUrl: currentUrl,
  }
}

function getPathSegments(): string[] {
  return document.location.pathname.split('/').filter(Boolean)
}

function getStorySectionName(segments = getPathSegments()): string {
  const section = segments[0]

  return section ? storySectionLabels[section] ?? 'Hikâye' : 'Hikâye'
}

function getVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>('#artplayer-app video.art-video, #artplayer-app video, video.art-video, video')
}

function getAnimeEpisodeImage(): string {
  const currentUrl = getCurrentUrl()
  const currentEpisodeLink = Array
    .from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/anime-izle/"]'))
    .find(link => getSafeUrl(link.href) === currentUrl)
  const imageUrl = getSafeUrl(currentEpisodeLink?.querySelector<HTMLImageElement>('img[src]')?.src, true)

  return imageUrl ?? getLargeImage()
}

function getAnimeEpisodeParts(): { main: string, subtitle?: string } {
  const title = getTitle()
  const h1 = document.querySelector('h1')
  const subtitle = cleanQuotedText(h1?.nextElementSibling?.textContent, '', 80)

  if (subtitle)
    return { main: title, subtitle }

  const currentUrl = getCurrentUrl()
  const currentEpisodeLink = Array
    .from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/anime-izle/"]'))
    .find(link => getSafeUrl(link.href) === currentUrl)
  const linkText = cleanText(currentEpisodeLink?.textContent)
  const quotedTitle = linkText.match(/["“]([^"”]+)["”]/)?.[1]

  return quotedTitle ? { main: title, subtitle: cleanQuotedText(quotedTitle) } : { main: title }
}

function getVideoTimestamps(video: HTMLVideoElement): [number, number] | undefined {
  if (video.paused || !Number.isFinite(video.currentTime) || !Number.isFinite(video.duration) || video.duration <= 0)
    return undefined

  const currentTime = Math.max(0, video.currentTime)
  const duration = Math.max(currentTime, video.duration)
  const now = nowInSeconds()

  return [Math.floor(now - currentTime), Math.floor(now + duration - currentTime)]
}

function isStoryReadingPage(segments: string[]): boolean {
  if (segments.length <= 1)
    return false
  if (segments[0] === 'ana-hikaye')
    return segments.some(segment => /^bolum-\d+/i.test(segment)) || segments.length > 2

  return segments[1] !== 'page'
}

function isContentPage(segments: string[]): boolean {
  return segments.length > 1 && segments[1] !== 'page'
}

function buildChoosingPresence(details: string, state = 'Bölüm seçiyor...', includeServiceName = true): PresenceData {
  return {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: serviceName,
    details: includeServiceName ? `${serviceName} - ${details}` : details,
    state,
    startTimestamp: pageTimestamp,
    buttons: getButtons('Bulunduğu Sayfa'),
    ...getLinkData(),
  }
}

function buildStoryPresence(segments: string[]): PresenceData {
  const title = splitEpisodeTitle(getTitle())

  return {
    type: ActivityType.Watching,
    largeImageKey: getLargeImage(),
    largeImageText: serviceName,
    details: title.main,
    state: title.subtitle ?? getStorySectionName(segments),
    startTimestamp: pageTimestamp,
    buttons: getButtons('Bölümü Oku'),
    ...getLinkData(),
  }
}

function buildMangaPresence(): PresenceData {
  const title = getTitle()

  return {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: serviceName,
    details: title,
    state: 'Manga',
    startTimestamp: pageTimestamp,
    buttons: getButtons('Mangayı Oku'),
    ...getLinkData(),
  }
}

function buildAnimePresence(): PresenceData {
  const video = getVideo()
  const episode = getAnimeEpisodeParts()
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: getAnimeEpisodeImage(),
    largeImageText: serviceName,
    details: episode.main,
    state: episode.subtitle ?? 'Anime',
    buttons: getButtons('Bölümü İzle'),
    ...getLinkData(),
  }

  if (!video)
    return presenceData

  const timestamps = getVideoTimestamps(video)

  if (timestamps) {
    ;[presenceData.startTimestamp, presenceData.endTimestamp] = timestamps
  }

  return presenceData
}

function buildFallbackPresence(): PresenceData {
  const isHome = new URL(getCurrentUrl()).href === homeUrl
  const details = isHome ? 'Sitede geziniyor...' : getTitle()

  return {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: serviceName,
    details,
    startTimestamp: browsingTimestamp,
    buttons: getButtons('Bulunduğu Sayfa'),
    ...getLinkData(),
  }
}

presence.on('UpdateData', async () => {
  updatePageTimestamp()

  const segments = getPathSegments()
  const section = segments[0] ?? ''
  let presenceData: PresenceData

  if (storySections.has(section)) {
    presenceData = isStoryReadingPage(segments) ? buildStoryPresence(segments) : buildChoosingPresence(getStorySectionName(segments))
  }
  else if (section === 'manga') {
    presenceData = isContentPage(segments) ? buildMangaPresence() : buildChoosingPresence('Manga Kütüphanesi', 'Seçim yapıyor...')
  }
  else if (section === 'mangalar' || section === 'tum-mangalar') {
    presenceData = buildChoosingPresence('Manga Kütüphanesi', 'Seçim yapıyor...')
  }
  else if (section === 'anime-izle') {
    presenceData = isContentPage(segments) ? buildAnimePresence() : buildChoosingPresence('Anime Kütüphanesi', 'Seçim yapıyor...')
  }
  else if (section === 'animeler' || section === 'anime-kutuphanesi') {
    presenceData = buildChoosingPresence('Anime Kütüphanesi', 'Seçim yapıyor...')
  }
  else {
    presenceData = buildFallbackPresence()
  }

  presence.setActivity(presenceData)
})
