import { Assets } from 'premid'

const presence = new Presence({ clientId: '980817205480550410' })
const strings = presence.getStrings({
  playing: 'general.playing',
  paused: 'general.paused',
  browsing: 'general.browsing',
  anime: 'general.anime',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let video: HTMLVideoElement | null = null
let tags: HTMLElement | null = null

presence.on('iFrameData', async (msg: unknown) => {
  if (!msg)
    return
  video = msg as HTMLVideoElement
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AnizmTV/assets/logo.png',
  }
  const title = document.querySelector(
    'html > body > main > #pageContent > div > h2 > a',
  )
  const episode = document.querySelector(
    'html > body > main > #pageContent > div > h2.anizm_pageTitle > span',
  )
  const animeSeries = document
    .querySelector('#pageContent > div > h2 > a')
    ?.getAttribute('href') || document.URL

  if (!title || !episode)
    video = null

  if (
    document.location.pathname.includes('/SeriEkle')
    || document.location.pathname.includes('/Bolac')
    || document.location.pathname.includes('/TopluBolac')
    || document.location.pathname.includes('/BolumSil')
    || document.location.pathname.includes('/FanEkle')
    || document.location.pathname.includes('/FanSil')
    || document.location.pathname.includes('/VideoEkle')
    || document.location.pathname.includes('/Toplu')
    || document.location.pathname.includes('/HyperVideo')
    || document.location.pathname.includes('/yetkiliislemleri')
  ) {
    tags = document.querySelector(
      '#pageContent > div.ui.container.anizm_colorWhite.pb-8 > h2 > span',
    )
    if (document.location.pathname.includes('/yetkiliislemleri')) {
      tags = document.querySelector(
        '#pageContent > div > div > div > div:nth-child(1) > div > div > div.header',
      )
    }

    presenceData.state = `${tags?.textContent} panelinde!`
  }
  else if (document.location.pathname.includes('/profil')) {
    presenceData.details = 'Profile Göz atıyor...'
    tags = document.querySelector(
      '#pageContent > div > div.profileCoverArea.autoPosterSize.anizm_round > div.info.pfull > div > div > div:nth-child(1) > div.profileNickname',
    )
    presenceData.state = tags?.textContent?.split('@').slice(1).join(' ')
  }
  else if (document.location.pathname.includes('/ayarlar')) {
    presenceData.details = 'Ayarlara Göz atıyor...'
  }
  else if (document.location.pathname.includes('/ara')) {
    presenceData.details = 'Aranıyor: '
    tags = document.querySelector('#pageContent > div > h2 > span')
    presenceData.state = tags?.textContent?.split('Aranan: ').slice(1).join(' ')
  }
  else if (document.location.pathname.includes('/girisyap')) {
    presenceData.details = 'Giriş yapıyor...'
  }
  else if (document.location.pathname.includes('/uyeol')) {
    presenceData.details = 'Üye oluyor...'
  }
  else if (window.location.href.indexOf('?sayfa=') > 1) {
    presenceData.details = (await strings).browsing
    presenceData.state = `Sayfa: ${document.URL.split('?sayfa=')[1]
      ?.split('#episodes')
      .slice(0)
      .join(' ')}`
  }

  // Episode part
  if (title && episode) {
    presenceData.details = title.textContent
    presenceData.state = episode.textContent?.split('/ ').slice(1).join(' ')
    presenceData.state += ' İzliyor'
    presenceData.buttons = [
      {
        label: 'Bölümü İzle',
        url: document.URL.split('&')[0] ?? '',
      },
      {
        label: (await strings).anime,
        url: animeSeries,
      },
    ]
  }
  else if (title) {
    // Series part
    presenceData.details = title.textContent
    presenceData.buttons = [
      {
        label: (await strings).anime,
        url: animeSeries,
      },
    ]
  }
  else if (
    document.location.pathname.includes('/SeriEkle')
    || document.location.pathname.includes('/Bolac')
    || document.location.pathname.includes('/TopluBolac')
    || document.location.pathname.includes('/BolumSil')
    || document.location.pathname.includes('/FanEkle')
    || document.location.pathname.includes('/FanSil')
    || document.location.pathname.includes('/VideoEkle')
    || document.location.pathname.includes('/Toplu')
    || document.location.pathname.includes('/HyperVideo')
    || document.location.pathname.includes('/yetkiliislemleri')
    || document.location.pathname.includes('/profil')
    || document.location.pathname.includes('/ayarlar')
    || document.location.pathname.includes('/arama')
    || document.location.pathname.includes('/girisyap')
    || document.location.pathname.includes('/uyeol')
    || window.location.href.indexOf('?sayfa=') > 1
  ) {
    // Home page part
    presenceData.startTimestamp = browsingTimestamp
  }
  else {
    presenceData.details = (await strings).browsing
    presenceData.startTimestamp = browsingTimestamp
  }

  if (video) {
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).paused
      : (await strings).playing

    if (!video.paused && video.duration) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        Math.floor(video.currentTime),
        Math.floor(video.duration),
      )
    }
  }

  presence.setActivity(presenceData)
})
