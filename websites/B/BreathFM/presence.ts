const presence = new Presence({
  clientId: '846282107462352927',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  let presenceData: PresenceData
  if (
    'mediaSession' in navigator
    && navigator.mediaSession.metadata
    && !document.querySelector<HTMLAudioElement>('audio')?.paused
  ) {
    presenceData = {
      largeImageKey: navigator.mediaSession.metadata.artwork[0]?.src,
      details: navigator.mediaSession.metadata.title,
      state: navigator.mediaSession.metadata.artist,
      buttons: [
        {
          label: 'Listen',
          url: location.href,
        },
      ],
    }
  }
  else {
    presenceData = {
      startTimestamp: browsingTimestamp,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/BreathFM/assets/0.jpg',
    }
    switch (location.pathname.replace('/', '')) {
      case 'history':
        presenceData.details = 'Schaut die Historie an'
        break
      case 'bots':
        presenceData.details = 'Interresiert sich für die Bots'
        break
      case 'status':
        presenceData.details = 'Schaut sich den Status an'
        presenceData.state = `${
          document.querySelectorAll('[class="online"]')?.length
        } von ${
          document.querySelectorAll('[class="monitor"]')?.length
        } Services Online`
        break
      case 'impressum':
        presenceData.details = 'Schaut sich das Impressum an'
        break
      case 'changelog':
        presenceData.details = 'Schaut sich die Änderungen an'
        break
      case 'dashboard':
        presenceData.details = 'Schaut sich im Dashboard um'
        break
      case 'datenschutz':
        presenceData.details = 'Schaut sich den Datenschutz an'
        break
      default:
        presenceData.details = 'Durch Stöbert die Webseite'
    }
  }
  presence.setActivity(presenceData)
})
