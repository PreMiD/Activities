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
  buttonViewPage: 'general.buttonViewPage',
  buttonWatchVideo: 'general.buttonWatchVideo',
  buttonWatchStream: 'general.buttonWatchStream',
  watchingLive: 'general.watchingLive',
  watchingShow: 'general.watchingShow',
  watchingMovie: 'general.watchingMovie',
  live: 'general.live',
  listeningTo: 'general.listeningTo',
  waitingLive: 'general.waitingLive',
  ad: 'youtube.ad',
  // Custom strings
  aPodcast: 'RTBFAuvio.aPodcast',
  aRadio: 'RTBFAuvio.aRadio',
  buttonViewCategory: 'RTBFAuvio.buttonViewCategory',
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
  switch (assetName) {
    case 'Ad':
      switch (lang) {
        case 'fr-FR':
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

export function formatDuration(time: string | number) {
  let totalSeconds: number

  if (typeof time === 'string') {
    const parts = time.split(':').map(Number)
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      throw new Error('Invalid time format. Expected HH:MM:SS')
    }
    const [hours, minutes, seconds] = parts
    totalSeconds = hours! * 3600 + minutes! * 60 + seconds!
  }
  else if (typeof time === 'number') {
    totalSeconds = time
  }
  else {
    throw new TypeError('Invalid input. Expected a string or number.')
  }

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

export async function getThumbnail(
  src: string = ActivityAssets.Logo,
  cropPercentages: typeof cropPreset.squared = cropPreset.squared, // Left, Right, top, Bottom
  borderColor: string | number[][] = getColor('')!,
  borderWidth = 15,
  progress = 2,
): Promise<string> {
  if (!src.match('data:image')) {
    return new Promise((resolve) => {
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
          console.warn('Failed to draw image on canvas:', error)
          resolve(ActivityAssets.Logo)
        }
      }

      // Strategy 1: Try with CORS first (for ds.static.rtbf.be)
      img.crossOrigin = 'anonymous'
      img.onload = () => processImage(img)

      img.onerror = () => {
        console.warn('CORS failed, using original URL fallback')

        // Strategy 2: Direct fallback to original url (for static-content.rtbf.be)
        resolve(src)
      }

      img.src = src
    })
  }
  else {
    return src
  }
}
