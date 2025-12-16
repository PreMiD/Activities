import games from './games/index.js'
import { addButton, filterScripts, presence, registerSlideshowKey, slideshow } from './util.js'

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    name: 'Prydwen Institute',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Prydwen%20Institute/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname, hostname, search } = document.location
  const searchParams = new URLSearchParams(search)
  const pathList = pathname.split('/').filter(Boolean)
  let useSlideshow = false

  if (hostname === 'blog.prydwen.gg') {
    presenceData.name += ' Blog'
    switch (pathList[0] ?? '/') {
      case '/': {
        if (searchParams.get('s')) {
          presenceData.details = 'Searching'
          presenceData.state = searchParams.get('s')
        }
        else {
          presenceData.details = 'Browsing...'
        }
        break
      }
      case 'category': {
        presenceData.details = 'Browsing Posts by Category'
        presenceData.state = document.querySelector('a[aria-current="page"]')
        break
      }
      case 'tag': {
        presenceData.details = 'Browsing Posts by Tag'
        presenceData.state = pathList[1]
        break
      }
      default: {
        if (!Number.isNaN(Number.parseInt(pathList[0] ?? ''))) {
          if (pathList[3]) {
            presenceData.details = 'Reading a Post'
            presenceData.state = document.querySelector('h1')
            presenceData.buttons = [{ label: 'Read Post', url: href }]
          }
          else {
            presenceData.details = 'Browsing Post Archives'
          }
        }
        else {
          presenceData.details = 'Browsing...'
        }
      }
    }
  }
  else {
    if (pathList[0]) {
      const gameName = document.querySelector('.game-name')
      // viewing content for a game
      if (document.querySelector('.left-menu')) {
        presenceData.buttons = [
          {
            label: 'View Game',
            url: document.querySelector<HTMLAnchorElement>('.left-menu .nav a'),
          },
        ]
        presenceData.name += ` - ${gameName?.textContent}`
        switch (pathList[1] ?? '/') {
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
          case 'characters': {
            if (pathList[2]) {
              presenceData.details = 'Viewing a Character'
              presenceData.state = `${document.querySelector('h1 strong')?.textContent} - ${document.querySelector('.single-tab.active')?.textContent}`
              presenceData.smallImageKey
                = document.querySelector<HTMLImageElement>(
                  '.character-top [data-main-image]',
                )
              presenceData.smallImageText = filterScripts(document.querySelector('h2'))
              addButton(presenceData, {
                label: 'View Character',
                url: document.location.href,
              })
            }
            else {
              presenceData.details = 'Browsing Characters'
            }
            break
          }
          case 'stats':
          case 'characters-stats': {
            useSlideshow = true
            const characters = [...document.querySelectorAll<HTMLDivElement>('tr')]
            const statHeaders = [...(characters.splice(0, 1)[0]?.children ?? [])]
              .slice(1)
              .map(cell => cell.textContent)

            presenceData.details = 'Browsing Character Stats'
            if (
              registerSlideshowKey(`${pathList[0]}-stats-${characters.length}`)
            ) {
              for (const character of characters) {
                const link = character.querySelector('a')
                const data: PresenceData = {
                  ...presenceData,
                  state: filterScripts(character.querySelector('.char')),
                  smallImageKey:
                          character.querySelector<HTMLImageElement>('[data-main-image]'),
                  smallImageText: [...character.querySelectorAll('.stat')]
                    .map((stat, index) => `${stat.textContent} ${statHeaders[index]}`)
                    .join(', '),
                }
                addButton(data, { label: 'View Character', url: link })
                slideshow.addSlide(link?.href ?? '', data, 5000)
              }
            }
            break
          }
          default: {
            presenceData.details = `Browsing ${document.querySelector('.nav [aria-current]')?.textContent?.trim()}`
          }
        }
        const game = games[pathList[0]]
        if (game) {
          const applySlideshow = game.apply(
            presenceData,
            pathList.slice(1),
          )
          if (applySlideshow) {
            useSlideshow = true
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
