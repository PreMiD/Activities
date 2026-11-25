const presence = new Presence({
  clientId: '1571249927391154266',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  // ==========================================
  // RICONOSCIMENTO URL UNIVERSAL ANIME
  // ==========================================

  const pathname = document.location.pathname
    .replace(/\/+$/, '')
    .toLowerCase() || '/'

  // Compatibilità con i vecchi URL hash
  const hashPath = document.location.hash
    .replace(/^#\/?/, '')
    .toLowerCase()

  const currentPath = pathname === '/' && hashPath
    ? `/${hashPath}`
    : pathname

  const segments = currentPath.split('/').filter(Boolean)
  const page = segments[0] || 'home'

  // ==========================================
  // RILEVAMENTO MODALI
  // ==========================================

  const profilePopup = document.querySelector(
    '.profile-user-info',
  )

  const animeTitle = document.querySelector(
    '.anime-modal-details h2',
  )?.textContent?.trim()

  const animeCover = document.querySelector<HTMLImageElement>(
    '.anime-modal-cover',
  )?.src

  const mangaTitle = document.querySelector(
    '.ua-mcat-modal h2',
  )?.textContent?.trim()

  const mangaCover = document.querySelector<HTMLImageElement>(
    '.ua-mcat-modal img',
  )?.src

  // ==========================================
  // DATI STAGIONALI
  // ==========================================

  const seasonalSection = document.querySelector('.stagionali')

  const selectedSeason = seasonalSection?.querySelector(
    '.season-button[aria-pressed="true"] .season-name',
  )?.textContent?.trim()

  const selectedYear = seasonalSection?.querySelector<HTMLSelectElement>(
    '#stagionali-year-select',
  )?.value

  const seasonalPage = seasonalSection?.querySelector(
    '.anime-pagination span',
  )?.textContent?.trim()

  // ==========================================
  // PRESENCE PREDEFINITA
  // ==========================================

  const presenceData: PresenceData = {
    details: 'Esplorando Universal Anime',
    state: 'Alla scoperta di anime e manga',
    startTimestamp: browsingTimestamp,
  }

  // ==========================================
  // 1. POPUP PROFILO
  // ==========================================

  if (profilePopup) {
    presenceData.details = 'Visualizzando un profilo'
    presenceData.state = 'Community Universal Anime'
  }

  // ==========================================
  // 2. SCHEDA ANIME
  // ==========================================

  else if (animeTitle) {
    presenceData.details = `Consultando ${animeTitle}`
    presenceData.state = 'Scheda Anime'

    if (animeCover) {
      presenceData.largeImageKey = animeCover
    }
  }

  // ==========================================
  // 3. SCHEDA MANGA
  // ==========================================

  else if (mangaTitle) {
    presenceData.details = `Consultando ${mangaTitle}`
    presenceData.state = 'Scheda Manga'

    if (mangaCover) {
      presenceData.largeImageKey = mangaCover
    }
  }

  // ==========================================
  // 4. FORUM
  // ==========================================

  else if (page === 'forum') {
    presenceData.details = 'Esplorando il Forum'
    presenceData.state = 'Discutendo con la community'
  }

  // ==========================================
  // 5. PROFILO PERSONALE
  // ==========================================

  else if (page === 'profilo') {
    presenceData.details = 'Visualizzando il proprio profilo'
    presenceData.state = 'Universal Anime Community'
  }

  // ==========================================
  // 6. PROFILO PUBBLICO
  // ==========================================

  else if (page === 'utente') {
    const username = segments[1]

    presenceData.details = 'Visitando un profilo'
    presenceData.state = username
      ? `Utente: ${username}`
      : 'Community Universal Anime'
  }

  // ==========================================
  // 7. ANIME STAGIONALI
  // ==========================================

  else if (page === 'stagionali') {
    presenceData.details = 'Esplorando gli anime stagionali'

    presenceData.state = selectedSeason && selectedYear
      ? `${selectedSeason} ${selectedYear}${seasonalPage
        ? ` • ${seasonalPage}`
        : ''}`
      : 'Consultando le stagioni anime'
  }

  // ==========================================
  // 8. CATALOGO ANIME
  // ==========================================

  else if (page === 'catalogo') {
    presenceData.details = 'Catalogo Anime'
    presenceData.state = 'Cercando nuovi anime'
  }

  // ==========================================
  // 9. LIBRERIA MANGA 3D
  // ==========================================

  else if (page === 'libreria-3d') {
    presenceData.details = 'Libreria Manga 3D'
    presenceData.state = 'Organizzando la collezione'
  }

  // ==========================================
  // 10. CATALOGO MANGA
  // ==========================================

  else if (page === 'catalogo-manga') {
    presenceData.details = 'Catalogo Manga'
    presenceData.state = 'Esplorando nuovi manga'
  }

  // ==========================================
  // 11. SEZIONE MANGA
  // ==========================================

  else if (page === 'manga') {
    presenceData.details = 'Sezione Manga'
    presenceData.state = 'Esplorando Universal Anime'
  }

  // ==========================================
  // 12. LISTA PERSONALE
  // ==========================================

  else if (page === 'mia-lista') {
    presenceData.details = 'La mia lista anime'
    presenceData.state = 'Gestendo la propria collezione'
  }

  // ==========================================
  // 13. CLASSIFICHE
  // ==========================================

  else if (page === 'rating') {
    presenceData.details = 'Classifiche Anime'
    presenceData.state = 'Scoprendo gli anime più apprezzati'
  }

  // ==========================================
  // 14. GENERI
  // ==========================================

  else if (page === 'generi') {
    presenceData.details = 'Esplorando i generi anime'
    presenceData.state = segments[1]
      ? `Genere: ${decodeURIComponent(segments[1])}`
      : 'Cercando nuovi generi'
  }

  // ==========================================
  // 15. AGGIORNAMENTI
  // ==========================================

  else if (page === 'updates') {
    presenceData.details = 'Leggendo gli aggiornamenti'
    presenceData.state = 'Novità di Universal Anime'
  }

  // ==========================================
  // 16. HOMEPAGE
  // ==========================================

  else if (page === 'home') {
    presenceData.details = 'Nella homepage'
    presenceData.state = 'Esplorando Universal Anime'
  }

  // ==========================================
  // AGGIORNAMENTO DISCORD
  // ==========================================

  presence.setActivity(presenceData)
})