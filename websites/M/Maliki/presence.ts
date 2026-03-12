const presence = new Presence({
  clientId: '990204576189808670',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

interface SongPlayingData {
  artist: string
  song: string
}

let songInfo: SongPlayingData | null = null

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Maliki/assets/0.png',
  Malimode = 'https://cdn.rcd.gg/PreMiD/websites/M/Maliki/assets/1.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: document.location.hostname === 'malimode.maliki.com'
      ? ActivityAssets.Malimode
      : ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [privacy, time] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
  ])
  if (!time)
    delete presenceData.startTimestamp

  switch (document.location.pathname) {
    case '/':
      presenceData.details = document.location.hostname === 'malimode.maliki.com'
        ? 'Regarde la page principale du malimode'
        : 'Regarde la page principale'
      break
    case '/strips/':
      presenceData.details = 'Parcours les strips'
      break
    case '/actualites/':
      presenceData.details = 'Parcours les actualités'
      break
    case '/bonus/':
      presenceData.details = 'Parcours les bonus'
      break
    case '/radio/':
      if (!songInfo || privacy) {
        presenceData.details = 'Écoute la radio'
      }
      else {
        presenceData.details = `Écoute ${songInfo.song}`
        presenceData.state = `De ${songInfo.artist}`
      }
      break
    case '/shop/':
      presenceData.details = 'Parcours le shop'
      break
    case '/events/':
      presenceData.details = 'Se renseigne sur les futurs événements'
      break
    case '/faq/':
      presenceData.details = 'Lis la foire aux questions'
      break
    case '/personnalisation':
      presenceData.details = 'Personnalise son personnage'
      presenceData.largeImageKey = ActivityAssets.Malimode
      break
    case '/partager':
      presenceData.details = 'Partage son personnage'
      presenceData.largeImageKey = ActivityAssets.Malimode
      break
    default: {
      if (document.location.pathname.includes('/strips/')) {
        // If we are on a strip page, modify the details
        presenceData.details = privacy ? 'Lis un strip' : 'Lis le strip :'
        if (!privacy) {
          presenceData.state = document.querySelector('.singleTitle')?.textContent
        }
      }
      if (document.location.pathname.includes('/bonus/')) {
        // If we are on a bonus page, modify the details
        presenceData.details = privacy
          ? 'Regarde un bonus'
          : 'Regarde le bonus :'
        if (!privacy) {
          presenceData.state = document.querySelector('.singleTitle')?.textContent
        }
      }
      if (
        document
          .querySelector('.singleContentShare--title')
          ?.textContent
          ?.includes('actualité')
      ) {
        // If we are on a page about actuality, modify the details
        presenceData.details = privacy
          ? 'Lis une actualité'
          : 'Lis l\'actualité :'
        if (!privacy) {
          presenceData.state = document.querySelector(
            '.singleHeader--title',
          )?.textContent
        }
      }
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

presence.on('iFrameData', (data: unknown) => {
  songInfo = data as SongPlayingData
})
