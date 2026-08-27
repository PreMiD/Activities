import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: 'TU_CLIENT_ID_AQUI', // Client ID de tu app en Discord Developer Portal
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

// Timestamp que se reinicia solo cuando cambia el título/episodio detectado,
// para que el contador de "tiempo viendo" en Discord no se resetee en cada UpdateData.
let mediaTimestamp = browsingTimestamp
let lastKey = ''

enum ActivityAssets {
  Logo = 'https://i.imgur.com/RQ28HKd.png',
}

// Datos que manda iframe.ts (currTime/dur/paused) cuando encuentra un <video>
// dentro del servidor externo (TONPlayer, Streamwish, etc.)
interface IFrameVideoData {
  currTime?: number
  dur?: number
  paused?: boolean
}

let iFrameVideoData: IFrameVideoData | null = null

presence.on('iFrameData', (data: { iFrameVideoData?: IFrameVideoData }) => {
  iFrameVideoData = data.iFrameVideoData ?? null
})

// El año de estreno solo se pinta como texto suelto dentro de #heroMeta en /details
// (ej. "1999 · 2h 19m · Película"), mezclado con duración y tipo — no tiene su propio
// elemento. En /player no se pinta en ningún lado, así que ahí no hay año disponible
// salvo que ya se haya cacheado antes al pasar por /details.
let cachedYear: string | null = null

function getYear(): string | null {
  const metaEl = document.querySelector('#heroMeta')
  const text = metaEl?.textContent ?? ''
  const match = text.match(/\b(?:19|20)\d{2}\b/)
  if (match) {
    cachedYear = match[0]
    return cachedYear
  }
  return cachedYear
}

// El poster real de TMDB queda en <meta property="og:image"> — el sitio la actualiza
// dinámicamente (updateOpenGraphTags) tanto en /details como en /player, así que sirve
// como fuente única sin tener que duplicar selectores distintos por página.
function getPosterFromMeta(): string | null {
  const meta = document.querySelector('meta[property="og:image"]')
  const content = meta?.getAttribute('content')
  // Evita devolver el logo genérico del sitio como si fuera el poster real
  if (content && !content.includes('i.imgur.com/RQ28HKd'))
    return content
  return null
}

function getMediaFromUrl(): { tipo: string, tmdbId: string | null, temporada: string | null, episodio: string | null } {
  const params = new URLSearchParams(window.location.search)
  const tipoRaw = (params.get('tipo') || params.get('type') || 'movie').toLowerCase()
  const tipo = tipoRaw === 'tv' || tipoRaw === 'serie' || tipoRaw === 'series' ? 'tv' : 'movie'
  const tmdbId = params.get('id') || params.get('tmdb_id') || params.get('tmdbId')
  const temporada = params.get('temporada') || params.get('season')
  const episodio = params.get('episodio') || params.get('episode')

  return { tipo, tmdbId: tmdbId ? tmdbId.trim() : null, temporada, episodio }
}

// La sinopsis vive en IDs distintos según la página: #detailsOverview en /details,
// #aboutOverview en /player.
function getOverview(): string | null {
  const el = document.querySelector('#detailsOverview, #aboutOverview')
  const text = el?.textContent?.trim()
  if (text && text !== 'Sin sinopsis disponible.')
    return text.length > 120 ? `${text.slice(0, 117)}...` : text
  return null
}

// El sitio actualiza document.title así:
//  Película: "Titulo - PelisVidHD"
//  Serie:    "Titulo T1 E23 - PelisVidHD"
function parseTitleFromDocumentTitle(): { titulo: string | null, temporada: string | null, episodio: string | null } {
  const raw = document.title.replace(/\s*-\s*PelisVidHD\s*$/i, '').trim()
  const match = raw.match(/^(.*)\sT(\d+)\sE(\d+)$/i)
  if (match && match[1] && match[2] && match[3]) {
    return { titulo: match[1].trim(), temporada: match[2], episodio: match[3] }
  }
  return { titulo: raw || null, temporada: null, episodio: null }
}

