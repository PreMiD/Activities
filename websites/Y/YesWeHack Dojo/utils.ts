const CATEGORY_LABELS: Record<string, string> = {
  'vulnerabilities': 'Vulnerabilities',
  'waf-bypass': 'WAF bypass',
  'python-pitfalls': 'Python pitfalls',
  'unknown-syntax': 'Unknown syntax',
  'bugbounty': 'Bug bounty',
}

const GENERIC_TITLES = new Set(['yeswehack - dojo', 'yeswehack', 'dojo'])

const TITLE_SUFFIX = /\s+[-–]\s+(?:yeswehack dojo|dojo)$/i

export function categoryLabel(segment: string): string | undefined {
  return CATEGORY_LABELS[segment.trim().toLowerCase()]
}

export function cleanTitle(raw: string | null | undefined): string | undefined {
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

export function pickTitle(
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

export function clamp(value: string, max = 128): string {
  if (value.length <= max) {
    return value
  }

  return `${value.slice(0, max - 1).trimEnd()}…`
}

export function segmentsFromPathname(pathname: string): string[] {
  return pathname.split('/').filter(Boolean)
}

export function shouldShowButton(pathname: string): boolean {
  return segmentsFromPathname(pathname).length > 0
}

export type PresenceIcon = 'reading' | 'search' | 'viewing'

export interface ClassifiedPresence {
  details: string
  state?: string
  competing: boolean
  icon: PresenceIcon
}

export interface ClassifyInput {
  segments: string[]
  title: string
  lessonHeading?: string | null
  challengeHeading?: string | null
}

export function classify(input: ClassifyInput): ClassifiedPresence {
  const { segments, title, lessonHeading, challengeHeading } = input
  const [first, second] = segments
  const last = segments.at(-1)

  if (segments.length === 0) {
    return {
      details: 'Improving bug hunting skills',
      state: 'Home',
      competing: false,
      icon: 'reading',
    }
  }

  if (first === 'learn') {
    if (segments.length === 1) {
      return {
        details: 'Browsing training modules',
        state: 'All categories',
        competing: false,
        icon: 'reading',
      }
    }

    if (segments.length === 2) {
      return {
        details: 'Browsing training modules',
        state: categoryLabel(second ?? '') ?? 'All categories',
        competing: false,
        icon: 'reading',
      }
    }

    return {
      details: pickTitle([lessonHeading, title], last) ?? 'Training module',
      state: categoryLabel(second ?? '') ?? 'Training module',
      competing: false,
      icon: 'reading',
    }
  }

  if (first === 'challenge-of-the-month') {
    return {
      details: segments.length === 1
        ? 'Browsing monthly challenges'
        : pickTitle([challengeHeading, title], last) ?? 'Challenge of the month',
      state: 'Challenge of the month',
      competing: true,
      icon: 'search',
    }
  }

  if (first === 'challenge' && second === 'play') {
    return {
      details: pickTitle([challengeHeading, title], last) ?? 'Official challenge',
      state: 'Official challenge',
      competing: true,
      icon: 'search',
    }
  }

  if (first === 'challenge' && second === 'tutorial') {
    return {
      details: 'Solving the tutorial',
      state: 'Tutorial',
      competing: true,
      icon: 'search',
    }
  }

  if (first === 'challenge' && second === 'create') {
    return {
      details: 'Creating a challenge',
      state: 'Challenge editor',
      competing: true,
      icon: 'search',
    }
  }

  if (first === 'user') {
    return {
      details: pickTitle([title]) ?? 'Viewing a Dojo profile',
      state: 'Dojo profile',
      competing: false,
      icon: 'viewing',
    }
  }

  return {
    details: 'Browsing Dojo',
    competing: false,
    icon: 'search',
  }
}
