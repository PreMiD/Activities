import { ActivityType, getTimestamps, timestampFromFormat } from 'premid'

// Actividad de PreMiD para ACI-MAPA (https://aci.nous.es).
// Privacidad: nunca se leen búsquedas, valores de parámetros, anclas, datos de
// cuenta ni rutas privadas. Solo la sección visible y, si el ajuste lo permite,
// el título público de lo que se ve (territorio, pieza audiovisual, obra, teoría).

const presence = new Presence({
  clientId: '1562392315773976707',
})

const SITIO = 'https://aci.nous.es'
const RECURSOS = 'https://raw.githubusercontent.com/antoniobuen0/aci-mapa-premid-assets/main'
const LOGO = `${RECURSOS}/logo.png`
const PIE = 'ACI-MAPA · aci.nous.es'

// Tiempo transcurrido: desde que se abrió ACI-MAPA en esta pestaña.
// Se guarda una sola vez en sessionStorage (sobrevive a navegación y recargas).
const CLAVE_INICIO = 'PMD_aci_mapa_inicio'
const inicio = (() => {
  const ahora = Math.floor(Date.now() / 1000)
  try {
    const guardado = Number(sessionStorage.getItem(CLAVE_INICIO))
    if (Number.isFinite(guardado) && guardado > 0 && guardado <= ahora)
      return guardado
    sessionStorage.setItem(CLAVE_INICIO, String(ahora))
  }
  catch {}
  return ahora
})()

// Secciones públicas: clave (primer segmento de la ruta) → [texto, icono]
const SECCIONES: Record<string, [string, string]> = {
  'identificacion': ['Identificación', 'identificacion'],
  'asociaciones': ['Asociaciones', 'asociaciones'],
  'programas': ['Programas', 'programas'],
  'legislacion': ['Legislación', 'legislacion'],
  'guias': ['Guías y protocolos', 'guias'],
  'formacion': ['Formación', 'formacion'],
  'audiovisual': ['Audiovisual', 'audiovisual'],
  'consultas': ['Consultas', 'consultas'],
  'analisis': ['Análisis', 'analisis'],
  'modelos': ['Modelos teóricos', 'modelos'],
  'investigacion': ['Investigación', 'investigacion'],
  'biblioteca': ['Biblioteca', 'biblioteca'],
  'acipedia': ['ACIPEDIA', 'acipedia'],
  'agenda': ['Agenda', 'agenda'],
  'prensa': ['Prensa', 'prensa'],
  'libros': ['Libros', 'libros'],
  'territorios': ['Territorios', 'territorio'],
  'accesibilidad': ['Información legal', 'explorar'],
  'aviso-legal': ['Información legal', 'explorar'],
  'privacidad': ['Información legal', 'explorar'],
}

// Nombre visible en el dock / barra lateral del panel de trabajo → clave.
// El panel cambia de sección sin que la URL sea siempre fiable, así que
// manda el botón activo.
const PANEL: Record<string, string> = {
  'Identificación': 'identificacion',
  'Asociaciones': 'asociaciones',
  'Programas': 'programas',
  'Legislación': 'legislacion',
  'Guías y protocolos': 'guias',
  'Formación': 'formacion',
  'Audiovisual': 'audiovisual',
  'Consultas': 'consultas',
}

// Rutas que nunca se describen ni se enlazan.
const PRIVADAS = new Set(['cuenta', 'social', 'colabora', 'ops', 'admin', 'v2', 'c', 'api'])

function texto(el: Element | null | undefined): string | undefined {
  return el?.textContent?.replace(/\s+/g, ' ').trim() || undefined
}

const recorta = (s: string, n = 120) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

function visible(el: Element | null | undefined): boolean {
  return !!el && (el as HTMLElement).offsetParent !== null && el.getClientRects().length > 0
}

