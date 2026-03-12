export const name = 'You Don\'t Know Jack 2015'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/3.png'

export function getPresenceData(): PresenceData {
  const { classList } = document.querySelector<HTMLDivElement>(
    '.ydkj-page:not(.pt-page-off)',
  )!
  if (classList.contains('state-default'))
    return { state: 'Waiting in lobby' }
  else if (classList.contains('state-jack-attack'))
    return { state: 'Playing Jack Attack' }
  return {}
}
