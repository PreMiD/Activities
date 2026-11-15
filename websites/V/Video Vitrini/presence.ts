import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1481304927690293258',
})

presence.on('UpdateData', async () => {
  const sayfaYolu = window.location.pathname
  const isWatch = sayfaYolu.startsWith('/watch')
  const isShorts = sayfaYolu.startsWith('/shorts')

  // İzleme sayfalarında değilsek aktiviteyi kapat
  if (!isWatch && !isShorts) {
    presence.clearActivity()
    return
  }

  const videolar = document.querySelectorAll('video')
  let aktifVideo = null

  for (const video of Array.from(videolar)) {
    if (!video.paused) {
      aktifVideo = video
      break
    }
  }

  if (!aktifVideo && videolar.length > 0) {
    aktifVideo = videolar[0]
  }

  // Başlıktaki HTML bozulmalarını düzeltir
  let sayfaBasligi = document.title || 'Video Vitrini'
  sayfaBasligi = sayfaBasligi
    .replace(/&#039;/g, '\'')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

  // Sayfa türüne göre buton yazısını belirliyoruz
  const butonMetni = isShorts ? 'Kısa Videoyu İzle' : 'Videoyu İzle'

  const presenceData: PresenceData = {
    details: sayfaBasligi,
    state: 'Sitede geziniyor',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Video%20Vitrini/assets/logo.png',
    largeImageText: 'Video Vitrini',
    type: ActivityType.Watching,
    // Discord durumuna buton ekleme kısmı
    buttons: [
      {
        label: butonMetni,
        url: window.location.href, // Kullanıcının o an bulunduğu sayfanın tam linki
      },
    ],
  }

  if (aktifVideo) {
    if (!aktifVideo.paused) {
      presenceData.state = 'Video İzliyor'
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Oynatılıyor'

      const currentTimestamp = Math.floor(Date.now() / 1000)
      const videoZamani = Math.floor(aktifVideo.currentTime)
      presenceData.startTimestamp = currentTimestamp - videoZamani
    }
    else {
      presenceData.state = 'Video Duraklatıldı'
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Duraklatıldı'
    }
  }

  presence.setActivity(presenceData)
})
