export const name = 'Quiplash XL'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/11.png'

export function getPresenceData(): PresenceData {
  const { id } = document.querySelector<HTMLDivElement>(
    '.quiplash-page:not(.pt-page-off)',
  )!
  switch (id) {
    case 'state-lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'state-logo': {
      return { state: 'Watching tutorial' }
    }
    case 'state-answer-question-audience': {
      return { state: 'Writing audience quip' }
    }
    case 'state-answer-question': {
      return { state: 'Writing quip' }
    }
    case 'state-done-answering': {
      return { state: 'Waiting for other players to answer' }
    }
    case 'state-vote': {
      return { state: 'Voting' }
    }
  }
  return {}
}
