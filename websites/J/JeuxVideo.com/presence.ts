const presence = new Presence({
  clientId: '503557087041683458',
})

/**
 * Truncate a string by "..." if needed
 * @param {string} text The string to truncate
 * @param {number} length The desized length
 */
function truncateString(text: string, length: number): string {
  if (text.length > length)
    return `${text.substring(0, length - 3)}...`
  else return text
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/JeuxVideo.com/assets/logo.jpg',
    name: 'JeuxVideo.com',
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Page d\'accueil'
  }
  else if (document.location.pathname.includes('/news/')) {
    presenceData.details = 'Lis une actualité'
    presenceData.state = truncateString(
      document.querySelector('div.titre-wrapper')?.textContent ?? '',
      128,
    )
  }
  else if (document.location.pathname.includes('/videos/')) {
    presenceData.details = 'Regarde une vidéo'
    presenceData.state = truncateString(
      document.querySelector('div.titre-video')?.textContent ?? '',
      128,
    )
  }
  else if (document.location.pathname.includes('/test/')) {
    presenceData.details = 'Lis un test'
    presenceData.state = `${truncateString(
      document.querySelector('.gameHeaderBanner__title')?.textContent ?? '',
      128,
    )} (${
      document.querySelector('.bloc-avis-testeur > .note > strong')?.textContent ?? ''
    }/20)`
  }
  else if (document.location.pathname.includes('/messages-prives/')) {
    presenceData.details = 'Lis ses MP'
  }
  else if (document.location.pathname.includes('/forums/0-')) {
    presenceData.details = truncateString(
      document.querySelector(
        '#forum-main-col > .titre-head-bloc > .titre-bloc-forum',
      )?.textContent ?? '',
      64,
    )
    presenceData.state = document.querySelector(
      '.panel-heading > .nb-connect-fofo',
    )?.textContent
  }
  else if (document.location.pathname.includes('/forums/')) {
    presenceData.details = truncateString(
      document.querySelector(
        '.bloc-fil-ariane-crumb-forum > .fil-ariane-crumb > span:last-of-type > a',
      )?.textContent ?? '',
      64,
    )
    presenceData.state = truncateString(
      document.querySelector(
        '#forum-main-col > .titre-head-bloc > .titre-bloc-forum > #bloc-title-forum',
      )?.textContent ?? '',
      128,
    )
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
