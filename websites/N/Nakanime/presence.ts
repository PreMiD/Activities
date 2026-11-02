import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1565331266465697802',
})

const nakanimeLogo = 'https://i.imgur.com/6Sgsj9h.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

interface IFrameData {
  video?: {
    paused: boolean
    startTimestamp: number
    endTimestamp: number
  } | null
}

let iframeData: IFrameData = {}

presence.on('iFrameData', (data: IFrameData) => {
  iframeData = data
})

function getBrowsingState(pathname: string, hash: string): string {
  if (pathname === '/')
    return 'Sur la page d’accueil'

  if (pathname.startsWith('/saison/'))
    return 'Regarde les saisons'

  if (pathname.startsWith('/profile/'))
    return 'Consulte un profil'

  switch (pathname) {
    case '/catalog':
      return 'Explore le catalogue'

    case '/schedule':
      return 'Consulte le calendrier des sorties'

    case '/feed':
      return 'Consulte le fil d’actualité'

    case '/saisons':
      return 'Consulte toutes les saisons'

    case '/quests':
      return 'Consulte ses quêtes'

    case '/leaderboard':
      return 'Consulte le classement'

    case '/settings':
      return hash === '#playlists'
        ? 'Gère ses playlists'
        : 'Consulte ses paramètres'

    case '/personnages':
      return 'Explore les personnages'

    case '/changelog':
      return 'Consulte les nouveautés'

    case '/about':
      return 'Découvre Nakanime'

    case '/latest':
      return 'Consulte les dernières sorties'

    default:
      return 'Explore Nakanime'
  }
}

presence.on('UpdateData', async () => {
  const pathname = window.location.pathname
  const hash = window.location.hash

  const episodeMatch = pathname.match(
    /\/anime\/(\d+)\/season\/(\d+)\/episode\/(\d+)/,
  )

  const isEpisodePage = Boolean(episodeMatch)
  const episodeNumber = episodeMatch?.[3]

  const heading = document.querySelector('h1')?.textContent?.trim()

  const pageTitle = document.title
    .replace(/\s*[-|]\s*Nakanime.*$/i, '')
    .replace(/\s+en streaming.*$/i, '')
    .trim()

  const animeTitle = isEpisodePage
    ? heading?.replace(/\s+Saison\s+\d.*$/i, '').trim()
    || pageTitle
    || 'Nakanime'
    : 'Nakanime'

  const poster = document.querySelector<HTMLMetaElement>(
    'meta[property="og:image"]',
  )?.content

  const video = iframeData.video

  const presenceData: PresenceData = {
    name: 'Nakanime',
    type: 3,
    details: animeTitle,
    state: episodeNumber
      ? `Épisode ${episodeNumber}`
      : getBrowsingState(pathname, hash),
    largeImageKey: isEpisodePage && poster
      ? poster
      : nakanimeLogo,
    largeImageText: animeTitle,
  }

  if (isEpisodePage) {
    presenceData.buttons = [
      {
        label: 'Regarder l’épisode',
        url: window.location.href,
      },
    ]
  }

  if (isEpisodePage && video) {
    presenceData.state = video.paused
      ? `En pause • Épisode ${episodeNumber}`
      : `En lecture • Épisode ${episodeNumber}`

    presenceData.smallImageKey = video.paused
      ? Assets.Pause
      : Assets.Play

    presenceData.smallImageText = video.paused
      ? 'En pause'
      : 'En lecture'

    if (!video.paused) {
      presenceData.startTimestamp = video.startTimestamp
      presenceData.endTimestamp = video.endTimestamp
    }
  }
  else {
    presenceData.startTimestamp = browsingTimestamp
  }

  presence.setActivity(presenceData)
})
