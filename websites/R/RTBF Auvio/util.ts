import { ActivityType } from 'premid'

export const presence = new Presence({
  clientId: '1241444837476274268',
})

export const stringMap = {
  play: 'general.playing',
  pause: 'general.paused',
  search: 'general.search',
  searchSomething: 'general.searchSomething',
  searchFor: 'general.searchFor',
  browsing: 'general.browsing',
  privacy: 'general.privacy',
  viewAPage: 'general.viewAPage',
  viewAccount: 'general.viewAccount',
  viewCategory: 'general.viewCategory',
  viewHome: 'general.viewHome',
  buttonWatchMovie: 'general.buttonWatchMovie',
  buttonViewPage: 'general.buttonViewPage',
  buttonWatchVideo: 'general.buttonWatchVideo',
  buttonWatchSeries: 'general.buttonWatchSeries',
  buttonWatchStream: 'general.buttonWatchStream',
  watchingLive: 'general.watchingLive',
  watchingShow: 'general.watchingShow',
  watchingMovie: 'general.watchingMovie',
  live: 'general.live',
  listeningTo: 'general.listeningTo',
  waitingLive: 'general.waitingLive',
  // Custom strings
  ad: 'RTBFAuvio.ad',
  aPodcast: 'RTBFAuvio.aPodcast',
  aRadio: 'RTBFAuvio.aRadio',
  buttonViewCategory: 'RTBFAuvio.buttonViewCategory',
  buttonWatchProgram: 'RTBFAuvio.buttonWatchProgram',
  deferred: 'RTBFAuvio.deferred',
  endsIn: 'RTBFAuvio.endsIn',
  liveEnded: 'RTBFAuvio.liveEnded',
  on: 'RTBFAuvio.on',
  privatePlay: 'RTBFAuvio.privatePlay',
  toARadio: 'RTBFAuvio.toARadio',
  toAPodcast: 'RTBFAuvio.toAPodcast',
  startsIn: 'RTBFAuvio.startsIn',
}

// eslint-disable-next-line import/no-mutable-exports
export let strings: { [K in keyof typeof stringMap]: string }

let oldLang: string | null = null
let currentTargetLang: string | null = null
let fetchingStrings = false
let stringFetchId = 0
let stringFetchTimeout: ReturnType<typeof setTimeout> | null = null

function fetchStrings() {
  if (!currentTargetLang)
    return
  if (oldLang === currentTargetLang && strings)
    return
  if (fetchingStrings)
    return
  const targetLang = currentTargetLang
  const fetchId = ++stringFetchId
  fetchingStrings = true
  stringFetchTimeout = setTimeout(() => {
    presence.error(`Failed to fetch strings for ${targetLang}.`)
    fetchingStrings = false
    stringFetchTimeout = null
  }, 5e3)
  presence.info(`Fetching strings for ${targetLang}.`)
  presence
    .getStrings(stringMap)
    .then((result) => {
      if (fetchId !== stringFetchId)
        return
      if (stringFetchTimeout) {
        clearTimeout(stringFetchTimeout)
        stringFetchTimeout = null
      }
      fetchingStrings = false
      if (targetLang !== currentTargetLang) {
        fetchStrings()
        return
      }
      strings = result
      oldLang = targetLang
      presence.info(`Fetched strings for ${targetLang}.`)
    })
    .catch((err) => {
      if (fetchId !== stringFetchId)
        return
      // Ensure we always reset state and clear timeout on failure so subsequent attempts can run.
      if (stringFetchTimeout) {
        clearTimeout(stringFetchTimeout)
        stringFetchTimeout = null
      }
      fetchingStrings = false
      presence.error(`Error fetching strings for ${targetLang}: ${err?.message ?? err}`)
    })
}

setInterval(fetchStrings, 3000)

// Keep the last loaded strings while the selected language is loading.
export function updateStringLanguage(lang: string): boolean {
  currentTargetLang = lang
  // Trigger an immediate fetch when the language changes so callers don't have to wait for the interval.
  fetchStrings()
  return !!strings
}

const settingsFetchStatus: Record<string, number> = {}
const cachedSettings: Record<string, unknown> = {}

