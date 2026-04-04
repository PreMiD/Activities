export class PosterManager {
  private coverUrl: string | null = null

  updatePoster(): void {
    const { origin, pathname } = document.location
    this.coverUrl = this.seriesCoverUrl(pathname, origin)
  }

  private seriesCoverUrl(pathname: string, origin: string): string | null {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length < 2) {
      return null
    }

    const kind = segments[0]
    if (kind !== 'comic' && kind !== 'novel') {
      return null
    }

    const slug = segments[1]
    if (!slug) {
      return null
    }

    return `${origin}/${kind}/${encodeURIComponent(slug)}.png`
  }

  get posterUrl(): string | null {
    return this.coverUrl
  }
}
