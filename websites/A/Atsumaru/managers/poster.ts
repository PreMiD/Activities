import { Utils } from '../utils.js'

export class PosterManager {
  private savedPosterUrl: string | null = null

  updatePoster(): void {
    const pathname = document.location.pathname

    if (pathname.includes('/manga/')) {
      this.handleMangaPage()
    }
    else {
      this.resetPoster()
    }
  }

  private handleMangaPage(): void {
    const posterSelector = 'article img.poster'
    const posterElement = document.querySelector<HTMLImageElement>(posterSelector)
    if (!posterElement)
      return

    const imageUrl = posterElement.src
    if (!imageUrl)
      return
    const WSRVUrl = Utils.convertToWSRVUrl(imageUrl)

    this.savedPosterUrl = WSRVUrl
  }

  private resetPoster(): void {
    this.savedPosterUrl = null
  }

  get posterUrl(): string | null {
    return this.savedPosterUrl
  }
}
