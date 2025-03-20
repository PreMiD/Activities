const presence = new Presence({
  clientId: '676560908578717702',
})
const userInfo = JSON.parse(JSON.parse(localStorage['persist:nt']).user)
let pageVariables: PageVarsType, carImage: string

function getNumberWithOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0]!)
}

async function resizeImage(image: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const wh = 320
    img.crossOrigin = 'anonymous'
    img.src = image

    img.onload = function () {
      let newWidth, newHeight, offsetX, offsetY

      if (img.width > img.height) {
        newWidth = wh
        newHeight = (wh / img.width) * img.height
        offsetX = 0
        offsetY = (wh - newHeight) / 2
      }
      else {
        newHeight = wh
        newWidth = (wh / img.height) * img.width
        offsetX = (wh - newWidth) / 2
        offsetY = 0
      }
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = wh
      tempCanvas.height = wh

      tempCanvas
        .getContext('2d')
        ?.drawImage(img, offsetX, offsetY, newWidth, newHeight)

      resolve(tempCanvas.toDataURL('image/png'))
    }
  })
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/Nitro%20Type/assets/logo.png',
  User = 'https://cdn.rcd.gg/PreMiD/websites/N/Nitro%20Type/assets/0.png',
  Guest = 'https://cdn.rcd.gg/PreMiD/websites/N/Nitro%20Type/assets/1.png',
}

interface PageVarsType {
  'NTGLOBALS.CAR_PAINTED_URL': string
  'NTGLOBALS.CAR_URL': string
  'NTGLOBALS.CARS': [
    {
      carID: number
      options: {
        largeSrc: string
        smallSrc: string
      }
    },
  ]
}