function startSettingGetter(setting: string) {
  if (!settingsFetchStatus[setting]) {
    let success = false
    settingsFetchStatus[setting] = setTimeout(() => {
      if (!success)
        presence.error(`Failed to fetch setting '${setting}' in time.`)
      delete settingsFetchStatus[setting]
    }, 2000)
    presence
      .getSetting(setting)
      .then((result) => {
        cachedSettings[setting] = result
        success = true
      })
      .catch(() => null)
  }
}

export function getSetting<E extends string | boolean | number>(
  setting: string,
  fallback: E | null = null,
): E {
  startSettingGetter(setting)
  return (cachedSettings[setting] as E) ?? fallback
}

export enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/0.png',
  Auvio = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/1.png',
  Binoculars = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/2.png',
  Privacy = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/3.png',
  Waiting = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/4.png',
  // Media
  ListeningPaused = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/5.png',
  ListeningVOD = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/6.gif',
  ListeningLive = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/7.gif',
  Deferred = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/8.png',
  DeferredAnimated = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/9.gif',
  LiveAnimated = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/10.gif',
  // Localized
  AdEn = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/11.png',
  AdFr = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/12.png',
  // Channels
  LaUne = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/13.png',
  LaDeux = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/14.png',
  Tipik = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/15.png',
  LaTrois = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/16.png',
  Classic21 = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/17.png',
  LaPremiere = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/18.png',
  Vivacite = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/19.png',
  Musiq3 = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/20.png',
  Tarmac = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/21.png',
  Jam = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/22.png',
  Viva = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/23.png',
  Vivasport = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/24.png',
  Ixpe = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/25.png',
  MediasProx = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/26.png',
  AB3 = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/27.png',
  ABXPLORE = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/28.png',
  FunRadio = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/29.png',
  NRJ = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/30.png',
  Arte = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/31.png',
  LN24 = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/32.png',
  BRUZZ = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/33.png',
  BRF = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/34.png',
  Kids = 'https://cdn.rcd.gg/PreMiD/websites/R/RTBF%20Auvio/assets/35.png',
}

export function getLocalizedAssets(
  lang: string,
  assetName: string,
): ActivityAssets {
  presence.info(`${lang}: ${assetName}`)
  switch (assetName) {
    case 'Ad':
      switch (lang) {
        case 'fr':
          return ActivityAssets.AdFr
        default:
          return ActivityAssets.AdEn
      }
    default:
      return ActivityAssets.Binoculars // Default fallback
  }
}

export function exist(selector: string): boolean {
  return document.querySelector(selector) !== null
}

const activeWarnings = new Set<string>()
const missingSince = new Map<string, number>()

export function warnMissing(key: string, missing: boolean, message: string) {
  if (!missing) {
    activeWarnings.delete(key)
    missingSince.delete(key)
    return
  }
  const firstMissing = missingSince.get(key) ?? Date.now()
  missingSince.set(key, firstMissing)
  if (Date.now() - firstMissing < 5000)
    return
  if (!activeWarnings.has(key)) {
    console.warn(`[RTBF Auvio] ${message} The presence may need an update to match the website.`)
    activeWarnings.add(key)
  }
}

export function resetWarnings() {
  activeWarnings.clear()
  missingSince.clear()
}

