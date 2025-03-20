import { Assets } from 'premid'

const presence = new Presence({
  clientId: '800520515315695666',
})
const pages: { [key: string]: string } = {
  '/': 'Ana Sayfa',
  '/diziler.asp': 'Diziler',
  '/trend': 'Trend',
  '/forum': 'Forum',
  '/oyuncular.asp': 'Oyuncular',
  '/rehber.asp': 'Rehber',
  '/uye': 'Üye Profili',
  '/dizi-tartisma': 'Dizi Tartışma',
}
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

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
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Sezonluk%20Dizi/assets/logo.jpg',
    startTimestamp,
  }
  const { search, pathname: page } = document.location

  if (search.includes('?tur=')) {
    presenceData.details = 'Bir türe göz atıyor:'
    presenceData.state = document.title.slice(
      0,
      document.title.indexOf('Türündeki'),
    )
  }
  else if (search.includes('?adi=') && !/\?.*?&/.test(search)) {
    presenceData.smallImageKey = Assets.Search

    presenceData.details = 'Bir şey arıyor'
    presenceData.state = search.replace('?adi=', '')
  }
  else if (
    (page.includes('/diziler') && !page.includes('/diziler.asp'))
    || page.includes('/bolumler')
    || page.includes('/oyuncular')
    || page.includes('/tartismalar')
    || page.includes('/yorumlar')
  ) {
    let currentTabTitle = 'Bir diziyi inceliyor:'
    switch (true) {
      case page.includes('/bolumler'):
        currentTabTitle = 'Dizinin bölümlerini inceliyor:'
        break
      case page.includes('/oyuncular'):
        currentTabTitle = 'Dizinin oyuncularını inceliyor:'
        break
      case page.includes('/tartismalar'):
        currentTabTitle = 'Dizinin tartışmalarını inceliyor:'
        break
      case page.includes('/yorumlar'):
        currentTabTitle = 'Dizinin yorumlarını inceliyor:'
        break
    }

    presenceData.buttons = [
      {
        label: 'Diziyi Görüntüle',
        url: location.href,
      },
    ]
    presenceData.details = currentTabTitle
    presenceData.state = document.querySelector('#dizibilgisi .content .header')?.textContent
      ?? 'Bilinmeyen Dizi'
  }
  else if (page.includes('/dizi-tartisma/')) {
    presenceData.buttons = [
      {
        label: 'Tartışmayı Görüntüle',
        url: location.href,
      },
    ]

    presenceData.details = document.querySelector('.ui.minimal h1.header')?.textContent
      ?? 'Bilinmeyen Gönderi'
    presenceData.state = document.querySelector('.ui.stackable.cards .card .content a.header')
      ?.textContent ?? 'Bilinmeyen Dizi'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Bir tartışma okuyor'
  }
  else if (Object.keys(video || {}).length > 0) {
    presenceData.details = document.querySelector('[class="ui medium header"]')?.querySelector('a')?.textContent ?? 'Bilinmeyen İsim'
    presenceData.state = document
      .querySelector('[class="ui medium header"]')
      ?.querySelector('small')
      ?.textContent;

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

    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).pause
      : (await strings).play
  }
  else if (page.includes('/uye/')) {
    presenceData.buttons = [
      {
        label: 'Kullanıcıyı Görüntüle',
        url: location.href,
      },
    ]

    presenceData.details = 'Bir kullanıcıya göz atıyor:'
    presenceData.state = document.querySelector('.ui.stackable.cards .card .content div.header')
      ?.textContent ?? 'Bilinmeyen Üye'
  }
  else if (pages[page] || pages[page.slice(0, -1)]) {
    presenceData.details = 'Bir sayfaya göz atıyor:'
    presenceData.state = pages[page] || pages[page.slice(0, -1)]
  }

  if (Object.keys(presenceData).length > 2)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
