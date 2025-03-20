import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1221866611611402363',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/RadiosNet/assets/logo.png',
}

const { pathname, href, search } = document.location

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (pathname === '/') {
    presenceData.details = 'Página Inicial'
  }
  else if (pathname.includes('/favoritos')) {
    presenceData.details = 'Favoritos'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/lista/pais/brasil/33')) {
    presenceData.details = 'Rádios do Brasil'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/lista/pais')) {
    if (
      document.querySelector('.page-header')?.textContent === 'Lista de países'
    ) {
      presenceData.details = 'Rádios Internacionais'
      presenceData.smallImageKey = Assets.Search
    }
    else {
      presenceData.details = `Navegando pelas rádios de "${
        document.querySelector('.page-header')?.textContent?.split(': ')[1]
      }"`
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (pathname.includes('/radio/cidade')) {
    presenceData.details = `Navegando pelas rádios de "${
      document.querySelector('.page-header')?.textContent?.split(': ')[1]
    }"`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/lista/segmento')) {
    presenceData.details = 'Gêneros'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/radio/segmento')) {
    presenceData.details = `Navegando pelo gênero "${
      document.querySelector('.page-header')?.textContent?.split(': ')[1]
    }"`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/futebol')) {
    presenceData.details = 'Futebol ao Vivo'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/estatistica')) {
    presenceData.details = 'Estatística'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/adicionar')) {
    presenceData.details = 'Adicionar Rádio'
    presenceData.smallImageKey = Assets.Writing
  }
  else if (pathname.includes('/atualizar')) {
    presenceData.details = 'Atualizar Rádio'
    presenceData.smallImageKey = Assets.Writing
  }
  else if (pathname.includes('/excluir')) {
    presenceData.details = 'Excluir Rádio'
    presenceData.smallImageKey = Assets.Stop
  }
  else if (pathname.includes('/anunciar')) {
    presenceData.details = 'Anunciar Rádio'
    presenceData.smallImageKey = Assets.Live
  }
  else if (pathname.includes('/divulgue')) {
    presenceData.details = 'Divulgação'
    presenceData.smallImageKey = Assets.Call
  }
  else if (pathname.includes('/contato')) {
    presenceData.details = 'Contato'
    presenceData.smallImageKey = Assets.Call
  }
  else if (pathname.includes('/privacidade')) {
    presenceData.details = 'Políticas de Privacidade'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/tos')) {
    presenceData.details = 'Termos de Serviço'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/lista')) {
    presenceData.details = `Navegando pelas rádios de "${
      document.querySelector('.page-header')?.textContent?.split(': ')[1]
    }"`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/busca')) {
    presenceData.details = `Buscando por "${search
      .split('=')[1]
      ?.split('&')[0]
      ?.replace('+', ' ')}"`

    presenceData.smallImageKey = Assets.Search
  }
  else if (
    pathname.includes('/aovivo/')
    || href.includes('play.radios.com.br/')
  ) {
    presenceData.details = document
      .querySelector('.info')
      ?.textContent
      ?.split('\n')[1]

    const slogan = document.querySelector('.info')?.textContent?.split('\n')[3]

    if (slogan) {
      presenceData.smallImageText = slogan
    }
    else {
      presenceData.smallImageText = 'Desde 1997 trazendo o melhor compilado de emissoras de rádio!'
    }

    presenceData.state = document
      .querySelector('.info')
      ?.textContent
      ?.split('\n')[2]
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.img-rounded')?.src
    presenceData.smallImageKey = Assets.PremiereLive
  }

  presence.setActivity(presenceData)
})
