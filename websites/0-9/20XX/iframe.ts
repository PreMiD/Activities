const iframe = new iFrame()

interface Window20XX {
  main?: Main20XX
}

interface Main20XX {
  game?: {
    map: Map20XX
    charSelect: string
    gameOver: boolean
    settings: {
      gametype: string
      maxplayers: number
      name: string
      objective: number
      scoreToWin: number
      teams: number
    }
    ui: {
      score: {
        scores: Score20XX[]
      }
    }
  }
  stats?: {
    rank: number
  }
  net: {
    guest?: boolean
    type?: number
    user?: string
    display?: string
    game: {
      info?: {
        name: string
        location: string
        description: string
      }
    }
  }
  menu: {
    lastNav: string
  }
}

interface Map20XX {
  size: {
    x: number
    y: number
  }
  spawns: Spawn20XX[]
  doodads: Dooads[]
}

interface Dooads {
  name: string
}

interface Score20XX {
  death: number
  kill: number
  name: string
  objective: number
  team: number
}

interface Spawn20XX {
  type: string
  pos: {
    x: number
    y: number
  }
}

// Since maps don't have IDs in the game object, we can infer
// what map is being played by it's data.

interface ItemMap {
  [key: string]: string
}

const guessKeys: ItemMap = {
  // 'xBound:yBound:camPosX:camPosY:spawnCount:doodadCount': 'mapID'
  '32:32:11:15.75:24:36': 'attack',
  '32:32:15.5:15.5:29:88': 'combat',
  '24:48:11.5:23.5:43:106': 'battle',
  '48:48:23:22:62:337': 'big',
  '32:32:15.5:15.5:39:78': 'final',
  '32:32:14.5:5.5:44:84': 'area',
  '32:32:n:48:49': 'location',
  '32:32:15:15:56:66': 'position',
  '32:32:15.5:15.5:39:57': 'point',
  '48:28:23.5:13.5:55:160': 'platform',
  '32:32:15.5:15.5:58:57': 'vector',
  '32:32:n:33:163': 'dig',
  '48:48:23.5:23.5:44:101': 'war',
  '32:32:15.5:15.25:46:72': 'unearth',
  '48:48:23:23:46:492': 'excavate',
}

// Guesses the map via the map object
function guessMap(map: Map20XX): string | null {
  const camera = map.spawns.find((spawn: Spawn20XX) => spawn.type === 'camera')
  const guessKey = `${map.size.x}:${map.size.y}:${
    camera ? `${camera.pos.x}:${camera.pos.y}` : 'n'
  }:${map.spawns.length}:${map.doodads.length}`
  return guessKeys[guessKey] || null
}

iframe.on('UpdateData', async () => {
  const { main } = window as Window20XX
  if (!main)
    return

  iframe.send({
    user: main.net.user
      ? {
          displayName: main.net.display,
          isGuest: main.net.guest,
          username: main.net.user,
          isDonator: main.net.type === 1,
          rank: main.stats ? main.stats.rank : null,
        }
      : null,
    serverInfo: main.net.game.info || null,
    game: main.game
      ? {
          character: main.game.charSelect,
          gameOver: main.game.gameOver,
          info: {
            ...main.game.settings,
            players: main.game.ui.score.scores.length,
          },
          score: main.game.ui.score.scores.find(
            (score: Score20XX) =>
              score.name.replace('γ', '') === main.net.display,
          ),
          map: guessMap(main.game.map),
        }
      : null,
    nav: main.menu.lastNav,
  })
})
