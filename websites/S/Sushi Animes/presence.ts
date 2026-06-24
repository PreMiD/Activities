import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1457778988222124261',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Sushi%20Animes/assets/logo.png',
  Gif = 'https://cdn.rcd.gg/PreMiD/websites/S/Sushi%20Animes/assets/0.gif',
}

async function getBannerAnime(text: string) {
  if (text.includes('season')) {
    const styleAttr = document.querySelector('.cover')?.querySelector('a')?.getAttribute('style')
    const bannerElement = styleAttr?.match(/url\(["']?([^"')]+)["']?\)/)?.[1]
    return bannerElement
  }
  else if (text.includes('/anime')) {
    const bannerElement = document.querySelector('.media.media-cover.mb-2')?.querySelector<HTMLImageElement>('img')?.getAttribute('src') || ActivityAssets.Logo
    return bannerElement
  }
  else if (text.includes('/filme/')) {
    const styleAttr = document.querySelector('.embed-cover')?.getAttribute('style')
    const bannerElement = styleAttr?.match(/url\(["']?([^"')]+)["']?\)/)?.[1]
    return bannerElement
  }
  else if (text.includes('/assistir/')) {
    const styleAttr = document.querySelector('.media-cover')?.querySelector('img')?.getAttribute('src')
    const bannerElement = styleAttr
    return bannerElement
  }
}

async function getTitleName(name: string, text: string) {
  if (text.includes('season')) {
    const cleanName = name.trim()
    const regex = /^([^|]+)\|([^-]+)-(.+)$/
    const match = cleanName.match(regex)

    if (!match) {
      return {
        animeName: '',
        animeSeason: '',
        animeEpisode: '',
      }
    }
    const animeName = match[1]?.trim().replace(/\s*\([^)]+\)\s*$/, '').trim() || ''
    return {
      animeName,
      animeSeason: match[2]?.trim() || '',
      animeEpisode: match[3]?.trim() || '',
    }
  }
  else if (text.includes('/filme/')) {
    const cleanName = name.trim()
    const animeName = cleanName.replace(/\s*\([^)]+\)\s*$/, '').trim()
    return {
      animeName: animeName || '',
      animeSeason: 'Season 1',
      animeEpisode: 'Episodio 1',
    }
  }
  else if (text.includes('/assistir/')) {
    const cleanName = name.trim()
    const animeName = cleanName.replace(/\s*\([^)]+\)\s*$/, '').trim()
    return {
      animeName: animeName || '',
      animeSeason: '',
      animeEpisode: '',
    }
  }

  else if (/\/anime\/[^/]+-\d+\/?$/.test(text)) {
    const cleanName = name.trim()
    const animeName = cleanName.replace(/\s*\([^)]+\)\s*$/, '').trim()
    return {
      animeName: animeName || '',
      animeSeason: '',
      animeEpisode: '',
    }
  }

  return {
    animeName: '',
    animeSeason: '',
    animeEpisode: '',
  }
}

let cacheAnime: {
  text: string
  nombreAnime: string
  seasonAnime: string
  episodeAnime: string
  bannerAnime: string | null | undefined
  descAnime: string
} = {
  text: '',
  nombreAnime: '',
  seasonAnime: '',
  episodeAnime: '',
  bannerAnime: '',
  descAnime: '',
}

let cacheDescription: {
  text: string
  nombreAnime: string
  bannerAnime: string
} = {
  text: '',
  nombreAnime: '',
  bannerAnime: ActivityAssets.Logo,
}

async function getAnimeData(text: string) {
  if (text === cacheAnime.text && cacheAnime.nombreAnime !== '' && cacheAnime.bannerAnime !== ActivityAssets.Logo) {
    return {
      nombreAnime: cacheAnime.nombreAnime,
      seasonAnime: cacheAnime.seasonAnime,
      episodeAnime: cacheAnime.episodeAnime,
      bannerAnime: cacheAnime.bannerAnime,
      descAnime: cacheAnime.descAnime,
    }
  }

  const titleElement = document.querySelector('h1')?.textContent?.trim()
  if (titleElement) {
    const title = titleElement
    const animeData = await getTitleName(title, text)
    if (animeData) {
      const nombreAnime = animeData.animeName
      const seasonAnime = animeData.animeSeason
      const episodeAnime = animeData.animeEpisode
        .normalize('NFD')
        .replace(/[\u0300-\u036F]/g, '')
      const bannerAnime = await getBannerAnime(text) || ActivityAssets.Logo
      const descAnime = document.querySelector('.collapse.show')?.textContent?.trim() || 'Assistindo Movie'
      cacheAnime = {
        text,
        nombreAnime,
        seasonAnime,
        episodeAnime,
        bannerAnime,
        descAnime,
      }
      return {
        nombreAnime,
        seasonAnime,
        episodeAnime,
        bannerAnime,
        descAnime,
      }
    }
  }
}

