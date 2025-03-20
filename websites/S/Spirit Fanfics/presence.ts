import { Assets } from 'premid'

const presence = new Presence({
  clientId: '628786533587091490',
})
const { pathname } = window.location
const strings = presence.getStrings({
  browsing: 'general.browsing',
  searching: 'general.searching',
  reading: 'general.reading',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Spirit%20Fanfics/assets/logo.png',
    startTimestamp: Math.floor(Date.now() / 1000),
    details: (await strings).browsing,
  }
  const nav = document.querySelector('#secaoNav')?.lastChild?.textContent
  if (pathname.startsWith('/historia')) {
    if (pathname.startsWith('/historia/gerenciar')) {
      if (pathname === '/historia/gerenciar') {
        presenceData.details = 'Vendo Minhas Histórias'
      }
      else if (nav === 'Gerenciar Capítulos') {
        presenceData.details = 'Gerenciando capítulos';
        [presenceData.state] = document
          .querySelector('.tituloPrincipal')
          ?.textContent
          ?.replace('História ', '')
          .split(' - ') ?? []
      }
    }
    else if (
      pathname.startsWith('/historia/adicionar')
      || pathname.startsWith('/historia/termos')
    ) {
      if (nav === 'Adicionar História' || nav === 'Termos') {
        presenceData.details = 'Criando uma nova história'
      }
      else if (nav === 'Adicionar Capítulo') {
        presenceData.details = 'Escrevendo um novo capítulo';
        [presenceData.state] = document
          .querySelector('.tituloPrincipal')
          ?.textContent
          ?.replace('História ', '')
          .split(' - ') ?? []
        presenceData.smallImageKey = Assets.Writing
        presenceData.smallImageText = 'Escrevendo'
      }
    }
    else if (pathname.startsWith('/historia/editar')) {
      presenceData.details = 'Editando uma história'
      presenceData.state = document
        .querySelector('.tituloPrincipal')
        ?.textContent
        ?.replace('Editar História ', '')
    }
    else if (pathname.startsWith('/historia/apagar')) {
      presenceData.details = 'Apagando uma história'
      presenceData.state = document
        .querySelector('.tituloPrincipal')
        ?.textContent
        ?.replace('Apagar História ', '')
    }
    else {
      const title = document
        .querySelector('.tituloPrincipal')
        ?.textContent
        ?.replace('História ', '')
        .split(' - ') ?? []
      if (pathname.match(/\/historia\/(\w+-)+\d+\/\w+/)) {
        [presenceData.details] = title
        presenceData.state = `${title[1]} - ${nav}`
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = (await strings).reading
      }
      else {
        presenceData.details = 'Vendo uma história';
        [presenceData.state] = title
      }
    }
  }
  else if (pathname.startsWith('/perfil')) {
    presenceData.details = 'Vendo um perfil'
    presenceData.state = nav
  }
  else if (pathname.startsWith('/home')) {
    presenceData.state = 'Home'
  }
  else if (pathname.startsWith('/aulas')) {
    presenceData.details = 'Vendo aulas'
    if (nav !== 'Aulas')
      presenceData.state = nav
  }
  else if (pathname.startsWith('/generos')) {
    presenceData.details = 'Navegando por gênero'
    if (nav !== 'Gêneros')
      presenceData.state = nav
  }
  else if (pathname.startsWith('/categorias')) {
    presenceData.details = 'Navegando por categorias'
    if (nav !== 'Categorias')
      presenceData.state = nav
  }
  else if (pathname.startsWith('/tags')) {
    presenceData.details = 'Navegando por tags'
    if (nav !== 'Tags populares')
      presenceData.state = nav
  }
  else if (pathname.startsWith('/historico')) {
    presenceData.details = 'Vendo o histórico'
  }
  else if (pathname.startsWith('/grupos')) {
    presenceData.state = 'Vendo grupos'
  }
  else if (pathname.startsWith('/busca')) {
    presenceData.details = `${(await strings).searching}...`
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = (await strings).searching
  }
  else {
    presenceData.state = nav
  }

  presence.setActivity(presenceData, true)
})
