export const name = 'Trivia Murder Party'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/12.png'

export function getPresenceData(): PresenceData {
  const { id } = document.querySelector<HTMLDivElement>(
    '.triviadeath-page:not(.pt-page-off)',
  )!
  switch (id) {
    case 'state-lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'state-logo': {
      return { state: 'Waiting' }
    }
    case 'state-make-single-choice': {
      return { state: 'Answering a single choice question' }
    }
    case 'state-make-many-choices': {
      return { state: 'Answering a multiple choice question' }
    }
    case 'state-enter-single-text': {
      return { state: 'Answering a text prompt' }
    }
    case 'state-enter-single-drawing': {
      return { state: 'Drawing a picture' }
    }
    case 'state-grid': {
      return { state: 'Playing a grid game' }
    }
    case 'state-game-results': {
      return { state: 'Viewing game results' }
    }
  }
  return {}
}
