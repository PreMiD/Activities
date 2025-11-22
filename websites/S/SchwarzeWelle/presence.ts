const presence = new Presence({
  clientId: '1440040665680449666',
})

let currentSong: string | null = null

interface LanguageStrings {
  listening: string
  noSong: string
  by: string
  viewSong: string
  paused: string
  playing: string
  readingPost: string
  browsingShop: string
  viewingDonationPage: string
  viewingTechPage: string
  browsingModerators: string
  viewingEditorialPage: string
  viewingWeekOverview: string
  viewingContactPage: string
  readingTerms: string
  readingImprint: string
  readingPrivacy: string
  viewingSongHistory: string
  searchingJobs: string
  browsingNews: string
  browsingCDNews: string
  browsingCDReviews: string
  browsingConcertReviews: string
  viewingBandPresentation: string
  browsingArchive: string
  browsingEvents: string
  browsingTeam: string
}

const strings: Record<string, LanguageStrings> = {
  en: { listening: 'Listening to SchwarzeWelle', noSong: 'No song currently', by: 'by', viewSong: 'View song', paused: 'Paused', playing: 'Playing', readingPost: 'Reading a post', browsingShop: 'Browsing the shop', viewingDonationPage: 'Viewing donation page', viewingTechPage: 'Viewing tech/webmaster page', browsingModerators: 'Browsing moderators page', viewingEditorialPage: 'Viewing editorial page', viewingWeekOverview: 'Viewing week overview', viewingContactPage: 'Viewing contact page', readingTerms: 'Reading terms and conditions', readingImprint: 'Reading imprint', readingPrivacy: 'Reading privacy policy', viewingSongHistory: 'Viewing song history', searchingJobs: 'Looking for jobs', browsingNews: 'Browsing news', browsingCDNews: 'Browsing CD news', browsingCDReviews: 'Browsing CD reviews', browsingConcertReviews: 'Browsing concert reviews', viewingBandPresentation: 'Viewing band presentation', browsingArchive: 'Browsing archive', browsingEvents: 'Browsing events', browsingTeam: 'Browsing editorial team' },
  de: { listening: 'Hört SchwarzeWelle', noSong: 'Aktuell kein Song', by: 'von', viewSong: 'Song ansehen', paused: 'Pausiert', playing: 'Spielt', readingPost: 'Liest sich einen Post durch', browsingShop: 'Durchstöbert den Shop', viewingDonationPage: 'Betrachtet die Spendenseite', viewingTechPage: 'Betrachtet die Technik/Webmaster-Seite', browsingModerators: 'Scrollt durch die Moderatoren-Seite', viewingEditorialPage: 'Betrachtet die Redaktions-Seite', viewingWeekOverview: 'Betrachtet den Wochenüberblick', viewingContactPage: 'Betrachtet die Kontaktseite', readingTerms: 'Liest sich die AGBs durch', readingImprint: 'Liest sich das Impressum durch', readingPrivacy: 'Liest sich die Datenschutzbestimmungen durch', viewingSongHistory: 'Betrachtet den Songverlauf', searchingJobs: 'Sucht nach Jobs', browsingNews: 'Scrollt durch News', browsingCDNews: 'Scrollt durch CD News', browsingCDReviews: 'Scrollt durch CD Reviews', browsingConcertReviews: 'Scrollt durch Konzert Reviews', viewingBandPresentation: 'Betrachtet die Bandvorstellung', browsingArchive: 'Scrollt durch das Archiv', browsingEvents: 'Scrollt durch Veranstaltungen', browsingTeam: 'Scrollt durch das Redaktions-Team' },
  nl: { listening: 'Luistert naar SchwarzeWelle', noSong: 'Momenteel geen nummer', by: 'door', viewSong: 'Bekijk nummer', paused: 'Gepauzeerd', playing: 'Afspelen', readingPost: 'Leest een post', browsingShop: 'Bladert door de winkel', viewingDonationPage: 'Bekijkt donatiepagina', viewingTechPage: 'Bekijkt techniek/webmaster pagina', browsingModerators: 'Bladert door moderatoren', viewingEditorialPage: 'Bekijkt redactiepagina', viewingWeekOverview: 'Bekijkt weekoverzicht', viewingContactPage: 'Bekijkt contactpagina', readingTerms: 'Leest algemene voorwaarden', readingImprint: 'Leest impressum', readingPrivacy: 'Leest privacybeleid', viewingSongHistory: 'Bekijkt nummergeschiedenis', searchingJobs: 'Zoekt naar banen', browsingNews: 'Bladert door nieuws', browsingCDNews: 'Bladert door CD nieuws', browsingCDReviews: 'Bladert door CD recensies', browsingConcertReviews: 'Bladert door concertrecensies', viewingBandPresentation: 'Bekijkt bandpresentatie', browsingArchive: 'Bladert door archief', browsingEvents: 'Bladert door evenementen', browsingTeam: 'Bladert door redactieteam' },
  fr: { listening: 'Écoute SchwarzeWelle', noSong: 'Aucune chanson en cours', by: 'par', viewSong: 'Voir la chanson', paused: 'En pause', playing: 'En lecture', readingPost: 'Lit un article', browsingShop: 'Parcourt la boutique', viewingDonationPage: 'Consulte la page de don', viewingTechPage: 'Consulte la page technique/webmaster', browsingModerators: 'Parcourt les modérateurs', viewingEditorialPage: 'Consulte la page éditoriale', viewingWeekOverview: 'Consulte l\'aperçu de la semaine', viewingContactPage: 'Consulte la page de contact', readingTerms: 'Lit les conditions générales', readingImprint: 'Lit les mentions légales', readingPrivacy: 'Lit la politique de confidentialité', viewingSongHistory: 'Consulte l\'historique des chansons', searchingJobs: 'Cherche des emplois', browsingNews: 'Parcourt les actualités', browsingCDNews: 'Parcourt les actualités CD', browsingCDReviews: 'Parcourt les critiques CD', browsingConcertReviews: 'Parcourt les critiques de concert', viewingBandPresentation: 'Consulte la présentation du groupe', browsingArchive: 'Parcourt les archives', browsingEvents: 'Parcourt les événements', browsingTeam: 'Parcourt l\'équipe éditoriale' },
  es: { listening: 'Escuchando SchwarzeWelle', noSong: 'Ninguna canción actualmente', by: 'por', viewSong: 'Ver canción', paused: 'Pausado', playing: 'Reproduciendo', readingPost: 'Leyendo una publicación', browsingShop: 'Navegando por la tienda', viewingDonationPage: 'Viendo página de donaciones', viewingTechPage: 'Viendo página de tecnología/webmaster', browsingModerators: 'Navegando por moderadores', viewingEditorialPage: 'Viendo página editorial', viewingWeekOverview: 'Viendo resumen semanal', viewingContactPage: 'Viendo página de contacto', readingTerms: 'Leyendo términos y condiciones', readingImprint: 'Leyendo imprenta', readingPrivacy: 'Leyendo política de privacidad', viewingSongHistory: 'Viendo historial de canciones', searchingJobs: 'Buscando empleos', browsingNews: 'Navegando por noticias', browsingCDNews: 'Navegando por noticias de CD', browsingCDReviews: 'Navegando por reseñas de CD', browsingConcertReviews: 'Navegando por reseñas de conciertos', viewingBandPresentation: 'Viendo presentación de banda', browsingArchive: 'Navegando por archivo', browsingEvents: 'Navegando por eventos', browsingTeam: 'Navegando por equipo editorial' },
}

