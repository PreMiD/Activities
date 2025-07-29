import { Assets, getTimestamps } from 'premid'

const presence = new Presence({ clientId: '1395970198405644350' })

// Definição dos assets para usar nas atividades
enum ActivityAssets {
  Logo = 'https://i.ibb.co/hJwCZCTx/ico-menu-2.png',
  Home = 'https://iili.io/F8bJaLX.png',
  Calendar = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/calendar-icon-download-in-svg-png-gif-file-formats--schedule-planning-date-business-pack-icons-1650787.png?f=webp&w=512',
  Search = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/search-icon-download-in-svg-png-gif-file-formats--find-magnifier-glass-ios-11-ui-elements-vol-2-pack-user-interface-icons-475061.png?f=webp&w=512',
  Profile = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/user-rounded-icon-download-in-svg-png-gif-file-formats--person-people-avatar-profile-ui-8-pack-design-development-icons-11410209.png?f=webp&w=512',
  Films = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/film-reel-1381038-1160929.png?f=webp&w=512',
  Partyroll = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/people-5156504-4302647.png?f=webp&w=512',
  Notes = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/changelog-11796821-9633010.png?f=webp&w=512',
  VIP = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/vip-stars-4877729-4058729.png?f=webp&w=512',
  Requests = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/request-1890238-1600612.png?f=webp&w=512',
  ARPCoins = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/coin-11766103-9604340.png?f=webp&w=512',
  Account = 'https://cdn.iconscout.com/icon/free/png-512/free-account-icon-download-in-svg-png-gif-file-formats--circle-user-profile-avatar-action-vol-1-pack-interface-icons-1512648.png?f=webp&w=512',
}

// Mapeamento de rotas para textos e imagens
const pageDetails: Record<string, { title: string, image?: string }> = {
  '': { title: 'Vendo a página inicial', image: ActivityAssets.Home },
  'animes': { title: 'Procurando animes', image: ActivityAssets.Search },
  'calendario': { title: 'Vendo o calendário', image: ActivityAssets.Calendar },
  'perfil': { title: 'Vendo um perfil', image: ActivityAssets.Profile },
  'filmes': { title: 'Explorando filmes', image: ActivityAssets.Films },
  'party': { title: 'Usando o Partyroll', image: ActivityAssets.Partyroll },
  'notes': { title: 'Lendo as notas de atualização', image: ActivityAssets.Notes },
  'vip': { title: 'Conferindo a área VIP', image: ActivityAssets.VIP },
  'pedidos': { title: 'Fazendo pedidos de animes', image: ActivityAssets.Requests },
  'arp': { title: 'Gerenciando ARPCoins', image: ActivityAssets.ARPCoins },
  'login': { title: 'Fazendo login' },
  'registrar': { title: 'Criando uma conta' },
}

interface VideoData {
  duration: number
  currentTime: number
  paused: boolean
}

// Estado inicial do vídeo
let video: VideoData = {
  duration: 0,
  currentTime: 0,
  paused: true,
}

// Cache para a imagem de capa para evitar buscas repetidas
const imageCache = new Map<string, string>()

/**
 * Busca a imagem de capa do anime/filme.
 * Tenta múltiplos seletores para garantir a captura.
 * @returns A URL da imagem de capa ou o logo padrão.
 */
async function getCoverImage(): Promise<string> {
  const currentUrl = window.location.href
  if (imageCache.has(currentUrl)) {
    return imageCache.get(currentUrl)!
  }

  const selectors = [
    'meta[property="og:image"]', // Padrão OGP
    '#anime_title img', // Imagem na página do anime
    '.sc-kpOvIu.ixIKbI', // Background de certas páginas
  ]

  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector)
    if (element) {
      if (element.tagName === 'META') {
        const imageUrl = (element as HTMLMetaElement).content
        if (imageUrl) {
          imageCache.set(currentUrl, imageUrl)
          return imageUrl
        }
      }
      else if (element.tagName === 'IMG') {
        const imageUrl = (element as HTMLImageElement).src
        if (imageUrl) {
          imageCache.set(currentUrl, imageUrl)
          return imageUrl
        }
      }
      else {
        const bgStyle = getComputedStyle(element)

        // eslint-disable-next-line regexp/no-unused-capturing-group
        const match = bgStyle.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/i)
        const bgImageUrl = match?.[1]
        if (bgImageUrl) {
          imageCache.set(currentUrl, bgImageUrl)
          return bgImageUrl
        }
      }
    }
  }

  return ActivityAssets.Logo // Fallback
}

/**
 * Extrai o título do anime ou filme da página.
 * @returns O título encontrado ou um valor padrão.
 */
