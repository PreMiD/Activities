import type { GameCallbackParams } from '../../types.js'

export const name = 'Push the Button'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/24.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  switch (playerState.state) {
    case 'Lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'Logo': {
      return { state: 'Waiting' }
    }
    case 'SuspicionVote': {
      return { state: 'Voting on who seems suspicious' }
    }
    case 'Probe': {
      return { state: 'Probing their fellow players' }
    }
    case 'Draw': {
      return { state: 'In the Drawing Quarters' }
    }
    case 'AnalyzePlayer': {
      return { state: 'Using the bioscanner - describing glyphs' }
    }
    case 'AnalysisReport': {
      return { state: 'Using the bioscanner - reading report' }
    }
    case 'MakeSingleChoice': {
      const { choiceType, gameInfo, prompt } = playerState
      const { activeTest } = gameInfo as {
        activeTest: string
      }
      if (choiceType) {
        switch (choiceType) {
          case 'TutorialOptOut': {
            return { state: 'Choosing whether to skip the tutorial' }
          }
          case 'ConfirmedIdentity': {
            return { state: 'Confirming their identity' }
          }
        }
      }
      else if (activeTest) {
        if (activeTest === 'Push The Button')
          return { state: 'Accusing players' }
        else return { state: `Taking the ${activeTest} test` }
      }
      else {
        const html = prompt?.html
        if (
          html === 'You are the Captain.  What test would you like to perform?'
        )
          return { state: 'Choosing a test to perform' }
        else if (/^Select <strong>.*?<\/strong> to Test!$/.test(html ?? ''))
          return { state: 'Choosing players to test' }
      }
      break
    }
    case 'EnterSingleText': {
      const { activeTest } = playerState.gameInfo as {
        activeTest: string
      }
      if (activeTest)
        return { state: `Taking the ${activeTest} test` }
      break
    }
    case 'GameOver': {
      return { state: `Viewing results - ${playerState.winningRole}s won` }
    }
  }
  return {}
}
