import { Assets, getTimestamps, Presence } from 'premid'

const presence = new Presence({
  clientId: '1566479852826001458', // Application Poska officielle
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const path = document.location.pathname
  const href = document.location.href

  const defaultLogo = 'https://poska.pitsho.org/static/icon-512.png'
  const showButtons = presence.getSetting<boolean>('showButtons') ?? true
  const showTimestamps = presence.getSetting<boolean>('showTimestamps') ?? true

  const presenceData: PresenceData = {
    largeImageKey: defaultLogo,
    largeImageText: 'POSKA // Cinéma Brutal',
  }

  // 1. DÉTECTION DU LECTEUR VIDÉO (Films, Séries, TV)
  const isWatchPage =
    path.startsWith('/watch/') ||
    path.startsWith('/player/') ||
    path.startsWith('/embed/') ||
    path.startsWith('/tv/') ||
    path === '/tv'

  const video = document.querySelector('video') as HTMLVideoElement | null

  if (isWatchPage && video && !isNaN(video.duration) && video.duration > 0) {
    const metaTitle =
      document.querySelector('meta[name="poska:title"]')?.getAttribute('content') ||
      document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.replace(/ — POSKA.*$/, '') ||
      document.title.replace(/ — POSKA.*$/, '').trim()

    const metaMediaType =
      document.querySelector('meta[name="poska:media_type"]')?.getAttribute('content') ||
      (path.includes('/tv/') || path.includes('/series') ? 'tv' : 'movie')

    const metaSeason = document.querySelector('meta[name="poska:season"]')?.getAttribute('content')
    const metaEpisode = document.querySelector('meta[name="poska:episode"]')?.getAttribute('content')
    const metaPoster =
      document.querySelector('meta[name="poska:poster"]')?.getAttribute('content') ||
      document.querySelector('meta[property="og:image"]')?.getAttribute('content')

    if (metaPoster && metaPoster.startsWith('http')) {
      presenceData.largeImageKey = metaPoster
    }

    if (metaMediaType === 'tv_live' || path.startsWith('/tv')) {
      presenceData.details = 'Regarde la télévision'
      presenceData.state = metaTitle || 'En direct'
      presenceData.largeImageText = `POSKA TV — ${metaTitle || 'Direct'}`
    } else if (metaMediaType === 'tv') {
      presenceData.details = metaTitle || 'Série'
      const s = metaSeason || '1'
      const e = metaEpisode || '1'
      presenceData.state = `Saison ${s} • Épisode ${e}`
      presenceData.largeImageText = `${metaTitle} (S${s}E${e})`
    } else {
      presenceData.details = metaTitle || 'Film'
      const year = document.querySelector('meta[name="poska:year"]')?.getAttribute('content')
      presenceData.state = year ? `Film (${year})` : 'Film'
      presenceData.largeImageText = `${metaTitle} — POSKA`
    }

    if (!video.paused) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'En lecture'
      if (showTimestamps) {
        const [start, end] = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration)
        )
        presenceData.startTimestamp = start
        presenceData.endTimestamp = end
      }
    } else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'En pause'
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Regarder sur Poska',
          url: href,
        },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // 2. PAGES DE NAVIGATION HORS LECTURE
  if (path === '/' || path === '/hub') {
    presenceData.details = 'Navigue sur le site'
    presenceData.state = "Page d'accueil"
  } else if (path.startsWith('/films')) {
    presenceData.details = 'Explore le catalogue'
    presenceData.state = 'Films en streaming'
  } else if (path.startsWith('/series')) {
    presenceData.details = 'Explore le catalogue'
    presenceData.state = 'Séries & Anime'
  } else if (path.startsWith('/planning')) {
    presenceData.details = 'Consulte les sorties'
    presenceData.state = 'Planning des sorties'
  } else if (path.startsWith('/tv')) {
    presenceData.details = 'Zappe sur la TV'
    presenceData.state = 'Guide des chaînes'
  } else if (path.startsWith('/party')) {
    presenceData.details = 'Watch Party'
    presenceData.state = 'Session à plusieurs'
  } else if (path.startsWith('/profil') || path.startsWith('/login')) {
    presenceData.details = 'Espace membre'
    presenceData.state = 'Profil utilisateur'
  } else {
    presenceData.details = 'Explore Poska'
    presenceData.state = 'Cinéma Brutal'
  }

  presenceData.startTimestamp = browsingTimestamp

  if (showButtons) {
    presenceData.buttons = [
      {
        label: 'Découvrir Poska',
        url: 'https://poska.pitsho.org',
      },
    ]
  }

  presence.setActivity(presenceData)
})
