import { Assets } from 'premid'

const presence = new Presence({
  clientId: '643593006821408778',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const pages: { [k: string]: string } = {
  '/': 'Ana Sayfa',
  '/vip': 'Ana Sayfa',
  '/kesfet': 'Keşfet',
  '/kesfet/eyJjb250ZW50IjoiMSJ9': 'Keşfet (Film)',
  '/trend': 'Trendler',
  '/takvim': 'Dizi Takvimi',
  '/dizi-izle': 'TV Dizileri',
  '/forum': 'Forum',
  '/koleksiyon': 'Koleksiyon',
  '/birlikte-izle': 'Birlikte İzle',
  '/profil/ayarlar': 'Hesap Ayarları',
}
let video: {
  dataAvailable?: boolean
  currentTime?: number
  duration?: number
  paused?: boolean
} = {}

presence.on(
  'iFrameData',
  (inc: unknown) => {
    const data = inc as {
      error?: boolean
      currentTime: number
      duration: number
      paused: boolean
    }
    if (!data.error)
      video = { ...data, dataAvailable: true }
  },
)

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const _video = document.querySelector('video') as HTMLVideoElement
  const isVideoData = Object.keys(video).length > 0
  const categoryTitle = document.querySelector(
    '#router-view > div.ui.grid.mb-0 > div.left.floated.sixteen.wide.tablet.twelve.wide.computer.column.pb-0 > h1',
  )
  const categoryTitle2 = document.querySelector(
    '#router-view > div.ui.grid.mb-0 > div.left.floated.sixteen.wide.tablet.ten.wide.computer.column.pb-0 > h1',
  )
  const showName = document.querySelector(
    '#router-view > div.bg-cover-faker > div.ui.grid > div.left.floated.sixteen.wide.tablet.nine.wide.computer.column > a > h1',
  )
  const movieTitle = document.querySelector(
    '#router-view > div.bg-cover-faker > div:nth-child(3) > div.left.floated.sixteen.wide.tablet.eight.wide.computer.column > a > h1',
  )
  const userName = document.querySelector(
    '#router-view > section > div.ui.grid > div.left.floated.sixteen.wide.tablet.four.wide.computer.column > div > section:nth-child(1) > h2 > a',
  )

  if (!isVideoData && !_video) {
    if (page.includes('/kesfet')) {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: 'Bir sayfaya göz atıyor:',
        state: 'Keşfet',
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (page.includes('/oyuncu/')) {
      const actorName = document.querySelector(
        '#router-view > div > div.profile-header > div.heading-user-title > h1',
      )

      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: 'Bir aktöre göz atıyor:',
        state: actorName ? actorName.textContent?.trim() : 'Belirsiz',
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (
      page.includes('/film/tur/')
      && categoryTitle
      && categoryTitle.textContent !== ''
    ) {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: 'Bir kategoriye göz atıyor:',
        state: categoryTitle.textContent,
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (
      page.includes('/dizi/tur')
      && categoryTitle
      && categoryTitle.textContent !== ''
    ) {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: 'Bir kategoriye göz atıyor:',
        state: categoryTitle.textContent,
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (
      page.includes('/film-izle')
      && categoryTitle2
      && categoryTitle2.textContent !== ''
    ) {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: 'Bir kategoriye göz atıyor:',
        state: categoryTitle2.textContent,
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (
      page.includes('/dizi/')
      && showName
      && showName.textContent !== ''
    ) {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: 'Bir diziye göz atıyor:',
        state: showName.textContent,
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (
      page.includes('/profil/')
      && userName
      && userName.textContent !== ''
    ) {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: 'Bir profile göz atıyor:',
        state: userName.textContent,
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (pages[page] || pages[page.slice(0, -1)]) {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: 'Bir sayfaya göz atıyor:',
        state: pages[page] || pages[page.slice(0, -1)],
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
  }
  else if (_video && !Number.isNaN(_video.currentTime)) {
    const title = document.querySelector(
      '#router-view > div.bg-cover-faker > div.ui.grid.mt-0 > div > h1 > a',
    )
    const episode = document.querySelector(
      '#router-view > div.bg-cover-faker > div.ui.grid.mt-0 > div > h1 > span',
    )

    if (page.includes('/film') && movieTitle && movieTitle.textContent !== '') {
      const [startTimestamp, endTimestamp] = presence.getTimestamps(
        Math.floor(_video.currentTime),
        Math.floor(_video.duration),
      )
      const presenceData: PresenceData = {
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: 'Bir film izliyor:',
        state: movieTitle.textContent,
        smallImageKey: _video.paused ? Assets.Pause : Assets.Play,
        smallImageText: _video.paused
          ? (await strings).pause
          : (await strings).play,
      }

      if (!Number.isNaN(startTimestamp) && !Number.isNaN(endTimestamp)) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = [
          startTimestamp,
          endTimestamp,
        ]
      }
      if (video.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      presence.setActivity(presenceData)
    }
    else if (
      page.includes('/dizi/')
      && title
      && episode
      && title.textContent !== ''
      && episode.textContent !== ''
    ) {
      const [startTimestamp, endTimestamp] = presence.getTimestamps(
        Math.floor(video.currentTime ?? 0),
        Math.floor(video.duration ?? 0),
      )
      const presenceData: PresenceData = {
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: 'Bir film izliyor:',
        state: title.textContent,
        smallImageKey: video.paused ? Assets.Pause : Assets.Play,
        smallImageText: video.paused
          ? (await strings).pause
          : (await strings).play,
      };

      [presenceData.startTimestamp, presenceData.endTimestamp] = [
        startTimestamp,
        endTimestamp,
      ]

      if (video.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      presence.setActivity(presenceData)
    }
  }
  else if (isVideoData && video && !Number.isNaN(video.duration)) {
    const showName2 = document.querySelector(
      '#router-view > div.bg-cover-faker > div.ui.grid.mt-0 > div > h1 > a',
    )
    const episode = document.querySelector(
      '#router-view > div.bg-cover-faker > div.ui.grid.mt-0 > div > h1 > span',
    )

    if (
      page.includes('/film/')
      && movieTitle
      && movieTitle.textContent !== ''
    ) {
      const [startTimestamp, endTimestamp] = presence.getTimestamps(
        Math.floor(video.currentTime ?? 0),
        Math.floor(video.duration ?? 0),
      )
      const presenceData: PresenceData = {
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: 'Bir film izliyor:',
        state: movieTitle.textContent,
        smallImageKey: video.paused ? Assets.Pause : Assets.Play,
        smallImageText: video.paused
          ? (await strings).pause
          : (await strings).play,
      }

      if (!Number.isNaN(startTimestamp) && !Number.isNaN(endTimestamp)) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = [
          startTimestamp,
          endTimestamp,
        ]
      }
      if (video.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      presence.setActivity(presenceData)
    }
    else if (
      page.includes('/dizi/')
      && showName2
      && showName2.textContent !== ''
      && episode
      && episode.textContent !== ''
    ) {
      const [startTimestamp, endTimestamp] = presence.getTimestamps(
        Math.floor(video.currentTime ?? 0),
        Math.floor(video.duration ?? 0),
      )
      const presenceData: PresenceData = {
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
        details: showName2.textContent,
        state: episode.textContent,
        smallImageKey: video.paused ? Assets.Pause : Assets.Play,
        smallImageText: video.paused
          ? (await strings).pause
          : (await strings).play,
      }

      if (!Number.isNaN(startTimestamp) && !Number.isNaN(endTimestamp)) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = [
          startTimestamp,
          endTimestamp,
        ]
      }
      if (video.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      presence.setActivity(presenceData)
    }
  }
  else {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/yabanc%C4%B1dizi/assets/logo.png',
      details: 'Bir sayfaya göz atıyor:',
      state: 'Bilinmeyen Sayfa',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
})