const pageIdMap: Record<string, keyof LanguageStrings> = {
  2604: 'browsingShop',
  4700: 'viewingDonationPage',
  4812: 'viewingTechPage',
  4816: 'browsingModerators',
  4821: 'viewingEditorialPage',
  4914: 'viewingWeekOverview',
  4975: 'viewingContactPage',
  147: 'readingTerms',
  149: 'readingImprint',
  151: 'readingPrivacy',
  8277: 'viewingSongHistory',
  10540: 'searchingJobs',
}

const categoryMap: Record<string, keyof LanguageStrings> = {
  17: 'browsingNews',
  18: 'browsingCDNews',
  19: 'browsingCDReviews',
  20: 'browsingConcertReviews',
  21: 'viewingBandPresentation',
  22: 'browsingArchive',
}

const postTypeMap: Record<string, keyof LanguageStrings> = {
  tribe_events: 'browsingEvents',
  members: 'browsingTeam',
}

presence.on('UpdateData', async () => {
  const langIndex = await presence.getSetting<number>('lang').catch(() => 0)
  const buttons = await presence.getSetting<boolean>('buttons')
  const showTimestamp = await presence.getSetting<boolean>('timestamp')

  const langCodes = ['en', 'de', 'nl', 'fr', 'es']
  const currentLang = langCodes[langIndex] || 'en'
  const langStrings = strings[currentLang]

  if (!langStrings) {
    console.error(`No strings found for language: ${currentLang}`)
    return
  }

  const coverElement = document.querySelector('.qtmplayer__covercontainer img') as HTMLImageElement
  const largeImageKey = coverElement?.src || 'https://i.imgur.com/4PC182S.png'

  const presenceData: PresenceData = {
    largeImageKey,
    details: langStrings.listening,
    state: '',
    type: 2,
    smallImageKey: 'https://raw.githubusercontent.com/PreMiD/Activities/refs/heads/main/.resources/pause.png',
    smallImageText: langStrings.playing,
  }

  const playButton = document.querySelector('#qtmplayerPlay .material-icons')
  const isPlaying = playButton?.textContent?.trim() === 'pause'

  if (!isPlaying) {
    presenceData.smallImageKey = 'https://raw.githubusercontent.com/PreMiD/Activities/refs/heads/main/.resources/play.png'
    presenceData.smallImageText = langStrings.paused
  }

  const titleElement = document.querySelector('.qtmplayer__title .marquee')
  const artistElement = document.querySelector('.qtmplayer__artist .marquee')
  const timeElement = document.getElementById('qtmplayerTime')

  if (titleElement && artistElement) {
    const title = titleElement.textContent?.trim()
    const artist = artistElement.textContent?.trim()

    if (title && artist && title !== '' && artist !== '') {
      const songIdentifier = `${title}-${artist}`

      if (songIdentifier !== currentSong) {
        currentSong = songIdentifier
      }

      presenceData.details = `${title} ${langStrings.by} ${artist}`

      if (isPlaying && showTimestamp && timeElement && timeElement.textContent) {
        const timeText = timeElement.textContent.trim()
        if (timeText && timeText.includes(':')) {
          const timeParts = timeText.split(':')
          if (timeParts.length >= 2) {
            const minutesStr = timeParts[0]
            const secondsStr = timeParts[1]

            if (minutesStr !== undefined && secondsStr !== undefined) {
              const minutes = Number.parseInt(minutesStr, 10)
              const seconds = Number.parseInt(secondsStr, 10)

              if (!Number.isNaN(minutes) && !Number.isNaN(seconds)) {
                const totalSeconds = minutes * 60 + seconds
                presenceData.startTimestamp = Date.now() - (totalSeconds * 1000)
              }
            }
          }
        }
      }
      else if (!isPlaying) {
        delete presenceData.startTimestamp
      }

      if (buttons) {
        presenceData.buttons = [{
          label: langStrings.viewSong,
          url: 'https://schwarze-welle.com',
        }]
      }
    }
    else if (title && title !== '') {
      presenceData.details = title
      currentSong = null
    }
  }

  if (!presenceData.details || presenceData.details === langStrings.listening) {
    presenceData.details = langStrings.listening
    presenceData.state = langStrings.noSong
    currentSong = null
    delete presenceData.smallImageKey
    delete presenceData.startTimestamp
    delete presenceData.buttons
  }

  const {
    search,
  } = document.location
  const urlParams = new URLSearchParams(search)

  if (urlParams.has('p')) {
    let postTitle: string | null = null

    const selectors = [
      '.proradio-pagecaption .proradio-glitchtxt[data-proradio-text]',
      '.proradio-pagecaption [data-proradio-text]',
      '.proradio-glitchtxt[data-proradio-text]',
      '[data-proradio-text]',
      '.proradio-pagecaption .proradio-glitchtxt',
      'h1.entry-title',
      'h1.page-title',
      'h1.post-title',
      'h1.title',
    ]

    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element) {
        postTitle = element.getAttribute('data-proradio-text')
          || element.textContent?.trim()
          || element.getAttribute('title')
        if (postTitle)
          break
      }
    }

    if (postTitle) {
      presenceData.state = `${langStrings.readingPost}: ${postTitle}`
    }
    else {
      const pageTitle = document.title.replace(/^[^-]*-\s*/, '').trim()
      if (pageTitle && pageTitle !== '' && pageTitle !== document.title) {
        presenceData.state = `${langStrings.readingPost}: ${pageTitle}`
      }
      else {
        presenceData.state = langStrings.readingPost
      }
    }
  }
  else if (urlParams.has('cat')) {
    const cat = urlParams.get('cat')
    if (cat && categoryMap[cat]) {
      presenceData.state = langStrings[categoryMap[cat]]
    }
  }
  else if (urlParams.has('post_type')) {
    const postType = urlParams.get('post_type')
    if (postType && postTypeMap[postType]) {
      presenceData.state = langStrings[postTypeMap[postType]]
    }
  }
  else if (urlParams.has('page_id')) {
    const pageId = urlParams.get('page_id')
    if (pageId && pageIdMap[pageId]) {
      presenceData.state = langStrings[pageIdMap[pageId]]
    }
  }

  presence.setActivity(presenceData)
})
