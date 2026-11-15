const presence = new Presence({
  clientId: '1571249927391154266',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  // URL corrente, inclusa la navigazione con #
  const path = (
    window.location.pathname + window.location.hash
  ).toLowerCase()

  // Rilevamento popup profilo
  const profilePopup = document.querySelector(
    '.profile-user-info',
  )

  // Rilevamento titolo anime
  const animeTitle = document.querySelector(
    '.anime-modal-details h2',
  )?.textContent?.trim()

  // Copertina anime
  const animeCover = document.querySelector<HTMLImageElement>(
    '.anime-modal-cover',
  )?.src

  // Rilevamento titolo manga
  const mangaTitle = document.querySelector(
    '.ua-mcat-modal h2',
  )?.textContent?.trim()

  // Copertina manga
  const mangaCover = document.querySelector<HTMLImageElement>(
    '.ua-mcat-modal img',
  )?.src

  // Attività predefinita con pulsante Discord
  const presenceData: PresenceData = {
    details: 'Esplorando Universal Anime',
    state: 'Alla scoperta di anime e manga',
    startTimestamp: browsingTimestamp,
    buttons: [
      {
        label: 'Visita Universal Anime',
        url: 'https://universalanime.eu/',
      },
    ],
  }

  // 1. Popup profilo
  if (profilePopup) {
    presenceData.details = 'Visualizzando un profilo'
    presenceData.state = 'Su Universal Anime'
  }

  // 2. Scheda anime con copertina dinamica
  else if (animeTitle) {
    presenceData.details = `Consultando ${animeTitle}`
    presenceData.state = 'Scheda Anime'

    if (animeCover) {
      presenceData.largeImageKey = animeCover
    }
  }

  // 3. Scheda manga con copertina dinamica
  else if (mangaTitle) {
    presenceData.details = `Consultando ${mangaTitle}`
    presenceData.state = 'Scheda Manga'

    if (mangaCover) {
      presenceData.largeImageKey = mangaCover
    }
  }

  // 4. Homepage
  else if (path === '/' || path === '/#') {
    presenceData.details = 'Nella homepage'
    presenceData.state = 'Esplorando Universal Anime'
  }

  // 5. Catalogo anime
  else if (
    path.includes('#catalogo')
    && !path.includes('#catalogo-manga')
  ) {
    presenceData.details = 'Catalogo Anime'
    presenceData.state = 'Cercando nuovi anime'
  }

  // 6. Catalogo manga
  else if (
    path.includes('#manga')
    || path.includes('#catalogo-manga')
  ) {
    presenceData.details = 'Catalogo Manga'
    presenceData.state = 'Esplorando nuovi manga'
  }

  // 7. Libreria manga 3D
  else if (path.includes('#libreria-3d')) {
    presenceData.details = 'Libreria Manga 3D'
    presenceData.state = 'Organizzando la collezione'
  }

  // 8. Profilo tramite URL
  else if (
    path.includes('#profilo')
    || path.includes('/profilo')
  ) {
    presenceData.details = 'Visualizzando un profilo'
    presenceData.state = 'Su Universal Anime'
  }

  // 9. Lista personale
  else if (
    path.includes('#lista')
    || path.includes('/lista')
  ) {
    presenceData.details = 'Lista Anime'
    presenceData.state = 'Gestendo la propria lista'
  }

  // 10. Ricerca
  else if (
    path.includes('#ricerca')
    || path.includes('/ricerca')
  ) {
    presenceData.details = 'Ricerca'
    presenceData.state = 'Cercando anime e manga'
  }

  // Aggiorna la Rich Presence di Discord
  presence.setActivity(presenceData)
})
