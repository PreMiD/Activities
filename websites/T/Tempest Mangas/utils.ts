export class Utils {
  public static getRoutePattern(location: Location): string {
    const { pathname, search } = location

    const queryParams = new URLSearchParams(search)
    if (pathname === '/' && queryParams.has('s')) {
      return '/search/'
    }

    if (pathname === '/az/') {
      return '/az-list/'
    }

    const chapterPattern = /^\/[a-z0-9-]+-[\d.]+\/?$/
    if (chapterPattern.test(pathname)) {
      return '/chapter/'
    }

    if (pathname.startsWith('/manga/')) {
      const parts = pathname.split('/').filter(p => p)

      if (parts.length > 1) {
        return '/manga/detail'
      }
      return '/manga/'
    }

    if (pathname.startsWith('/genres/')) {
      return '/genres/'
    }

    return pathname
  }
}
