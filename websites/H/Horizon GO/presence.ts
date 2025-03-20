const presence = new Presence({
  clientId: '647443051819565076',
})

presence.on('UpdateData', async () => {
  const path = window.location.hash.substr(1)
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Horizon%20GO/assets/logo.jpg',
  }

  if (path === 'action=watch') {
    presenceData.state = `Channel: ${document
      .querySelector(
        'div.player-linear-bottom-bar__channelstrip:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2)',
      )
      ?.getAttribute('title')}`
    presenceData.details = `Watching: ${
      document.querySelector(
        'div.player-linear-bottom-bar__channelstrip:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)',
      )?.textContent
    }`
  }
  else if (path.includes('offset')) {
    presenceData.state = `Video: ${document.title}`
    presenceData.details = `Watching: ${
      document.querySelector('.player-ui-bottom-bar-controls__main-info')
        ?.textContent
    }`
  }
  else {
    presenceData.details = 'Browsing homepage.'
  }

  presence.setActivity(presenceData)
})
