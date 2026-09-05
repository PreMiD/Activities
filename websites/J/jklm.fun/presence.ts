import { ActivityType } from 'premid'
import { getCurrentPlayerData, updatePlayerName } from './data/currentPlayer.js'
import { getRoomData } from './data/room.js'
import { GameType } from './data/types.js'

const presence = new Presence({
  clientId: '1530703509702574252',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let iFrameData: {
  gameType?: GameType
  game?: {
    currentPrompt?: string
  }
  rules?: {
    dictionary?: string
    maxPlayers?: number
    difficulty?: string
    lives?: number
  }
} = {}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/J/jklm.fun/assets/logo.png',
  BombPartySmallLogo = 'https://cdn.rcd.gg/PreMiD/websites/J/jklm.fun/assets/0.png',
  PopSauceSmallLogo = 'https://cdn.rcd.gg/PreMiD/websites/J/jklm.fun/assets/1.png',
}

interface GameSpecificPresenceDataProps {
  roomdata: { code: string | null, players: number | null, isPrivateRoom: boolean }
  playerdata: { name: string | null, lifeDiff?: number | null, dead?: boolean, isInRound: boolean, points?: number | null }
}

interface GameSpecificPresenceData {
  smallImageKey?: string
  smallImageText?: string
  details: string
  state?: string
}

// Builds game-specific presence data based on the current game and player state
function buildGameSpecificPresenceData(props: GameSpecificPresenceDataProps): GameSpecificPresenceData {
  const { roomdata, playerdata } = props
  const { isInRound, dead, lifeDiff, points, name } = playerdata

  switch (iFrameData.gameType) {
    case GameType.BombParty:
    {
      const lives = (lifeDiff ?? 0) + (iFrameData.rules?.lives ?? 0)
      const prompt = iFrameData.game?.currentPrompt?.toLocaleUpperCase() || 'N/A'
      let state = `Prompt: ${prompt} `
      if (isInRound && !dead) {
        state += `| ❤️: ${lives} / ${iFrameData.rules?.lives || 'N/A'}`
      }
      else if (dead) {
        state += '| Dead'
      }
      else {
        state += '| Spectating'
      }

      let details = `${iFrameData.gameType}`

      if (iFrameData.rules?.dictionary && iFrameData.rules?.difficulty) {
        details += ` (${iFrameData.rules.dictionary}, ${iFrameData.rules.difficulty})`
      }

      return {
        smallImageKey: ActivityAssets.BombPartySmallLogo,
        smallImageText: `Name: ${name || 'N/A'} | In Lobby: ${roomdata.players || 0}`,
        details,
        state,
      }
    }
    case GameType.PopSauce:
    {
      let details = `${iFrameData.gameType}`

      if (iFrameData.rules?.dictionary && iFrameData.rules?.difficulty) {
        details += ` (${iFrameData.rules.dictionary}, ${iFrameData.rules.difficulty} points)`
      }

      let state = ''

      if (isInRound) {
        state = `${points ?? 0} / ${iFrameData.rules?.difficulty || 'N/A'} points`
      }
      else {
        state = 'Spectating'
      }

      return {
        smallImageKey: ActivityAssets.PopSauceSmallLogo,
        smallImageText: `Name: ${name || 'N/A'} | In Lobby: ${roomdata.players || 0}`,
        details,
        state,
      }
    }
    default:
      return {
        details: `Playing on jklm.fun`,
      }
  }
}

async function buildPresenceData() {
  // Fetch Presence Settings
  const [showButtons, showTimestamp, showParty] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showParty'),
  ])

  // Room and player data are not inside the Iframe, we collect them here
  const [roomdata, playerdata] = [
    getRoomData(iFrameData.gameType ?? GameType.None),
    getCurrentPlayerData(iFrameData.gameType ?? GameType.None),
  ]

  const { code, players, isPrivateRoom, activePlayers } = roomdata

  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: ActivityAssets.Logo,
  }

  // Build game-specific State, Details, SmallImageKey, and SmallImageText
  const gamePresence = buildGameSpecificPresenceData({ roomdata, playerdata })

  // Without roomcodes or player numbers,
  // theres no point in showing either data
  if (code && players && !isPrivateRoom) {
    if (showParty) {
      presenceData.party = {
        partyId: code,
        partySize: activePlayers || 0,
        maxPartySize: iFrameData.rules?.maxPlayers || 16,
      }
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Join',
          url: `https://jklm.fun/${code || ''}`,
        },
      ]
    }
  }

  if (showTimestamp) {
    presenceData.startTimestamp = browsingTimestamp
  }

  presenceData.state = gamePresence.state
  presenceData.smallImageKey = gamePresence.smallImageKey
  presenceData.smallImageText = gamePresence.smallImageText
  presenceData.details = gamePresence.details || 'Playing on jklm.fun'

  return presenceData
}

presence.on('iFrameData', (data: typeof iFrameData) => {
  if (data.rules && data.game && data.gameType) {
    iFrameData = data
  }
  else {
    iFrameData = {}
  }
})

presence.on('UpdateData', async () => {
  updatePlayerName()

  const presenceData = await buildPresenceData()

  presence.setActivity(presenceData)
})
