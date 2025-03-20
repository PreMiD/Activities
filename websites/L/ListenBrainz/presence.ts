import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1020099638470127627',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum Asset {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/ListenBrainz/assets/logo.png',
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: Asset.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = window.location
  const pathSplit = pathname.split('/').slice(1)
  const pageTitle = document.querySelector<HTMLHeadingElement>('.page-title')?.textContent

  switch (pathSplit[0]) {
    case '': {
      presenceData.details = 'Browsing homepage'
      break
    }
    case 'about': {
      presenceData.details = 'Browsing'
      presenceData.state = 'About'
      break
    }
    case 'explore': {
      presenceData.details = 'Browsing'
      switch (pathSplit[1]) {
        case 'huesound': {
          presenceData.state = 'Huesound'
          break
        }
        case 'similar-users': {
          presenceData.state = 'Top Similar Users'
          break
        }
      }
      break
    }
    case 'feed': {
      presenceData.details = 'Browsing'
      presenceData.state = 'Latest activity feed'
      break
    }
    case 'profile': {
      presenceData.details = 'Managing profile settings'
      break
    }
    case 'recommended': {
      presenceData.details = 'Viewing recommendations'
      let type = 'tracks'
      switch (pathSplit[3]) {
        case 'top_artist': {
          type = 'Top artist'
          break
        }
        case 'similar_artist': {
          type = 'Similar artist'
          break
        }
        case 'raw': {
          type = 'Raw track'
          break
        }
      }
      presenceData.state = `${type} recommendations for ${pageTitle}`
      break
    }
    case 'recent': {
      presenceData.details = 'Browsing'
      presenceData.state = 'Recent listens'
      break
    }
    case 'user': {
      presenceData.details = 'Viewing a user\'s profile'
      switch (pathSplit[2] ?? '') {
        case '': {
          presenceData.state = pageTitle
          break
        }
        case 'reports': {
          presenceData.state = `${pageTitle}'s reports`
          break
        }
        case 'charts': {
          presenceData.state = `${pageTitle}'s charts`
          break
        }
        case 'feedback': {
          presenceData.state = `${pageTitle}'s loved/hated tracks`
          break
        }
        case 'pins': {
          presenceData.state = `${pageTitle}'s pinned recordings`
          break
        }
        case 'playlists': {
          presenceData.state = `${pageTitle}'s playlists`
          break
        }
        case 'recommendations': {
          presenceData.state = `${pageTitle}'s recommended playlists`
          break
        }
        case 'collaborations': {
          presenceData.state = `${pageTitle}'s collaborative playlists`
          break
        }
      }
      break
    }
    case 'playlist': {
      presenceData.details = 'Viewing a playlist'
      presenceData.state = document
        .querySelector<HTMLDivElement>('.title > div')
        ?.firstChild
        ?.textContent
      if (
        document
          .querySelector('.title > small')
          ?.firstChild
          ?.textContent
          ?.trim() !== 'Private'
      ) {
        presenceData.buttons = [
          {
            label: 'View playlist',
            url: href,
          },
        ]
      }
      break
    }
    default: {
      presenceData.details = 'Browsing'
      presenceData.state = pageTitle ?? document.title.match(/^(.*?)(?: - ListenBrainz)?$/)?.[1]
      break
    }
  }

  if (document.querySelector('#brainz-player')) {
    const currentlyPlayingElement = document.querySelector<HTMLDivElement>('.currently-playing')
    if (currentlyPlayingElement) {
      presenceData.smallImageText = currentlyPlayingElement.textContent
      presenceData.smallImageKey = document
        .querySelector<HTMLDivElement>('.play')
        ?.getAttribute('title') === 'Play'
        ? Assets.Pause
        : Assets.Play
    }
  }

  presence.setActivity(presenceData)
})