/** Sección activa: capas Prensa/Agenda, luego panel de trabajo, luego ruta. */
function seccionActual(segmentos: string[]): string {
  for (const b of document.querySelectorAll('header button[aria-pressed="true"]')) {
    const t = texto(b)
    if (t === 'Prensa')
      return 'prensa'
    if (t === 'Agenda')
      return 'agenda'
  }
  // Solo se mira si el parámetro existe, nunca su valor.
  const q = new URLSearchParams(document.location.search)
  if (q.has('prensa'))
    return 'prensa'
  if (q.has('agenda'))
    return 'agenda'

  const primero = segmentos[0] ?? ''
  if (PANEL[SECCIONES[primero]?.[0] ?? ''] || primero === '') {
    const activo = document.querySelector('button.dock-icon[aria-pressed="true"], .rail-layer-item[aria-pressed="true"]')
    if (activo) {
      const etiqueta = activo.getAttribute('aria-label') ?? texto(activo) ?? ''
      const nombre = Object.keys(PANEL).find(n => etiqueta.startsWith(n))
      if (nombre)
        return PANEL[nombre]!
    }
  }
  return primero
}

/** Territorio seleccionado en el mapa de Identificación. */
function territorioMapa(): string | undefined {
  const tag = document.querySelector('.ins-hero__tag')
  if (!visible(tag))
    return undefined
  const ultimo = texto(tag)?.split('·').pop()?.trim()
  return ultimo && ultimo !== 'Estado español' ? ultimo : undefined
}

interface Pieza {
  titulo: string
  autor?: string
  video: boolean
  sonando: boolean
  actual?: number
  total?: number
}

let ultimaPieza: { titulo: string, autor?: string } | undefined

/** «00:07 de 31:00» → [7, 1860] */
function tiempos(valor: string | null | undefined): [number, number] | undefined {
  const m = valor?.match(/([\d:]+)\s+de\s+([\d:]+)/)
  if (!m)
    return undefined
  const a = timestampFromFormat(m[1]!)
  const b = timestampFromFormat(m[2]!)
  return b > 0 ? [a, b] : undefined
}

/** Lo que suena en el reproductor de Audiovisual o en el mini-reproductor global. */
function piezaEnReproduccion(): Pieza | undefined {
  // Reproductor principal (Plyr: audio HTML5 o YouTube)
  const sec = document.querySelector('section[class*="audiovisual_player"]')
  const plyr = sec?.querySelector('.plyr')
  const titulo = texto(sec?.querySelector('[class*="playerTitleRow"] strong'))
  if (sec && plyr && titulo) {
    const autor = texto(sec.querySelector('[class*="playerHeader"] small'))?.replace(/^Repositorio\s*·\s*/, '')
    ultimaPieza = { titulo, autor }
    const sonando = plyr.classList.contains('plyr--playing')
    const parada = plyr.classList.contains('plyr--stopped')
    if (sonando || !parada) {
      let t = tiempos(plyr.querySelector('.plyr__progress input')?.getAttribute('aria-valuetext'))
      if (!t) {
        const m = plyr.querySelector<HTMLMediaElement>('video, audio')
        if (m && Number.isFinite(m.duration) && m.duration > 0)
          t = [m.currentTime, m.duration]
      }
      return { titulo, autor, video: plyr.classList.contains('plyr--video'), sonando, actual: t?.[0], total: t?.[1] }
    }
  }

  // Mini-reproductor global (sigue sonando al cambiar de sección)
  const g = document.querySelector('section[class*="global-audio-player_player"]')
  if (g && (g as HTMLElement).style.display !== 'none') {
    const propio = texto(g.querySelector('[class*="meta"] strong'))
    const t = propio && propio !== 'Reproductor' ? propio : ultimaPieza?.titulo
    if (t) {
      const seek = g.querySelector<HTMLInputElement>('input[aria-label="Posición"]')
      const actual = Number(seek?.value)
      const total = Number(seek?.max)
      const sonando = g.querySelector('[aria-label="Pausar"]') !== null
      return {
        titulo: t,
        autor: propio && propio !== 'Reproductor' ? texto(g.querySelector('[class*="meta"] small')) : ultimaPieza?.autor,
        video: false,
        sonando,
        actual: Number.isFinite(actual) ? actual : undefined,
        total: Number.isFinite(total) && total > 0 ? total : undefined,
      }
    }
  }
  return undefined
}

