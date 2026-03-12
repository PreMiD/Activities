import { Assets } from 'premid'

const presence = new Presence({
  clientId: '624914025247146000',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Sunshine%20Live/assets/logo.png',
}

presence.on('UpdateData', () => {
  let paused = true
  const { children } = document.querySelector('#audioPlayer-controls-buttons')!
  for (let i = 0; i < children.length; i++) {
    if (children[i]!.id === 'stopButton')
      paused = false
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: paused ? Assets.Pause : Assets.Play,
    smallImageText: paused ? 'Pausiert' : 'Spielt',
    details: `Channel: ${
      document.querySelectorAll('.trackInfos-stream')[0]?.textContent
    }`,
    state: `${
      document.querySelectorAll('.trackInfos-artist')[0]?.textContent
    } - ${document.querySelectorAll('.trackInfos-title')[0]?.textContent}`,
  }
  presence.setActivity(presenceData)
})
