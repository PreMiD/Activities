import { ActivityType } from 'premid'

export const stringsMap = {
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

  /* Since the Presence is for a service localized in Belgium,
  I recommend translating custom strings in the 3 official languages as well as English */
  deferred: 'general.deferred',
  movie: 'general.movie',
  tvshow: 'general.tvshow',
  privacy: 'general.privacy',
  watchingLiveMusic: 'general.LiveMusic',
}

export function getAdditionnalStrings(
  lang: string,
  strings: typeof stringsMap,
): typeof stringsMap {
  switch (lang) {
    case 'fr-FR': {
      strings.deferred = 'En Différé'
      strings.movie = 'Film'
      strings.tvshow = 'Série'
      strings.privacy = 'Lecture privée'
      strings.watchingLiveMusic = 'Regarde un clip musical en direct'

      // Improved translation in the context of this website
      strings.watchingShow = 'Regarde une émission ou une série'
      strings.searchFor = 'Recherche de :'
      strings.viewList = 'Regarde sa liste'

      break
    }
    case 'nl-NL': {
      strings.deferred = 'Uitgestelde'
      strings.movie = 'Film'
      strings.tvshow = 'TV-Serie'
      strings.privacy = 'Privacy'
      strings.watchingLiveMusic = 'Kijkt naar een live muziekvideo'
      break
    }
    case 'de-DE': {
      strings.deferred = 'Zeitversetzt'
      strings.movie = 'Film'
      strings.tvshow = 'TV-Serie'
      strings.privacy = 'Private Mode'
      strings.watchingLiveMusic = 'Schaut ein Musikvideo live'
      break
    }
    default: {
      strings.deferred = 'Deferred'
      strings.movie = 'Movie'
      strings.tvshow = 'TV Serie'
      strings.privacy = 'Privacy Mode'
      strings.watchingLiveMusic = 'Watching a live music video'
    }
  }
  return strings
}

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/logo.png',
  Animated = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/0.gif',
  Deferred = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/1.gif',
  LiveAnimated = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/2.gif',
  Vinyle = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/3.png',
  VinyleAnimated = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/12.gif',
  Binoculars = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/13.png',
  Privacy = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/14.png',
  AdEn = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/4.png',
  AdFr = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/5.png',
  RTLPlay = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/6.png',
  RTLTVi = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/7.png',
  RTLClub = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/8.png',
  RTLPlug = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/9.png',
  RTLDistrict = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/15.png',
  RTLSports = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/16.png',
  BelRTL = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/10.png',
  Contact = 'https://cdn.rcd.gg/PreMiD/websites/R/RTLplay/assets/11.png',
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
  channel: string
  type: ActivityType
  logo: ActivityAssets
  radioplayerAPI?: string // Optional property
}

export function getChannel(channel: string): ChannelInfo {
  switch (true) {
    case channel.includes('tvi'): {
      return {
        channel: 'RTL TVi',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLTVi,
      }
    }
    case channel.includes('club'): {
      return {
        channel: 'RTL club',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLClub,
      }
    }
    case channel.includes('plug'): {
      return {
        channel: 'RTL plug',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLPlug,
      }
    }
    case ['rtlplay', 'district'].includes(channel): {
      return {
        channel: 'RTL district',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLDistrict,
      }
    }
    case ['bel', 'www.belrtl.be'].includes(channel): {
      return {
        channel: 'Bel RTL',
        type: ActivityType.Listening,
        logo: ActivityAssets.BelRTL,
        radioplayerAPI: 'https://core-search.radioplayer.cloud/056/qp/v4/events/?rpId=6',
      }
    }
    case ['contact', 'www.radiocontact.be'].includes(channel): {
      return {
        channel: 'Radio Contact',
        type: ActivityType.Listening,
        logo: ActivityAssets.Contact,
        radioplayerAPI: 'https://core-search.radioplayer.cloud/056/qp/v4/events/?rpId=1',
      }
    }
    case ['rtlplay2', 'sports'].includes(channel): {
      return {
        channel: 'RTL sports',
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLSports,
      }
    }
    default: {
      return {
        channel,
        type: ActivityType.Watching,
        logo: ActivityAssets.RTLPlay,
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
      resolve(src)
    }
  })
}
