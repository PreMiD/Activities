import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1452788409671225474',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/E/Enma/assets/logo.png',
}
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }
  const { pathname, search } = document.location
  switch (true) {
    case pathname === '/':
    case pathname === '/home':
      presenceData.details = 'Viewing Homepage'
      break
    case pathname === '/search':
      presenceData.details = `Searching...`
      presenceData.state = `Query : ${decodeURIComponent(new URLSearchParams(search).get('keyword') || '').replace(/\b\w/g, c => c.toUpperCase())}`
      break
    case pathname.includes('/genre/'):
      presenceData.details = `Browsing Genre`
      presenceData.state = `${pathname.split('/')[2]}`
      break
    case pathname.includes('/watch/'): {
      presenceData.details = document.querySelector('p.text-\\[26px\\]')?.textContent?.trim()
      const coverArt = document.querySelector<HTMLDivElement>('div.flex.flex-col.gap-y-4.items-start.ml-8')?.querySelector<HTMLImageElement>('img')?.src
      const episodeNumber = document.querySelector<HTMLDivElement>('div.bg-\\[\\#1E90FF\\]')?.querySelector('span')?.textContent
      presenceData.state = `Episode ${episodeNumber}`
      presenceData.largeImageKey = coverArt ?? ActivityAssets.Logo
      presenceData.smallImageKey = ActivityAssets.Logo
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
    default:
      presenceData.details = 'Browsing Enma...'
      break
  }
  presence.setActivity(presenceData)
})
