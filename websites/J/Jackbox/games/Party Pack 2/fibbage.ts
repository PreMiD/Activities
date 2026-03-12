export const name = 'Fibbage XL'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/7.png'

export function getPresenceData(): PresenceData {
  const currentGamePage = document.querySelector<HTMLDivElement>(
    '.fibbage-page:not(.pt-page-off)',
  )!
  const { classList } = currentGamePage
  switch (true) {
    case classList.contains('state-lobby'): {
      return { state: 'Waiting in lobby' }
    }
    case classList.contains('state-round'): {
      return { state: currentGamePage.querySelector('p')?.textContent }
    }
    case classList.contains('state-notchoosing'): {
      return {
        state: `Waiting for ${
          currentGamePage
            .querySelector('span')
            ?.textContent
            ?.match(/^(.*?) is picking a category$/)?.[1]
        } to pick a category`,
      }
    }
    case classList.contains('state-nothing'): {
      return { state: 'Waiting' }
    }
    case classList.contains('state-enterlie'): {
      return { state: 'Entering a lie' }
    }
    case classList.contains('state-lyingdone'): {
      return { state: 'Lying done' }
    }
    case classList.contains('state-liereceived'): {
      return { state: 'Waiting for other players to enter lies' }
    }
    case classList.contains('state-chooselie')
      || classList.contains('state-audience-chooselie'): {
      return { state: 'Finding the truth' }
    }
    case classList.contains('state-chooselikes')
      || classList.contains('state-audience-chooselikes'): {
      return { state: 'Liking lies' }
    }
    case classList.contains('state-choosing'): {
      return { state: 'Choosing a category' }
    }
    case classList.contains('state-pickbloop'): {
      return { state: 'Chossing a sound' }
    }
    case classList.contains('state-audience-join'): {
      return { state: 'Joining audience' }
    }
    case classList.contains('state-audience-score'): {
      return { state: 'Viewing audience scores' }
    }
    default: {
      return {}
    }
  }
}
