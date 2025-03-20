const presence = new Presence({
  clientId: '995363603261702234',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Pixlr/assets/logo.jpg',
  }
  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing the home page'
  }
  else if (document.location.pathname.includes('remove-background')) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/P/Pixlr/assets/0.png'
    presenceData.details = 'Using Remove Background'
  }
  else if (document.location.pathname.includes('mobile')) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/P/Pixlr/assets/1.png'
    presenceData.details = 'Viewing Pixlr Stories'
  }
  else if (document.location.pathname.includes('myaccount')) {
    presenceData.details = 'Editing account settings'
  }
  else if (document.location.pathname.startsWith('/photomash/')) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/P/Pixlr/assets/2.png'
    if (document.location.hash.endsWith('#editor'))
      presenceData.details = 'Editing a photo in Photomash'
    else presenceData.details = 'Browing Photomash'
  }
  else if (document.location.pathname.startsWith('/x/')) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/P/Pixlr/assets/3.png'
    if (document.location.hash.endsWith('#editor')) {
      presenceData.details = `Editing a photo at ${
        document.querySelector('#zoom-level')?.textContent
      } zoom...`
    }
    else if (document.location.hash.endsWith('template')) {
      presenceData.details = 'Browsing templates'
    }
    else if (document.location.hash.endsWith('search')) {
      presenceData.details = 'Searching for stock images'
    }
    else if (document.location.hash.endsWith('home')) {
      presenceData.details = 'Browsing Pixlr X'
    }
    else if (document.location.hash.endsWith('history')) {
      presenceData.details = 'Viewing their history'
    }
    else {
      presenceData.details = 'Browsing Pixlr X'
    }
  }
  else if (document.location.pathname.startsWith('/e/')) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/P/Pixlr/assets/4.png'
    if (document.location.hash.endsWith('#editor')) {
      presenceData.details = 'Editing a photo in'
      presenceData.state = `${
        document.querySelector('#horizontal-image-info')?.textContent
      }.`
    }
    else if (document.location.hash.endsWith('template')) {
      presenceData.details = 'Browsing templates'
    }
    else if (document.location.hash.endsWith('search')) {
      presenceData.details = 'Searching for stock images'
    }
    else if (document.location.hash.endsWith('home')) {
      presenceData.details = 'Browsing Pixlr E'
    }
    else if (document.location.hash.endsWith('history')) {
      presenceData.details = 'Viewing their history'
    }
    else {
      presenceData.details = 'Browsing Pixlr E'
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
