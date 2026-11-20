import { ActivityType, Assets, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1159205639852138628',
})
const strings = presence.getStrings({
  play: 'general.playing',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/R%C3%A1dio%20Animu/assets/logo.png',
    startTimestamp: browsingTimestamp,
  } as PresenceData

  const player = document.querySelector('#animu-player')
  const song = player?.shadowRoot?.querySelector('.ap-musica-texto')?.textContent?.trim()

  // if the player is playing, set the presence to listening with the song details
  if (player?.classList.contains('ap-tocando')) {
    presenceData.type = ActivityType.Listening
    const separatorIndex = song?.indexOf(' - ') ?? -1
    if (separatorIndex > 0) {
      presenceData.details = song?.slice(0, separatorIndex)
      presenceData.state = song?.slice(separatorIndex + 3)
    }
    else {
      presenceData.details = song
    }
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = (await strings).play
    presenceData.largeImageKey = player.shadowRoot
      ?.querySelector<HTMLImageElement>('.ap-capa img')
      ?.src
      ?? presenceData.largeImageKey
    presenceData.largeImageText = player.shadowRoot
      ?.querySelector('.ap-anime')
      ?.textContent
      ?.trim()
    presenceData.statusDisplayType = StatusDisplayType.Details
  }
  else if (document.location.pathname.includes('/grade/')) {
    presenceData.details = 'Grade de Programação'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/pedidos/')) {
    presenceData.details = 'Pedidos'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/equipe/')) {
    presenceData.details = 'Equipe'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/sobre/')) {
    presenceData.details = 'Sobre'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/fazerparte/')) {
    presenceData.details = 'Faça Parte da Equipe'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/parceria/')) {
    presenceData.details = 'Parceria'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/suafansingaqui/')) {
    presenceData.details = 'Sua Fansing Aqui'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/historia/')) {
    presenceData.details = 'História'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname === '/') {
    presenceData.details = 'Página inicial'
    presenceData.smallImageKey = Assets.Reading
  }
  else {
    presenceData.details = 'Algures por aqui...'
    presenceData.smallImageKey = Assets.Reading
  }

  if (!presenceData.details)
    presence.clearActivity()
  else presence.setActivity(presenceData)
})
