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
  // 1. WATCH PARTY (NUOVO BLOCCO)
  // =========================================================================
  if (path.includes('watch_together') || href.includes('watch_together.php')) {
    // Selettori semplici e sicuri
    const roomTitleEl = document.querySelector('.room-title')
    const hostEl = document.querySelector('.host-badge')
    const epEl = document.querySelector('#current-ep-num')
    const video = document.querySelector('video') as HTMLVideoElement

    // Recupero dati con fallback sicuri (evita l'errore undefined)
    const roomTitle = roomTitleEl && roomTitleEl.textContent ? roomTitleEl.textContent.trim() : 'Watch Party'
    const hostText = hostEl && hostEl.textContent ? hostEl.textContent.replace('👑', '').trim() : 'Host'
    const epNum = epEl && epEl.textContent ? epEl.textContent.trim() : '1'

    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      largeImageText: roomTitle,
      details: `👑 Stanza di ${hostText}`,
      state: `${roomTitle} (Ep. ${epNum})`,
      buttons: [{ label: 'Entra nella Stanza', url: href }],
    }

    // Sincronizzazione Tempo (Se il video esiste ed è in play)
    if (video && !Number.isNaN(video.duration) && !video.paused) {
      activityData.startTimestamp = Date.now() - (video.currentTime * 1000)
      activityData.smallImageKey = 'play'
      activityData.smallImageText = 'In Riproduzione'
    } else {
      activityData.startTimestamp = browsingTimestamp
      activityData.smallImageKey = 'pause'
      activityData.smallImageText = 'In Pausa / Lobby'
    }
  }

  // =========================================================================
  // 2. PLAYER STANDARD (BASATO SUL TUO ORIGINALE)
  // =========================================================================
  else if ((path.includes('player') || href.includes('episodio'))) {
    
    // Logica originale per recuperare i titoli
    const playerTitleElement = document.querySelector('#episode-title-main')
    const epSpan = document.querySelector('#current-ep-num-display')
    const activeEpBtn = document.querySelector('.ep-btn.active')
    const currentSlug = searchParams.get('slug')
    
    // Recupero Dati (come nell'originale)
    const animeTitle = playerTitleElement && playerTitleElement.textContent ? playerTitleElement.textContent.trim() : 'AnimeTvOnline'
    
    let epNumber = '?'
    if (epSpan && epSpan.textContent) {
      epNumber = epSpan.textContent.trim()
    } else if (activeEpBtn && activeEpBtn.textContent) {
      epNumber = activeEpBtn.textContent.trim()
    }

    // Configurazione Base
    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp, // Default timestamp
      details: animeTitle === 'Caricamento...' ? 'Scegliendo un Anime...' : animeTitle,
      state: `Episodio ${epNumber}`,
      largeImageText: animeTitle,
      buttons: [
        { label: 'Guarda Episodio', url: href },
      ],
    }

    // AGGIUNTA: Pulsante Scheda (Originale)
    if (currentSlug) {
      activityData.buttons.push({
        label: 'Scheda Anime',
        url: `https://animetvonline.org/dettagli.php?slug=${currentSlug}`,
      })
    }

    // AGGIUNTA: Sincronizzazione Tempo Precisa (Nuova Feature)
    // Cerca il video, se c'è sovrascrive il timestamp generico con quello preciso
    const video = document.querySelector('video') as HTMLVideoElement
    if (video && !Number.isNaN(video.duration) && !video.paused) {
       activityData.startTimestamp = Date.now() - (video.currentTime * 1000)
       activityData.smallImageKey = 'play'
       activityData.smallImageText = 'Guardando'
    } else if (video && video.paused) {
       // Se è in pausa, togliamo il timestamp per mostrare l'icona pausa
       delete activityData.startTimestamp
       activityData.smallImageKey = 'pause'
       activityData.smallImageText = 'In Pausa'
    }
  }

  // =========================================================================
  // 3. SCHEDA DETTAGLI (ORIGINALE)
  // =========================================================================
  else if (path.includes('dettagli') || href.includes('post.php')) {
    const titleElement = document.querySelector('h1')
    const title = titleElement && titleElement.textContent ? titleElement.textContent : document.title

    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: 'Sta guardando la scheda di:',
      state: title?.replace('AnimeTvOnline - ', '').trim(),
      buttons: [
        { label: 'Vedi Scheda', url: href },
      ],
    }
  }

  // =========================================================================
  // 4. PROFILO (ORIGINALE)
  // =========================================================================
  else if (path.includes('profilo')) {
    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: 'Visualizzando un profilo',
      state: 'Utente AnimeTvOnline',
    }
  }

  // =========================================================================
  // 5. HOMEPAGE (ORIGINALE)
  // =========================================================================
  else if (path === '/' || path.includes('index') || path === '' || path.includes('login')) {
    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: 'In Homepage',
      state: 'Cercando un anime da guardare...',
    }
  }

  // =========================================================================
  // 6. DEFAULT (ORIGINALE)
  // =========================================================================
  else {
    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: 'Navigando su AnimeTvOnline',
      state: 'Streaming Anime ITA',
    }
  }

  presence.setActivity(activityData)
})
