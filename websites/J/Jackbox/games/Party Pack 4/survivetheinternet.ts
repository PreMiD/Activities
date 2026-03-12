export const name = 'Survive the Internet'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/17.png'

export function getPresenceData(): PresenceData {
  const presenceData: PresenceData = {}
  const playerIcon = document.querySelector<HTMLDivElement>('#playericon')
  const currentGamePage = document.querySelector<HTMLDivElement>(
    '#playerRegion + div',
  )!
  const { classList, textContent } = currentGamePage
  if (playerIcon) {
    presenceData.smallImageKey = getComputedStyle(playerIcon).backgroundImage.match(/^url\("(.*)"\)$/)?.[1]
  }

  if (classList.contains('Lobby')) {
    presenceData.state = 'Waiting in lobby'
  }
  else if (classList.contains('Logo')) {
    presenceData.state = 'Waiting'
  }
  else if (classList.contains('MakeSingleChoice')) {
    if (/the tutorial\.\.\./.test(textContent ?? '')) {
      presenceData.state = 'Viewing the tutorial'
    }
    else if (
      /ridiculous\?$/.test(
        currentGamePage.querySelector<HTMLDivElement>('.aboveBlackBox')?.textContent ?? '',
      )
    ) {
      if (
        currentGamePage.querySelector<HTMLDivElement>('.makeSingleChoiceDone')
          ?.style
          .display === 'none'
      ) {
        presenceData.state = 'Voting for the most ridiculous answer'
      }
      else {
        presenceData.state = 'Waiting for other players to vote'
      }
    }
    else if (
      currentGamePage.querySelector<HTMLDivElement>('.aboveBlackBox')
        ?.textContent === ''
    ) {
      presenceData.state = 'Answering a photosharing prompt'
    }
  }
  else if (classList.contains('EnterSingleText')) {
    if (
      currentGamePage.querySelector<HTMLFormElement>('.enterSingleTextForm')
        ?.style
        .display === 'none'
    ) {
      presenceData.state = 'Waiting for other players to answer their prompts'
    }
    else if (
      currentGamePage.querySelector<HTMLDivElement>('.finalRoundImage')
      || currentGamePage.querySelector<HTMLDivElement>('.blackBox:not(.hide)')
    ) {
      presenceData.state = 'Twisting another player\'s response'
    }
    else {
      presenceData.state = 'Answering a prompt'
    }
  }
  return presenceData
}
