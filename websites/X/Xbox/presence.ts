const presence = new Presence({
  clientId: '860159948234817536',
})
const timestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/X/Xbox/assets/logo.png',
    startTimestamp: timestamp,
  }

  if (document.location.href.includes('/game-pass')) {
    // Game Pass
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/X/Xbox/assets/0.png'
    presenceData.details = 'Reading about Xbox Game Pass'
    if (document.location.href.includes('games'))
      presenceData.details = 'Browsing Xbox Game Pass games'
  }
  else if (document.location.href.includes('/live/gold')) {
    // Live Gold
    presenceData.details = 'Reading about Xbox Live Gold'
    if (document.location.href.includes('withgold'))
      presenceData.details = 'Viewing Xbox Live Gold benefits'
  }
  else if (document.location.href.includes('/games')) {
    // Games
    presenceData.details = 'Browsing Xbox game catalog'
    if (document.location.href.includes('optimized'))
      presenceData.details = 'Reading about Series X|S optimized games'
    else if (document.location.href.includes('backward-compatibility'))
      presenceData.details = 'Reading about backward compatible games'
  }
  else if (document.location.href.includes('/consoles')) {
    // Consoles
    presenceData.details = 'Viewing Xbox consoles'
    if (document.location.href.includes('consoles/all-consoles')) {
      presenceData.details = 'Browsing all Xbox consoles'
    }
    else if (document.location.href.includes('consoles/help-me-choose')) {
      presenceData.details = 'Determining their recommended Xbox console'
    }
    else if (document.location.href.includes('consoles/')) {
      presenceData.details = 'Viewing an Xbox console'

      presenceData.state = document.title.split('|')[0]
      presenceData.buttons = [
        { label: 'View this console', url: document.location.href },
      ]
    }
    else if (document.location.href.includes('backward-compatibility')) {
      presenceData.details = 'Reading about backward compatible games'
    }
  }
  else if (document.location.href.includes('/accessories')) {
    // Accessories
    presenceData.details = 'Browsing Xbox accessories'
    if (document.location.href.includes('consoles/all-consoles')) {
      presenceData.details = 'Browsing all Xbox consoles'
    }
    else if (document.location.href.includes('consoles/help-me-choose')) {
      presenceData.details = 'Determining their recommended Xbox console'
    }
    else if (document.location.href.includes('accessories/')) {
      presenceData.details = 'Viewing an Xbox accessory'

      presenceData.state = document.title.split('|')[0]
      presenceData.buttons = [
        { label: 'View this accessory', url: document.location.href },
      ]
    }
    else if (document.location.href.includes('backward-compatibility')) {
      presenceData.details = 'Reading about backward compatible games'
    }
  }
  else if (document.location.href.includes('/play')) {
    // Play
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/X/Xbox/assets/0.png'
    if (document.location.href.includes('play/games')) {
      presenceData.details = 'Viewing an Xbox Cloud Gaming game'

      presenceData.state = document.title.split('|')[0]
    }
    else if (document.location.href.includes('play/launch')) {
      presenceData.details = 'Playing an Xbox Cloud Gaming game'

      presenceData.state = document.title.split('|')[0]
      presenceData.buttons = [
        { label: 'Play this game (Game Pass)', url: document.location.href },
      ]
      if (document.querySelector('[class^="Provisioning"'))
        presenceData.details += ' (setting up)'
      else if (document.querySelector('[class^="NotFocused"'))
        presenceData.details += ' (unfocused)'
    }
    else {
      presenceData.details = 'Browsing Xbox Cloud Gaming games'
      if (document.location.href.includes('gallery/'))
        presenceData.state = `Category: ${document.title.split('|')[0]}`
    }
  }
  else if (document.location.href.includes('/community')) {
    // Community
    presenceData.details = 'Viewing the Xbox Community'
    if (document.location.href.includes('esports'))
      presenceData.details = 'Reading about Xbox Esports'
  }
  else {
    switch (document.location.hostname) {
      case 'account.xbox.com': {
        // My Xbox
        presenceData.details = 'Viewing their profile'
        if (document.location.href.includes('gamertag=')) {
          presenceData.details = `Viewing profile: ${
            document.title.split('|')[0]
          }`
        }

        break
      }
      case 'support.xbox.com': {
        // Support
        presenceData.details = 'Viewing Xbox Support'
        if (document.location.href.includes('help'))
          presenceData.state = document.title.split('|')[0]

        break
      }
      case 'news.xbox.com': {
        // Xbox Wire
        presenceData.details = 'Viewing news from Xbox Wire'
        if (document.title.includes('-'))
          presenceData.state = document.title.split('|')[0]

        break
      }
      default: {
        // Other
        presenceData.details = 'Browsing the website'
        presenceData.state = `Page: ${document.title}`
        if (document.location.pathname.length < 8)
          presenceData.state = 'Homepage'
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
