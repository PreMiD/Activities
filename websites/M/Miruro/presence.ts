import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1498739119990378626', 
})
const browsingTimestamp = Math.floor(Date.now() / 1000)


let iframeData: { currTime: number; duration: number; paused: boolean } | null = null


presence.on('iFrameData', (data: any) => {
  iframeData = data
})

enum ActivityAssets {
  Logo = 'https://i.postimg.cc/N0ZsxZxb/favicon-V2.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }
  
  const usePresenceName = await presence.getSetting<boolean>('usePresenceName')
  const { href, pathname, search } = document.location
  
  switch (true) {
    case pathname === '/':
    case pathname === '/home':
      presenceData.details = 'Viewing Homepage'
      break
    case pathname === '/search':
      presenceData.details = `Viewing results: ${search.split('=')[1]?.replace(/\+/g, ' ')}`
      break
    case pathname.includes('/watch'): {
      
      const rawTitle = document.title
        .replace(/^Watch\s/i, '') 
        .replace(/\s*[·\-]\s*Miruro.*$/i, '') 
      const title = rawTitle ? rawTitle.trim() : 'Watching Anime'

      const coverArt = 
        document.querySelector<HTMLImageElement>('img[class*="coverImg"]')?.src ||
        document.querySelector<HTMLImageElement>('img[class*="poster"]')?.src ||
        document.querySelector<HTMLImageElement>('img[src*="anilist"]')?.src

      const urlParams = new URLSearchParams(window.location.search)
      const episodeNumber = urlParams.get('ep') || urlParams.get('episode')

      let episodeName = document.querySelector('.ep-title')?.textContent
      if (episodeName) {
        episodeName = episodeName.replace(/^(EP\s*\d+|Episode\s*\d+|\d+)\s*[·•\-.:|]?\s*/i, '').trim()
      }

      if (usePresenceName) {
        presenceData.name = title
        presenceData.details = episodeNumber ? `Episode ${episodeNumber}` : 'Watching'
        presenceData.state = episodeName || 'Enjoying the anime'
      }
      else {
        presenceData.details = title
        presenceData.state = episodeNumber 
          ? (episodeName ? `Ep ${episodeNumber}: ${episodeName}` : `Episode ${episodeNumber}`) 
          : (episodeName || 'Enjoying the anime')
      }
      
      presenceData.largeImageKey = coverArt ?? ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: 'View Anime',
          url: href,
        },
      ]

    
      const localVideo = document.querySelector<HTMLVideoElement>('video')

     
      if (iframeData) {
        if (!iframeData.paused) {
          const timestamps = getTimestamps(iframeData.currTime, iframeData.duration)
          presenceData.startTimestamp = timestamps[0]
          presenceData.endTimestamp = timestamps[1]
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Playing on Embed'
        } else {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
        }
      } 
     
      else if (localVideo) {
        if (!localVideo.paused && !Number.isNaN(localVideo.duration)) {
          const timestamps = getTimestamps(localVideo.currentTime, localVideo.duration)
          presenceData.startTimestamp = timestamps[0]
          presenceData.endTimestamp = timestamps[1]
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Playing'
        } else {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
        }
      }
      
      break
    }
    default:
      presenceData.details = 'Browsing Miruro...'
      break
  }
  
  presence.setActivity(presenceData)
})