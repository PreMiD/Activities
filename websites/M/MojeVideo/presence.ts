import { Assets } from 'premid'

const presence = new Presence({
  clientId: '776113876605337660',
})
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MojeVideo/assets/logo.png',
}

presence.on('UpdateData', async () => {
  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})

function RefreshData() {
  if (document.querySelector('#video-comment')) {
    const mvTime = document.querySelector('#mv-tm')
    const [mvCaptionH1] = document
      .querySelector('#video-comment')
      ?.querySelectorAll('h1') ?? []
    const videoName = mvCaptionH1 ? mvCaptionH1.textContent : 'Unknown video'

    if (mvTime) {
      presenceData.details = videoName
      presenceData.state = mvTime.textContent
    }
    else {
      presenceData.details = 'Sleduje video'
      presenceData.state = videoName
    }
    presenceData.smallImageKey = document.querySelector<HTMLElement>('#mv-pl')?.style.visibility
      !== 'visible'
      ? Assets.Play
      : Assets.Pause
  }
  else {
    let actualUrl = window.location.toString()
    const actualTitle = document.title

    actualUrl = actualUrl.replace('https://www.mojevideo.sk/', '')
    actualUrl = actualUrl.replace('https://mojevideo.sk/', '')
    actualUrl = actualUrl.replace('mesiac/', '')
    actualUrl = actualUrl.replace('celkovo/', '')

    if (actualUrl === '') {
      presenceData.details = 'Hlavná stránka'
    }
    else if (!actualTitle.startsWith('Videá - mojeVideo.sk')) {
      if (actualTitle.includes('.strana'))
        [presenceData.details, presenceData.state] = actualTitle.split(' - ')
      else presenceData.details = actualTitle
    }
    else {
      let extraPage = 'Hlavná stránka'
      let extraPageNumber = 0
      const urlPieces = actualUrl.split('/')

      for (const urlPiece of urlPieces) {
        if (urlPiece.includes('strana_')) {
          extraPageNumber = Number.parseInt(urlPiece.replace('strana_', '')) || 0
          extraPageNumber++
        }
      }

      if (actualUrl.includes('prihlasenie'))
        extraPage = 'Prihlásenie'
      else if (actualUrl.includes('registracia'))
        extraPage = 'Registrácia'
      presenceData.details = extraPage
      if (extraPageNumber !== 0)
        presenceData.state = `${extraPageNumber}.strana`
    }
  }
  presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MojeVideo/assets/logo.png'
}

setInterval(RefreshData, 1000)
