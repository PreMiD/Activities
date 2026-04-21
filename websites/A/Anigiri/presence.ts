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

  const pathname = document.location.pathname
  const documentTitle = document.title

  if (pathname.startsWith('/watch/')) {
    const titleParts = documentTitle.split(' - ')
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
  else if (pathname.startsWith('/anime/')) {
    const modalTitle = document.querySelector('[class*="ModalTitle"]')
    const animeTitle = modalTitle?.textContent?.trim() || documentTitle.split(' - ')[0]?.trim() || 'Anime'

    presenceData.details = animeTitle
    presenceData.state = 'Viewing Details'

    const modalTlImage = document.querySelector('[class*="ModalTlImage"]') as HTMLImageElement
    const animeImage
      = modalTlImage?.src
        || document
          .querySelector('meta[property="og:image"]')
          ?.getAttribute('content')
          || document
            .querySelector('meta[name="twitter:image"]')
            ?.getAttribute('content')

    if (animeImage) {
      presenceData.largeImageKey = animeImage
      presenceData.smallImageKey = 'https://anigiri.com/icon-512.png'
    }
  }
  else if (pathname.startsWith('/public-rooms')) {
    presenceData.details = 'Public Rooms'
    presenceData.state = 'Browsing'
  }
  else if (pathname.startsWith('/profile')) {
    const titleParts = documentTitle.split(' - ')
    const username = titleParts[0]?.trim()

    presenceData.details = username && username !== 'Profile' && username !== 'Profile not found' ? `${username}'s Profile` : 'Viewing Profile'
    presenceData.state = 'Browsing'
  }
  else if (pathname.startsWith('/daily')) {
    presenceData.details = 'Daily Rewards'
    presenceData.state = 'Collecting Anicoins'
  }
  else if (pathname.startsWith('/vip')) {
    presenceData.details = 'VIP Area'
    presenceData.state = 'Viewing Perks'
  }
  else {
    presenceData.details = 'Browsing'
  }

  presence.setActivity(presenceData)
})
