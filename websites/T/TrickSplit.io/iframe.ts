const iframe = new iFrame()

interface TrickSplitWindow {
  game?: {
    aliveTime: number
    lbPosition: number
    playerCells: Map<number, unknown>
  }
  menuHandler?: {
    gameMode: string
    loggedIn: boolean
    region: string
    selectedServer: string
  }
}

iframe.on('UpdateData', async () => {
  const ts = window as TrickSplitWindow
  if (!ts.game || !ts.menuHandler)
    return
  iframe.send({
    gameMode: ts.menuHandler.gameMode,
    region: ts.menuHandler.region,
    aliveTime: ts.game.aliveTime,
    pos: ts.game.lbPosition,
    cellCount: ts.game.playerCells.size,
    connected: !!ts.menuHandler.selectedServer,
  })
})
