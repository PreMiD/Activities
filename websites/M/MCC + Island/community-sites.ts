import { CommunityAssets } from './community-assets.js'
import { communityIcon } from './community-icons.js'

type CommunitySite = 'lighthouse' | 'hub' | 'stats' | 'radar'
interface PlayerProfile {
  name?: string
  head?: string
  crown?: string
  level?: string
  section?: string
}

let lighthouseProfile: { key: string, profile: PlayerProfile, expires: number } | undefined

const sites: Record<string, CommunitySite> = {
  'stats.sirarchibald.dev': 'lighthouse',
  'lighthouse.gay': 'lighthouse',
  'mccihub.net': 'hub',
  'stats.derniklaas.de': 'stats',
  'radar.themysterys.com': 'radar',
}
const names: Record<CommunitySite, string> = {
  lighthouse: 'Lighthouse',
  hub: 'MCCI Hub',
  stats: 'MCC Island Stats',
  radar: 'Radar',
}
const labels: Record<CommunitySite, string> = {
  lighthouse: 'MCC Island Stats · Lighthouse',
  hub: 'MCC Island Stats · MCCI Hub',
  stats: 'MCC Island Stats · Niklas & Ally',
  radar: 'MCC Island Fishing Radar',
}
const islands = [
  'Verdant Woods',
  'Floral Forest',
  'Dark Grove',
  'Tropical Overgrowth',
  'Coral Shores',
  'Twisted Swamp',
  'Ancient Sands',
  'Blazing Canyon',
  'Ashen Wastes',
]
const sections: Record<string, string> = {
  'games': 'Games',
  'trophy-hunting': 'Trophy Hunting',
  'hunting': 'Trophy Hunting',
  'trophies': 'Trophy Hunting',
  'fishing': 'Fishing',
  'wardrobe': 'Wardrobe',
  'infinibag': 'Infinibag',
  'factions': 'Factions',
  'social': 'Socials',
}
const hubGames = new Set([
  'Battle Box',
  'Sky Battle',
  'Rocket Spleef Rush',
  'Dynaball',
  'Hole In The Wall',
  'TGTTOS',
  'To Get To The Other Side',
  'Parkour Warrior Survivor',
  'Parkour Warrior Dojo',
])

function hubSection(): string | undefined {
  // Read the selected trigger, never the dropdown's unselected options or friend sorting.
  return Array.from(document.querySelectorAll('[role="combobox"]'))
    .map(control => control.textContent?.trim().replace(/\s+/g, ' '))
    .find((label): label is string => Boolean(label && hubGames.has(label)))
}

function lighthouseSection(username: string, route?: string): string | undefined {
  if (route)
    return sections[route.toLowerCase()]
  const active = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]')).find((link) => {
    const url = new URL(link.getAttribute('href')!, document.location.href)
    return url.origin === document.location.origin
      && url.pathname.startsWith(`/player/${username}/`)
      && (link.getAttribute('aria-current') === 'page' || link.classList.contains('border-neutral-50'))
  })
  const activeRoute = active ? new URL(active.getAttribute('href')!, document.location.href).pathname.match(/\/player\/[^/]+\/([^/]+)/)?.[1] : undefined
  return sections[activeRoute ?? ''] ?? 'Games'
}

function crownLevel(image: HTMLImageElement): string | undefined {
  // Responsive layouts may keep multiple crowns; only accept an adjacent numeric level.
  return Array.from(image.parentElement?.children ?? [])
    .filter(element => element !== image && element.matches('p, span'))
    .map(element => element.textContent?.trim())
    .find(text => text && /^\d{1,4}$/.test(text))
}

export function communityHost(host: string): CommunitySite | undefined {
  return sites[host.toLowerCase().replace(/^www\./, '')]
}

function imageSource(image: HTMLImageElement | null | undefined): string | undefined {
  const source = image?.getAttribute('ngsrc') || image?.getAttribute('src') || image?.currentSrc
  if (!source)
    return undefined
  const url = new URL(source, document.location.href)
  return url.protocol === 'https:' ? url.href : undefined
}

