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
      presenceData.smallImageKey = Assets.Search
      break
    case pathname.includes('/genre/'):
      presenceData.details = `Browsing Genre`
      presenceData.state = `${pathname.split('/')[2]}`
      break
    case pathname.includes('/watch/'): {
      const slug = pathname.split('/watch/')[1]?.split('?')[0]
      const title = slug
        ?.replace(/-\d+$/, '')
        ?.replace(/-/g, ' ')
        ?.replace(/\b\w/g, c => c.toUpperCase())
      presenceData.details = title || 'Watching Anime'
      const episodeNumber = document.querySelector<HTMLDivElement>('div.bg-\\[\\#1E90FF\\]')?.querySelector('span')?.textContent
      presenceData.state = `Episode ${episodeNumber}`
      presenceData.largeImageKey = ActivityAssets.Logo
      break
    }
    case pathname.includes('/az-list'):
      presenceData.details = `Viewing AZ List: ${pathname.split('/')[2]}`
      presenceData.smallImageKey = Assets.Viewing
      break
    case pathname === '/movie':
      presenceData.details = 'Browsing movies...'
      presenceData.smallImageKey = Assets.Viewing
      break
    case pathname === '/tv':
      presenceData.details = 'Browsing TV series...'
      presenceData.smallImageKey = Assets.Viewing
      break
    case pathname === '/ova':
      presenceData.details = 'Browsing OVAs...'
      presenceData.smallImageKey = Assets.Viewing
      break
    case pathname === '/ona':
      presenceData.details = 'Browsing ONAs...'
      presenceData.smallImageKey = Assets.Viewing
      break
    case pathname === '/special':
      presenceData.details = 'Browsing specials...'
      presenceData.smallImageKey = Assets.Viewing
      break
    case pathname === '/recently-updated':
      presenceData.details = 'Browsing recently updated anime...'
      presenceData.smallImageKey = Assets.Viewing
      break
    case pathname === '/recently-added':
      presenceData.details = 'Browsing recently added anime...'
      presenceData.smallImageKey = Assets.Viewing
      break
    default:
      presenceData.details = 'Browsing Enma...'
      break
  }
  presence.setActivity(presenceData)
})