presence.on('UpdateData', async () => {
  if (!pageVariables) {
    pageVariables = await presence.getPageVariable<PageVarsType>(
      'NTGLOBALS.CAR_PAINTED_URL',
      'NTGLOBALS.CAR_URL',
      'NTGLOBALS.CARS',
    )
  }
  const largeSrc = pageVariables['NTGLOBALS.CARS']
    .find(car => car.carID === userInfo.carID)
    ?.options
    .largeSrc
    .split('.')
  const loggedIn = !!document.querySelector('.dropdown--account span')
  const { pathname, href, origin } = document.location
  const pathArr = pathname.split('/')
  if (!carImage) {
    carImage = await resizeImage(
      `${origin}${
        userInfo.carHueAngle
          ? pageVariables['NTGLOBALS.CAR_PAINTED_URL']
          : pageVariables['NTGLOBALS.CAR_URL']
      }${largeSrc?.[0]}${
        userInfo.carHueAngle ? `_${userInfo.carHueAngle}` : ''
      }.${largeSrc?.[1]}`,
    )
  }
  const showCar = await presence.getSetting<boolean>('showCar')
  const presenceData: PresenceData = {
    largeImageKey: (loggedIn && showCar ? carImage : ActivityAssets.Logo) ?? ActivityAssets.Logo,
    smallImageKey: loggedIn ? ActivityAssets.User : ActivityAssets.Guest,
    smallImageText: loggedIn
      ? document.querySelector('.dropdown--account span')?.textContent
      : 'Racing as a guest',
  }

  switch (pathArr[1]) {
    case '': {
      presenceData.details = 'On the Homepage'
      break
    }
    case 'login': {
      presenceData.details = 'Logging in'
      break
    }
    case 'signup': {
      presenceData.details = 'Logging in'
      break
    }
    case 'garage': {
      presenceData.details = 'Hanging in the Garage'
      if (pathArr[2] === 'customizer') {
        presenceData.state = `Customising ${document
          .querySelector('.customizer--tab.is-current .customizer--tab--label')
          ?.textContent
          ?.replace(/s$/, '')
          .toLowerCase()}`
      }
      break
    }
    case 'leagues': {
      const leagueName = document.querySelector(
        '.league-ranking--icon:not(.is-small) .league-ranking--icon--name',
      )?.textContent ?? 'Legend'
      const leaguePlacement = getNumberWithOrdinal(
        Number.parseInt(
          document.querySelector(
            '.is-self .leagues--standings--place-indicator',
          )?.textContent
          || document.querySelector<HTMLImageElement>(
            '.is-self .leagues--standings--place-indicator img',
          )?.alt || '',
        ),
      )
      presenceData.details = `Viewing ${
        document.querySelector('.card-cap > h1')?.childNodes[1]?.textContent
      } League standings`
      presenceData.state = `League: ${leagueName} | Placement: ${leaguePlacement}`
      break
    }
    case 'racer': {
      presenceData.details = 'Viewing Racer Profiles'
      presenceData.state = document.querySelector(
        '.player-name--container',
      )?.textContent
      presenceData.buttons = [
        {
          url: href,
          label: 'View Profile',
        },
      ]
      if (
        document.querySelector<HTMLAnchorElement>('.player-name--tag')?.href
      ) {
        presenceData.buttons.push({
          url: document.querySelector<HTMLAnchorElement>('.player-name--tag')
            ?.href ?? '',
          label: 'View Team',
        })
      }
      break
    }
    case 'team': {
      switch (pathArr[2]) {
        case 'create': {
          presenceData.details = 'Creating a team'
          break
        }
        default: {
          if (typeof pathArr[2] === 'undefined') {
            presenceData.details = 'Browsing teams'
          }
          else {
            presenceData.details = 'Viewing team Info'
            presenceData.state = document.querySelector('h1.h2')
            presenceData.buttons = [
              {
                label: 'View Page',
                url: href,
              },
            ]
          }
        }
      }
      break
    }
    case 'achievements': {
      presenceData.details = 'Browsing achievements'
      const pName = document.querySelector(
        '.has-btn--vertical .btn.is-active',
      )?.textContent
      presenceData.state = `${pName} (${(pName === 'Summary'
        ? document.querySelector('.prog-points')?.textContent
        : document.querySelector('.twb')?.textContent
      )?.replaceAll(' ', '')})`
      break
    }
    case 'race': {
      presenceData.details = 'Racing'
      presenceData.state = `${getNumberWithOrdinal(
        Number.parseInt(document.querySelector('.dash-pos .tsxxl')?.textContent ?? ''),
      )} ${document
        .querySelector('.list--xs > li:nth-child(1) > div:nth-child(1) ')
        ?.textContent
        ?.split('\n')
        .reverse()
        .join('')
        .toLowerCase()} ${`${
        document.querySelector(
          '.list--xs > li:nth-child(2) > div:nth-child(1) > div:nth-child(2)',
        )?.textContent
      }acc`}`
      if (
        document.querySelector('.raceLight-status')
        || document.querySelector('.waiting-for-leader--status--heading')
      ) {
        presenceData.state = 'Waiting for the race to start.'
      }

      if (document.querySelector('.race-results')) {
        let stats = ''
        for (const item of document.querySelectorAll(
          '.gridTable-row.is-self .list-item',
        ))
          stats += `${item.textContent} `

        stats = stats.slice(0, -1).replace(/\(\+[0-9.]+\)/, '')
        presenceData.details = `Finished race ${
          document.querySelector('div.raceResults-title')?.textContent
        }`
        presenceData.state = stats
      }
      break
    }
    case 'season': {
      let tier: string | undefined
      for (const reward of document.querySelectorAll('.is-complete'))
        tier = reward?.querySelector('.seasonReward-tier')?.textContent ?? '0'
      presenceData.details = 'Viewing current season'
      presenceData.state = `${
        document.querySelector('.season-header h1')?.textContent
      } (Tier ${tier} | ${
        document.querySelector<HTMLDivElement>('.prog-barFill')?.style.width
      })`
      break
    }
    case 'friends': {
      presenceData.details = 'Browsing friends'
      break
    }
    case 'shop': {
      presenceData.details = 'Browsing shop'
      const selectedShop = document.querySelector<HTMLImageElement>(
        '.page-shop--dealership-option.is-selected img',
      )?.alt
      switch (selectedShop) {
        case 'Level 1': {
          presenceData.state = 'Loh\'s Cars'
          break
        }
        case 'Level 2': {
          presenceData.state = 'Midtown Motors'
          break
        }
        case 'Level 3': {
          presenceData.state = 'Hai Auto'
          break
        }
        default: {
          presenceData.state = selectedShop
          break
        }
      }
      break
    }
    case 'profile': {
      presenceData.details = 'Updating Racer Profile'
      break
    }
    case 'news': {
      presenceData.details = 'Browsing the News'
      break
    }
    case 'stats': {
      presenceData.details = 'Viewing Stats'
      break
    }
    case 'racelog': {
      presenceData.details = 'Browsing race logs'
      presenceData.state = document.querySelector('.tab.is-active')
      break
    }
    case 'support': {
      presenceData.details = 'Checking the Support Page'
      break
    }
    default: {
      presenceData.details = pathname
    }
  }

  if (!presenceData.details) {
    presence.error('no presence!')

    presence.setActivity()
  }
  else {
    presence.setActivity(presenceData)
  }
})
