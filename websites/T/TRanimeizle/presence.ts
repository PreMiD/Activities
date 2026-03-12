import { Assets } from 'premid'

const presence = new Presence({
  clientId: '819994268801957899',
})
const pages: { [k: string]: string } = {
  '/': 'Ana Sayfa',
  '/haberler': 'Haberler',
  '/ekipAlimi/translator': 'Çevirmen Alımı',
  '/ekipAlimi/uploader': 'Yükleyici Alımı',
  '/ekipAlimi/encoder': 'Encoder Alımı',
  '/ekipAlimi/editor': 'Editör Alımı',
  '/iletisim': 'İletişim',
  '/Account/Login': 'Giriş Yap',
  '/Account/Register': 'Kayıt Ol',
}
const strings = presence.getStrings(
  {
    play: 'general.playing',
    pause: 'general.paused',
  },
  'tr',
)

interface iframeData {
  duration: number
  currentTime: number
  paused: boolean
}

let video: iframeData
presence.on('iFrameData', (data: unknown) => {
  if (data)
    video = data as iframeData
})

const startTimestamp = Math.floor(Date.now() / 1000)
presence.on('UpdateData', async () => {
  const page: string = location.pathname
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TRanimeizle/assets/logo.png',
    startTimestamp,
  }

  if (page.includes('/arama/')) {
    presenceData.details = 'Bir şey arıyor:'
    presenceData.state = document
      .querySelector('.post-head .title strong')
      ?.textContent
      ?.replaceAll('"', '')
    presenceData.smallImageKey = Assets.Search
  }
  else if (page.includes('/harfler/')) {
    const letter = document.querySelector(
      '.post-head .title strong',
    )?.textContent

    presenceData.details = 'Bir harfe göz atıyor:'
    presenceData.state = letter ? `Harf: ${letter}` : 'Bilinmeyen Harf'
  }
  else if (page.includes('/tur/')) {
    presenceData.details = 'Bir kategoriye göz atıyor:'
    presenceData.state = document.querySelector('.post-head .title strong')?.textContent
      ?? 'Bilinmeyen Kategori'
  }
  else if (page.includes('/anime/')) {
    presenceData.details = 'Bir animeye göz atıyor:'
    presenceData.state = document
      .querySelector('.container .playlist-title h1')
      ?.textContent
      ?.replace('İzle', '')
  }
  else if (page.includes('/haberler/')) {
    presenceData.details = document.querySelector('.post-header h1')?.textContent
      ?? 'Bilinmeyen Gönderi'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Bir gönderi okuyor'
  }
  else if (page.includes('/BanaOzel/')) {
    presenceData.details = 'Bir listeye göz atıyor:'
    presenceData.state = document.querySelector('.post-head .title')?.textContent
      ?? 'Bilinmeyen Liste'
  }
  else if (Object.keys(video || {}).length > 0) {
    // Set timestamps
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presenceData.buttons = [
      {
        label: 'Bölümü İzle',
        url: location.href,
      },
    ]

    // Set playing/paused text
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).pause
      : (await strings).play

    presenceData.state = document
      .querySelector('.container .playlist-title h1')
      ?.textContent
      ?.replace('İzle', '')
  }
  else if (pages[page] || pages[page.slice(0, -1)]) {
    presenceData.details = 'Bir sayfaya göz atıyor:'
    presenceData.state = pages[page] || pages[page.slice(0, -1)]
  }

  if (Object.keys(presenceData).length > 2)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
