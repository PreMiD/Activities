import { ActivityType, Assets, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1449716575367204974',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/brgxg1I.png',
}

let lastImageSrc: string | null = null
let lastImageDataUrl: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Live,
    type: ActivityType.Listening,
  }

  const imageElement = document.querySelector<HTMLImageElement>('[class^="style_playbarInfo"] [class^="style_image"]')
  if (imageElement?.src) {
    presenceData.largeImageKey = await getImageDataUrl(imageElement)
  }

  presenceData.details = document.querySelector<HTMLDivElement>('[class^="style_playbarInfo"] [class^="style_title"] b')?.textContent ?? document.querySelector<HTMLDivElement>('[class^="style_playbarInfo"] [class^="style_title"]')?.textContent
  presenceData.state = document.querySelector<HTMLDivElement>('[class^="style_playbarInfo"] [class^="playbar-title_trackArtist"]')?.textContent
  presenceData.name = document.querySelector<HTMLDivElement>('[class^="style_playbarInfo"] [class^="style_subtitleLink"]')?.textContent

  presenceData.statusDisplayType = StatusDisplayType.State

  switch (document.querySelector<HTMLDivElement>('[class^="style_playbarInfo"] [class^="style_playbarBadge"]')?.textContent?.toLowerCase().replaceAll(' ', '')) {
    case 'live':{
      const subtitleLink = document.querySelector<HTMLAnchorElement>('[class^="style_playbarInfo"] [class^="style_subtitleLink"]')
      if (subtitleLink) {
        presenceData.buttons = [{
          label: 'Listen to Radio',
          url: subtitleLink.href,
        }]
      }
      break
    }
    case 'liveplaylist':{
      break
    }
  }

  async function getImageDataUrl(imageElement: HTMLImageElement): Promise<string> {
    if (imageElement.src === lastImageSrc && lastImageDataUrl) {
      return lastImageDataUrl
    }

    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)
        lastImageDataUrl = canvas.toDataURL()
        lastImageSrc = imageElement.src
        resolve(lastImageDataUrl)
      }
      img.onerror = reject
      img.src = imageElement.src
    })
  }

  presence.setActivity(presenceData)
})
