import { Assets } from 'premid'

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

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: myCANALAssets.Logo,
    name: 'myCANAL',
  }
  const video = document.querySelector<HTMLVideoElement>('.iIZX3IGkM2eBzzWle1QQ')
  const showCover = await presence.getSetting<boolean>('cover')
  const mainTitle = document.querySelector('.bodyTitle___HwRP2')

  switch (document.location.pathname) {
    case '/mes-videos/':
      presenceData.state = 'Mes Vidéos'
      break
    case '/chaines/':
      presenceData.state = 'Chaînes'
      break
    case '/programme-tv/':
      presenceData.state = 'Programme TV'
      break
    case '/cinema/':
      presenceData.state = 'Films'
      break
    case '/series/':
      presenceData.state = 'Séries'
      break
    case '/jeunesse/':
      presenceData.state = 'Jeunesse'
      break
    case '/live/':
      presenceData.state = 'Chaînes en direct'
      break
  }

  if (video && !Number.isNaN(video.duration)) {
    const titleTvShows = document.querySelectorAll('.MGrm26svmXpUhj6dfbGN')
    let channelID = new URLSearchParams(window.location.search).get('channel')
    switch (true) {
      case containsTerm('live'):
        channelID = `${channelID?.charAt(0)} ${channelID?.substring(1)}`
        presenceData.details = document.querySelector(
          '.A6AH2oNkXUuOKJN5IYrL',
        )?.textContent
        presenceData.state = `sur ${
          document.querySelector<HTMLImageElement>(
            `#\\3${channelID}_onclick > div > div.card__content_0dae1b.cardContent___DuNAN.ratio--169 > div[class*="cardLogoChannel"] > div > img`,
          )?.alt
        }`;
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
        presenceData.largeImageKey = showCover
          ? document.querySelector<HTMLImageElement>(
            `#\\3${channelID}_onclick > div > div.card__content_0dae1b.cardContent___DuNAN.ratio--169 > div[class*="cardLogoChannel"] > div > img`,
          )?.src
          : myCANALAssets.Logo
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = 'En direct'
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
        presenceData.startTimestamp = browsingTimestamp
        break
      case containsTerm('cinema'):
        presenceData.details = document.querySelector(
          '.A6AH2oNkXUuOKJN5IYrL',
        )?.textContent;
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
        presenceData.largeImageKey = showCover
          ? (presenceData.largeImageKey = await getThumbnail(
              document.querySelector<HTMLMetaElement>('[property=\'og:image\']')
                ?.content,
            ))
          : myCANALAssets.Logo
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? (await strings).pause
          : (await strings).play
        break
      case containsTerm('series'):
      case containsTerm('jeunesse'):
        presenceData.details = titleTvShows[0]?.textContent?.trim()
        presenceData.state = titleTvShows[1]?.textContent?.trim();
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
        presenceData.largeImageKey = showCover
          ? (presenceData.largeImageKey = await getThumbnail(
              document.querySelector<HTMLMetaElement>('[property=\'og:image\']')
                ?.content,
            ))
          : myCANALAssets.Logo
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? (await strings).pause
          : (await strings).play
        break
    }
    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else if (mainTitle) {
    presenceData.details = 'Regarde...'
    presenceData.state = mainTitle.textContent
  }
  else {
    presenceData.details = 'Navigue...'
  }

  presence.setActivity(presenceData)
})
