import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1336362292622655569',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum Images {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeciX/assets/logo.png',
  SettingsICO = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeciX/assets/0.png',
}

interface iframeData {
  duration: number
  currentTime: number
  paused: boolean
}
let video: iframeData | null = null

presence.on('iFrameData', (data: unknown) => {
  if (data) {
    video = data as iframeData
    updatePresence()
  }
})

function observeDOMChanges(callback: () => void) {
  new MutationObserver(() => {
    callback()
  }).observe(document.body, { childList: true, subtree: true })
}
function updatePresence() {
  const presenceData: PresenceData = {
    largeImageKey: Images.Logo,
  }

  presenceData.startTimestamp = browsingTimestamp;
  (presenceData as PresenceData).type = ActivityType.Watching
  if (document.location.pathname === '/') {
    presenceData.details = 'AnimeciX'
    presenceData.state = 'Ana Sayfa görüntüleniyor'

    // WATCHİNG PAGE
  }
  else if (
    document.location.pathname.includes('/titles/')
    && document.location.pathname.includes('/episode/')
  ) {
    // Thumbnail
    const animeImg = document
      .querySelector<HTMLElement>('media-item-header')
      ?.style
      .backgroundImage
      .match(/url\(["']?(.*?)["']?\)/)?.[1]

    presenceData.largeImageKey = animeImg
    presenceData.details = document.querySelectorAll('.t-title > .ng-star-inserted')[1]
      ?.textContent || 'Loading'
    presenceData.state = document.querySelector('.episode-number')?.textContent || 'Loading'

    if (video) {
      presenceData.smallImageKey = video.paused
        ? Assets.Pause
        : Assets.Play
      presenceData.smallImageText = video.paused ? 'Duraklatıldı' : 'Oynatılıyor';

      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)

      if (video.paused)
        delete presenceData.endTimestamp
    }

    // EPİSODES PAGE
  }
  else if (
    document.location.pathname.includes('/titles/')
    && !document.location.pathname.includes('/episode/')
  ) {
    // Thumbnail
    const animeImg = document
      .querySelector<HTMLElement>('media-item-header')
      ?.style
      .backgroundImage
      .match(/url\(["']?(.*?)["']?\)/)?.[1]

    presenceData.largeImageKey = animeImg
    presenceData.details = document.querySelector('.t-title a')?.textContent || 'Loading'
    presenceData.state = 'Bölümler görüntüleniyor'

    // BROWSE
  }
  else if (
    document.location.pathname === '/browse'
    && !document.location.pathname.includes('/lists/')
  ) {
    presenceData.largeImageKey = Images.Logo
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Göz atılıyor..'
    presenceData.details = 'AnimeciX'
    presenceData.state = 'Göz atılıyor..'
  }
  else if (document.location.pathname === '/calendar') {
    presenceData.largeImageKey = Images.Logo
    presenceData.details = 'AnimeciX'
    presenceData.state = 'Takvim görüntüleniyor..'
  }
  else if (document.location.pathname === '/news') {
    presenceData.largeImageKey = Images.Logo
    presenceData.details = 'AnimeciX'
    presenceData.state = 'Haberler görüntüleniyor..'
  }
  else if (document.location.pathname.includes('/users/')) {
    const userName = document.querySelector('.header > h1.name')?.textContent
    presenceData.largeImageKey = Images.Logo
    presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
      '.header > .user-avatar.real',
    )?.src
    presenceData.smallImageText = userName
    presenceData.details = 'Kullanıcı görüntüleniyor:'
    presenceData.state = userName || 'Loading..'
  }
  else {
    switch (document.location.pathname) {
      case '/watchlist': {
        presenceData.largeImageKey = Images.Logo
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = 'Watchlist'
        presenceData.details = 'AnimeciX'
        presenceData.state = 'İzlenenler görüntüleniyor..'
        break
      }
      case '/lists': {
        presenceData.largeImageKey = Images.Logo
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = 'İzlenecek Listesi'
        presenceData.details = 'AnimeciX'
        presenceData.state = 'İzleme listeleri görüntüleniyor..'
        break
      }
      case '/lists/liked': {
        presenceData.largeImageKey = Images.Logo
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = 'Favoriler'
        presenceData.details = 'AnimeciX'
        presenceData.state = 'Favoriler görüntüleniyor..'
        break
      }
      case '/lists/browse': {
        presenceData.largeImageKey = Images.Logo
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Browsing..'
        presenceData.details = 'AnimeciX'
        presenceData.state = 'Oynatma listeleri görüntüleniyor..'
        break
      }
      default:
        if (
          document.location.pathname.includes('/lists/')
          && /\d/.test(document.location.pathname)
        ) {
          const listname = document.querySelector('.list-name')?.textContent
          presenceData.largeImageKey = Images.Logo
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = listname || 'Loading..'
          presenceData.details = 'Liste görüntüleniyor:'
          presenceData.state = listname || 'Loading..'
        }
        else {
          switch (document.location.pathname) {
            case '/account/settings': {
              presenceData.largeImageKey = Images.Logo
              presenceData.smallImageKey = Images.SettingsICO
              presenceData.smallImageText = 'Ayarlar'
              presenceData.details = 'AnimeciX'
              presenceData.state = 'Ayarlar'
              break
            }
            case '/gw-rooms': {
              presenceData.largeImageKey = Images.Logo
              presenceData.smallImageKey = Assets.Premiere
              presenceData.smallImageText = 'Group Watch'
              presenceData.details = 'AnimeciX'
              presenceData.state = 'İzleme odaları görüntüleniyor..'
              break
            }
            case '/search': {
              presenceData.largeImageKey = Images.Logo
              presenceData.smallImageKey = Assets.Search
              presenceData.smallImageText = 'Aranıyor'
              presenceData.details = 'Aranıyor:'
              presenceData.state = document.querySelector('.query')?.textContent
              break
            }
            default: {
              presenceData.largeImageKey = Images.Logo
              presenceData.details = 'AnimeciX'
              presenceData.state = 'Sayfa görüntüleniyor..'
            }
          }
        }
    }
  }

  presence.setActivity(presenceData)
}

document.addEventListener('DOMContentLoaded', () => {
  updatePresence()
  observeDOMChanges(updatePresence)
})
