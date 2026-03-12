import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '896323132871299103',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}

presence.on(
  'iFrameData',
  (data: { duration: number, currentTime: number, paused: boolean }) => {
    video = data
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Tio%20Anime/assets/logo.png',
    startTimestamp: browsingTimestamp,
  } as PresenceData
  const [privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<string>('buttons'),
  ])
  const { href, pathname } = document.location

  if (pathname === '/') {
    presenceData.details = 'En la página de inicio'
  }
  else if (pathname.includes('/anime/')) {
    if (!privacy) {
      presenceData.buttons = [
        {
          label: 'Ver Anime',
          url: href,
        },
      ]
      presenceData.details = 'Viendo lista de episodios:'
      presenceData.state = document.querySelector('.title')?.textContent
    }
    else {
      presenceData.details = 'Viendo lista de episodios'
    }
  }
  else if (pathname.includes('/ver/')) {
    presenceData.type = ActivityType.Watching
    presenceData.buttons = [
      {
        label: 'Ver Capítulo',
        url: href,
      },
    ]
    const capt = document.querySelector('h1')?.textContent
    presenceData.details = 'Viendo Anime:'
    presenceData.state = `${capt?.substring(
      0,
      document.querySelector('h1')?.textContent?.lastIndexOf(' ') ?? 0,
    )} capítulo ${capt?.split(' ').pop()}`;
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )
    presenceData.smallImageKey = video.paused ? Assets.Stop : Assets.Play
    presenceData.smallImageText = video.paused
      ? 'Capítulo pausado'
      : 'Reproduciendo capítulo'
    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else {
    presenceData.type = ActivityType.Watching
    presenceData.details = 'Viendo anime'
    presenceData.smallImageKey = video.paused ? Assets.Stop : Assets.Play
    presenceData.smallImageText = video.paused
      ? 'Capítulo pausado'
      : 'Reproduciendo capítulo'
  }

  switch (pathname) {
    case '/directorio':
      presenceData.details = 'Viendo el directorio de animes'
      break
    case '/programacion':
      presenceData.details = 'Viendo la programación Semanal'
      break
    case '/peticiones':
      presenceData.details = 'Viendo peticiones'
      break
  }

  if ((privacy || !buttons) && presenceData.buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