export function textOr(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export function decodeImageUrl(value: string): string {
  try {
    return decodeURIComponent(value.replace('/_next/image?url=', '').split('&w')[0] ?? '')
  }
  catch {
    warnMissing('image-url', true, 'An image URL could not be decoded; using the original URL.')
    return value
  }
}

export function parseSchedule(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number')
    return null
  const timestamp = new Date(value).getTime() / 1000
  return Number.isFinite(timestamp) ? timestamp : null
}

export function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/g, '')
    .replaceAll(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function getPreferredTitle(baseTitle: string, baseSubtitle: string, useOnlyLastBreadcrumb = false) {
  const detailSubtitle = getDomText('[class*=DetailsTitle_subtitle]', '')
  const playerSubtitle = getDomText('[class*=TitleDetails_subtitle]', '')
  const preferredSubtitle = baseSubtitle || detailSubtitle || playerSubtitle

  if (!baseTitle || !preferredSubtitle)
    return baseTitle

  const lastBreadcrumbTitle = getDomText('[aria-current="page"], [class*=Breadcrumb_breadcrumb] > ul > li:last-child > span', '')
  const detailTitle = getDomText('div[class*=DetailsTitle_title] > h1', '').replace(detailSubtitle, '')
  const playerTitle = getDomText('h1[class*=TitleDetails_title]', '')

  if (useOnlyLastBreadcrumb) {
    const normalizedBreadcrumb = normalizeTitle(lastBreadcrumbTitle)
    return normalizedBreadcrumb && [detailTitle, playerTitle, baseTitle].some(currentTitle => normalizeTitle(currentTitle) === normalizedBreadcrumb)
      ? preferredSubtitle
      : baseTitle
  }

  return [detailTitle, playerTitle, lastBreadcrumbTitle].some(currentTitle => normalizeTitle(currentTitle) === normalizeTitle(baseTitle))
    ? preferredSubtitle
    : baseTitle
}

export function clearTimestamps(data: PresenceData) {
  delete data.startTimestamp
  delete data.endTimestamp
}

export function getDomText(selector: string, fallback = ''): string {
  const element = document.querySelector(selector)
  const value = element?.textContent?.trim() ?? fallback

  if (element === null && fallback !== '') {
    presence.info(`[getDomText] fallback used for selector "${selector}" -> "${fallback}"`)
  }

  return value
}

export function getDomAttribute(selector: string, attribute: string, fallback = ''): string {
  return document.querySelector(selector)?.getAttribute(attribute)?.trim() ?? fallback
}

export async function safeGetThumbnail(url: string, preset: unknown, color: string | number[][] | undefined): Promise<string> {
  try {
    if (!url)
      return ActivityAssets.Logo
    const resolvedColor = color ?? '#ffcc00'
    return await getThumbnail(url, preset as never, resolvedColor)
  }
  catch (error) {
    console.warn(`[safeGetThumbnail] fallback used for "${url}"`, error)
    return ActivityAssets.Logo
  }
}

const failedMetadataUrls = new Set<string>()
const METADATA_CACHE_TTL = 15000
const METADATA_FAILURE_TTL = 5000
let cachedMetadata: { url: string, value: any, expiresAt: number } | null = null
const metadataInFlight = new Map<string, Promise<any>>()

export async function safeFetchMetadata(url: string): Promise<any> {
  if (cachedMetadata?.url === url && cachedMetadata.expiresAt > Date.now())
    return cachedMetadata.value

  const inFlight = metadataInFlight.get(url)
  if (inFlight)
    return inFlight

  const request = fetchMetadata(url)
  metadataInFlight.set(url, request)
  try {
    const value = await request
    cachedMetadata = { url, value, expiresAt: Date.now() + (value === null ? METADATA_FAILURE_TTL : METADATA_CACHE_TTL) }
    return value
  }
  finally {
    metadataInFlight.delete(url)
  }
}

async function fetchMetadata(url: string): Promise<any> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!response?.ok) {
      if (!failedMetadataUrls.has(url))
        console.warn(`[safeFetchMetadata] fallback used for "${url}" (status ${response?.status ?? 'unknown'})`)
      failedMetadataUrls.add(url)
      return null
    }

    const dataString = await response.text()
    if (!dataString) {
      if (!failedMetadataUrls.has(url))
        console.warn(`[safeFetchMetadata] fallback used for "${url}" (empty response body)`)
      failedMetadataUrls.add(url)
      return null
    }

    const data = JSON.parse(dataString)
    failedMetadataUrls.delete(url)
    return data
  }
  catch (error) {
    if (!failedMetadataUrls.has(url))
      console.warn(`[safeFetchMetadata] fallback used for "${url}"`, error)
    failedMetadataUrls.add(url)
    return null
  }
}

// Mainly used to truncate largeImageKeyText because the limit is 128 characters
export function limitText(input: string, maxLength = 128): string {
  const ellipsis = ' ...'

  if (input.length <= maxLength)
    return input

  let truncated = input.slice(0, maxLength - ellipsis.length)

  if (truncated.includes(' '))
    truncated = truncated.slice(0, truncated.lastIndexOf(' '))

  return truncated + ellipsis
}

