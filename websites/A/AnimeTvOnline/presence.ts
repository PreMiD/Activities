const presence = new Presence({
  clientId: '1017558325753303102',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const path = document.location.pathname
  const href = document.location.href
  const searchParams = new URLSearchParams(document.location.search) // Serve per leggere ?slug= o ?id=

  let activityData: any = {}

  // 1. PLAYER (Modificato per leggere i tag reali di player.php)
  // Cerchiamo il titolo H1 specifico del player
  const playerTitleElement = document.querySelector('#episode-title-main')
  
  if (playerTitleElement && (path.includes('player') || href.includes('episodio'))) {
    
    // Recupera il titolo e rimuove spazi extra
    const animeTitle = playerTitleElement.textContent.trim()
    
    // Recupera l'episodio dallo span nel tab o dal bottone attivo
    const epSpan = document.querySelector('#current-ep-num-display')
    const activeEpBtn = document.querySelector('.ep-btn.active')
    
    // Logica per trovare il numero: prova lo span, se vuoto prova il bottone, se no '?'
    let epNumber = '?'
    if (epSpan && epSpan.textContent.trim()) {
        epNumber = epSpan.textContent.trim()
    } else if (activeEpBtn) {
        epNumber = activeEpBtn.textContent.trim()
    }

    // Recupera lo slug dall'URL per il bottone "Scheda Anime"
    const currentSlug = searchParams.get('slug')

    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: animeTitle === 'Caricamento...' ? 'Scegliendo un Anime...' : animeTitle,
      state: `Episodio ${epNumber}`,
      largeImageText: animeTitle,
      buttons: [
        {
          label: 'Guarda Episodio',
          url: href,
        }
      ],
    }

    // Aggiungi il secondo bottone solo se abbiamo lo slug nell'URL
    if (currentSlug) {
        activityData.buttons.push({
          label: 'Scheda Anime',
          url: `https://animetvonline.org/dettagli.php?slug=${currentSlug}`,
        })
    }
  }

  // 2. SCHEDA DETTAGLI
  else if (path.includes('dettagli') || href.includes('post.php')) {
    const titleElement = document.querySelector('h1')
    const title = titleElement ? titleElement.textContent : document.title

    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: 'Sta guardando la scheda di:',
      state: title?.replace('AnimeTvOnline - ', '').trim(),
      buttons: [
        {
          label: 'Vedi Scheda',
          url: href,
        },
      ],
    }
  }

  // 3. PROFILO
  else if (path.includes('profilo')) {
    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: 'Visualizzando un profilo',
      state: 'Utente AnimeTvOnline',
    }
  }

  // 4. HOMEPAGE
  else if (path === '/' || path.includes('index') || path === '' || path.includes('login')) {
    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: 'In Homepage',
      state: 'Cercando un anime da guardare...',
    }
  }

  // 5. DEFAULT
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
