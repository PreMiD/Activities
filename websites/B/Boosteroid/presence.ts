const presence = new Presence({
  clientId: '1358341885772562553',
})

const BOOSTEROID_LOGO = 'https://i.imgur.com/fWwYdQR.png'

const PLATFORM_ICONS: Record<string, string> = {
  'steam': 'https://i.imgur.com/Awri5FL.png',
  'xbox': 'https://i.imgur.com/vNefzIj.png',
  'rockstar-games': 'https://i.imgur.com/eJkcT1L.png',
  'epic': 'https://i.imgur.com/ihqSLsY.png', // Añadido para compatibilidad
  'epic-games-store': 'https://i.imgur.com/ihqSLsY.png',
  'wargamingnet': 'https://i.imgur.com/B7Xp3AW.png',
  'battlenet': 'https://i.imgur.com/Cx0Mo8j.png',
  'battle-net': 'https://i.imgur.com/Cx0Mo8j.png',
  'uplay': 'https://i.imgur.com/sweQUqZ.png',
  'ubisoft-connect': 'https://i.imgur.com/sweQUqZ.png',
  'origin': 'https://i.imgur.com/HXOOS65.png',
  'ea-app': 'https://i.imgur.com/HXOOS65.png',
  'fanatical': 'https://i.imgur.com/Awri5FL.png',
  'default': BOOSTEROID_LOGO,
}

function getTimestamp(gameId: string | number): number {
  const savedTime = sessionStorage.getItem('premid_timestamp')
  const savedGame = sessionStorage.getItem('premid_last_game')

  if (savedGame === String(gameId) && savedTime) {
    return Number(savedTime)
  }

  const now = Date.now()
  sessionStorage.setItem('premid_timestamp', String(now))
  sessionStorage.setItem('premid_last_game', String(gameId))
  return now
}

presence.on('UpdateData', async () => {
  const { href, pathname } = document.location
  const appId = localStorage.getItem('appId') ?? pathname.split('/').pop()

  if (href.includes('/dashboard')) {
    sessionStorage.removeItem('premid_timestamp')
    sessionStorage.removeItem('premid_last_game')
    sessionStorage.removeItem('premid_cached_game')
    sessionStorage.removeItem('premid_cached_id')

    presence.setActivity({
      details: 'Main Page',
      state: 'Browsing Games',
      largeImageKey: BOOSTEROID_LOGO,
    })
    return
  }

  if (href.includes('/streaming/') && appId && appId !== 'null') {
    try {
      let game: any = null
      const cachedId = sessionStorage.getItem('premid_cached_id')
      const cachedData = sessionStorage.getItem('premid_cached_game')

      if (cachedId === appId && cachedData) {
        game = JSON.parse(cachedData)
      } else {
        const response = await fetch(`https://cloud.boosteroid.com/api/v1/boostore/applications/${appId}`)
        const result = await response.json()
        game = result?.data

        if (game) {
          sessionStorage.setItem('premid_cached_id', appId)
          sessionStorage.setItem('premid_cached_game', JSON.stringify(game))
        }
      }

      // ESLint Fix: Bloque con llaves y salto de línea
      if (!game) {
        return
      }

      const imagenFinal = typeof game.icon === 'string' ? game.icon.split('?')[0] : BOOSTEROID_LOGO
      const tiendas = game.stores ? Object.keys(game.stores) : []
      let rawStore = 'default'

      // Prioridad: 1. Nombre con (Xbox) | 2. Steam | 3. Primera tienda disponible
      if (game.name.includes('(Xbox)')) {
        rawStore = 'xbox'
      } else if (tiendas.includes('steam')) {
        rawStore = 'steam'
      } else if (tiendas.length > 0 && tiendas[0]) {
        rawStore = tiendas[0]
      }

      let nombreTienda: string
      switch (rawStore) {
        case 'xbox':
          nombreTienda = 'Xbox'
          break
        case 'steam':
          nombreTienda = 'Steam'
          break
        case 'fanatical':
          nombreTienda = 'Fanatical (Steam)'
          break
        case 'battlenet':
        case 'battle-net':
          nombreTienda = 'Battle.net'
          break
        case 'uplay':
        case 'ubisoft-connect':
          nombreTienda = 'Ubisoft Connect'
          break
        case 'origin':
        case 'ea-app':
          nombreTienda = 'EA App'
          break
        case 'epic':
        case 'epic-games-store':
          nombreTienda = 'Epic Games Store'
          break
        default:
          nombreTienda = rawStore.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      }

      const iconoPequeno = PLATFORM_ICONS[rawStore] ?? PLATFORM_ICONS.default

      presence.setActivity({
        details: 'Playing',
        state: game.name,
        largeImageKey: imagenFinal,
        largeImageText: game.name,
        smallImageKey: iconoPequeno,
        smallImageText: nombreTienda,
        startTimestamp: getTimestamp(appId),
        type: 0,
      })
    } catch {
      const backupData = sessionStorage.getItem('premid_cached_game')
      if (backupData) {
        const game = JSON.parse(backupData)
        presence.setActivity({
          details: 'Playing',
          state: game.name,
          largeImageKey: game.icon?.split('?')[0] ?? BOOSTEROID_LOGO,
          startTimestamp: getTimestamp(appId),
          type: 0,
        })
      } else {
        presence.clearActivity()
      }
    }
  } else {
    presence.clearActivity()
  }
})