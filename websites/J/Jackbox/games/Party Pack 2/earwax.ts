export const name = 'Earwax'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/6.png'

export function getPresenceData(): PresenceData {
  const { id, classList } = document.querySelector<HTMLDivElement>(
    '.earwax-page:not(.pt-page-off)',
  )!
  switch (id) {
    case 'state-lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'state-intro': {
      return { state: 'Watching tutorial' }
    }
    case 'state-logo':
    case 'state-audience-wait': {
      return { state: 'Waiting' }
    }
    default:
      if (classList.contains('state-choosing')) {
        return { state: 'Choosing a prompt' }
      }
      else if (classList.contains('state-notchoosing')) {
        return { state: 'Waiting for the judge to choose a prompt' }
      }
      else if (classList.contains('state-notselectingsound')) {
        return { state: 'Waiting for players to choose a sound' }
      }
      else if (
        classList.contains('state-selectingsound')
        || id === 'state-answer-question-audience'
      ) {
        return { state: 'Choosing a sound' }
      }
      else if (classList.contains('state-audience-join')) {
        return { state: 'Joining the audience' }
      }
      else if (id === 'state-vote') {
        return { state: 'Voting on a sound' }
      }
  }
  return {}
}
