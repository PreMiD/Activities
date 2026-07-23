enum ActivityAssets {
  Logo = 'https://chillbox.cc/premid/logo-512.png',
}

const presence = new Presence({
  clientId: '1524175002168066089',
})

interface CbPresence {
  v: 1
  page: 'home' | 'hub' | 'lobby' | 'match' | 'watch' | 'local' | 'other'
  gameId: string | null
  gameName: { ru: string, en: string } | null
  roomId: string | null
  phase: string | null
  players: number | null
  maxPlayers: number | null
  matchStartTs: number | null
  details: string | null
}

const STR = {
  ru: {
    home: 'В меню',
    hub: 'Выбирает комнату',
    lobby: 'В лобби',
    match: 'В игре',
    watch: 'Смотрит матч',
    local: 'Играет локально',
    other: 'На сайте',
    play: 'Играть на ChillBox',
    watchBtn: 'Смотреть матч',
  },
  en: {
    home: 'In the menu',
    hub: 'Browsing rooms',
    lobby: 'In a lobby',
    match: 'Playing',
    watch: 'Watching a match',
    local: 'Playing locally',
    other: 'On the site',
    play: 'Play on ChillBox',
    watchBtn: 'Watch match',
  },
}

// The site publishes live presence data into a DOM tag (kept in sync by the app itself).
function readTag(): CbPresence | null {
  try {
    const el = document.getElementById('chillbox-presence')
    return el?.textContent ? (JSON.parse(el.textContent) as CbPresence) : null
  }
  catch {
    return null
  }
}

presence.on('UpdateData', async () => {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ru'
  const s = STR[lang]
  const cb = readTag()
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  if (!cb || cb.page === 'other' || cb.page === 'home') {
    presenceData.details = s.home
    presence.setActivity(presenceData)
    return
  }
  const game = cb.gameName ? cb.gameName[lang] : null
  presenceData.details = game ? `${s[cb.page]}: ${game}` : s[cb.page]
  if (cb.details)
    presenceData.state = cb.details
  else if (cb.page === 'lobby' && cb.players != null && cb.maxPlayers != null)
    presenceData.state = `${cb.players}/${cb.maxPlayers}`
  if (cb.matchStartTs)
    presenceData.startTimestamp = Math.floor(cb.matchStartTs / 1000)
  const playButton: ButtonData = {
    label: s.play,
    url: cb.gameId ? `https://chillbox.cc/g/${cb.gameId}` : 'https://chillbox.cc/',
  }
  // Watch button ONLY when the user themselves is on /watch: since they are watching
  // via this link, the room is watchable; we never expose other people's rooms.
  if (cb.page === 'watch' && cb.gameId && cb.roomId) {
    presenceData.buttons = [
      playButton,
      {
        label: s.watchBtn,
        url: `https://chillbox.cc/g/${cb.gameId}/watch/${cb.roomId}`,
      },
    ]
  }
  else {
    presenceData.buttons = [playButton]
  }
  presence.setActivity(presenceData)
})
