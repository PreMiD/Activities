import type { Settings } from '../types.js'
import { Assets } from 'premid'

export class RouteHandlers {
  public static handleHomePage(presenceData: PresenceData): void {
    presenceData.details = 'On the homepage'
  }

  public static handleSearchPage(
    presenceData: PresenceData,
    search: string,
  ): void {
    const queryParams = new URLSearchParams(search)
    const searchQuery = queryParams.get('keyword')

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

  public static handleWatchPageUpdate(
    presenceData: PresenceData,
    settings: Settings | undefined,
    search: string,
  ): void {
    const titleElement = document.querySelector<HTMLAnchorElement>('.anisc-detail .film-name a.dynamic-name')

    if (titleElement && titleElement.textContent) {
      const animeTitle = titleElement.textContent.trim()
      if (animeTitle) {
        presenceData.details = animeTitle
      }
    }

    let episodenumber: string | null = null
    const queryParams = new URLSearchParams(search)
    const searchQuery = queryParams.get('ep')

    if (searchQuery) {
      episodenumber = searchQuery
    }
    else {
      const noticeElement = document.querySelector('.server-notice')
      if (noticeElement && noticeElement.textContent) {
        const match = noticeElement.textContent.match(/Episode\s(\d+)/)
        if (match && match[1]) {
          episodenumber = match[1]
        }
      }
    }

    if (!episodenumber) {
      const activeEpisodeElement = document.querySelector<HTMLAnchorElement>('a.ssl-item.active')
      if (activeEpisodeElement) {
        episodenumber = activeEpisodeElement.dataset.number || null
      }
    }

    let episodeTitle: string | null = null
    const activeEpisodeTitleElement = document.querySelector<HTMLDivElement>('a.ssl-item.active .ep-name')

    if (activeEpisodeTitleElement && activeEpisodeTitleElement.textContent) {
      episodeTitle = activeEpisodeTitleElement.textContent.trim()
    }

    if (episodenumber && episodeTitle) {
      presenceData.state = `Ep. ${episodenumber}: ${episodeTitle}`
    }
    else if (episodenumber) {
      presenceData.state = `Ep. ${episodenumber}`
    }
    else {
      presenceData.state = 'Watching'
    }

    if (settings?.showButtons) {
      presenceData.buttons = [
        {
          label: 'Watch Episode',
          url: document.location.href,
        },
      ]
    }
  }

  public static handleDetailsPage(
    presenceData: PresenceData,
    settings: Settings | undefined,
  ): void {
    const titleElement = document.querySelector<HTMLAnchorElement>('.anisc-detail .film-name')

    if (titleElement && titleElement.textContent) {
      const animeTitle = titleElement.textContent.trim()
      if (animeTitle) {
        presenceData.details = animeTitle
      }
    }

    if (settings?.showButtons) {
      presenceData.buttons = [
        {
          label: 'View Anime',
          url: document.location.href,
        },
      ]
    }
  }

  public static handleGenrePage(presenceData: PresenceData, pathname: string): void {
    const pathParts = pathname.split('/')
    const genreSlug = pathParts[2]

    if (genreSlug) {
      const genreName = genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1)

      presenceData.details = 'Browsing Genre'
      presenceData.state = genreName
    }
    else {
      presenceData.details = 'Browsing Genres'
    }
  }

  public static handleAnimeCategoryPage(presenceData: PresenceData, routePattern: string): void {
    const categoryName = routePattern
      .substring(1)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())

    presenceData.details = 'Browsing Category'
    presenceData.state = categoryName
  }

  public static handleDefaultPage(presenceData: PresenceData): void {
    presenceData.details = 'Page Displaying...'
  }
}
