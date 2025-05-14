import games from './games/index.js'
import { presence, slideshow } from './util.js'

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    name: 'Prydwen Institute',
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname, hostname } = document.location
  const pathList = pathname.split('/').filter(Boolean)
  let useSlideshow = false

  if (hostname === 'blog.prydwen.gg') {
    // todo
  }
  else {
    if (pathList[0]) {
      const gameName = document.querySelector('.game-name')
      // viewing content for a game
      if (document.querySelector('.left-menu')) {
        presenceData.buttons = [{ label: 'View Game', url: document.querySelector<HTMLAnchorElement>('.left-menu .nav a') }]
        const path = pathList[1]
        switch (path ?? '/') {
          case '/': {
            presenceData.details = 'Viewing a Game'
            presenceData.state = gameName
            break
          }
          case 'guides': {
            presenceData.name += ` - ${gameName?.textContent}`
            if (pathList[2]) {
              presenceData.details = 'Reading a Guide'
              presenceData.state = document.querySelector('h1')
              presenceData.buttons.push({ label: 'View Guide', url: href })
            }
            else {
              presenceData.details = 'Browsing Guides'
            }
            break
          }
          case 'database': {
            presenceData.name += ` - ${gameName?.textContent}`
            presenceData.details = 'Browsing Database'
            break
          }
          default: {
            const game = games[path!]
            presenceData.name += ` - ${gameName?.textContent}`
            if (game) {
              const applySlideshow = game.apply(presenceData, pathList.slice(1))
              if (applySlideshow) {
                useSlideshow = true
              }
            }
            else {
              presenceData.details = `Browsing ${document.querySelector('.nav [aria-current]')?.textContent?.trim()}`
            }
          }
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

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
