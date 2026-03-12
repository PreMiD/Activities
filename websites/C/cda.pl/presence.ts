const presence = new Presence({
  clientId: '979472267044069477',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
function getTimestamps(videoTime: number, videoDuration: number): number[] {
  return [
    Math.floor(Date.now() / 1000),
    Math.floor(Date.now() / 1000) - videoTime + videoDuration,
  ]
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/cda.pl/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
  }
  const pathname = document.location.pathname.toLowerCase()

  if (pathname === '/') {
    presenceData.details = 'Przegląda stronę główną'
  }
  else if (pathname.endsWith('/ustawienia')) {
    presenceData.details = 'Przegląda ustawienia'
  }
  else if (pathname.endsWith('/poczta')) {
    presenceData.details = 'Przegląda pocztę'
  }
  else if (pathname.endsWith('/premium')) {
    presenceData.details = 'Przegląda filmy CDA Premium'
  }
  else if (pathname.endsWith('/powiazanekonta')) {
    presenceData.details = 'Przegląda powiązane konta'
  }
  else if (pathname.endsWith('/historia')) {
    presenceData.details = 'Przegląda historię oglądania'
  }
  else if (pathname.endsWith('/obejrzyj-pozniej')) {
    presenceData.details = 'Przegląda "Obejrzyj później"'
  }
  else if (pathname.includes('/tv')) {
    if (pathname === '/tv') {
      presenceData.details = 'Przegląda kanały telewizyjne'
    }
    else {
      presenceData.details = `Ogląda TV: ${
        document.querySelector(
          '#gora > div.tv-one-canal-list > div.tv-canal-title > span.tv-program-title',
        )?.textContent
      }`
      presenceData.state = `Teraz: ${
        document.querySelector(
          '#gora > div.tv-one-canal-list > div.tv-guide-well.tv-f > div.tv-list-pr.tv-list-pr-actual > span > span.tvm-b.relative > div.tvpr-title-header > h2',
        )?.textContent
      }`
    }
  }
  else if (pathname.includes('/video')) {
    if (pathname === '/video')
      presenceData.details = 'Przegląda stronę główną wideo'
    else presenceData.state = `Kategoria: ${pathname.split('/')[2]}`

    if (document.querySelector('#naglowek > span > span > h1')) {
      delete presenceData.startTimestamp
      presenceData.details = document.querySelector(
        '#naglowek > span > span > h1',
      )?.textContent
      presenceData.state = `Przesłał: ${
        document.querySelector(
          '#leftCol > div:nth-child(2) > div.DescrVID > div.DescrVID-left > div > div > div > div:nth-child(1) > a > span > span',
        )?.textContent
      }`
      presenceData.buttons = [
        { label: 'Obejrzyj film', url: document.location.href },
      ]

      const video = document.querySelector<HTMLVideoElement>('video')!;
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
        Math.floor(video.currentTime),
        Math.floor(video.duration),
      )
      if (video.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
  }
  else if (pathname.includes('/info')) {
    presenceData.details = 'Szuka:'
    presenceData.state = pathname.split('/')[2]?.replace('_', ' ')
  }
  else if (
    pathname.split('/')[2]
    && document.querySelector(
      '#placeholder-foldery > div:nth-child(1) > div.panel-heading.smoke',
    )?.textContent === 'Foldery '
  ) {
    presenceData.details = `Przegląda folder od ${
      document.location.pathname.split('/')[1]
    }`
    presenceData.state = document.querySelector(
      '#folder-replace > div.panel-heading.smoke > span > span > a',
    )?.textContent
    presenceData.buttons = [
      { label: 'Przejdź do folderu', url: document.location.href },
    ]
  }
  else if (
    document.querySelector(
      '#gora > div:nth-child(2) > div > div > div > div > div > h4 > span > strong > a',
    )
  ) {
    presenceData.details = 'Przegląda profil'
    presenceData.state = document.querySelector(
      '#gora > div:nth-child(2) > div > div > div > div > div > h4 > span > strong > a',
    )?.textContent
    presenceData.buttons = [
      { label: 'Zobacz profil', url: document.location.href },
    ]
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
