import { ActivityType } from 'premid'

export const presence = new Presence({
  clientId: '1240716875927916616',
})

export const stringMap = {
  play: 'general.playing',
  pause: 'general.paused',
  search: 'general.search',
  searchFor: 'general.searchFor',
  searchSomething: 'general.searchSomething',
  browsing: 'general.browsing',
  viewAPage: 'general.viewAPage',
  viewHome: 'general.viewHome',
  viewCategory: 'general.viewCategory',
  viewList: 'netflix.viewList',
  buttonViewPage: 'general.buttonViewPage',
  watchingAd: 'youtube.ad',
  watchingLive: 'general.watchingLive',
  watchingShow: 'general.watchingShow',
  watchingMovie: 'general.watchingMovie',
  listeningMusic: 'general.listeningMusic',
  buttonWatchStream: 'general.buttonWatchStream',
  buttonWatchEpisode: 'general.buttonViewEpisode',
  buttonWatchMovie: 'general.buttonWatchMovie',
  buttonListenAlong: 'general.buttonListenAlong',
  live: 'general.live',
  season: 'general.season',
  episode: 'general.episode',

  deferred: 'RTBFAuvio.deferred',
  privacy: 'RTBFAuvio.privatePlay',
  on: 'RTBFAuvio.on',
  watchingLiveMusic: 'RTLplay.LiveMusic',
  movie: 'RTLplay.movie',
  tvshow: 'RTLplay.tvshow',
  watchingAProgramOrSeries: 'RTLplay.AProgramOrSeries',

}

// eslint-disable-next-line import/no-mutable-exports
export let strings: Awaited<
  typeof stringMap
>

let oldLang: string | null = null
let currentTargetLang: string | null = null
let fetchingStrings = false
let stringFetchTimeout: number | null = null

function fetchStrings() {
  if (oldLang === currentTargetLang && strings)
    return
  if (fetchingStrings)
    return
  const targetLang = currentTargetLang
  fetchingStrings = true
  stringFetchTimeout = setTimeout(() => {
    presence.error(`Failed to fetch strings for ${targetLang}.`)
    fetchingStrings = false
  }, 5e3)
  presence.info(`Fetching strings for ${targetLang}.`)
  presence
    .getStrings(stringMap)
    .then((result) => {
      if (targetLang !== currentTargetLang)
        return
      if (stringFetchTimeout)
        clearTimeout(stringFetchTimeout)
      strings = result
      fetchingStrings = false
      oldLang = targetLang
      presence.info(`Fetched strings for ${targetLang}.`)
    })
    .catch(() => null)
}

setInterval(fetchStrings, 3000)
fetchStrings()

// Sets the current language to fetch strings for and returns whether any strings are loaded.
export function checkStringLanguage(lang: string): boolean {
  currentTargetLang = lang
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

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/logo.png',
  Animated = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/0.gif',
  Binoculars = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/13.png',
  Privacy = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/14.png',
  // Media
  Deferred = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/1.gif',
  LiveAnimated = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/2.gif',
  ListeningPaused = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/3.png',
  ListeningLive = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/12.gif',
  // Localized
  AdEn = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/4.png',
  AdFr = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/5.png',
  // Channels
  RTLPlay = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/6.png',
  RTLTVi = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/7.png',
  RTLClub = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/8.png',
  RTLPlug = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/9.png',
  RTLDistrict = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/15.png',
  RTLSports = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/16.png',
  BelRTL = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/10.png',
  BelRTLAnimated = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/17.gif',
  Contact = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/11.png',
  ContactAnimated = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/18.gif',
  Mint = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/19.png',
}

export const localizedAssets = {
  Ad: ActivityAssets.AdEn,
}

export function getLocalizedAssets(
  lang: string,
): typeof localizedAssets {
  switch (lang) {
    case 'fr':
      return {
        Ad: ActivityAssets.AdFr,
      }
    default:
      return {
        Ad: ActivityAssets.AdEn,
      }
  }
}

// Mainly used to truncate largeImageKeyText because the limit is 128 characters
export function limitText(input: string, maxLength = 128): string {
  const ellipsis = ' ...'

  // If input is within limit, return it as is
  if (input.length <= maxLength)
    return input

  // Truncate to 125 characters (leaving room for ellipsis)
  let truncated = input.slice(0, maxLength - ellipsis.length)

  // If the truncated text ends mid-word, remove the partial word
  if (truncated.includes(' '))
    truncated = truncated.slice(0, truncated.lastIndexOf(' '))

  return truncated + ellipsis
}

export function exist(selector: string): boolean {
  return document.querySelector(selector) !== null
}

interface ChannelInfo {
  name: string
  type: ActivityType
  logo: ActivityAssets
  animated?: ActivityAssets // Optional property
  radioAPI?: string // Optional property
}

