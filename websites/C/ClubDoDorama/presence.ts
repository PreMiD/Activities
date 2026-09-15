import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1534760108268064938',
})

interface IframeVideoData {
  currentTime: number
  duration: number
  paused: boolean
}

let iframeData: IframeVideoData | null = null

presence.on('iFrameData', (data) => {
  iframeData = data as IframeVideoData
})

// Guarda o momento em que a pessoa abriu a página, usado só como
// fallback enquanto os dados reais do vídeo (via iframe) ainda não chegaram.
let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath = ''

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  // Reseta o cronômetro sempre que troca de página/episódio
  if (pathname !== lastPath) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    lastPath = pathname
    iframeData = null
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://i.imgur.com/NG3A7fd.png',
    largeImageText: 'ClubDoDorama',
  }

  const isEpisodePage = pathname.startsWith('/episodios/')
  const isSeriesPage = pathname.startsWith('/series-de-tv/')
  const isMoviePage = pathname.startsWith('/filmes/')

  if (isEpisodePage || isMoviePage) {
    const titleEl = document.querySelector('h1')
    const rawTitle = titleEl?.textContent?.trim()
      ?? (isEpisodePage ? 'Dorama desconhecido' : 'Filme desconhecido')

    const poster = document.querySelector<HTMLImageElement>(
      'img[src*="image.tmdb.org"]',
    )?.src

    if (isEpisodePage) {
      // Busca "NxN" no final do título, evitando regex com backtracking ambíguo
      const episodeMatch = rawTitle.match(/(\d+)x(\d+)\s*$/)

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
    }
    else {
      presenceData.name = rawTitle
      presenceData.details = `Assistindo: ${rawTitle}`
      presenceData.state = 'Filme'
    }

    if (poster) {
      presenceData.largeImageKey = poster
      presenceData.largeImageText = presenceData.details
    }

    // Usa os dados reais do vídeo (mandados pelo iframe.ts) quando disponíveis
    if (iframeData && !Number.isNaN(iframeData.duration) && iframeData.duration > 0) {
      presenceData.smallImageKey = iframeData.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = iframeData.paused ? 'Pausado' : 'Assistindo'

      if (!iframeData.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          Math.floor(iframeData.currentTime),
          Math.floor(iframeData.duration),
        )
      }
    }
    else {
      // Fallback: ainda não chegaram dados do iframe (ex: página acabou de abrir)
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Assistindo'
      presenceData.startTimestamp = browsingTimestamp
    }
  }
  else if (isSeriesPage) {
    const titleEl = document.querySelector('h1')
    const rawTitle = titleEl?.textContent?.trim() ?? 'Dorama desconhecido'

    presenceData.details = rawTitle
    presenceData.state = 'Vendo detalhes do dorama'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Navegando'
    presenceData.startTimestamp = browsingTimestamp
  }
  else {
    presenceData.details = 'Navegando no site'
    presenceData.state = 'Procurando o que assistir'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Navegando'
    presenceData.startTimestamp = browsingTimestamp
  }

  presence.setActivity(presenceData)
})
