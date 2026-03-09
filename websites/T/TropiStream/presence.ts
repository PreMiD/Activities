import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1478440957774008471',
})

const browsingTimestamp: number = Math.floor(Date.now() / 1000)
const DEFAULT_LOGO = 'https://i.imgur.com/Vh6elpJ.png'

let lastValidTitle: string = ''
let lastValidPoster: string = ''

function getPosterUrl(): string {
  const poster = document.querySelector<HTMLImageElement>('img.info-poster-premium')
  if (poster && poster.src && poster.src.startsWith('http')) {
    return poster.src
  }
  return DEFAULT_LOGO
}

function getPathname(): string {
  return window.location.pathname.toLowerCase().replace(/\/$/, '') || '/'
}

function setNavigationActivity(pathname: string): void {
  let details = '🌴 Navigation'
  let state = 'Consulte TropiStream'

  if (pathname === '/' || pathname === '/home') {
    details = '🏠 Accueil'
    state = 'Découvre des nouveautés...'
  }
  else if (pathname.includes('films-premium')) {
    details = '💎 Catalogue Films Premium'
    state = 'Parcourt la liste...'
  }
  else if (pathname.includes('series-premium')) {
    details = '💎 Catalogue Séries Premium'
    state = 'Parcourt la liste...'
  }
  else if (pathname.includes('/film')) {
    details = '🎬 Catalogue Films'
    state = 'Parcourt la liste...'
  }
  else if (pathname.includes('/serie')) {
    details = '📺 Catalogue Séries'
    state = 'Parcourt la liste...'
  }
  else if (pathname.includes('/anime')) {
    details = '⭐ Catalogue Animes'
    state = 'Parcourt la liste...'
  }
  else if (pathname === '/dashboard') {
    details = '📊 Dashboard'
    state = 'Consulte le dashboard'
  }
  else if (pathname === '/team') {
    details = '👥 Équipe'
    state = 'Consulte l\'équipe'
  }
  else if (pathname === '/tropiwave') {
    details = '🌊 TropiWave'
    state = 'Écoute de la musique'
  }
  else if (pathname === '/boutique') {
    details = '💰 Boutique'
    state = 'Consulte la boutique'
  }

  presence.setActivity({
    largeImageKey: DEFAULT_LOGO,
    largeImageText: 'TropiStream 🌴',
    type: ActivityType.Watching,
    details,
    state,
    buttons: [
      { label: 'Visiter le site', url: window.location.origin || 'https://tropistream.fr' },
    ],
    startTimestamp: browsingTimestamp,
  })
}

function updateActivity(): void {
  const pathname = getPathname()

  if (!pathname.includes('/watch/')) {
    setNavigationActivity(pathname)
    return
  }

  let title = ''
  const titleEl = document.querySelector<HTMLElement>('.info-title-premium')
  if (titleEl) {
    title = titleEl.textContent?.trim() ?? ''
  }

  if (!title || title.length < 2) {
    const h1 = document.querySelector<HTMLElement>('h1.video-title, h1.title, .player-info h1')
    title = h1?.textContent?.trim() ?? ''
  }

  if (!title || title.length < 2 || title.toLowerCase().includes('tropistream')) {
    const cleaned = ((document.title.split('|')[0] ?? '').split('-')[0] ?? '')
      .replace(/TropiStream|Regarder|en streaming|Plateforme de Streaming|Film|Série/gi, '')
      .trim()

    if (cleaned.length > 2) {
      title = cleaned
    }
  }

  if (title && title.length > 2) {
    lastValidTitle = title
  }

  const posterUrl = getPosterUrl()
  if (posterUrl && posterUrl !== DEFAULT_LOGO) {
    lastValidPoster = posterUrl
  }

  const finalTitle = title || lastValidTitle || 'Vidéo'
  const finalPoster = posterUrl && posterUrl !== DEFAULT_LOGO
    ? posterUrl
    : lastValidPoster || DEFAULT_LOGO

  let seasonText = ''
  let episodeText = ''

  const activeEp = document.querySelector<HTMLElement>('.queue-item.active')

  document.querySelectorAll<HTMLElement>('.season-header').forEach((header) => {
    const potential = Array.from(header.querySelectorAll('div'))
      .find(d => d.textContent?.includes('Saison'))

    if (potential?.textContent) {
      const match = potential.textContent.trim().match(/Saison\s*\d+/i)
      if (match) {
        seasonText = match[0]
      }
    }
  })

  if (activeEp) {
    const spans = activeEp.querySelectorAll<HTMLSpanElement>('span')
    spans.forEach((s) => {
      if (s.textContent?.toLowerCase().includes('épisode')) {
        episodeText = s.textContent.trim()
      }
    })

    if (!episodeText && spans.length >= 2) {
      episodeText = spans[1]?.textContent?.trim() ?? ''
    }
  }

  const isSerieText = (t: string): boolean =>
    /saison|épisode|episode|s\d+|e\d+/i.test(t) || t.includes('•')

  const isSerie
    = isSerieText(seasonText)
      || isSerieText(episodeText)
      || !!document.querySelector('.fa-tv, .queue-item, .series-queue')

  presence.setActivity({
    largeImageKey: finalPoster,
    largeImageText: finalTitle,
    type: ActivityType.Watching,
    details: isSerie ? `📺 ${finalTitle}` : `🎬 ${finalTitle}`,
    state: isSerie
      ? seasonText && episodeText
        ? `${seasonText}, ${episodeText}`
        : episodeText || seasonText || 'En lecture...'
      : `Regarde ${finalTitle}`,
    buttons: [
      { label: 'Regarder', url: window.location.href },
    ],
    startTimestamp: browsingTimestamp,
  })
}

window.addEventListener('tropistream:navigate', handleRouteChange)

let lastPathname: string = window.location.pathname.toLowerCase()
let checkInterval: ReturnType<typeof setInterval> | null = null

setInterval(() => {
  const currentPathname = window.location.pathname.toLowerCase()
  if (currentPathname !== lastPathname) {
    lastPathname = currentPathname
    handleRouteChange()
  }
}, 500)

function handleRouteChange(): void {
  const pathname = window.location.pathname.toLowerCase()
  lastPathname = pathname

  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }

  if (!pathname.includes('/watch/')) {
    lastValidTitle = ''
    lastValidPoster = ''
    updateActivity()
  }
  else {
    let attempts = 0
    checkInterval = setInterval(() => {
      attempts++
      const titleEl = document.querySelector<HTMLElement>(
        '.info-title-premium, h1.video-title, h1.title, .player-info h1',
      )

      const hasTitleInfo
        = titleEl
          && titleEl.textContent
          && titleEl.textContent.trim().length > 2

      if (hasTitleInfo || attempts >= 10) {
        if (checkInterval) {
          clearInterval(checkInterval)
        }
        checkInterval = null
        updateActivity()
      }
    }, 500)
  }
}

presence.on('UpdateData', () => {
  lastPathname = window.location.pathname.toLowerCase()
  updateActivity()
})
