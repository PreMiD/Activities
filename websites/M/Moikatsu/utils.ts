export class Utils {
  public static getRoutePattern(location: Location): string {
    const { pathname, search } = location

    const queryParams = new URLSearchParams(search)
    if (pathname === '/search' && queryParams.has('keyword')) {
      return '/search/'
    }

    if (pathname.startsWith('/watch/')) {
      return '/watch/'
    }

    if (pathname.startsWith('/details/')) {
      return '/details/'
    }

    if (pathname.startsWith('/anime/')) {
      const ANIME_CATEGORIES = [
        'most-popular',
        'top-airing',
        'most-favorite',
        'completed',
        'recently-updated',
        'recently-added',
        'top-upcoming',
        'movie',
      ]

      for (const category of ANIME_CATEGORIES) {
        if (pathname.startsWith(`/anime/${category}`)) {
          return `/${category}`
        }
      }
    }

    if (pathname.startsWith('/genre/')) {
      return '/genre/'
    }

    return pathname
  }

  static convertToWSRVUrl(originalUrl: string): string {
    return `https://wsrv.nl/?url=${originalUrl}`
  }
}
