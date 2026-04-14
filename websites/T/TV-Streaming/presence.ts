const presence = new Presence({
  clientId: '1363276484436820019',
})

const logosManuais: { [key: string]: string } = {

  // --- Grupo INFANTIL ---
  // --- Grupo RELIGIOSO ---
  // --- Grupo CINE SKY ---
  // --- Grupo DESENHO 24H ---
  // --- Grupo ESPECIAIS 24H ---
  // --- Grupo MARATONA 24H ---
  // --- Grupo FILMES 24H ---
  // --- Grupo SHOW 24H ---
  // --- Grupo PORTUGAL ---
  // --- Grupo DESPORTO ---
  // --- Grupo ESTADOS UNIDOS ---
  // --- Grupo NBA LEAGUE PASS ---
  // --- Grupo NFL GAME PASS ---
  // --- Grupo MLB GAME PASS ---
  // --- Grupo NHL CENTER ICE ---
  // --- Grupo MLSSEASON PASS ---
}

const logoPadrao = 'https://raw.githubusercontent.com/PreMiD/Activities/fc9e8b561349b7433267e3ccfc408f41c8f2cf68/websites/T/TV-Streaming/logo.png'
const _browsingTimestamp = Math.floor(Date.now() / 1000)

let ultimoTituloFilme = ''
let ultimaLogoFilme = ''
let lastHref = ''
let ultimoCanal = ''
let ultimoManual = ''
let bloquearManual = false

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement | null
  const container = target?.closest('.streamselector.posterDiv')
  const img = container?.querySelector('img.mainsss') as HTMLImageElement | null

  if (img) {
    ultimoTituloFilme = img.alt.trim()
    ultimaLogoFilme = img.src
  }
})

const startBaseTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const href = window.location.href ?? ""
  if (lastHref !== href) lastHref = href

  const isDashboard = href.includes('dashboard.php')
  const isLive = href.includes('live.php')
  const isMovie = href.includes('movies.php')
  const isSeries = href.includes('series.php')

  const privateMode = Boolean(await presence.getSetting("privateMode"))

  let detailsText = ""
  let stateText = ""
  let logoFinal = logoPadrao

  // DASHBOARD
  if (isDashboard) {
    if (privateMode) {
      detailsText = "Navegando"
    } else {
      detailsText = "No Menu Principal"
      stateText = "Selecionando serviço..."
    }
  }

  // LIVE
  else if (isLive) {
    if (privateMode) {
      detailsText = "Canal Privado"
      logoFinal = logoPadrao
    } else {
      const canalAtivo =
        document.querySelector('.liveFrameBody.active .liveFrameChanName span') as HTMLElement | null
        || document.querySelector('.list-group-item.active .channel-name') as HTMLElement | null
        || document.querySelector('.liveFrameChanName span') as HTMLElement | null

      const nomeCanal = canalAtivo?.textContent?.trim() ?? "Escolhendo Canal..."
      detailsText = nomeCanal

      const customEpg = String(await presence.getSetting("customEpg") || "").trim()

      if (
        nomeCanal &&
        nomeCanal !== "Escolhendo Canal..." &&
        nomeCanal !== ultimoCanal
      ) {
        ultimoCanal = nomeCanal
        bloquearManual = true
      }

      if (customEpg !== ultimoManual) {
        bloquearManual = false
      }
      ultimoManual = customEpg

      const epgAtual = document.querySelector('.liveEPGdiv .liveEpgTime[data-titleis]') as HTMLElement | null
      const programaNome = epgAtual?.getAttribute('data-titleis')?.trim() || ""

      const epgInvalido = [
        "Guia de programação indisponível",
        "Sem guia",
        "Sem programação",
        "N/A",
        nomeCanal,
      ]

      if (!bloquearManual && customEpg.length > 0) {
        stateText = customEpg
      } 
      else if (programaNome && !epgInvalido.includes(programaNome)) {
        stateText = programaNome
      } 
      else {
        stateText = "Guia de programação indisponível"
      }

      if (logosManuais[nomeCanal]) {
        logoFinal = logosManuais[nomeCanal]
      } else {
        const logoAtiva = document.querySelector('.liveFrameBody.active .liveFrameImg img') as HTMLImageElement | null
        if (logoAtiva?.src) logoFinal = logoAtiva.src
      }
    }
  }

  // FILMES
  else if (isMovie) {
    if (privateMode) {
      detailsText = "Filme Privado"
      logoFinal = logoPadrao
    } else {
      const activeMovie = document.querySelector('.streamselector.posterDiv.active') as HTMLElement | null
      const poster = activeMovie?.querySelector('img.mainsss') as HTMLImageElement | null

      detailsText = (ultimoTituloFilme || poster?.alt || "Filme")
        .replace(/\s*\(\d{4}\).*$/, "")
        .replace(/\[.*?\]/g, "")
        .trim()

      const infos = document.querySelectorAll('.two')
      const genero = (infos.length >= 4) ? (infos[3] as HTMLElement).textContent?.trim() : ""
      stateText = genero || "Cinema"

      logoFinal = ultimaLogoFilme || poster?.src || logoPadrao
    }
  }

  // SÉRIES
  else if (isSeries) {
    if (privateMode) {
      detailsText = "Série Privada"
      logoFinal = logoPadrao
    } else {
      const nomeSerieRaw = document.querySelector('.serieEpiName span') as HTMLElement | null
      const nomeSerieText: string = nomeSerieRaw?.textContent?.trim() || ultimoTituloFilme || "Série"

      const partesSerie = nomeSerieText.split(' S')
      detailsText = (partesSerie[0] || "").trim()

      const descSeries = document.querySelector('.movieInDescription') as HTMLElement | null
      const descEpisodio = document.querySelector('.serieEpiDesc span') as HTMLElement | null
      const infoFinal = descSeries?.textContent?.trim() || descEpisodio?.textContent?.trim() || ""

      stateText = infoFinal && infoFinal !== "N/A" ? infoFinal : "Assistindo Série"

      const logoSerie = document.querySelector('.playstreamepimg') as HTMLElement | null
      if (logoSerie) {
        const bg = getComputedStyle(logoSerie).backgroundImage || ""
        const match = bg.match(/url\(["']?(.*?)["']?\)/)
        if (match && match[1] && !match[1].includes('play.png')) {
          logoFinal = match[1]
        } else {
          logoFinal = ultimaLogoFilme || logoPadrao
        }
      } else {
        logoFinal = ultimaLogoFilme || logoPadrao
      }
    }
  }

  if (!detailsText) return

  const video = document.querySelector('#custom-video-player_html5_api') as HTMLVideoElement | null
  const estaPausado = video?.paused ?? true
  const duration = video?.duration ?? 0
  const currentTime = video?.currentTime ?? 0

  let smallImageKey = ""
  let smallImageText = ""

  if (isLive) {
    smallImageKey = estaPausado
      ? 'https://i.imgur.com/iaL3b1R.png'
      : 'https://i.imgur.com/LmOhe47.png'
    smallImageText = estaPausado ? 'PAUSADO' : 'AO VIVO'
  } 
  else if (isMovie || isSeries) {
    smallImageKey = estaPausado
      ? 'https://i.imgur.com/8LyLenq.png'
      : 'https://i.imgur.com/ZsIDFdU.png'
    smallImageText = estaPausado ? 'Pausado' : 'Assistindo'
  }

  const presenceData: any = {
    details: detailsText,
    ...(stateText ? { state: stateText } : {}),
    largeImageKey: logoFinal,
    largeImageText: detailsText,
    smallImageKey,
    smallImageText,
    type: 3,
  }

  if (!isLive && !estaPausado && duration > 0) {
    presenceData.endTimestamp = Math.floor(Date.now() / 1000) + Math.floor(duration - currentTime)
  } else {
    presenceData.startTimestamp = startBaseTimestamp
  }

  presence.setActivity(presenceData)
})
