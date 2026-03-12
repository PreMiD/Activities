const presence = new Presence({
  clientId: '959518817573302323',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/regex101/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = location

  if (pathname === '/' || pathname.startsWith('/r/')) {
    const regexLine = document.querySelector('.CodeMirror-line')
    presenceData.details = 'Testing a regex'
    if (!regexLine?.querySelector('[cm-text]')) {
      presenceData.state = `/${regexLine?.textContent}${
        document.querySelector('[aria-label="Set Regex Options"')?.textContent
      }`
    }
    else {
      presenceData.details = 'Browsing the home page'
    }
  }
  else {
    switch (pathname) {
      case '/library': {
        presenceData.details = 'Searching the library'
        presenceData.state = document.querySelector<HTMLInputElement>(
          'header ~ div:nth-of-type(2) h2 + label input',
        )?.value || null
        break
      }
      case '/account/mine': {
        presenceData.details = 'Viewing their regexes'
        break
      }
      case '/account/favorites': {
        presenceData.details = 'Viewing their favorites'
        break
      }
      case '/account/library': {
        presenceData.details = 'Viewing their library entries'
        break
      }
      case '/quiz': {
        presenceData.details = 'Viewing the regex quiz'
        break
      }
      default:
        if (pathname.startsWith('/quiz/')) {
          presenceData.details = 'Taking regex quiz'
          presenceData.state = document.querySelector(
            'header ~ div:nth-of-type(2) > div > div:nth-of-type(2) h2',
          )?.textContent
        }
        else if (pathname === '/settings') {
          presenceData.details = 'Viewing settings'
        }
    }
  }

  presence.setActivity(presenceData)
})
