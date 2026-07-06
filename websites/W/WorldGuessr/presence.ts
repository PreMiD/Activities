const presence = new Presence({
  clientId: '1523354893841072229',
})

let gameStartTime: number | null = null

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    playingSingleplayer: 'playingSingleplayer',
    playingMultiplayer: 'playingMultiplayer',
    playingDaily: 'playingDaily',
    browsingHome: 'browsingHome',
    inAMatch: 'inAMatch',
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
    presenceData.details = strings.browsingHome
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
