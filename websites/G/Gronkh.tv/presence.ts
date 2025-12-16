import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1396486294779068416',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/Gronkh.tv/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
    details: 'Gronkh.tv',
    state: 'Viewing other pages',
  }

  const curURL = document.location.pathname

  if (curURL.startsWith('/streams')) {
    presenceData.details = 'Gronkh.tv'
    presenceData.state = 'Viewing all streams'
  }
  else if (curURL.includes('streams')) {
    const el = document.querySelector('video')
    if (el instanceof HTMLVideoElement) {
      const timestamps = getTimestamps(el.currentTime, el.duration)
      const isPlaying = !el.paused && !el.ended && el.readyState > 2
      if (isPlaying) {
        presenceData.smallImageKey = Assets.Play
      }
      else {
        presenceData.smallImageKey = Assets.Pause
      }
      presenceData.startTimestamp = timestamps[0]
      presenceData.endTimestamp = timestamps[1]
    }
    const match = curURL.match(/\/streams\/(\d+)/)
    const videoId = match?.[1] || null
    const videoTitle = document.querySelector('.g-video-meta-title')?.textContent?.trim()
    const detailsText = `${videoTitle} · #${videoId}`
    presenceData.details = detailsText
    presenceData.buttons = [
      {
        label: 'Watch Together',
        url: curURL,
      },
    ]
  }
  else if (curURL.startsWith('/landing')) {
    presenceData.details = 'Gronkh.tv'
    presenceData.state = 'Viewing the landing page'
  }
  else if (curURL.startsWith('/watchparties')) {
    presenceData.details = 'Gronkh.tv'
    presenceData.state = 'Viewing watchparties'
  }
  else if (curURL.startsWith('/live/GronkhTV')) {
    presenceData.details = 'Gronkh.tv'
    presenceData.smallImageKey = Assets.Play
    const stateText = `Watching Gronkh\'s live stream`
    presenceData.state = stateText
  }
  presence.setActivity(presenceData)
})
