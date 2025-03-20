const presence = new Presence({
  clientId: '653644508507930645',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Discord%20Bot%20List/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (window.location.pathname.endsWith('top')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Top Voted Bots'
  }
  else if (window.location.pathname.endsWith('add')) {
    presenceData.details = 'Adding a new bot'
  }
  else if (window.location.pathname.endsWith('mine')) {
    presenceData.details = 'Viewing their bot(s)'
  }
  else if (window.location.pathname.startsWith('/bots/')) {
    presenceData.details = 'Viewing a bot:'
    presenceData.state = document
      .querySelector(
        '#__layout > div > div.main-content > div > div > div.row > div.col-12.col-md-6 > h1',
      )
      ?.textContent
      ?.replace(
        document.querySelector(
          '#__layout > div > div.main-content > div > div > div.row > div.col-12.col-md-6 > h1 > a',
        )?.textContent || '',
        '',
      )
  }
  else if (window.location.pathname.startsWith('/tags/')) {
    presenceData.details = 'Viewing a tag:'
    presenceData.state = document.querySelector(
      '#__layout > div > div.main-content > div > div > div:nth-child(1) > div.col-12.col-md-4 > h2',
    )?.textContent
  }
  else if (window.location.pathname.includes('/users/')) {
    presenceData.details = 'Viewing a user:'
    presenceData.state = document.querySelector(
      '#__layout > div > div.main-content > div > div > div.user-bar.text-center > h2',
    )?.textContent
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
