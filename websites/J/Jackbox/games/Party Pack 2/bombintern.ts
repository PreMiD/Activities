export const name = 'Bomb Corp'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/5.png'

export function getPresenceData(): PresenceData {
  const { classList } = document.querySelector<HTMLDivElement>(
    '.bombintern-page:not(.pt-page-off)',
  )!
  switch (true) {
    case classList.contains('state-lobby'): {
      return { state: 'Waiting in lobby' }
    }
    case classList.contains('state-dayend'): {
      return { state: 'Day end' }
    }
    case classList.contains('state-gameover'): {
      return { state: 'Game over' }
    }
    case classList.contains('state-nothing'): {
      return { state: 'Waiting' }
    }
    case classList.contains('state-message'): {
      return { state: 'Reading a message' }
    }
    case classList.contains('state-smashpuzzle'): {
      return { state: 'Defusing a smash puzzle bomb' }
    }
    case classList.contains('state-wiredbomb'): {
      return { state: 'Defusing a wired bomb' }
    }
    case classList.contains('state-coffeebomb'): {
      return { state: 'Defusing a coffee bomb' }
    }
    case classList.contains('state-filingbomb'): {
      return { state: 'Defusing a filing bomb' }
    }
    case classList.contains('state-keypadbomb'): {
      return { state: 'Defusing a keypad bomb' }
    }
    case classList.contains('state-copierbomb'): {
      return { state: 'Defusing a copier bomb' }
    }
    default: {
      return {}
    }
  }
}
