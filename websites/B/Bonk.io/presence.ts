const presence = new Presence({
  clientId: '778092541836656712',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/Bonk.io/assets/logo.png',
  Arrows = 'https://cdn.rcd.gg/PreMiD/websites/B/Bonk.io/assets/0.png',
  Arrows2 = 'https://cdn.rcd.gg/PreMiD/websites/B/Bonk.io/assets/1.png',
  Classic = 'https://cdn.rcd.gg/PreMiD/websites/B/Bonk.io/assets/2.png',
  Grapple = 'https://cdn.rcd.gg/PreMiD/websites/B/Bonk.io/assets/3.png',
}
const modePair: { [key: string]: string } = {
  'Arrows': ActivityAssets.Arrows,
  'Death Arrows': ActivityAssets.Arrows2,
  'Grapple': ActivityAssets.Grapple,
}

interface IFrameData {
  lastGameMode?: string
  id?: string
  state: string
  playerCount: number
}

let gameStartTimestamp: number | null = null
let ifd: IFrameData | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  if (ifd?.id) {
    presenceData.state = ifd.state
    switch (ifd.id) {
      case 'guestOrAccountContainer':
      case 'guestContainer':
      case 'accountContainer':
      case 'autoLoginContainer':
        presenceData.details = 'Logging In'
        delete presenceData.state
        break
      case 'classic_mid':
        presenceData.details = 'Main Menu'
        break
      case 'friendsContainer':
        presenceData.details = 'Friends List'
        break
      case 'skinmanager':
        presenceData.details = 'Skin Manager'
        break
      case 'skineditorcontainer':
        presenceData.details = 'Editing a skin'
        break
      case 'quickPlayWindow':
        presenceData.details = 'Quick Play Menu'
        break
      case 'roomListContainer':
        presenceData.details = 'Viewing Room List'
        break
      case 'newbonklobby':
        presenceData.details = `In a lobby - ${ifd.lastGameMode} (${
          ifd.playerCount
        } player${ifd.playerCount === 1 ? '' : 's'})`
        presenceData.smallImageKey = modePair[ifd.lastGameMode ?? ''] || ActivityAssets.Classic
        presenceData.smallImageText = ifd.lastGameMode
        break
      case 'mapeditorcontainer':
        presenceData.details = 'Editing a map'
        break
      case 'sm_connectingContainer':
        presenceData.details = 'Connecting to a game...'
        break
      case 'gamerenderer':
        presenceData.details = 'In Game'
        if (ifd.lastGameMode) {
          presenceData.details += ` - ${ifd.lastGameMode}`
          presenceData.smallImageKey = modePair[ifd.lastGameMode] || ActivityAssets.Classic
          presenceData.smallImageText = ifd.lastGameMode
        }
        break
    }

    if (ifd.id === 'gamerenderer' && !gameStartTimestamp)
      gameStartTimestamp = Date.now()
    else if (ifd.id !== 'gamerenderer')
      gameStartTimestamp = null

    if (gameStartTimestamp)
      presenceData.startTimestamp = gameStartTimestamp
  }

  if (!(await presence.getSetting<boolean>('showName')))
    delete presenceData.state

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})

presence.on('iFrameData', (data: unknown) => {
  ifd = data as IFrameData
})
