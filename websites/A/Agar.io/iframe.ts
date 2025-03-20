const iframe = new iFrame()

interface AgarWindow {
  agarApp?: {
    home: {
      $options: {
        components: {
          Home: {
            components: {
              mainmenu: {
                components: {
                  play: {
                    computed: {
                      connecting: () => boolean
                    }
                  }
                }
              }
            }
            store: {
              getters: {
                gameMode: string
                gameState: number
                settings: {
                  lastNick: string
                }
              }
            }
          }
        }
      }
    }
  }
}

iframe.on('UpdateData', async () => {
  const agar = (window as AgarWindow).agarApp
  if (!agar)
    return

  iframe.send({
    state: agar.home.$options.components.Home.store.getters.gameState,
    gameMode: agar.home.$options.components.Home.store.getters.gameMode,
    nick: agar.home.$options.components.Home.store.getters.settings.lastNick,
    connecting: agar.home.$options.components.Home.components.mainmenu.components.play.computed.connecting(),
  })
})
