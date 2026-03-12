const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Dank%20Memer/assets/logo.png',
    name: 'Dank Memer',
  }

  if (window.location.pathname.endsWith('commands')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Commands'
  }
  else if (window.location.pathname.endsWith('about')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'About'
  }
  else if (window.location.pathname.endsWith('blogs')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Blogs'
  }
  else if (window.location.pathname.startsWith('/blogs/')) {
    presenceData.details = 'Viewing a blog:'
    presenceData.state = document.querySelector(
      '#root > div.psuedoBody > header',
    )?.textContent
  }
  else if (window.location.pathname.includes('/store/presences/')) {
    presenceData.details = 'Viewing a presence page:'
    presenceData.state = document.querySelector(
      '#app > div.page-wrapper > div.content > div > div > div.fullpresence__header > div.header__title > h1',
    )?.textContent
  }
  else if (window.location.pathname.endsWith('loot')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Lootboxes'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
