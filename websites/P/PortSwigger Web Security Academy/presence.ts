import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1573085782820913223',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const INDEX_NAMES: Record<string, string> = {
  '/all-labs': 'all labs',
  '/all-topics': 'all topics',
  '/all-materials': 'all materials',
}

const SETTING_KEYS = [
  'showTimestamp',
  'showButtons',
  'privacyMode',
  'showRank',
  'showProgress',
  'showLevel',
  'showUsername',
  'showDifficulty',
] as const

type PageKind = 'home' | 'lab' | 'article' | 'index' | 'learningPath' | 'dashboard' | 'hallOfFame' | 'other'

type ActivitySettings = Record<typeof SETTING_KEYS[number], boolean>

function clamp(value: string, max = 128): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function getPageKind(pathname: string): PageKind {
  if (pathname === '/web-security' || pathname === '/web-security/')
    return 'home'
  if (Object.keys(INDEX_NAMES).some(path => pathname.includes(path)))
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
  if (segments.length >= 2)
    return 'article'
  return 'other'
}

function getTopic(): string | null {
  return text('ul.breadcrumb-list span[itemprop="name"]', 1)
}

function getHeading(): string | null {
  return text('h1.heading-2')
}

function getBreadcrumbDepth(): number {
  return document.querySelectorAll('ul.breadcrumb-list li[itemprop="itemListElement"]').length
}

// Topic pages link straight to a heading, e.g. /web-security/sql-injection#what-is-sql-injection-sqli.
function getAnchoredSection(): string | null {
  const id = decodeURIComponent(document.location.hash.slice(1))
  const target = id ? document.getElementById(id) : null
  return target?.matches('h1, h2, h3, h4, h5, h6')
    ? target.textContent?.trim() || null
    : null
}

function getLearningPathSection(): string | null {
  return text('.learning-path-content-main-static h2')
}

function getLearningPathName(): string | null {
  return text('.learning-path-header-details strong') ?? text('h2.margin-top-tiny')
}

function getLabTitle(): string | null {
  return document.title
    .replace(/^Lab:\s*/, '')
    .replace(/\s*\|\s*Web Security Academy(?: - PortSwigger)?$/, '')
    .trim() || null
}

interface AccountStats {
  rank: string | null
  percent: string | null
  solved: number | null
  level: string | null
  username: string | null
}

const LEVEL_NAMES = new Set(['NEWBIE', 'APPRENTICE', 'PRACTITIONER', 'EXPERT'])
const PROGRESS_LEVELS = ['apprentice', 'practitioner', 'expert']

function text(selector: string, index = 0): string | null {
  return document.querySelectorAll(selector)[index]?.textContent?.trim() || null
}

function progressCount(scope: ParentNode, level: string): number | null {
  const value = Number.parseInt(
    scope.querySelector(`.${level}-progress .radial-text-element-progress, .${level}-progress .radial-text-element__progress`)?.textContent?.trim() ?? '',
    10,
  )
  return Number.isNaN(value) ? null : value
}

function sumCounts(counts: Array<number | null>): number | null {
  let total = 0
  for (const count of counts) {
    if (count === null)
      return null
    total += count
  }
  return total
}

function getLevelProgressScope(): ParentNode {
  // The dashboard repeats the same rings under "Exam preparation steps", so count only this card.
  return [...document.querySelectorAll('.container-cards-charcoal-rounded')]
    .find(card => card.querySelector('h3')?.textContent?.trim() === 'Level progress') ?? document
}

