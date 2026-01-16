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
  const { pathname, search } = document.location
  switch (true) {
    case pathname === '/':
      presenceData.details = 'Browsing'
      break
    case pathname === '/search':
      presenceData.details = `Searching: ${decodeURIComponent(((search.match(/genres=([^&]+)/))?.[1] || '')).replace(/\+/g, ' ') || 'Anime'}`
      presenceData.smallImageKey = Assets.Search
      break
    case pathname.includes('/watch/'): {
      presenceData.name = 'Miruro'
      presenceData.details = ((((document.querySelector<HTMLAnchorElement>('a[href^="/info/"]'))?.getAttribute('href') || '').match(/\/info\/\d+\/(.+)/))?.[1] || pathname.split('/')[3] || '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      if ((pathname.match(/episode-(\d+)/i))?.[1]) {
        presenceData.state = `Episode ${(pathname.match(/episode-(\d+)/i))?.[1]}`
      }
      // Handle video player data
      const video = document.querySelector<HTMLVideoElement>('video')
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
          }
          else {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = 'Playing'
            // Add timestamps only when actively playing
            if (currentTime && duration) {
              [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
            }
          }
          wasWatchingVideo = true
        }
        else {
          wasWatchingVideo = false
        }
      }
      else {
        wasWatchingVideo = false
      }
      presenceData.largeImageKey = ((document.querySelector<HTMLAnchorElement>('a[href^="/info/"]'))?.querySelector<HTMLImageElement>('img')?.src || document
        .querySelector<HTMLImageElement>('img[src*="anilist"]')?.src) ?? ActivityAssets.Logo
      break
    }
    case pathname.includes('/info'):
      presenceData.details = `Checking ${((pathname.split('/'))[3] || '').split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}`
      presenceData.largeImageKey = (document.querySelector<HTMLImageElement>('img[alt="Cover"]')?.src || document
        .querySelector<HTMLImageElement>('img[src*="anilist"]')?.src || document.querySelector<HTMLImageElement>('img.vds-poster')?.src) ?? ActivityAssets.Logo
      presenceData.smallImageKey = Assets.Search
      break
    default:
      presenceData.details = 'Browsing'
      break
  }
  presence.setActivity(presenceData)
})
