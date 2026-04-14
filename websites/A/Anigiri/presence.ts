import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '858714250699472906',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://anigiri.com/icon-512.png',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  if (document.location.pathname.startsWith('/watch/')) {
    const titleParts = document.title.split(' - ')
    const animeTitle = titleParts[0]?.replace('Assistir ', '').trim()
    const episodePart = titleParts[1]?.split(' no ')[0]?.trim()

    presenceData.details = animeTitle || 'Watching Anime'
    presenceData.state = episodePart || 'Watching'

    const animeImage
      = document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute('content')
        || document
          .querySelector('meta[name="twitter:image"]')
          ?.getAttribute('content')

    if (animeImage) {
      presenceData.largeImageKey = animeImage
      presenceData.smallImageKey = 'https://anigiri.com/icon-512.png'
    }

    const video = document.querySelector('video')

    if (video) {
      if (!video.paused) {
        const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
      else {
        delete presenceData.startTimestamp
        presenceData.smallImageKey = Assets.Pause
      }
    }
  }
  else {
    presenceData.details = 'Browsing'
  }

  presence.setActivity(presenceData)
})
