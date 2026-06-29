const presence = new Presence({
  clientId: '1520858859302813766',
})

const LOGO = 'https://app.valour.gg/_content/Valour.Client/media/logo/logo-square-512.png'

const SESSION_START = Math.floor(Date.now() / 1000)

const tabStartTimes = new Map<string, number>()

function getTabStartTimestamp(tabId: string | undefined): number {
  if (!tabId)
    return SESSION_START

  let start = tabStartTimes.get(tabId)
  if (start === undefined) {
    start = Math.floor(Date.now() / 1000)
    tabStartTimes.set(tabId, start)
  }
  return start
};

interface ActiveTab {
  title: string
  kind: 'channel' | 'thread-home' | 'dm' | 'about' | 'rules'
  label: string
  tabId?: string
  planetName?: string
  planetId?: string
  iconUrl?: string
};

const HOME_TITLE_RE = /^Home(?: - (.+))?$/
const ABOUT_TITLE_RE = /^(?:About|Info) - (.+)$/
const RULES_TITLE_RE = /^Rules - (.+)$/
const CHAT_WITH_RE = /^Chat with /
const PLANET_ID_RE = /\/planets\/(\d+)\//
const BG_IMAGE_URL_RE = /url\(["']?([^"')]+)["']?\)/

function getBackgroundImageUrl(el: Element | null): string | undefined {
  return el
    ? getComputedStyle(el).backgroundImage.match(BG_IMAGE_URL_RE)?.[1]
    : undefined
};

function getUrlPlanetId(src: string | null | undefined): string | undefined {
  return src?.match(PLANET_ID_RE)?.[1]
};

const planetNameById = new Map<string, string>()

function findPlanetNameByIcon(planetId: string): string | undefined {
  const cached = planetNameById.get(planetId)
  if (cached)
    return cached

  for (const planetEl of document.querySelectorAll('.planet')) {
    if (getUrlPlanetId(planetEl.querySelector<HTMLImageElement>('.planet-icon-img')?.getAttribute('src')) !== planetId)
      continue

    const name = planetEl.querySelector('.planet-name')?.textContent?.trim()
    if (name)
      planetNameById.set(planetId, name)
    return name
  };

  return undefined
};

function findPlanetNameByChannelTitle(title: string): string | undefined {
  for (const nameEl of document.querySelectorAll('.channel.open .name')) {
    if (nameEl.textContent?.trim() === title)
      return nameEl.closest('.planet')?.querySelector('.planet-name')?.textContent?.trim()
  };
  return undefined
};

function getActiveTab(): ActiveTab | undefined {
  const wrapper = document.querySelector('.window-wrapper.active')
  const title = wrapper?.querySelector('.tab-title')?.textContent?.trim()
  if (!title)
    return undefined

  const tabId = wrapper?.id
  const icon = wrapper?.querySelector<HTMLImageElement>('.tab-icon')
  const iconSrc = icon?.getAttribute('src') ?? undefined
  const iconUrl = iconSrc?.startsWith('http') ? iconSrc : undefined

  const homeMatch = title.match(HOME_TITLE_RE)
  if (homeMatch)
    return { title, label: title, kind: 'thread-home', tabId, planetName: homeMatch[1], planetId: getUrlPlanetId(iconSrc), iconUrl }

  const aboutMatch = title.match(ABOUT_TITLE_RE)
  if (aboutMatch)
    return { title, label: title, kind: 'about', tabId, planetName: aboutMatch[1], planetId: getUrlPlanetId(iconSrc), iconUrl }

  const rulesMatch = title.match(RULES_TITLE_RE)
  if (rulesMatch)
    return { title, label: title, kind: 'rules', tabId, planetName: rulesMatch[1], planetId: getUrlPlanetId(iconSrc), iconUrl }

  if (!icon?.classList.contains('circle'))
    return { title, label: title.replace(CHAT_WITH_RE, ''), kind: 'dm', tabId, iconUrl }

  const planetId = getUrlPlanetId(iconSrc)
  const planetName = (planetId && findPlanetNameByIcon(planetId)) || findPlanetNameByChannelTitle(title)
  return { title, label: `#${title}`, kind: 'channel', tabId, planetName, planetId, iconUrl }
};

function formatDetails(tab: ActiveTab): string {
  switch (tab.kind) {
    case 'thread-home':
      return 'Browsing Threads'
    case 'channel':
      return `Talking in ${tab.label}`
    case 'dm':
      return `Talking to ${tab.label}`
    case 'about':
      return tab.planetName ? `Reading About ${tab.planetName}` : 'Reading About a Planet'
    case 'rules':
      return tab.planetName ? `Reading the Rules of ${tab.planetName}` : 'Reading Planet Rules'
  };
};

let discoverablePlanetIds: Set<string> | undefined
let discoverableFetchedAt = 0

async function isPlanetDiscoverable(planetId: string): Promise<boolean> {
  const now = Date.now()
  if (!discoverablePlanetIds || now - discoverableFetchedAt > 5 * 60 * 1000) {
    try {
      const res = await fetch('https://api.valour.gg/api/planets/discoverable')
      const planets: { id: number }[] = await res.json()
      discoverablePlanetIds = new Set(planets.map(p => String(p.id)))
      discoverableFetchedAt = now
    }
    catch {}
  }
  return discoverablePlanetIds?.has(planetId) ?? false
};

