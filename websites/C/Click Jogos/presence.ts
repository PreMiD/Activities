import { Assets } from 'premid'

const presence = new Presence({
  clientId: '692436770775760927',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  search: 'general.searching',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Click%20Jogos/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Página Inicial'
  }
  else if (document.location.pathname.includes('/categorias')) {
    presenceData.details = 'Categorias'
  }
  else if (document.location.pathname.includes('/busca/')) {
    presenceData.details = 'Pesquisando por:'
    presenceData.state = document.querySelector('input')?.value
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = (await strings).search
  }
  else if (document.location.pathname.includes('/jogos/')) {
    if (
      document.querySelector(
        '#game_src > div.fullscreen-header > div:nth-child(1) > div > div > div:nth-child(2) > a > h1',
      )
    ) {
      presenceData.details = 'Jogando:'
      presenceData.state = document.querySelector(
        '#game_src > div.fullscreen-header > div:nth-child(1) > div > div > div:nth-child(2) > a > h1',
      )?.textContent
    }
    else {
      presenceData.details = 'Jogando:'
      presenceData.state = document.querySelectorAll('.game-header-title')[0]?.textContent
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
