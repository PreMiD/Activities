const presence = new Presence({
  clientId: '808664560936026122',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Skribbl.io/assets/logo.png',
  Avatar = 'https://cdn.rcd.gg/PreMiD/websites/S/Skribbl.io/assets/0.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      buttonJoinGame: 'skribbl.io.buttonJoinGame',
      viewHome: 'general.viewHome',
    },

  )
}

function getInviteLink() {
  return document.querySelector<HTMLInputElement>('#input-invite')?.value
}

function getCurrentPlayer() {
  const playerNameElement = document.querySelector('.player-name.me')
  const playerElement = playerNameElement?.closest('.player')

  return {
    element: playerElement,
    name: playerNameElement?.textContent?.substring(
      0,
      playerNameElement.textContent.length - 6,
    ),
    rank: +(playerElement
      ?.querySelector('.player-rank')
      ?.textContent
      ?.match(/\d+/)?.[0] ?? 0),
    score: +(playerElement
      ?.querySelector('.player-score')
      ?.textContent
      ?.match(/\d+/)?.[0] ?? 0),
  }
}

function isUserDrawer() {
  return getDrawer() === getCurrentPlayer().element
}

function getDrawer() {
  return document
    .querySelector(
      '.player-avatar-container .drawing:not([style*=\'display: none\'])',
    )
    ?.closest('.player')
}

function getTimeRemaining() {
  return +(document.querySelector('#game-clock')?.textContent ?? 0)
}

function isInGame() {
  const gameElement = document.querySelector<HTMLElement>('#game')
  if (!gameElement)
    return false
  return gameElement.style.display !== 'none'
}

function getCurrentWord() {
  return [...document.querySelectorAll('#game-word .hints [class*=\'hint\']')]
    .map(e => e.textContent)
    .join('')
}

function getRevealedWord() {
  return document.querySelector('.reveal .word')?.textContent
}

function getGameRound() {
  return document.querySelector('#game-round')?.textContent
}

function getGameWinner() {
  return document.querySelector('.podest-1 .rank-name')?.textContent
}

enum GamePhase {
  WaitingForDrawer,
  ChoosingWord,
  RevealAnswer,
  GameResults,
  PrivateRoom,
  Gameplay,
}

function getGamePhase() {
  if (document.querySelector('.overlay.show')) {
    if (document.querySelector('.room.show'))
      return GamePhase.PrivateRoom
    if (document.querySelector('.words.show'))
      return GamePhase.ChoosingWord
  }
  if (document.querySelector('.reveal.show'))
    return GamePhase.RevealAnswer
  if (document.querySelector('.result.show'))
    return GamePhase.GameResults
  if (document.querySelector('#game-word .description.waiting'))
    return GamePhase.WaitingForDrawer
  return GamePhase.Gameplay
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const buttons = await presence.getSetting<boolean>('buttons')
  const newLang = await presence.getSetting<string>('lang').catch(() => 'en')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (isInGame()) {
    const currentPlayer = getCurrentPlayer()
    if (buttons) {
      presenceData.buttons = [
        {
          label: strings.buttonJoinGame,
          url: getInviteLink() ?? '',
        },
      ]
    }
    switch (getGamePhase()) {
      case GamePhase.WaitingForDrawer:
        presenceData.details = 'Waiting for drawer to choose a word'
        break
      case GamePhase.ChoosingWord:
        presenceData.details = 'Choosing a word'
        break
      case GamePhase.RevealAnswer:
        presenceData.details = 'Viewing the answer'
        presenceData.state = `The word was ${getRevealedWord()}`
        break
      case GamePhase.GameResults:
        presenceData.details = 'Viewing game results'
        presenceData.state = `Winner: ${getGameWinner()}`
        break
      case GamePhase.PrivateRoom:
        presenceData.details = 'Setting up a private room'
        break
      case GamePhase.Gameplay: {
        if (isUserDrawer()) {
          presenceData.details = 'Drawing'
        }
        else {
          const currentWord = getCurrentWord()
          presenceData.details = 'Guessing the word'
          if (/_/.test(currentWord))
            presenceData.state = `Current word: ${currentWord}`
        }
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(0, getTimeRemaining())
        break
      }
    }
    presenceData.details += ` - ${getGameRound()}`
    presenceData.smallImageKey = ActivityAssets.Avatar
    presenceData.smallImageText = `Rank: ${currentPlayer.rank} | Score: ${currentPlayer.score} | Name: ${currentPlayer.name}`.substring(
      0,
      127,
    )
  }
  else {
    presenceData.details = strings.viewHome
  }
  presence.setActivity(presenceData)
})
