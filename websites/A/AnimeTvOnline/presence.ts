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

    const roomTitle = roomTitleEl ? roomTitleEl.textContent.trim() : 'Watch Party'
    const hostName = hostEl ? hostEl.textContent.replace('👑', '').trim() : 'Sconosciuto'
    const epNum = epEl ? epEl.textContent.trim() : '1'

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
    
    // Recuperiamo i dati dal div nascosto generato dal tuo player.js (Riga 538)
    // Questo garantisce che il titolo sia corretto e non "Caricamento..."
    const premidData = document.getElementById('premid-data')
    const video = document.querySelector('video') as HTMLVideoElement // Cerca il tag video nativo
    
    // Valori di default
    let animeTitle = 'AnimeTvOnline'
    let epNumber = '1'
    let cover = 'https://i.imgur.com/kAalrFw.png'
    let details = 'Guardando un Anime'
    let statusState = ''

    if (premidData) {
        animeTitle = premidData.dataset.anime || animeTitle
        epNumber = premidData.dataset.episode || epNumber
        cover = premidData.dataset.cover || cover // Usa la copertina dell'anime se disponibile!
        details = animeTitle
        statusState = `Episodio ${epNumber}`
    } else {
        // Fallback visivo se il JS non ha ancora creato il div
        const titleEl = document.querySelector('#episode-title-main')
        if (titleEl) {
           // Pulisce il titolo rimuovendo eventuali testi extra
           details = titleEl.textContent.trim().split('\n')[0]
           statusState = 'In Streaming'
        }
    }

    activityData = {
      largeImageKey: cover, // Usa la copertina reale dell'anime!
      largeImageText: animeTitle,
      details: details,
      state: statusState,
      buttons: [{ label: 'Guarda Episodio', url: href }]
    }

    // --- SINCRONIZZAZIONE TEMPO PRECISA ---
    // Funziona con i video MP4 caricati dal tuo player.js
    // Nota: Non funzionerà con gli iframe esterni (es. stream.php) per limiti di sicurezza del browser.
    if (video && !isNaN(video.duration)) {
       if (!video.paused) {
         activityData.smallImageKey = 'play'
         activityData.smallImageText = 'Guardando'
         // Calcola il timestamp di inizio basandosi sulla posizione attuale del video
         activityData.startTimestamp = Date.now() - (video.currentTime * 1000)
       } else {
         activityData.smallImageKey = 'pause'
         activityData.smallImageText = 'In Pausa'
         // Rimuoviamo il timestamp quando è in pausa per mostrare l'icona pausa fissa
       }
    } else {
        // Se non trova il video (es. caricamento o iframe esterno), usa il tempo generico
        activityData.startTimestamp = browsingTimestamp
    }
  }

  // =========================================================================
  // 3. SCHEDA DETTAGLI
  // =========================================================================
  else if (path.includes('dettagli') || href.includes('post.php')) {
    const titleElement = document.querySelector('h1')
    const title = titleElement ? titleElement.textContent : document.title

    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: 'Sta guardando la scheda di:',
      state: title?.replace('AnimeTvOnline - ', '').trim(),
      buttons: [{ label: 'Vedi Scheda', url: href }],
    }
  }

  // =========================================================================
  // 4. ALTRE PAGINE (Home, Profilo, ecc)
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
