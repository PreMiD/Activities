const presence = new Presence({
  clientId: '865564674326003712',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GoFundMe/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = location

  if (pathname === '/') {
    presenceData.details = 'Viewing homepage'
  }
  else if (pathname.includes(`/f/${pathname.split('/')[2]}`)) {
    presenceData.details = 'Viewing fundraiser:'
    presenceData.state = document.querySelector(
      '#root > div > main > div.p-campaign > header > h1',
    )?.textContent
    presenceData.buttons = [
      {
        label: 'View fundraiser',
        url: href,
      },
    ]
  }
  else if (pathname === '/sign-in' || pathname === '/sign-in/') {
    presenceData.details = 'Logging In'
  }
  else if (pathname === '/sign-up' || pathname === '/sign-up/') {
    presenceData.details = 'Signing Up for an account'
  }
  else if (pathname.includes('/forgot-password')) {
    presenceData.details = 'Resetting a password'
  }
  else {
    switch (pathname) {
      case '/c/how-it-works':
      case '/c/how-it-works/': {
        presenceData.details = 'Reading How GoFundMe Works'
        break
      }
      case '/c/why-gofundme':
      case '/c/why-gofundme/': {
        presenceData.details = 'Reading Why to choose GoFundMe'
        break
      }
      case '/campaigns':
      case '/campaigns/': {
        presenceData.details = 'Viewing my fundraisers'
        break
      }
      case '/donations':
      case '/donations/': {
        presenceData.details = 'Viewing the donations I\'ve made'
        break
      }
      default:
        if (pathname.includes('/settings')) {
          presenceData.details = 'Settings'
        }
        else if (pathname.includes('/create')) {
          presenceData.details = 'Creating a fundraiser'
        }
        else if (pathname.includes('/discover')) {
          presenceData.details = 'Browsing Fundraiser'
        }
        else if (pathname.includes('/start')) {
          presenceData.details = 'Starting a fundraiser'
        }
        else {
          switch (pathname) {
            case '/c/success':
            case '/c/success/': {
              presenceData.details = 'Viewing Success Stories'
              break
            }
            case '/c/cause':
            case '/c/cause/': {
              presenceData.details = 'GoFundMe Causes '
              break
            }
            case '/c/cause/justice-and-equality':
            case '/c/cause/justice-and-equality/': {
              presenceData.details = 'GoFundMe Causes'
              presenceData.state = 'Justice & Equality'

              break
            }
            default:
              if (pathname.startsWith('/s')) {
                presenceData.details = 'Searching for a fundraiser:'
                presenceData.state = new URL(href).searchParams.get('q')
              }
          }
        }
    }
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
