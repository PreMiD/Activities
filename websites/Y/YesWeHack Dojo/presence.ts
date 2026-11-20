import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1572552418951041184',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const LOGO = 'https://i.imgur.com/Wo4reYe.jpeg'

type PresenceIcon = 'reading' | 'search' | 'viewing' | 'solving'

const ICONS: Record<PresenceIcon, { key: string, text: string }> = {
  reading: { key: Assets.Reading, text: 'Learning' },
  search: { key: Assets.Search, text: 'Browsing' },
  viewing: { key: Assets.Viewing, text: 'Viewing' },
  solving: { key: Assets.Play, text: 'Challenging' },
}

const CATEGORY_LABELS: Record<string, string> = {
  'vulnerabilities': 'Vulnerabilities',
  'waf-bypass': 'WAF bypass',
  'python-pitfalls': 'Python pitfalls',
  'unknown-syntax': 'Unknown syntax',
  'bugbounty': 'Bug bounty',
}

const GENERIC_TITLES = new Set(['yeswehack - dojo', 'yeswehack', 'dojo'])

const TITLE_SUFFIX = /\s+[-–]\s+(?:yeswehack dojo|dojo)$/i

interface PrivacyOptions {
  privacyMode: boolean
  hideProfileName: boolean
}

interface ClassifiedPresence {
  details: string
  state?: string
  icon: PresenceIcon
}

interface ClassifyInput extends PrivacyOptions {
  segments: string[]
  title: string
  lessonHeading?: string | null
  challengeHeading?: string | null
}

const EXPLORING: ClassifiedPresence = {
  details: 'Browsing Dojo',
  state: 'Exploring',
  icon: 'search',
}

const PRIVATE: ClassifiedPresence = {
  details: 'Browsing Dojo',
  icon: 'search',
}

function categoryLabel(segment: string): string | undefined {
  return CATEGORY_LABELS[segment.trim().toLowerCase()]
}

function slugToTitle(slug: string): string | undefined {
  const spaced = slug.replace(/[-_]+/g, ' ').trim()
  if (!spaced) {
    return undefined
  }

  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
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

  return fallbackSlug ? slugToTitle(fallbackSlug) : undefined
}

function clamp(value: string, max = 128): string {
  if (value.length <= max) {
    return value
  }

  return `${value.slice(0, max - 3).trimEnd()}...`
}

function segmentsFromPathname(pathname: string): string[] {
  return pathname.split('/').filter(Boolean)
}

function shouldShowButton(segments: string[], options: PrivacyOptions): boolean {
  if (segments.length === 0 || options.privacyMode) {
    return false
  }

  return !(options.hideProfileName && segments[0] === 'user')
}

function classifyLearn(input: ClassifyInput): ClassifiedPresence {
  const { segments, lessonHeading, title } = input
  const second = segments[1]
  const last = segments.at(-1)

  if (segments.length === 1) {
    return {
      details: 'Browsing training modules',
      state: 'All categories',
      icon: 'search',
    }
  }

  if (segments.length === 2) {
    const label = categoryLabel(second ?? '') ?? slugToTitle(second ?? '')

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

function classifyMonthlyChallenge(input: ClassifyInput): ClassifiedPresence {
  const { segments, challengeHeading, title } = input

  return {
    details: segments.length === 1
      ? 'Browsing monthly challenges'
      : `Solving ${pickTitle([challengeHeading, title], segments.at(-1)) ?? 'monthly challenge'}`,
    state: 'Challenge of the month',
    icon: segments.length === 1 ? 'search' : 'solving',
  }
}

function classifyChallenge(input: ClassifyInput, variant: string | undefined): ClassifiedPresence {
  switch (variant) {
    case 'play': {
      const challengeTitle = pickTitle(
        [input.challengeHeading, input.title],
        input.segments.at(-1),
      )

      return {
        details: challengeTitle
          ? `Solving challenge: ${challengeTitle}`
          : 'Solving an official challenge',
        state: 'Official challenge',
        icon: 'solving',
      }
    }
    case 'tutorial':
      return {
        details: 'Solving the tutorial',
        state: 'Guided challenge',
        icon: 'solving',
      }
    case 'create':
      return {
        details: 'Building a challenge',
        state: 'Challenge editor',
        icon: 'solving',
      }
    default:
      return EXPLORING
  }
}

function classifyProfile(input: ClassifyInput): ClassifiedPresence {
  const profileName = input.hideProfileName ? undefined : pickTitle([input.title])

  return {
    details: profileName ? `Viewing ${profileName}` : 'Viewing a Dojo profile',
    state: 'Dojo profile',
    icon: 'viewing',
  }
}

function classify(input: ClassifyInput): ClassifiedPresence {
  if (input.privacyMode) {
    return PRIVATE
  }

  const { segments } = input
  if (segments.length === 0) {
    return {
      details: 'Improving bug hunting skills',
      state: 'Home',
      icon: 'search',
    }
  }

  switch (segments[0]) {
    case 'learn':
      return classifyLearn(input)
    case 'challenge-of-the-month':
      return classifyMonthlyChallenge(input)
    case 'challenge':
      return classifyChallenge(input, segments[1])
    case 'user':
      return classifyProfile(input)
    default:
      return EXPLORING
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
  const icon = ICONS[data.icon]

  return {
    details: clamp(data.details),
    ...(data.state ? { state: clamp(data.state) } : {}),
    largeImageKey: LOGO,
    smallImageKey: icon.key,
    smallImageText: icon.text,
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

  const privacy: PrivacyOptions = {
    privacyMode: Boolean(privacyMode),
    hideProfileName: Boolean(hideProfileName),
  }

  const segments = segmentsFromPathname(document.location.pathname)
  const presenceData = buildPresence(classify({
    segments,
    title: document.title,
    lessonHeading: lessonHeading(),
    challengeHeading: challengeHeading(),
    ...privacy,
  }))

  if (!showTimestamp) {
    delete presenceData.startTimestamp
  }

  if (showButtons && shouldShowButton(segments, privacy)) {
    presenceData.buttons = [
      {
        label: 'View page',
        url: document.location.href,
      },
    ]
  }

  presence.setActivity(presenceData)
})
