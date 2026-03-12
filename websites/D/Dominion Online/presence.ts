const presence = new Presence({
  clientId: '849684658563055627',
})
const logRegex = /^.+ - \w+$/
const generalStartTime = Math.floor(Date.now() / 1000)
let lobbyStartTime: number, gameStartTime: number

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Dominion%20Online/assets/logo.jpg',
    startTimestamp: generalStartTime,
  }

  if (
    document.querySelector('.my-table')
    || document.querySelector('.score-page')
  ) {
    if (lobbyStartTime === 0)
      lobbyStartTime = Math.floor(Date.now() / 1000)
    gameStartTime = 0

    presenceData.details = `In Lobby: ${document
      .querySelector('.participant-list-label')
      ?.textContent
      ?.trim()}`
    presenceData.state = document.querySelector('.rules-editor')
      || document.querySelector('button[ng-click="$ctrl.editTable()"]')
      ? 'Host'
      : null
    presenceData.startTimestamp = lobbyStartTime
  }
  else if (document.querySelector('.game-page')) {
    if (gameStartTime === 0)
      gameStartTime = Math.floor(Date.now() / 1000)
    lobbyStartTime = 0

    const logs = document.querySelectorAll('.actual-log')

    // Find last turn log from end
    for (let i = logs.length - 1; i >= 0; i--) {
      if (!logs[i])
        continue

      const logText = logs[i]?.textContent?.trim()

      // Append turn
      if (logRegex.test(logText!)) {
        presenceData.state = logText
        break
      }
    }

    presenceData.details = `In Game (${
      document.querySelectorAll('.spec-list-line').length
    } Players)`
    presenceData.startTimestamp = gameStartTime
  }
  else if (
    document.querySelector('.login-page')
    || document.querySelector('.lobby-page')
  ) {
    gameStartTime = lobbyStartTime = 0
    presenceData.details = 'Main Menu'
  }
  else if (document.querySelector('.loading-spinner')) {
    gameStartTime = lobbyStartTime = 0
    presenceData.details = 'Loading...'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
