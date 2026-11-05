import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'
import { ANIMATED_LOGO, STILL_LOGO } from './icons.js'

// Littéral obligatoire : la CI PreMiD cherche `clientId: '…'` dans le code.
const presence = new Presence({ clientId: '1234273608835272898' })
const JELLY_LOGO = 'https://playjelly.fr/logo.png'

function truncate(value: string, maxLength = 128): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`
}

let cachedImage: { url: string, asset: Promise<Blob | string> } | undefined

function getImageAsset(url: string): Promise<Blob | string> {
  if (cachedImage?.url === url)
    return cachedImage.asset

  // Le SDK PreMiD héberge les Blobs sur son CDN pour le proxy d'images Discord.
  // Cela évite de confier à Discord une URL d'API Jellyfin sans extension de fichier.
  // `no-store` : le CDN de TMDB n'envoie l'en-tête CORS qu'aux requêtes portant `Origin`, sans
  // `Vary: Origin` ; la copie mise en cache par les <img> de la page bloquerait ce fetch.
  const asset: Promise<Blob | string> = fetch(url, {
    cache: 'no-store',
    credentials: 'omit',
    signal: AbortSignal.timeout(10_000),
  }).then(async (response) => {
    if (!response.ok)
      throw new Error('Image unavailable')
    const image = await response.blob()
    if (!image.type.startsWith('image/'))
      throw new Error('Invalid image')
    return image
  }).catch(() => {
    // Une affiche indisponible ne doit pas interrompre la présence textuelle.
    if (cachedImage?.asset === asset)
      cachedImage = undefined
    return url
  })

  cachedImage = { url, asset }
  return asset
}

function getActivePlayback() {
  const player = document.querySelector<HTMLElement>(
    '[data-premid-player][data-premid-active="true"]',
  )
  const video = player?.querySelector('video')
  const title = player?.dataset.premidTitle?.trim()

  if (!player || !video || !title || player.dataset.premidPlaybackState === 'ended')
    return

  return { player, video, title }
}

function getDetailActivity(): { details: string, state: string, imageUrl: string, largeImageText: string, mediaType: 'movie' | 'series' } | undefined {
  const mediaRoute = document.location.pathname.match(/^(\/media\/(?:movie|tv|anime)\/[^/]+)(?:\/season\/(\d+)\/episode\/(\d+))?\/?$/)
  const kaiRoute = document.location.pathname.match(/^(\/discover\/kai\/[^/]+)(?:\/episode\/([^/]+))?\/?$/)
  const route = mediaRoute ?? kaiRoute
  if (!route)
    return

  // Les titres viennent des fiches rendues, jamais du titre de l'onglet ou du compte.
  const heading = document.querySelector('section h1')
  const hero = heading?.closest('section')
  const title = heading?.textContent?.trim()
  if (!heading || !hero || !title)
    return

  const titleLogo = heading.nextElementSibling
  const image = titleLogo instanceof HTMLImageElement ? titleLogo : hero.querySelector<HTMLImageElement>(':scope > div > img[src]')
  const imageUrl = image?.currentSrc || image?.src || JELLY_LOGO
  const isEpisode = Boolean(route[2])
  const mediaType = document.location.pathname.startsWith('/media/movie/') ? 'movie' : 'series'
  if (!isEpisode) {
    return {
      details: 'Consulte une fiche sur Jelly',
      state: truncate(title),
      imageUrl,
      largeImageText: truncate(title),
      mediaType,
    }
  }

  const seriesLink = Array.from(hero.querySelectorAll<HTMLAnchorElement>('nav a[href]'))
    .find(link => link.origin === document.location.origin && link.pathname === route[1])
  const seriesTitle = seriesLink?.textContent?.trim()
  const episodeCode = hero.querySelector('nav [aria-current="page"]')?.textContent?.trim()
  if (!seriesTitle || !episodeCode)
    return

  if (mediaRoute?.[2] && mediaRoute[3]) {
    const expectedCode = `S${mediaRoute[2].padStart(2, '0')}E${mediaRoute[3].padStart(2, '0')}`
    if (episodeCode !== expectedCode) {
      return
    }
  }

  return {
    details: 'Consulte un épisode sur Jelly',
    state: truncate(`${seriesTitle} · ${episodeCode} · ${title}`),
    imageUrl,
    largeImageText: truncate(`${seriesTitle} · ${episodeCode}`),
    mediaType,
  }
}

function getBrowsingState(): string {
  const [, section = '', category = '', item] = document.location.pathname.split('/')
  switch (section) {
    case '':
      return 'Accueil'
    case 'catalog':
      return document.location.pathname === '/catalog/search' ? 'Recherche' : 'Catalogue'
    case 'discover':
      if (item) {
        return 'Découverte de films et de séries'
      }
      switch (category) {
        case 'films':
          return 'Découverte · Films'
        case 'series':
          return 'Découverte · Séries'
        case 'animes':
          return 'Découverte · Animés'
        case 'kai':
          return 'Découverte · Kaï'
        default:
          return 'Découverte de films et de séries'
      }
    case 'media':
    case 'saga':
    case 'brands':
      return 'Découverte de films et de séries'
    case 'person':
      return 'Fiche d’une personnalité'
    case 'watchlist':
      return 'Ma liste'
    case 'continue-watching':
      return 'Lectures en cours'
    case 'schedule':
      return 'Planning'
    case 'top10':
      return 'Top 10'
    case 'wishboard':
      return 'Wishboard'
    case 'pricing':
      return 'Offres Jelly+'
    case 'settings':
      return 'Paramètres'
    case 'profile':
    case 'who':
      return 'Profils'
    case 'status':
      return 'État des services'
    case 'offline':
      return 'Bibliothèque hors ligne'
    case 'login':
    case 'register':
    case 'forgot-password':
    case 'two-factor':
    case 'update-password':
    case 'r':
      return 'Compte Jelly'
    case 'dmca':
    case 'about':
    case 'privacy':
    case 'legal-notice':
    case 'terms-of-use':
    case 'terms-of-sale':
      return 'Informations sur Jelly'
    default:
      return 'Navigation sur le site'
  }
}

let updateVersion = 0

presence.on('UpdateData', async () => {
  const version = ++updateVersion
  const pathname = document.location.pathname
  let settings: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, number]
  try {
    settings = await Promise.all([
      presence.getSetting<boolean>('privacy'),
      presence.getSetting<boolean>('usePresenceName'),
      presence.getSetting<boolean>('showBrowsingStatus'),
      presence.getSetting<boolean>('showCover'),
      presence.getSetting<boolean>('showMovies'),
      presence.getSetting<boolean>('showSeries'),
      presence.getSetting<boolean>('showSmallImages'),
      presence.getSetting<boolean>('timestamp'),
      presence.getSetting<number>('logoType'),
    ])
  }
  catch {
    // Ne pas risquer de publier un titre si les préférences privées sont indisponibles.
    if (version === updateVersion)
      presence.clearActivity()
    return
  }
  if (version !== updateVersion || document.location.pathname !== pathname)
    return

  const [privacy, usePresenceName, showBrowsingStatus, showCover, showMovies, showSeries, showSmallImages, timestamp, logoType] = settings
  const logo = [ANIMATED_LOGO, STILL_LOGO, JELLY_LOGO][logoType] ?? JELLY_LOGO
  const playback = getActivePlayback()

  if (!playback) {
    const initialDetail = privacy ? undefined : getDetailActivity()
    if (!showBrowsingStatus || (initialDetail && !(initialDetail.mediaType === 'movie' ? showMovies : showSeries))) {
      presence.clearActivity()
      return
    }
    const imageUrl = (!privacy && showCover ? initialDetail?.imageUrl : undefined) ?? logo
    const image = await getImageAsset(imageUrl)
    const detail = privacy ? undefined : getDetailActivity()
    if (version !== updateVersion
      || document.location.pathname !== pathname
      || getActivePlayback()
      || ((!privacy && showCover ? detail?.imageUrl : undefined) ?? logo) !== imageUrl) {
      return
    }

    await presence.setActivity({
      type: ActivityType.Watching,
      details: detail?.details ?? 'Navigue sur Jelly',
      ...(!privacy && { state: detail?.state ?? getBrowsingState() }),
      ...(usePresenceName && detail && { name: detail.largeImageText }),
      largeImageKey: image,
      largeImageText: detail?.largeImageText ?? 'Jelly',
      ...(showSmallImages && { smallImageKey: Assets.Reading, smallImageText: 'Navigation' }),
      // Le guide PreMiD interdit un bouton vers l'accueil : seule une fiche précise en reçoit un.
      ...(detail && { buttons: [{ label: 'Voir la fiche', url: document.location.href }] }),
    })
    return
  }

  const { player, video } = playback
  const isSeries = player.dataset.premidMediaType === 'series'
  if (!(isSeries ? showSeries : showMovies)) {
    presence.clearActivity()
    return
  }

  const imageUrl = (!privacy && showCover ? player.dataset.premidImage?.trim() : undefined) || logo
  const image = await getImageAsset(imageUrl)

  // Le chargement d'image peut finir après une navigation ou la fin de lecture.
  if (version !== updateVersion
    || document.location.pathname !== pathname
    || !player.isConnected
    || player.dataset.premidActive !== 'true'
    || player.dataset.premidPlaybackState === 'ended'
    || ((!privacy && showCover ? player.dataset.premidImage?.trim() : undefined) || logo) !== imageUrl) {
    return
  }

  const currentTitle = player.dataset.premidTitle?.trim()
  if (!currentTitle)
    return
  const isPlaying = player.dataset.premidPlaybackState === 'playing'
  const episode = player.dataset.premidDetails?.trim()
  const mediaType = isSeries ? 'une série' : 'un film'
  const activity: PresenceData = {
    type: ActivityType.Watching,
    details: `Regarde ${mediaType} sur Jelly`,
    ...(!privacy && { state: truncate([currentTitle, episode].filter(Boolean).join(' · ')) }),
    ...(!privacy && usePresenceName && { name: truncate(currentTitle) }),
    largeImageKey: image,
    largeImageText: privacy ? 'Jelly' : truncate(currentTitle),
    ...(showSmallImages && {
      smallImageKey: isPlaying && !video.paused ? Assets.Play : Assets.Pause,
      smallImageText: isPlaying && !video.paused ? 'Lecture' : 'En pause',
    }),
  }

  if (!privacy && timestamp && isPlaying && !video.paused && Number.isFinite(video.duration)) {
    // Le SDK renvoie un tuple : le fusionner tel quel ajoutait des clés « 0 » et « 1 » ignorées par Discord.
    const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)
    Object.assign(activity, { startTimestamp, endTimestamp })
  }

  await presence.setActivity(activity)
})
