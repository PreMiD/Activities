const iframe = new iFrame()

interface MemePoliceWindow {
  presenceData?: PresenceData
}

iframe.on('UpdateData', async () => {
  const gameData = (window as MemePoliceWindow).presenceData
  if (gameData)
    iframe.send(gameData)
})
