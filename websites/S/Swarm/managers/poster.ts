const SWARM_COVER_ORIGIN = 'https://swarm.ws'

export class PosterManager {
  private coverUrl: string | null = null

  updatePoster(): void {
    const { pathname } = document.location
    this.coverUrl = this.seriesCoverUrl(pathname)
  }

  private seriesCoverUrl(pathname: string): string | null {
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

    return `${SWARM_COVER_ORIGIN}/${kind}/${encodeURIComponent(slug)}.png`
  }

  get posterUrl(): string | null {
    return this.coverUrl
  }
}