export function formatDuration(time: unknown) {
  let totalSeconds: number

  if (typeof time === 'string') {
    const iso = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i.exec(time)
    const parts = /^\d+(?::\d+){1,2}$/.test(time) ? time.split(':').map(Number) : []
    if (iso && iso.slice(1).some(Boolean))
      totalSeconds = Number(iso[1] ?? 0) * 3600 + Number(iso[2] ?? 0) * 60 + Number(iso[3] ?? 0)
    else if (parts.length)
      totalSeconds = parts.reduce((total, part) => total * 60 + part, 0)
    else
      return ''
  }
  else if (typeof time === 'number') {
    totalSeconds = time
  }
  else {
    return ''
  }

  if (!Number.isFinite(totalSeconds) || totalSeconds < 0)
    return ''
  totalSeconds = Math.floor(totalSeconds)

  const weeks = Math.floor(totalSeconds / (7 * 24 * 3600))
  const days = Math.floor((totalSeconds % (7 * 24 * 3600)) / (24 * 3600))
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (weeks > 0) {
    return days > 0 ? `${weeks}s & ${days}j` : `${weeks}s`
  }
  else if (days > 0) {
    return hours > 0 ? `${days}j & ${hours}h` : `${days}d`
  }
  else if (hours > 0) {
    return minutes > 0 ? `${hours}h${minutes < 10 ? `0${minutes}` : minutes}` : `${hours}h`
  }
  else if (minutes > 0) {
    return `${minutes} min`
  }
  else {
    return `${seconds} sec`
  }
}

export function getColor(string: string) {
  const formattedString = string.toLowerCase().replaceAll(/[éè]/g, 'e').replaceAll(' ', '').replaceAll('-', '')
  const colorsMap = new Map<string, string | number[][]>([
    /* Plain color in hexadecimal ex: #ffaa00
    Gradient colors in RGB ex: [R, G, B, GradientOffset] */
    // Default colors
    ['', '#ffcc00'],
    ['default', '#ffcc00'],
    // Category colors
    ['series', '#b92561'],
    ['films', '#7e55a5'],
    [
      'animes',
      [
        [255, 226, 63, 0.2],
        [255, 9, 119, 0.5],
        [59, 124, 154, 0.75],
      ],
    ],
    ['sport', '#15c6a4'],
    ['info', '#109aa9'],
    ['kids', '#434b66'],
    ['documentaires', '#345a4a'],
    ['divertissement', '#444d90'],
    [
      'noirjaunebelge',
      [
        [7, 7, 7, 0.15],
        [198, 170, 34, 0.45],
        [194, 57, 57, 0.8],
      ],
    ],
    ['lifestyle', '#714e6e'],
    ['culture', '#863d67'],
    ['musique', '#4a6f6f'],
    [
      'lgbtqia+',
      [
        [228, 3, 3, 0],
        [255, 140, 0, 0.2],
        [255, 237, 0, 0.4],
        [0, 128, 38, 0.6],
        [0, 76, 255, 0.8],
        [115, 41, 130, 1],
      ],
    ],
    ['decodagemedias', '#b26e38'],
    ['archivessonuma', '#663c2a'],
    ['direct', '#e55232'],
    // Channel colors
    ['laune', '#ee372b'],
    ['tipik', '#0df160'],
    ['ladeux', '#ec088f'],
    ['latrois', '#9b49a1'],
    ['classic21', '#8d0282'],
    ['lapremiere', '#083e7a'],
    ['vivacite', '#f93308'],
    ['viva', '#f93308'],
    ['vivasport', '#f93308'],
    ['musiq3', '#d63c4d'],
    ['tarmac', '#222222'],
    ['jam', '#222222'],
    ['ixpe', '#f93308'],
    ['ab3', '#565656'],
    ['abxplore', '#268ca0'],
    ['ln24', '#094c5d'],
    ['funradio', '#ff087c'],
    ['nrj', '#e70815'],
    ['arte', '#f84c2f'],
    ['bruzz', '#ee2c40'],
    ['brf', '#00325f'],
    ['kids', '#f93308'],
    ['mediasproximite', '#07538b'],
  ])
  return colorsMap.get(formattedString) ?? colorsMap.get('')
}

interface ChannelInfo {
  channel: string
  type: ActivityType
  logo: ActivityAssets
  color: string | number[][]
  found: boolean
}

