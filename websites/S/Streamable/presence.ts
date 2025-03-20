import { Assets } from 'premid'

const presence = new Presence({
  clientId: '630847999106482176',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Streamable/assets/logo.png',
  }
  const player = document.querySelector<HTMLVideoElement>('.video-player-tag')

  if (player) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      Math.floor(player.currentTime),
      Math.floor(player.duration),
    )

    presenceData.details = document.querySelector('.metadata #title')?.textContent
    presenceData.state = document.querySelector('.metadata #visits')?.textContent
    presenceData.smallImageKey = player.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = player.paused
      ? (await strings).pause
      : (await strings).play

    if (player.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else {
    presenceData.details = 'Browsing...'
    presenceData.startTimestamp = Date.now()
  }
  presence.setActivity(presenceData)
})
