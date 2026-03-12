import { Assets } from 'premid'

const presence = new Presence({
  clientId: '926450473559547944',
})
const presenceStrings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
async function presenceSettings() {
  return {
    showImages: await presence.getSetting<boolean>('showImages'),
    showButtons: await presence.getSetting<boolean>('showButtons'),
  }
}
const presencePages: { [k: string]: string } = {
  '/': 'Ana Sayfa',
  '/guncel': 'Güncel İçerikler',
  '/haber': 'Haber',
  '/dizi': 'Diziler',
  '/film': 'Filmler',
  '/program': 'Programlar',
  '/belgesel': 'Belgeseller',
  '/muzik': 'Müzikler',
  '/spor': 'Spor',
  '/listelerim': 'Listelerim',
  '/profil': 'Hesap Bilgilerim',
  '/abonelik-secenekleri': 'Abonelik Seçenekleri',
  '/sikca-sorulan-sorular': 'Sıkça Sorulan Sorular',
  '/nasil-izlerim': 'Nasıl İzlerim?',
  '/kupon-kullan': 'Kupon Kullan',
  '/kurumsal-bilgiler': 'Kurumsal Bilgiler',
  '/uyelik-kosullari': 'Üyelik Koşulları',
  '/on-bilgilendirme-formu': 'Ön Bilgilendirme Formu',
  '/cerez-politikasi': 'Çerez Politikası',
  '/gizlilik-politikasi': 'Gizlilik Politikası',
  '/abonelik-sozlesmesi': 'Abonelik Sözleşmesi',
}

presence.on('UpdateData', async () => {
  const path = document.location.pathname
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GA%C4%B0N/assets/logo.jpeg',
    startTimestamp: Math.floor(Date.now() / 1000),
  }
  const settings = await presenceSettings()

  if (path.startsWith('/v/')) {
    const video = document.querySelector<HTMLVideoElement>('video')

    presenceData.details = document
      .querySelector<HTMLHeadingElement>('.container-fluid .video-details h1')
      ?.textContent
      ?.split('-')?.[0] || 'Bilinmeyen Dizi'
    presenceData.state = document.querySelector<HTMLSpanElement>(
      '.container-fluid .video-details div span.season-and-episode',
    )?.textContent

    if (settings.showImages) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '#video-detail-hero-video-container .video-detail-hero-video.hero-img picture img',
      )?.src || 'g-logo'
    }

    if (settings.showButtons) {
      presenceData.buttons = [
        {
          label: presenceData.state ? 'Bölüme Git' : 'Filme Git',
          url: `https://presence.tv${document.location.pathname}`,
        },
      ]
    }

    if (video && !Number.isNaN(video.duration)) {
      presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video?.paused
        ? (await presenceStrings).pause
        : (await presenceStrings).play;

      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        Math.floor(video?.currentTime),
        Math.floor(video?.duration),
      )

      if (video?.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }

    presence.setActivity(presenceData)
  }
  else if (path.startsWith('/t/')) {
    presenceData.details = 'Bir içeriğe göz atıyor:'
    presenceData.state = document.querySelector<HTMLHeadingElement>(
      '.container-fluid .video-details h1',
    )?.textContent || 'Bilinmeyen Dizi'

    if (settings.showImages) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '#video-detail-hero .video-detail-hero-video.hero-img picture img',
      )?.src || 'g-logo'
    }

    presence.setActivity(presenceData)
  }
  else if (presencePages[path] || presencePages[path.slice(0, -1)]) {
    presenceData.state = presencePages[path]
      || presencePages[path.slice(0, -1)]
      || 'Bilinmeyen Sayfa'

    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
