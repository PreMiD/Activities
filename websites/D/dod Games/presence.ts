import { Assets } from 'premid'

const presence = new Presence({
  clientId: '937393073539911730',
})

let isInGame = false
let timeStarted = Date.now()

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/dod%20Games/assets/logo.png',
  }
  const playerName = document.querySelector(
    '#component_top_right_loginasname_text',
  )?.textContent
  const urls = document.querySelectorAll('#topBarDownLink')
  const supportedGames: string[] = ['drawit', 'quiz', 'agonia', 'tichu']
  let openRooms = 0

  function addJoinRoomButton(roomURL: string) {
    presenceData.buttons = [
      {
        label: 'Είσοδος',
        url: roomURL,
      },
    ]
  }

  function parseGameData(game: string, roomURL?: string) {
    if (!isInGame) {
      timeStarted = Date.now()
      isInGame = true
    }

    switch (game) {
      case 'drawit': {
        const scores = document.querySelectorAll('#playersContainer .player')
        for (let i = 0; i < scores.length; i++) {
          if (scores[i]!.querySelector('.name')?.textContent === playerName) {
            if (
              document.querySelector<HTMLDivElement>('#drawtools')?.style.display !== 'none'
            ) {
              presenceData.smallImageKey = Assets.Writing
              presenceData.smallImageText = 'Ζωγραφίζει'
            }

            presenceData.state = `Σκορ: ${
              scores[i]!.querySelector('.score')?.textContent
            } | Γύρος: ${document
              .querySelector('#round b')
              ?.textContent
              ?.replaceAll(' ', '')} | Θέση #${
              Number.parseInt(scores[i]!.getAttribute('index') ?? '0') + 1
            }/${scores.length}`
          }
        }
        if (scores.length < 10 && roomURL)
          addJoinRoomButton(roomURL)

        presenceData.details = 'Παίζει Ζωγράφισέ Το'
        presenceData.startTimestamp = timeStarted
        break
      }

      case 'quiz': {
        const scores = document.querySelectorAll(
          '#playersContainer .numberAndPlayerContainer',
        )
        for (let i = 0; i < scores.length; i++) {
          if (
            scores[i]!.querySelector('.quiz_playerName')?.textContent
            === playerName
          ) {
            presenceData.state = `Σκορ: ${
              scores[i]!.querySelector('.quiz_playerPoints')?.textContent
            } | Γύρος: ${
              Number.parseInt(document.querySelector('#countRound')?.textContent ?? '0') || '–'
            } | Θέση #${Number.parseInt(
              scores[i]!.querySelector('.quiz_playerNumber')?.textContent ?? '0',
            )}/${scores.length}`
          }
        }
        if (roomURL)
          addJoinRoomButton(roomURL)

        presenceData.details = 'Παίζει Κουίζ'
        presenceData.startTimestamp = timeStarted
        break
      }

      case 'agonia': {
        const nPlayers = Number.parseInt(
          document.querySelector('#agonia_content')?.className.match(/\d+/g)?.[0] ?? '0',
        )
        const playerClassNames = [
          'agonia_player1',
          'agonia_player2',
          'agonia_player3',
          'agonia_player4',
        ]
        const state: { [key: string]: AgoniaPlayerState } = {}
        for (const playerClassName of playerClassNames) {
          const player = document.querySelector(`#${playerClassName}`)
          if (player) {
            const playerName = player.querySelector('.gnh_name')?.textContent
            if (playerName) {
              state[playerName] = {
                score: player.querySelector('.gnh_score_text')?.textContent ?? '0',
                winner: false,
              }
            }
          }
        }

        const gameOverVisible = document.querySelector('#gameover_content')?.parentElement?.style.display !== 'none'
        if (gameOverVisible) {
          const gameOverClassNames = [
            'gameover_user1',
            'gameover_user2',
            'gameover_user3',
            'gameover_user4',
          ]
          for (const gameOverClassName of gameOverClassNames) {
            const player = document.querySelector(`#${gameOverClassName}`)
            if (
              player
              && player.querySelector<HTMLDivElement>('.gameover_userphotowin')
                ?.style
                ?.display !== 'none'
            ) {
              const winnerName = player.getAttribute('shownname')!
              if (winnerName in state)
                state[winnerName]!.winner = true
            }
          }
        }
        let stateString = ''
        for (const key in state) {
          const value = state[key]
          stateString += `${value!.winner ? ' 🏆 ' : ''}${key}: ${
            value!.score
          } – `
        }
        if (Object.keys(state).length === nPlayers || gameOverVisible) {
          presenceData.state = stateString.substring(0, stateString.length - 3)
        }
        else {
          presenceData.state = `${
            Object.keys(state).length
          }/${nPlayers} παίκτες...`
          if (roomURL)
            addJoinRoomButton(roomURL)
        }
        presenceData.details = `Παίζει Αγωνία | 💪🏻 ${document
          .querySelector('.mytr')
          ?.getAttribute('elo') ?? '0'}`
        presenceData.startTimestamp = timeStarted
        break
      }

      case 'tichu': {
        const playerPositions = ['bottom', 'up', 'right', 'left']
        const teamPlayers: string[] = []
        const opPlayers: string[] = []
        const playerState: { [key: string]: TichuPlayerState } = {}
        for (const playerPos of playerPositions) {
          const playerName = document.querySelector(
            `#nickholder_${playerPos} .playerName`,
          )?.textContent
          if (playerName)
            playerState[playerPos] = { name: playerName, bet: '' }
        }

        for (const pos of ['up', 'left', 'right']) {
          if (!(pos in playerState))
            continue
          const betElement = document.querySelector<HTMLDivElement>(
            `#nickholder_${pos} #tichugrand`,
          )
          if (betElement?.style.display !== 'none')
            playerState[pos]!.bet = betElement!.className
        }

        let betElement = document.querySelector<HTMLDivElement>('#btnTichuToggle')
        if (betElement?.style.display !== 'none')
          playerState.bot!.bet = 'tichu'

        betElement = document.querySelector<HTMLDivElement>('#btnGrandToggle')
        if (betElement?.style.display !== 'none')
          playerState.bot!.bet = 'grand'

        for (const pos in playerState) {
          const player = playerState[pos];
          (['bottom', 'up'].includes(pos) ? teamPlayers : opPlayers).push(
            `${
              player!.bet === 'tichu' ? '🟠' : player!.bet === 'grand' ? '🔴' : ''
            }${player!.name}`,
          )
        }

        if (teamPlayers.length === 2 && opPlayers.length === 2) {
          presenceData.state = `(${teamPlayers[0]}, ${teamPlayers[1]}) ${
            document.querySelector('#txtMyTeamScore')?.textContent
          } – ${document.querySelector('#txtOpTeamScore')?.textContent} (${
            opPlayers[0]
          }, ${opPlayers[1]})`
        }
        else {
          presenceData.state = `${
            teamPlayers.length + opPlayers.length
          }/4 παίκτες...`
          if (roomURL)
            addJoinRoomButton(roomURL)
        }
        presenceData.details = `Παίζει Tichu | 💪🏻 ${document
          .querySelector('.mytr')
          ?.getAttribute('elo')}`
        presenceData.startTimestamp = timeStarted
        break
      }
    }
  }

  for (const url of urls) {
    if (url.textContent?.includes('&room='))
      openRooms++

    for (const game of supportedGames) {
      if (url.textContent?.includes(`game=${game}&room=`))
        parseGameData(game, url.textContent)
    }
  }

  if (!openRooms) {
    const lobbyTabs = document.querySelectorAll(
      '#windowLobbyTab2.windowLobbyTabSelected > .windowTabText > .dodlangspan',
    )

    for (const tab of lobbyTabs) {
      if (tab.textContent?.includes('Ζωγράφισε')) {
        openRooms++
        parseGameData('drawit')
      }
      else if (tab.textContent?.includes('Κουίζ')) {
        openRooms++
        parseGameData('quiz')
      }
      else if (tab.textContent?.includes('Αγωνία')) {
        openRooms++
        parseGameData('agonia')
      }
      else if (tab.textContent?.includes('Tichu')) {
        openRooms++
        parseGameData('tichu')
      }
    }
  }

  if (!openRooms)
    isInGame = false
  if (isInGame)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})

interface AgoniaPlayerState {
  score: string
  winner: boolean
}

interface TichuPlayerState {
  name: string
  bet: string
}
