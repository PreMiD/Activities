import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1204425198741491742',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Docchi/assets/logo.png',
}

const pages: { [key: string]: { desc: string, image: Assets } } = {
  '/': { desc: 'Strona Główna', image: Assets.Viewing },
  '/schedule': { desc: 'Przegląda harmonogram...', image: Assets.Viewing },
  '/stats': { desc: 'Przegląda statystyki...', image: Assets.Viewing },
  '/monitoring': {
    desc: 'Przegląda monitorowane serie...',
    image: Assets.Viewing,
  },
  '/contact': {
    desc: 'Przegląda stronę kontaktową...',
    image: Assets.Viewing,
  },
  '/rules': { desc: 'Czyta regulamin...', image: Assets.Reading },
  '/privacy': {
    desc: 'Czyta politykę prywatności...',
    image: Assets.Reading,
  },
  '/alternatives': {
    desc: 'Przegląda listę stron alternatywnych...',
    image: Assets.Viewing,
  },
  '/my': { desc: 'Przegląda swoją stronę...', image: Assets.Viewing },
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
    name: 'Docchi',
  }
  const { pathname, href, origin } = document.location
  const [privacy, buttons] = [
    await presence.getSetting<boolean>('privacy'),
    await presence.getSetting<boolean>('buttons'),
  ]

  presenceData.smallImageKey = Assets.Viewing

  const production = pathname.startsWith('/production/as') ? pathname : null
  const community = pathname.startsWith('/community') ? pathname : null
  const panel = pathname.startsWith('/panel') ? pathname : null
  const ht = pathname.startsWith('/hentai') ? pathname : null
  switch (pathname) {
    case pathname.startsWith('/settings') ? pathname : null:
      presenceData.details = 'Przegląda ustawienia'
      presenceData.state = document
        .querySelector('div.text-sm-start')
        ?.querySelector('span.navbar-item-active')
        ?.textContent
        || 'Nieznana zakładka'
      break
    case pathname.startsWith('/profile') ? pathname : null:
      privacy
        ? (presenceData.details = 'Przegląda profil')
        : (presenceData.details = `Przegląda profil - ${
            document.querySelector('h1')?.textContent
          }`)
      presenceData.state = `Zakładka: ${
        document
          ?.querySelector('div.profile_nav')
          ?.querySelector('span.navbar-item-active')
          ?.textContent
      }`
      presenceData.largeImageKey = document
        ?.querySelector('img.profile_page_profile_avatar__NwKeS')
        ?.getAttribute('src')
      presenceData.buttons = [{ label: 'Zobacz Profil', url: href }]
      break
    case community:
      presenceData.smallImageKey = Assets.Reading
      if (community!.split('/').length === 3) {
        presenceData.details = 'Przegląda post na forum'
        presenceData.state = document.querySelector('h1')?.textContent
        presenceData.buttons = [{ label: 'Zobacz Post', url: href }]
      }
      else {
        presenceData.details = 'Przegląda forum...'
      }
      break
    case production:
      if (production!.endsWith('movies')) {
        presenceData.details = 'Przegląda filmy anime...'
      }
      else if (production!.endsWith('list')) {
        presenceData.details = 'Przegląda serie anime...'
      }
      else {
        presenceData.largeImageKey = document
          .querySelector('img.shadow-sm')
          ?.getAttribute('src')
        if (!document.querySelector('iframe[title=\'Odtwarzacz\']')) {
          presenceData.details = 'Przegląda serię'
          presenceData.state = document.querySelector(
            'a[mal_sync=\'title\']',
          )?.textContent
          presenceData.buttons = [{ label: 'Zobacz Serię', url: href }]
        }
        else {
          const animetype = [...document.querySelectorAll('h4')].find(
            h4 => h4.textContent?.trim() === 'Rodzaj',
          )?.nextElementSibling?.textContent
          if (animetype === 'Movie') {
            privacy
              ? (presenceData.name = 'Film anime')
              : (presenceData.name = document.querySelector(
                  'a[mal_sync=\'title\']',
                )!.textContent!)
            presenceData.buttons = [{ label: 'Oglądaj', url: href }]
          }
          else {
            privacy
              ? (presenceData.name = 'Anime')
              : (presenceData.name = document.querySelector(
                  'a[mal_sync=\'title\']',
                )!.textContent!)
            presenceData.details = `Odcinek: ${
              document.querySelector('a[mal_sync=\'episode\']')?.textContent
            }`
            presenceData.buttons = [
              { label: 'Oglądaj', url: href },
              {
                label: 'Cała Seria',
                url: `${origin}${document
                  .querySelector('a[mal_sync=\'episode\']')!
                  .getAttribute('href')}`,
              },
            ]
          }
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.current, video.duration)

          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Odtwarzanie'
          if (video.paused) {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = 'Wstrzymano'
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }
        }
      }
      break
    case panel:
      presenceData.details = document
        .querySelector('div.text-sm-start')
        ?.querySelector('span.navbar-item-active')
        ?.textContent
      presenceData.smallImageKey = Assets.Writing
      if (panel!.startsWith('/panel/anime')) {
        const title = [...document.querySelectorAll('p')]
          .find(p => p.textContent?.trim() === 'Tytuł')
          ?.nextElementSibling
          ?.getAttribute('value')
        presenceData.state = title
      }
      else if (panel!.startsWith('/panel/episode')) {
        const title = [...document.querySelectorAll('p')]
          .find(p => p.textContent?.trim() === 'Anime')
          ?.nextElementSibling
          ?.getAttribute('value')
        presenceData.state = title?.replace(/-/g, ' ')
      }
      break
    case ht:
      if (ht!.endsWith('list')) {
        presenceData.details = 'Przegląda listę hentai...'
      }
      else {
        presenceData.largeImageKey = document
          ?.querySelector('img.shadow-sm')
          ?.getAttribute('src')
        if (!document.querySelector('iframe[title=\'Odtwarzacz\']')) {
          presenceData.details = 'Przegląda serię'
          presenceData.state = document
            .querySelector('a[mal_sync=\'title\']')
            ?.textContent
          presenceData.buttons = [{ label: 'Zobacz Serię', url: href }]
        }
        else {
          privacy
            ? (presenceData.details = 'Ogląda anime')
            : (presenceData.details = document
                .querySelector('a[mal_sync=\'title\']')
                ?.textContent)
          presenceData.state = `Odcinek: ${
            document.querySelector('a[mal_sync=\'episode\']')?.textContent
          }`
          presenceData.buttons = [
            { label: 'Oglądaj', url: href },
            {
              label: 'Cała Seria',
              url: `${origin}${document
                .querySelector('a[mal_sync=\'episode\']')
                ?.getAttribute('href')}`,
            },
          ]
        }
      }
      break
    default:
      presenceData.details = pages[pathname]?.desc || 'Nieznana aktywność 🤨'
      presenceData.smallImageKey = pages[pathname]?.image || Assets.Viewing
      break
  }

  if (!buttons || privacy)
    delete presenceData.buttons
  if (privacy) {
    presenceData.largeImageKey = ActivityAssets.Logo
    delete presenceData.state
  }
  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
