import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Tebex/assets/logo.jpg',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Tebex',
  }
  const { hostname, href, pathname } = document.location
  const pathnameSplit = pathname.split('/')
  const buttons = await presence.getSetting<boolean>('buttons')
  const search = document.querySelector<HTMLInputElement>(
    '[autocapitalize="sentences"]',
  )

  switch (hostname) {
    case 'www.tebex.io':
    case 'tebex.io': {
      switch (pathnameSplit[1]) {
        case 'store': {
          presenceData.details = `Viewing store function ${document
            .querySelector(
              '[class="text-white opacity-5 hover-opacity-10  opacity-10 "]',
            )
            ?.textContent
            ?.toLowerCase()}`
          presenceData.buttons = [
            {
              label: 'View The Store',
              url: href,
            },
          ]
          break
        }
        case 'games': {
          presenceData.details = 'Viewing all games'
          break
        }
        case 'game-studios': {
          presenceData.details = 'Viewing info for game studios'
          presenceData.buttons = [
            {
              label: 'View Info',
              url: href,
            },
          ]
          break
        }
        case 'partners': {
          presenceData.details = 'Viewing partners'
          break
        }
        case 'contact': {
          presenceData.details = 'Viewing contact info'
          break
        }
        case '': {
          presenceData.details = 'Viewing the home page'
          break
        }
        default: {
          presenceData.details = `Viewing ${document
            .querySelector(
              '[class="btn btn-outline-white dropdown-toggle btn-lg mx-3"]',
            )
            ?.textContent
            ?.trim()}'s monetisation options`
        }
      }
      break
    }
    case 'docs.tebex.io': {
      if (search?.value) {
        presenceData.details = 'Searching the docs for'
        presenceData.state = search?.value
        presenceData.smallImageKey = Assets.Search
      }
      else {
        presenceData.details = `Reading the ${
          document.querySelector('[data-testid="page.title"]')?.textContent
        } page`
        presenceData.smallImageKey = Assets.Reading
        presenceData.buttons = [
          {
            label: 'Read Docs',
            url: href,
          },
        ]
      }
      break
    }
    default: {
      const viewing = `Viewing ${
        document.querySelector('[class*=store-name]')?.textContent
        ?? document.querySelector('head > title')?.textContent?.split('|')[0]?.trim()
      }'s`
      switch (pathnameSplit[1]) {
        case '': {
          presenceData.details = `${viewing} homepage`
          break
        }
        case 'category': {
          switch (pathnameSplit[2]) {
            case '': {
              presenceData.details = `${viewing} categories`
              break
            }
            default: {
              presenceData.details = `${viewing} ${
                document
                  .querySelector('[class="page-title"]')
                  ?.textContent
                  ?.toLowerCase()
                  ?? document
                    .querySelectorAll('li[class="active"]')[1]
                    ?.textContent
                    ?.toLowerCase()
              }`
              break
            }
          }
          break
        }
        case 'about': {
          presenceData.details = `${viewing} about page`
          presenceData.buttons = [
            {
              label: 'View The About Page',
              url: href,
            },
          ]
          break
        }
      }
      break
    }
  }
  if (!search && buttons && !presenceData.buttons) {
    presenceData.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }
  else if (!buttons) {
    delete presenceData.buttons
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
