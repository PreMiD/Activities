export class Utils {
  public static getRoutePattern(pathname: string): string {
    if (pathname.startsWith('/notebook/')) {
      return '/notebook/'
    }

    return pathname
  }

  public static getNotebookName(): string {
    const el = document.querySelector<HTMLElement>(
      'span.title-label-inner, div.title.mat-title-large > span.ng-star-inserted',
    )

    if (el?.textContent) {
      const trimmedText = el.textContent.trim()
      if (trimmedText) {
        return trimmedText
      }
    }

    return 'Unknown Notebook'
  }
}
