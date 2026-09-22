import { ActivityType, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1551687484805615636',
})

const CATEGORY_LABELS: Record<string, string> = {
  'animes': 'Animes',
  'anime-dublado': 'Animes Dublados',
  'tokusatsus': 'Tokusatsu',
  'doramas': 'Doramas',
  'donghua': 'Donghua',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

function normalizeKey(name: string) {
  return name.trim().toLowerCase()
}

function saveCover(showName: string, coverUrl: string) {
  try {
    localStorage.setItem(`hinatasoul-cover:${normalizeKey(showName)}`, coverUrl)
  }
  catch {
    // localStorage pode falhar em algumas situações (ex: modo privado) — não é crítico
  }
}

function getSavedCover(showName: string): string | null {
  try {
    return localStorage.getItem(`hinatasoul-cover:${normalizeKey(showName)}`)
  }
  catch {
    return null
  }
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    name: 'Hinata Soul',
    largeImageKey: 'https://i.imgur.com/BGYco3K.png',
    largeImageText: 'Hinata Soul',
  }

  // Ex: "/animes", "/anime-dublado", "/tokusatsus", "/doramas", "/donghua"
  const catalogMatch = pathname.match(/^\/(animes|anime-dublado|tokusatsus|doramas|donghua)\/?$/)

  // Ex: "/animes/hack-sign", "/anime-dublado/hack-sign-dublado"
  const infoMatch = pathname.match(/^\/(?:animes|anime-dublado|tokusatsus|doramas|donghua)\/[^/]+\/?$/)

  // Ex: "/videos/493948"
  const isEpisodePage = /^\/videos\/[^/]+\/?$/.test(pathname)

  if (catalogMatch) {
    const category = catalogMatch[1] ?? ''
    presenceData.details = 'Explorando Catálogo:'
    presenceData.state = CATEGORY_LABELS[category] ?? category
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (isEpisodePage) {
    const titleEl = document.querySelector('h1.epTituloNome')
    const rawTitle = titleEl?.textContent?.trim() ?? 'Anime desconhecido'

    // Tenta separar "Nome ep 11" / "Nome Ep 11" / "Nome EP 11" em nome + episódio.
    // Se não achar "ep" nenhum, assume que é só o nome (sem número de episódio no título)
    const episodeMatch = rawTitle.match(/\bep\.?\s*(\d+)/i)

    let showName = rawTitle
    let episodeNumber = ''

    if (episodeMatch) {
      showName = rawTitle.slice(0, episodeMatch.index).trim() || rawTitle
      episodeNumber = episodeMatch[1] ?? ''
    }

    presenceData.name = showName
    presenceData.details = `Assistindo: ${showName}`
    presenceData.state = episodeNumber ? `Episódio ${episodeNumber}` : 'Episódio'

    const savedCover = getSavedCover(showName)
    if (savedCover)
      presenceData.largeImageKey = savedCover

    const videoElement = document.querySelector<HTMLVideoElement>('video')

    if (videoElement && !videoElement.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(videoElement)
    }
  }
  else if (infoMatch) {
    const titleEl = document.querySelector('h1')
    const showName = titleEl?.textContent?.trim() ?? 'Anime desconhecido'
    const coverEl = document.querySelector<HTMLImageElement>('img[rel="preload"][as="image"]')

    presenceData.name = showName
    presenceData.details = showName
    presenceData.state = 'Vendo informações'
    presenceData.startTimestamp = browsingTimestamp

    if (coverEl?.src) {
      presenceData.largeImageKey = coverEl.src
      saveCover(showName, coverEl.src)
    }
  }
  else {
    presenceData.details = 'Navegando no site'
    presenceData.startTimestamp = browsingTimestamp
  }

  presence.setActivity(presenceData)
})
