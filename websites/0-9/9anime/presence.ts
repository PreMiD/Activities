import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1264754447276310599',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/9anime/assets/logo.png',
}
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }
  const usePresenceName = await presence.getSetting<boolean>('usePresenceName')
  const { href, pathname, search } = document.location
  switch (true) {
    case pathname === '/':
    case pathname === '/home':
      presenceData.details = 'Viewing Homepage'
      break
    case pathname === '/search':
      presenceData.details = `Viewing results: ${search
        .split('=')[1]
        ?.replace(/\+/g, ' ')}`
      presenceData.smallImageKey = Assets.Search
      break
    case pathname.includes('/genre/'):
      presenceData.details = `Viewing genre: ${pathname.split('/')[2]}`
      break
    case pathname.includes('/watch/'): {
      const title = document.title
        .replace(/^Watch /, '')
        .replace(/ online free on 9anime$/, '')

      const coverArt = document
        .querySelector<HTMLImageElement>('[class="anime-poster"]')
        ?.querySelector('img')
        ?.src

      const episodeNumber = document
        .querySelector('[class="item ep-item active"]')
        ?.textContent
        ?.match(/[1-9]\d*/)?.[0]

      if (usePresenceName) {
        presenceData.name = title

        if (episodeNumber) {
          presenceData.details = `Episode ${episodeNumber}`
        }
        else {
          presenceData.details = "Watching"
        }
      }
      else {
        presenceData.details = title

        if (episodeNumber) {
          presenceData.state = `Episode ${episodeNumber}`
        }
      }


      presenceData.largeImageKey = coverArt ?? ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: 'View Anime',
          url: href,
        },
      ]
      presenceData.smallImageKey = coverArt ?? ActivityAssets.Logo
      break
    }
    case pathname.includes('/az-list'):
      presenceData.details = `Viewing AZ List: ${pathname.split('/')[2]}`
      presenceData.smallImageKey = Assets.Search
      break
    case pathname === '/movie':
      presenceData.details = 'Browsing movies...'
      presenceData.smallImageKey = Assets.Search
      break
    case pathname === '/tv':
      presenceData.details = 'Browsing TV series...'
      presenceData.smallImageKey = Assets.Search
      break
    case pathname === '/ova':
      presenceData.details = 'Browsing OVAs...'
      presenceData.smallImageKey = Assets.Search
      break
    case pathname === '/ona':
      presenceData.details = 'Browsing ONAs...'
      presenceData.smallImageKey = Assets.Search
      break
    case pathname === '/special':
      presenceData.details = 'Browsing specials...'
      presenceData.smallImageKey = Assets.Search
      break
    case pathname === '/recently-updated':
      presenceData.details = 'Browsing recently updated anime...'
      presenceData.smallImageKey = Assets.Search
      break
    case pathname === '/recently-added':
      presenceData.details = 'Browsing recently added anime...'
      presenceData.smallImageKey = Assets.Search
      break
    case pathname === '/ongoing':
      presenceData.details = 'Browsing ongoing anime...'
      presenceData.smallImageKey = Assets.Search
      break
    case pathname === '/upcoming':
      presenceData.details = 'Viewing upcoming anime...'
      presenceData.smallImageKey = Assets.Search
      break
    default:
      presenceData.details = 'Browsing 9anime...'
      break
  }
  presence.setActivity(presenceData)
})