function player(site: CommunitySite): PlayerProfile {
  const path = document.location.pathname
  const match = site === 'hub'
    ? path.match(/^\/view\/player\/(\w{1,16})(?:\/|$)/i)
    : path.match(/^\/player\/(\w{1,16})(?:\/([^/]+))?(?:\/|$)/i)
  if (!match) {
    if (site === 'lighthouse')
      lighthouseProfile = undefined
    return {}
  }
  const username = match[1]!
  const key = `${document.location.hostname}:${username.toLowerCase()}`
  if (site === 'lighthouse' && (lighthouseProfile?.key !== key || lighthouseProfile.expires < Date.now()))
    lighthouseProfile = undefined
  const section = site === 'hub'
    ? hubSection()
    : site === 'lighthouse' ? lighthouseSection(username, match[2]) : undefined
  const head = Array.from(document.querySelectorAll<HTMLImageElement>('img[alt]')).find((image) => {
    const alt = image.alt.toLowerCase()
    const expected = username.toLowerCase()
    return site === 'lighthouse'
      ? alt === expected
      : site === 'hub'
        ? alt === `${expected} minecraft head`
        : image.matches('img.avatar') && alt === `${expected} avatar`
  })
  const heading = site === 'stats'
    ? document.querySelector('h1.username')
    : site === 'hub' ? document.querySelector('h1') : undefined
  const name = site === 'lighthouse' ? head?.alt : heading?.textContent?.trim()
  // A newly changed URL must not publish the previous player's profile while SPA content loads.
  if (!head || name?.toLowerCase() !== username.toLowerCase()) {
    const cached = site === 'lighthouse' ? lighthouseProfile?.profile : undefined
    return { ...cached, name: username, section }
  }
  const crown = Array.from(document.querySelectorAll<HTMLImageElement>(site === 'lighthouse'
    ? 'img[alt="Crown Level Icon"]'
    : site === 'hub' ? 'img[alt="Crown Icon"]' : '.level-box img.level-icon'))
    .find(image => site === 'stats' || crownLevel(image))
  const levelText = site === 'stats'
    ? document.querySelector('.level-box .level-value .visually-hidden')?.textContent
    ?? document.querySelector('.level-box .level-value')?.textContent
    : crown ? crownLevel(crown) : undefined
  const level = levelText?.trim().match(/^\d{1,4}$/)?.[0]
  const profile: PlayerProfile = {
    name,
    head: imageSource(head),
    crown: level ? imageSource(crown) : undefined,
    level,
    section,
  }
  if (site === 'lighthouse') {
    const previous = lighthouseProfile?.profile
    const expires = profile.head && profile.crown && profile.level ? Date.now() + 30000 : lighthouseProfile?.expires ?? Date.now() + 30000
    profile.head ??= previous?.head
    if (!profile.crown || !profile.level) {
      profile.crown = previous?.crown
      profile.level = previous?.level
    }
    lighthouseProfile = { key, profile, expires }
  }
  return profile
}

export async function waitForCommunityProfile(site: CommunitySite, privacy: boolean): Promise<void> {
  if (site !== 'lighthouse' || privacy || !/^\/player\/\w{1,16}(?:\/|$)/i.test(document.location.pathname))
    return
  const ready = () => {
    const profile = player(site)
    return Boolean(profile.head && profile.crown && profile.level)
  }
  if (ready())
    return
  const url = document.location.href
  await new Promise<void>((resolve) => {
    let observer: MutationObserver
    let timeout: ReturnType<typeof setTimeout>
    const finish = () => {
      observer.disconnect()
      clearTimeout(timeout)
      resolve()
    }
    observer = new MutationObserver(() => {
      if (document.location.href !== url || document.visibilityState === 'hidden' || ready())
        finish()
    })
    timeout = setTimeout(finish, 2000)
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true })
    if (ready())
      finish()
  })
}

