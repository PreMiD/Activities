import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1457778988222124261'
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const data: PresenceData = {
    largeImageKey: 'https://sushianimes.com.br/public/static/favicon.png',
    startTimestamp: browsingTimestamp,
  }

  const path = document.location.pathname
  const search = document.location.search

  // Página inicial
  if (path === '/') {
    data.details = 'Navegando na Página Inicial'
    data.state = 'Explorando novos animes'
    data.smallImageKey = Assets.Search
    data.smallImageText = 'Navegando'
  } 
  // Página de Episódio
  else if (path.includes('/anime/') && path.includes('-episode')) {
    const titleElement = document.querySelector('h1')
    const animeTitle = titleElement ? 
      titleElement.textContent?.replace('Assistir ', '').split(' Temporada')[0]?.trim() || 'Anime' 
      : 'Anime'
    
    const episodeMatch = titleElement?.textContent?.match(/Temporada (\d+) - Episódio (\d+)/)
    
    data.details = `Assistindo ${animeTitle}`
    data.state = episodeMatch ? `T${episodeMatch[1]} : Ep ${episodeMatch[2]}` : 'Assistindo episódio'
    
    // Tenta pegar imagem do anime
    const imgElement = document.querySelector('.media-cover img, .anime-thumbnail img, .poster img, .cover-image img') as HTMLImageElement
    if (imgElement && imgElement.src) {
      data.largeImageKey = imgElement.src
    }
    
    // Verifica se o vídeo está tocando
    const video = document.querySelector('video')
    if (video) {
      data.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      data.smallImageText = video.paused ? 'Pausado' : 'Assistindo'
      
      // Adiciona timestamps se o vídeo estiver tocando
      if (!video.paused && !isNaN(video.duration)) {
        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (video.duration - video.currentTime))
        data.startTimestamp = startTime
        data.endTimestamp = endTime
      }
    } else {
      data.smallImageKey = Assets.Play
      data.smallImageText = 'Assistindo'
    }
  } 
  // Página de Detalhes do Anime
  else if (path.includes('/anime/') && !path.includes('-episode')) {
    const titleElement = document.querySelector('h1')
    const animeTitle = titleElement?.textContent?.trim() || 'Anime'
    
    data.details = 'Vendo detalhes de:'
    data.state = animeTitle
    
    // Tenta pegar imagem do anime
    const imgElement = document.querySelector('.media-cover img, .anime-thumbnail img, .poster img, .cover-image img') as HTMLImageElement
    if (imgElement && imgElement.src) {
      data.largeImageKey = imgElement.src
    }
    
    data.smallImageKey = Assets.Viewing
    data.smallImageText = 'Visualizando'
  } 
  // Página de Filme
  else if (path.includes('/filme/')) {
    const titleElement = document.querySelector('h1')
    const movieTitle = titleElement?.textContent?.replace('Assistir ', '')?.trim() || 'Filme'
    
    data.details = 'Assistindo Filme:'
    data.state = movieTitle
    
    // Tenta pegar imagem
    const imgElement = document.querySelector('.media-cover img, .anime-thumbnail img, .poster img, .cover-image img') as HTMLImageElement
    if (imgElement && imgElement.src) {
      data.largeImageKey = imgElement.src
    }
    
    // Verifica se o vídeo está tocando
    const video = document.querySelector('video')
    if (video) {
      data.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      data.smallImageText = video.paused ? 'Pausado' : 'Assistindo'
    } else {
      data.smallImageKey = Assets.Play
      data.smallImageText = 'Assistindo'
    }
  } 
  // Calendário
  else if (path.includes('/calendario')) {
    data.details = 'Consultando Calendário'
    data.state = 'Vendo lançamentos'
    data.smallImageKey = Assets.Viewing
    data.smallImageText = 'Calendário'
  } 
  // Categorias
  else if (path.includes('/categorias') || path.includes('/categories')) {
    data.details = 'Explorando Categorias'
    data.state = 'Buscando animes'
    data.smallImageKey = Assets.Search
    data.smallImageText = 'Procurando'
  } 
  // Tendências
  else if (path.includes('/tendencias') || path.includes('/trends')) {
    data.details = 'Vendo Tendências'
    data.state = 'O que está em alta'
    data.smallImageKey = Assets.Viewing
    data.smallImageText = 'Tendências'
  } 
  // Histórico
  else if (path.includes('/historico')) {
    data.details = 'Verificando Histórico'
    data.state = 'Relembrando animes'
    data.smallImageKey = Assets.Viewing
    data.smallImageText = 'Histórico'
  } 
  // Comunidade
  else if (path.includes('/comunidade') || path.includes('/community')) {
    data.details = 'Na Comunidade'
    data.state = 'Interagindo com outros otakus'
    data.smallImageKey = Assets.Viewing
    data.smallImageText = 'Comunidade'
  } 
  // Busca
  else if (path.includes('/busca') || search.includes('s=')) {
    const searchParams = new URLSearchParams(search)
    const query = searchParams.get('s') || searchParams.get('q') || 'anime'
    data.details = 'Pesquisando animes'
    data.state = `"${query}"`
    data.smallImageKey = Assets.Search
    data.smallImageText = 'Pesquisando'
  } 
  // Página genérica
  else {
    data.details = 'Navegando no Sushi Animes'
    data.state = 'Explorando conteúdo'
    data.smallImageKey = Assets.Viewing
    data.smallImageText = 'Navegando'
  }

  presence.setActivity(data)
})