const presence = new Presence({
  clientId: '622436057866043434',
})
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Brony%20Radio%20Germany/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const audio = document.querySelector<HTMLAudioElement>('#jp_audio_0')
  if (audio) {
    const title = document.querySelector<HTMLElement>('.brg-player-title')

    presenceData.details = title
      ? (title as HTMLElement).textContent
      : 'Title not found...'
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/B/Brony%20Radio%20Germany/assets/logo.png'

    if (title)
      presence.setActivity(presenceData, !audio.paused)
  }
  else {
    presence.setActivity({
      details: 'Browsing..',
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Brony%20Radio%20Germany/assets/logo.png',
    })
  }
})
