const presence = new Presence({
  clientId: '1369702143254069310',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

/**
 * Image URLs for rich presence
 */
const presenceImages: Record<string, string> = {
  Logo: 'https://i.imgur.com/R1rPCGV.png',
}

/**
 * Gamemode names in correct format
 */
const codenameToFullName: Record<string, string> = {
  bubble: 'Plushie Panic',
  study: 'Study',
  eggs: 'Egg Hunt',
  laser: 'Laser Tag',
  cocoa: 'Cocoa Cottage',
  goldquest: 'Gold Quest',
  fishingfrenzy: 'Fishing Frenzy',
  cryptohack: 'Crypto Hack',
  pirate: `Pirate's Voyage`,
  towerdefense2: 'Tower Defense 2',
  monsterbrawl: 'Monster Brawl',
  deceptivedinos: 'Deceptive Dinos',
  battleroyale: 'Battle Royale',
  towerdefense: 'Tower Defense',
  cafe: 'Cafe',
  factory: 'Factory',
  racing: 'Racing',
  blookrush: 'Blook Rush',
  classic: 'Classic',
}

/**
 * Finds a DIV by a partial class name
 *
 * @param t class name
 * @returns HTMLElement
 */
function getDivFromClass(t: string) {
  return Array.from(document.querySelectorAll('div')).find(e => e.className.includes(t))
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: presenceImages.Logo,
    startTimestamp: browsingTimestamp,
  }

  const host: string = document.location.hostname
  const path: string = document.location.pathname
  const privacyMode: boolean = await presence.getSetting('privacy')
  const params: URLSearchParams = new URLSearchParams(document.location.search)

  switch (host) {
    case 'www.blooket.com': {
      if (path === '/') {
        presenceData.details = 'Viewing the landing page'
      }
      else if (path === '/terms') {
        presenceData.details = 'Viewing the Terms of Service'
      }
      else if (path === '/privacy') {
        presenceData.details = 'Viewing the Privacy Policy'
      }
      break
    }
    case 'help.blooket.com': {
      presenceData.details = 'Help Center'
      if (path === '/hc/') {
        presenceData.state = 'Searching for articles'
      }
      else if (path.startsWith('/hc/en-us/search?')) {
        presenceData.state = !privacyMode ? `Searching '${params.get('query')}'` : 'Searching for articles'
      }
      else if (path.startsWith('/hc/en-us/articles/')) {
        presenceData.state = !privacyMode ? `Reading '${document.title.substring(0, document.title.length - 10)}'` : 'Reading an article'
        if (!privacyMode) {
          presenceData.buttons = [{
            label: 'View Article',
            url: document.location.href,
          }]
        }
      }
      else if (path.startsWith('/hc/en-us/requests/')) {
        presenceData.state = 'Requesting a new article'
      }
      break
    }
    case 'play.blooket.com': {
      if (path === '/play') {
        presenceData.details = 'Joining a game'
        if (!privacyMode)
          presenceData.state = 'Entering Game ID'
      }
      else if (path === '/solo') {
        presenceData.details = 'Playing Solo'
        presenceData.state = 'Selecting a game mode'
      }
      else if (path === '/host') {
        presenceData.details = 'Hosting a game'
        presenceData.state = 'Selecting a game mode'
      }
      else if (path.startsWith('/host/')) {
        // newer modes keep their host settings on the same domain
        presenceData.details = 'Hosting a game'
        presenceData.state = 'Configuring host settings'
      }
      break
    }
    case 'id.blooket.com': {
      if (path === '/login') {
        presenceData.details = 'On the login screen'
      }
      else if (path === '/signup') {
        presenceData.details = 'On the sign up screen'
      }
      else if (path === '/forgot') {
        presenceData.details = 'On password reset screen'
      }
      break
    }
    case 'dashboard.blooket.com': {
      presenceData.details = 'Dashboard'
      if (path === '/my-sets') {
        presenceData.details = 'Viewing their sets'
      }
      else if (path === '/create') {
        presenceData.details = 'Creating a set'
      }
      else if (path === '/edit') {
        presenceData.details = 'Editing a set'
      }
      else if (path.startsWith('/set/')) {
        const setName: string = document.title.substring(0, document.title.length - 10)
        presenceData.state = !privacyMode ? `Viewing a set: '${setName}'` : 'Viewing a set'
        if (!privacyMode) {
          presenceData.buttons = [{
            label: 'View Set',
            url: document.location.href,
          }]
        }
      }
      else if (path.startsWith('/user/')) {
        const userProfile: string = path.split('/')[2] as string
        presenceData.state = !privacyMode ? `Viewing ${userProfile}'s profile` : `Viewing a user's profile`
        if (!privacyMode) {
          presenceData.buttons = [{
            label: 'View Set',
            url: document.location.href,
          }]
        }
      }
      else if (path.startsWith('/assign/')) {
        presenceData.state = 'Assigning homework'
      }
      else if (path === '/discover') {
        presenceData.state = 'Searching for sets'
      }
      else if (path === '/favorites') {
        presenceData.state = 'Viewing favorited sets'
      }
      else if (path === '/history') {
        presenceData.state = 'Viewing game reports'
      }
      else if (path === '/homeworks') {
        presenceData.state = 'Viewing homework reports'
      }
      else if (path.startsWith('/history/game/')) {
        presenceData.state = 'Viewing a game report'
      }
      else if (path.startsWith('/homework/')) {
        presenceData.state = 'Viewing a homework report'
      }
      else if (path === '/settings') {
        presenceData.state = 'Viewing their settings'
      }
      else if (path === '/change/name') {
        presenceData.state = 'Renaming their account'
      }
      else if (path === '/stats') {
        presenceData.state = 'Viewing their stats'
      }
      else if (path === '/blooks') {
        presenceData.state = 'Viewing their blooks'
      }
      else if (path === '/market') {
        presenceData.state = 'Viewing the market'
      }
      else if (path.startsWith('/upgrade')) {
        presenceData.state = 'Viewing Plus plans'
      }
      break
    }
    case 'solo.blooket.com': {
      presenceData.details = `Playing ${codenameToFullName[path.substring(1)] || '???'}`
      presenceData.state = '(solo mode)'
      break
    }
    case 'eggs.blooket.com':
    case 'laser.blooket.com':
    case 'cocoa.blooket.com': {
      // new blooket modes
      const codename: string = host.split('.')[0] as string
      presenceData.details = `${path.endsWith('/host') ? 'Hosting' : 'Playing'} ${codenameToFullName[codename]}`

      if (path.endsWith('/host')) {
        const playerCountText: HTMLDivElement | undefined = getDivFromClass('_playerNumber')
        if (!playerCountText)
          return
        const playerCount: number = Number.parseInt(playerCountText.textContent || '0')
        presenceData.state = `with ${playerCount} player${playerCount !== 1 ? 's' : ''}`
      }
      break
    }
    case 'goldquest.blooket.com':
    case 'fishingfrenzy.blooket.com':
    case 'cryptohack.blooket.com':
    case 'pirate.blooket.com':
    case 'towerdefense2.blooket.com':
    case 'monsterbrawl.blooket.com':
    case 'deceptivedinos.blooket.com':
    case 'battleroyale.blooket.com':
    case 'towerdefense.blooket.com':
    case 'cafe.blooket.com':
    case 'factory.blooket.com':
    case 'racing.blooket.com':
    case 'blookrush.blooket.com':
    case 'classic.blooket.com': {
      const codename2: string = host.split('.')[0] as string
      presenceData.details = `${path.includes('host') ? 'Hosting' : 'Playing'} ${codenameToFullName[codename2]}`
      presenceData.largeImageKey = presenceImages[codename2]

      if (path.startsWith('/landing')) {
        presenceData.state = ''
      }
      else if (path.startsWith('/host/settings')) {
        presenceData.state = 'Configuring host settings'
      }
      else if (path.endsWith('/load') || path.endsWith('/start')) {
        presenceData.state = 'Loading a save'
      }
      else if (path.endsWith('/settings')) {
        presenceData.state = 'Configuring settings'
      }
      else if (path.endsWith('/play/register')) {
        presenceData.state = 'Entering a nickname'
      }
      else if (path.endsWith('/play/lobby')) {
        presenceData.state = 'Waiting in lobby'
      }
      else if (path.endsWith('/play/final')) {
        presenceData.state = 'Viewing final results'
      }
      else if (!privacyMode) {
        // show game data on status
        switch (codename2) {
          case 'goldquest':
            presenceData.state = `${getDivFromClass('_playerEnergy')?.textContent || '0'} gold`
            break
          case 'fishingfrenzy':
            presenceData.state = `${getDivFromClass('_rightText')?.textContent || '? lbs'}`
            break
          case 'cryptohack':
            presenceData.state = `${getDivFromClass('_rightText')?.textContent?.substring(2) || '?'} crypto`
            break
          case 'pirate':
            presenceData.state = `${getDivFromClass('_playerEnergy')?.textContent || '0'} doubloons`
            break
          case 'monsterbrawl':
            presenceData.state = `${getDivFromClass('_playerEnergy')?.textContent || '0'} XP`
            break
          case 'deceptivedinos':
            presenceData.state = `${getDivFromClass('_playerEnergy')?.textContent || '0'} fossils`
            break
          case 'battleroyale':
            presenceData.state = `${getDivFromClass('_playerEnergy')?.textContent || '0'} energy`
            break
          case 'towerdefense':
            presenceData.state = `${getDivFromClass('_playerEnergy')?.textContent || '0'} coins`
            break
          case 'towerdefense2':
            presenceData.state = `${getDivFromClass('_playerEnergy')?.textContent || '0'} coins`
            break
          case 'cafe':
            presenceData.state = `${getDivFromClass('_playerEnergy')?.textContent || '$0'}`
            break
          case 'factory':
            presenceData.state = `${getDivFromClass('_playerEnergy')?.textContent || '$0'}`
            break
          case 'racing':
            presenceData.state = `${getDivFromClass('_rightText')?.textContent || '? Left'}`
            break
          case 'blookrush':
            presenceData.state = `${getDivFromClass('_playerEnergy')?.textContent || '0'} blooks`
            break
        }
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
