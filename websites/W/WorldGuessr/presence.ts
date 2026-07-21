const presence = new Presence({
  clientId: '1523354893841072229',
})

let gameStartTime: number | null = null

presence.on('UpdateData', async () => {
  // Atualizado para bater exatamente com as chaves minúsculas do WorldGuessr.json
  const strings = await presence.getStrings({
    playingSingleplayer: 'worldguessr.singleplayer',
    playingMultiplayer: 'worldguessr.multiplayer',
    playingDaily: 'worldguessr.daily',
    inAMatch: 'worldguessr.match',
    viewHome: 'general.viewHome',
  })

  const isPlaying = !!document.querySelector('.guessBtn')
  const isMultiplayer = !!document.querySelector('.emoteReactionsParent')
  const isDaily = document.location.href.includes('/daily')

  if (!isPlaying) {
    gameStartTime = null
  }
  else if (isPlaying && gameStartTime === null) {
    gameStartTime = Math.floor(Date.now() / 1000)
  }

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/WorldGuessr/assets/logo.png',
  }

  if (isPlaying) {
    if (isDaily) {
      presenceData.details = strings.playingDaily
    }
    else {
      presenceData.details = isMultiplayer ? strings.playingMultiplayer : strings.playingSingleplayer
    }
    presenceData.state = strings.inAMatch
    presenceData.startTimestamp = gameStartTime
  }
  else {
    presenceData.details = strings.viewHome
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