export function getChannel(channel: string): ChannelInfo {
  switch (true) {
    case channel.includes('www.rtlplay.be'): {
      return {
        name: 'RTLplay',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLPlay,
        animated: ActivityAssets.Animated,
      }
    }
    case channel.includes('tvi'): {
      return {
        name: 'RTL TVi',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLTVi,
      }
    }
    case channel.includes('club'): {
      return {
        name: 'RTL club',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLClub,
      }
    }
    case channel.includes('plug'): {
      return {
        name: 'RTL plug',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLPlug,
      }
    }
    case ['rtlplay', 'district', 'RTLdistrict'].includes(channel): {
      return {
        name: 'RTL district',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLDistrict,
      }
    }
    case ['rtlplay2', 'sports', 'RTLsports'].includes(channel): {
      return {
        name: 'RTL sports',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLSports,
      }
    }
    // Bel RTL
    // [1/7] Main Radio
    case ['bel', 'www.belrtl.be'].includes(channel): {
      return {
        name: 'Bel RTL',
        type: ActivityType.Listening,
        logo: ActivityAssets.BelRTL,
        animated: ActivityAssets.BelRTLAnimated,
        radioAPI: 'https://core-search.radioplayer.cloud/056/qp/v4/events/?rpId=6',
      }
    }
    // [2/7] bel RTL Musique
    case ['webradio1'].includes(channel): {
      return {
        name: 'bel RTL Musique',
        type: ActivityType.Listening,
        logo: ActivityAssets.BelRTL,
        animated: ActivityAssets.BelRTLAnimated,
        radioAPI: 'https://www.belrtl.be/webradios/api/playlist/mooov_10',
      }
    }
    // [3/7] bel RTL Summer Station
    case ['webradio3'].includes(channel): {
      return {
        name: 'bel RTL Summer Station',
        type: ActivityType.Listening,
        logo: ActivityAssets.BelRTL,
        animated: ActivityAssets.BelRTLAnimated,
        radioAPI: 'https://www.belrtl.be/webradios/api/playlist/mooov_11',
      }
    }
    // [4/7] bel RTL 90
    case ['webradio6'].includes(channel): {
      return {
        name: 'bel RTL 90',
        type: ActivityType.Listening,
        logo: ActivityAssets.BelRTL,
        animated: ActivityAssets.BelRTLAnimated,
        radioAPI: 'https://www.belrtl.be/webradios/api/playlist/mooov_14',
      }
    }
    // [5/7] bel RTL 80
    case ['webradio2'].includes(channel): {
      return {
        name: 'bel RTL 80',
        type: ActivityType.Listening,
        logo: ActivityAssets.BelRTL,
        animated: ActivityAssets.BelRTLAnimated,
        radioAPI: 'https://www.belrtl.be/webradios/api/playlist/mooov_12',
      }
    }
    // [6/7] bel RTL 80
    case ['webradio7'].includes(channel): {
      return {
        name: 'bel RTL chanson française',
        type: ActivityType.Listening,
        logo: ActivityAssets.BelRTL,
        animated: ActivityAssets.BelRTLAnimated,
        radioAPI: 'https://www.belrtl.be/webradios/api/playlist/mooov_16',
      }
    }
    // [7/7] bel RTL Comédie
    case ['webradio4'].includes(channel): {
      return {
        name: 'bel RTL Comédie',
        type: ActivityType.Listening,
        logo: ActivityAssets.BelRTL,
        animated: ActivityAssets.BelRTLAnimated,
        radioAPI: 'https://www.belrtl.be/webradios/api/playlist/mooov_15',
      }
    }
    // Radio Contact
    // [1/8] Main Radio
    case ['contact', 'www.radiocontact.be'].includes(channel): {
      return {
        name: 'Radio Contact',
        type: ActivityType.Listening,
        logo: ActivityAssets.Contact,
        animated: ActivityAssets.ContactAnimated,
        radioAPI: 'https://core-search.radioplayer.cloud/056/qp/v4/events/?rpId=1',
      }
    }
    // [2/8] Contact - La playlist de Tonton
    case ['laplaylistdetonton'].includes(channel): {
      return {
        name: 'Contact La playlist de Tonton',
        type: ActivityType.Listening,
        logo: ActivityAssets.Contact,
        animated: ActivityAssets.ContactAnimated,
        radioAPI: 'https://rtlmedias.rtl.be/webradios/api/playlist/mooov_5',
      }
    }
    // [3/8] Contact Summertime
    case ['plus'].includes(channel): {
      return {
        name: 'Contact Summertime',
        type: ActivityType.Listening,
        logo: ActivityAssets.Contact,
        animated: ActivityAssets.ContactAnimated,
        radioAPI: 'https://rtlmedias.rtl.be/webradios/api/playlist/mooov_6',
      }
    }
    // [4/8] Contact DJ's
    case ['mix'].includes(channel): {
      return {
        name: 'Contact DJ\'s',
        type: ActivityType.Listening,
        logo: ActivityAssets.Contact,
        animated: ActivityAssets.ContactAnimated,
        radioAPI: 'https://rtlmedias.rtl.be/webradios/api/playlist/mooov_4',
      }
    }
    // [5/8] Contact 2000
    case ['2000'].includes(channel): {
      return {
        name: 'Contact 2000',
        type: ActivityType.Listening,
        logo: ActivityAssets.Contact,
        animated: ActivityAssets.ContactAnimated,
        radioAPI: 'https://rtlmedias.rtl.be/webradios/api/playlist/mooov_1',
      }
    }
    // [6/8] Contact 90's
    case ['contact90s'].includes(channel): {
      return {
        name: 'Contact 90\'s',
        type: ActivityType.Listening,
        logo: ActivityAssets.Contact,
        animated: ActivityAssets.ContactAnimated,
        radioAPI: 'https://rtlmedias.rtl.be/webradios/api/playlist/mooov_2',
      }
    }
    // [7/8] Contact 80's
    case ['contact80s'].includes(channel): {
      return {
        name: 'Contact 80\'s',
        type: ActivityType.Listening,
        logo: ActivityAssets.Contact,
        animated: ActivityAssets.ContactAnimated,
        radioAPI: 'https://rtlmedias.rtl.be/webradios/api/playlist/mooov_3',
      }
    }
    // [8/8] Contact kids
    case ['kids'].includes(channel): {
      return {
        name: 'Contact kids',
        type: ActivityType.Listening,
        logo: ActivityAssets.Contact,
        animated: ActivityAssets.ContactAnimated,
        radioAPI: 'https://rtlmedias.rtl.be/webradios/api/playlist/mooov_8',
      }
    }
    // Mint Radio
    case ['mint.be', 'www.mint.be'].includes(channel): {
      return {
        name: 'Mint',
        type: ActivityType.Listening,
        logo: ActivityAssets.Mint,
        animated: ActivityAssets.Mint,
        radioAPI: 'https://core-search.radioplayer.cloud/056/qp/v4/events/?rpId=7',
      }
    }
    default: {
      return {
        name: 'RTLplay',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLPlay,
        animated: ActivityAssets.Animated,
      }
    }
  }
}

