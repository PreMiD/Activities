const presence = new Presence({
  clientId: '1572552418951041184',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const LOGO = 'https://i.imgur.com/Wo4reYe.jpeg'

const ICONS = {
  reading: 'https://i.imgur.com/ISdDisx.png',
  search: 'https://i.imgur.com/v2jmsTL.png',
  viewing: 'https://i.imgur.com/kW3Omjg.png',
  solving: 'https://i.imgur.com/cf4WJcY.png',
} as const

const ICON_TEXT = {
  reading: 'Learning',
  search: 'Browsing',
  viewing: 'Viewing',
  solving: 'Challenging',
} as const

const CATEGORY_LABELS: Record<string, string> = {
  'vulnerabilities': 'Vulnerabilities',
  'waf-bypass': 'WAF bypass',
  'python-pitfalls': 'Python pitfalls',
  'unknown-syntax': 'Unknown syntax',
  'bugbounty': 'Bug bounty',
}

const GENERIC_TITLES = new Set(['yeswehack - dojo', 'yeswehack', 'dojo'])

const TITLE_SUFFIX = /\s+[-–]\s+(?:yeswehack dojo|dojo)$/i

type PresenceIcon = 'reading' | 'search' | 'viewing' | 'solving'

interface ClassifiedPresence {
  details: string
  state?: string
  icon: PresenceIcon
}

interface ClassifyInput {
  segments: string[]
  title: string
  lessonHeading?: string | null
  challengeHeading?: string | null
  privacyMode?: boolean
  hideProfileName?: boolean
}

interface ButtonOptions {
  privacyMode?: boolean
  hideProfileName?: boolean
}

function categoryLabel(segment: string): string | undefined {
  return CATEGORY_LABELS[segment.trim().toLowerCase()]
}

function cleanTitle(raw: string | null | undefined): string | undefined {
  const collapsed = raw?.replace(/\s+/g, ' ').trim()
  if (!collapsed) {
    return undefined
  }

  const stripped = collapsed.replace(TITLE_SUFFIX, '').trim()
  if (!stripped || GENERIC_TITLES.has(stripped.toLowerCase())) {
    return undefined
  }

  return stripped
}

function pickTitle(
  candidates: Array<string | null | undefined>,
  fallbackSlug?: string,
): string | undefined {
  for (const candidate of candidates) {
    const title = cleanTitle(candidate)
    if (title) {
      return title
    }
  }

  const fromSlug = fallbackSlug?.replace(/[-_]+/g, ' ').trim()
  if (!fromSlug) {
    return undefined
  }

  return fromSlug.charAt(0).toUpperCase() + fromSlug.slice(1)
}

function clamp(value: string, max = 128): string {
  if (value.length <= max) {
    return value
  }

  return `${value.slice(0, max - 1).trimEnd()}...`
}

function segmentsFromPathname(pathname: string): string[] {
  return pathname.split('/').filter(Boolean)
}

function shouldShowButton(
  pathname: string,
  options: ButtonOptions = {},
): boolean {
  const segments = segmentsFromPathname(pathname)
  if (segments.length === 0 || options.privacyMode) {
    return false
  }

  return !(options.hideProfileName && segments[0] === 'user')
}

function classify(input: ClassifyInput): ClassifiedPresence {
  const {
    segments,
    title,
    lessonHeading,
    challengeHeading,
    privacyMode,
    hideProfileName,
  } = input
  const [first, second] = segments
  const last = segments.at(-1)

  if (privacyMode) {
    return {
      details: 'Browsing Dojo',
      icon: 'search',
    }
  }

  if (segments.length === 0) {
    return {
      details: 'Improving bug hunting skills',
      state: 'Home',
      icon: 'search',
    }
  }

  if (first === 'learn') {
    if (segments.length === 1) {
      return {
        details: 'Browsing training modules',
        state: 'All categories',
        icon: 'search',
      }
    }

    if (segments.length === 2) {
      const label = categoryLabel(second ?? '') ?? pickTitle([], second)

      return {
        details: label ? `Browsing ${label} lessons` : 'Browsing training modules',
        state: label ? 'Training modules' : 'All categories',
        icon: 'search',
      }
    }

    return {
      details: `Reading lesson: ${pickTitle([lessonHeading, title], last) ?? 'Training module'}`,
      state: categoryLabel(second ?? '') ?? 'Training module',
      icon: 'reading',
    }
  }

  if (first === 'challenge-of-the-month') {
    return {
      details: segments.length === 1
        ? 'Browsing monthly challenges'
        : `Solving ${pickTitle([challengeHeading, title], last) ?? 'monthly challenge'}`,
      state: 'Challenge of the month',
      icon: segments.length === 1 ? 'search' : 'solving',
    }
  }

  if (first === 'challenge' && second === 'play') {
    const challengeTitle = pickTitle([challengeHeading, title], last)

    return {
      details: challengeTitle
        ? `Solving challenge: ${challengeTitle}`
        : 'Solving an official challenge',
      state: 'Official challenge',
      icon: 'solving',
    }
  }

  if (first === 'challenge' && second === 'tutorial') {
    return {
      details: 'Solving the tutorial',
      state: 'Guided challenge',
      icon: 'solving',
    }
  }

  if (first === 'challenge' && second === 'create') {
    return {
      details: 'Building a challenge',
      state: 'Challenge editor',
      icon: 'solving',
    }
  }

  if (first === 'user') {
    const profileName = hideProfileName ? undefined : pickTitle([title])

    return {
      details: profileName ? `Viewing ${profileName}` : 'Viewing a Dojo profile',
      state: 'Dojo profile',
      icon: 'viewing',
    }
  }

  return {
    details: 'Browsing Dojo',
    state: 'Exploring',
    icon: 'search',
  }
}

function lessonHeading(): string | null | undefined {
  return document.querySelector<HTMLElement>('.p-4.text-center.text-3xl.font-semibold')?.textContent
}

function challengeHeading(): string | null | undefined {
  return document.querySelector<HTMLElement>('h1.text-shadow')?.textContent
    ?? document.querySelector<HTMLElement>('h1')?.textContent
}

function buildPresence(data: ClassifiedPresence): PresenceData {
  return {
    details: data.details,
    ...(data.state ? { state: data.state } : {}),
    largeImageKey: LOGO,
    smallImageKey: ICONS[data.icon],
    smallImageText: ICON_TEXT[data.icon],
    startTimestamp: browsingTimestamp,
  }
}

presence.on('UpdateData', async () => {
  const [showTimestamp, showButtons, privacyMode, hideProfileName] = await Promise.all([
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('hideProfileName'),
  ])

  const pathname = document.location.pathname
  const presenceData = buildPresence(classify({
    segments: segmentsFromPathname(pathname),
    title: document.title,
    lessonHeading: lessonHeading(),
    challengeHeading: challengeHeading(),
    privacyMode: Boolean(privacyMode),
    hideProfileName: Boolean(hideProfileName),
  }))

  if (!showTimestamp) {
    delete presenceData.startTimestamp
  }

  if (showButtons && shouldShowButton(pathname, {
    privacyMode: Boolean(privacyMode),
    hideProfileName: Boolean(hideProfileName),
  })) {
    presenceData.buttons = [
      {
        label: 'View page',
        url: document.location.href,
      },
    ]
  }

  if (!presenceData.details) {
    presence.clearActivity()
    return
  }

  presenceData.details = clamp(String(presenceData.details))

  if (presenceData.state) {
    presenceData.state = clamp(String(presenceData.state))
  }

  presence.setActivity(presenceData)
})
