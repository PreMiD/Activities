import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1411061270668378122',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/uiKB6mM.png',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const { pathname } = document.location

  if (pathname.includes('pos/curso/')) {
    const titleElement = document.querySelector('#video-wrapper .col-8 span')

    if (titleElement && titleElement.textContent) {
      presenceData.details = `Pós-graduação: ${titleElement.textContent}`
    }
    else {
      presenceData.details = 'Navegando no Gran Cursos Online'
    }
    const subtitleElement = document.querySelector('#menu-container .font-weight-600.cursor-pointer > span')
    if (subtitleElement && subtitleElement.textContent) {
      presenceData.state = `Assistindo a aula: ${subtitleElement.textContent}`
    }
    else {
      presenceData.state = `Buscando algo para estudar`
    }

    const video = document.querySelector('video')

    if (video && video.duration && !video.paused) {
      const now = Math.floor(Date.now() / 1000)

      presenceData.startTimestamp = now - video.currentTime
      presenceData.endTimestamp = presenceData.startTimestamp + video.duration
    }
  }
  else {
    presenceData.details = 'Navegando no Gran Cursos Online'
    presenceData.state = 'Gran Faculdade'
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
