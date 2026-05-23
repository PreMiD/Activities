import type { Settings } from '../types.js'
import { Assets } from 'premid'

export class RouteHandlers {
  public static handleHomePage(presenceData: PresenceData): void {
    presenceData.details = 'On the homepage'
  }

  public static handleMoviesPage(presenceData: PresenceData): void {
    presenceData.details = 'Looking at Movies'
  }

  public static handleTVShowsPage(presenceData: PresenceData): void {
    presenceData.details = 'Looking at Tv Shows'
  }

  public static handleMyListPage(presenceData: PresenceData): void {
    presenceData.details = 'Looking at My List'
  }

  public static handleSearchPage(
    presenceData: PresenceData,
    search: string,
  ): void {
    const queryParams = new URLSearchParams(search)
    const searchQuery = queryParams.get('q')

    if (searchQuery) {
      const decodedQuery = searchQuery.replace(/\+/g, ' ')

      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching'
      presenceData.details = `Searching for '${decodedQuery}'`
    }
    else {
      this.handleDefaultPage(presenceData)
    }
  }

  public static handleContentDetailPage(presenceData: PresenceData, settings: Settings): void {
    const heroBannerSelector = 'main .relative.overflow-hidden.-mt-14'
    const heroBannerElement = document.querySelector<HTMLDivElement>(heroBannerSelector)

    if (heroBannerElement) {
      const titleElement = heroBannerElement.querySelector('h1')
      presenceData.details = titleElement?.textContent?.trim()
    }

    if (settings?.showButtons) {
      const pathname = document.location.pathname

      let buttonLabel = 'View Content'

      if (pathname.startsWith('/tv/')) {
        buttonLabel = 'Show TV Show'
      }
      else if (pathname.startsWith('/movie/')) {
        buttonLabel = 'Show Movie'
      }

      presenceData.buttons = [
        {
          label: buttonLabel,
          url: document.location.href,
        },
      ]
    }
  }

  public static handleWatchPageUpdate(presenceData: PresenceData, settings: Settings): void {
    const pathname = document.location.pathname
    const isTvShow = pathname.startsWith('/watch/tv/')
    const isMovie = pathname.startsWith('/watch/movie/')

    const headerSelector = 'main div[class*="sticky top-0 z-50"]'
    const headerElement = document.querySelector<HTMLDivElement>(headerSelector)

    if (!headerElement) {
      return
    }

    const titleElement = headerElement.querySelector('h1')
    const mainTitle = titleElement?.textContent?.trim()

    if (!mainTitle) {
      return
    }

    let buttonLabel = 'Watch Now'

    if (isTvShow) {
      const episodeInfoElement = headerElement.querySelector('.flex.items-center.space-x-2 > span:first-child')
      const episodeTitleElement = headerElement.querySelector('span.truncate')

      const episodeInfo = episodeInfoElement?.textContent?.trim()
      const episodeTitle = episodeTitleElement?.textContent?.trim()

      presenceData.details = mainTitle
      if (episodeInfo && episodeTitle) {
        presenceData.state = `${episodeInfo} - ${episodeTitle}`
      }

      buttonLabel = 'Watch Episode'
    }
    else if (isMovie) {
      presenceData.details = `${mainTitle}`
      presenceData.state = 'Movie'

      buttonLabel = 'Watch Movie'
    }

    if (settings?.showButtons) {
      presenceData.buttons = [
        {
          label: buttonLabel,
          url: document.location.href,
        },
      ]
    }
  }

  public static handleDefaultPage(presenceData: PresenceData): void {
    presenceData.details = 'Page Displaying...'
  }
}