export function getChannel(channel: string): ChannelInfo {
  const channelFormatted = channel.toLowerCase().replaceAll(/[éè]/g, 'e').replaceAll('-', '').replaceAll(' ', '')
  switch (true) {
    case ['laune'].includes(channelFormatted): {
      return {
        channel: 'La Une',
        type: ActivityType.Watching,
        logo: ActivityAssets.LaUne,
        color: getColor('la une')!,
        found: true,
      }
    }
    case ['ladeux'].includes(channelFormatted): {
      return {
        channel: 'La Deux',
        type: ActivityType.Watching,
        logo: ActivityAssets.LaDeux,
        color: getColor('la deux')!,
        found: true,
      }
    }
    case ['tipik'].includes(channelFormatted): {
      return {
        channel: 'Tipik',
        type: ActivityType.Watching,
        logo: ActivityAssets.Tipik,
        color: getColor('tipik')!,
        found: true,
      }
    }
    case ['latrois'].includes(channelFormatted): {
      return {
        channel: 'La Trois',
        type: ActivityType.Watching,
        logo: ActivityAssets.LaTrois,
        color: getColor('la trois')!,
        found: true,
      }
    }
    case ['classic21', 'classic'].includes(channelFormatted): {
      return {
        channel: 'Classic 21',
        type: ActivityType.Listening,
        logo: ActivityAssets.Classic21,
        color: getColor('classic 21')!,
        found: true,
      }
    }
    case ['lapremiere'].includes(channelFormatted): {
      return {
        channel: 'La Première',
        type: ActivityType.Listening,
        logo: ActivityAssets.LaPremiere,
        color: getColor('la premiere')!,
        found: true,
      }
    }
    case ['vivacite'].includes(channelFormatted): {
      return {
        channel: 'Vivacité',
        type: ActivityType.Listening,
        logo: ActivityAssets.Vivacite,
        color: getColor('vivacite')!,
        found: true,
      }
    }
    case ['musiq3'].includes(channelFormatted): {
      return {
        channel: 'Musiq3',
        type: ActivityType.Listening,
        logo: ActivityAssets.Musiq3,
        color: getColor('musiq3')!,
        found: true,
      }
    }
    case ['tarmac'].includes(channelFormatted): {
      return {
        channel: 'Tarmac',
        type: ActivityType.Listening,
        logo: ActivityAssets.Tarmac,
        color: getColor('tarmac')!,
        found: true,
      }
    }
    case ['jam'].includes(channelFormatted): {
      return {
        channel: 'Jam',
        type: ActivityType.Listening,
        logo: ActivityAssets.Jam,
        color: getColor('jam')!,
        found: true,
      }
    }
    case ['viva'].includes(channelFormatted): {
      return {
        channel: 'Viva+',
        type: ActivityType.Listening,
        logo: ActivityAssets.Viva,
        color: getColor('viva')!,
        found: true,
      }
    }
    case ['ixpe'].includes(channelFormatted): {
      return {
        channel: 'Ixpé',
        type: ActivityType.Watching,
        logo: ActivityAssets.Ixpe,
        color: getColor('ixpe')!,
        found: true,
      }
    }
    case ['ab3'].includes(channelFormatted): {
      return {
        channel: 'AB3',
        type: ActivityType.Watching,
        logo: ActivityAssets.AB3,
        color: getColor('ab3')!,
        found: true,
      }
    }
    case ['abxplore'].includes(channelFormatted): {
      return {
        channel: 'ABXPLORE',
        type: ActivityType.Watching,
        logo: ActivityAssets.ABXPLORE,
        color: getColor('abxplore')!,
        found: true,
      }
    }
    case ['ln24'].includes(channelFormatted): {
      return {
        channel: 'LN24',
        type: ActivityType.Watching,
        logo: ActivityAssets.LN24,
        color: getColor('ln24')!,
        found: true,
      }
    }
    case ['funradio'].includes(channelFormatted): {
      return {
        channel: 'Fun Radio',
        type: ActivityType.Watching,
        logo: ActivityAssets.FunRadio,
        color: getColor('funradio')!,
        found: true,
      }
    }
    case ['nrj'].includes(channelFormatted): {
      return {
        channel: 'NRJ',
        type: ActivityType.Watching,
        logo: ActivityAssets.NRJ,
        color: getColor('nrj')!,
        found: true,
      }
    }
    case ['arte'].includes(channelFormatted): {
      return {
        channel: 'Arte',
        type: ActivityType.Watching,
        logo: ActivityAssets.Arte,
        color: getColor('arte')!,
        found: true,
      }
    }
    case ['bruzz'].includes(channelFormatted): {
      return {
        channel: 'BRUZZ',
        type: ActivityType.Watching,
        logo: ActivityAssets.BRUZZ,
        color: getColor('bruzz')!,
        found: true,
      }
    }
    case ['brf'].includes(channelFormatted): {
      return {
        channel: 'BRF',
        type: ActivityType.Watching,
        logo: ActivityAssets.BRF,
        color: getColor('brf')!,
        found: true,
      }
    }
    case ['kids'].includes(channelFormatted): {
      return {
        channel: 'RTBF Auvio',
        type: ActivityType.Watching,
        logo: ActivityAssets.Kids,
        color: getColor('kids')!,
        found: true,
      }
    }
    case [
      'mediasdeproximite',
      'antennecentre',
      'bx1',
      'bouke',
      'canalzoom',
      'matele',
      'notele',
      'rtc',
      'telemb',
      'telesambre',
      'tvcom',
      'tvlux',
      'vedia',
    ].includes(channelFormatted): {
      return {
        channel: 'Médias de proximité',
        type: ActivityType.Watching,
        logo: ActivityAssets.MediasProx,
        color: getColor('mediasproximite')!,
        found: true,
      }
    }
    default: {
      return {
        channel: 'RTBF Auvio',
        type: ActivityType.Watching,
        logo: ActivityAssets.Auvio,
        color: getColor('')!,
        found: false,
      }
    }
  }
}

