export class Utils {
  public static getRoutePattern(location: Location): string {
    const { pathname } = location
    if (pathname.startsWith('/manga/')) {
      const segments = pathname.split('/').filter(Boolean)

      if (segments.length >= 3) {
        return '/manga/'
      }

      return '/manga/details'
    }

    if (pathname.startsWith('/search/')) {
      return '/search/'
    }

    if (pathname.startsWith('/manga-list/')) {
      const MANGA_CATEGORIES = [
        'latest-manga',
        'hot-manga',
        'new-manga',
        'completed-manga',
      ]

      for (const category of MANGA_CATEGORIES) {
        if (pathname.startsWith(`/manga-list/${category}`)) {
          return `/${category}`
        }
      }
    }

    if (pathname.startsWith('/genre/')) {
      return '/genre/'
    }

    return pathname
  }
}
