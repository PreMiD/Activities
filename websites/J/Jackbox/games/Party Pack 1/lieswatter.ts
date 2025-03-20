export const name = 'Lie Swatter'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/1.png'

export function getPresenceData(): PresenceData {
  const { classList } = document.querySelector<HTMLDivElement>(
    '.lieswatter-page:not(.pt-page-off)',
  )!
  if (classList.contains('state-lobby'))
    return { state: 'Waiting in lobby' }
  else if (classList.contains('state-answer'))
    return { state: 'Swatting lies' }
  else if (classList.contains('state-nothing'))
    return { state: 'Waiting for other players' }
  return {}
}