presence.on('UpdateData', async () => {
  const path = window.location.pathname
  const media = getMediaFromUrl()
  const { titulo, temporada: tFromTitle, episodio: eFromTitle } = parseTitleFromDocumentTitle()

  const temporada = media.temporada || tFromTitle
  const episodio = media.episodio || eFromTitle
  const enFicha = path.includes('/player') || path.includes('/details')

  // Solo cortamos si estamos en /player o /details pero el título aún no cargó
  // (la SPA tarda un momento en pintar el dato real). En la portada no hace falta título.
  if (enFicha && !titulo)
    return

  // Si cambió el título/episodio, reinicia el contador de "tiempo viendo".
  const key = `${titulo ?? ''}-${temporada ?? ''}-${episodio ?? ''}`
  if (key !== lastKey) {
    mediaTimestamp = Math.floor(Date.now() / 1000)
    lastKey = key
  }

  const poster = enFicha ? getPosterFromMeta() : null
  const overview = enFicha ? getOverview() : null
  const anio = enFicha && media.tipo === 'movie' ? getYear() : null

  const presenceData: PresenceData = {
    largeImageKey: poster || ActivityAssets.Logo,
    startTimestamp: mediaTimestamp,
    type: ActivityType.Watching,
  }

  if (path.includes('/player')) {
    // Película: "Viendo El Club de la Pelea (1999)"
    // Serie:    "Viendo Silo" + tooltip del poster "Temporada 1, Episodio 1"
    const esSerie = media.tipo === 'tv' && temporada && episodio
    const tituloLimpio = titulo || (esSerie ? 'Serie' : 'Película')
    const tituloConDetalle = esSerie
      ? tituloLimpio
      : (anio ? `${tituloLimpio} (${anio})` : tituloLimpio)

    presenceData.details = `${tituloConDetalle}`
    presenceData.name = tituloConDetalle
    presenceData.state = overview || (esSerie ? 'Viendo episodio' : 'Viendo película')

    if (esSerie) {
      presenceData.largeImageText = `Temporada ${Number(temporada)}, Episodio ${Number(episodio)}`
    }

    if (iFrameVideoData && typeof iFrameVideoData.dur === 'number' && !Number.isNaN(iFrameVideoData.dur)) {
      // Tenemos datos reales del <video> dentro del iframe del servidor
      const { currTime = 0, dur, paused } = iFrameVideoData

      if (paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Pausado'
        // Sin timestamps mientras está pausado: evita que la barra de progreso
        // de Discord quede "congelada" mostrando tiempo que no avanza.
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
      else {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Reproduciendo'
        // getTimestamps calcula el startTimestamp/endTimestamp correctos
        // para que Discord muestre la barra de progreso real del video.
        ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          Math.floor(currTime),
          Math.floor(dur),
        )
      }
    }
    else {
      // El servidor actual no expone un <video> HTML5 accesible
      // (bloqueado por CORS, reproductor custom, o aún cargando): fallback simple.
      presenceData.smallImageKey = Assets.Play
      presenceData.startTimestamp = mediaTimestamp
    }
  }
  else if (path.includes('/details')) {
    // Viendo la ficha, todavía no reproduciendo: mismo formato que /player
    iFrameVideoData = null
    presenceData.smallImageKey = Assets.Search

    const esSerie = media.tipo === 'tv' && temporada && episodio
    const tituloLimpio = titulo || (esSerie ? 'Serie' : 'Película')
    const tituloConDetalle = esSerie
      ? tituloLimpio
      : (anio ? `${tituloLimpio} (${anio})` : tituloLimpio)

    presenceData.details = `${tituloConDetalle}`
    presenceData.name = tituloConDetalle
    presenceData.state = overview || 'Viendo detalles'

    if (esSerie) {
      presenceData.largeImageText = `Temporada ${Number(temporada)}, Episodio ${Number(episodio)}`
    }
  }
  else if (path.includes('/search')) {
    // Buscando algo: /search?q=titanic
    iFrameVideoData = null
    const query = new URLSearchParams(window.location.search).get('q')
    presenceData.smallImageKey = Assets.Search
    presenceData.details = query ? `Buscando: ${query}` : 'Buscando contenido'
    presenceData.state = 'PelisVidHD'
  }
  else if (path.includes('/login')) {
    // Pantalla de inicio de sesión
    iFrameVideoData = null
    presenceData.smallImageKey = Assets.Search
    presenceData.details = 'Iniciando sesión'
    presenceData.state = 'PelisVidHD'
  }
  else if (path.includes('/register')) {
    // Pantalla de registro
    iFrameVideoData = null
    presenceData.smallImageKey = Assets.Search
    presenceData.details = 'Creando una cuenta'
    presenceData.state = 'PelisVidHD'
  }
  else {
    // Portada / explorando el catálogo
    iFrameVideoData = null
    presenceData.smallImageKey = Assets.Search
    presenceData.details = 'Explorando el catálogo'
    presenceData.state = 'PelisVidHD'
  }

  if (enFicha) {
    // Discord a veces no muestra un solo botón; con 2 se ve más consistente.
    presenceData.buttons = [
      { label: 'Ver ahora', url: window.location.href },
      { label: 'Ir a PelisVidHD', url: 'https://pelisvidhd.icu' },
    ]
  }

  presence.setActivity(presenceData)
})
