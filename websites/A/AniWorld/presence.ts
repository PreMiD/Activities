import { Assets } from 'premid'

const presence = new Presence({
  clientId: '969716001090437120',
})
const pages: { [k: string]: string } = {
  '/animes': 'Betrachtet alle Animes',
  '/beliebte-animes': 'Betrachtet beliebte Animes',
  '/support/anleitung': 'So funktioniert\'s -',
  '/animekalender': 'Animekalender - ',
  '/random': 'Der Anime-Zufallsgenerator',
  '/zufall': 'Der Anime-Zufallsgenerator',
  '/neu': 'Betrachtet neue Animes',
  '/support/regeln': 'Betrachtet die Nutzungsbedingungen',
  '/dmca': 'Digital Millennium Copyright Act of 1998',
  '/animewuensche': 'Betrachtet Animewünsche',
  '/login': 'Login bei AniWorld',
  '/registation': 'Registrierung bei AniWorld',
  '/account': 'Betrachtet sein Account',
  '/user/profil/': 'Betrachtet ein Profil',
  '/account/nachrichten': 'Betrachtet seine Nachrichten',
  '/account/notifications': 'Betrachtet seine Benachrichtigungen',
  '/account/support': 'im Support Bereich',
  '/account/watchlist': 'Betrachtet seine Watchlist',
  '/account/subscribed': 'Betrachtet seine Abonnierte Animes',
  '/account/settings': 'Account Einstellungen',
  '/support/fragen': 'Betrachtet Fragen & Antworten',
  '/support': 'Hilfe & Support bei AniWorld',
  '/edit:information': 'Neue Serieninformationen vorschlagen',
}
let video,
  timeEnd: number,
  currentTime: number,
  paused: boolean,
  played: boolean

presence.on(
  'iFrameData',
  async (data: unknown) => {
    ({ currentTime, timeEnd, played, paused } = data as {
      currentTime: number
      timeEnd: number
      paused: boolean
      played: boolean
    })
  },
)

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AniWorld/assets/logo.png',
    startTimestamp: Math.floor(Date.now() / 1000),
  }
  if (page === '/') {
    presenceData.details = 'Betrachtet die Startseite'
  }
  else if (page.startsWith('/anime/')) {
    // Check if we are on the episode selection page
    if (page.split('/').length === 4) {
      presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      presenceData.state = 'Betrachtet die Episodenliste'
    }
    else {
      presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      presenceData.state = `${document
        .querySelector<HTMLTitleElement>('title')
        ?.textContent
        ?.split('Staffel')[0]
        ?.replace('Filme von', ' ')
        ?.split(' | AniWorld.to - Animes gratis online ansehen')} - ${
        document.querySelector<HTMLHeadingElement>('h2')?.textContent
      }`;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(currentTime, timeEnd)
      presenceData.buttons = [
        {
          label: 'Watch Anime',
          url: document.location.href,
        },
      ]

      video = document.querySelector<HTMLVideoElement>('video')
      if (video) {
        played = video.currentTime !== 0;
        ({ currentTime, duration: timeEnd, paused } = video)
      }
      if (played) {
        if (!paused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(currentTime, timeEnd)
        }
        presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = paused ? 'Pausiert' : 'Wiedergabe'
      }
    }
    // Obere Reiter
  }
  else {
    switch (page) {
      case '/animes':
      case '/animes-alphabet':
      case '/animes-genres': {
        presenceData.details = pages[page]
        presenceData.state = `Sortiert nach: ${
          document.querySelector<HTMLSpanElement>(
            '#wrapper > div.container.marginBottom > div.seriesListNavigation > strong',
          )?.textContent
        }`

        break
      }
      case '/beliebte-animes': {
        presenceData.state = `${
          document
            .querySelector<HTMLTitleElement>('title')
            ?.textContent
            ?.split('|')[0]
        }`

        break
      }
      case '/support/anleitung': {
        presenceData.details = pages[page]
        presenceData.state = 'Die Anleitung'

        break
      }
      default:
        if (page.includes('/search')) {
          presenceData.details = 'Sucht nach:'
          presenceData.state = `${
            document.querySelector<HTMLSpanElement>(
              '#wrapper > div.container > div.pageTitle.searchResultsPageTitle > h2 > strong',
            )?.textContent
          }`
        }
        else {
          switch (page) {
            case '/animekalender': {
              presenceData.details = pages[page]
              presenceData.state = `${
                document.querySelector<HTMLSpanElement>(
                  '#wrapper > div.container > div.seriesWishListHeader > div.row > div.col-md-4 > small',
                )?.textContent
              }`

              break
            }
            case '/zufall': {
              presenceData.details = pages[page]
              break
            }
            case '/random': {
              presenceData.details = pages[page]
              break
            }
            case '/neu': {
              presenceData.details = pages[page]
              break
            }
            case '/support/regeln': {
              presenceData.details = pages[page]
              break
            }
            case '/dmca': {
              presenceData.details = pages[page]
              break
            }
            case '/animewuensche': {
              presenceData.details = pages[page]
              break
            }
            case '/login': {
              presenceData.details = pages[page]
              break
            }
            case '/registrierung': {
              presenceData.details = pages[page]
              break
            }
            case '/account': {
              presenceData.details = pages[page]
              break
            }
            default:
              if (page.startsWith('/user/profil/')) {
                presenceData.details = 'Betrachtet ein Profil'
                presenceData.state = `${
                  document.querySelector<HTMLHeadingElement>('h1')?.textContent
                }`
                presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/AniWorld/assets/0.png'
                presenceData.smallImageText = `${
                  document.querySelector<HTMLDivElement>(
                    '#userDetails > div > div > div:nth-child(3) > div',
                  )?.textContent
                }`
              }
              else {
                switch (page) {
                  case '/account/nachrichten': {
                    presenceData.details = pages[page]
                    break
                  }
                  case '/account/notifications': {
                    presenceData.details = pages[page]
                    break
                  }
                  case '/account/support': {
                    presenceData.details = pages[page]
                    break
                  }
                  case '/account/watchlist': {
                    presenceData.details = pages[page]
                    break
                  }
                  case '/account/subscribed': {
                    presenceData.details = pages[page]
                    break
                  }
                  case '/account/settings': {
                    presenceData.details = pages[page]
                    break
                  }
                  default:
                    if (page.startsWith('/support/fragen')) {
                      presenceData.details = pages[page]
                    }
                    else if (page === '/support') {
                      presenceData.details = pages[page]
                    }
                    else if (page === '/edit:information') {
                      presenceData.details = pages[page]
                    }
                    else if (page.startsWith('/katalog/')) {
                      presenceData.details = `Betrachtet Animes mit ${
                        document.querySelector<HTMLSpanElement>(
                          '#wrapper > div.container.marginBottom > div.pageTitle > h1 > strong',
                        )?.textContent
                      }`
                    }
                    else if (page.startsWith('/support/frage/')) {
                      presenceData.details = `Frage von ${
                        document.querySelector<HTMLHeadingElement>('h5')
                          ?.textContent
                      }`
                      presenceData.state = `${
                        document.querySelector<HTMLHeadingElement>('h1')
                          ?.textContent
                      }`
                    }
                    else if (page.startsWith('/genre/')) {
                      presenceData.details = `Sucht nach ${
                        document.querySelector<HTMLHeadingElement>(
                          '#wrapper > div.container.marginBottom > div.seriesListSection > div.pageTitle.pageCenter.homeTitle > h1',
                        )?.textContent
                      }`
                    }
                    else {
                      presenceData.details = 'Befindet sich auf einer Unbekannte Seite'
                    }
                }
              }
          }
        }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
})
