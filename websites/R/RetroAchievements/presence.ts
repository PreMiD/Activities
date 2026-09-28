import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1552201185539260436',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

// Mapa: ID numérico do sistema -> nome de exibição.
// Usa o ID (estável) em vez do slug de texto (que pode mudar de formatação)
const SYSTEM_NAMES: Record<number, string> = {
  7: 'NES/Famicom',
  81: 'Famicom Disk System',
  3: 'SNES/Super Famicom',
  2: 'Nintendo 64',
  16: 'GameCube',
  19: 'Wii',
  4: 'Game Boy',
  6: 'Game Boy Color',
  5: 'Game Boy Advance',
  18: 'Nintendo DS',
  78: 'Nintendo DSi',
  24: 'Pokémon Mini',
  28: 'Virtual Boy',
  12: 'PlayStation',
  21: 'PlayStation 2',
  41: 'PlayStation Portable',
  25: 'Atari 2600',
  51: 'Atari 7800',
  17: 'Atari Jaguar',
  77: 'Atari Jaguar CD',
  13: 'Atari Lynx',
  33: 'SG-1000',
  11: 'Master System',
  1: 'Genesis/Mega Drive',
  9: 'Sega CD',
  10: '32X',
  39: 'Saturn',
  40: 'Dreamcast',
  15: 'Game Gear',
  47: 'PC-8000/8800',
  8: 'PC Engine/TurboGrafx-16',
  76: 'PC Engine CD/TurboGrafx-CD',
  49: 'PC-FX',
  56: 'Neo Geo CD',
  14: 'Neo Geo Pocket',
  43: '3DO Interactive Multiplayer',
  37: 'Amstrad CPC',
  38: 'Apple II',
  27: 'Arcade',
  73: 'Arcadia 2001',
  71: 'Arduboy',
  44: 'ColecoVision',
  75: 'Elektor TV Games Computer',
  57: 'Fairchild Channel F',
  45: 'Intellivision',
  74: 'Interton VC 4000',
  23: 'Magnavox Odyssey 2',
  69: 'Mega Duck',
  29: 'MSX',
  102: 'Standalone',
  80: 'Uzebox',
  46: 'Vectrex',
  72: 'WASM-4',
  63: 'Watara Supervision',
  53: 'WonderSwan',
}