export function communityAvatarFallback(source: string): string {
  const url = new URL(source)
  const avatar = url.pathname.match(/^\/avatar\/([^/]+)(?:\/\d+)?(?:\/(nohelm)(?:\.png)?)?$/i)
  if (url.hostname === 'mc-heads.net' && avatar) {
    const identifier = avatar[1]!.replace(/\.png$/i, '')
    if (/^[\w-]{1,64}$/.test(identifier)) {
      url.pathname = `/avatar/${identifier}/512${avatar[2] ? '/nohelm' : ''}.png`
      url.search = ''
      url.hash = ''
    }
  }
  return url.href
}

function radarIsland(): { name?: string, icon?: string } {
  const heading = Array.from(document.querySelectorAll('h2')).map(n => n.textContent?.trim().replace(/\s*\(\d+\)$/, '')).find(name => name && islands.includes(name))
  if (!heading)
    return {}
  const slug = heading.toLowerCase().replaceAll(' ', '_')
  const selected = document.querySelector<HTMLElement>('.island-button-selected')
  const style = selected?.getAttribute('style')
  if (style && !style.includes(`${slug}.png`))
    return {}
  return { name: heading, icon: `https://islandcdn.themysterys.com/fishing/islands/${slug}.png` }
}

export function communitySelection(site: CommunitySite, privacy = false): string {
  if (privacy) {
    if (site === 'lighthouse')
      lighthouseProfile = undefined
    return JSON.stringify([document.location.href, 'private'])
  }
  return JSON.stringify([document.location.href, site === 'radar' ? radarIsland() : player(site)])
}

export function getCommunityData(site: CommunitySite, privacy: boolean, buttons: boolean): Partial<PresenceData> {
  const result: Partial<PresenceData> = {
    name: labels[site],
    details: site === 'radar' ? 'Looking at the Radar' : privacy ? 'Looking at statistics' : 'Browsing statistics',
    largeImageKey: CommunityAssets[site],
    largeImageText: names[site],
  }
  if (privacy) {
    if (site === 'lighthouse')
      lighthouseProfile = undefined
    return result
  }
  if (site === 'radar') {
    const island = radarIsland()
    result.details = 'Looking for Fishing Spots'
    if (island.name && island.icon) {
      result.state = island.name
      result.smallImageKey = communityIcon(island.icon)
      result.smallImageText = island.name
    }
    // No homepage button without an explicit exception from the PreMiD review team.
    return result
  }
  const profile = player(site)
  if (profile.name) {
    result.details = 'Looking at player statistics'
    result.state = profile.section ? `${profile.name} · ${profile.section}` : profile.name
    if (profile.head) {
      result.largeImageKey = profile.head
      result.largeImageText = profile.name
    }
    if (profile.crown && profile.level) {
      result.smallImageKey = communityIcon(profile.crown)
      result.smallImageText = `Crown level: ${profile.level}`
    }
    if (buttons) {
      const url = new URL(document.location.href)
      url.search = ''
      url.hash = ''
      result.buttons = [{ label: 'View Player Statistics', url: url.href }]
      if (profile.head)
        result.largeImageUrl = url.href
    }
  }
  else {
    const path = document.location.pathname.replace(/\/+$/, '')
    if (!path)
      result.details = 'Choosing a player'
    else if (path === '/leaderboards')
      result.details = 'Looking at leaderboards'
    else if (path === '/compare')
      result.details = 'Comparing players'
    else if (path === '/exchange')
      result.details = 'Looking at the Island Exchange'
  }
  return result
}

export async function fitCommunityImage(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context)
      return blob
    context.imageSmoothingEnabled = false
    const scale = 448 / Math.max(bitmap.width, bitmap.height)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    context.drawImage(bitmap, (512 - width) / 2, (512 - height) / 2, width, height)
    return await new Promise(resolve => canvas.toBlob(image => resolve(image ?? blob), 'image/png'))
  }
  finally {
    bitmap.close()
  }
}
