import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1457403769116561528',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  RTVE = 'https://cdn.rcd.gg/PreMiD/websites/R/RTVE/assets/logo.png',
  RTVE_PLAY = 'https://cdn.rcd.gg/PreMiD/websites/R/RTVE/assets/0.png',
}

function getCleanTitle(): string {
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
  const h1Title = document.querySelector('h1')?.textContent?.trim()

  let title = ogTitle || h1Title || document.title
  title = title.replace(/\s*\|\s*Ver.*$/, '').replace(/\s*-\s*RTVE\.es$/, '').trim()
  return title
}

function getSectionInfo(): { sectionName: string } {
  const path = document.location.pathname.toLowerCase()

  if (path.includes('/videos/directo/')) {
    return { sectionName: 'EN DIRECTO' }
  }
  else if (path.includes('/noticias/')) {
    return { sectionName: 'Noticias' }
  }
  else if (path.startsWith('/infantil/')) {
    return { sectionName: 'Clan TV' }
  }
  else if (path.startsWith('/playz/')) {
    return { sectionName: 'Playz' }
  }
  else if (path.startsWith('/eltiempo/')) {
    return { sectionName: 'El Tiempo' }
  }
  else if (path.includes('/play/radio/') || path.includes('/play/audios/')) {
    return { sectionName: 'RNE Radio' }
  }
  else if (path.includes('/series/') || path.includes('/programas/')) {
    return { sectionName: 'Series y Programas' }
  }
  else if (path.startsWith('/play/')) {
    return { sectionName: 'RTVE Play' }
  }
  else {
    return { sectionName: 'RTVE.es' }
  }
}

function getLogoToUse(): ActivityAssets {
  const path = document.location.pathname.toLowerCase()
  return path.startsWith('/play/') ? ActivityAssets.RTVE_PLAY : ActivityAssets.RTVE
}

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    live: 'general.live',
    browsing: 'general.browsing',
    reading: 'general.reading',
    watchLive: 'general.buttonWatchStream',
    listenRadio: 'general.buttonListen',
  })
}

presence.on('UpdateData', async () => {
  const [buttons, privacy, showCover] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('cover'),
  ])

  const strings = await getStrings()
  const { href, pathname } = document.location
  const { sectionName } = getSectionInfo()
  const cleanTitle = getCleanTitle()
  const video = document.querySelector('video')
  const audio = document.querySelector('audio')

  const presenceData: PresenceData = {
    largeImageKey: showCover ? getLogoToUse() : ActivityAssets.RTVE,
  }

  // --- EN DIRECTO ---
  if (pathname.includes('/videos/directo/')) {
    presenceData.details = sectionName
    presenceData.state = privacy ? '' : cleanTitle
    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = strings.live
    presenceData.startTimestamp = browsingTimestamp

    if (buttons && !privacy) {
      presenceData.buttons = [{ label: strings.watchLive, url: href }]
    }

  // --- RADIO ---
  }
  else if (pathname.includes('/play/radio/') || pathname.includes('/play/audios/')) {
    presenceData.details = sectionName
    presenceData.state = privacy ? '' : cleanTitle
    presenceData.smallImageKey = audio?.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = audio?.paused ? strings.pause : strings.play
    presenceData.startTimestamp = browsingTimestamp

    if (buttons && !privacy) {
      presenceData.buttons = [{ label: strings.listenRadio, url: href }]
    }

  // --- VIDEO ---
  }
  else if (video && !Number.isNaN(video.duration)) {
    presenceData.details = sectionName
    presenceData.state = privacy ? '' : cleanTitle
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? strings.pause : strings.play
    presenceData.startTimestamp = browsingTimestamp

    if (buttons && !privacy) {
      presenceData.buttons = [{ label: 'Ver en RTVE Play', url: href }]
    }

  // --- NOTICIAS ---
  }
  else if (pathname.includes('/noticias/')) {
    presenceData.details = sectionName
    presenceData.state = privacy ? '' : cleanTitle
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = strings.reading
    presenceData.startTimestamp = browsingTimestamp

    if (buttons && !privacy) {
      presenceData.buttons = [{ label: 'Leer noticia', url: href }]
    }

  // --- DEFAULT ---
  }
  else {
    presenceData.details = sectionName
    presenceData.state = privacy ? '' : cleanTitle
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.browsing
    presenceData.startTimestamp = browsingTimestamp

    if (buttons && !privacy) {
      presenceData.buttons = [{ label: `Visitar ${sectionName}`, url: href }]
    }
  }

  if (privacy) {
    delete presenceData.state
    delete presenceData.buttons
  }

  presence.setActivity(presenceData)
})
