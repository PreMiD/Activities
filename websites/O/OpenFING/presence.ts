const presence = new Presence({
  clientId: '968736771061985410',
})

let iFrameTime = -1

presence.on('iFrameData', (data: unknown) => {
  iFrameTime = data as number
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/OpenFING/assets/logo.png',
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'En la pantalla de Inicio'
  }
  else if (document.location.pathname === '/courses') {
    presenceData.details = 'Viendo los Cursos'
  }
  else if (document.location.pathname.includes('/courses')) {
    presenceData.details = `${
      document.querySelector('title')?.textContent?.split(' - OpenFING')[0]
    }`
    const div = document.querySelectorAll('.dropdownListContainer-121')
    let clase = ''
    if (div.length >= 1) {
      const list = div.item(0).children

      for (let i = 0; i < list.length; i++) {
        if (list.item(i)?.className.includes('active'))
          clase = list.item(i)!.textContent!
      }
    }

    const path = document.location.pathname.split('/')
    if (path.length >= 4) {
      presenceData.state = `Clase ${path[3]} ${clase}`
      let time = 0
      if (iFrameTime > -1)
        time = iFrameTime
      else if (document.querySelector('video') !== null)
        time = Math.floor(document.querySelector('video')!.currentTime)
      presenceData.startTimestamp = Math.floor(Date.now() / 1000) - time
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
