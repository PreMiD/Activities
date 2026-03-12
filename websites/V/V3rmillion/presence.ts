import { Assets } from 'premid'

/* Global variables */
const presence = new Presence({
  clientId: '650569876993343529',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/V/V3rmillion/assets/logo.png',
  House = 'https://cdn.rcd.gg/PreMiD/websites/V/V3rmillion/assets/0.png',
  Memo = 'https://cdn.rcd.gg/PreMiD/websites/V/V3rmillion/assets/1.png',
  Paper = 'https://cdn.rcd.gg/PreMiD/websites/V/V3rmillion/assets/2.png',
  Spy = 'https://cdn.rcd.gg/PreMiD/websites/V/V3rmillion/assets/3.png',
  Cog = 'https://cdn.rcd.gg/PreMiD/websites/V/V3rmillion/assets/4.png',
}

/* Main eventHandler */
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  presenceData.startTimestamp = browsingTimestamp
  if (document.location.hostname.includes('v3rmillion.net')) {
    /* Home Page */
    if (
      document.location.pathname.includes('index.php')
      || document.location.pathname === '/'
    ) {
      const profile = document.querySelector('#panel strong')
      presenceData.details = 'Viewing Homepage'
      presenceData.state = `Logged in as ${profile?.textContent}`
      presenceData.smallImageKey = ActivityAssets.House
    }
    else if (document.location.pathname.includes('showthread.php')) {
      /* Viewing Thread */
      const title = document.querySelector('.thread_title')
      presenceData.details = 'Browsing Thread:'
      presenceData.state = title?.textContent
      presenceData.smallImageKey = ActivityAssets.Paper

      /* User is replying to thread using quick-reply box. */
      if (document.querySelector('form #message') === document.activeElement) {
        presenceData.details = 'Replying to Thread:'
        presenceData.state = title?.textContent
        presenceData.smallImageKey = ActivityAssets.Memo
      }
    }
    else if (document.location.pathname.includes('forumdisplay.php')) {
      /* Viewing subforum */
      const title = document.querySelector('.navigation .active')
      presenceData.details = 'Viewing Forum:'
      presenceData.state = title?.textContent
      presenceData.smallImageKey = ActivityAssets.Paper
    }
    else if (document.location.pathname.includes('newreply.php')) {
      /* User is replying to thread */
      // awful dom selection and text manipulation incoming
      const title = document.querySelector('form .smalltext > strong')
      presenceData.details = 'Replying to Thread:'
      presenceData.state = title?.textContent?.substring(
        title.textContent.indexOf('thread: ') + 8,
      ) // Removes "Reply to thread"
      presenceData.smallImageKey = Assets.Writing
    }
    else if (document.location.pathname.includes('member.php')) {
      /* User is viewing profile */
      const profile = document.querySelector('.profile_header strong span')
      presenceData.details = 'Viewing Profile:'
      presenceData.state = profile?.textContent
      presenceData.smallImageKey = ActivityAssets.Spy
    }
    else if (document.location.pathname === '/siterules.php') {
      /* Viewing rules page */
      presenceData.details = 'Viewing Rules'
      delete presenceData.state
      presenceData.smallImageKey = ActivityAssets.Paper
    }
    else if (document.location.pathname === '/usercp.php') {
      /* Editing settings */
      const profile = document.querySelector('#panel strong')
      presenceData.details = 'User Control Panel'
      presenceData.state = `Logged in as ${profile?.textContent}`
      presenceData.smallImageKey = ActivityAssets.Cog
    }
    else if (document.location.pathname.includes('search.php')) {
      /* Searching */
      const profile = document.querySelector('#panel strong')
      presenceData.details = 'Searching site'
      presenceData.state = `Logged in as ${profile?.textContent}`
    }
    else if (document.location.pathname.includes('pages.php')) {
      /* Other page fallback */
      const page = document.URL.substring(document.URL.indexOf('.php') + 10)
      presenceData.details = 'Reading page:'
      presenceData.state = page.charAt(0).toUpperCase() + page.substring(1)
      presenceData.smallImageKey = ActivityAssets.Paper
    }
  }
  /* Unknown site location */
  if (!presenceData.details) {
    presence.error('Unable to determine location.')

    presence.setActivity()
  }
  else {
    presence.setActivity(presenceData)
  }
})