function getAccountStats(): AccountStats {
  const rankMatch = text('#currentUserRank')?.match(/#\s*(\d+)/)
  const statusText = text('#ajaxUserStatus')
  const username = statusText?.match(/showing as\s+([^\s[]+)/i)?.[1]?.trim() ?? null

  const scope = getLevelProgressScope()
  const solved = sumCounts(PROGRESS_LEVELS.map(level => progressCount(scope, level)))

  return {
    rank: rankMatch?.[1] ?? null,
    percent: text('.progress-with-percent text'),
    solved,
    level: [...document.querySelectorAll('[class*="lab-level-"]')]
      .map(element => element.textContent?.trim() ?? '')
      .find(name => LEVEL_NAMES.has(name)) ?? null,
    username: username && username !== 'ANONYMOUS' ? username : null,
  }
}

function formatAccountState(
  stats: AccountStats,
  settings: ActivitySettings,
  include: { level?: boolean, progress?: boolean },
): string | undefined {
  const parts: string[] = []
  if (settings.showUsername && stats.username)
    parts.push(`Username: ${stats.username}`)
  if (settings.showRank && stats.rank)
    parts.push(`Rank: #${stats.rank}`)
  if (include.level && settings.showLevel && stats.level)
    parts.push(`Level: ${stats.level}`)
  if (include.progress && settings.showProgress && stats.solved !== null)
    parts.push(`Solved: ${stats.solved}`)
  if (include.progress && settings.showProgress && stats.percent)
    parts.push(stats.percent)
  return parts.length > 0 ? parts.join(' | ') : undefined
}

function getLabDifficulty(): string | null {
  return text('p.widget-container-labelevel span')
}

function isLabSolved(): boolean {
  return !!document.querySelector('.widgetcontainer-lab-status.is-solved') || text('span.lab-status-icon') === 'Solved'
}

async function readSettings(): Promise<ActivitySettings> {
  const values = await Promise.all(SETTING_KEYS.map(key => presence.getSetting<boolean>(key)))
  return Object.fromEntries(
    SETTING_KEYS.map((key, index) => [key, values[index]]),
  ) as ActivitySettings
}

presence.on('UpdateData', async () => {
  const settings = await readSettings()
  const { pathname } = document.location
  const pageKind = getPageKind(pathname)

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/jQH4vOH.png',
    largeImageText: 'PortSwigger Academy',
  } as PresenceData

  switch (pageKind) {
    case 'lab': {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Solving'
      const title = getLabTitle()
      presenceData.details = title ? `Solving Lab: ${title}` : 'Solving a lab'
      const difficulty = settings.showDifficulty ? getLabDifficulty() : null
      presenceData.state = `${difficulty ? `${difficulty} · ` : ''}${isLabSolved() ? 'Solved' : 'In progress'}`
      break
    }
    case 'article': {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      const heading = getHeading()
      presenceData.details = `Reading: ${getTopic() ?? heading ?? 'documentation'}`
      // A hash names the heading being read; otherwise only topic sub-pages name a section.
      const section = getAnchoredSection() ?? (getBreadcrumbDepth() >= 3 ? heading : null)
      if (section)
        presenceData.state = `Section: ${section}`
      break
    }
    case 'index': {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Browsing'
      const [indexPath, indexName] = Object.entries(INDEX_NAMES).find(([path]) => pathname.includes(path)) ?? []
      const section = getAnchoredSection()
      // All-labs deep links read naturally as "Browsing <topic> labs", so keep it in details.
      if (indexPath === '/all-labs') {
        presenceData.details = section ? `Browsing ${section} labs` : 'Browsing all labs'
        break
      }
      presenceData.details = `Browsing ${indexName ?? 'the index'}`
      if (section)
        presenceData.state = `Section: ${section}`
      break
    }
    case 'learningPath': {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      const segments = pathname.split('/').filter(Boolean)
      const pathIndex = segments.indexOf('learning-paths') + 1
      const slug = segments[pathIndex]
      if (!slug) {
        presenceData.details = 'Browsing learning paths'
        break
      }
      presenceData.details = `Following learning path: ${getLearningPathName() ?? slug.replaceAll('-', ' ')}`
      const section = getLearningPathSection()
      if (section)
        presenceData.state = `Section: ${section}`
      break
    }
    case 'dashboard': {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Browsing'
      const stats = getAccountStats()
      presenceData.details = 'Browsing the dashboard'

      const state = formatAccountState(stats, settings, { level: true, progress: true })
      if (state)
        presenceData.state = state
      break
    }
    case 'hallOfFame': {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Browsing'
      const stats = getAccountStats()
      presenceData.details = 'Looking at the Hall of Fame'

      const state = formatAccountState(stats, settings, {})
      if (state)
        presenceData.state = state
      break
    }
    default: {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Browsing'
      presenceData.details = 'Browsing PortSwigger Academy'
    }
  }

  if (settings.showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  // Contribution guidelines forbid a button that redirects to the main page.
  if (settings.showButtons && pageKind !== 'home' && pageKind !== 'other') {
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
