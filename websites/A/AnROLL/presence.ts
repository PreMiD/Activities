import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({ clientId: '1395970198405644350' })

// ENUMS e Mapeamentos de Página
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/logo.png',
  Home = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/0.png',
  Calendar = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/1.png',
  Search = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/2.png',
  Profile = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/3.png',
  Films = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/4.png',
  Partyroll = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/5.png',
  Notes = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/6.png',
  VIP = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/7.png',
  Requests = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/8.png',
  ARPCoins = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/9.png',
  Account = 'https://cdn.rcd.gg/PreMiD/websites/A/AnROLL/assets/10.png',
}
const pageDetails: Record<string, { title: string, image?: string }> = {
  '': { title: 'Página Inicial', image: ActivityAssets.Home },
  'animes': { title: 'Procurando animes', image: ActivityAssets.Search },
  'calendario': { title: 'Calendário', image: ActivityAssets.Calendar },
  'perfil': { title: 'Perfil', image: ActivityAssets.Profile },
  'filmes': { title: 'Explorando filmes', image: ActivityAssets.Films },
  'party': { title: 'Partyroll', image: ActivityAssets.Partyroll },
  'notes': { title: 'Notas de atualização', image: ActivityAssets.Notes },
  'vip': { title: 'Área VIP', image: ActivityAssets.VIP },
  'pedidos': { title: 'Pedidos de animes', image: ActivityAssets.Requests },
  'arp': { title: 'ARPCoins', image: ActivityAssets.ARPCoins },
  'login': { title: 'Fazendo login' },
  'registrar': { title: 'Criando uma conta' },
}

// --- LÓGICA DE VÍDEO COM RASTREADOR RESILIENTE ---
interface VideoData {
  duration: number
  currentTime: number
  paused: boolean
}
let lastVideoState: VideoData | null = null
let masterTrackerInterval: number | null = null

function stopVideoTracker() {
  if (masterTrackerInterval)
    clearInterval(masterTrackerInterval)
  masterTrackerInterval = null
  lastVideoState = null
}
function startVideoTracker() {
  if (masterTrackerInterval)
    return
  masterTrackerInterval = setInterval(() => {
    const video = document.querySelector<HTMLVideoElement>('video[src]')
    if (video && !Number.isNaN(video.duration) && video.duration > 0) {
      lastVideoState = {
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
      }
    }
    else {
      lastVideoState = null
    }
  }, 1000)
}

// --- OTIMIZAÇÃO DE BUSCA (CACHE) ---
let cachedTitles: { title: string, subtitle: string, year: string } | null = null
let lastPath = ''

// --- FUNÇÕES PARA OBTER DADOS DA PÁGINA ---
async function getCoverImage(): Promise<string> {
  const selectors = ['meta[property="og:image"]', '.sc-kpOvIu.ixIKbI', '.sc-e46cb5d2-5']
  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector)
    if (element) {
      if (element.tagName === 'META')
        return (element as HTMLMetaElement).content
      if (element.tagName === 'IMG')
        return (element as HTMLImageElement).src
      const bgStyle = getComputedStyle(element)
      if (bgStyle.backgroundImage && bgStyle.backgroundImage !== 'none') {
        const match = bgStyle.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/i)
        if (match?.[1])
          return match[1]
      }
    }
  }
  return ActivityAssets.Logo
}

function getTitles(): { title: string, subtitle: string, year: string } {
  if (cachedTitles)
    return cachedTitles

  const { pathname } = window.location
  const segment1 = pathname.split('/')[1]
  let result = { title: 'Navegando no AnROLL', subtitle: '', year: '' }

  if (segment1 === 'a') {
    const animeTitle = document.querySelector('article.animedetails h2')?.textContent?.trim()
    result = { title: animeTitle || 'Navegando', subtitle: '', year: '' }
  }
  else if (segment1 === 'f') {
    const scriptTag = document.querySelector<HTMLScriptElement>('script[id="__NEXT_DATA__"]')
    if (scriptTag) {
      try {
        const data = JSON.parse(scriptTag.textContent || '{}')
        const movieData = data.props.pageProps.data.data_movie
        result = {
          title: movieData.nome_filme || 'Filme',
          subtitle: 'Filme',
          year: movieData.ano || '',
        }
      }
      catch { // CORREÇÃO 1: Variável de erro removida
        const titleElement = document.querySelector('article h2')
        result = { title: titleElement?.textContent?.trim() || 'Filme', subtitle: 'Filme', year: '' }
      }
    }
    else {
      const titleElement = document.querySelector('article h2')
      result = { title: titleElement?.textContent?.trim() || 'Filme', subtitle: 'Filme', year: '' }
    }
  }
  else if (segment1 === 'e' || segment1 === 'watch') {
    const animeTitle = document.querySelector('#anime_title span')?.textContent?.trim()
      || document.title.match(/Assistir (.*?)\s-/)?.[1]?.trim()
      || 'Anime'

    const episodeTitle = document.querySelector('h2#current_ep')?.textContent?.trim()?.replace(/\s+/g, ' ').trim()
      || document.title.match(/-\s(Episódio.*?|Filme.*?)(?:\sOnline|\s- AnimesROLL)/)?.[1]?.trim()
      || (pathname.includes('/filmes/') ? 'Filme' : 'Episódio')

    result = { title: animeTitle, subtitle: episodeTitle, year: '' }
  }

  cachedTitles = result
  return result
}

// --- FUNÇÕES MODULARIZADAS POR PÁGINA ---

