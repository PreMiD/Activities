import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1212022540080382013',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  view: 'general.watching',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Tabii/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const { pathname, href } = document.location

  if (pathname === '/' || pathname.includes('/browse/')) {
    const pageIds = [
      { id: '154830_134666', name: 'Anasayfa' },
      { id: '149106_149112', name: 'Dizi' },
      { id: '149265_149266', name: 'Film' },
      { id: '149301_149418', name: 'Belgesel' },
      { id: '149332_149333', name: 'Çocuk' },
      { id: '233080_242470', name: 'Tekrar İzle' },
    ]

    presenceData.details = `${
      pageIds.find(x => pathname.includes(x.id))?.name
    } Sayfasına Göz Atıyor`
  }
  else if (pathname.includes('/settings/account')) {
    presenceData.details = 'Hesap Ayarlarına Göz Atıyor.'
  }
  else if (pathname.includes('/settings/profile')) {
    presenceData.details = 'Profil Ayarlarına Göz Atıyor.'
  }
  else if (pathname.includes('/search')) {
    if (document.querySelector('input')?.value)
      presenceData.details = 'Arama Yapıyor.'
    else presenceData.details = 'Arama Sayfasına Göz Atıyor.'
  }
  else if (pathname.includes('/watch')) {
    const video = document.querySelector('video')

    if (video) {
      presenceData.state = document.querySelector('h1')?.textContent
      const stringsData = await strings
      presenceData.buttons = [
        {
          label: `${stringsData.view} ${presenceData.state}`,
          url: href,
        },
      ]

      if (video.currentTime && video.duration) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)

        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? stringsData.pause
          : stringsData.play
      }
    }
  }
  else if (pathname.includes('/genre')) {
    const catName = document.querySelector<HTMLElement>(
      '#Main > div > div:nth-child(1) > main > div > div.flex.pt-8 > div > div > span:nth-child(2)',
    )?.textContent
    if (catName)
      presenceData.details = `${catName} Kategorisine Göz Atıyor.`
    else presenceData.details = 'Kategori Sayfasına Göz Atıyor.'
  }
  else if (pathname.includes('/my-stuff')) {
    presenceData.details = 'Kütüphanesine Göz Atıyor.'
  }
  else if (pathname.includes('/faq')) {
    presenceData.details = 'SSS\'ye Göz Atıyor.'
  }
  else {
    presenceData.details = 'Bilinmeyen Sayfada.'
  }

  presence.setActivity(presenceData)
})
