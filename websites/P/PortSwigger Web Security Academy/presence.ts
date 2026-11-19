import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: 'PORT SWIGGER CLIENT ID',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const INDEX_NAMES: Record<string, string> = {
  '/all-labs': 'All labs',
  '/all-topics': 'All topics',
  '/all-materials': 'All materials',
}

export type PageKind = 'home' | 'lab' | 'article' | 'index' | 'learningPath' | 'dashboard' | 'hallOfFame' | 'other'

export interface ActivitySettings {
  showTimestamp: boolean
  showButtons: boolean
  privacyMode: boolean
  showRank: boolean
  showProgress: boolean
  showLevel: boolean
  showUsername: boolean
  showDifficulty: boolean
}

export function clamp(value: string, max = 128): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

export function getPageKind(pathname: string): PageKind {
  if (pathname === '/web-security' || pathname === '/web-security/')
    return 'home'
  if (pathname.includes('/all-topics') || pathname.includes('/all-labs') || pathname.includes('/all-materials'))
    return 'index'
  if (pathname.includes('/learning-paths'))
    return 'learningPath'
  if (pathname.includes('/dashboard'))
    return 'dashboard'
  if (pathname.includes('/hall-of-fame'))
    return 'hallOfFame'

  const segments = pathname.split('/').filter(Boolean)
  if (segments.at(-1)?.startsWith('lab-'))
    return 'lab'
  if (segments.length >= 3)
    return 'article'
  return 'other'
}

export function getTopic(): string | null {
  return document.querySelectorAll('ul.breadcrumb-list span[itemprop="name"]')[1]?.textContent?.trim() ?? null
}

export function getHeading(): string | null {
  return document.querySelector('h1.heading-2')?.textContent?.trim() ?? null
}

export function getLabTitle(): string | null {
  if (getPageKind(document.location.pathname) !== 'lab')
    return null
  return document.title
    .replace(/^Lab:\s*/, '')
    .replace(/\s*\|\s*Web Security Academy(?: - PortSwigger)?$/, '')
    .trim() || null
}

export interface AccountStats {
  rank: string | null
  percent: string | null
  solved: number | null
  level: string | null
  username: string | null
}

function text(selector: string): string | null {
  return document.querySelector(selector)?.textContent?.trim() || null
}

