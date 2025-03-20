import { Assets } from 'premid'

/**
 * Google's Coding Competitions = 848587645760176148
 * Google Kick Start = 848588920437604382
 * Google Code Jam   = 848588299147935744
 * Google Hash Code  = 848588586524868701
 */

let presence: Presence | undefined

function setPresence(): void {
  if (location.pathname.includes('kickstart'))
    presence = new Presence({ clientId: '848588920437604382' })
  else if (location.pathname.includes('codejam'))
    presence = new Presence({ clientId: '848588299147935744' })
  else if (location.pathname.includes('hashcode'))
    presence = new Presence({ clientId: '848588586524868701' })
  else presence = new Presence({ clientId: '848587645760176148' })
}

const timeElapsed: number = ~~(Date.now() / 1000)

setPresence()

enum ActivityAssets {
  Kickstart = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%27s%20Coding%20Competitions/assets/0.png',
  Codejam = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%27s%20Coding%20Competitions/assets/1.png',
  Hashcode = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%27s%20Coding%20Competitions/assets/2.png',
}

presence?.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%27s%20Coding%20Competitions/assets/logo.png',
    details: 'Home page',
    startTimestamp: timeElapsed,
  }

  switch (location.pathname.split('/')[1]) {
    case 'kickstart': {
      presenceData.largeImageKey = ActivityAssets.Kickstart

      switch (location.pathname.split('/')[2]) {
        case 'about': {
          presenceData.details = 'Reading about Kick Start'
          presenceData.smallImageKey = Assets.Reading
          break
        }

        case 'schedule': {
          presenceData.details = 'Viewing Schedule'
          break
        }

        case 'faq': {
          presenceData.details = 'Reading FAQ'
          presenceData.smallImageKey = Assets.Reading
          break
        }

        case 'rulesandterms': {
          presenceData.details = 'Reading Rules and Terms'
          presenceData.smallImageKey = Assets.Reading
          break
        }

        case 'archive': {
          if (!location.pathname.split('/')[3]) {
            presenceData.details = 'Viewing Competition archive'
          }
          else {
            presenceData.details = 'Viewing Competition archive'
            presenceData.state = document.querySelector('.headline-2')?.textContent
          }
          break
        }

        case 'round': {
          if (!location.pathname.split('/')[4]) {
            presenceData.details = `Viewing ${
              document.querySelector('.headline-2')?.textContent
            }`
          }
          else {
            const [round] = document
              .querySelector('.headline-5')
              ?.textContent
              ?.split('-') ?? []
            const problem = document.querySelector(
              '#problem-select-selected-text',
            )?.textContent

            if (!location.hash || location.hash.includes('#problem')) {
              presenceData.details = `Solving: ${round}`
              presenceData.state = problem
            }
            else {
              presenceData.details = `Reading Analysis: ${round}`
              presenceData.state = problem
              presenceData.smallImageKey = Assets.Reading
            }
          }
          break
        }

        case 'submissions': {
          presenceData.details = `Viewing submissions for ${
            document.querySelector('.rounds-header__container > p > b')
              ?.textContent
          }`
          presenceData.state = document.querySelector('.headline-2')?.textContent
          break
        }
      }
      break
    }

    case 'codejam': {
      presenceData.largeImageKey = ActivityAssets.Codejam

      switch (location.pathname.split('/')[2]) {
        case 'about': {
          presenceData.details = 'Reading about Code Jam'
          presenceData.smallImageKey = Assets.Reading
          break
        }

        case 'schedule': {
          presenceData.details = 'Viewing Schedule'
          break
        }

        case 'faq': {
          presenceData.details = 'Reading FAQ'
          presenceData.smallImageKey = Assets.Reading
          break
        }

        case 'rulesandterms': {
          presenceData.details = 'Reading Rules and Terms'
          presenceData.smallImageKey = Assets.Reading
          break
        }

        case 'archive': {
          if (!location.pathname.split('/')[3]) {
            presenceData.details = 'Viewing Competition archive'
          }
          else {
            presenceData.details = 'Viewing Competition archive'
            presenceData.state = document.querySelector('.headline-2')?.textContent
          }
          break
        }

        case 'round': {
          if (!location.pathname.split('/')[4]) {
            presenceData.details = `Viewing ${
              document.querySelector('.headline-2')?.textContent
            }`
          }
          else {
            const [round] = document
              .querySelector('.headline-5')
              ?.textContent
              ?.split('-') ?? []
            const problem = document.querySelector(
              '#problem-select-selected-text',
            )?.textContent

            if (!location.hash || location.hash.includes('#problem')) {
              presenceData.details = `Solving: ${round}`
              presenceData.state = problem
            }
            else {
              presenceData.details = `Reading Analysis: ${round}`
              presenceData.state = problem
              presenceData.smallImageKey = Assets.Reading
            }
          }
          break
        }

        case 'submissions': {
          presenceData.details = `Viewing submissions for ${
            document.querySelector('.rounds-header__container > p > b')
              ?.textContent
          }`
          presenceData.state = document.querySelector('.headline-2')?.textContent
          break
        }
      }
      break
    }

    case 'hashcode': {
      presenceData.largeImageKey = ActivityAssets.Hashcode

      switch (location.pathname.split('/')[2]) {
        case 'about': {
          presenceData.details = 'Reading about Hash Code'
          presenceData.smallImageKey = Assets.Reading
          break
        }

        case 'schedule': {
          presenceData.details = 'Viewing Schedule'
          break
        }

        case 'hubs': {
          presenceData.details = 'Viewing Hubs'
          break
        }

        case 'rulesandterms': {
          presenceData.details = 'Reading Rules and Terms'
          presenceData.smallImageKey = Assets.Reading
          break
        }

        case 'faq': {
          presenceData.details = 'Reading FAQ'
          presenceData.smallImageKey = Assets.Reading
          break
        }

        case 'archive': {
          if (!location.pathname.split('/')[3]) {
            presenceData.details = 'Viewing Competition archive'
          }
          else {
            presenceData.details = 'Viewing Scoreboard'
            presenceData.state = document.querySelector('.headline-2')?.textContent
          }
          break
        }
      }
      break
    }

    default: {
      delete presenceData.startTimestamp

      if (location.pathname.includes('profile'))
        presenceData.details = 'Viewing their profile'
      else if (location.pathname.includes('past-competitions'))
        presenceData.details = 'Viewing past competitions'
    }
  }

  if (presenceData.details)
    presence?.setActivity(presenceData)
  else presence?.setActivity()
})
