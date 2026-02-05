import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1395486313251213494',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenFront.io/assets/logo.png',
}

let isInGame = false
let gameStartTimestamp: number | null = null
let injectionInitialized = false
let gameMap: string | null = null
let gameMode: string | null = null
let rankedType: string | null = null

function updatePresence() {
  const { pathname } = document.location
  const isGameUrl = pathname.toLowerCase().includes('/game/')

  if (!isGameUrl) {
    isInGame = false
    gameStartTimestamp = null
    gameMap = null
    gameMode = null
    rankedType = null

    presence.setActivity({
      largeImageKey: ActivityAssets.Logo,
      details: 'In the lobby',
    })
    return
  }

  if (isInGame && gameStartTimestamp !== null) {
    const details = ['In a game']
    if (gameMap)
      details.push(gameMap)
    if (gameMode)
      details.push(gameMode)
    if (rankedType)
      details.push(rankedType)

    presence.setActivity({
      largeImageKey: ActivityAssets.Logo,
      smallImageKey: Assets.Play,
      startTimestamp: gameStartTimestamp,
      details: details.join(' • '),
      buttons: [
        {
          label: 'View Game',
          url: document.location.href,
        },
      ],
    })
  }
  else {
    presence.setActivity({
      largeImageKey: ActivityAssets.Logo,
      smallImageKey: Assets.Search,
      details: 'Loading players...',
    })
  }
}

function injectScript() {
  if (injectionInitialized)
    return

  const script = document.createElement('script')
  script.textContent = `
    (function() {
      const OriginalWS = window.WebSocket;
      window.WebSocket = function(url, protocols) {
        const ws = new OriginalWS(url, protocols);
        ws.addEventListener('message', (event) => {
          setTimeout(() => {
            if (typeof url === 'string' && url.includes('openfront.io/w')) {
              window.postMessage({ type: 'OPENFRONT_WS_MESSAGE', data: event.data }, '*');
            }
          }, 0);
        });
        return ws;
      };
      window.WebSocket.prototype = OriginalWS.prototype;
      window.WebSocket.CONNECTING = OriginalWS.CONNECTING;
      window.WebSocket.OPEN = OriginalWS.OPEN;
      window.WebSocket.CLOSING = OriginalWS.CLOSING;
      window.WebSocket.CLOSED = OriginalWS.CLOSED;
    })();
  `
  ;(document.head || document.documentElement).appendChild(script)
  script.remove()
  injectionInitialized = true
}

window.addEventListener('message', (event) => {
  if (event.data?.type === 'OPENFRONT_WS_MESSAGE') {
    try {
      const parsed = JSON.parse(event.data.data)
      if (parsed.type === 'start' && parsed.gameStartInfo?.config) {
        gameMap = parsed.gameStartInfo.config.gameMap
        gameMode = parsed.gameStartInfo.config.gameMode
        rankedType = parsed.gameStartInfo.config.rankedType
        if (isInGame)
          updatePresence()
      }

      if (!isInGame && parsed.type === 'turn' && parsed.turn?.intents?.some((intent: any) => intent.type === 'attack')) {
        isInGame = true
        gameStartTimestamp = Math.floor(Date.now() / 1000)
        updatePresence()
      }
    }
    catch {}
  }
})

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const isGame = pathname.toLowerCase().includes('/game/')

  if (isGame)
    injectScript()

  updatePresence()
})
