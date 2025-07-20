import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1396486294779068416',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://i.imgur.com/rZooYzo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
    // smallImageKey: Assets.Play,
    endTimestamp: undefined,
    details: 'Viewing Gronkh.tv',
  }

  const curURL = document.location.href

  if (curURL.includes('streams')) {
    const el = document.querySelector('video');
    if (el instanceof HTMLVideoElement) {
      const timestamps = presence.getTimestamps(el.currentTime, el.duration);
      const isPlaying = !el.paused && !el.ended && el.readyState > 2;
      if (isPlaying) {
        presenceData.smallImageKey = Assets.Play
      }
      else {
        presenceData.smallImageKey = Assets.Pause
      }
      presenceData.startTimestamp = timestamps[0];
      presenceData.endTimestamp = timestamps[1];
    }
    const match = curURL.match(/\/streams\/(\d+)/)
    const videoId = match?.[1] || null
    const videoTitle = document.querySelector('.g-video-meta-title')?.textContent?.trim()
    const detailsText = `${videoTitle} · #${videoId}`
    presenceData.details = detailsText;
    presenceData.buttons = [
      {
        label: 'Watch Together',
        url: curURL
      }
    ]
  }
  presence.setActivity(presenceData)
})
