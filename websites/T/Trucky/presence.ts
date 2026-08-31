import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1543722675699196045',
})

const TRUCKY_LOGO = 'https://screen-mp.com/uploads/images/f138ec30-1dcc-4ac1-a320-56343d8ead64.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

function cleanText(text: string | null | undefined): string {
  if (!text)
    return ''
  return text
    .replace(/\s*[-|–—]\s*(Trucky|TruckyApp|TruckyMods|VTC Hub|The Virtual Trucker Companion).*$/i, '')
    .trim()
}

/**
 * Busca y extrae el nombre del conductor visto en el perfil
 */
function findUserName(): string {
  // Estrategia 1: Buscar cerca del botón "Perfil de Steam" o el contenedor de nivel
  const steamLink = document.querySelector('a[href*="steamcommunity.com"], a[href*="steam"], [class*="steam"]')
  if (steamLink) {
    const parent = steamLink.closest('.card, div')
    if (parent) {
      const headings = Array.from(parent.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, [class*="title"], [class*="name"]'))
      for (const h of headings) {
        if (h.closest('.breadcrumb, .badge, [class*="company"], nav, header'))
          continue
        const text = h.textContent?.trim() || ''
        if (text && text.length <= 35 && !text.toLowerCase().includes('nivel') && !text.toLowerCase().includes('steam') && !text.toLowerCase().includes('puntos')) {
          return text
        }
      }
    }
  }

  // Estrategia 2: Buscar el elemento con "Nivel " o "Level "
  const allElements = Array.from(document.querySelectorAll('*'))
  const levelEl = allElements.find(
    el => el.children.length === 0 && (el.textContent?.includes('Nivel ') || el.textContent?.includes('Level ')),
  )
  if (levelEl) {
    const card = levelEl.closest('.card, [class*="profile"], div')
    if (card) {
      const headings = Array.from(card.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, strong, [class*="name"]'))
      for (const h of headings) {
        if (h.closest('.breadcrumb, .badge, [class*="company"], nav, header'))
          continue
        const text = h.textContent?.trim() || ''
        if (!text || text.length > 35)
          continue
        const lower = text.toLowerCase()
        if (lower.includes('nivel') || lower.includes('puntos') || lower.includes('steam') || lower.includes('trucky') || lower.includes('detalles'))
          continue
        return text
      }
    }
  }

  // Estrategia 3: Buscar en la tarjeta principal
  const profileCard = document.querySelector('.card, [class*="profile-header"], [class*="user-header"], main')
  if (profileCard) {
    const candidates = Array.from(profileCard.querySelectorAll<HTMLElement>(
      'h1, h2, h3, h4, h5, .card-title, [class*="name" i], [class*="username" i]',
    ))

    const blacklist = [
      'trucky',
      'estado',
      'empresa',
      'destacados',
      'estadísticas',
      'trabajos',
      'premios',
      'eventos',
      'nivel',
      'puntos',
      'dashboard',
      'directorio',
      'servidores',
      'tráfico',
      'hosting',
      'leaderboard',
      'clasificación',
      'detalles',
      'mensual',
      'perfil de steam',
      'steam',
      'twitch',
      'wotr',
      'discord',
    ]

    for (const el of candidates) {
      if (el.closest('.breadcrumb, [class*="breadcrumb"], nav, header, .navbar, .badge, [class*="company"]'))
        continue

      const text = el.textContent?.trim()
      if (!text)
        continue

      const lower = text.toLowerCase()
      if (text.length > 35)
        continue
      if (blacklist.some(b => lower.startsWith(b) || lower === b))
        continue
      if (text.includes('km') || text.includes('Tç') || text.includes('mins') || text.includes('%'))
        continue

      return text
    }
  }

  return ''
}

presence.on('UpdateData', async () => {
  const [buttons, timestamp, privacy] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('privacy'),
  ])

  // Siempre mantener el logo oficial de Trucky como imagen grande
  const presenceData: PresenceData = {
    largeImageKey: TRUCKY_LOGO,
    smallImageKey: Assets.Viewing,
    smallImageText: 'Trucky Hub',
  }

  if (privacy) {
    presenceData.details = 'Navegando por Trucky'
    presence.setActivity(presenceData)
    return
  }

  if (timestamp) {
    presenceData.startTimestamp = browsingTimestamp
  }

  const { hostname, pathname, href } = document.location

  // =========================================================================
  // 1. TRUCKYMODS (truckymods.io)
  // =========================================================================
  if (hostname.includes('truckymods.io')) {
    if (pathname.includes('/mods/') || pathname.includes('/mod/')) {
      const modTitle = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        || cleanText(document.title)
      const modCategory = document.querySelector('.mod-category, .badge')?.textContent?.trim() || 'Mod'

      presenceData.details = `Viendo Mod: ${modTitle.slice(0, 50)}`
      presenceData.state = `Categoría: ${modCategory.slice(0, 40)}`
      presenceData.smallImageKey = Assets.Downloading
      presenceData.smallImageText = 'TruckyMods'
    }
    else if (pathname.includes('/user/') || pathname.includes('/author/') || pathname.includes('/creator/')) {
      const authorName = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        || cleanText(document.title)
      presenceData.details = 'Perfil de Modder'
      presenceData.state = authorName ? authorName.slice(0, 45) : 'Creador de mods'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Modder Profile'
    }
    else if (pathname.includes('/search') || pathname.includes('/category/') || pathname.includes('/categories')) {
      const searchCat = document.querySelector<HTMLHeadingElement>('h1')?.textContent || 'Explorando mods'
      presenceData.details = 'Buscando Modificaciones'
      presenceData.state = searchCat.slice(0, 60)
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Buscando'
    }
    else {
      presenceData.details = 'Explorando TruckyMods'
      presenceData.state = 'Plataforma de Mods para ETS2 y ATS'
      presenceData.smallImageKey = Assets.Viewing
    }

    if (buttons) {
      presenceData.buttons = [
        { label: 'Ver en TruckyMods', url: href },
        { label: 'Obtener Trucky', url: 'https://truckyapp.com/' },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // =========================================================================
  // 2. TRUCKY VTC HUB & SUBDOMINIOS (hub.truckyapp.com, vtc.truckyapp.com, etc.)
  // =========================================================================
  if (hostname.includes('hub.truckyapp.com') || hostname.includes('vtc.truckyapp.com') || pathname.startsWith('/hub') || pathname.startsWith('/vtc')) {
    // --- EDITAR PERFIL ---
    if (pathname.includes('/profile/edit') || pathname.includes('/profile/settings') || pathname.includes('/settings')) {
      presenceData.details = 'Editando Perfil'
      presenceData.state = 'Personalizando perfil de conductor'
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Editar Perfil'
    }
    // --- MAPA ---
    else if (pathname.includes('/map')) {
      presenceData.details = 'Mapa de Trucky en Vivo'
      presenceData.state = 'Monitoreando rutas y tráfico'
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live Map'
    }
    // --- DIRECTORIO DE VTCs ---
    else if (pathname.includes('/directory')) {
      presenceData.details = 'Directorio de Empresas (VTC)'
      presenceData.state = 'Explorando empresas virtuales'
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Directorio'
    }
    // --- REGISTRAR EMPRESA ---
    else if (pathname.includes('/register-your-company')) {
      presenceData.details = 'Registrar Empresa (VTC)'
      presenceData.state = 'Creando nueva compañía virtual'
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Creando VTC'
    }
    // --- EVENTOS ---
    else if (pathname.includes('/events') || pathname.includes('/event/')) {
      const eventTitle = document.querySelector<HTMLHeadingElement>('h1, h2, .event-title')?.textContent?.trim()
      if (eventTitle && !eventTitle.toLowerCase().includes('events') && !eventTitle.toLowerCase().includes('eventos')) {
        presenceData.details = `Evento: ${eventTitle.slice(0, 50)}`
        presenceData.state = 'Viendo detalles del evento'
      }
      else {
        presenceData.details = 'Eventos y Convoyes'
        presenceData.state = 'Explorando eventos comunitarios'
      }
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Eventos'
    }
    // --- PREMIUM ---
    else if (pathname.includes('/premium')) {
      presenceData.details = 'Trucky Premium'
      presenceData.state = 'Viendo ventajas exclusivas'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Premium'
    }
    // --- DASHBOARDS ---
    else if (pathname.includes('/dashboards') || pathname.includes('/dashboard')) {
      presenceData.details = 'Galería de Dashboards'
      presenceData.state = 'Explorando tableros de telemetría'
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Dashboards'
    }
    // --- SERVIDORES ---
    else if (pathname.includes('/servers')) {
      presenceData.details = 'Servidores de TruckersMP'
      presenceData.state = 'Monitoreando estado y jugadores'
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Servidores'
    }
    // --- TRÁFICO ---
    else if (pathname.includes('/traffic')) {
      presenceData.details = 'Reportes de Tráfico'
      presenceData.state = 'Revisando tráfico en tiempo real'
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Tráfico'
    }
    // --- HOSTING ---
    else if (pathname.includes('/hosting')) {
      presenceData.details = 'Servidores Dedicados'
      presenceData.state = 'Hosting de servidores para juegos'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Game Server Hosting'
    }
    // --- CLASIFICACIONES (LEADERBOARDS) ---
    else if (pathname.includes('/leaderboards/companies/distance')) {
      presenceData.details = 'Clasificación de Empresas'
      presenceData.state = 'Top VTCs por Distancia'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Leaderboard'
    }
    else if (pathname.includes('/leaderboards/companies/hardcore')) {
      presenceData.details = 'Clasificación de Empresas'
      presenceData.state = 'Top VTCs (Modo Hardcore)'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Leaderboard Hardcore'
    }
    else if (pathname.includes('/leaderboards/users/distance')) {
      presenceData.details = 'Clasificación de Conductores'
      presenceData.state = 'Top Usuarios por Distancia'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Leaderboard'
    }
    else if (pathname.includes('/leaderboards/users/hardcore')) {
      presenceData.details = 'Clasificación de Conductores'
      presenceData.state = 'Top Usuarios (Modo Hardcore)'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Leaderboard Hardcore'
    }
    else if (pathname.includes('/leaderboard') || pathname.includes('/leaderboards')) {
      presenceData.details = 'VTC Hub - Clasificaciones'
      presenceData.state = 'Viendo mejores empresas y pilotos'
      presenceData.smallImageKey = Assets.Reading
    }
    // --- PERFIL DE USUARIO / CONDUCTOR (Ej: /user/175669) ---
    else if (pathname.includes('/user/')) {
      const userIdMatch = pathname.match(/\/user\/([0-9a-zA-Z_-]+)/i)
      const userId = userIdMatch ? userIdMatch[1] : ''

      const userName = findUserName()

      presenceData.details = userName
        ? `Conductor: ${userName.slice(0, 45)}`
        : `Perfil de Conductor #${userId}`
      presenceData.state = userId ? `ID de Usuario: #${userId}` : 'Explorando conductor'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Conductor'
    }
    // --- PERFIL DE COMPAÑÍA / VTC ---
    else if (pathname.includes('/company/') || pathname.includes('/vtc/')) {
      const vtcName = document.querySelector<HTMLHeadingElement>('h1, h2, .vtc-name, .company-name')?.textContent?.trim()
        || cleanText(document.title)

      presenceData.details = 'Viendo Compañía (VTC)'
      presenceData.state = vtcName && !vtcName.toLowerCase().includes('trucky')
        ? vtcName.slice(0, 60)
        : 'Empresa Virtual de Transporte'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'VTC'
    }
    // --- LOGBOOK / REGISTRO DE TRABAJOS ---
    else if (pathname.includes('/jobs') || pathname.includes('/logbook') || pathname.includes('/job/')) {
      presenceData.details = 'VTC Hub - Registro de Viajes'
      presenceData.state = 'Revisando entregas y logbook'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Logbook'
    }
    // --- FLOTA ---
    else if (pathname.includes('/fleet')) {
      presenceData.details = 'VTC Hub - Flota de Camiones'
      presenceData.state = 'Gestionando garajes y flota'
      presenceData.smallImageKey = Assets.Reading
    }
    // --- INICIO DE VTC HUB ---
    else {
      presenceData.details = 'Trucky VTC Hub'
      presenceData.state = 'Gestionando empresa de transporte'
      presenceData.smallImageKey = Assets.Viewing
    }

    if (buttons) {
      presenceData.buttons = [
        { label: 'Ver en VTC Hub', url: href },
        { label: 'Obtener Trucky', url: 'https://truckyapp.com/' },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // =========================================================================
  // 3. TRUCKY LIVE MAP (map.truckyapp.com o /map)
  // =========================================================================
  if (hostname.includes('map.truckyapp.com') || pathname.startsWith('/map')) {
    presenceData.details = 'Mapa de Trucky en Vivo'

    const serverSelected = document.querySelector('.selected-server, .server-name, select option:checked')?.textContent?.trim()
    if (serverSelected) {
      presenceData.state = `Servidor: ${serverSelected.slice(0, 45)}`
    }
    else {
      presenceData.state = 'Monitoreando tráfico y servidores'
    }

    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = 'Live Map'

    if (buttons) {
      presenceData.buttons = [
        { label: 'Ver Mapa en Vivo', url: 'https://map.truckyapp.com/' },
        { label: 'Web de Trucky', url: 'https://truckyapp.com/' },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // =========================================================================
  // 4. TRUCKY WEB PRINCIPAL (truckyapp.com)
  // =========================================================================
  if (pathname === '/' || pathname === '') {
    presenceData.details = 'Página Principal'
    presenceData.state = 'The Virtual Trucker Companion'
  }
  else if (pathname.includes('/overlay') || pathname.includes('/in-game-overlay')) {
    presenceData.details = 'In-Game Overlay'
    presenceData.state = 'Overlay para ETS2 & ATS'
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (pathname.includes('/premium') || pathname.includes('/pricing')) {
    presenceData.details = 'Planes Premium'
    presenceData.state = 'Membresía Trucky Premium'
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (pathname.includes('/download')) {
    presenceData.details = 'Descargas'
    presenceData.state = 'Descargando Trucky Client'
    presenceData.smallImageKey = Assets.Downloading
  }
  else if (pathname.includes('/dispatcher')) {
    presenceData.details = 'Trucky Dispatcher'
    presenceData.state = 'Generador de Rutas y Cargas'
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (pathname.includes('/blog') || pathname.includes('/news') || pathname.includes('/article')) {
    const articleTitle = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      || cleanText(document.title)
    presenceData.details = 'Leyendo Novedades'
    presenceData.state = articleTitle ? articleTitle.slice(0, 60) : 'Blog de Trucky'
    presenceData.smallImageKey = Assets.Reading
  }
  else {
    const pageHeading = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      || cleanText(document.title)
    presenceData.details = 'Explorando Trucky'
    presenceData.state = pageHeading ? pageHeading.slice(0, 60) : 'The Virtual Trucker Companion'
  }

  if (buttons) {
    presenceData.buttons = [
      { label: 'Visitar Página', url: href },
      { label: 'Obtener Trucky', url: 'https://truckyapp.com/' },
    ]
  }

  presence.setActivity(presenceData)
})