presence.on('UpdateData', async () => {
  const [privacidad, boton, tiempo, iconos] = await Promise.all([
    presence.getSetting<number>('privacidad'),
    presence.getSetting<boolean>('boton'),
    presence.getSetting<boolean>('tiempo'),
    presence.getSetting<boolean>('iconos'),
  ])

  const segmentos = document.location.pathname.split('/').filter(Boolean)
  const clave = seccionActual(segmentos)
  const conDetalle = privacidad === 0
  const esPrivada = PRIVADAS.has(segmentos[0] ?? '') || (clave !== '' && !SECCIONES[clave])
  const describe = privacidad !== 2 && !esPrivada

  const datos: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: LOGO,
    largeImageText: PIE,
    details: 'En ACI-MAPA',
  }
  if (tiempo)
    datos.startTimestamp = inicio

  let icono: string | undefined
  let nombre = 'ACI-MAPA'
  let enlace: string | undefined // «Abrir esta sección»

  if (describe) {
    if (clave === '') {
      datos.details = 'Portada'
      icono = 'mapa'
    }
    else {
      const [n, ic] = SECCIONES[clave]!
      nombre = n
      icono = ic
      datos.details = n
      enlace = `${SITIO}/${clave}`
      const sub = segmentos[0] === clave ? segmentos.slice(1) : []

      if (conDetalle) {
        const h1 = () => texto(document.querySelector('main h1:not(.sr-only)') ?? document.querySelector('h1'))
        if (clave === 'territorios' && sub.length === 1) {
          const t = h1()
          if (t)
            datos.state = recorta(t)
          enlace = `${SITIO}/territorios/${sub[0]}`
        }
        else if ((clave === 'modelos' && sub.length === 1)
          || (clave === 'investigacion' && sub[0] === 'autores' && sub.length === 2)
          || (clave === 'biblioteca' && sub.length === 1)) {
          const t = h1()
          if (t)
            datos.state = recorta(t)
          enlace = `${SITIO}/${clave}/${sub.join('/')}`
        }
        else if (clave === 'identificacion') {
          const t = territorioMapa()
          if (t)
            datos.state = `Explorando el mapa · ${t}`
        }
      }
    }
    datos.largeImageText = `${nombre} · ${PIE}`

    // Reproducción audiovisual (solo con detalle completo)
    if (conDetalle) {
      const p = piezaEnReproduccion()
      if (p && (p.sonando || clave === 'audiovisual')) {
        datos.details = recorta(p.titulo, 128)
        datos.state = p.sonando
          ? recorta(p.autor ? `${p.autor} · ${nombre}` : nombre)
          : `En pausa · ${nombre}`
        datos.largeImageText = `${p.video ? 'Vídeo' : 'Audio'} en ${PIE}`
        if (p.sonando) {
          datos.type = p.video ? ActivityType.Watching : ActivityType.Listening
          if (p.actual !== undefined && p.total) {
            const [s, e] = getTimestamps(p.actual, p.total)
            datos.startTimestamp = s
            datos.endTimestamp = e
          }
        }
        else {
          // Pausado: sin barra de progreso
          delete datos.startTimestamp
          delete datos.endTimestamp
        }
      }
    }
  }

  if (iconos && icono && describe) {
    datos.smallImageKey = `${RECURSOS}/${icono}.png`
    datos.smallImageText = `${nombre} · ${PIE}`
  }

  // Botón con la sección o ficha concreta (nunca la portada)
  if (boton && describe && enlace)
    datos.buttons = [{ label: 'Abrir esta sección', url: enlace }]

  presence.setActivity(datos)
})