let cachedUserCount: number | undefined
let userCountFetchedAt = 0

async function getUserCount(): Promise<number | undefined> {
  const now = Date.now()
  if (cachedUserCount === undefined || now - userCountFetchedAt > 5 * 60 * 1000) {
    try {
      const res = await fetch('https://skyjoshua.xyz/valour/api/count')
      const data = await res.json()
      cachedUserCount = typeof data === 'number' ? data : data.count
      userCountFetchedAt = now
    }
    catch {}
  }
  return cachedUserCount
};

function getActivityName(mode: number, channelLabel: string | undefined, planetName: string | undefined): string | undefined {
  switch (mode) {
    case 1:
      return planetName ? `Valour - ${planetName}` : undefined
    case 2:
      return channelLabel ? `Valour - ${channelLabel}` : undefined
    case 3:
      return planetName
    case 4:
      return channelLabel
    case 5:
      return planetName && channelLabel ? `${planetName} - ${channelLabel}` : (planetName ?? channelLabel)
    default:
      return undefined
  }
};

let lastSmallImageDisabled: boolean | undefined

presence.on('UpdateData', async () => {
  const [
    privacy,
    showChannel,
    showDMs,
    showPlanet,
    smallImageMode,
    smallImageTextMode,
    showButton,
    showViewPlanetButton,
    largeImageMode,
    perChannelTimestamp,
    activityNameMode,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showChannel'),
    presence.getSetting<boolean>('showDMs'),
    presence.getSetting<boolean>('showPlanet'),
    presence.getSetting<number>('smallImage'),
    presence.getSetting<number>('smallImageText'),
    presence.getSetting<boolean>('showButton'),
    presence.getSetting<boolean>('showViewPlanetButton'),
    presence.getSetting<number>('largeImage'),
    presence.getSetting<boolean>('perChannelTimestamp'),
    presence.getSetting<number>('activityName'),
  ])

  const smallImageDisabled = smallImageMode === 0
  if (smallImageDisabled !== lastSmallImageDisabled) {
    lastSmallImageDisabled = smallImageDisabled
    if (smallImageDisabled)
      presence.hideSetting('smallImageText')
    else
      presence.showSetting('smallImageText')
  };

  if (privacy) {
    const userCount = await getUserCount()
    presence.setActivity({
      largeImageKey: LOGO,
      details: 'Taking a look around',
      state: userCount !== undefined ? `Valournauts: ${userCount.toLocaleString()}` : undefined,
      startTimestamp: SESSION_START,
      buttons: showButton ? [{ label: 'Open Valour', url: 'https://valour.gg' }] : undefined,
    })
    return
  };

  const tab = getActiveTab()

  const username = smallImageMode !== 0 && smallImageTextMode === 1
    ? document.querySelector('.self-info .username')?.textContent?.trim()
    : undefined
  const avatarUrl = smallImageMode === 1
    ? getBackgroundImageUrl(document.querySelector('.self-info .user-avatar-img'))
    : undefined

  const canShowChannel = !!tab && showChannel && (tab.kind !== 'dm' || showDMs)
  const visiblePlanetName = showPlanet ? tab?.planetName : undefined

  const presenceData: PresenceData = {
    name: getActivityName(activityNameMode, canShowChannel ? tab!.label : undefined, visiblePlanetName),
    largeImageKey: (largeImageMode === 1 && canShowChannel && tab?.iconUrl) || LOGO,
    details: 'Taking a look around',
    startTimestamp: perChannelTimestamp ? getTabStartTimestamp(tab?.tabId) : SESSION_START,
  }

  if (canShowChannel) {
    presenceData.details = formatDetails(tab!)

    if (visiblePlanetName && tab!.kind !== 'about' && tab!.kind !== 'rules')
      presenceData.state = `In ${visiblePlanetName}`
    else if (tab!.kind === 'dm')
      presenceData.state = 'In Direct Messages'
  }
  else if (visiblePlanetName) {
    presenceData.details = `In ${visiblePlanetName}`
  }
  else {
    const userCount = await getUserCount()
    if (userCount !== undefined)
      presenceData.state = `Valournauts: ${userCount.toLocaleString()}`
  };

  const smallImageKey = smallImageMode === 1
    ? (avatarUrl ?? LOGO)
    : smallImageMode === 2 ? ((canShowChannel && tab?.iconUrl) || LOGO) : undefined

  const smallImageText = smallImageMode === 0
    ? undefined
    : smallImageTextMode === 1
      ? username
      : smallImageTextMode === 2 ? (canShowChannel ? tab!.label : undefined) : undefined

  if (smallImageKey || smallImageText) {
    presenceData.smallImageKey = smallImageKey ?? LOGO
    presenceData.smallImageText = smallImageText
  };

  const openValourButton = showButton ? { label: 'Open Valour', url: document.URL } : undefined
  const viewPlanetButton = showViewPlanetButton && tab?.planetId && await isPlanetDiscoverable(tab.planetId)
    ? { label: 'View Planet', url: `https://app.valour.gg/planet/${tab.planetId}` }
    : undefined

  if (openValourButton && viewPlanetButton)
    presenceData.buttons = [openValourButton, viewPlanetButton]
  else if (openValourButton)
    presenceData.buttons = [openValourButton]
  else if (viewPlanetButton)
    presenceData.buttons = [viewPlanetButton]

  presence.setActivity(presenceData)
})
