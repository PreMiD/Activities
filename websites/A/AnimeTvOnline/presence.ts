const presence = new Presence({
  clientId: '1017558325753303102',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const path = document.location.pathname
  const href = document.location.href
  const searchParams = new URLSearchParams(document.location.search)

  let activityData: any = {}

  // =========================================================================
  // 1. WATCH PARTY (PRIORITÀ MASSIMA)
  // =========================================================================
  if (path.includes('watch_together') || href.includes('watch_together.php')) {
    const roomTitleEl = document.querySelector('.room-title')
    const hostEl = document.querySelector('.host-badge')
    const epEl = document.querySelector('#current-ep-num')
    const video = document.querySelector('video#player') as HTMLVideoElement

    // Controllo rigoroso per TypeScript (null | string -> string)
    let roomTitle = 'Watch Party'
    if (roomTitleEl && roomTitleEl.textContent) {
      roomTitle = roomTitleEl.textContent.trim()
    }

    let hostName = 'Sconosciuto'
    if (hostEl && hostEl.textContent) {
      hostName = hostEl.textContent.replace('👑', '').trim()
    }

    let epNum = '1'
    if (epEl && epEl.textContent) {
      epNum = epEl.textContent.trim()
    }

    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      largeImageText: roomTitle,
      details: `👑 Stanza di ${hostName}`,
      state: `${roomTitle} (Ep. ${epNum})`,
      buttons: [{ label: 'Entra nella Stanza', url: href }],
    }

    // SINCRONIZZAZIONE TEMPO WATCHPARTY
    if (video && !isNaN(video.duration)) {
      if (!video.paused) {
        activityData.startTimestamp = Date.now() - (video.currentTime * 1000)
        activityData.smallImageKey = 'play'
        activityData.smallImageText = 'In Riproduzione'
      } else {
        activityData.smallImageKey = 'pause'
        activityData.smallImageText = 'In Pausa'
      }
    } else {
      activityData.startTimestamp = browsingTimestamp
      activityData.state = 'In attesa nella Lobby...'
    }
  }

  // =========================================================================
  // 2. PLAYER STANDARD (SOLO / STREAMING CLASSICO)
  // =========================================================================
  else if (path.includes('player') || href.includes('episodio') || searchParams.get('slug')) {
    
    const premidData = document.getElementById('premid-data')
    const video = document.querySelector('video') as HTMLVideoElement 
    
    // Valori di default (sicuramente stringhe)
    let animeTitle = 'AnimeTvOnline'
    let epNumber = '1'
    let cover = 'https://i.imgur.com/kAalrFw.png'
    let details = 'Guardando un Anime'
    let statusState = ''

    // FIX TypeScript: Usiamo || per forzare il fallback se dataset.x è undefined
    if (premidData && premidData.dataset) {
        animeTitle = premidData.dataset.anime || animeTitle
        epNumber = premidData.dataset.episode || epNumber
        cover = premidData.dataset.cover || cover
        
        details = animeTitle
        statusState = `Episodio ${epNumber}`
    } else {
        // Fallback visivo se il JS non ha ancora creato il div
        const titleEl = document.querySelector('#episode-title-main')
        if (titleEl && titleEl.textContent) {
           details = titleEl.textContent.trim().split('\n')[0]
           statusState = 'In Streaming'
        }
    }

    activityData = {
      largeImageKey: cover,
      largeImageText: animeTitle,
      details: details,
      state: statusState,
      buttons: [{ label: 'Guarda Episodio', url: href }]
    }

    // SINCRONIZZAZIONE TEMPO PRECISA
    if (video && !isNaN(video.duration)) {
       if (!video.paused) {
         activityData.smallImageKey = 'play'
         activityData.smallImageText = 'Guardando'
         activityData.startTimestamp = Date.now() - (video.currentTime * 1000)
       } else {
         activityData.smallImageKey = 'pause'
         activityData.smallImageText = 'In Pausa'
       }
    } else {
        activityData.startTimestamp = browsingTimestamp
    }
  }

  // =========================================================================
  // 3. SCHEDA DETTAGLI
  // =========================================================================
  else if (path.includes('dettagli') || href.includes('post.php')) {
    const titleElement = document.querySelector('h1')
    
    // Controllo rigoroso textContent
    let pageTitle = document.title
    if (titleElement && titleElement.textContent) {
        pageTitle = titleElement.textContent
    }
    const cleanTitle = pageTitle.replace('AnimeTvOnline - ', '').trim()

    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: 'Sta guardando la scheda di:',
      state: cleanTitle,
      buttons: [{ label: 'Vedi Scheda', url: href }],
    }
  }

  // =========================================================================
  // 4. ALTRE PAGINE
  // =========================================================================
  else {
    let stateText = 'Cercando un anime...'
    if (path.includes('profilo')) stateText = 'Visualizzando un Profilo'
    if (path.includes('login')) stateText = 'Effettuando l\'accesso'

    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: 'Navigando su AnimeTvOnline',
      state: stateText,
    }
  }

  presence.setActivity(activityData)
})
