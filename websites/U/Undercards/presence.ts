const presence = new Presence({
  clientId: '799885664538853417',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const URLMap: { [index: string]: ((() => string) | string | null)[] } = {
  'SignUp': ['Registering an account', null],
  'AccountValidation': ['Activating account', null],
  'SignIn': ['Signing in', null],
  'Tutorial': ['Playing tutorial', null],
  'gameUpdates.jsp:': ['Reading the patch note', null],
  'Disconnect': ['Disconnected', null],
  'Profile': [
    'Viewing profile',
    () => `${getText('.mainContent > h2:nth-child(2)')}(${getText('.mainContent > p:nth-child(3) > span:nth-child(1)')})`,
  ],
  'History': ['Viewing history', null],
  'Avatars': ['Customizing avatar', null],
  'CardSkins': ['Customizing card skins', null],
  'ProfileSkins': ['Customizing profile skin', null],
  'FrameSkins': ['Customizing frame skin', null],
  'Settings': ['Viewing settings', null],
  'Staff': ['Viewing staff', null],
  'Quests': ['Viewing quests', null],
  'Bundle': ['Viewing bundle', null],
  'CardSkinsShop': ['Browsing card skins shop', null],
  'CosmeticsShop': ['Browsing cosmetics shop', null],
  'Artifacts': ['Browsing artifacts shop', null],
  'Packs': ['Browsing packs shop', null],
  'Shop': ['Browsing UCP shop', null],
  'Decks': ['Building decks', null],
  'Crafting': ['Crafting cards', null],
  'Hub': ['Viewing hub', null],
  'Friendship': ['Viewing friendship', null],
  'GamesList': ['Viewing games list', null],
  'Play': ['Finding a game...', null],
  'Game': ['Playing a game', () => `vs${getText('#enemyUsername')}`],
  'Spectate': [
    'Spectating a game',
    () => `${getText('#yourUsername') || 'Loading...'} vs ${getText('#enemyUsername') || 'Loading...'}`,
  ],
}
function getText(selector: string) {
  return document.querySelector(selector)?.textContent
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/U/Undercards/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing homepage'
  }
  else {
    const [, path] = document.location.pathname.match(
      /^\/([a-z.]+)/i,
    ) ?? []
    if (path && Object.prototype.hasOwnProperty.call(URLMap, path)) {
      const [details, state] = URLMap[path]!
      presenceData.details = details instanceof Function ? details() : details
      presenceData.state = state instanceof Function ? state() : state
    }
    else if (path?.endsWith('.jsp')) {
      presenceData.details = 'Viewing page'
      presenceData.state = getText('.mainContent > h2:nth-child(2)')
    }
    else {
      presenceData.details = 'Browsing...'
    }
  }
  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
