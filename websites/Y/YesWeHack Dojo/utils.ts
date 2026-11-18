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
