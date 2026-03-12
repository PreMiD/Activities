export const name = 'Tee K.O.'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/8.png'

export function getPresenceData(): PresenceData {
  const { id } = document.querySelector<HTMLDivElement>(
    '.awshirt-page:not(.pt-page-off)',
  )!
  switch (id) {
    case 'state-lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'state-logo': {
      return { state: 'Waiting' }
    }
    case 'state-audience': {
      return { state: 'In the audience' }
    }
    case 'state-draw': {
      return { state: 'Drawing a shirt' }
    }
    case 'state-drawing-done': {
      return {
        state: 'Waiting for other players to finish drawing their shirt',
      }
    }
    case 'state-input': {
      return { state: 'Creating taglines' }
    }
    case 'state-prompts-done': {
      return { state: 'Waiting for other players to finish their taglines' }
    }
    case 'state-shirt': {
      return { state: 'Creating a t-shirt' }
    }
    case 'state-shirt-done': {
      return { state: 'Waiting for other players to finish their t-shirts' }
    }
    case 'state-vote': {
      return { state: 'Voting on a t-shirt' }
    }
    case 'state-voting-done': {
      return { state: 'Waiting for other players to finish voting' }
    }
    case 'state-audience-suggestions': {
      return { state: 'Entering a suggestion' }
    }
    case 'state-answer-question-audience':
    case 'state-answer-question': {
      return { state: 'Answering a question' }
    }
    case 'state-done-answering': {
      return { state: 'Waiting for other players to finish answering' }
    }
  }
  return {}
}
