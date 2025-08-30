import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1411061270668378122',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/6gzGsDp.png',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const { pathname } = document.location

  if (pathname === '/area/vitrine') {
    presenceData.details = 'Navegando no FSC'
    presenceData.state = 'Buscando algo para estudar'
  }
  else if (pathname.includes('area/produto/item')) {
    const titleElement = document.querySelector('body > div.content-wrapper.bg-transparent.center > div > div > div.col-lg-9.mx-auto.order-2.order-sm-1 > div.breadcrumb > ul > li:nth-child(2) > a')

    if (titleElement && titleElement.textContent) {
      presenceData.details = `Trilha: ${titleElement.textContent}`
    }
    else {
      presenceData.details = 'Estudando, não incomode 📚'
    }
    const subtitleElement = document.querySelector('.breadcrumb-title.text-center.text-sm-left.py-4.py-sm-0.pb-sm-3')
    if (subtitleElement && subtitleElement.textContent) {
      presenceData.state = `Assistindo a aula: ${subtitleElement.textContent}`
    }
    else {
      presenceData.state = `Aperfeiçoando minhas habilidades`
    }
  }
  else {
    presenceData.details = 'Navegando pelo FSC'
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
