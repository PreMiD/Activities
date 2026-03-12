import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo0 = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime-Odcinki/assets/logo.png',
  Logo1 = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime-Odcinki/assets/0.png',
}
let video = {
  exists: false,
  duration: 0,
  currentTime: 0,
  paused: true,
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as {
      exists: boolean
      duration: number
      currentTime: number
      paused: boolean
    }
  },
)

presence.on('UpdateData', async () => {
  const [privacy, buttons, logo] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<number>('logo'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: logo === 0 ? ActivityAssets.Logo0 : ActivityAssets.Logo1,
    startTimestamp: browsingTimestamp,
    name: 'Anime-Odcinki',
  }
  const { pathname, href } = document.location

  switch (true) {
    case pathname === '/': {
      presenceData.details = 'Przegląda stronę główną'
      presenceData.state = document.querySelector('[class*="current-menu-item current_page_item"]')
        ?.textContent !== 'Strona główna'
        ? document.querySelector(
          '[class*="current-menu-item current_page_item"]',
        )?.textContent
        : ''
      break
    }
    case pathname.includes('/me/anime/'): {
      presenceData.details = 'Przegląda listę anime'
      break
    }
    case pathname.includes('/anime/'): {
      presenceData.details = !privacy
        ? JSON.parse(
          document.querySelector('[type="application/ld+json"]')?.innerHTML ?? '',
        )?.['@graph']?.[2]?.itemListElement?.[1]?.name
        ?? document.querySelector('.page-header')?.textContent
        : 'Ogląda anime'
      presenceData.state = pathname.split('/')?.[3]
        ? `Odcinek ${pathname.split('/')?.[3]}`
        : ''
      if (video?.exists) {
        delete presenceData.startTimestamp
        presenceData.buttons = [
          {
            label: 'Ogląda Wideo',
            url: href,
          },
        ]
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused ? 'Pauza' : 'Wstrzymane'
        if (!video.paused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
        }
      }
      else {
        presenceData.buttons = [
          {
            label: 'Zobacz Anime',
            url: href,
          },
        ]
      }
      break
    }
    default: {
      presenceData.details = 'Przegląda'
      break
    }
  }

  if (privacy && presenceData.state)
    delete presenceData.state
  if ((!buttons || privacy) && presenceData.buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
