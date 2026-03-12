const presence = new Presence({
  clientId: '701201789365518337',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/O/Overbuff/assets/logo.png',
  Ps4 = 'https://cdn.rcd.gg/PreMiD/websites/O/Overbuff/assets/0.png',
  Xbox = 'https://cdn.rcd.gg/PreMiD/websites/O/Overbuff/assets/1.png',
  Windows = 'https://cdn.rcd.gg/PreMiD/websites/O/Overbuff/assets/2.png',
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  if (window.location.pathname.includes('/players/')) {
    const nickname = document.querySelector(
      'div.layout-header-primary-bio > h1',
    )?.firstChild?.textContent
    if (window.location.pathname.includes('pc')) {
      presenceData.smallImageKey = ActivityAssets.Windows
      presenceData.smallImageText = 'Playing on PC'
    }
    else if (window.location.pathname.includes('xbl')) {
      presenceData.smallImageKey = ActivityAssets.Xbox
      presenceData.smallImageText = 'Playing on Xbox'
    }
    else if (window.location.pathname.includes('psn')) {
      presenceData.smallImageKey = ActivityAssets.Ps4
      presenceData.smallImageText = 'Playing on Playstation'
    }
    presenceData.details = 'Viewing a player:'
    presenceData.state = `${nickname} | Level: ${
      document.querySelector('div.image-with-corner > div.corner.corner-text')
        ?.textContent
    }`
    if (window.location.pathname.includes('/heroes')) {
      presenceData.details = `Viewing ${nickname}`
      presenceData.state = 'Browsing heroes'
      try {
        presenceData.state += ` (${
          document.querySelector('div.name > a')?.textContent
        })`
      }
      catch {
        // Catch nothing
      }
    }
    else if (window.location.pathname.includes('/records')) {
      presenceData.details = `Viewing ${nickname}`
      presenceData.state = 'Browsing records'
    }
    else if (window.location.pathname.includes('/trends')) {
      presenceData.details = `Viewing ${nickname}`
      presenceData.state = 'Browsing trends'
    }
    else if (window.location.pathname.includes('/activity')) {
      presenceData.details = `Viewing ${nickname}`
      presenceData.state = 'Browsing activity'
    }
  }
  else if (window.location.pathname.includes('/heroes')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Heroes'
    try {
      presenceData.details = 'Viewing a Hero:'
      presenceData.state = `${
        document.querySelector('div.layout-header-primary-bio > div > h1')
          ?.firstChild
          ?.textContent
      } (${
        document.querySelector(
          'div.layout-header-primary-bio > div > h1 > small',
        )?.textContent
      })`
    }
    catch {
      presence.error('That\'s not a Hero profile.')
    }
  }
  else if (window.location.pathname.includes('/roles')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Roles'
    try {
      const roleName = document.querySelector(
        'div.layout-header-primary-bio > div > h1',
      )?.firstChild?.textContent
      presenceData.details = 'Viewing a role:'
      presenceData.state = roleName
      if (window.location.pathname.includes('/rankings'))
        presenceData.state = `${roleName} ranking`
    }
    catch {
      presence.error('That\'s not a Hero profile.')
    }
  }
  else if (window.location.pathname.includes('/verified')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Verified Players'
  }
  else if (window.location.pathname.includes('/rankings')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Player Rankings'
  }
  else if (window.location.pathname.includes('/esports')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Esports'
  }
  else if (window.location.pathname.includes('/live')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Live Streams'
  }
  else if (window.location.pathname.includes('/compare')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Compare players'
  }
  else if (window.location.pathname.includes('/blog')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Overbuff Blog'
    try {
      presenceData.details = 'Reading a blog:'
      presenceData.state = document.querySelector(
        'div.post-title > h1.title',
      )?.textContent
    }
    catch {
      presence.error('That\'s not a blog post.')
    }
  }
  else if (window.location.pathname.includes('/about')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'About Overbuff'
  }
  else if (window.location.pathname.includes('/favorites')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Favorites'
  }
  else if (window.location.pathname.includes('/search')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Search Players'
  }
  else if (window.location.pathname.includes('/settings')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Settings'
  }
  else if (window.location.pathname.endsWith('/privacy')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Privacy Policy'
  }
  else {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Front page'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
