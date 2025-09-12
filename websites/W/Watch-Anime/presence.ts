// #region PRESENCEDECLARATION
const presence = new Presence({
  clientId: '1146930741570187385',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/Watch-Anime/assets/logo.png',
}
// #endregion PRESENCEDECLARATION

// #region FUNCTIONS
interface AnimeInfo {
  img: string
  name: string
}

interface EpisodeInfo {
  nomLangue: string
  nomSaison: string
  nomEpisode: string
}

// Cache object to store fetched anime info
const animeCache: { [nameAnime: string]: AnimeInfo } = {}

async function getInformationAnime(
  nameAnime: string,
): Promise<AnimeInfo | null> {
  // Check if the information is already in the cache
  if (animeCache[nameAnime])
    return animeCache[nameAnime]

  try {
    const response = await fetch(
      `https://watch-anime.fr/api/anime/list?search=${nameAnime}`,
    )
    const data = await response.json()

    if (data.length > 0) {
      // Store the fetched data in the cache
      const animeInfo = {
        img: data[0].afficheAnime,
        name: data[0].nomAnime,
      }
      animeCache[nameAnime] = animeInfo
      return animeInfo
    }
  }
  catch {
    // Handle errors (e.g., network issues)
    presence.error('Erreur lors de la récupération de l\'image de l\'anime')
  }
  return null
}

const cache: { [key: string]: EpisodeInfo } = {}

async function getEpisodeInfo(
  nameAnime: string,
  langue: string,
  saison: string,
  episode: string,
  lecteur: string,
): Promise<EpisodeInfo | null> {

  const lecteurNb = lecteur.replace('Lecteur-', '')

  const cacheKey = `${nameAnime}-${langue}-${saison}-${episode}-${lecteurNb}`

  // Check if the episode info is in cache
  if (cache[cacheKey])
    return cache[cacheKey]

  try {
    const response = await fetch(
      `https://watch-anime.fr/api/anime/info?anime=${nameAnime}&lang=${langue}&season=${saison}&episode=${episode}&lecteur=${lecteurNb}`,
    )
    const data = await response.json()

    if (data) {
      const episodeInfo: EpisodeInfo = {
        nomLangue: data.nom_langue,
        nomSaison: data.nom_saison,
        nomEpisode: data.nom_episode,
      }

      // Store the fetched data in the cache
      cache[cacheKey] = episodeInfo

      return episodeInfo
    }
  }
  catch {
    // Handle errors (e.g., network issues)
    presence.error('Erreur lors de la récupération de l\'épisode de l\'anime')
  }
  return null
}
// #endregion FUNCTIONS

// #region PRESENCE CALL
presence.on('UpdateData', async () => {
  let details: string | undefined
  let state: string | undefined
  let presenceData: PresenceData
  let animeInfo: AnimeInfo | null = null
  let episodeInfo: EpisodeInfo | null = null
  let urlAnime: string | undefined

  if (document.location.pathname === '/') {
    details = 'Dans le menu d\'accueil'
  }
  else if (document.location.pathname.startsWith('/catalogue')) {
    details = 'Recherche un animé dans le catalogue'
  }
  else if (document.location.pathname.startsWith('/settings')) {
    details = 'Dans les paramètres'
  }
  else if (document.location.pathname.startsWith('/ublock')) {
    details = 'Cherche à bloquer les publicités'
  }
  else if (document.location.pathname.startsWith('/likes')) {
    details = 'Regarde la liste de ses animés préférés'
  }
  else if (document.location.pathname.startsWith('/history')) {
    details = 'Regarde la liste de ses animés vus'
  }
  else if (document.location.pathname.startsWith('/watchlater')) {
    details = 'Regarde la liste de ses animés à voir plus tard'
  }
  else if (document.location.pathname.startsWith('/changelogs')) {
    details = 'Regarde les derniers changements du site'
  }
  else {
    const pathParts = document.location.pathname.split('/')
    if (pathParts[1] === 'player' && pathParts.length >= 6) {
      urlAnime = `https://watch-anime.fr/${pathParts[1]}/${pathParts[2]}`
      animeInfo = await getInformationAnime(decodeURIComponent(pathParts[2]!))
      episodeInfo = await getEpisodeInfo(
        decodeURIComponent(pathParts[2]!),
        decodeURIComponent(pathParts[3]!),
        decodeURIComponent(pathParts[4]!),
        decodeURIComponent(pathParts[5]!),
        decodeURIComponent(pathParts[6]!),
      )

      if (animeInfo) {
        details = `Regarde ${animeInfo.name}`
        state = `${episodeInfo?.nomSaison} • ${
          episodeInfo?.nomEpisode
        } • ${episodeInfo?.nomLangue.toUpperCase()}`
      }
    }
  }

  if (details) {
    presenceData = {
      details,
      state,
      largeImageKey: animeInfo?.img || ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
      ...(animeInfo && {
        buttons: [
          {
            label: 'Voir l\'animé',
            url: urlAnime || 'https://watch-anime.fr/',
          },
        ],
      }),
    }
    presence.setActivity(presenceData)
  }
})
// #endregion PRESENCE CALL
