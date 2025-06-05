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
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Vidoza/assets/logo.png',
    name: 'Vidoza',
  }
  const { pathname } = document.location
  const video = document.querySelector<HTMLVideoElement>('video')

  if (pathname.includes('embed-')) {
    delete presenceData.startTimestamp
    const el = document
      .querySelector('.body-container')
      ?.querySelectorAll('[type="text/javascript"]')
    const title = el?.[el.length - 1]?.innerHTML
      .split('var curFileName =')?.[1]
      ?.replace(/(\.)/g, ' ')
      .replace('"', '')

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
