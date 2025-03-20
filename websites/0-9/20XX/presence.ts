const presence = new Presence({
  clientId: '719179907518693427',
})

const assets: Record<string, string> = {
  'char_box': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/0.png',
  'char_crt': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/1.png',
  'char_vox': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/2.png',
  'char_blk': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/3.png',
  'char_crg': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/4.png',
  'char_qua': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/5.png',
  'char_inf': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/6.png',
  'map_attack': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/7.png',
  'map_area': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/8.png',
  'map_combat': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/9.png',
  'map_point': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/10.png',
  'map_final': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/11.png',
  'map_vector': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/12.png',
  'map_location': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/13.png',
  'map_position': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/14.png',
  'map_dig': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/15.png',
  'map_battle': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/16.png',
  'map_war': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/17.png',
  'map_platform': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/18.png',
  'map_big': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/19.png',
  'map_excavate': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/20.png',
  'map_unearth': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/21.png',
  '20xx': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/22.png',
  'char_cub': 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/23.png',
}

interface Data20XX {
  user?: {
    displayName: string
    isGuest: boolean
    isDonator: boolean
    username: string
    rank?: number
  }
  serverInfo?: {
    name: string
    location: string
    description: string
  }
  game?: {
    character: string
    gameOver: boolean
    info: {
      gametype: string
      maxplayers: number
      players: number
      name: string
      objective: number
      scoreToWin: number
      teams: number
    }
    score: {
      death: number
      kill: number
      name: string
      objective: number
      team: number
    }
    map?: string
  }
  nav: string
}

let data20XX: Data20XX | null = null

interface ItemMap {
  [key: string]: string
}

// A map of character prefixes with their names.
const characterNameMap: ItemMap = {
  box: 'Box',
  crt: 'Crate',
  qua: 'Quad',
  vox: 'Voxel',
  blk: 'Block',
  crg: 'Cargo',
  inf: 'Plus',
  cub: 'Cube',
}
// A map of map IDs with their names.
const mapNameMap: ItemMap = {
  attack: 'Attack Area',
  battle: 'Battle Field',
  big: 'Big Place',
  area: '404',
  combat: 'Combat Zone',
  final: 'Final Destination',
  location: 'Last Location',
  platform: 'Penultimate Platform',
  point: 'Prerequisite Point',
  position: 'Primary Position',
  vector: 'Veritable Vector',
  war: 'War Ground',
  dig: 'Dig',
  unearth: 'Unearth',
  excavate: 'Excavate',
}

// The timestamp of the first time a game was detected.
let gameStartTimestamp: number | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/0-9/20XX/assets/logo.png',
  }

  if (data20XX) {
    switch (data20XX.nav) {
      case 'setgame':
        presenceData.details = 'Changing Game Settings'
        break
      case 'setgraphic':
        presenceData.details = 'Changing Graphic Settings'
        break
      case 'stat':
        presenceData.details = 'Looking at Player Stats'
        break
      case 'unlock':
        presenceData.details = 'Looking at Unlocks'
        break
      case 'lobby':
        presenceData.details = 'In Lobby Select'
        break
      default:
        presenceData.details = 'Main Menu'
    }

    if (data20XX.user) {
      presenceData.state = `${data20XX.user.displayName} (${
        data20XX.user.isGuest ? 'guest' : `rank ${data20XX.user.rank}`
      })`
      if (data20XX.serverInfo)
        presenceData.state += ` in ${data20XX.serverInfo.location}`
    }

    if (data20XX.game) {
      presenceData.details = `In-Game - ${data20XX.game.info.gametype} (${data20XX.game.info.players}/${data20XX.game.info.maxplayers})`

      gameStartTimestamp ??= Date.now()

      // Character
      presenceData.smallImageKey = assets[`char_${data20XX.game.character.split('_')[0]}`]
      presenceData.smallImageText = characterNameMap[data20XX.game.character.split('_')[0]!]

      // Map
      if (data20XX.game.map) {
        presenceData.largeImageKey = assets[`map_${data20XX.game.map}`]
        presenceData.smallImageText = `${mapNameMap[data20XX.game.map]} - ${
          presenceData.smallImageText
        }`
      }

      presenceData.startTimestamp = gameStartTimestamp
    }
    else {
      gameStartTimestamp = null
    }
  }
  else if (location.pathname.endsWith('/help.html')) {
    presenceData.details = 'Reading the Help Document'
  }
  else if (location.pathname.endsWith('/rules.html')) {
    presenceData.details = 'Reading the Rules'
  }
  else if (location.pathname.endsWith('/tos.html')) {
    presenceData.details = 'Reading the Terms of Service'
  }

  if (!(await presence.getSetting<boolean>('showName')))
    delete presenceData.state

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})

presence.on('iFrameData', (data: unknown) => {
  data20XX = data as Data20XX
})