async function getDescriptionData(text: string) {
  if (text === cacheDescription.text && cacheDescription.nombreAnime !== '') {
    return {
      nombreAnime: cacheDescription.nombreAnime,
      bannerAnime: cacheDescription.bannerAnime,
    }
  }
  const titleElement = document.querySelector('h1')?.textContent?.trim()
  if (titleElement) {
    const title = titleElement
    const animeData = await getTitleName(title, text)
    if (animeData) {
      const nombreAnime = animeData.animeName
      const bannerAnime = await getBannerAnime(text) || ActivityAssets.Logo
      cacheDescription = {
        text,
        nombreAnime,
        bannerAnime,
      }
      return {
        nombreAnime,
        bannerAnime,
      }
    }
  }
}

presence.on('UpdateData', async () => {
  const [useAnimeCover, usePresenceName, logoType] = await Promise.all([
    presence.getSetting<boolean>('useAnimeCover'),
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<number>('logoType'),
  ])
  const { pathname, search } = document.location
  const presenceData: PresenceData = {
    details: 'Navegando na Página Inicial',
    state: 'Explorando novos animes',
    largeImageKey: [ActivityAssets.Gif, ActivityAssets.Logo][logoType] || ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Reading,
    smallImageText: 'Viendo Página Inicial',
  }
  const episodePage = document.querySelector('.video-view')
  if (episodePage) {
    const infoAnime = await getAnimeData(pathname)
    const elVideo = document.querySelector<HTMLVideoElement>('video')
    if (infoAnime) {
      if (usePresenceName) {
        presenceData.name = infoAnime.nombreAnime
      }
      else {
        presenceData.name = 'Sushi Animes'
      }
      if (useAnimeCover) {
        presenceData.largeImageKey = infoAnime.bannerAnime
      }
      else {
        presenceData.largeImageKey = [ActivityAssets.Gif, ActivityAssets.Logo][logoType] || ActivityAssets.Logo
      }
      presenceData.details = infoAnime.nombreAnime
      presenceData.state = infoAnime.descAnime
      presenceData.largeImageText = `${infoAnime.seasonAnime}, ${infoAnime.episodeAnime.toString()}`
      if (elVideo && !elVideo.paused) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Reproduzindo'

        if (!Number.isNaN(elVideo.duration)) {
          const [startTs, endTs] = getTimestampsFromMedia(elVideo)
          presenceData.startTimestamp = startTs
          presenceData.endTimestamp = endTs
        }
        else {
          presenceData.smallImageText = 'Pausado'
          presenceData.smallImageKey = Assets.Pause
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
    }
  }
  if (/\/anime\/[^/]+-\d+\/?$/.test(pathname)) {
    const infoDesc = await getDescriptionData(pathname)
    if (infoDesc) {
      presenceData.details = 'Navegando na Sushi Animes'
      presenceData.state = infoDesc.nombreAnime || 'Explorando animes'
      presenceData.largeImageKey = infoDesc.bannerAnime || ActivityAssets.Logo
      presenceData.largeImageText = `${infoDesc.nombreAnime} na Sushi Animes`
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Lendo detalhes do anime'
    }
  }
  if (pathname.includes('/assistir/')) {
    const infoDesc = await getDescriptionData(pathname)
    if (infoDesc) {
      presenceData.details = 'Navegando na Sushi Animes'
      presenceData.state = infoDesc.nombreAnime || 'Explorando filmes'
      presenceData.largeImageKey = infoDesc.bannerAnime || ActivityAssets.Logo
      presenceData.largeImageText = `${infoDesc.nombreAnime} na Sushi Animes`
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Lendo detalhes do filme'
    }
  }
  else if (pathname.includes('/filmes')) {
    presenceData.details = 'Explorando Filmes'
    presenceData.state = 'Buscando filmes'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Procurando Filmes'
  }
  else if (pathname.includes('/calendario')) {
    presenceData.details = 'Consultando Calendário'
    presenceData.state = 'Vendo lançamentos'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Calendário'
  }
  else if (pathname.includes('/categorias') || pathname.includes('/categories')) {
    presenceData.details = 'Explorando Categorias'
    presenceData.state = 'Buscando animes'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Procurando'
  }
  else if (pathname.includes('/tendencias') || pathname.includes('/trends')) {
    presenceData.details = 'Vendo Tendências'
    presenceData.state = 'O que está em alta'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Tendências'
  }
  else if (pathname.includes('/historico')) {
    presenceData.details = 'Verificando Histórico'
    presenceData.state = 'Relembrando animes'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Histórico'
  }
  else if (pathname.includes('/comunidade') || pathname.includes('/community')) {
    presenceData.details = 'Na Comunidade'
    presenceData.state = 'Interagindo com outros otakus'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Comunidade'
  }
  else if (pathname.includes('/busca') || search.includes('s=')) {
    const searchParams = new URLSearchParams(search)
    const query = searchParams.get('s') || searchParams.get('q') || 'anime'
    presenceData.details = 'Pesquisando animes'
    presenceData.state = `"${query}"`
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Pesquisando'
  }
  presence.setActivity(presenceData)
})
