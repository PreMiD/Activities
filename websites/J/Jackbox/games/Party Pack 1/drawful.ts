export const name = 'Drawful'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/0.png'

export function getPresenceData(): PresenceData {
  const currentGamePage = document.querySelector<HTMLDivElement>(
    '.drawful-page:not(.pt-page-off)',
  )!
  const { classList, id } = currentGamePage
  switch (true) {
    case classList.contains('state-lobby'): {
      return { state: 'Waiting in lobby' }
    }
    case classList.contains('state-lyingdone'):
    case classList.contains('state-nothing'):
    case classList.contains('state-drawing-done'): {
      return { state: 'Waiting' }
    }
    case classList.contains('state-round'): {
      return { state: currentGamePage.querySelector('span')?.textContent }
    }
    case classList.contains('state-drawing-sent'): {
      return { state: 'Waiting for other players to finish drawing' }
    }
    case classList.contains('state-enterlie'): {
      return { state: 'Entering a lie' }
    }
    case classList.contains('state-chooselie'): {
      return { state: 'Looking for the truth' }
    }
    case classList.contains('state-chooselikes'): {
      return { state: 'Liking lies' }
    }
    case classList.contains('state-liereceived'): {
      return { state: 'Waiting for other players to enter lies' }
    }
    case classList.contains('state-notchoosing'): {
      return { state: 'Waiting for other players to discover the truth' }
    }
    case classList.contains('state-draw'): {
      return { state: 'Drawing something' }
    }
    case classList.contains('state-audience-choose'): {
      return { state: 'Choosing a lie' }
    }
    case id === 'state-ugc': {
      return { state: 'Creating a custom game' }
    }
    case classList.contains('state-audience'): {
      return { state: 'In the audience' }
    }
    default: {
      return {}
    }
  }
}
