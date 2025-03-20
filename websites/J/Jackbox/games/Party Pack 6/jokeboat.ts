import type { GameCallbackParams } from '../../types.js'

export const name = 'Joke Boat'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/23.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  const presenceData: PresenceData = {}
  const icon = document.querySelector<HTMLDivElement>('#playericon')
  if (icon) {
    presenceData.smallImageKey = getComputedStyle(icon).backgroundImage.match(/^url\("(.*)"\)$/)?.[1]
  }
  switch (playerState.state) {
    case 'Lobby': {
      presenceData.state = 'Waiting in lobby'
      break
    }
    case 'Logo': {
      presenceData.state = 'Waiting'
      break
    }
    case 'MakeSingleChoice': {
      const { choiceId } = playerState
      if (choiceId === 'ChooseCatchphrase')
        presenceData.state = 'Choosing a catchphrase'
      else if (choiceId?.startsWith('Skip'))
        presenceData.state = 'Watching a tutorial'
      else if (choiceId?.startsWith('ChooseSetup'))
        presenceData.state = 'Choosing a joke setup'
      else if (choiceId?.startsWith('ChooseTopic'))
        presenceData.state = 'Choosing a topic for the joke'
      else if (choiceId?.startsWith('ChooseAuthorReady'))
        presenceData.state = 'Choosing how to tell the joke'
      else if (choiceId === 'ChooseJoke')
        presenceData.state = 'Voting on a joke'
      else if (choiceId === 'ChoosePunchUpJoke')
        presenceData.state = 'Choosing a joke to one-up'
      break
    }
    case 'EnterSingleText': {
      const { entryId, placeholder } = playerState
      if (entryId?.startsWith('Topic'))
        presenceData.state = `Entering a topic (${placeholder})`
      else if (entryId?.startsWith('Punchline'))
        presenceData.state = 'Creating a punchline'
      else if (entryId === 'PunchedUpLine')
        presenceData.state = 'One-upping a joke'
      break
    }
  }
  return presenceData
}
