const presence = new Presence({
  clientId: '1061398473368412210',
})
async function getStrings() {
  return presence.getStrings(
    {
      buttonListenAlong: 'general.buttonListenAlong',
      listeningMusic: 'general.listeningMusic',
      pause: 'general.paused',
      live: 'general.live',
      viewPage: 'general.viewPage',
    },

  )
}

presence.on('UpdateData', async () => {
  const [strings, buttons] = await Promise.all([
    getStrings(),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Vodafone%20FM/assets/logo.png',
    details: strings.listeningMusic,
  }

  if (document.querySelector('#play')?.classList.contains('hidden')) {
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/V/Vodafone%20FM/assets/0.png'
    presenceData.smallImageText = strings.live
  }
  else {
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/V/Vodafone%20FM/assets/1.png'
    presenceData.smallImageText = strings.pause
  }

  const artist = document.querySelector('#artist_name')?.textContent
  const song = document.querySelector('#song_name')?.textContent
  if (artist && song) {
    presenceData.details = song
    presenceData.state = artist
  }

  const cover = document.querySelector<HTMLImageElement>('#cover')
  if (cover && !cover.src.includes('/images/nocover.png'))
    presenceData.largeImageKey = cover.src

  if (buttons) {
    presenceData.buttons = [
      {
        label: strings.buttonListenAlong,
        url: document.URL,
      },
    ]
  }

  presence.setActivity(presenceData)
})
