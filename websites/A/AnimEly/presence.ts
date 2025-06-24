import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1343296691477938186',
})

let videoData: HTMLVideoElement | null = null

presence.on('iFrameData', (data) => {
  videoData = data
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimEly/assets/logo.png',
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const path = document.location.pathname

  if (path === '/') {
    presenceData.details = 'Ana sayfaya göz atıyor'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (path === '/yeni-bolumler') {
    presenceData.details = 'Yeni bölümlere göz atıyor'
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [
      {
        label: 'Yeni Bölümleri Görüntüle',
        url: 'https://animely.net/yeni-bolumler',
      },
    ]
  }
  else if (path === '/takvim') {
    presenceData.details = 'Anime takvimine bakıyor'
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [
      {
        label: 'Takvimi Görüntüle',
        url: 'https://animely.net/takvim',
      },
    ]
  }
  else if (path === '/animeler') {
    presenceData.details = 'Tüm animelere göz atıyor'
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [
      {
        label: 'Tüm Animeleri Görüntüle',
        url: 'https://animely.net/animeler',
      },
    ]
  }
  else if (path === '/profil') {
    presenceData.details = 'Profiline bakıyor'
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [
      {
        label: 'Profili Görüntüle',
        url: 'https://animely.net/profil',
      },
    ]
  }
  else if (path === '/anime-severler') {
    presenceData.details = 'Anime severler sıralamasına bakıyor'
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [
      {
        label: 'Sıralamayı Görüntüle',
        url: 'https://animely.net/anime-severler',
      },
    ]
  }

  else if (path.includes('/anime/') && path.includes('/izle/')) {
    const pathParts = path.split('/')
    const episodeNumber = pathParts[4] || '1'

    const animeTitle = document.querySelector('div.mb-2.sm\\:mb-0 > div > div:nth-child(1) > a')?.textContent

    presenceData.details = animeTitle
    presenceData.state = `Bölüm ${episodeNumber}`

    if (videoData) {
      if (!videoData.paused && !videoData.ended) {
        presenceData.smallImageKey = Assets.Play
        presenceData.startTimestamp = browsingTimestamp - Math.floor(videoData.currentTime)
        presenceData.endTimestamp = browsingTimestamp + Math.floor(videoData.duration - videoData.currentTime)
      }
      else if (videoData.ended) {
        presenceData.smallImageKey = Assets.Stop
        presenceData.state += ' - bitti'
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.state += ' - duraklatıldı'
      }
    }
    else {
      const videoElement = document.querySelector('video')
      if (videoElement && !videoElement.paused) {
        presenceData.smallImageKey = Assets.Play
        presenceData.startTimestamp = browsingTimestamp - Math.floor(videoElement.currentTime)
        presenceData.endTimestamp = browsingTimestamp + Math.floor(videoElement.duration - videoElement.currentTime)
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.state += ' - duraklatıldı'
      }
    }

    presenceData.buttons = [
      {
        label: 'Anime İzle',
        url: document.location.href,
      },
    ]
  }
  else if (path.includes('/anime/')) {
    const animeTitle = document.querySelector('main h1')?.textContent

    presenceData.details = 'Anime sayfasına bakıyor'
    presenceData.state = animeTitle
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [
      {
        label: 'Anime Sayfasını Görüntüle',
        url: document.location.href,
      },
    ]
  }
  else {
    presenceData.details = 'Animely\'e göz atıyor'
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [
      {
        label: 'Sayfayı Ziyaret Et',
        url: document.location.href,
      },
    ]
  }

  presence.setActivity(presenceData)
})