presence.on('UpdateData', async () => {
  const { pathname, search, href } = document.location
  const params = new URLSearchParams(search)

  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: 'https://i.imgur.com/52pY5VZ.png',
    startTimestamp: browsingTimestamp,
  }

  const systemMatch = pathname.match(/^\/system\/(\d+)-[^/]+\/games\/?$/)
  const userMatch = pathname.match(/^\/user\/([^/]+)\/?$/)
  const userProgressMatch = pathname.match(/^\/user\/([^/]+)\/progress\/?$/)
  const forumTopicMatch = pathname.match(/^\/forums\/topic\/[^/]+\/?$/)
  const gameMatch = pathname.match(/^\/game\/\d+\/?$/)

  if (systemMatch) {
    const systemId = Number(systemMatch[1])
    presenceData.details = 'Checking games list:'
    presenceData.state = SYSTEM_NAMES[systemId] ?? 'Unknown System'
  }
  else if (pathname === '/games' && params.get('sort') === 'beatRatio') {
    presenceData.details = 'Checking Hardest Games'
  }
  else if (pathname === '/games') {
    presenceData.details = 'Checking all games'
  }
  else if (pathname === '/games/requests') {
    presenceData.details = 'Checking Most Requested'
  }
  else if (pathname === '/claims/completed') {
    presenceData.details = 'Checking New Sets & Revisions'
  }
  else if (pathname === '/claims/active') {
    presenceData.details = 'Checking Sets in Progress'
  }
  else if (pathname === '/globalRanking.php') {
    presenceData.details = 'Checking Global Ranking'
  }
  else if (pathname === '/ranking/beaten-games') {
    presenceData.details = 'Checking:'
    presenceData.state = 'Beaten Games Leaderboard'
  }
  else if (pathname === '/downloads') {
    presenceData.details = 'Looking for RA-compatible emulators'
  }
  else if (pathname === '/forum.php') {
    presenceData.details = 'Browsing the forums'
  }
  else if (forumTopicMatch) {
    const titleEl = document.querySelector('h1')
    const title = titleEl?.textContent?.trim() ?? 'a topic'

    presenceData.details = 'Viewing forum topic:'
    presenceData.state = title
  }
  else if (userProgressMatch) {
    const username = userProgressMatch[1] ?? ''
    presenceData.details = `Viewing ${username}'s progress`
  }
  else if (userMatch) {
    const username = userMatch[1] ?? ''
    const avatarEl = document.querySelector<HTMLImageElement>('img[alt*="avatar"]')

    // Pontos casuais: acha o <p> cujo primeiro span (com espaços/quebras de linha
    // estranhas no HTML original) vira "Casual Points:" depois de normalizado
    const casualPointsContainer = Array.from(document.querySelectorAll('p')).find(
      p => p.querySelector('span')?.textContent?.replace(/\s+/g, ' ').trim() === 'Casual Points:',
    )
    const casualPoints = casualPointsContainer?.querySelectorAll('span')[1]?.textContent?.trim()

    // Points (modo hardcore) — só existe em quem tem alguma platina hardcore
    const hardcorePointsContainer = Array.from(document.querySelectorAll('p')).find(
      p => p.querySelector('span')?.textContent?.replace(/\s+/g, ' ').trim() === 'Points:',
    )
    const hardcorePointsRaw = hardcorePointsContainer?.querySelectorAll('span')[1]?.textContent ?? ''
    const hardcorePoints = hardcorePointsRaw.split('(')[0]?.replace(/\s+/g, ' ').trim()

    // Quantidade de jogos platinados ("Game Awards")
    const gameAwardsHeading = Array.from(document.querySelectorAll('*')).find(
      el => el.children.length === 0 && el.textContent?.trim() === 'Game Awards',
    )
    const gameAwardsContainer = gameAwardsHeading?.closest('div')
    const gameAwardsCount = gameAwardsContainer?.querySelector('.numitems')?.textContent?.trim()

    presenceData.details = `Viewing ${username}'s profile`

    const stateParts: string[] = []
    if (casualPoints)
      stateParts.push(`Casual Points: ${casualPoints}`)
    if (hardcorePoints)
      stateParts.push(`Hardcore Points: ${hardcorePoints}`)
    if (gameAwardsCount)
      stateParts.push(`Platinum Games: ${gameAwardsCount}`)

    presenceData.state = stateParts.join(' | ') || undefined

    if (avatarEl?.src)
      presenceData.largeImageKey = avatarEl.src
  }
  else if (gameMatch) {
    // Título vem do document.title: "7th Dragon (Nintendo DS) · RetroAchievements"
    // Remove o sufixo do site, mantendo só "7th Dragon (Nintendo DS)"
    const gameTitle = document.title.replace(/\s*·\s*RetroAchievements\s*$/i, '').trim() || 'a game'

    const cover = document.querySelector<HTMLImageElement>('img[alt*="~"], img[width="96"][height="96"]')

    // Ex: "137 conquistas valendo 925 pontos(2.964 · ×3.20)" -> corta a partir do "("
    const statsRaw = document.querySelector('span.text-xs.text-text')?.textContent ?? ''
    const stats = statsRaw.split('(')[0]?.trim()

    presenceData.details = 'Viewing the game:'
    presenceData.state = gameTitle

    if (stats)
      presenceData.smallImageText = stats

    if (cover?.src)
      presenceData.largeImageKey = cover.src
  }
  else {
    presenceData.details = 'Browsing the site'
  }

  presenceData.buttons = [
    {
      label: 'View Page',
      url: href,
    },
  ]

  presence.setActivity(presenceData)
})
