export class Utils {
  public static getRoutePattern(location: Location): string {
    const { pathname, search } = location
    const queryParams = new URLSearchParams(search)

    const langCodeRegex = /^\/[a-z]{2}$/

    if (pathname === '/' || langCodeRegex.test(pathname)) {
      if (queryParams.has('search') && queryParams.has('tags')) {
        return '/search-with-tags/'
      }
      else if (queryParams.has('search')) {
        return '/search/'
      }
      else if (queryParams.has('tags')) {
        return '/tags/'
      }
      else {
        return '/'
      }
    }

    if (pathname.includes('/chat/')) {
      return '/chat/'
    }
    return pathname
  }

  static convertToWSRVUrl(originalUrl: string): string {
    return `https://wsrv.nl/?url=${originalUrl}`
  }
}
