const presence = new Presence({
  clientId: '897489206199324713',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const keys: Record<string, string> = {
  '4K': 'https://cdn.rcd.gg/PreMiD/websites/Q/Quaver/assets/0.png',
  '7K': 'https://cdn.rcd.gg/PreMiD/websites/Q/Quaver/assets/1.png',
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Q/Quaver/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const [time, smallImage, cover, buttons] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('smallImage'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location

  switch (pathname.split('/')[1]) {
    case '': {
      presenceData.details = 'Viewing homepage'
      break
    }
    case 'mapset': {
      if (pathname.split('/')[3] !== 'ranking') {
        const difficultyInfo = document
          .querySelector('.container .dropdown button')
          ?.textContent
          ?.trim()
          .match(/\[(..)\] ([0-9.]+ - .*)/)
        if (smallImage) {
          presenceData.smallImageKey = keys[difficultyInfo?.[1] ?? '']
          presenceData.smallImageText = difficultyInfo?.[2]
        }
      }
      presenceData.details = document
        .querySelector('h1')
        ?.firstChild
        ?.textContent
        ?.trim()
      presenceData.state = `Created by: ${document
        .querySelector('.card-body a')
        ?.textContent
        ?.trim()}`
      if (cover) {
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.background')
      }
      presenceData.buttons = [
        {
          label: 'View Mapset',
          url: href,
        },
        {
          label: 'View Creator',
          url: document.querySelector<HTMLAnchorElement>('.card-body a')?.href ?? '',
        },
      ]
      break
    }
    case 'mapsets': {
      presenceData.details = 'Viewing ranking queue'
      if (
        smallImage
        && document.querySelector('[class*=\'active-keys\']')?.textContent?.trim()
        !== 'All'
      ) {
        presenceData.smallImageKey = keys[
          document
            .querySelector('[class*=\'active-keys\']')
            ?.textContent
            ?.trim()
            .replace('eys', '')
            .replace(' ', '') ?? ''
        ]
        presenceData.smallImageText = document
          .querySelector('[class*=\'active-keys\']')
          ?.textContent
          ?.trim()
      }
      break
    }
    case 'maps': {
      presenceData.details = 'Browsing maps'
      break
    }
    case 'user': {
      presenceData.details = 'Viewing profile'
      presenceData.state = document.querySelector('#user-card .text-white')
      if (cover) {
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
          '.avatar-thumbnail img',
        )
      }
      if (smallImage) {
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>('#user-card img')
      }
      presenceData.buttons = [
        {
          label: 'View Profile',
          url: href,
        },
      ]
      break
    }
    case 'leaderboard': {
      switch (pathname.split('/')[2] ?? '') {
        case '': {
          presenceData.details = 'Browsing leaderboard'
          if (smallImage) {
            presenceData.smallImageKey = keys[
              document
                .querySelector('[class*=\'active-keys\']')
                ?.textContent
                ?.trim()
                .replace('eys', '')
                .replace(' ', '') ?? ''
            ]
            presenceData.smallImageText = document
              .querySelector('[class*=\'active-keys\']')
              ?.textContent
              ?.trim()
          }
          break
        }
        case 'hits': {
          presenceData.details = 'Browsing hits leaderboard'
          break
        }
        case 'multiplayer': {
          presenceData.details = 'Browsing multiplayer leaderboard'
          if (smallImage) {
            presenceData.smallImageKey = keys[
              document
                .querySelector('[class*=\'active-keys\']')
                ?.textContent
                ?.trim()
                .replace('eys', '')
                .replace(' ', '') ?? ''
            ]
            presenceData.smallImageText = document
              .querySelector('[class*=\'active-keys\']')
              ?.textContent
              ?.trim()
          }
          break
        }
        case 'countries': {
          presenceData.details = 'Browsing country leaderboard'
          break
        }
        default: {
          presenceData.details = pathname.split('/')[1]
          presenceData.state = pathname.split('/')[2]
        }
      }
      break
    }
    case 'playlist': {
      presenceData.details = document.querySelector('h1')?.textContent?.trim()
      presenceData.state = document.querySelector(
        '.card-block a[href=\'\']',
      )?.parentElement
      if (cover) {
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.card .image img')
      }
      presenceData.buttons = [
        {
          label: 'View Playlist',
          url: href,
        },
      ]
      break
    }
    case 'playlists': {
      presenceData.details = 'Browsing playlists'
      break
    }
    case 'multiplayer': {
      switch (pathname.split('/')[2]) {
        case 'games': {
          presenceData.details = 'Browsing multiplayer games'
          break
        }
        case 'game': {
          presenceData.details = 'Viewing multiplayer game'
          presenceData.state = document
            .querySelector('h1')
            ?.textContent
            ?.trim()
            .replace('Multiplayer - ', '')
          presenceData.buttons = [
            {
              label: 'View Game',
              url: href,
            },
          ]
          break
        }
      }
      break
    }
    case 'docs': {
      presenceData.details = 'Viewing wiki'
      presenceData.state = document.querySelector('h1')?.textContent?.trim()
      break
    }
    case 'team': {
      presenceData.details = 'Viewing Quaver team'
      break
    }
    default: {
      presenceData.details = pathname.split('/')[1]
    }
  }

  if (!time)
    delete presenceData.startTimestamp

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
