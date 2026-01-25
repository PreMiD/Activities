import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({ clientId: '1399867497750069389' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

const ActivityAssets = {
  Logo: 'https://cdn.rcd.gg/PreMiD/websites/F/Flemmix/assets/logo.png',
}

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}

presence.on('iFrameData', (data: any) => {
  const videoData = data
  if (videoData?.duration)
    video = videoData
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { pathname, href, search } = document.location
  const urlParams = new URLSearchParams(search)

  const [showButtons, privacyMode, showTimestamps, showCover] = await Promise.all([
    presence.getSetting('buttons'),
    presence.getSetting('privacy'),
    presence.getSetting('timestamps'),
    presence.getSetting('cover'),
  ])

  const titleElement = document.querySelector('h1[itemprop="name"]')
  const searchPageElement = document.querySelector('.search-page')
  const categoryTitleElement = document.querySelector('.main-title h2')
  const profileTitleElement = document.querySelector('.user-prof h1.nowrap')

  // Cas 1 : Visionnage d'un film ou d'une série
  if (titleElement) {
    const title = titleElement.textContent?.trim() ?? ''
    presenceData.details = `Regarde ${title}`

    const activeEpisodeElement = document.querySelector('.eplist .clicbtn.active')
    if (activeEpisodeElement && activeEpisodeElement.textContent) {
      presenceData.state = activeEpisodeElement.textContent.trim()
    }
    else {
      const genreElement = document.querySelector('.mov-desc a[href*="film-en-streaming"]')
      if (genreElement) {
        presenceData.state = 'Regarde un film'
      }
      else {
        presenceData.state = 'Sélectionne un épisode...'
      }
    }

    const coverImageSrc = document.querySelector<HTMLImageElement>('img[itemprop="thumbnailUrl"]')?.getAttribute('src')
    if (coverImageSrc && showCover) {
      presenceData.largeImageKey = `https://flemmix.stream${coverImageSrc}`
    }

    const [startTimestamp, endTimestamp] = getTimestamps(video.currentTime, video.duration)
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? 'En pause' : 'En lecture'
    if (!video.paused && showTimestamps) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = [startTimestamp, endTimestamp]
    }

    if (showButtons) {
      presenceData.buttons = [{ label: 'Voir la Page', url: href }]
    }

    if (privacyMode) {
      delete presenceData.state
      presenceData.details = 'Regarde une série ou un film'
      delete presenceData.buttons
      presenceData.largeImageKey = ActivityAssets.Logo
      delete presenceData.smallImageKey
    }
  }
  // Cas 2 : Page de recherche
  else if (searchPageElement) {
    const searchInput = document.querySelector<HTMLInputElement>('#searchinput')
    const searchTerm = searchInput?.value

    presenceData.details = 'Fait une recherche...'
    if (searchTerm) {
      presenceData.state = `"${searchTerm}"`
    }

    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Recherche'
  }
  // Cas 3 : Messagerie Privée
  else if (urlParams.get('do') === 'pm') {
    presenceData.details = 'Gère ses messages privés'

    if (urlParams.get('doaction') === 'newpm') {
      const recipientInput = document.querySelector<HTMLInputElement>('input[name="name"]')
      const recipientName = recipientInput?.value

      if (recipientName) {
        presenceData.state = `Écrit un message à ${recipientName}`
      }
      else {
        presenceData.state = 'Écrit un nouveau message'
      }
    }
    else {
      presenceData.state = 'Consulte sa messagerie'
    }

    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Messagerie'
  }
  // Cas 4 : Page de contact / Demande
  else if (urlParams.get('do') === 'feedback') {
    presenceData.details = 'Contacte le site'
    presenceData.state = 'Écrit une demande'

    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Contact'
  }
  // Cas 5 : Page des favoris
  else if (urlParams.get('do') === 'favorites') {
    presenceData.details = 'Consulte ses favoris'
  }
  // Cas 6 : Page des commentaires récents
  else if (urlParams.get('do') === 'lastcomments') {
    presenceData.details = 'Consulte les commentaires récents'
  }
  // Cas 7 : Page des publications non lues
  else if (pathname.includes('/newposts/')) {
    presenceData.details = 'Consulte les publications non lues'
  }
  // Cas 8 : Page des acteurs
  else if (pathname.includes('/xfsearch/acteurs/')) {
    const titleParts = document.title.split(' - ')
    presenceData.details = 'Consulte la page d\'un acteur'

    if (titleParts.length > 1 && titleParts[1]) {
      const actorName = titleParts[1].replace(' Streaming', '').trim()
      presenceData.state = actorName
    }
  }
  // Cas 9 : Page des statistiques
  else if (pathname.includes('/statistics.html')) {
    presenceData.details = 'Consulte les statistiques du site'
  }
  // Cas 10 : Page de profil
  else if (pathname.includes('/user/') && profileTitleElement) {
    const username = profileTitleElement.textContent?.replace('Utilisateur:', '').trim()
    presenceData.details = 'Consulte un profil'
    if (username) {
      presenceData.state = `Profil de ${username}`
    }
  }
  // Cas 11 : Page d'accueil (VÉRIFIÉ EN PREMIER)
  else if (pathname === '/') {
    presenceData.details = 'Parcourt la page d\'accueil'
  }
  // Cas 12 : Page de catégorie (vérifié après la page d'accueil)
  else if (categoryTitleElement) {
    let categoryName = categoryTitleElement.textContent || ''
    categoryName = categoryName.replace('Voir ', '').replace('en Streaming Gratuit :', '').trim()

    presenceData.details = 'Parcourt le catalogue'
    if (categoryName) {
      categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
      presenceData.state = `Catégorie : ${categoryName}`
    }

    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Navigation'
  }
  // Cas 13 : Toutes les autres pages
  else {
    presenceData.details = privacyMode ? 'Navigue...' : 'Navigue sur le site'
  }

  // Application des paramètres
  if (!showButtons || privacyMode)
    delete presenceData.buttons
  if (!showTimestamps || video.paused) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (!showCover || privacyMode) {
    presenceData.largeImageKey = ActivityAssets.Logo
  }
  if (privacyMode) {
    delete presenceData.smallImageKey
  }

  // Envoi des données
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