export function getAccountStats(): AccountStats {
  const rankMatch = text('#currentUserRank')?.match(/#\s*(\d+)/)
  const statusText = text('#ajaxUserStatus')
  const username = statusText?.split('You\'re showing as ')[1]?.trim() ?? null

  const progressSelectors = [
    '.apprentice-progress .radial-text-element__progress',
    '.practitioner-progress .radial-text-element__progress',
    '.expert-progress .radial-text-element__progress',
  ]
  const counts = progressSelectors.map(selector => Number.parseInt(text(selector) ?? '', 10))
  const solved = counts.some(Number.isNaN) ? null : counts.reduce((sum, count) => sum + count, 0)

  return {
    rank: rankMatch?.[1] ?? null,
    percent: text('#AcademyAccountStatusWidget .progress-with-percent text'),
    solved,
    level: text('[class^="lab-level-display__"]'),
    username: username && username !== 'ANONYMOUS' ? username : null,
  }
}

export function getLabDifficulty(): string | null {
  return text('p.widget-container-labelevel span')
}

export function isLabSolved(): boolean {
  return !!document.querySelector('.widgetcontainer-lab-status.is-solved') || text('span.lab-status-icon') === 'Solved'
}

export async function readSettings(): Promise<ActivitySettings> {
  const [
    showTimestamp,
    showButtons,
    privacyMode,
    showRank,
    showProgress,
    showLevel,
    showUsername,
    showDifficulty,
  ] = await Promise.all([
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('showRank'),
    presence.getSetting<boolean>('showProgress'),
    presence.getSetting<boolean>('showLevel'),
    presence.getSetting<boolean>('showUsername'),
    presence.getSetting<boolean>('showDifficulty'),
  ])
  return {
    showTimestamp,
    showButtons,
    privacyMode,
    showRank,
    showProgress,
    showLevel,
    showUsername,
    showDifficulty,
  }
}

presence.on('UpdateData', async () => {
  const settings = await readSettings()
  const { pathname } = document.location
  const pageKind = getPageKind(pathname)

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PortSwigger%20Web%20Security%20Academy/assets/logo.png',
    largeImageText: 'PortSwigger Web Security Academy',
  }

  switch (pageKind) {
    case 'lab': {
      presenceData.smallImageKey = Assets.Play
      const title = getLabTitle()
      presenceData.details = title ? `Solving Lab: '${title}'` : 'Solving a lab'
      const difficulty = settings.showDifficulty ? getLabDifficulty() : null
      presenceData.state = `${difficulty ? `${difficulty} · ` : ''}${isLabSolved() ? 'Solved' : 'In progress'}`
      break
    }
    case 'article': {
      presenceData.smallImageKey = Assets.Reading
      const heading = getHeading()
      presenceData.details = `Reading: ${getTopic() ?? heading ?? 'documentation'}`
      if (heading)
        presenceData.state = heading
      break
    }
    case 'index': {
      presenceData.smallImageKey = Assets.Viewing
      const name = Object.entries(INDEX_NAMES).find(([path]) => pathname.includes(path))?.[1] ?? 'topics'
      presenceData.details = `Browsing: ${name}`
      break
    }
    case 'learningPath': {
      presenceData.smallImageKey = Assets.Reading
      const segments = pathname.split('/').filter(Boolean)
      const pathIndex = segments.indexOf('learning-paths') + 1
      const slug = segments[pathIndex]
      if (!slug) {
        presenceData.details = 'Browsing: Learning paths'
        break
      }
      presenceData.details = `Following learning path: ${slug.replaceAll('-', ' ')}`
      const heading = getHeading()
      if (heading)
        presenceData.state = heading
      break
    }
    case 'dashboard': {
      presenceData.smallImageKey = Assets.Viewing
      const stats = getAccountStats()
      presenceData.details = settings.showUsername && stats.username
        ? `Username: ${stats.username}`
        : 'Browsing dashboard'

      const parts: string[] = []
      if (settings.showRank && stats.rank)
        parts.push(`Rank: #${stats.rank}`)
      if (settings.showLevel && stats.level)
        parts.push(`Level: ${stats.level}`)
      if (settings.showProgress && stats.solved !== null)
        parts.push(`Solved: ${stats.solved}`)
      if (settings.showProgress && stats.percent)
        parts.push(stats.percent)
      if (parts.length > 0)
        presenceData.state = parts.join(' | ')
      break
    }
    case 'hallOfFame': {
      presenceData.smallImageKey = Assets.Viewing
      const stats = getAccountStats()
      presenceData.details = settings.showUsername && stats.username
        ? `Viewing Hall of Fame | Username: ${stats.username}`
        : 'Viewing Hall of Fame'
      if (settings.showRank && stats.rank)
        presenceData.state = `Rank: #${stats.rank}`
      break
    }
    default: {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.details = 'Browsing PortSwigger Academy'
    }
  }

  if (settings.showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  if (settings.showButtons) {
    presenceData.buttons = [
      {
        label: 'View page',
        url: document.location.href,
      },
    ]
  }

  if (settings.privacyMode) {
    presenceData.details = 'Browsing PortSwigger Academy'
    delete presenceData.state
    delete presenceData.startTimestamp
    delete presenceData.smallImageKey
    delete presenceData.smallImageText
    delete presenceData.buttons
  }

  if (typeof presenceData.details === 'string')
    presenceData.details = clamp(presenceData.details)
  if (typeof presenceData.state === 'string')
    presenceData.state = clamp(presenceData.state)

  presence.setActivity(presenceData)
})
