export const name = 'Word Spud'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/2.png'

export function getPresenceData(): PresenceData {
  const { classList } = document.querySelector<HTMLDivElement>(
    '.wordspud-page:not(.pt-page-off)',
  )!
  switch (true) {
    case classList.contains('state-waiting'): {
      return { state: 'Waiting in lobby' }
    }
    case classList.contains('state-startbutton'): {
      return { state: 'Waiting for other players to join' }
    }
    case classList.contains('state-writing'): {
      return { state: 'Writing something' }
    }
    case classList.contains('state-vote'): {
      return { state: 'Voting on a word' }
    }
    case classList.contains('state-vote-wait'): {
      return { state: 'Being judged' }
    }
    case classList.contains('state-nothing'): {
      return { state: 'Waiting' }
    }
    case classList.contains('state-voted'): {
      return { state: 'Waiting for other players to vote' }
    }
    case classList.contains('state-gameover'): {
      return { state: 'Game over' }
    }
    default: {
      return {}
    }
  }
}
