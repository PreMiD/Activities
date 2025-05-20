import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1343395168530726962',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/Wave%20FM/assets/logo.png',
  LogoPop = 'https://cdn.rcd.gg/PreMiD/websites/W/Wave%20FM/assets/0.png',
}

presence.on('UpdateData', async () => {
  const player = document.querySelector('#pause-btn')?.getAttribute('style') === 'display: inline;'
  const artistName = document.querySelector('#song-artist')?.textContent
  const musicName = document.querySelector('#song-title')?.textContent
  const presenceData: PresenceData = {
    largeImageKey: document.querySelector<HTMLImageElement>('#song-image')?.src,
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    if (player === true) {
      (presenceData as PresenceData).type = ActivityType.Listening
      presenceData.details = musicName
      presenceData.state = artistName
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).play
    }
    else {
      presenceData.largeImageKey = ActivityAssets.Logo
      presenceData.details = 'Página inicial'
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = (await strings).pause
    }
  }
  else if (document.location.pathname === '/pop/') {
    if (player === true) {
      (presenceData as PresenceData).type = ActivityType.Listening
      presenceData.name = 'WavePop'
      presenceData.details = musicName
      presenceData.state = artistName
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).play
    }
    else {
      presenceData.name = 'WavePop'
      presenceData.largeImageKey = ActivityAssets.LogoPop
      presenceData.smallImageKey = Assets.Pause
      presenceData.details = 'Página inicial'
      presenceData.smallImageText = (await strings).pause
    }
  }
  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
