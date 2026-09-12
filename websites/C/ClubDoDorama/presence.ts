import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1534760108268064938',
})

// Guarda o momento em que começamos a "assistir" essa página,
// já que o player é um iframe de terceiros (fsst.online) e não
// dá pra ler o tempo real do vídeo por causa de CORS.
let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath = ''

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  // Reseta o cronômetro sempre que troca de página/episódio
  if (pathname !== lastPath) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    lastPath = pathname
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://i.imgur.com/NG3A7fd.png',
    largeImageText: 'ClubDoDorama',
    startTimestamp: browsingTimestamp,
  }

  const isEpisodePage = pathname.startsWith('/episodios/')
  const isSeriesPage = pathname.startsWith('/series-de-tv/')
  const isMoviePage = pathname.startsWith('/filmes/')

  if (isEpisodePage) {
    // Ex: "The Shadow Sovereign: 1x16"
    const titleEl = document.querySelector('h1')
    const rawTitle = titleEl?.textContent?.trim() ?? 'Dorama desconhecido'

    // Busca "NxN" no final do título, evitando regex com backtracking ambíguo
    const episodeMatch = rawTitle.match(/(\d+)x(\d+)\s*$/)

    const poster = document.querySelector<HTMLImageElement>(
      'img[src*="image.tmdb.org"]',
    )?.src

    if (episodeMatch) {
      const season = episodeMatch[1]
      const episode = episodeMatch[2]
      const showName = rawTitle.slice(0, episodeMatch.index).replace(/:\s*$/, '').trim() || rawTitle
      presenceData.name = showName
      presenceData.details = `Assistindo: ${showName}`
      presenceData.state = `Temporada ${season}, Episódio ${episode}`
    }
    else {
      presenceData.name = rawTitle
      presenceData.details = `Assistindo: ${rawTitle}`
      presenceData.state = 'Episódio'
    }

    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Assistindo'

    if (poster) {
      presenceData.largeImageKey = poster
      presenceData.largeImageText = presenceData.details
    }
  }
  else if (isMoviePage) {
    const titleEl = document.querySelector('h1')
    const rawTitle = titleEl?.textContent?.trim() ?? 'Filme desconhecido'

    const poster = document.querySelector<HTMLImageElement>(
      'img[src*="image.tmdb.org"]',
    )?.src

    presenceData.name = rawTitle
    presenceData.details = `Assistindo: ${rawTitle}`
    presenceData.state = 'Filme'
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Assistindo'

    if (poster) {
      presenceData.largeImageKey = poster
      presenceData.largeImageText = rawTitle
    }
  }
  else if (isSeriesPage) {
    const titleEl = document.querySelector('h1')
    const rawTitle = titleEl?.textContent?.trim() ?? 'Dorama desconhecido'

    presenceData.details = rawTitle
    presenceData.state = 'Vendo detalhes do dorama'
    presenceData.smallImageKey
      = 'https://i.imgur.com/eeVRVDN.png'
    presenceData.smallImageText = 'Navegando'
  }
  else {
    presenceData.details = 'Navegando no site'
    presenceData.state = 'Procurando o que assistir'
    presenceData.smallImageKey
      = 'https://i.imgur.com/eeVRVDN.png'
    presenceData.smallImageText = 'Navegando'
  }

  presence.setActivity(presenceData)
})
