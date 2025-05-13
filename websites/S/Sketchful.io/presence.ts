import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let lastImageTimestamp = 0
let lastImage = ''
function getCurrentImage() {
  if (Date.now() - lastImageTimestamp < 5000)
    return lastImage
  const canvas = document.querySelector<HTMLCanvasElement>('#canvas')
  const data = canvas?.toDataURL()
  if (!data)
    return lastImage
  lastImage = data
  lastImageTimestamp = Date.now()
  return data
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Sketchful.io',
    largeImageKey: 'https://i.imgur.com/ORnOKkS.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location

  if (pathname !== '/') {
    presenceData.details = 'Browsing'
    return presence.setActivity(presenceData)
  }

  const activeMainMenu
    = document.querySelector<HTMLAnchorElement>('[href^=\'#menu\'].active')?.href
      ?? href
  const activeTab = new URL(activeMainMenu).hash.slice(1)
  const gameContainer = document.querySelector<HTMLDivElement>('.game')

  if (gameContainer?.style.display === '') {
    const [useJoinButton, showDrawing] = await Promise.all([
      presence.getSetting<boolean>('useJoinButton'),
      presence.getSetting<boolean>('showDrawing'),
    ])
    const gameTimeLeft = Number(
      document.querySelector('#gameClock')?.textContent ?? '0',
    )
    const gameRound = document.querySelector('#gameRound')
    const gameContentContainer = document.querySelector('#gameSticky')
    const answer = gameContentContainer?.querySelector('.answer')
    const myCharacter = document
      .querySelector('.gameAvatarName[style*=teal]')
      ?.closest('li')
    const drawingCharacter = document
      .querySelector('.gameDrawing')
      ?.closest('li')

    presenceData.type = ActivityType.Competing
    presenceData.state = `Round ${gameRound?.textContent} | ${myCharacter?.querySelector('.gameAvatarRank')?.textContent} with ${myCharacter?.querySelector('.gameAvatarScore')?.textContent}`
    if (gameTimeLeft > 0) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(0, gameTimeLeft)
    }

    if (myCharacter === drawingCharacter) {
      if (gameContentContainer?.querySelector('b')) {
        presenceData.details = 'Choosing a word'
      }
      else {
        presenceData.details = 'Drawing'
        if (showDrawing) {
          presenceData.largeImageKey = getCurrentImage()
        }
      }
    }
    else if (answer) {
      presenceData.details = 'Guessing the word'
      presenceData.smallImageKey = Assets.Question
      presenceData.smallImageText = answer
      if (showDrawing) {
        presenceData.largeImageKey = getCurrentImage()
      }
    }
    else {
      presenceData.details = 'Waiting for players'
    }

    if (useJoinButton) {
      const url = document.querySelector<HTMLInputElement>('#roomInfoLink')?.value
      if (url) {
        presenceData.buttons = [{ label: 'Join Game', url: `https://${url}` }]
      }
    }
  }
  else {
    switch (activeTab) {
      case 'menuPlay': {
        presenceData.details = 'Preparing to Play'
        break
      }
      case 'menuLobbies': {
        presenceData.details = 'Browsing Lobbies'
        break
      }
      case 'menuLogin': {
        presenceData.details = 'Logging in'
        break
      }
      default: {
        presenceData.details = 'Browsing'
      }
    }
  }

  presence.setActivity(presenceData)
})
