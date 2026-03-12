import { Utils } from '../utils.js'

export class PosterManager {
  private savedPosterUrl: string | null = null

  updatePoster(): void {
    const pathname = document.location.pathname

    if (pathname.includes('/watch/')) {
      this.handleWatchPage()
    }
    else if (pathname.includes('/details/')) {
      this.handleDetailsPage()
    }
    else {
      this.resetPoster()
    }
  }

  private handleDetailsPage(): void {
    const posterImageSelector = '.film-poster-img'
    const posterImageElement = document.querySelector<HTMLImageElement>(posterImageSelector)

    if (!posterImageElement || !posterImageElement.src) {
      this.savedPosterUrl = null
      return
    }

    const originalImageUrl = posterImageElement.src

    const WSRVUrl = Utils.convertToWSRVUrl(originalImageUrl)

    this.savedPosterUrl = WSRVUrl
  }

  private handleWatchPage(): void {
    const posterImageSelector = '.film-poster-img'
    const posterImageElement = document.querySelector<HTMLImageElement>(posterImageSelector)

    if (!posterImageElement || !posterImageElement.src) {
      this.savedPosterUrl = null
      return
    }

    const originalImageUrl = posterImageElement.src

    const WSRVUrl = Utils.convertToWSRVUrl(originalImageUrl)

    this.savedPosterUrl = WSRVUrl
  }

  private resetPoster(): void {
    this.savedPosterUrl = null
  }

  get posterUrl(): string | null {
    return this.savedPosterUrl
  }
}
