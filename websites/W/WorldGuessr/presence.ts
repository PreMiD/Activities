const presence = new Presence({
  clientId: '1523354893841072229',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    playingSingleplayer: 'playingSingleplayer',
    playingMultiplayer: 'playingMultiplayer',
    browsingHome: 'general.viewHome',
  })

  const presenceData = {
    largeImageKey: 'https://i.imgur.com/s6GY1qt.png',
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = document.location

  if (pathname === '/' || pathname === '/index.html') {
    presenceData.details = strings.browsingHome
  } 
  else if (pathname.startsWith('/room/')) {
    const roomId = pathname.split('/room/')[1] || ''
    presenceData.details = strings.playingMultiplayer
    presenceData.state = `Sala: ${roomId}`
  } 
  else if (pathname.startsWith('/game') || pathname.startsWith('/play')) {
    presenceData.details = strings.playingSingleplayer
  } 
  else {
    presenceData.details = strings.browsingHome
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  } else {
    presence.clearActivity()
  }
})
