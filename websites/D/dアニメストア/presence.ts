import { Assets } from 'premid'

const presence = new Presence({
  clientId: '611012705306017792',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

presence.on('UpdateData', async () => {
  if (
    location.pathname.startsWith('/animestore/sc_d_pc')
    && document.querySelector('#video')
  ) {
    const video = document.querySelector<HTMLVideoElement>('#video')
    const isPlaying = video && !video.paused
    const presenceData: PresenceData = {
      details: `${document.querySelector('.backInfoTxt1')?.textContent} - ${
        document.querySelector('.backInfoTxt2')?.textContent
      }`,
      state: document.querySelector('.backInfoTxt3')?.textContent,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/d%E3%82%A2%E3%83%8B%E3%83%A1%E3%82%B9%E3%83%88%E3%82%A2/assets/logo.png',
      smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
      smallImageText: isPlaying
        ? (await strings).play
        : (await strings).pause,
      startTimestamp: Math.floor(Date.now() / 1000) - Math.floor(video?.currentTime ?? 0),
    }

    if (!isPlaying)
      delete presenceData.startTimestamp

    presence.setActivity(presenceData)
  }
})
