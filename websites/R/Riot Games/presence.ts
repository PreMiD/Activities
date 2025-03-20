const presence = new Presence({
  clientId: '812085870382809128',
})
const time = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Riot%20Games/assets/logo.png',
  Valorant = 'https://cdn.rcd.gg/PreMiD/websites/R/Riot%20Games/assets/0.png',
  Lol = 'https://cdn.rcd.gg/PreMiD/websites/R/Riot%20Games/assets/1.png',
  Tft = 'https://cdn.rcd.gg/PreMiD/websites/R/Riot%20Games/assets/2.png',
  Wildrift = 'https://cdn.rcd.gg/PreMiD/websites/R/Riot%20Games/assets/3.png',
  Lor = 'https://cdn.rcd.gg/PreMiD/websites/R/Riot%20Games/assets/4.png',
}

presence.on('UpdateData', async () => {
  const path = location.href
    .replace(/\/?$/, '/')
    .replace(`https://${location.hostname}`, '')
    .replace('?', '/')
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: time,
  }
  if (location.hostname === 'riotgames.com' || location.hostname === 'www.riotgames.com') {
    const statics: {
      [name: string]: PresenceData
    } = {
      '/': {
        details: 'Idling...',
      },
      '/who-we-are/': {
        details: 'Looking at:',
        state: 'Who we are | Riot Games',
      },
      '/work-with-us/': {
        details: 'Looking at:',
        state: 'Work with us! | Riot Games',
      },
      '/news/': {
        details: 'Looking at News:',
        state: `${
          Array.from(document.querySelectorAll('div')).find(c =>
            c.className?.includes('style__Title'),
          )?.textContent
        } | Riot Games`,
      },
      '/category/': {
        details: 'Browsing Store:',
        state: `${document.querySelector('h1')?.textContent} | Riot Merch`,
      },
      '/product/': {
        details: 'Looking at Product:',
        state: `${document.querySelector('h1')?.textContent} | Riot Merch`,
      },
      '/account/': {
        details: 'Looking at Account:',
        state: `${document.querySelector('h1')?.textContent} | Riot Merch`,
      },
      '/cart/': {
        details: 'Looking at Cart:',
        state: `${document.querySelector('h1')?.textContent} | Riot Merch`,
      },
    }
    for (const [k, v] of Object.entries(statics)) {
      if (path.match(k)) {
        presenceData.largeImageKey = ActivityAssets.Logo
        presenceData = { ...presenceData, ...v } as PresenceData
      }
    }
  }
  else {
    switch (location.hostname) {
      case 'teamfighttactics.leagueoflegends.com': {
        const statics: {
          [name: string]: PresenceData
        } = {
          '/': {
            details: 'Idling...',
          },
          '/news/': {
            details: 'Looking at News:',
            state: `${
              Array.from(document.querySelectorAll('div')).find(c =>
                c.className?.includes('style__Title'),
              )?.textContent
            } | TfT`,
          },
          '/set-overview/': {
            details: 'Looking at:',
            state: 'Set-Overview | TfT',
          },
        }
        for (const [k, v] of Object.entries(statics)) {
          if (path.match(k)) {
            presenceData.largeImageKey = ActivityAssets.Tft
            presenceData = { ...presenceData, ...v } as PresenceData
          }
        }

        break
      }
      case 'wildrift.leagueoflegends.com': {
        const statics: {
          [name: string]: PresenceData
        } = {
          '/': {
            details: 'Idling...',
          },
          '/news/': {
            details: 'Looking at News:',
            state: `${
              document.querySelector('h1')?.textContent
            } | LoL: Wild Rift`,
          },
          '/game-overview/': {
            details: 'Looking at:',
            state: 'Game-Overview | LoL:Wild Rift',
          },
          '/champions/': {
            details: 'Looking at Champion:',
            state: `${
              document.querySelector('h3')?.textContent
            } | LoL: Wild Rift`,
          },
        }
        for (const [k, v] of Object.entries(statics)) {
          if (path.match(k)) {
            presenceData.largeImageKey = ActivityAssets.Wildrift
            presenceData = { ...presenceData, ...v } as PresenceData
          }
        }

        break
      }
      case 'playvalorant.com': {
        const statics: {
          [name: string]: PresenceData
        } = {
          '/': {
            details: 'Idling...',
          },
          '/news/': {
            details: 'Looking at News:',
            state: `${document.querySelector('h2')?.textContent} | VALORANT`,
          },
          '/maps/': {
            details: 'Looking at:',
            state: 'Maps | VALORANT',
          },
          '/agents/': {
            details: 'Looking at:',
            state: `${
              document.querySelector(
                '.slick-slide.slick-active.slick-center.slick-current > div > div > h2',
              )?.textContent
            } | VALORANT`, // ENTER HEADER
          },
          '/media/': {
            details: 'Browsing Media',
            state: 'VALORANT',
          },
          '/leaderboards/': {
            details: 'Browsing Leaderboards:',
            state: 'VALORANT',
          },
          '/specs/': {
            details: 'Looking at:',
            state: 'Specs | VALORANT',
          },
          '/arsenal/': {
            details: 'Looking at:',
            state: 'Arsenal | VALORANT',
          },
        }
        for (const [k, v] of Object.entries(statics)) {
          if (path.match(k)) {
            presenceData.largeImageKey = ActivityAssets.Valorant
            presenceData = { ...presenceData, ...v } as PresenceData
          }
        }

        break
      }
      default:
        if (location.hostname === 'leagueoflegends.com' || location.hostname === 'www.leagueoflegends.com') {
          const statics: {
            [name: string]: PresenceData
          } = {
            '/': {
              details: 'Idling...',
            },
            '/how-to-play/': {
              details: 'Looking at:',
              state: 'How to Play! | LoL',
            },
            '/champions/': {
              details: 'Looking at Champion:',
              state: `${document.querySelector('strong')?.textContent} | LoL`,
            },
            '/champion/': {
              details: 'Looking at Champion:',
              state: `${
                Array.from(document.querySelectorAll('span')).find(c =>
                  c.className?.includes('title'),
                )?.textContent
              } | LoL`,
            },
            '/news/': {
              details: 'Looking at News:',
              state: `${
                Array.from(document.querySelectorAll('div')).find(c =>
                  c.className?.includes('style__Title'),
                )?.textContent
              } | LoL`,
            },
            '/news/tags/patch-notes/': {
              details: 'Looking at:',
              state: 'Patch notes Overview | LoL',
            },
            '/featured/': {
              details: 'Looking at:',
              state: 'League Displays | LoL',
            },
            '/story/': {
              details: 'Reading Story:',
              state: `${document.querySelector('h1')?.textContent} | LoL`,
            },
            '/regions/': {
              details: 'Looking at Region:',
              state: `${
                Array.from(document.querySelectorAll('span')).find(c =>
                  c.className?.includes('title'),
                )?.textContent
              } | LoL`,
            },
            '/comic/': {
              details: 'LoL - Reading comic:',
              state: `${document.querySelector('h1')?.textContent} | LoL`,
            },
            '/kda/': {
              details: 'Alt Universe:',
              state: 'K/DA | LoL',
            },
            '/star-guardian/': {
              details: 'Alt Universe:',
              state: 'Star Guardians | LoL',
            },
            '/odyssey/': {
              details: 'Alt Universe:',
              state: 'Odyssey | LoL',
            },
            '/explore/': {
              details: 'Searching through:',
              state: 'Everything League | LoL',
            },
          }
          for (const [k, v] of Object.entries(statics)) {
            if (path.match(k)) {
              presenceData.largeImageKey = ActivityAssets.Lol
              presenceData = { ...presenceData, ...v } as PresenceData
            }
          }
        }
        else if (location.hostname === 'playruneterra.com' || location.hostname === 'www.playruneterra.com') {
          const statics: {
            [name: string]: PresenceData
          } = {
            '/': {
              details: 'Idling...',
            },
            '/news/': {
              details: 'Looking at news:',
              state: `${
                Array.from(document.querySelectorAll('div')).find(c =>
                  c.className?.includes('style__Title'),
                )?.textContent
              } | LoR`,
            },
            '/news/competitive/': {
              details: 'Tournaments:',
              state: `${document.querySelector('h1')?.textContent} | LoR`,
            },
          }
          for (const [k, v] of Object.entries(statics)) {
            if (path.match(k)) {
              presenceData.largeImageKey = ActivityAssets.Lor
              presenceData = { ...presenceData, ...v } as PresenceData
            }
          }
        }
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
