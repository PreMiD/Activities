import { Utils } from './utils.js'

export class PosterManager {
  private savedPosterUrl: string | null = null
  private seasonModeActive = false

  updatePoster(): void {
    const pathname = document.location.pathname

    if (pathname.includes('/anime/')) {
      this.handleAnimePage()
    }
    else if (pathname.includes('/watch/')) {
      this.handleWatchPagePoster()
    }
    else if (pathname.includes('/studio')) {
      this.handleStudioPagePoster()
    }
    else {
      this.resetPoster()
    }
  }

  private handleAnimePage(): void {
    const bannerImage = document.querySelector<HTMLElement>(
      '.overlay-wrapper.iq-main-slider',
    )
    if (!bannerImage)
      return

    const backgroundImg
            = bannerImage.style.background
              || window.getComputedStyle(bannerImage).background

    const urlMatch = backgroundImg.match(/url\(["']?(.*?)["']?\)/)
    if (!urlMatch?.[1])
      return

    this.savedPosterUrl = Utils.convertToLuiiUrl(
      urlMatch[1],
      'anime-details-banner',
    )
    this.seasonModeActive = false
  }

  private handleWatchPagePoster(): void {
    const animeImg
            = document.querySelector<HTMLImageElement>('.image-box > img')?.src
    if (!animeImg)
      return

    const luiUrl = Utils.convertToLuiiUrl(animeImg, 'anime-poster')

    if (!this.seasonModeActive) {
      this.seasonModeActive = true
      this.savedPosterUrl = luiUrl
    }
  }

  private handleStudioPagePoster(): void {
    const studioImg = document.querySelector<HTMLImageElement>('#studio_logo')?.src

    if (!studioImg)
      return

    const WSRVUrl = Utils.convertToWSRVUrl(studioImg)

    this.savedPosterUrl = WSRVUrl
    this.seasonModeActive = false
  }

  private resetPoster(): void {
    this.savedPosterUrl = null
    this.seasonModeActive = false
  }

  get posterUrl(): string | null {
    return this.savedPosterUrl
  }

  get isSeasonMode(): boolean {
    return this.seasonModeActive
  }
}
