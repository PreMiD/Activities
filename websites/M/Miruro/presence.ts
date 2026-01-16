import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1461595509251903662',
})
let browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/dmLFCtb.png',
}

let wasWatchingVideo = false

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }
  const { href, pathname, search } = document.location
  switch (true) {
    case pathname === '/':
      presenceData.details = 'Browsing'
      break
    case pathname === '/search':
      const genresMatch = search.match(/genres=([^&]+)/)
      const genresEncoded = genresMatch?.[1] || ''
      const genresDecoded = decodeURIComponent(genresEncoded).replace(/\+/g, ' ')
      presenceData.details = `Searching: ${genresDecoded || 'Anime'}`
      presenceData.smallImageKey = Assets.Search
      break
    case pathname.includes('/watch/'): {
      const infoLink = document.querySelector<HTMLAnchorElement>('a[href^="/info/"]')
      const infoHref = infoLink?.getAttribute('href') || ''
      const infoMatch = infoHref.match(/\/info\/\d+\/(.+)/)
      let animeSlug = infoMatch?.[1] || pathname.split('/')[3] || ''
      
      // Clean up the slug
      const title = animeSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      const coverArt = infoLink?.querySelector<HTMLImageElement>('img')?.src || document
        .querySelector<HTMLImageElement>('img[src*="anilist"]')
        ?.src

      const episodeMatch = pathname.match(/episode-(\d+)/i)
      const episodeNumber = episodeMatch?.[1]

      const video = document.querySelector<HTMLVideoElement>('video')

      presenceData.name = 'Miruro'
      presenceData.details = title

      if (episodeNumber) {
        presenceData.state = `Episode ${episodeNumber}`
      }

      // Handle video player data
      if (video) {
        const { paused, currentTime, duration } = video

        // Only show video indicators if user has started watching or is currently playing
        if (currentTime > 0 || !paused) {
          if (paused) {
            presenceData.smallImageKey = Assets.Play
            presenceData.smallImageText = 'Paused'
            // Reset browsing timestamp when returning from video
            if (wasWatchingVideo) {
              browsingTimestamp = Math.floor(Date.now() / 1000)
            }
          } else {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = 'Playing'

            // Add timestamps only when actively playing
            if (currentTime && duration) {
              [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
            }
          }
          wasWatchingVideo = true
        } else {
          wasWatchingVideo = false
        }
      } else {
        wasWatchingVideo = false
      }
      presenceData.largeImageKey = coverArt ?? ActivityAssets.Logo
      break
    }
    case pathname.includes('/info'):
      const infoParts = pathname.split('/')
      const infoSlug = infoParts[3] || ''
      const infoTitle = infoSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      
      const infoCoverArt = document
        .querySelector<HTMLImageElement>('img[alt="Cover"]')
        ?.src || document
        .querySelector<HTMLImageElement>('img[src*="anilist"]')
        ?.src || document
        .querySelector<HTMLImageElement>('img.vds-poster')
        ?.src
      
      presenceData.details = `Checking ${infoTitle}`
      presenceData.largeImageKey = infoCoverArt ?? ActivityAssets.Logo
      presenceData.smallImageKey = Assets.Search
      break
    default:
      presenceData.details = 'Browsing'
      break
  }
  presence.setActivity(presenceData)
})
