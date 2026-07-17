import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1526425052944273408',
})

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://i.imgur.com/FYh2IFE.png',
}

// Create timestamps outside UpdateData to maintain consistent timing
let browsingTimestamp = Math.floor(Date.now() / 1000)
let watchTimestamp = Math.floor(Date.now() / 1000)
let wasWatchingVideo = false
let lastHref = ''

presence.on('UpdateData', async () => {
  const { href } = document.location
  const presenceData: MediaPresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
  }

  // 1. Check if the parent wrapper exists
  const watchMain = document.querySelector('#watch-main')

  // 2. Check if the actual iframe player has loaded into the DOM
  const playerIframe = document.querySelector<HTMLIFrameElement>('#w-player iframe')

  // If both the wrapper and the iframe exist, the user is watching
  if (watchMain && playerIframe && playerIframe.src) {
    // Reset the watch timer if they just transitioned to watching or swapped episodes
    if (!wasWatchingVideo || href !== lastHref) {
      watchTimestamp = Math.floor(Date.now() / 1000)
      wasWatchingVideo = true
      lastHref = href
    }

    // Extract Title from the h1 element
    const titleEl = document.querySelector('h1.title.d-title')
    const title = titleEl ? titleEl.textContent?.trim() : 'Unknown Anime'

    // Extract Episode Number from the wrapper data attribute
    const epNum = watchMain.getAttribute('data-ep-name')
    const episodeText = epNum ? `Episode ${epNum}` : 'Watching'

    // Extract the Anime Cover image
    const posterEl = document.querySelector('.binfo .poster img[itemprop="image"]')
    const posterUrl = posterEl ? posterEl.getAttribute('src') : null

    // Build the Watching state
    presenceData.type = ActivityType.Watching
    presenceData.details = title
    presenceData.state = episodeText
    presenceData.largeImageKey = posterUrl || ActivityAssets.Logo
    presenceData.largeImageText = title

    // Use an elapsed timer since we cannot read the iframe's internal video timeline
    presenceData.startTimestamp = watchTimestamp

    presenceData.buttons = [
      {
        label: 'Watch Anime',
        url: href,
      },
    ]
  }
  else {
    // User is browsing the home page or menus (iframe not found)
    if (wasWatchingVideo) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatchingVideo = false
    }

    // Build the Browsing state
    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.largeImageText = 'Anikoto'
    presenceData.details = 'Browsing Anime'
    presenceData.state = 'Looking for something to watch'
    presenceData.startTimestamp = browsingTimestamp
  }

  // Set or clear the activity
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
