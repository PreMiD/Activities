const presence = new Presence({
  clientId: '719415069460529163',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const [joinButton] = await Promise.all([
    presence.getSetting<boolean>('joinButton'),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Keymash/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname } = document.location
  const [, path, query] = pathname.split('/')

  switch (path) {
    case '': {
      const playerCount = document.querySelectorAll(
        '.grid [href^=\'/profile\'] > img',
      ).length
      if (document.querySelector('.container-game') && playerCount) {
        presenceData.details = 'Playing public lobby'
        presenceData.state = `${playerCount} player${
          playerCount === 1 ? '' : 's'
        }`
      }
      else {
        presenceData.details = 'Main Menu'
      }
      break
    }
    case 'game':
      presenceData.details = 'Currently in game'
      break
    case 'auth':
      presenceData.details = 'Logging in'
      break
    case 'leaderboards':
      presenceData.details = 'Viewing Leaderboards'
      if (query) {
        presenceData.state = `${
          query.charAt(0).toUpperCase() + query.slice(1)
        } Leaders`
      }
      break
    case 'profile':
      if (query) {
        presenceData.details = 'Viewing profile'
        presenceData.state = query.replace('-', '#')
      }
      else {
        presenceData.details = 'Viewing profile'
      }
      presenceData.buttons = [
        {
          label: 'View Page',
          url: href,
        },
      ]
      break
    case 'custom': {
      const playerCount = document.querySelectorAll(
        '[href^=\'/profile\'] > img',
      ).length
      if (document.querySelector('.container-game') && playerCount) {
        presenceData.details = 'Playing custom lobby'
        presenceData.state = `${playerCount} player${
          playerCount === 1 ? '' : 's'
        }`
      }
      else if (playerCount) {
        presenceData.details = 'In custom lobby'
        presenceData.state = `${playerCount} player${
          playerCount === 1 ? '' : 's'
        }`
      }
      if (joinButton) {
        presenceData.buttons = [
          {
            label: 'Join Lobby',
            url: href,
          },
        ]
      }
      break
    }
    case 'competitions':
      if (query) {
        presenceData.details = 'Viewing competition'
        presenceData.state = document.querySelector('h1')
      }
      else {
        presenceData.details = 'Broswsing competitions'
      }
      break
    case 'shop':
      presenceData.details = 'Browsing item shop'
      break
    default:
      presenceData.details = 'Browsing...'
      break
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
})
