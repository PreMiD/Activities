const maxLine = 120

export class Utils {
  static getRoutePattern(location: Location): string {
    const { pathname } = location
    if (pathname === '/' || pathname === '') {
      return '/'
    }
    if (/^\/comic\/[^/]+\/chapter\/[^/]+/.test(pathname)) {
      return '/comic/chapter'
    }
    if (/^\/novel\/[^/]+\/chapter\/[^/]+/.test(pathname)) {
      return '/novel/chapter'
    }
    if (/^\/comic\/[^/]+\/covers/.test(pathname)) {
      return '/comic/covers'
    }
    if (/^\/comic\/[^/]+\/?$/.test(pathname)) {
      return '/comic'
    }
    if (/^\/novel\/[^/]+\/?$/.test(pathname)) {
      return '/novel'
    }
    if (pathname.startsWith('/browse')) {
      return '/browse'
    }
    if (pathname.startsWith('/popular')) {
      return '/popular'
    }
    if (pathname.startsWith('/random')) {
      return '/random'
    }
    if (pathname.startsWith('/search')) {
      return '/search'
    }
    if (pathname.startsWith('/novels')) {
      return '/novels'
    }
    if (pathname.startsWith('/history')) {
      return '/history'
    }
    if (pathname.startsWith('/bookmarks') || pathname.includes('/profile/bookmarks')) {
      return '/bookmarks'
    }
    if (pathname.startsWith('/lists')) {
      return '/lists'
    }
    if (pathname.startsWith('/my-list')) {
      return '/my-list'
    }
    if (pathname.startsWith('/profile') || pathname.startsWith('/user/')) {
      return '/profile'
    }
    if (pathname.startsWith('/settings')) {
      return '/settings'
    }
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      return '/account'
    }
    if (pathname.startsWith('/upload')) {
      return '/upload'
    }
    if (pathname.startsWith('/management') || pathname.startsWith('/admin')) {
      return '/management'
    }
    if (pathname.startsWith('/help')) {
      return '/help'
    }
    if (pathname.startsWith('/offline-read')) {
      return '/offline-read'
    }
    return '*'
  }

  static trunc(text: string, max = maxLine): string {
    if (text.length <= max) {
      return text
    }
    return `${text.slice(0, max - 1)}…`
  }

  static formatSlugSegment(segment: string): string {
    try {
      return decodeURIComponent(segment).replace(/-/g, ' ').trim()
    }
    catch {
      return segment.replace(/-/g, ' ').trim()
    }
  }

  static titleFromDocument(): string | undefined {
    const raw = document.title?.trim()
    if (!raw || raw === 'Swarm') {
      return undefined
    }
    const cleaned = raw.replace(/\s*\|\s*Swarm\s*$/i, '').trim()
    return cleaned || undefined
  }

  static chapterDisplayNumber(raw: string): string {
    const trimmed = decodeURIComponent(raw).trim()
    if (/^\d+$/.test(trimmed)) {
      return String(Number.parseInt(trimmed, 10))
    }
    return trimmed
  }

  static seriesTitleFromPageTitle(
    pageTitle: string | undefined,
    slugFallback: string,
  ): string {
    if (!pageTitle) {
      return slugFallback
    }

    let cleaned = pageTitle.trim()
    cleaned = cleaned.replace(/^read\s+/i, '').trim()
    cleaned = cleaned.replace(/^chapter\s+[\d.]+\s*[-–—:]\s*/i, '').trim()
    cleaned = cleaned.replace(/\s*[-–—]\s*chapter\s+[\d.]+\s*$/i, '').trim()
    cleaned = cleaned.replace(/\s+chapter\s+[\d.]+\s*$/i, '').trim()

    return cleaned || slugFallback
  }
}