// Greatly adapted veryCrunchy's function from YouTube Presence https://github.com/PreMiD/Presences/pull/8000

export const cropPreset = {
  // Crop values in percent correspond to Left, Right, Top, Bottom.
  squared: [0, 0, 0, 0],
  vertical: [0.22, 0.22, 0, 0.3],
  horizontal: [0.425, 0.025, 0, 0],
}

export async function getThumbnail(
  src: string = ActivityAssets.Logo,
  placeholder: string = ActivityAssets.Animated,
  cropPercentages: typeof cropPreset.squared = cropPreset.squared,
  progress = 2,
  borderWidth = 15,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const wh = 320 // Size of the square thumbnail

    img.crossOrigin = 'anonymous'
    img.src = src

    img.onload = function () {
      let croppedWidth
      let croppedHeight
      let cropX = 0
      let cropY = 0

      // Determine if the image is landscape or portrait
      const isLandscape = img.width > img.height

      if (isLandscape) {
        // Landscape mode: use left and right crop percentages
        const cropLeft = img.width * cropPercentages[0]!
        croppedWidth = img.width - cropLeft - img.width * cropPercentages[1]!
        croppedHeight = img.height
        cropX = cropLeft
      }
      else {
        // Portrait mode: use top and bottom crop percentages
        const cropTop = img.height * cropPercentages[2]!
        croppedWidth = img.width
        croppedHeight = img.height - cropTop - img.height * cropPercentages[3]!
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
      // Remap progress from 0-1 to 0.03-0.97 (smallImageKey borders)
      const remappedProgress = 0.07 + progress * (0.93 - 0.07)

      // 1. Fill the canvas with a black background
      ctx.fillStyle = '#172e4e'
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

        // Create a triangular gradient
        const gradient = ctx.createLinearGradient(0, 0, wh, wh)
        gradient.addColorStop(0, 'rgba(245, 3, 26, 1)')
        gradient.addColorStop(0.5, 'rgba(63, 187, 244, 1)')
        gradient.addColorStop(1, 'rgba(164, 215, 12, 1)')
        ctx.fillStyle = gradient

        ctx.fill()
      }

      // 3. Draw the cropped image centered and zoomed out based on the borderWidth
      ctx.drawImage(
        img,
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

    img.onerror = function () {
      resolve(src || placeholder)
    }
  })
}

// Fetch a resource and cache it locally (in memory)
interface CacheEntry {
  data: unknown
  timestamp: number
}
const cacheStore: Record<string, CacheEntry> = {}
const validityTime: number = 5000 // 5 seconds

export async function fetchCache(url: string, options?: RequestInit): Promise<unknown> {
  const now = Date.now()
  const cacheEntry = cacheStore[url]
  // If the resource is cached and less than, return the cached data
  if (cacheEntry && now - cacheEntry.timestamp < validityTime) {
    return cacheEntry.data
  }
  // Otherwise, fetch the resource
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${url}`)
  }
  // Try to parse as JSON, otherwise return raw text
  let data: unknown
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    data = await response.json()
  }
  else {
    data = await response.text()
  }
  // Cache with timestamp and return the data
  cacheStore[url] = { data, timestamp: now }
  return data
}
