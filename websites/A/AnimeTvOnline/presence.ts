const presence = new Presence({
  clientId: '1017558325753303102',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

// URL per le icone Small Image (Play/Pausa)
const PLAY_ICON = 'https://i.imgur.com/W2c5dJ6.png'
const PAUSE_ICON = 'https://i.imgur.com/1F8a0fS.png'

presence.on('UpdateData', async () => {
  const path = document.location.pathname
  const href = document.location.href
  const searchParams = new URLSearchParams(document.location.search)

  let activityData: Partial<PresenceData> = {}

  // 1. WATCH PARTY
  if (path.includes('watch_together') || href.includes('watch_together.php')) {
    const roomTitleEl = document.querySelector('.room-title')
    const hostEl = document.querySelector('.host-badge')
    const epEl = document.querySelector('#current-ep-num')
    const video = document.querySelector<HTMLVideoElement>('video')

    const roomTitle = roomTitleEl && roomTitleEl.textContent ? roomTitleEl.textContent.trim() : 'Watch Party'
    const hostText = hostEl && hostEl.textContent ? hostEl.textContent.replace('👑', '').trim() : 'Host'
    const epNum = epEl && epEl.textContent ? epEl.textContent.trim() : '1'

    activityData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeTvOnline/assets/0.png',
      largeImageText: roomTitle,
      details: `👑 Stanza di ${hostText}`,
      state: `${roomTitle} (Ep. ${epNum})`,
      buttons: [{ label: 'Entra nella Stanza', url: href }],
    }

    if (video && !Number.isNaN(video.duration) && !video.paused) {
      activityData.startTimestamp = Date.now() - (video.currentTime * 1000)
      activityData.smallImageKey = PLAY_ICON
      activityData.smallImageText = 'In Riproduzione'
    }
    else {
      activityData.startTimestamp = browsingTimestamp
      activityData.smallImageKey = PAUSE_ICON
      activityData.smallImageText = 'In Pausa / Lobby'
    }
  }
  // 2. PLAYER STANDARD
  else if ((path.includes('player') || href.includes('episodio'))) {
    const playerTitleElement = document.querySelector('#episode-title-main')
    const epSpan = document.querySelector('#current-ep-num-display')
    const activeEpBtn = document.querySelector('.ep-btn.active')
    const currentSlug = searchParams.get('slug')

    const animeTitle = playerTitleElement && playerTitleElement.textContent ? playerTitleElement.textContent.trim() : 'AnimeTvOnline'

    let epNumber = '?'
    if (epSpan && epSpan.textContent) {
      epNumber = epSpan.textContent.trim()
    }
    else if (activeEpBtn && activeEpBtn.textContent) {
      epNumber = activeEpBtn.textContent.trim()
    }

    activityData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeTvOnline/assets/0.png',
      startTimestamp: browsingTimestamp,
      details: animeTitle === 'Caricamento...' ? 'Scegliendo un Anime...' : animeTitle,
      state: `Episodio ${epNumber}`,
      largeImageText: animeTitle,
      buttons: [
        { label: 'Guarda Episodio', url: href },
      ],
    }

    if (currentSlug) {
      if (activityData.buttons) {
        activityData.buttons.push({
          label: 'Scheda Anime',
          url: `https://animetvonline.org/dettagli.php?slug=${currentSlug}`,
        })
      }
    }

    const video = document.querySelector<HTMLVideoElement>('video')

    if (video && !Number.isNaN(video.duration) && !video.paused) {
      activityData.startTimestamp = Date.now() - (video.currentTime * 1000)
      activityData.smallImageKey = PLAY_ICON
      activityData.smallImageText = 'Guardando'
    }
    else if (video && video.paused) {
      delete activityData.startTimestamp
      activityData.smallImageKey = PAUSE_ICON
      activityData.smallImageText = 'In Pausa'
    }
  }
  // 3. SCHEDA DETTAGLI
  else if (path.includes('dettagli') || href.includes('post.php')) {
    const titleElement = document.querySelector('h1')
    const title = titleElement && titleElement.textContent ? titleElement.textContent : document.title

    activityData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeTvOnline/assets/0.png',
      startTimestamp: browsingTimestamp,
      details: 'Sta guardando la scheda di:',
      state: title?.replace('AnimeTvOnline - ', '').trim(),
      buttons: [
        { label: 'Vedi Scheda', url: href },
      ],
    }
  }
  // 4. PROFILO
  else if (path.includes('profilo')) {
    activityData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeTvOnline/assets/0.png',
      startTimestamp: browsingTimestamp,
      details: 'Visualizzando un profilo',
      state: 'Utente AnimeTvOnline',
    }
  }
  // 5. HOMEPAGE
  else if (path === '/' || path.includes('index') || path === '' || path.includes('login')) {
    activityData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeTvOnline/assets/0.png',
      startTimestamp: browsingTimestamp,
      details: 'In Homepage',
      state: 'Cercando un anime da guardare...',
    }
  }
  // 6. DEFAULT
  else {
    activityData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeTvOnline/assets/0.png',
      startTimestamp: browsingTimestamp,
      details: 'Navigando su AnimeTvOnline',
      state: 'Streaming Anime ITA',
    }
  }

  presence.setActivity(activityData as PresenceData)
})