function getTitle(): string {
  const selectors = [
    '#anime_title span', // Título na página de episódio
    'article.animedetails h2', // Título na página do anime
    'h1.title', // Título em páginas de filme
    'title', // Fallback para o título da página
  ]

  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element?.textContent) {
      let title = element.textContent.trim()
      // Limpa o título se for da tag <title>
      if (selector === 'title') {
        title = title.replace(/['"]/g, '').trim()
      }
      if (title)
        return title
    }
  }

  return 'Título Desconhecido'
}

// Escuta por dados vindos do iframe (player de vídeo)
presence.on('iFrameData', (data: unknown) => {
  if (
    data
    && typeof data === 'object'
    && 'duration' in data
    && 'currentTime' in data
    && 'paused' in data
  ) {
    video = data as VideoData
  }
})

// Função principal que atualiza a presence
presence.on('UpdateData', async () => {
  const { pathname, href, hostname } = window.location
  const pathSegments = pathname.split('/').filter(Boolean)
  const [firstSegment = ''] = pathSegments

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: Math.floor(Date.now() / 1000),
  }

  try {
    const [showButtons, privacyMode, showTimestamps, showCover, hideWhenPaused] = await Promise.all([
      presence.getSetting<boolean>('buttons'),
      presence.getSetting<boolean>('privacy'),
      presence.getSetting<boolean>('timestamps'),
      presence.getSetting<boolean>('cover'),
      presence.getSetting<boolean>('hideWhenPaused'),
    ])

    // Lógica para a página de "Minha Conta"
    if (hostname === 'my.anroll.net') {
      presenceData.details = 'Gerenciando a conta'
      presenceData.largeImageKey = ActivityAssets.Account
      if (!privacyMode) {
        presenceData.state = 'Em sua área de usuário'
      }
    }
    // Lógica para página de episódio
    else if (firstSegment === 'e' && pathSegments.length === 2) {
      if (video.paused && hideWhenPaused) {
        return presence.clearActivity()
      }

      const animeTitle = getTitle()
      const episodeTitle = document.querySelector('#current_ep strong')?.textContent?.trim() || 'Episódio desconhecido'

      presenceData.details = `Assistindo: ${animeTitle}`
      presenceData.state = episodeTitle
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? 'Pausado' : 'Assistindo'

      if (showCover) {
        presenceData.largeImageKey = await getCoverImage()
      }

      if (showTimestamps && !video.paused && video.duration > 0) {
        const [startTimestamp, endTimestamp] = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
      else {
        delete presenceData.startTimestamp
      }

      if (showButtons && !privacyMode) {
        presenceData.buttons = [{ label: 'Assistir Episódio', url: href }]
      }
    }
    // Lógica para página de filme
    else if (firstSegment === 'filmes' && pathSegments[1] === 'assistir' && pathSegments.length === 3) {
      if (video.paused && hideWhenPaused) {
        return presence.clearActivity()
      }

      const movieTitle = getTitle()

      presenceData.details = `Assistindo ao filme:`
      presenceData.state = movieTitle
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? 'Pausado' : 'Assistindo'

      if (showCover) {
        presenceData.largeImageKey = ActivityAssets.Films
      }

      if (showTimestamps && !video.paused && video.duration > 0) {
        const [startTimestamp, endTimestamp] = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
      else {
        delete presenceData.startTimestamp
      }

      if (showButtons && !privacyMode) {
        presenceData.buttons = [{ label: 'Assistir Filme', url: href }]
      }
    }
    // Lógica para a página de detalhes do anime
    else if (firstSegment === 'a' && pathSegments.length === 2) {
      const animeTitle = getTitle()
      presenceData.details = 'Vendo os detalhes de'
      presenceData.state = animeTitle

      if (showCover) {
        presenceData.largeImageKey = await getCoverImage()
      }
      if (showButtons && !privacyMode) {
        presenceData.buttons = [{ label: 'Ver Anime', url: href }]
      }
    }
    // Lógica para páginas genéricas listadas em pageDetails
    else if (pageDetails[firstSegment]) {
      const page = pageDetails[firstSegment]
      presenceData.details = page.title
      if (page.image) {
        presenceData.largeImageKey = page.image
      }
    }
    // Fallback para outras páginas
    else {
      presenceData.details = 'Navegando no Anroll'
      const pageTitle = document.title.replace(' - Anroll', '')
      if (!privacyMode && pageTitle !== 'Anroll') {
        presenceData.state = pageTitle
      }
    }

    // Aplica o modo de privacidade
    if (privacyMode) {
      presenceData.state = 'Navegando em modo privado'
      // Remove botões e imagem de capa
      delete presenceData.buttons
      presenceData.largeImageKey = ActivityAssets.Logo
    }

    presence.setActivity(presenceData)
  }
  catch (error) {
    console.error('Erro ao atualizar a Presence:', error)
    presence.setActivity({ details: 'Ocorreu um erro' })
  }
})

