export class Utils {
  public static getRoutePattern(location: Location): string {
    const { pathname, search } = location

    const queryParams = new URLSearchParams(search)
    if (pathname === '/search' && queryParams.has('q')) {
      return '/search/'
    }

    const contentDetailPattern = /^\/(?:tv|movie)\/.+/
    if (contentDetailPattern.test(pathname)) {
      return '/content-detail'
    }
    if (pathname.startsWith('/watch/')) {
      return '/watch/'
    }

    return pathname
  }

  static convertToWSRVUrl(originalUrl: string): string {
    return `https://wsrv.nl/?url=${originalUrl}`
  }
}
