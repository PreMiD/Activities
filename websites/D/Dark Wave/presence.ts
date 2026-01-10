import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1383644853589643385',
})
const titleInfo: any = {}
presence.on('UpdateData', async () => {
  const url = document.location.href
  const data: PresenceData = {
    type: ActivityType.Watching,
    name: 'DarkWave - Looking..',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Dark%20Wave/assets/logo.png',
  }
  const video = document.querySelector<HTMLVideoElement>('video')
  if (video) {
    if (!video.paused) {
      const timestamps = getTimestamps(video.currentTime, video.duration)
      data.startTimestamp = timestamps[0]
      data.endTimestamp = timestamps[1]
    }
    else {
      data.smallImageKey = Assets.Pause
      data.smallImageText = 'Paused'
    }

    const videoName = document.getElementById('videoName')?.textContent
    const videoTitle = document.getElementById('videoTitle')?.textContent
    if (videoTitle && titleInfo.title !== videoTitle) {
      titleInfo.title = videoTitle
      titleInfo.name = videoName
    }
    if (titleInfo?.title) {
      data.name = titleInfo.name ?? titleInfo.title
      data.details = titleInfo.title

      if (titleInfo.name)
        data.state = titleInfo.name

      data.buttons = [
        {
          label: `Watch ${titleInfo.name ?? titleInfo.title}`,
          url,
        },
      ]
    }
  }
  else {
    const searchElement = document.querySelector<HTMLInputElement>('#search-modal-title')
    if (searchElement && searchElement.value.length > 2) {
      data.name = 'Dark Wave - Search'
      data.state = searchElement.value
    }
    else {
      if (url.startsWith('https://dark-wave.fr/catalog')) {
        const pageRegex = /[?&]page=(\d+)/
        const match = url.match(pageRegex)

        data.name = `Dark Wave - Catalog page ${match ? match?.[1] : '1'}`
      }
      else if (url === 'https://dark-wave.fr/') {
        data.name = 'Dark Wave - Home Page'
      }
      else if (url === 'https://dark-wave.fr/watchlist') {
        data.name = 'Dark Wave - Watchlist'
      }
      else if (url.startsWith('https://dark-wave.fr/sheet/')) {
        const titleElement = document.querySelector('h1[class*="text-3xl"]')
        if (titleElement) {
          const name = titleElement.textContent
          data.name = 'Dark Wave - Sheet Page'
          data.state = `Looking at ${name}`
          data.buttons = [
            {
              label: `View ${name}`,
              url,
            },
          ]
        }
      }
    }
  }

  presence.setActivity(data)
})
