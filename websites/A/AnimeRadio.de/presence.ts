import { Assets } from 'premid'

const presence = new Presence({
  clientId: '687352219598585905',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeRadio.de/assets/logo.png',
  Animetreff = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeRadio.de/assets/0.png',
  Animenews = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeRadio.de/assets/1.png',
  Animekino = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeRadio.de/assets/2.png',
  Animemesse = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeRadio.de/assets/3.png',
  Animefanshop = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeRadio.de/assets/4.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  switch (document.location.host) {
    case 'www.animeradio.de': {
      if (document.location.pathname.includes('/webplayer/')) {
        presenceData.details = 'Hört AnimeRadio'
        presenceData.smallImageKey = Assets.Play
      }
      else if (document.URL.includes('top100')) {
        presenceData.details = 'Betrachtet Top100'
      }
      else if (document.URL.includes('events')) {
        presenceData.details = 'Betrachtet Events'
      }
      else if (document.URL.includes('programm')) {
        presenceData.details = 'Betrachtet Programm'
      }

      break
    }
    case 'www.animetreff.de': {
      presenceData.largeImageKey = ActivityAssets.Animetreff
      if (document.URL.includes('/CustomPage/?id=1')) {
        presenceData.details = 'Chattet'
        presenceData.smallImageKey = Assets.Writing
      }
      else if (document.location.pathname.includes('/gallery/')) {
        if (document.location.pathname.includes('/Image/')) {
          presenceData.details = 'Betrachtet Bild'
          presenceData.state = document.querySelector(
            '#content > header > h1',
          )?.textContent ?? ''
        }
        else if (document.location.pathname.includes('/Album/')) {
          presenceData.details = 'Betrachtet Album'
          presenceData.state = document
            .querySelector('#content > header > h1')
            ?.textContent
            ?.replace(
              document.querySelector('#content > header > h1 > span')
                ?.textContent ?? '',
              '',
            ) ?? ''
        }
        else if (document.location.pathname.includes('/AlbumList/')) {
          presenceData.details = 'Betrachtet Galerie'
        }
      }
      else if (document.location.pathname.includes('/calendar/')) {
        presenceData.details = 'Betrachtet Kalender'
        presenceData.state = document.querySelector(
          '#content > header > h1',
        )?.textContent ?? ''
      }
      else if (document.location.pathname.includes('/MemberList/')) {
        presenceData.details = 'Betrachtet Mitglieder'
      }
      else if (document.location.pathname.includes('/User/')) {
        presenceData.details = 'Betrachtet Nutzer'
      }
      else if (document.location.pathname.includes('/Thread/')) {
        presenceData.details = 'Liest Beiträge:'
        presenceData.state = document.querySelector(
          '#content > header > h1 > a',
        )?.textContent ?? ''
        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname.includes('/Board/')) {
        presenceData.details = `Betrachtet ${
          document.querySelector('#content > header > h1 > a')?.textContent ?? ''
        }`
      }
      else if (document.location.pathname.includes('/Search/')) {
        if (document.querySelector('#errorMessage')) {
          presenceData.details = `Sucht nach ${
            document
              .querySelector('#errorMessage')
              ?.textContent
              ?.split('„')[1]
              ?.split('“')[0] ?? ''
          }`
        }
        else {
          presenceData.details = `Sucht nach ${
            document.querySelector('#content > header > p > strong')?.textContent ?? ''
          }`
        }
      }
      else {
        presenceData.details = 'Stöbert in den Foren'
      }

      break
    }
    case 'www.animenews.de': {
      presenceData.largeImageKey = ActivityAssets.Animenews
      presenceData.details = 'Liest Neuigkeiten'
      presenceData.smallImageKey = Assets.Reading

      break
    }
    case 'www.animekino.de': {
      presenceData.largeImageKey = ActivityAssets.Animekino
      if (document.URL.includes('partner'))
        presenceData.details = 'Betrachtet Partner'
      else if (document.URL.includes('kontakt'))
        presenceData.details = 'Betrachtet Kontakt'
      else if (document.URL.includes('ort'))
        presenceData.details = 'Betrachtet Ort'
      else if (document.URL.includes('filme'))
        presenceData.details = 'Betrachtet Filmvorstellungen'
      else presenceData.details = 'Betrachtet Kino'

      break
    }
    case 'www.animehamburg.de': {
      if (document.URL.includes('partner'))
        presenceData.details = 'Betrachtet Partner'
      else if (document.URL.includes('kontakt'))
        presenceData.details = 'Betrachtet Kontakt'
      else if (document.URL.includes('ort'))
        presenceData.details = 'Betrachtet Ort'
      else if (document.URL.includes('programm'))
        presenceData.details = 'Betrachtet Programm'
      else presenceData.details = 'Betrachtet Hanmaco'

      break
    }
    case 'www.animekultur.de': {
      if (document.URL.includes('joinus')) {
        presenceData.details = 'Will ein Mitglied werden'
        presenceData.smallImageKey = Assets.Writing
      }
      else if (document.URL.includes('projekte')) {
        presenceData.details = 'Betrachtet Projekte'
      }
      else if (document.URL.includes('pressemitteilungen')) {
        presenceData.details = 'Betrachtet Pressemitteilungen'
      }
      else if (document.URL.includes('marketing')) {
        presenceData.details = 'Betrachtet Marketing'
      }
      else if (document.URL.includes('kontakt')) {
        presenceData.details = 'Betrachtet Kontakt'
      }
      else if (document.URL.includes('hajime')) {
        presenceData.details = 'Betrachtet Hanjime! Anime-Con'
      }
      else {
        presenceData.details = 'Betrachtet Kultur / Über uns'
      }

      break
    }
    case 'www.animetickets.de': {
      if (document.location.pathname.includes('/event/')) {
        presenceData.details = 'Betrachtet Eventtickets für'
        presenceData.state = document.querySelector(
          'body > div > div > div > div:nth-child(2) > span',
        )?.textContent ?? ''
      }
      else if (document.location.pathname.includes('/events')) {
        presenceData.details = 'Betrachtet Events'
      }
      else if (document.location.pathname.includes('contact')) {
        presenceData.details = 'Betrachtet Kontakt'
      }
      else if (document.location.pathname.includes('order')) {
        presenceData.details = 'Betrachtet Order'
      }

      break
    }
    case 'www.animemesse.de': {
      presenceData.largeImageKey = ActivityAssets.Animemesse
      presenceData.details = `Betrachtet ${
        document.querySelector('#content > li.active > a')?.textContent ?? ''
      }`

      break
    }
    case 'www.animefanshop.de': {
      presenceData.largeImageKey = ActivityAssets.Animefanshop
      const product = document.querySelector(
        '.product-info-title-desktop > span',
      )
      if (product) {
        presenceData.details = 'Betrachtet Produkt:'
        presenceData.state = product.textContent
      }
      else if (
        document.location.pathname.includes('/advanced_search_result')
      ) {
        presenceData.details = `Sucht nach ${
          document
            .querySelector('#main > div > h1')
            ?.textContent
            ?.split('"')[1]
            ?.split('"')[0] ?? ''
        }`
      }

      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
