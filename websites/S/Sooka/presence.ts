import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1436010256089223259',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://i.imgur.com/6r9DaeL.png',
}

// Cache last known title 
let lastTitle: string | null = null;

presence.on('UpdateData', async () => {

  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Viewing,
    details: 'Browsing',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  if (pathname === '/' || pathname === '/home') {
    presenceData.state = 'Home'
  } else if (pathname.includes('/search')) {
    presenceData.details = 'Searching'
    presenceData.smallImageKey = Assets.Search
    presenceData.state = ''
  } else if (pathname.includes('/sports')) {
    presenceData.state = 'Sports'
  } else if (pathname.includes('/tv%20shows')) {
    presenceData.state = 'TV Shows'
  } else if (pathname.includes('/live%20tv')) {
      presenceData.state = 'Live TV'  
  } else if (pathname.includes('/movies')) {
    presenceData.state = 'Movies'
  } else if (pathname.includes('/tv%20guide')) {
    presenceData.state = 'TV Guide'
  } else if (/^\/watch\/(channel|show|movie)/.test(pathname)) {
    const headingEl = document.querySelector<HTMLHeadingElement>('h3.playerOverlay-module__title--bcSq5');
    const fullTitle = headingEl?.textContent?.trim();

    // only update cache if we actually found a title
    if (fullTitle) lastTitle = fullTitle;

    presenceData.state = lastTitle ?? 'Channel';
    presenceData.details = 'Watching';
    presenceData.smallImageKey = Assets.Play;
  } else if (/^\/(channel|show|movie)(\/|$)/.test(pathname)) {
    const headingEl = document.querySelector<HTMLHeadingElement>('h1.bannerHeading');
    const title = headingEl?.textContent?.trim();

    if (title) lastTitle = title;
    presenceData.state = lastTitle ?? 'Channel';
  } 

  if (presenceData.state) {
    presence.setActivity(presenceData)
  } else {
    presence.clearActivity()
  }
  
})
