const presence = new Presence({
  clientId: '613393646330576931',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/NPM%20Package%20Registry/assets/logo.png',
  }
  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing the homepage'
  }
  else if (document.location.pathname.startsWith('/search')) {
    presenceData.details = 'Searching...'
    presenceData.state = document.location.search.substr(3)
  }
  else if (document.location.pathname.startsWith('/package/')) {
    presenceData.details = 'Viewing a package'
    if (document.querySelector('img[alt*="Missing"]')) {
      presenceData.details = 'Viewing a non-exist package'
    }
    presenceData.state = 'Fetching...'
    if (document.location.pathname.split('/').length === 4) {
      presenceData.state = `${document.location.pathname.split('/')[2]}/${
        document.location.pathname.split('/')[3]
      }`
    }
    else {
      presenceData.state = document.location.pathname.split('/')[2]
    }
  }
  else if (document.location.pathname.startsWith('/~')) {
    presenceData.details = 'Viewing a profile...'
    presenceData.state = document.location.pathname.substr(3)
  }
  presence.setActivity(presenceData)
})
