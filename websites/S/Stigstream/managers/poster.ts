import { Utils } from '../utils.js'

export class PosterManager {
  private savedPosterUrl: string | null = null

  updatePoster(): void {
    const pathname = document.location.pathname

    const contentDetailPattern = /^\/(?:tv|movie)\/.+/
    const watchPattern = /^\/watch\/(?:tv|movie)\/.+/

    if (contentDetailPattern.test(pathname)) {
      this.handleContentPage()
    }
    else if (watchPattern.test(pathname)) {
      this.handleWatchPage()
    }
    else {
      this.resetPoster()
    }
  }

  private handleContentPage(): void {
    const heroBannerSelector = 'main .relative.overflow-hidden.-mt-14'
    const heroBannerElement = document.querySelector<HTMLDivElement>(heroBannerSelector)

    if (!heroBannerElement)
      return

    const imageUrl = heroBannerElement.querySelector<HTMLImageElement>('img')?.src

    if (!imageUrl)
      return
    const WSRVUrl = Utils.convertToWSRVUrl(imageUrl)

    this.savedPosterUrl = WSRVUrl
  }

  private handleWatchPage(): void {
    const posterImageSelector = 'div[class*="sticky top-0 z-50"] img[src*="image.tmdb.org"]'
    const posterImageElement = document.querySelector<HTMLImageElement>(posterImageSelector)

    if (!posterImageElement) {
      return
    }

    const smallImageUrl = posterImageElement.src

    if (!smallImageUrl) {
      return
    }

    const originalImageUrl = smallImageUrl.replace(/\/w\d+\//, '/original/')

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
