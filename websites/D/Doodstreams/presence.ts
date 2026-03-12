import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.round(Date.now() / 1000)
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Doodstreams/assets/logo.png',
    name: 'Doodstreams',
  }
  const { pathname } = document.location
  const video = document.querySelector<HTMLVideoElement>('video')
  const title = document.querySelector('title')?.textContent

  if (pathname.includes('/e/')) {
    delete presenceData.startTimestamp
    presenceData.details = title?.split(' S0')?.[0] ?? title
    presenceData.state = title?.match(/S\d*E\d* /g)?.[0]

    if (video && !Number.isNaN(video.duration)) {
      if (!video.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
      }
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused
        ? (await strings).pause
        : (await strings).play
    }
  }

  presence.setActivity(presenceData)
})
