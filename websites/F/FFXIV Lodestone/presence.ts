import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1407799641998757958',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/FFXIV%20Lodestone/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'FFXIV Lodestone',
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Reading,
    startTimestamp: browsingTimestamp,
  }

  const { pathname, href } = document.location
  const [buttons, imagesEnabled] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('images'),
  ])
  let image: HTMLImageElement | null = null

  if (pathname.includes('lodestone')) {
    switch (pathname.split('/')[2]) {
      case 'my':
        image = document.querySelector<HTMLImageElement>('div.head-my-character__face > a > img')

        presenceData.details = `Viewing My Character`
        presenceData.state = document.querySelector('p > a.name')?.textContent
        presenceData.smallImageText = document.querySelector('a.world')?.textContent

        if (image && imagesEnabled)
          presenceData.largeImageKey = image.src
        break

      case 'character':
        image = document.querySelector<HTMLImageElement>('div.frame__chara__face > img')

        presenceData.details = `Viewing Character`
        presenceData.state = document.querySelector('p.frame__chara__name')?.textContent
        presenceData.smallImageText = document.querySelector('p.frame__chara__world')?.textContent

        if (image && imagesEnabled)
          presenceData.largeImageKey = image.src
        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Character',
              url: href,
            },
          ]
        }

        if (pathname.includes('/blog/')) {
          presenceData.details = `Reading Blog Post: ${document.querySelector('div.entry__blog div > h2')?.textContent}`
          presenceData.state = `By: ${document.querySelector('p.frame__chara__name')?.textContent}`

          if (buttons) {
            presenceData.buttons = [
              {
                label: 'Read Blog',
                url: href,
              },
            ]
          }
        }
        else if (pathname.includes('/event/')) {
          presenceData.details = `Reading Event: ${document.querySelector('div.event_title > h2')?.textContent}`
          presenceData.state = `By: ${document.querySelector('p.frame__chara__name')?.textContent}`

          if (buttons) {
            presenceData.buttons = [
              {
                label: 'Read Event',
                url: href,
              },
            ]
          }
        }
        break

      case 'news':
        if (pathname.includes('/detail')) {
          presenceData.details = `Reading News Article`
          presenceData.state = document.querySelector('header > h1')?.textContent
        }
        else {
          presenceData.details = `Reading News`
        }

        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View News',
              url: href,
            },
          ]
        }
        break

      case 'topics':
        if (pathname.includes('/detail')) {
          presenceData.details = `Reading Topics Article`
          presenceData.state = document.querySelector('header > h1')?.textContent
        }
        else {
          presenceData.details = `Reading Topics`
        }

        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Topics',
              url: href,
            },
          ]
        }
        break

      case 'special':
        if (pathname.includes('/patchnote_log')) {
          presenceData.details = `Reading Patch Notes & Special Sites`
        }
        else if (pathname.includes('/update_log')) {
          presenceData.details = `Reading Lodestone Update Notes`
        }

        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Site',
              url: href,
            },
          ]
        }
        break

      case 'worldstatus':
        presenceData.details = `Reading Server Status`

        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Status',
              url: href,
            },
          ]
        }
        break

      case 'playguide':
        if (pathname.includes('/db')) {
          presenceData.details = `Browsing the Eorzea Database`
        }
        else {
          presenceData.details = `Reading Gameplay Guide`
        }
        break

      case 'community':
        presenceData.details = `Browsing the Community Wall`
        break

      case 'freecompany':
        presenceData.details = `Browsing Free Companies`

        if (pathname.split('/')[3]) {
          presenceData.state = `Viewing ${document.querySelector('p.freecompany__text__name')?.textContent}`
        }
        break

      case 'blog':
        presenceData.details = `Browsing Blog Posts`
        break

      case 'community_finder':
        presenceData.details = `Browsing Community Finder`

        if (pathname.split('/')[3]) {
          presenceData.state = `Viewing ${document.querySelector('#community h2 > a')?.textContent}`

          if (buttons) {
            presenceData.buttons = [
              {
                label: 'View Community',
                url: href,
              },
            ]
          }
        }
        break

      case 'event':
        presenceData.details = `Browsing Events`
        break

      case 'linkshell':
        presenceData.details = `Browsing Linkshells`

        if (pathname.split('/')[3]) {
          presenceData.details = `Viewing Linkshell: ${document.querySelector('h3')?.textContent}`
          presenceData.state = `By: ${document.querySelector('p.entry__name')?.textContent}`

          image = document.querySelector<HTMLImageElement>('div.ldst__bg img')

          if (image && imagesEnabled)
            presenceData.largeImageKey = image.src
        }
        break

      case 'crossworld_linkshell':
        presenceData.details = `Browsing Cross-world Linkshells`

        if (pathname.split('/')[3]) {
          presenceData.details = `Viewing Cross-world Linkshell: ${document.querySelector('h3')?.textContent}`
          presenceData.state = `By: ${document.querySelector('p.entry__name')?.textContent}`

          image = document.querySelector<HTMLImageElement>('div.heading__linkshell img')

          if (image && imagesEnabled)
            presenceData.largeImageKey = image.src
        }
        break

      case 'pvpteam':
        presenceData.details = `Browsing PvP Teams`

        if (pathname.split('/')[3]) {
          presenceData.details = `Viewing PvP Team: ${document.querySelector('div.entry__pvpteam__name > h2')?.textContent}`
          presenceData.state = `By: ${document.querySelector('p.entry__name')?.textContent}`
        }
        break

      case 'ranking':
        presenceData.details = `Browsing Standings`

        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Standing',
              url: href,
            },
          ]
        }

        break

      default:
        presenceData.details = `Browsing...`
        break
    }
  }

  presence.setActivity(presenceData)
})
