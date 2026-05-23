import { Utils } from '../utils.js'

export class PosterManager {
  private savedPosterUrl: string | null = null

  updatePoster(): void {
    const pathname = document.location.pathname

    if (pathname.includes('/chat/')) {
      this.handleChatPage()
    }
    else {
      this.resetPoster()
    }
  }

  private handleChatPage(): void {
    const chatPageSelector = 'div.flex.h-max.min-h-full img'
    const chatPageElement = document.querySelector<HTMLImageElement>(chatPageSelector)

    if (!chatPageElement)
      return

    const imageUrl = chatPageElement.src
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
