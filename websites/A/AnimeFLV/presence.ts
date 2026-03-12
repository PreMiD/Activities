import { Assets } from 'premid'

const presence = new Presence({
  clientId: '634081860972052490',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
})
let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeFLV/assets/logo.jpg',
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  if (
    video
    && !Number.isNaN(video.duration)
    && document.location.pathname.includes('/ver')
  ) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )

    presenceData.details = document.querySelector(
      '#XpndCn .Title, .CapiCnt .Title',
    )?.textContent ?? ''
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).pause
      : (await strings).play

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presence.setActivity(presenceData, !video.paused)
  }
  else {
    presenceData.details = (await strings).browsing
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = (await strings).browsing
    presence.setActivity(presenceData)
  }
})
