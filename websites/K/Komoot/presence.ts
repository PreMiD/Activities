const presence = new Presence({
  clientId: '860131264034897951',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const setting = {
    timeElapsed: await presence.getSetting<boolean>('timeElapsed'),
    showButtons: await presence.getSetting<boolean>('showButtons'),
  }
  const urlpath = window.location.pathname.split('/')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Komoot/assets/logo.png',
  }

  if (setting.timeElapsed)
    presenceData.startTimestamp = browsingTimestamp

  if (!urlpath[1]) {
    presenceData.details = 'Home'
  }
  else {
    switch (urlpath[1]) {
      case 'discover':
      case 'community':
      case 'discover-topics': {
        presenceData.details = 'Discovering'
        break
      }
      case 'plan': {
        presenceData.details = 'Route Planner'
        break
      }
      case 'shop': {
        presenceData.details = 'Shop'
        break
      }
      case 'upload': {
        presenceData.details = 'Importing a GPS File'
        break
      }
      case 'highlight-create': {
        presenceData.details = 'Creating Highlight'
        break
      }
      case 'notifications': {
        presenceData.details = 'Notifications'
        break
      }
      case 'pioneers': {
        presenceData.details = 'Pioneers'
        break
      }
      case 'help': {
        presenceData.details = 'Help Guides'
        break
      }
      case 'tour': {
        presenceData.details = 'Tour'
        presenceData.state = document.querySelector(
          'h1 span.tw-mr-1.tw-font-bold',
        )?.textContent

        if (
          setting.showButtons
          && checkPublic(
            'span.tw-inline-flex.tw-absolute.tw-right-0.tw-top-0 svg',
            'data-original-title',
          )
        ) {
          presenceData.buttons = [
            {
              label: 'View Tour',
              url: document.location.href,
            },
          ]
        }

        break
      }
      default:
        if (urlpath[1] === 'collection' && urlpath[2]) {
          presenceData.details = 'Collection'
          presenceData.state = document.querySelector(
            'div.css-q63yry h1.css-16evvg',
          )?.textContent

          if (setting.showButtons) {
            presenceData.buttons = [
              {
                label: 'View Collection',
                url: document.location.href,
              },
            ]
          }
        }
        else if (urlpath[1] === 'topic' && urlpath[2]) {
          presenceData.details = 'Topic'
          presenceData.state = document.querySelector(
            'h1.c-topic-header__headline',
          )?.textContent

          if (setting.showButtons) {
            presenceData.buttons = [
              {
                label: 'View Collection',
                url: document.location.href,
              },
            ]
          }
        }
        else if (urlpath[1] === 'user' && urlpath[2]) {
          presenceData.details = 'User'
          presenceData.state = document.querySelector(
            'h1.css-1nujfd4 a.c-link.c-link--inherit',
          )?.textContent
        }
    }
  }

  function checkPublic(q: string, a: string) {
    const url = window.location.hostname

    return (
      document.querySelector(q)?.getAttribute(a)?.toLowerCase()
      === (() => {
        switch (url) {
          case 'www.komoot.com':
            return 'visible to: anyone'
          case 'www.komoot.de':
            return 'sichtbar: für alle'
          case 'www.komoot.fr':
            return 'visible par : tout le monde'
          case 'www.komoot.it':
            return 'visibile a: tutti'
          case 'www.komoot.es':
            return 'visible para todo el mundo'
          case 'www.komoot.nl':
            return 'zichtbaar voor: iedereen'
        }
      })()
    )
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
