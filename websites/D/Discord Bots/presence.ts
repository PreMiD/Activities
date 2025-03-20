const presence = new Presence({
  clientId: '656175238412763163',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Discord%20Bots/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const page = window.location.pathname

  if (page.includes('search')) {
    presenceData.details = 'Searching something'
  }
  else if (page.endsWith('/add')) {
    presenceData.details = 'Adding a new bot'
  }
  else if (page.startsWith('/bots/')) {
    presenceData.details = 'Viewing a bot:'
    presenceData.state = document.querySelector(
      '#__layout > div > main > div > section.bot__header > div > div > div > div.bot__name',
    )?.textContent
  }
  else if (page.includes('profile')) {
    presenceData.details = 'Viewing a profile:'
    presenceData.state = document.querySelector(
      '#__layout > div > main > div > section.profile__header > div > div > div',
    )?.textContent
  }
  else if (page.includes('terms')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Terms of Service'
  }
  else if (page.startsWith('/about')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'About'
  }
  else if (page.includes('docs')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'API Documentation'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
