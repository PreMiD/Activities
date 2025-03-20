import { Assets } from 'premid'

const presence = new Presence({
  clientId: '692230804402864148',
})

/**
 * Transforms the first letter of the string to uppercase.
 */
function firstLetterUp(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase())
}

presence.on('UpdateData', async () => {
  const details = document.querySelector('#trackInfo > a')
  const state = document.querySelector('#trackInfo > span > a')
  const presenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Sua%20M%C3%BAsica/assets/logo.png',
    smallImageKey: document.querySelector('a.btnPlayer.playPause.pause')
      ? Assets.Play
      : Assets.Pause,
    smallImageText: 'suamusica.com.br',
    details: details?.textContent && details.textContent.length
      ? `🎧  ${firstLetterUp(details.textContent)}`
      : '📀 Navegando...',
    state: state?.textContent && state.textContent !== ' - '
      ? `🎤  ${firstLetterUp(state.textContent)}`
      : '🇧🇷 suamusica.com.br',
    startTimestamp: 0,
    endTimestamp: 0,
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
