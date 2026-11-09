import { ActivityType, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '853327058054545438',
})

const CATEGORY_LABELS: Record<string, string> = {
  'anime': 'Animes',
  'animes-dublado': 'Animes Dublados',
  'tokusatsu': 'Tokusatsus',
  'doramas': 'Doramas',
  'donghua': 'Donghuas',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    name: 'Anitube',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AniTube.vip/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  // Ex: "/anime", "/animes-dublado", "/tokusatsu", "/doramas", "/donghua"
  const catalogMatch = pathname.match(/^\/(anime|animes-dublado|tokusatsu|doramas|donghua)\/?$/)

  // Ex: "/anime/hack-sign", "/animes-dublado/hack-sign-dublado"
  const infoMatch = pathname.match(/^\/(?:anime|animes-dublado|tokusatsu|doramas|donghua)\/[^/]+\/?$/)

  // Ex: "/video/561073"
  const isEpisodePage = /^\/video\/[^/]+\/?$/.test(pathname)

  const search = document.querySelector<HTMLInputElement>(
    '.searchContainer > form > input',
  )
  const isSearching = document.querySelector<HTMLDivElement>('.searchContainer')?.style.display === 'block'

  if (isSearching) {
    presenceData.details = `Pesquisando por ${search ? search.value : ''}`
  }
  else if (catalogMatch) {
    const category = catalogMatch[1] ?? ''
    presenceData.details = 'Explorando Catálogo:'
    presenceData.state = CATEGORY_LABELS[category] ?? category
  }
  else if (isEpisodePage) {
    const titleEl = document.querySelector<HTMLDivElement>('.mContainer_title_small_content')
    const rawTitle = titleEl?.textContent?.trim() ?? ''
    const videoElement = document.querySelector<HTMLVideoElement>('video')

    // Ex: "Assistir Dogulwang - Dublado ep 8 HD ONLINE"
    // 1. Tira o "Assistir " do começo
    let animeName = rawTitle.replace(/^Assistir\s+/i, '')

    // 2. Corta tudo a partir de "ep" (número do episódio pra frente,
    //    isso já descarta qualquer coisa depois tipo "- Anitube")
    const epIndex = animeName.search(/\bep\b/i)
    if (epIndex !== -1)
      animeName = animeName.slice(0, epIndex)

    // 3. Tira sufixos de tipo de áudio (Dublado/Legendado) que não fazem parte do nome
    animeName = animeName.replace(/\s*-\s*(?:dublado|legendado)\s*$/i, '').trim()

    if (!animeName)
      animeName = 'Anime desconhecido'

    const episodeMatch = rawTitle.match(/\bep\s*(\d+)/i)
    const episodeNumber = episodeMatch ? episodeMatch[1] : ''

    presenceData.name = animeName
    presenceData.details = `Assistindo: ${animeName}`
    presenceData.state = episodeNumber ? `Episódio ${episodeNumber}` : 'Episódio'
    presenceData.buttons = [
      {
        label: 'Assistir Junto',
        url: href,
      },
    ]

    if (videoElement && !videoElement.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(videoElement)
    }
  }
  else if (infoMatch) {
    const animeName = document.querySelector<HTMLDivElement>(
      '.anime_container_titulo',
    )?.textContent?.trim() ?? 'Anime desconhecido'

    presenceData.name = animeName
    presenceData.details = 'Checando informações:'
    presenceData.state = animeName
  }
  else if (pathname === '/contato.php') {
    presenceData.details = 'Na página de contato'
  }
  else if (pathname === '/busca.php') {
    presenceData.details = 'Vendo resultados da busca por'
    presenceData.state = document.querySelector(
      '.mContainer_title_small_content',
    )?.textContent?.substring(17) ?? ''
  }
  else {
    presenceData.details = 'Navegando na página inicial'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