async function handlePlayerPage(presenceData: PresenceData, settings: any) {
  const { href, pathname } = document.location
  const { privacyMode, showTimestamps } = settings
  const isMovie = pathname.startsWith('/f/')

  if (!lastVideoState) {
    presenceData.details = getTitles().title || 'Carregando...'
    presenceData.state = 'Carregando player...'
    return presenceData
  }

  const { title, subtitle, year } = getTitles()
  presenceData.details = title
  presenceData.state = isMovie ? `Filme (${year})` : subtitle
  presenceData.smallImageKey = lastVideoState.paused ? Assets.Pause : Assets.Play
  presenceData.smallImageText = lastVideoState.paused ? 'Pausado' : 'Assistindo'

  if (showTimestamps && !lastVideoState.paused && lastVideoState.duration > 0) {
    const [startTimestamp, endTimestamp] = getTimestamps(
      Math.floor(lastVideoState.currentTime),
      Math.floor(lastVideoState.duration),
    )
    presenceData.startTimestamp = startTimestamp
    presenceData.endTimestamp = endTimestamp
  }

  if (!privacyMode) {
    presenceData.buttons = [{ label: `Assistindo ${isMovie ? 'Filme' : 'Agora'}`, url: href }]
  }

  return presenceData
}

function handleDetailsPage(presenceData: PresenceData, settings: any) {
  const { href } = document.location
  const { privacyMode } = settings

  const { title, subtitle } = getTitles()
  presenceData.details = title
  presenceData.state = subtitle

  if (!privacyMode) {
    const playerUrl = href.replace('/e/', '/watch/e/')
    const animePageLink = document.querySelector<HTMLAnchorElement>('#anime_title a')?.href ?? ''
    presenceData.buttons = animePageLink
      ? [{ label: 'Assistir Agora', url: playerUrl }, { label: 'Todos os Episódios', url: animePageLink }]
      : [{ label: 'Assistir Agora', url: playerUrl }]
  }
  return presenceData
}

function handleListPage(presenceData: PresenceData, settings: any) {
  const { href } = document.location
  const { privacyMode } = settings
  const { title } = getTitles()

  presenceData.details = title

  if (!privacyMode) {
    const firstEpisodeLink = document.querySelector<HTMLAnchorElement>('.itemlistepisode a')
    const watchUrl = firstEpisodeLink ? firstEpisodeLink.href.replace('/e/', '/watch/e/') : null
    presenceData.buttons = watchUrl
      ? [{ label: 'Ver Detalhes', url: href }, { label: 'Assistir 1º Episódio', url: watchUrl }]
      : [{ label: 'Ver Detalhes', url: href }]
  }
  return presenceData
}

function handleAccountPage(presenceData: PresenceData) {
  const { pathname } = document.location
  presenceData.details = 'Gerenciando a conta'
  presenceData.largeImageKey = ActivityAssets.Account

  if (pathname.includes('/historico')) {
    presenceData.state = 'Vendo o histórico'
  }
  else if (pathname.includes('/favorites')) {
    presenceData.state = 'Vendo os animes favoritos'
  }
  else {
    presenceData.state = 'Na sua área de usuário'
  }

  return presenceData
}

// --- ATUALIZAÇÃO PRINCIPAL DO PRESENCE ---
presence.on('UpdateData', async () => {
  // CORREÇÃO 2: 'href' removido pois não era usado neste escopo.
  const { pathname, hostname, search } = document.location
  const segment1 = pathname.split('/')[1] || ''

  if (pathname + search !== lastPath) {
    cachedTitles = null
    lastPath = pathname + search
  }

  if (segment1 === 'watch' || segment1 === 'f') {
    startVideoTracker()
  }
  else {
    stopVideoTracker()
  }

  try {
    const settings = {
      privacyMode: await presence.getSetting<boolean>('privacy'),
      showTimestamps: await presence.getSetting<boolean>('timestamps'),
      showCover: await presence.getSetting<boolean>('cover'),
      hideWhenPaused: await presence.getSetting<boolean>('hideWhenPaused'),
    }

    if ((segment1 === 'watch' || segment1 === 'f') && lastVideoState?.paused && settings.hideWhenPaused) {
      return presence.clearActivity()
    }

    let presenceData: PresenceData = {
      largeImageKey: ActivityAssets.Logo,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }

    const urlParams = new URLSearchParams(search)
    const searchQuery = urlParams.get('q')

    if (hostname.startsWith('my.')) {
      presenceData = handleAccountPage(presenceData)
    }
    else if (segment1 === 'watch' || segment1 === 'f') {
      presenceData = await handlePlayerPage(presenceData, settings)
    }
    else if (segment1 === 'e') {
      presenceData = await handleDetailsPage(presenceData, settings)
    }
    else if (segment1 === 'a') {
      presenceData = handleListPage(presenceData, settings)
    }
    else if (segment1 === 'animes' && searchQuery) {
      presenceData.details = 'Pesquisando por animes'
      presenceData.state = `"${searchQuery}"`
      presenceData.largeImageKey = ActivityAssets.Search
    }
    else if (pageDetails[segment1]) {
      presenceData.details = pageDetails[segment1].title
    }
    else {
      presenceData.details = 'Navegando no AnROLL'
    }

    if (settings.showCover && !settings.privacyMode) {
      presenceData.largeImageKey = await getCoverImage()
    }
    else if (pageDetails[segment1]?.image && !settings.privacyMode && !(segment1 === 'animes' && searchQuery)) {
      presenceData.largeImageKey = pageDetails[segment1].image
    }

    if (settings.privacyMode) {
      presenceData.details = 'Navegando no AnROLL'
      presenceData.state = 'Em modo privado'
      delete presenceData.buttons
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
      presenceData.largeImageKey = ActivityAssets.Logo
    }

    presence.setActivity(presenceData)
  }
  catch (error) {
    console.error('Erro ao atualizar Presence:', error)
    presence.clearActivity()
  }
})
