import { Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1565331266465697802',
})

interface IFrameData {
  video?: {
    paused?: boolean
    currentTime?: number
    duration?: number
  } | null
}

let iframeData: IFrameData = {}
let browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('iFrameData', (data: IFrameData) => {
  iframeData = data
})

presence.on('UpdateData', async () => {
  const episodeMatch = window.location.pathname.match(
    /\/anime\/(\d+)\/season\/(\d+)\/episode\/(\d+)/,
  )

  const isEpisodePage = Boolean(episodeMatch)

  const heading = document.querySelector('h1')?.textContent?.trim()

  const pageTitle = document.title
    .replace(/\s*[-|]\s*Nakanime.*$/i, '')
    .replace(/\s+en streaming.*$/i, '')
    .trim()

  const animeTitle = isEpisodePage
    ? heading?.replace(/\s+Saison\s+\d+.*$/i, '').trim()
      || pageTitle
      || 'Nakanime'
    : 'Nakanime'

  const episodeNumber = episodeMatch?.[3]

  const poster = document.querySelector<HTMLMetaElement>(
    'meta[property="og:image"]',
  )?.content

  const video = iframeData.video

  const validVideo =
    video !== undefined
    && video !== null
    && typeof video.paused === 'boolean'
    && typeof video.currentTime === 'number'
    && typeof video.duration === 'number'
    && video.duration > 0

  const presenceData: PresenceData = {
    name: 'Nakanime',
    type: 3,
    details: animeTitle,
   state: episodeNumber
  ? `Épisode ${episodeNumber}`
  : window.location.pathname === '/'
    ? "Sur la page d'accueil"
    : window.location.pathname.startsWith('/catalog')
      ? 'Explore le catalogue'
      : window.location.pathname.startsWith('/schedule')
        ? 'Consulte le calendrier des sorties'
        : window.location.pathname.startsWith('/feed')
          ? "Consulte le fil d'actualité"
          : window.location.pathname === '/saisons'
            ? 'Consulte toutes les saisons'
            : window.location.pathname.startsWith('/saison/')
              ? 'Regarde les saisons'
              : window.location.pathname.startsWith('/profile/')
                ? 'Consulte un profil'
                : window.location.pathname === '/quests'
                  ? 'Consulte ses quêtes'
                  : window.location.pathname === '/leaderboard'
                    ? 'Consulte le classement'
                    : window.location.pathname === '/settings'
                      ? window.location.hash === '#playlists'
                        ? 'Gère ses playlists'
                        : 'Consulte ses paramètres'
                      : window.location.pathname === '/personnages'
                        ? 'Explore les personnages'
                        : window.location.pathname === '/changelog'
                          ? 'Consulte les nouveautés'
                          : window.location.pathname === '/about'
                            ? 'Découvre Nakanime'
                             : window.location.pathname === '/latest'
                             ? 'Consulte les dernières sorties'
                            : 'Explore Nakanime',
    largeImageKey: isEpisodePage && poster
  ? poster
  : 'https://i.imgur.com/hPsVwo8.png',
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

  if (validVideo && video) {
    presenceData.state = video.paused
      ? 'En pause'
      : 'En lecture'

    if (episodeNumber) {
      presenceData.state += ` • Épisode ${episodeNumber}`
    }

    presenceData.smallImageKey = video.paused
      ? Assets.Pause
      : Assets.Play

    presenceData.smallImageText = video.paused
      ? 'En pause'
      : 'En lecture'

    const currentTime = video.currentTime
    const duration = video.duration

    if (
      typeof currentTime === 'number'
      && typeof duration === 'number'
      && !video.paused
    ) {
      const [startTimestamp, endTimestamp] = getTimestamps(
        currentTime,
        duration,
      )

      presenceData.startTimestamp = startTimestamp
      presenceData.endTimestamp = endTimestamp
    }
  }
  else {
    presenceData.startTimestamp = browsingTimestamp

    if (episodeNumber) {
      presenceData.state = `Épisode ${episodeNumber}`
    }
  }

  presence.setActivity(presenceData)
})