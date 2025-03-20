export const name = 'Guesspionage'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/10.png'

export function getPresenceData(): PresenceData {
  const currentGamePage = document.querySelector<HTMLDivElement>(
    '.pollposition-page:not(.pt-page-off)',
  )!
  const { classList } = currentGamePage
  switch (true) {
    case classList.contains('state-lobby'): {
      return { state: 'Waiting in lobby' }
    }
    case classList.contains('state-post-lobby'): {
      return { state: 'Watching the tutorial' }
    }
    case classList.contains('state-nothing'): {
      return { state: 'Waiting' }
    }
    case classList.contains('state-round'): {
      return { state: currentGamePage.querySelector('p')?.textContent }
    }
    case classList.contains('state-upordowndone'):
    case classList.contains('state-waitforpercentage'):
    case classList.contains('state-waitforupordown'):
    case classList.contains('state-waitforaudience'):
    case classList.contains('state-upordown-sent'):
    case classList.contains('state-waitforallpercentages'): {
      return { state: 'Waiting for other players to decide' }
    }
    case classList.contains('state-choosecategory'): {
      return { state: 'Choosing a category' }
    }
    case classList.contains('state-waitforcategory'): {
      return { state: 'Waiting for a category to be chosen' }
    }
    case classList.contains('state-showquestion'): {
      return { state: 'Viewing a survey prompt' }
    }
    case classList.contains('state-chooseupordown'): {
      return { state: 'Deciding if the true percentage is higher or lower' }
    }
    case classList.contains('state-choosemultiple'): {
      return { state: 'Choosing multiple choices' }
    }
    case classList.contains('state-audience-choice-sent')
      || classList.contains('state-waitformultiple'): {
      return { state: 'Waiting for other players to choose their choices' }
    }
    case classList.contains('state-audience-wait'): {
      return { state: 'In the audience' }
    }
    case classList.contains('state-audience-chose-option'): {
      return { state: 'Choosing an option in the audience' }
    }
    case classList.contains('state-choosecharacter'): {
      return { state: 'Choosing a character' }
    }
    default: {
      return {}
    }
  }
}
