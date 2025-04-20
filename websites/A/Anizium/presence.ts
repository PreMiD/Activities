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
let video: iframeData

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
  const presenceData: PresenceData = {}

  presenceData.startTimestamp = browsingTimestamp
  presenceData.type = ActivityType.Watching
  if (document.location.pathname === '/'
    || document.location.pathname === '/privacy-policy'
    || document.location.pathname === '/comment-policy'
    || document.location.pathname === '/tos') {
    presenceData.details = 'Anizium'
    presenceData.state = 'Ana Sayfa görüntüleniyor'
  }
  // WATCHING PAGE
  else if (
    document.location.pathname.includes('/title/')
    && (document.location.pathname.includes('/season-1/')
      || document.location.pathname.includes('/season-2/')
      || document.location.pathname.includes('/season-3/')
      || document.location.pathname.includes('/season-4/')
      || document.location.pathname.includes('/season-5/')
      || document.location.pathname.includes('/season-6/')
      || document.location.pathname.includes('/season-7/')
      || document.location.pathname.includes('/season-8/'))) {
    presenceData.largeImageKey = Images.Logo
    presenceData.details = document.querySelectorAll('.breadcrumb-content a')[1]?.textContent || 'Loading'
    presenceData.state = document.querySelectorAll('.breadcrumb-content a')[2]?.textContent || 'Loading'

    if (video) {
      presenceData.smallImageKey = video.paused
        ? Assets.Pause
        : Assets.Play
      presenceData.smallImageText = video.paused ? 'Duraklatıldı' : 'Oynatılıyor';

      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)

      if (video.paused)
        delete presenceData.endTimestamp
    }
  }
  // EPISODES PAGE
  else if (
    document.location.pathname.includes('/title/')) {
    presenceData.largeImageKey = Images.Logo
    presenceData.details = document.querySelector('.trailer-content h1')?.textContent || 'Loading'
    presenceData.state = 'Bölümler görüntüleniyor'
  }
  // BROWSE
  else if (
    document.location.pathname === '/discover') {
    presenceData.largeImageKey = Images.Logo
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Göz atılıyor..'
    presenceData.details = 'Anizium'
    presenceData.state = 'Göz atılıyor..'
  }
  else if (
    document.location.pathname.includes('/category/')) {
    presenceData.largeImageKey = Images.Logo
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = document.querySelector('.container > .heading h2')?.textContent
    presenceData.details = 'Anizium'
    presenceData.state = 'Kategoriler inceleniyor..'
  }
  else if (document.location.pathname === '/premium'
    || document.location.pathname.includes('/buy/')
    || document.location.pathname.includes('/gift')) {
    presenceData.largeImageKey = Images.Logo
    presenceData.details = 'Anizium'
    presenceData.state = 'Premium paketleri görüntüleniyor'
  }
  else if (document.location.pathname === '/manager'
    || document.location.pathname === '/premium/manager'
    || document.location.pathname === '/devices'
    || document.location.pathname === '/change-password') {
    presenceData.largeImageKey = Images.Logo
    presenceData.smallImageKey = Images.SettingsICO
    presenceData.details = 'Anizium'
    presenceData.state = 'Hesap yönetimi'
  }
  else if (document.location.pathname === '/profiles'
    || document.location.pathname.includes('/option')) {
    presenceData.largeImageKey = Images.Logo
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Profiller'
    presenceData.details = 'Anizium'
    presenceData.state = 'Profiller görüntüleniyor'
  }
  else if (document.location.pathname.includes('/profiles')
    && document.location.pathname.includes('/avatar')) {
    presenceData.largeImageKey = Images.Logo
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Anizium'
    presenceData.state = 'Avatar seçimi'
  }
  else {
    switch (document.location.pathname) {
      case '/list': {
        presenceData.largeImageKey = Images.Logo
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = 'Listeler'
        presenceData.details = 'Anizium'
        presenceData.state = 'Listeler görüntüleniyor..'
        break
      }
      case '/search': {
        presenceData.largeImageKey = Images.Logo
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Aranıyor'
        presenceData.details = 'Aranıyor:'
        presenceData.state = document.querySelector('.container > .heading h2')?.textContent
        break
      }
      default: {
        presenceData.largeImageKey = Images.Logo
        presenceData.details = 'Anizium'
        presenceData.state = 'Sayfa görüntüleniyor..'
      }
    }
  }
  presence.setActivity(presenceData)
}
setInterval(updatePresence, 1000)

document.addEventListener('DOMContentLoaded', () => {
  updatePresence()
  observeDOMChanges(updatePresence)
})
