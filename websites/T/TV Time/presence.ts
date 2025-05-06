import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/TV%20Time/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'TV Time',
  }
  const { href, pathname } = document.location
  const [privacy, buttons, covers] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const title = document.querySelector<HTMLMetaElement>(
    '[property="og:title"]',
  )?.content
  const search = document.querySelector<HTMLInputElement>(
    '[id="global-search-input"]',
  )
  const splitPathname = pathname.split('/')

  if (privacy) {
    presenceData.details = 'Browsing'
  }
  else if (search?.value) {
    presenceData.details = 'Searching for'
    presenceData.state = search?.value
    presenceData.smallImageKey = Assets.Search
  }
  else if (
    pathname === `/${document.querySelector('html')?.getAttribute('lang')}`
  ) {
    presenceData.details = 'Viewing watchlist'
  }
  else {
    switch (splitPathname[2]) {
      case 'show': {
        switch (splitPathname[3]) {
          case 'explore': {
            if (!document.querySelector('[id="shows-results"]')) {
              presenceData.details = 'Exploring Shows'
              presenceData.buttons = [
                {
                  label: 'Explore Shows',
                  url: href,
                },
              ]
            }
            else {
              presenceData.details = 'Viewing search results for'
              presenceData.state = document
                .querySelector('[id="shows-results"]')
                ?.textContent
                ?.split('"')[1]
            }
            break
          }
          case 'browse': {
            const hrefSplit = href
              .split('?')[1]
              ?.replace('filter=', '')
              .replace(/_/g, ' ')
            presenceData.details = 'Viewing shows filtered by'
            presenceData.state = `${hrefSplit
              ?.at(0)
              ?.toUpperCase()}${hrefSplit?.slice(1)}`
            break
          }
          default: {
            presenceData.details = 'Viewing'
            presenceData.state = title
            presenceData.largeImageKey = document
              .querySelector('img[src*="/poster/"]')
              ?.getAttribute('src')
              ?? document
                .querySelector('[property="og:image"]')
                ?.getAttribute('content')
                ?? ActivityAssets.Logo
            if (title?.match(/S\d*E\d/g)) {
              presenceData.buttons = [
                {
                  label: 'View Episode',
                  url: href,
                },
              ]
            }
            else {
              presenceData.buttons = [
                {
                  label: 'View Show',
                  url: href,
                },
              ]
            }
            break
          }
        }
        break
      }
      case 'actor': {
        presenceData.details = 'Viewing'
        presenceData.state = title
        presenceData.largeImageKey = document
          .querySelector('[property="og:image"]')
          ?.getAttribute('content') ?? ActivityAssets.Logo
        presenceData.buttons = [
          {
            label: 'View Actor',
            url: href,
          },
        ]
        break
      }
      case 'upcoming': {
        presenceData.details = 'Viewing upcoming shows'
        presenceData.buttons = [
          {
            label: 'View Upcoming Shows',
            url: href,
          },
        ]
        break
      }
      case 'explore': {
        if (!document.querySelector('[id="shows-results"]')) {
          presenceData.details = 'Exploring Shows'
          presenceData.buttons = [
            {
              label: 'Explore Shows',
              url: href,
            },
          ]
        }
        else {
          presenceData.details = 'Viewing search results for'
          presenceData.state = document
            .querySelector('[id="shows-results"]')
            ?.textContent
            ?.split('"')[1]
        }
        break
      }
      case 'user': {
        switch (splitPathname[4]) {
          case 'profile': {
            presenceData.details = `Viewing ${title}'s ${
              document
                .querySelector('[class="profile-nav"]')
                ?.querySelector('[class*="active"]')
                ?.textContent ?? 'Profile'
            }`
            presenceData.largeImageKey = document
              .querySelector('[class="avatar"]')
              ?.firstElementChild
              ?.firstElementChild
              ?.getAttribute('src')
              ?? document
                .querySelector('[class="avatar"]')
                ?.firstElementChild
                ?.getAttribute('src')
            break
          }
          case 'calendar': {
            presenceData.details = 'Viewing Calendar for'
            presenceData.state = `${
              document.querySelector('[class="month-label"]')?.textContent
            } ${
              document.querySelector('[class="day-number"]')?.textContent
            } (${document
              .querySelector('[class="relative-date"]')
              ?.textContent
              ?.trim()})`
            presenceData.buttons = [
              {
                label: 'View Calendar',
                url: href,
              },
            ]
            break
          }
          case 'account': {
            presenceData.details = `Managing ${
              document.querySelector('[class*="active"]')?.textContent
            } account settings`
            break
          }
        }
        break
      }
    }
  }
  if (!covers)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
