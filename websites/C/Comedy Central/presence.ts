import { Assets } from 'premid'

const presence = new Presence({
  clientId: '630533580119998496',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Comedy%20Central/assets/logo.png',
  }

  if (document.location.pathname.startsWith('/episodes')) {
    const player = document.querySelector<HTMLVideoElement>(
      '.edge-player-content-element',
    )!
    let epNumber: string | Element | HTMLElement = document.querySelector('.meta span') ?? ''
    epNumber &&= `${(epNumber as HTMLElement).textContent?.replace('Season ', 'S').replace(' Ep ', ':E')} `
    epNumber ??= '';

    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      Math.floor(player.currentTime),
      Math.floor(player.duration),
    )

    presenceData.details = document.querySelector('.header h3 a')?.textContent
    presenceData.state = epNumber + document.querySelector('.sub-header h1')?.textContent
    presenceData.smallImageKey = player.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = player.paused
      ? (await strings).pause
      : (await strings).play

    if (player.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presence.setActivity(presenceData)
  }
  else {
    presenceData.details = 'Browsing...'
    presenceData.startTimestamp = Date.now()

    presence.setActivity(presenceData)
  }
})
