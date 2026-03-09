import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({ clientId: '1480496528480272434' })
const started = Math.floor(Date.now() / 1000)
const logo = 'https://images2.imgbox.com/61/3e/k60NIdDv_o.jpg'

let vid: { duration: number; currentTime: number; paused: boolean } | null = null

presence.on('iFrameData', (data: typeof vid) => {
  vid = data
})

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const pd: PresenceData = {
    largeImageKey: logo,
    startTimestamp: started,
  }

  const h1 = document.querySelector('h1')?.textContent?.trim()

  if (/^\/\d+-/.test(pathname)) {
    ;(pd as any).type = ActivityType.Watching
    pd.details = h1 || 'Смотрит аниме'

    const poster = document.querySelector<HTMLImageElement>('img[alt*="Постер"]')
    if (poster?.src)
      pd.largeImageKey = poster.src

    if (vid && vid.duration > 0) {
      if (vid.paused) {
        pd.smallImageKey = Assets.Pause
        pd.smallImageText = 'На паузе'
        delete pd.startTimestamp
      }
      else {
        pd.smallImageKey = Assets.Play
        pd.smallImageText = 'Смотрит'
        ;[pd.startTimestamp, pd.endTimestamp] = getTimestamps(
          Math.floor(vid.currentTime),
          Math.floor(vid.duration),
        )
      }
    }
    else {
      pd.state = 'Читает описание'
    }

    const btn = await presence.getSetting<boolean>('buttons')
    if (btn)
      pd.buttons = [{ label: 'Смотреть', url: href }]
  }
  else if (pathname === '/' || pathname === '/index.html') {
    pd.details = 'Главная страница'
  }
  else {
    pd.details = 'Листает JAM Club'
    if (h1)
      pd.state = h1
  }

  if (pd.details)
    presence.setActivity(pd)
  else
    presence.clearActivity()
})
