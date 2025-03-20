const presence = new Presence({
  clientId: '843781235494486046',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const setting = {
    timeElapsed: await presence.getSetting<boolean>('timeElapsed'),
    showButtons: await presence.getSetting<boolean>('showButtons'),
  }
  const urlpath = window.location.pathname.split('/')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Daily%20Wire/assets/logo.png',
  }

  if (setting.timeElapsed)
    presenceData.startTimestamp = browsingTimestamp

  if (!urlpath[1]) {
    presenceData.details = 'Home'
  }
  else if (urlpath[1] === 'news' && urlpath[2]) {
    presenceData.details = 'Viewing Article'
    presenceData.state = document.querySelector('h1.css-cmdiie.e172hw750')?.textContent
      || 'Unknown'

    if (setting.showButtons) {
      presenceData.buttons = [
        {
          label: 'Read Article',
          url: window.location.href,
        },
      ]
    }
  }
  else {
    switch (urlpath[1]) {
      case 'episode': {
        presenceData.details = document.querySelector('h2.css-n0lwas.e172hw750')?.textContent
          || 'Unknown'
        presenceData.state = document.querySelectorAll('span.css-e6rih1.ew91t7w0')[1]
          ?.textContent || 'Unknown'

        if (setting.showButtons) {
          presenceData.buttons = [
            {
              label: 'Watch Episode',
              url: window.location.href,
            },
          ]
        }

        break
      }
      case 'show': {
        presenceData.details = 'Viewing Show'
        presenceData.state = document.querySelector('h3.css-1qqpwph')?.textContent || 'Unknown'

        if (setting.showButtons) {
          presenceData.buttons = [
            {
              label: 'Watch Show',
              url: window.location.href,
            },
          ]
        }

        break
      }
      case 'discussion': {
        presenceData.details = 'Viewing Discussion'
        presenceData.state = document.querySelector('h2.css-n0lwas.e172hw750')?.textContent
          || 'Unknown'

        if (setting.showButtons) {
          presenceData.buttons = [
            {
              label: 'View Discussion',
              url: window.location.href,
            },
          ]
        }

        break
      }
      case 'author': {
        presenceData.details = 'Viewing Author'
        presenceData.state = document.querySelector('h2.css-cmdiie.e172hw750')?.textContent
          || 'Unknown'

        if (setting.showButtons) {
          presenceData.buttons = [
            {
              label: 'View Author',
              url: window.location.href,
            },
          ]
        }

        break
      }
      case 'subscribe': {
        presenceData.details = 'Viewing Membership'
        break
      }
      case 'read':
      case 'dicuss':
      case 'watch': {
        presenceData.details = 'Browsing'
        break
      }
      case 'search': {
        presenceData.details = 'Searching'
        presenceData.state = document.querySelector<HTMLInputElement>(
          'input.ais-SearchBox-input',
        )?.value

        break
      }
      default:
        presenceData.details = 'Other'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
