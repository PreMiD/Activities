export const name = 'Fakin\' It'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/9.png'

export function getPresenceData(): PresenceData {
  const currentGamePage = document.querySelector<HTMLDivElement>(
    '.fakinit-page:not(.pt-page-off)',
  )!
  const { classList } = currentGamePage
  switch (true) {
    case classList.contains('state-lobby'): {
      return { state: 'Waiting in lobby' }
    }
    case classList.contains('state-nothing'): {
      return { state: 'Waiting' }
    }
    case classList.contains('state-gameplay'): {
      return { state: 'Following instructions' }
    }
    case classList.contains('state-skip-instructions'): {
      return { state: 'Watching the tutorial' }
    }
    case classList.contains('state-categories'): {
      return { state: 'Choosing a category' }
    }
    case classList.contains('state-notchoosing'): {
      return { state: 'Waiting for a category to be chosen' }
    }
    case classList.contains('state-round'): {
      return { state: currentGamePage.querySelector('p')?.textContent }
    }
    case classList.contains('state-vote'): {
      return { state: 'Voting on a player' }
    }
    case classList.contains('state-vote-locked'): {
      return { state: 'Viewing vote results' }
    }
    default: {
      return {}
    }
  }
}
