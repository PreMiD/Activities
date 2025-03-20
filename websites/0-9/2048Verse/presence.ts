const presence = new Presence({
  clientId: '939893158777618432',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/2048Verse/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const [time, buttons] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const gridSize = `${document.querySelectorAll('.grid-row').length.toString()}x${(
    document.querySelectorAll('.grid-cell').length
    / document.querySelectorAll('.grid-row').length
  ).toString()}`

  if (pathname.split('/')[1] === 'leaderboard') {
    let leaderboardType
    switch (document.querySelector<HTMLDivElement>('#marker')?.style.left) {
      case '-280px': {
        leaderboardType = 'All Time'
        break
      }
      case '-157px': {
        leaderboardType = 'Today'
        break
      }
      case '-44px': {
        leaderboardType = 'Week'
        break
      }
    }
    presenceData.details = 'Viewing leaderboard'
    presenceData.state = `${
      document.querySelector<HTMLSelectElement>('#variant')?.value
    } ${leaderboardType}`
  }
  else if (pathname.split('/')[1] === 'user') {
    presenceData.details = 'Viewing profile'
    presenceData.state = document.querySelector('h1.title')?.firstChild?.textContent
    presenceData.buttons = [{ label: 'View Profile', url: href }]
  }
  else if (pathname.split('/')[1] === 'replay') {
    presenceData.details = `Watching replay ${gridSize}`
    presenceData.state = `Score ${
      document.querySelector('.score-container')?.firstChild?.textContent
    }`
  }
  else if (pathname.split('/')[1] === 'p') {
    presenceData.details = `Practising ${gridSize}`
    presenceData.state = `Score ${
      document.querySelector('.score-container')?.firstChild?.textContent
    } Best ${document.querySelector('.best-container')?.textContent}`
  }
  else if (pathname.split('/')[1] === 'lessons') {
    presenceData.details = 'Browsing lessons'
  }
  else if (document.querySelectorAll('.grid-row').length) {
    presenceData.details = `Playing ${gridSize}`

    presenceData.state = `Score ${
      document.querySelector('.score-container')?.firstChild?.textContent
    } Best ${document.querySelector('.best-container')?.textContent}`
  }

  if (!time)
    delete presenceData.startTimestamp

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
