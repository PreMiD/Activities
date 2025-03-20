const presence = new Presence({
  clientId: '1323275921171681333',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Z/Zombies%20World%20Records/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathArr = pathname.split('/')

  switch (pathArr[1]) {
    case '': {
      presenceData.details = 'Viewing homepage'
      break
    }
    case 'players': {
      if (!pathArr[2]) {
        presenceData.details = 'Browsing players'
      }
      else {
        const profileImage = document.querySelector<HTMLImageElement>('.profile-ring img')
        presenceData.details = 'Viewing player'
        presenceData.state = document.querySelector('.user-name')
        presenceData.largeImageKey = profileImage?.src.includes('.svg')
          ? ActivityAssets.Logo
          : profileImage ?? ActivityAssets.Logo
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
          '.user-country__flag img',
        )?.src
        presenceData.smallImageText = document.querySelector(
          '.user-country__text',
        )
        presenceData.buttons = [
          {
            label: 'View Page',
            url: href,
          },
        ]
      }
      break
    }
    case 'leaderboards': {
      const info = document.title.split(/ - | \| /)
      switch (info.length) {
        case 2: {
          presenceData.details = 'Browsing leaderboards'
          break
        }
        case 3: {
          presenceData.details = `${info[0]}`
          break
        }
        case 4: {
          if (info[2] === 'Leaderboards') {
            presenceData.details = `Browsing ${info[1]}`
            presenceData.state = info[0]
          }
          else {
            presenceData.details = `Browsing ${info[2]}`
            presenceData.state = `${info[1]} | ${info[0]}`
          }
          break
        }
        default: {
          presenceData.details = pathname
          break
        }
      }
      if (document.querySelector('.modal')) {
        presenceData.details = `${info[2]} | ${info[1]} | ${info[0]}`
        presenceData.state = `${
          document.querySelector('.record-popup__platform')?.textContent
        } | ${document.querySelector('.modal .Name')?.textContent}`
        presenceData.buttons = [
          {
            label: 'View Leaderboard',
            url: href,
          },
          {
            label: 'View Video',
            url: document.querySelector<HTMLIFrameElement>(
              '.record-popup__video iframe',
            )!.src,
          },
        ]
      }
      break
    }
    case 'staff': {
      presenceData.details = 'Viewing staff members'
      break
    }
    case 'rules': {
      presenceData.details = 'Viewing rules'
      break
    }
    case 'submit': {
      presenceData.details = 'Submitting game'
      break
    }
    case 'track': {
      presenceData.details = 'Tracking submission'
      break
    }
    case 'recent-records': {
      presenceData.details = 'Browsing recent records'
      break
    }
    case 'custom-downloads': {
      presenceData.details = 'Browsing custom maps library'
      break
    }
    case 'flag': {
      presenceData.details = 'Requesting flag'
      break
    }
    case 'stats': {
      presenceData.details = 'Viewing statistics'
      break
    }
    case 'downloads': {
      presenceData.details = 'Viewing downloads'
      break
    }
    case 'news': {
      if (document.querySelector('.news-page__title'))
        presenceData.details = 'Viewing news'
      presenceData.state = document.querySelector('.news-page__title')
      presenceData.buttons = [
        {
          label: 'View Page',
          url: href,
        },
      ]
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
