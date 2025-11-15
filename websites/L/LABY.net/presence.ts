const presence = new Presence({
  clientId: '867452106016161822',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/LABY.net/assets/logo.png',
}

const BROWSING_TIMESTAMP = Math.floor(Date.now() / 1000)
const { href, pathname } = window.location

const SELECTORS = {
  profileName: 'div.col-12>h1',
  itemName: 'div.mb-1>h1',
  serverName: 'div.server-info-wrapper>h1',
}

const ROUTE_HANDLERS: Record<string, (presenceData: PresenceData) => void> = {
  '/login': (presenceData) => {
    presenceData.details = 'Logging in...'
  },
  '/skins': (presenceData) => {
    presenceData.details = 'Viewing skins'
  },
  '/capes': (presenceData) => {
    presenceData.details = 'Viewing Minecraft capes'
  },
  '/cloaks': (presenceData) => {
    presenceData.details = 'Viewing LabyMod cloaks'
  },
  '/names': (presenceData) => {
    presenceData.details = 'Viewing upcoming available usernames'
  },
  '/badges': (presenceData) => {
    presenceData.details = 'Viewing LABY.net badges'
  },
  '/settings': (presenceData) => {
    presenceData.details = 'Viewing profile settings'
  },
  '/contribute': (presenceData) => {
    presenceData.details = 'Viewing UUID contribution page'
  },
  '/accounts': (presenceData) => {
    presenceData.details = `Viewing all accounts by @${pathname.split('/')[2]}`
  },
  '/@': handleProfileRoute,
  '/skin': handleSingleItemRoute('Minecraft skin'),
  '/cape': handleDetailedItemRoute('cape', SELECTORS.itemName),
  '/cloak': handleSimpleItemRoute('LabyMod cloak'),
  '/badge': handleDetailedItemRoute('badge', SELECTORS.itemName),
  '/server': handleServerRoute,
}

function getElementText(selector: string): string | undefined {
  return document.querySelector(selector)?.textContent
}

function handleProfileRoute(presenceData: PresenceData): void {
  const profileName = getElementText(SELECTORS.profileName)
  if (!profileName)
    return

  presenceData.details = 'Viewing profile'
  presenceData.state = `@${profileName}`
  const possessive = profileName.endsWith('s') ? '\'' : '\'s'
  presenceData.buttons = [{
    label: `View @${profileName}${possessive} profile`,
    url: href,
  }]
}

function handleSingleItemRoute(itemType: string) {
  return (presenceData: PresenceData): void => {
    presenceData.details = `Viewing a ${itemType}`
    presenceData.buttons = [{
      label: `View this ${itemType}`,
      url: href,
    }]
  }
}

function handleDetailedItemRoute(itemType: string, selector: string) {
  return (presenceData: PresenceData): void => {
    const itemName = getElementText(selector)
    if (!itemName)
      return

    presenceData.details = `Viewing ${itemType}`
    presenceData.state = itemName
    presenceData.buttons = [{
      label: `View ${itemName} ${itemType}`,
      url: href,
    }]
  }
}

function handleSimpleItemRoute(itemType: string) {
  return (presenceData: PresenceData): void => {
    presenceData.details = `Viewing a ${itemType}`
    presenceData.buttons = [{
      label: `View this ${itemType}`,
      url: href,
    }]
  }
}

function handleServerRoute(presenceData: PresenceData): void {
  const serverName = getElementText(SELECTORS.serverName)
  if (!serverName)
    return

  presenceData.details = 'Viewing server'
  presenceData.state = serverName
  presenceData.buttons = [{
    label: `View server ${serverName}`,
    url: href,
  }]
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'LABY.net',
    startTimestamp: BROWSING_TIMESTAMP,
  }

  const route = Object.keys(ROUTE_HANDLERS).find(r => pathname.startsWith(r))
  route && ROUTE_HANDLERS[route]?.(presenceData)

  presence.setActivity(presenceData.details ? presenceData : undefined)
})
