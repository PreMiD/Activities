const presence = new Presence({
  clientId: '676821417823830017',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Bots%20on%20Discord/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const page = document.location.pathname
  if (page.startsWith('/bots/')) {
    presenceData.details = 'Viewing a bot:'
    presenceData.state = document.querySelector(
      '#content > div > div > div.column.is-three-quarters-desktop > div.bot-header > div.right > h1',
    )?.textContent
  }
  else if (page.startsWith('/tags/')) {
    presenceData.details = 'Viewing a tag:'
    presenceData.state = document.querySelector(
      '#content > div > div.page-header > div.info > h1',
    )?.textContent
  }
  else if (page.includes('/search')) {
    presenceData.details = 'Searching something...'
  }
  else if (page.startsWith('/about')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'About'
  }
  else if (page.startsWith('/info/')) {
    presenceData.details = 'Viewing Informations'
  }
  else if (page.startsWith('/users/')) {
    presenceData.details = 'Viewing a user'
    presenceData.state = document.querySelector(
      '#content > div > div:nth-child(1) > div > div.right-container > p  ',
    )?.textContent
  }
  else if (page.endsWith('/create')) {
    presenceData.details = 'Creating a list'
  }
  else if (page.startsWith('/lists')) {
    presenceData.details = 'Viewing a list:'
    presenceData.state = document.querySelector(
      '#content > div > div:nth-child(1) > div > div.head > h1',
    )?.textContent
  }
  else if (page.startsWith('/me/')) {
    if (page.endsWith('/embeds')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'Bot Embed Builder'
    }
    else if (page.endsWith('/keys')) {
      presenceData.details = 'Viewing API keys'
    }
    else if (page.endsWith('/submit')) {
      presenceData.details = 'Sumbitting a bot'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
