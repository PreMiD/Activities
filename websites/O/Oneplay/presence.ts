import { getTimestamps } from 'premid'

declare const presence: any

let browsingTimestamp: number = Math.floor(Date.now() / 1000)
let watchingTimestamp: number = Math.floor(Date.now() / 1000)
let wasWatching: boolean = false

const LOGO_URL = 'https://i.imgur.com/cUdfHvP.jpeg'

presence.on('UpdateData', async () => {
  const showTimestamp = await presence.getSetting('showTimestamp')
  const showDetails = await presence.getSetting('showDetails')
  const currentTitle: string = document.title || ''

  const playerData = {
    largeImageKey: LOGO_URL,
    largeImageText: 'Oneplay',
    type: 3,
    details: '',
    state: undefined as string | undefined,
    startTimestamp: undefined as number | undefined,
    endTimestamp: undefined as number | undefined,
  }

  if (currentTitle && currentTitle.includes('| Oneplay') && !currentTitle.startsWith('Oneplay - Sledujte filmy, seriály a sport online') && !currentTitle.startsWith('Home')) {
    if (!wasWatching) {
      watchingTimestamp = Math.floor(Date.now() / 1000)
      wasWatching = true
    }

    const titleParts = currentTitle.split('|')
    const cleanTitle = titleParts[0] ? titleParts[0].trim() : 'Oneplay'
    playerData.type = 3

    if (showDetails) {
      playerData.details = cleanTitle
      playerData.state = 'Watching a show'
    }
    else {
      playerData.details = 'Watching Oneplay'
    }

    if (showTimestamp) {
      const video = document.querySelector<HTMLVideoElement>('video')
      const isLiveStream = !!document.querySelector('[class*="live"], [class*="stream"], [class*="zive"]')

      if (video && !isLiveStream && Number.isFinite(video.duration)) {
        [playerData.startTimestamp, playerData.endTimestamp] = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )

        if (video.paused) {
          playerData.startTimestamp = undefined
          playerData.endTimestamp = undefined
        }
      }
      else {
        playerData.startTimestamp = watchingTimestamp
      }
    }
  }
  else {
    if (wasWatching) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatching = false
    }

    playerData.details = 'Browsing...'

    if (showTimestamp) {
      playerData.startTimestamp = browsingTimestamp
    }
  }

  if (playerData.details) {
    presence.setActivity(playerData)
  }
  else {
    presence.clearActivity()
  }
})
