import { Assets } from 'premid'

const presence = new Presence({
  clientId: '747190301676011550',
})
const strings = presence.getStrings({
  playing: 'general.playing',
  paused: 'general.paused',
  browsing: 'general.browsing',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let video: HTMLVideoElement

presence.on('iFrameData', async (msg: unknown) => {
  if (!msg)
    return
  video = msg as typeof video
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeWho/assets/logo.jpg',
    details: 'Ana Sayfada Anime Arıyor',
    startTimestamp: browsingTimestamp,
  }
  presenceData.details = (
    document.querySelector('head > title') as HTMLHeadElement
  ).textContent?.replace('Türkçe İzle - AnimeWho? Anime', '').replace('Türkçe Oku - AnimeWho? Manga', '').replace('AnimeWho?', '').replace(' Türkçe İzle ve İndir', '')
  if (document.location.pathname === '/') {
    presenceData.details = 'Ana Sayfada'
    presenceData.state = 'Anime & Manga Arıyor'
  }
  else if (/izle\/[a-zA-Z0_9]+/.test(document.location.pathname)) {
    presenceData.state = `${
      (
        document.querySelector(
          'div.MuiBox-root > button.MuiButton-outlinedSecondary > span.MuiButton-label',
        ) as HTMLSpanElement
      ).textContent
    }'ü İzliyor`
  }
  else if (/oku\/\d+\/\d+/.test(document.location.pathname)) {
    const readType = document.querySelector(
      'div.MuiGrid-root > div.MuiBox-root > button.MuiButtonBase-root > span.MuiButton-label',
    )
    const arr = document.location.pathname.split('/')
    presenceData.state = `${arr[5]}.Bölüm`
    if (readType && readType.textContent?.includes('Webtoon'))
      presenceData.state = `${arr[5]}.Bölüm ${arr[6]}.Sayfa`
  }
  else if (
    document.location.pathname.includes('/izle')
    || document.location.pathname.includes('/oku')
  ) {
    presenceData.state = 'Bölüm Seçiyor'
  }
  else if (/ceviriler\/anime/.test(document.location.pathname)) {
    presenceData.state = 'Göz Gezdiriyor'
  }
  else if (document.location.pathname.includes('/ekip-alimlari')) {
    presenceData.details = 'Ekip Alımları'
    presenceData.state = 'Potansiyel Ekip Üyesi'
  }
  else if (document.location.pathname.includes('/ara')) {
    if (
      (
        document.querySelector(
          'div.MuiGrid-root > div.MuiBox-root > button.MuiButton-outlinedPrimary > span.MuiButton-label',
        ) as HTMLSpanElement
      ).textContent === 'Anime'
    ) {
      presenceData.state = 'Ne İzlesem Diye Bakıyor'
    }
    else {
      presenceData.state = 'Ne Okusam Diye Bakıyor'
    }
  }
  else if (document.location.pathname.includes('/destek-ol')) {
    presenceData.details = 'Destek Ol'
    presenceData.state = 'Acaba? Bir İhtimal?'
  }
  else if (document.location.pathname.includes('/sss')) {
    presenceData.details = 'Sıkça Sorulan Sorular'
    presenceData.state = 'Sorunlarına Çözüm Arıyor'
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
