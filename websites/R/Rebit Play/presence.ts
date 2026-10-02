const presence = new Presence({ clientId: '1555682643553820783' })
const logo = 'https://app.rebit.cc/icons/icon-512x512.png'

presence.on('UpdateData', async () => {
  const [showGameDetails, showButtons] = await Promise.all([
    presence.getSetting<boolean>('showGameDetails'),
    presence.getSetting<boolean>('showButtons'),
  ])
  const content = document.querySelector<HTMLMetaElement>('meta[name="rebit:presence"]')?.content
  if (!content) {
    presence.clearActivity()
    return
  }

  let game
  try {
    game = JSON.parse(content)
  }
  catch {
    presence.clearActivity()
    return
  }
  if (
    !game
    || game.version !== 1
    || typeof game.title !== 'string'
    || !game.title.trim()
    || typeof game.system !== 'string'
    || typeof game.multiplayer !== 'boolean'
    || !Number.isSafeInteger(game.startedAt)
    || game.startedAt <= 0
    || (game.status !== 'running' && game.status !== 'paused')
  ) {
    presence.clearActivity()
    return
  }

  const data: PresenceData = {
    type: 0,
    details: showGameDetails ? game.title.slice(0, 128) : 'Playing a game',
    state: game.status === 'paused' ? 'Paused' : game.multiplayer ? 'Multiplayer' : 'Single player',
    largeImageKey: logo,
  }
  if (showGameDetails) {
    data.state = [game.system, data.state].filter(Boolean).join(' · ').slice(0, 128)
    if (typeof game.artwork === 'string' && URL.canParse(game.artwork)) {
      const artwork = new URL(game.artwork)
      if (artwork.protocol === 'https:' && !artwork.username && !artwork.password) {
        for (const key of [...artwork.searchParams.keys()]) {
          if (key.toLowerCase().startsWith('utm_'))
            artwork.searchParams.delete(key)
        }
        data.largeImageKey = artwork.href
      }
    }
    if (showButtons && Number.isSafeInteger(game.gameId) && game.gameId > 0) {
      data.buttons = [{ label: 'View game', url: `https://app.rebit.cc/games/${game.gameId}` }]
    }
  }
  if (game.status === 'running')
    data.startTimestamp = game.startedAt
  presence.setActivity(data)
})
