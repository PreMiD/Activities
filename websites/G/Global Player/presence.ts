import { ActivityType, Assets, getTimestampsFromMedia, StatusDisplayType } from 'premid'

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
    type: ActivityType.Listening,
  }

  const playbar = document.querySelector('[class^="style_playbar"]')

  let image
  const imageElement = playbar?.querySelector<HTMLImageElement>('[class^="style_image"]')
  if (imageElement?.src) {
    image = await getImageDataUrl(imageElement)
  }

  const title = playbar?.querySelector('[class^="style_title"] b')?.textContent ?? document.querySelector('[class^="style_title"]')?.textContent
  const artist = playbar?.querySelector('[class^="playbar-title_trackArtist"]')?.textContent
  const subTitle = playbar?.querySelector('[class^="style_subtitleLink"]')?.textContent ?? document.querySelector('[class^="style_subtitle"]')?.textContent
  const subtitleLink = playbar?.querySelector<HTMLAnchorElement>('[class^="style_subtitleLink"]')
  const playbarBadge = playbar?.querySelector('[class^="style_playbarBadge"]')?.textContent?.toLowerCase().replaceAll(' ', '')

  if (playbar?.querySelector<HTMLButtonElement>('[class*="style_actionButton"]')?.title !== 'Play') {
    switch (playbarBadge) {
      case 'live':{
        presenceData.details = subTitle
        presenceData.state = title
        presenceData.largeImageText = artist
        presenceData.largeImageKey = image
        presenceData.statusDisplayType = StatusDisplayType.Details
        if (subtitleLink) {
          presenceData.buttons = [{
            label: 'View Radio',
            url: subtitleLink.href,
          }]
        }
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = 'Live'
        break
      }
      case 'liveplaylist':{
        presenceData.details = subTitle
        presenceData.state = title
        presenceData.largeImageText = artist
        presenceData.largeImageKey = image
        presenceData.statusDisplayType = StatusDisplayType.Details
        if (subtitleLink) {
          presenceData.buttons = [{
            label: 'View Playlist',
            url: subtitleLink.href,
          }]
        }
        presenceData.detailsUrl = subtitleLink?.href
        break
      }
      case 'podcast':{
        presenceData.details = subTitle
        presenceData.state = title
        presenceData.largeImageKey = image
        presenceData.statusDisplayType = StatusDisplayType.Details
        presenceData.smallImageKey = Assets.Play
        const video = document.querySelector<HTMLVideoElement>('video')
        if (video) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
        }
        if (subtitleLink) {
          presenceData.buttons = [{
            label: 'View Podcast',
            url: subtitleLink.href,
          }]
        }
        presenceData.detailsUrl = subtitleLink?.href
        break
      }
      case 'catchup':{
        presenceData.details = title
        presenceData.state = subTitle
        presenceData.largeImageKey = image
        presenceData.statusDisplayType = StatusDisplayType.Details
        const video = document.querySelector<HTMLVideoElement>('video')
        if (video) {
          if (!video.paused) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
          }
          presenceData.smallImageKey = Assets.Play
        }
        break
      }
      case 'replay':{
        presenceData.details = subTitle
        presenceData.state = title
        presenceData.largeImageText = artist
        presenceData.largeImageKey = image
        presenceData.statusDisplayType = StatusDisplayType.Details
        if (subtitleLink) {
          presenceData.buttons = [{
            label: 'View Radio',
            url: subtitleLink.href,
          }]
        }
        presenceData.smallImageKey = Assets.Repeat
        presenceData.smallImageText = 'Replay'
        break }
      default:{
        presenceData.details = playbarBadge
      }
    }
  }
  else if (document.location.pathname.startsWith('/videos')) {
    const videoDetails = document.querySelector('[class^="style_videoDetails"]')
    presenceData.details = videoDetails?.querySelector('[class^="style_title"]')?.textContent
    presenceData.state = videoDetails?.querySelector('[class^="style_timeAgo"]')?.textContent
    presenceData.buttons = [{
      label: 'Watch Video',
      url: document.location.href,
    }]
    const video = document.querySelector<HTMLVideoElement>('#globalVideoPlayer video')
    if (video) {
      if (!video.paused)
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
      presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Play
    }
  }
  else {
    presenceData.details = 'Browsing'
    presenceData.state = document.querySelector('.menu-items [class*="style_selected"]')?.textContent
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
