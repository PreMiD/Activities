const presence = new Presence({
  clientId: '1047546230525415535',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Info = 'https://cdn.rcd.gg/PreMiD/websites/R/Rate%20My%20Professors/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Rate%20My%20Professors/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const pathList = pathname.split('/').filter(x => x !== '')

  switch (pathList[0]) {
    case 'account': {
      switch (pathList[1]) {
        case 'profile': {
          presenceData.details = 'Viewing their profile'
          break
        }
        case 'settings': {
          presenceData.details = 'Managing their settings'
          break
        }
        case 'ratings': {
          presenceData.details = 'Viewing their ratings'
          break
        }
        case 'saved-professors': {
          presenceData.details = 'Viewing their saved professors'
          break
        }
      }
      break
    }
    case 'add': {
      switch (pathList[1]) {
        case 'school-rating': {
          presenceData.details = 'Rating a school'
          presenceData.state = document.querySelector<HTMLSpanElement>(
            '[class*=\'HeaderDescription__StyledTitleName\'] span',
          )?.textContent
          break
        }
        case 'teacher-rating': {
          presenceData.details = 'Rating a professor'
          presenceData.state = [
            ...document.querySelectorAll(
              '[class*=\'HeaderDescription__StyledTitleName\'] span',
            ),
          ]
            .map(e => e.textContent)
            .join(' ')
            .trim()
          break
        }
        case 'professor': {
          presenceData.details = 'Adding a professor'
          break
        }
        case 'school': {
          presenceData.details = 'Adding a school'
          break
        }
      }
      break
    }
    case 'flag': {
      if (pathList[1] === 'school-rating')
        presenceData.details = 'Reporting a rating for a school'
      else presenceData.details = 'Reporting a rating for a professor'

      break
    }
    case 'professor': {
      presenceData.details = 'Viewing a professor'
      presenceData.state = document
        .querySelector<HTMLDivElement>('[class*=\'NameTitle__Name\']')
        ?.textContent
        ?.trim()
      presenceData.smallImageKey = ActivityAssets.Info
      presenceData.smallImageText = `Quality: ${
        document.querySelector<HTMLDivElement>(
          '[class*=\'RatingValue__Numerator\']',
        )?.textContent
      } / 5`
      break
    }
    case 'school': {
      presenceData.details = 'Viewing a school'
      presenceData.state = document.querySelector<HTMLDivElement>(
        '[class*=\'StyledTitleName\']',
      )?.textContent
      presenceData.smallImageKey = ActivityAssets.Info
      presenceData.smallImageText = `Quality: ${
        document.querySelector<HTMLDivElement>(
          '[class*=\'OverallRating__Number\']',
        )?.textContent
      }`
      break
    }
    case 'search': {
      presenceData.details = `Searching for a ${
        pathList[1] === 'teachers' ? 'professor' : 'school'
      }`
      presenceData.state = document
        .querySelector('h1 > span > b')
        ?.textContent
        ?.replace(/^\s*"(.*)"\s*$/, '$1')
      break
    }
    case 'submit-correction': {
      switch (pathList[1]) {
        case 'campus': {
          presenceData.details = 'Submitting a correction for a campus'
          break
        }
      }
      break
    }
    default: {
      presenceData.details = 'Browsing'
    }
  }

  presence.setActivity(presenceData)
})
