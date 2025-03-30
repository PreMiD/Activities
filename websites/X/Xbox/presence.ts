const presence = new Presence({
  clientId: '860159948234817536',
})
const timestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    browsingAllXboxConsoles: 'xbox.browsingAllXboxConsoles',
    browsingTheWebsite: 'xbox.browsingTheWebsite',
    browsingXboxAccessories: 'xbox.browsingXboxAccessories',
    browsingXboxCloudGamingGames: 'xbox.browsingXboxCloudGamingGames',
    browsingXboxGameCatalog: 'xbox.browsingXboxGameCatalog',
    browsingXboxGamePassGames: 'xbox.browsingXboxGamePassGames',
    buttonPlayThisGame: 'xbox.buttonPlayThisGame',
    buttonViewThisAccessory: 'xbox.buttonViewThisAccessory',
    buttonViewThisConsole: 'xbox.buttonViewThisConsole',
    category: 'xbox.category',
    determiningTheirRecommendedXboxConsole: 'xbox.determiningTheirRecommendedXboxConsole',
    homepage: 'xbox.homepage',
    page: 'xbox.page',
    playingXboxCloudGamingGame: 'xbox.playingXboxCloudGamingGame',
    readingAboutBackwardCompatibleGames: 'xbox.readingAboutBackwardCompatibleGames',
    readingAboutSeriesXSOptimizedGames: 'xbox.readingAboutSeriesXSOptimizedGames',
    readingAboutXboxEsports: 'xbox.readingAboutXboxEsports',
    readingAboutXboxGamePass: 'xbox.readingAboutXboxGamePass',
    readingAboutXboxLiveGold: 'xbox.readingAboutXboxLiveGold',
    settingUp: 'xbox.settingUp',
    unfocused: 'xbox.unfocused',
    viewingAnXboxAccessory: 'xbox.viewingAnXboxAccessory',
    viewingAnXboxConsole: 'xbox.viewingAnXboxConsole',
    viewingNewsFromXboxWire: 'xbox.viewingNewsFromXboxWire',
    viewingProfile: 'xbox.viewingProfile',
    viewingTheXboxCommunity: 'xbox.viewingTheXboxCommunity',
    viewingTheirProfile: 'xbox.viewingTheirProfile',
    viewingXboxCloudGamingGame: 'xbox.viewingXboxCloudGamingGame',
    viewingXboxConsoles: 'xbox.viewingXboxConsoles',
    viewingXboxLiveGoldBenefits: 'xbox.viewingXboxLiveGoldBenefits',
    viewingXboxSupport: 'xbox.viewingXboxSupport',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/X/Xbox/assets/logo.png',
    startTimestamp: timestamp,
  }
  const strings = await getStrings()

  if (document.location.href.includes('/game-pass')) {
    // Game Pass
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/X/Xbox/assets/0.png'
    presenceData.details = strings.readingAboutXboxGamePass
    if (document.location.href.includes('games'))
      presenceData.details = strings.browsingXboxGamePassGames
  }
  else if (document.location.href.includes('/live/gold')) {
    // Live Gold
    presenceData.details = strings.readingAboutXboxLiveGold
    if (document.location.href.includes('withgold'))
      presenceData.details = strings.viewingXboxLiveGoldBenefits
  }
  else if (document.location.href.includes('/games')) {
    // Games
    presenceData.details = strings.browsingXboxGameCatalog
    if (document.location.href.includes('optimized'))
      presenceData.details = strings.readingAboutSeriesXSOptimizedGames
    else if (document.location.href.includes('backward-compatibility'))
      presenceData.details = strings.readingAboutBackwardCompatibleGames
  }
  else if (document.location.href.includes('/consoles')) {
    // Consoles
    presenceData.details = strings.viewingXboxConsoles
    if (document.location.href.includes('consoles/all-consoles')) {
      presenceData.details = strings.browsingAllXboxConsoles
    }
    else if (document.location.href.includes('consoles/help-me-choose')) {
      presenceData.details = strings.determiningTheirRecommendedXboxConsole
    }
    else if (document.location.href.includes('consoles/')) {
      presenceData.details = strings.viewingAnXboxConsole

      presenceData.state = document.title.split('|')[0]
      presenceData.buttons = [
        { label: strings.buttonViewThisConsole, url: document.location.href },
      ]
    }
    else if (document.location.href.includes('backward-compatibility')) {
      presenceData.details = strings.readingAboutBackwardCompatibleGames
    }
  }
  else if (document.location.href.includes('/accessories')) {
    // Accessories
    presenceData.details = strings.browsingXboxAccessories
    if (document.location.href.includes('consoles/all-consoles')) {
      presenceData.details = strings.browsingAllXboxConsoles
    }
    else if (document.location.href.includes('consoles/help-me-choose')) {
      presenceData.details = strings.determiningTheirRecommendedXboxConsole
    }
    else if (document.location.href.includes('accessories/')) {
      presenceData.details = strings.viewingAnXboxAccessory

      presenceData.state = document.title.split('|')[0]
      presenceData.buttons = [
        { label: strings.buttonViewThisAccessory, url: document.location.href },
      ]
    }
    else if (document.location.href.includes('backward-compatibility')) {
      presenceData.details = strings.readingAboutBackwardCompatibleGames
    }
  }
  else if (document.location.href.includes('/play')) {
    // Play
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/X/Xbox/assets/0.png'
    if (document.location.href.includes('play/games')) {
      presenceData.details = strings.viewingXboxCloudGamingGame

      presenceData.state = document.title.split('|')[0]
    }
    else if (document.location.href.includes('play/launch')) {
      presenceData.details = strings.playingXboxCloudGamingGame

      presenceData.state = document.title.split('|')[0]
      presenceData.buttons = [
        { label: strings.buttonPlayThisGame, url: document.location.href },
      ]
      if (document.querySelector('[class^="Provisioning"'))
        presenceData.details += strings.settingUp
      else if (document.querySelector('[class^="NotFocused"'))
        presenceData.details += strings.unfocused
    }
    else {
      presenceData.details = strings.browsingXboxCloudGamingGames
      if (document.location.href.includes('gallery/'))
        presenceData.state = strings.category.replace('{0}', document.title.split('|')[0]!)
    }
  }
  else if (document.location.href.includes('/community')) {
    // Community
    presenceData.details = strings.viewingTheXboxCommunity
    if (document.location.href.includes('esports'))
      presenceData.details = strings.readingAboutXboxEsports
  }
  else {
    switch (document.location.hostname) {
      case 'account.xbox.com': {
        // My Xbox
        presenceData.details = strings.viewingTheirProfile
        if (document.location.href.includes('gamertag=')) {
          presenceData.details = strings.viewingProfile.replace('{0}', document.title.split('|')[0]!)
        }

        break
      }
      case 'support.xbox.com': {
        // Support
        presenceData.details = strings.viewingXboxSupport
        if (document.location.href.includes('help'))
          presenceData.state = document.title.split('|')[0]

        break
      }
      case 'news.xbox.com': {
        // Xbox Wire
        presenceData.details = strings.viewingNewsFromXboxWire
        if (document.title.includes('-'))
          presenceData.state = document.title.split('|')[0]

        break
      }
      default: {
        // Other
        presenceData.details = strings.browsingTheWebsite
        presenceData.state = strings.page.replace('{0}', document.title)
        if (document.location.pathname.length < 8)
          presenceData.state = strings.homepage
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
