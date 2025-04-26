import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1342545631629152287',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum Images {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Anizium/assets/logo.png',
  SettingsICO = 'https://cdn.rcd.gg/PreMiD/websites/A/Anizium/assets/0.png',
}

interface iframeData {
  duration: number
  currentTime: number
  paused: boolean
}
let video: iframeData | undefined

let savedPosterUrl: string | null = null
let seasonModeActive = false

function updatePoster() {
  const luiUrl = 'https://luii.xyz/ani?path='
  const animeImg = document.querySelector('.img-block > img')?.getAttribute('src')
  const pathname = document.location.pathname

  if (pathname.includes('/season-')) {
    if (!seasonModeActive) {
      seasonModeActive = true
      savedPosterUrl = animeImg ? luiUrl + animeImg : null
    }
  } else if (pathname.includes('/title/')) {
    savedPosterUrl = animeImg ? luiUrl + animeImg : null
    seasonModeActive = false
  } else {
    savedPosterUrl = null
    seasonModeActive = false
  }
}

function buildPresence(): PresenceData {
  const presenceData: PresenceData = {
    largeImageKey: savedPosterUrl || Images.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  if (video && document.location.pathname.includes('/season-')) {
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? 'Duraklatıldı' : 'Oynatılıyor'
    const [start, end] = getTimestamps(video.currentTime, video.duration)
    presenceData.startTimestamp = start
    if (!video.paused) {
      presenceData.endTimestamp = end
    }
  }

  return presenceData
}

presence.on('iFrameData', (data: unknown) => {
  if (data) {
    video = data as iframeData

    updatePoster()

    if (document.location.pathname.includes('/title/')) {
      const iframePresenceData = buildPresence()

      if (document.location.pathname.includes('/season-')) {
        iframePresenceData.details = document.querySelectorAll('.breadcrumb-content a')[1]?.textContent || 'Loading'
        iframePresenceData.state = document.querySelectorAll('.breadcrumb-content a')[2]?.textContent || 'Loading'
      } else {
        iframePresenceData.details = document.querySelector('.trailer-content h1')?.textContent || 'Loading'
        iframePresenceData.state = 'Bölümler görüntüleniyor'
      }

      presence.setActivity(iframePresenceData)
    }
  }
})

presence.on('UpdateData', async () => {
  setTimeout(() => {
    updatePoster()

    const presenceData = buildPresence()
    const pathname = document.location.pathname

    if (
      pathname === '/' ||
      pathname === '/privacy-policy' ||
      pathname === '/comment-policy' ||
      pathname === '/tos'
    ) {
      presenceData.details = 'Anizium'
      presenceData.state = 'Ana Sayfa görüntüleniyor'
    }
    else if (pathname.includes('/title/') && pathname.includes('/season-')) {
      presenceData.details = document.querySelectorAll('.breadcrumb-content a')[1]?.textContent || 'Loading'
      presenceData.state = document.querySelectorAll('.breadcrumb-content a')[2]?.textContent || 'Loading'
    }
    else if (pathname.includes('/title/')) {
      presenceData.details = document.querySelector('.trailer-content h1')?.textContent || 'Loading'
      presenceData.state = 'Bölümler görüntüleniyor'
    }
    else if (pathname === '/discover') {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Göz atılıyor..'
      presenceData.details = 'Anizium'
      presenceData.state = 'Göz atılıyor..'
    }
    else if (pathname.includes('/category/')) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = document.querySelector('.container > .heading h2')?.textContent
      presenceData.details = 'Anizium'
      presenceData.state = 'Kategoriler inceleniyor..'
    }
    else if (
      pathname === '/premium' ||
      pathname.includes('/buy/') ||
      pathname.includes('/gift')
    ) {
      presenceData.details = 'Anizium'
      presenceData.state = 'Premium paketleri görüntüleniyor'
    }
    else if (
      pathname === '/manager' ||
      pathname === '/premium/manager' ||
      pathname === '/devices' ||
      pathname === '/change-password'
    ) {
      presenceData.smallImageKey = Images.SettingsICO
      presenceData.details = 'Anizium'
      presenceData.state = 'Hesap yönetimi'
    }
    else if (
      pathname === '/profiles' ||
      pathname.includes('/option')
    ) {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Profiller'
      presenceData.details = 'Anizium'
      presenceData.state = 'Profiller görüntüleniyor'
    }
    else if (
      pathname.includes('/profiles') &&
      pathname.includes('/avatar')
    ) {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.details = 'Anizium'
      presenceData.state = 'Avatar seçimi'
    }
    else {
      switch (pathname) {
        case '/list':
          presenceData.smallImageKey = Assets.Viewing
          presenceData.smallImageText = 'Listeler'
          presenceData.details = 'Anizium'
          presenceData.state = 'Listeler görüntüleniyor..'
          break
        case '/search':
          presenceData.smallImageKey = Assets.Search
          presenceData.smallImageText = 'Aranıyor'
          presenceData.details = 'Aranıyor:'
          presenceData.state = document.querySelector('.container > .heading h2')?.textContent
          break
        default:
          presenceData.details = 'Anizium'
          presenceData.state = 'Sayfa görüntüleniyor..'
          break
      }
    }

    presence.setActivity(presenceData)
  }, 1000)
})
