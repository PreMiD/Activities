export class Utils {
  public static getRoutePattern(location: Location): string {
    const { pathname } = location
    if (pathname.startsWith('/manga/')) {
      return '/manga/'
    }
    if (pathname.startsWith('/read/')) {
      return '/read/'
    }
    if (pathname.startsWith('/browse/')) {
      return '/browse/'
    }

    return pathname
  }
}
