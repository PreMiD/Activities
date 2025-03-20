import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '580032576434077707',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Desu-Online/assets/logo.png',
  Home = 'https://cdn.rcd.gg/PreMiD/websites/D/Desu-Online/assets/0.png',
}

const pages: { [key: string]: { desc: string, image: Assets | ActivityAssets } } = {
  '/': { desc: 'Strona Główna', image: ActivityAssets.Home },
  '/zakladki/': { desc: 'Przegląda zakładki...', image: Assets.Viewing },
  '/gatunki/': { desc: 'Przegląda gatunki...', image: Assets.Viewing },
  '/sezony/': { desc: 'Przegląda sezony...', image: Assets.Viewing },
  '/polityka-prywatnosci/': {
    desc: 'Czyta politykę prywatności...',
    image: Assets.Reading,
  },
}

let video = {
  current: 0,
  duration: 0,
  paused: true,
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
    name: 'Desu-Online',
  }
  const { pathname, search, href } = document.location
  const [privacy, buttons] = [
    await presence.getSetting<boolean>('privacy'),
    await presence.getSetting<boolean>('buttons'),
  ]

  presenceData.smallImageKey = Assets.Viewing

  if (search) {
    presenceData.details = 'Używa zaawansowanej wyszukiwarki...'
    const searchvalues = search.split('&')
    for (const searchvalue of searchvalues) {
      if (searchvalue.startsWith('s=')) {
        presenceData.details = 'Wyszukuje po frazie'
        presenceData.state = searchvalue
          .substring(2, searchvalue.length)
          .replace(/(%20)(\+)/g, ' ')
      }
      else if (searchvalue.startsWith('?s=')) {
        presenceData.details = 'Wyszukuje po frazie'
        presenceData.state = searchvalue
          .substring(3, searchvalue.length)
          .replace(/(%20)(\+)/g, ' ')
      }
    }
  }
  else {
    switch (pathname) {
      case pathname.startsWith('/anime/') ? pathname : null:
        if (pathname === '/anime/') {
          presenceData.details = 'Przegląda serie...'
        }
        else if (pathname === '/anime/list-mode/') {
          presenceData.details = 'Przegląda listę serii...'
        }
        else {
          presenceData.details = 'Przegląda serię'
          presenceData.state = document.querySelector('h1.entry-title')?.textContent
          presenceData.largeImageKey = document
            .querySelector('img.ts-post-image')
            ?.getAttribute('src')
          presenceData.buttons = [
            {
              label: 'Odwiedź',
              url: href,
            },
          ]
        }
        break
      case pathname.startsWith('/blog/') ? pathname : null:
        if (pathname === '/blog/') {
          presenceData.details = 'Przegląda bloga'
          presenceData.state = 'Strona 1'
        }
        else if (pathname.startsWith('/blog/page/')) {
          presenceData.details = 'Przegląda bloga:'
          presenceData.state = `Strona ${pathname.split('/')[3]}`
        }
        else {
          presenceData.details = 'Czyta bloga'
          presenceData.state = document
            .querySelectorAll('h1')[0]
            ?.textContent
            ?.replace('\n', '')
          presenceData.buttons = [{ label: 'Czytaj', url: href }]
        }
        break
      case pathname.startsWith('/season/') ? pathname : null:
        presenceData.details = 'Przegląda sezon'
        presenceData.state = document.querySelector('div.newseason > h1')?.textContent
        break
      case pathname.startsWith('/label/') ? pathname : null:
        if (pathname === '/label/news/')
          presenceData.details = 'Przegląda newsy...'
        else if (pathname === '/label/recenzja/')
          presenceData.details = 'Przegląda recenzje...'
        break
      case pathname.startsWith('/genres/') ? pathname : null:
        presenceData.details = 'Przegląda gatunek'
        presenceData.state = `${
          document.querySelector('div.releases > h1 > span')?.textContent
        }`
        if (pathname.includes('page'))
          presenceData.state += ` (Strona ${pathname.split('/')[4]})`
        break
      case pathname.startsWith('/studio/') ? pathname : null:
        presenceData.details = 'Przegląda studio'
        presenceData.state = `${
          document.querySelector('div.releases > h1 > span')?.textContent
        }`
        if (pathname.includes('page'))
          presenceData.state += ` (Strona ${pathname.split('/')[4]})`
        break
      case document.querySelector('div.video-content') ? pathname : null: {
        privacy
          ? (presenceData.name = 'Desu-Online')
          : (presenceData.name = document.querySelector('div.det > h3')!.textContent!)
        const playinfo = document
          .querySelector('li.selected > a > div.playinfo > span')
          ?.textContent
          ?.split('-')
        const episodenum = playinfo?.[0]?.replace('Odc', '')
        privacy
          ? (presenceData.details = 'Ogląda anime')
          : (presenceData.details = Number.isNaN(Number.parseInt(episodenum ?? ''))
              ? episodenum
              : `Odcinek:${playinfo?.[0]?.replace('Odc', '')}`)
        if (playinfo && playinfo.length > 2) {
          presenceData.state = document
            .querySelector('li.selected > a > div.playinfo > span')
            ?.textContent
            ?.match(/-.*-/g)
            ?.toString()
            ?.slice(2, -2)
        }

        presenceData.buttons = [
          { label: 'Oglądaj', url: document.URL },
          {
            label: 'Cała seria',
            url: document
              .querySelector('div.det > h3 > a')
              ?.getAttribute('href') ?? '',
          },
        ]
        presenceData.largeImageKey = document
          .querySelector('img.ts-post-image')
          ?.getAttribute('src');
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.current, video.duration)

        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Odtwarzanie'
        if (video.paused) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Wstrzymano'
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        break
      }
      default:
        presenceData.details = pages[pathname]?.desc || 'Nieznana aktywność 🤨'
        presenceData.smallImageKey = pages[pathname]?.image || Assets.Viewing
        break
    }
  }

  if (!buttons || privacy)
    delete presenceData.buttons
  if (privacy) {
    presenceData.largeImageKey = ActivityAssets.Logo
    delete presenceData.state
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