export const cropPreset = {
  // Crop values in percent correspond to Left, Right, Top, Bottom.
  squared: [0, 0, 0, 0],
  vertical: [0.22, 0.22, 0, 0.3],
  horizontal: [0.425, 0.025, 0, 0],
}

// Simple in-memory cache for generated thumbnails to avoid re-fetching the
// same remote image repeatedly (and to dedupe concurrent requests).
const thumbnailCache: Map<string, { data: string, timestamp: number }> = new Map()
const thumbnailInFlight: Map<string, Promise<string>> = new Map()
const THUMBNAIL_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getThumbnail(
  src: string = ActivityAssets.Logo,
  cropPercentages: typeof cropPreset.squared = cropPreset.squared, // Left, Right, top, Bottom
  borderColor: string | number[][] = getColor('')!,
  borderWidth = 15,
  progress = 2,
): Promise<string> {
  if (!src)
    return ActivityAssets.Logo
  // Use cache key based on src + crop settings + border/progress so variations
  // produce different thumbnails.
  const cacheKey = `${src}|${JSON.stringify(cropPercentages)}|${JSON.stringify(borderColor)}|${borderWidth}|${progress}`

  // Return cached thumbnail if still valid
  const cached = thumbnailCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < THUMBNAIL_CACHE_TTL)
    return cached.data

  // If a generation is already in-flight for this key, return the same promise
  const inFlight = thumbnailInFlight.get(cacheKey)
  if (inFlight)
    return inFlight

  if (!src.match('data:image')) {
    const generationPromise = new Promise<string>((complete) => {
      const timeout = setTimeout(() => {
        console.warn('[RTBF Auvio] Artwork took too long to load; using the default logo.')
        complete(ActivityAssets.Logo)
      }, 10000)
      const resolve = (value: string) => {
        clearTimeout(timeout)
        complete(value)
      }
      const img = new Image()
      const wh = 320 // Size of the square thumbnail

      // Function: Process the image once loaded
      const processImage = (loadedImg: HTMLImageElement) => {
        let croppedWidth
        let croppedHeight
        let cropX = 0
        let cropY = 0

        // Determine if the image is landscape or portrait
        const isLandscape = loadedImg.width > loadedImg.height

        if (isLandscape) {
        // Landscape mode: use left and right crop percentages
          const cropLeft = loadedImg.width * cropPercentages[0]!
          croppedWidth = loadedImg.width - cropLeft - loadedImg.width * cropPercentages[1]!
          croppedHeight = loadedImg.height
          cropX = cropLeft
        }
        else {
        // Portrait mode: use top and bottom crop percentages
          const cropTop = loadedImg.height * cropPercentages[2]!
          croppedWidth = loadedImg.width
          croppedHeight = loadedImg.height - cropTop - loadedImg.height * cropPercentages[3]!
          cropY = cropTop
        }

        // Determine the scale to fit the cropped image into the square canvas
        let newWidth, newHeight, offsetX, offsetY

        if (isLandscape) {
          newWidth = wh - 2 * borderWidth
          newHeight = (newWidth / croppedWidth) * croppedHeight
          offsetX = borderWidth
          offsetY = (wh - newHeight) / 2
        }
        else {
          newHeight = wh - 2 * borderWidth
          newWidth = (newHeight / croppedHeight) * croppedWidth
          offsetX = (wh - newWidth) / 2
          offsetY = borderWidth
        }

        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = wh
        tempCanvas.height = wh
        const ctx = tempCanvas.getContext('2d')!
        // Remap progress from 0-1 to 0.03-0.97
        const remappedProgress = 0.07 + progress * (0.93 - 0.07)

        // 1. Fill the canvas with a black background
        ctx.fillStyle = '#080808'
        ctx.fillRect(0, 0, wh, wh)

        // 2. Draw the radial progress bar
        if (remappedProgress > 0) {
          ctx.beginPath()
          ctx.moveTo(wh / 2, wh / 2)
          const startAngle = Math.PI / 4 // 45 degrees in radians, starting from bottom-right

          ctx.arc(
            wh / 2,
            wh / 2,
            wh,
            startAngle,
            startAngle + 2 * Math.PI * remappedProgress,
          )
          ctx.lineTo(wh / 2, wh / 2)

          if (Array.isArray(borderColor)) {
          // Create a triangular gradient
            const gradient = ctx.createLinearGradient(0, 0, wh, wh)
            for (const colorStep of borderColor) {
              gradient.addColorStop(
                colorStep[3]!, // Use the fourth value as the step position
                `rgba(${colorStep[0]}, ${colorStep[1]}, ${colorStep[2]}, 1)`, // Use RGB, alpha fixed at 1
              )
            }
            ctx.fillStyle = gradient
          }
          else {
          // borderColor for the border
            ctx.fillStyle = borderColor
          }

          ctx.fill()
        }

        // 3. Draw the cropped image centered and zoomed out based on the borderWidth
        try {
          ctx.drawImage(
            loadedImg,
            cropX,
            cropY,
            croppedWidth,
            croppedHeight,
            offsetX,
            offsetY,
            newWidth,
            newHeight,
          )
          resolve(tempCanvas.toDataURL('image/png'))
        }
        catch (error) {
          presence.error(`Failed to draw image on canvas: ${error}`)
          resolve(ActivityAssets.Logo)
        }
      }

      // Strategy 1: Try with CORS first (for ds.static.rtbf.be)
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          processImage(img)
        }
        catch (error) {
          console.warn('[RTBF Auvio] Could not prepare artwork; using the default logo.', error)
          resolve(ActivityAssets.Logo)
        }
      }

      img.onerror = () => {
        // Strategy 2: Try loading the image without CORS.
        const fallbackImg = new Image()
        fallbackImg.onload = () => {
          presence.error('CORS failed — using original URL fallback (cannot process to canvas)')

          resolve(src)
        }
        fallbackImg.onerror = () => {
          presence.error('Both CORS and direct image load failed, returning placeholder')
          resolve(ActivityAssets.Logo)
        }
        // Do not set crossOrigin here (leave undefined) so the browser performs a normal, non-CORS request.
        fallbackImg.src = src
      }

      img.src = src
    })

    // Store in-flight promise so concurrent callers reuse it
    thumbnailInFlight.set(cacheKey, generationPromise)

    // When completed, cache the result and remove in-flight entry
    generationPromise.then((data) => {
      thumbnailInFlight.delete(cacheKey)
      thumbnailCache.set(cacheKey, { data, timestamp: Date.now() })
    }).catch(() => {
      thumbnailInFlight.delete(cacheKey)
    })

    return generationPromise
  }
  else {
    return src
  }
}
