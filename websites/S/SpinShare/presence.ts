import { Assets } from 'premid'

const presence = new Presence({
  clientId: '752151960743837817',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SpinShare/assets/logo.png',
  }

  if (document.location.hostname === 'spinsha.re') {
    const { pathname } = document.location
    switch (pathname) {
      case '/':
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Viewing Frontpage'
        break
      case '/new':
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Viewing New Charts'
        break
      case '/hot':
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Viewing Hot Charts'
        break
      case '/popular':
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Viewing Popular Charts'
        break
      default:
        // Idle
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Idling'
        break
    }
    if (pathname.startsWith('/song')) {
      presenceData.details = document.querySelector('.song-title')?.textContent
      presenceData.state = document.querySelector('.song-artist')?.textContent
      if (document.querySelector('.player-active'))
        presenceData.smallImageKey = Assets.Play
    }
    else if (pathname.startsWith('/user')) {
      presenceData.details = 'Browsing User Profile:'
      presenceData.state = document.querySelector('.user-name')
        ?.textContent
    }
    else if (pathname.startsWith('/search')) {
      presenceData.details = 'Searching'
      presenceData.state = '🔍'
    }
    else if (pathname.startsWith('/report')) {
      presenceData.details = 'Reporting Something...'
      presenceData.state = '🔨'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
