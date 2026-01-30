import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const containsTerm = (term: string) => document.location.pathname.includes(term)

enum myCANALAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/myCANAL/assets/0.png',
}

// Resize fonction made by pierrequiroul https://github.com/PreMiD/Presences/pull/8910

export const cropPreset = {
  // Crop values in percent correspond to Left, Right, Top, Bottom.
  squared: [0, 0, 0, 0] as [number, number, number, number],
  vertical: [0.22, 0.22, 0, 0.3] as [number, number, number, number],
  horizontal: [0.425, 0.025, 0, 0] as [number, number, number, number],
}

export async function getThumbnail(
  src: string = myCANALAssets.Logo,
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
        const cropLeft = img.width * cropPercentages[0]
        croppedWidth = img.width - cropLeft - img.width * cropPercentages[1]
        croppedHeight = img.height
        cropX = cropLeft
      }
      else {
        // Portrait mode: use top and bottom crop percentages
        const cropTop = img.height * cropPercentages[2]
        croppedWidth = img.width
        croppedHeight = img.height - cropTop - img.height * cropPercentages[3]
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

// Data we need is deleted when player controls disappear
let cachedTitleTvShows: [string | null, string | null] = [null, null]
let cachedEpisodeTitle: string | null = null
let cachedSynopsis: string | null = null
let cachedChannelName: string | null = null
let cachedThumbnailUrl: string | null = null
let lastImgSrc: string | null = null

const navigationRoutes: Record<string, string> = {
  '/mes-videos/': 'Mes Vidéos',
  '/chaines/': 'Chaînes',
  '/programme-tv/': 'Programme TV',
  '/cinema/': 'Films',
  '/series/': 'Séries',
  '/jeunesse/': 'Jeunesse',
  '/live/': 'Chaînes en direct',
  '/documentaires/': 'Documentaires',
  '/divertissement/': 'Divertissements',
  '/info/': 'Infos',
  '/musique/': 'Musique',
  '/sport/': 'Sport',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: myCANALAssets.Logo,
    largeImageText: 'myCANAL',
    name: 'myCANAL',
    type: ActivityType.Watching,
  }
  const video = document.querySelector<HTMLVideoElement>('.iIZX3IGkM2eBzzWle1QQ')
  const showCover = await presence.getSetting<boolean>('cover')
  const mainTitle = document.querySelector('.stickyTitle___HRELo')
  const currentPathName = document.location.pathname

  if (navigationRoutes[currentPathName]) {
    presenceData.state = navigationRoutes[currentPathName]
  }

  if (video && !Number.isNaN(video.duration)) {
    updateTitleForTvShowsCache()

    const showTitleAsActivity = await presence.getSetting<boolean>('useTitleAsName')

    if (containsTerm('live')) {
      await handleLiveContent(presenceData, showCover)
    }
    else if (containsTerm('cinema')) {
      await handleCinemaContent(presenceData, video, showCover)
    }
    else if (containsTerm('series') || containsTerm('jeunesse')) {
      await handleSeriesContent(presenceData, video, showCover, showTitleAsActivity, mainTitle)
    }

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (showTitleAsActivity && mainTitle) {
      presenceData.name = mainTitle.textContent?.trim()
    }
  }
  else if (mainTitle) {
    presenceData.details = 'Regarde...'
    presenceData.state = mainTitle.textContent
  }
  else {
    presenceData.details = 'Navigue...'
    resetCaches()
  }

  await presence.setActivity(presenceData)
})

function resetCaches() {
  cachedTitleTvShows = [null, null]
  cachedEpisodeTitle = null
  cachedSynopsis = null
  cachedChannelName = null
}

function updateTitleForTvShowsCache() {
  const titleTvShows = document.querySelectorAll('.RbcMSl3qdUyV2kb3rAEg')
  if (titleTvShows.length >= 2) {
    cachedTitleTvShows = [
      titleTvShows[0]?.textContent?.trim() || null,
      titleTvShows[1]?.textContent?.trim() || null,
    ]
  }
}

async function handleLiveContent(presenceData: MediaPresenceData | NonMediaPresenceData, showCover: boolean) {
  presenceData.details = document.querySelector('.A6AH2oNkXUuOKJN5IYrL')?.textContent

  if (showCover) {
    const channelImg = document.querySelector<HTMLImageElement>('.w4vxo5X8LLEAi6TxyFxu')
    if (channelImg) {
      if (channelImg.src !== lastImgSrc) {
        lastImgSrc = channelImg.src
        cachedThumbnailUrl = await getThumbnail(channelImg.src)
      }
      cachedChannelName = channelImg.alt.split('Logo de la chaîne ')[1] || 'une chaîne'
    }

    presenceData.largeImageKey = cachedThumbnailUrl || myCANALAssets.Logo
  }

  presenceData.state = `sur ${cachedChannelName || 'une chaîne'}`
  presenceData.startTimestamp = browsingTimestamp

  presenceData.smallImageKey = Assets.Live
  presenceData.smallImageText = 'En direct'
}

async function handleCinemaContent(presenceData: MediaPresenceData | NonMediaPresenceData, video: HTMLVideoElement, showCover: boolean) {
  presenceData.details = document.querySelector('.A6AH2oNkXUuOKJN5IYrL')?.textContent
  presenceData.state = document.head.querySelector('[name="description"]')?.getAttribute('content')?.trim();

  [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)

  if (showCover) {
    presenceData.largeImageKey = await getThumbnail(
      document.querySelector<HTMLMetaElement>('[property=\'og:image\']')?.content,
    )
  }

  presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
  presenceData.smallImageText = video.paused ? (await strings).pause : (await strings).play
}

async function handleSeriesContent(presenceData: PresenceData, video: HTMLVideoElement, showCover: boolean, showTitleAsActivity: boolean, mainTitle: Element | null) {
  const episodeTitle = cachedTitleTvShows[1]?.substring(cachedTitleTvShows[1]?.indexOf(':') + 1)?.trim()

  if (showTitleAsActivity && mainTitle) {
    presenceData.details = episodeTitle
    if (episodeTitle && episodeTitle !== cachedEpisodeTitle) {
      cachedEpisodeTitle = episodeTitle
      cachedSynopsis = null
      for (const el of document.querySelectorAll('[class*="episode-editorial__editorial-title"]')) {
        if (el.textContent === episodeTitle) {
          cachedSynopsis = el.nextSibling?.textContent?.trim() || null
          break
        }
      }
    }
    if (cachedSynopsis) {
      presenceData.state = cachedSynopsis
    }
  }
  else {
    presenceData.details = mainTitle?.textContent?.trim()
    presenceData.state = episodeTitle
  }

  [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)

  if (showCover) {
    presenceData.largeImageKey = await getThumbnail(
      document.querySelector<HTMLMetaElement>('[property=\'og:image\']')?.content,
    )
  }

  const showSeason = `${cachedTitleTvShows[0]?.split('-').at(-1)?.trim()}`
  const showEpisode = `${cachedTitleTvShows[1]?.split(':')[0]?.trim()}`
  presenceData.largeImageText = `${showSeason}, ${showEpisode}`

  presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
  presenceData.smallImageText = video.paused ? (await strings).pause : (await strings).play
}
