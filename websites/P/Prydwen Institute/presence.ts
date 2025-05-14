import games from './games/index.js'

const presence = new Presence({
  clientId: '918337184929546322',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    name: 'Prydwen Institute',
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname, hostname } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  if (hostname === 'blog.prydwen.gg') {
    // todo
  }
  else {
    if (pathList[0]) {
      const gameName = document.querySelector('.game-name')
      // viewing content for a game
      if (document.querySelector('.left-menu')) {
        // viewing specific content for the game, not a guide
        if (pathList[1] !== 'guides') {
          presenceData.name += ` - ${gameName?.textContent}`
          if (pathList[2]) {
            presenceData.details = 'Reading a Guide'
            presenceData.state = document.querySelector('h1')
            presenceData.buttons = [{ label: 'View Guide', url: href }]
          }
          else {
            presenceData.details = 'Browsing Guides'
          }
        }
        else if (pathList[1]) {
          const game = games[pathList[1]]
          presenceData.name += ` - ${gameName?.textContent}`
          if (game) {
            game.apply(presenceData, pathList.slice(1))
          }
          else {
            presenceData.details = `Browsing ${document.querySelector('.nav [aria-current]')?.textContent?.trim()}`
          }
        }
        else {
          presenceData.details = 'Viewing a Game'
          presenceData.state = gameName
          presenceData.buttons = [{ label: 'View Game', url: href }]
        }
      }
      else {
        presenceData.details = 'Browsing...'
      }
    }
    else {
      presenceData.details = 'Browsing home page'
    }
  }

  presence.setActivity(presenceData)
})
