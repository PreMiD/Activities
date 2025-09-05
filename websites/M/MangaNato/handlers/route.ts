import type { Settings } from '../types.js'
import { Assets } from 'premid'

export class RouteHandlers {
  public static handleHomePage(presenceData: PresenceData): void {
    presenceData.details = 'On the homepage'
  }

  public static handleMangaReadingPage(presenceData: PresenceData, settings: Settings | undefined): void {
    const chapterTitleElement = document.querySelector<HTMLHeadingElement>('h1.current-chapter')

    if (chapterTitleElement && chapterTitleElement.textContent) {
      const fullText = chapterTitleElement.textContent.trim()

      const delimiterIndex = fullText.lastIndexOf(':')

      if (delimiterIndex !== -1) {
        const mangaTitle = fullText.substring(0, delimiterIndex).trim()
        const chapterInfo = fullText.substring(delimiterIndex + 1).trim()

        if (mangaTitle && chapterInfo) {
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Reading'
          presenceData.details = mangaTitle
          presenceData.state = `Reading ${chapterInfo}`
        }
      }
    }

    if (settings?.showButtons) {
      presenceData.buttons = [
        {
          label: 'View Chapter',
          url: document.location.href,
        },
      ]
    }
  }

  public static handleMangaDetailsPage(presenceData: PresenceData, settings: Settings | undefined): void {
    const titleElement = document.querySelector<HTMLHeadingElement>('.manga-info-text li h1')

    if (titleElement && titleElement.textContent) {
      const mangaTitle = titleElement.textContent.trim()
      if (mangaTitle) {
                  presenceData.smallImageKey = Assets.Viewing
          presenceData.smallImageText = 'Viewing'
        presenceData.details = mangaTitle
      }
    }

    if (settings?.showButtons) {
      presenceData.buttons = [
        {
          label: 'View Manga Details',
          url: document.location.href,
        },
      ]
    }
  }

  public static handleSearchPage(presenceData: PresenceData): void {
    const searchTitleElement = document.querySelector<HTMLHeadingElement>('.daily-update .update-title')

    if (searchTitleElement && searchTitleElement.textContent) {
      const fullText = searchTitleElement.textContent.trim()

      const rawKeyword = fullText.replace('Keyword :', '').trim()

      if (rawKeyword) {
        const formattedKeyword = rawKeyword
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Searching'

        presenceData.details = `Searching for: ${formattedKeyword}`
      }
      else {
        this.handleDefaultPage(presenceData)
      }
    }
    else {
      this.handleDefaultPage(presenceData)
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

  public static handleMangaCategoryPage(presenceData: PresenceData, routePattern: string): void {
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
