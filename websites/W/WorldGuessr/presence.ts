const presence = new Presence({
  clientId: '1523354893841072229',
})

let gameStartTime: number | null = null

presence.on('UpdateData', async () => {
  // Adicionamos a propriedade viewHome aqui dentro seguindo o padrão
  const strings = await presence.getStrings({
    playingSingleplayer: 'worldguessr.playingSingleplayer',
    playingMultiplayer: 'worldguessr.playingMultiplayer',
    playingDaily: 'worldguessr.playingDaily',
    inAMatch: 'worldguessr.inAMatch',
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
    largeImageKey: 'https://i.imgur.com/s6GY1qt.png',
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
    // Agora usamos a variável mapeada em vez do texto fixo
    presenceData.details = strings.viewHome
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
