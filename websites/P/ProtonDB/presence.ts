const presence = new Presence({
  clientId: '1493650855805849741',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const URL = `${document.location.protocol}//${document.location.hostname}${document.location.pathname}`
const button = {
  label: 'View Page',
  url: URL,
}

let oldURL: string
let cachedImage: string
let oldColor: string
let oldPath: string | undefined
let cachedColorImage: string

enum ActivityAssets {
  Logo = 'https://i.imgur.com/l4Z6mwH.png',
}

async function resizeImage(image: string): Promise<string> {
  return new Promise((resolve) => {
    switch (image) {
      case 'https://head.protondb.pages.dev/sites/protondb/images/site-logo' + '.png':
      case ActivityAssets.Logo:
        resolve(ActivityAssets.Logo)
        break
      case oldURL:
        if (cachedImage)
          resolve(cachedImage)
        else resolve(ActivityAssets.Logo)
        break
      default:{
        oldURL = image
        const img = new Image()
        const wh = 512
        img.crossOrigin = 'anonymous'
        img.src = image

        img.onload = function () {
          let newWidth, newHeight, offsetX, offsetY

          if (img.width > img.height) {
            newWidth = wh
            newHeight = (wh / img.width) * img.height
            offsetX = 0
            offsetY = (wh - newHeight) / 2
          }
          else {
            newHeight = wh
            newWidth = (wh / img.height) * img.width
            offsetX = (wh - newWidth) / 2
            offsetY = 0
          }
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = wh
          tempCanvas.height = wh

          tempCanvas
            .getContext('2d')
            ?.drawImage(img, offsetX, offsetY, newWidth, newHeight)

          cachedImage = tempCanvas.toDataURL('image/png')

          resolve(cachedImage)
        }
        img.onerror = function () {
          console.warn('Failed to load image:', image)
          resolve(ActivityAssets.Logo)
        }
      }
    }
  })
}

async function createColorImage(rgbColor: string, pathString?: string | null): Promise<string> {
  return new Promise((resolve) => {
    if (rgbColor === oldColor && pathString === oldPath) {
      resolve(cachedColorImage)
    }
    else {
      oldColor = rgbColor
      oldPath = pathString || undefined
      const size = 512
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = size
      tempCanvas.height = size
      const ctx = tempCanvas.getContext('2d')
      const p = new Path2D(pathString || '')
      if (ctx) {
        ctx.fillStyle = rgbColor
        ctx.fillRect(0, 0, size, size)
        ctx.fillStyle = '#000000'
        ctx.scale(18, 18)
        ctx.translate(2, 2)
        ctx.fill(p)
      }
      cachedColorImage = tempCanvas.toDataURL('image/png')
      resolve(cachedColorImage)
    }
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
  }

  switch (window.location.pathname.split('/')[1]) {
    case 'explore':{
      presenceData.details = 'Browsing games'
      presenceData.state = document.querySelector('main h3')?.textContent
      break
    }
    case 'app':{
      presenceData.details = document.querySelector('[class*="GameInfo__Title"]')?.textContent
      presenceData.state = `${document.querySelector('main .Mui-selected')?.textContent} reports`
      presenceData.largeImageKey = await resizeImage(document.querySelector('meta[property="og:image"]')?.getAttribute('content')?.replace('header.jpg', 'logo.png') || ActivityAssets.Logo)
      const medalContainer = document.querySelector('[class*="MedalSummary__EstimateContainer"]')
      const pathString = document.querySelector('[class*="MedalSummary__Estimate"] svg > path')?.getAttribute('d')
      if (medalContainer) {
        presenceData.smallImageKey = await createColorImage(getComputedStyle(medalContainer)?.backgroundColor, pathString)
      }
      presenceData.smallImageText = document.querySelector('[class*="MedalSummary__Estimate"]')?.getAttribute('alt')
      presenceData.detailsUrl = URL
      presenceData.buttons = [
        button,
      ]
      break
    }
    case 'users':{
      presenceData.details = `Browsing ${document.querySelector('main h3')?.textContent.trim()}'s profile`
      presenceData.state = `${document.querySelectorAll('[class*="ReportListRenderer__Container"]')?.length || 0} reports`
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('main img')?.src
      presenceData.detailsUrl = URL
      presenceData.buttons = [
        button,
      ]
      break
    }
    case 'dashboard':{
      presenceData.details = 'Viewing dashboard'
      presenceData.state = `${document.querySelectorAll('svg ~ h3')[0]?.textContent} | ${document.querySelectorAll('svg ~ h3')[1]?.textContent}`
      break
    }
    case 'news':{
      if (window.location.pathname.split('/')[2]) {
        presenceData.details = 'Viewing news post'
        presenceData.state = `${document.querySelector('main h3')?.textContent}`
        presenceData.buttons = [
          button,
        ]
      }
      else {
        presenceData.details = 'Browsing news'
      }
      break
    }
    case 'search':{
      presenceData.details = `Searching for "${new URLSearchParams(window.location.search).get('q')}"`
      break
    }
    default:{
      presenceData.details = 'Browsing ProtonDB'
    }
  }

  if (presenceData.largeImageKey === undefined)
    presenceData.largeImageKey = ActivityAssets.Logo

  presence.setActivity(presenceData)
})
