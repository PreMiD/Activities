import type { Settings } from '../types.js'

export class RouteHandlers {
  public static handleMangaPage(
    presenceData: PresenceData,
  ): void {
    presenceData.details = 'Manga Listesi görüntüleniyor'
  }

  public static handleMangaDetailPage(
    presenceData: PresenceData,
    settings: Settings,
    pathname: string,

  ): void {
    const parts = pathname.split('/').filter(p => p)
    const mangaSlug = parts[1]

    if (mangaSlug) {
      const formattedMangaName = mangaSlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())

      presenceData.details = formattedMangaName
      presenceData.state = 'Manga Sayfası görüntüleniyor'
    }
    else {
      this.handleDefaultPage(presenceData)
    }

    if (settings?.showButtons) {
      presenceData.buttons = [
        {
          label: 'Mangayı Görüntüle',
          url: document.location.href,
        },
      ]
    }
  }

  public static handleChapterPage(
    presenceData: PresenceData,
    settings: Settings,
  ): void {
    const titleElement = document.querySelector<HTMLElement>('h1.entry-title')

    if (titleElement && titleElement.textContent) {
      const fullTitle = titleElement.textContent.trim()

      const lastSpaceIndex = fullTitle.lastIndexOf(' ')

      if (lastSpaceIndex !== -1) {
        const mangaName = fullTitle.substring(0, lastSpaceIndex)
        const chapterNumber = fullTitle.substring(lastSpaceIndex + 1)

        presenceData.details = mangaName
        presenceData.state = `Bölüm ${chapterNumber} okunuyor`
      }
      else {
        this.handleDefaultPage(presenceData)
      }
    }
    else {
      this.handleDefaultPage(presenceData)
    }

    if (settings?.showButtons) {
      presenceData.buttons = [
        {
          label: 'Bölümü Görüntüle',
          url: document.location.href,
        },
      ]
    }
  }

  public static handleGenrePage(
    presenceData: PresenceData,
    settings: Settings,

    pathname: string,
  ): void {
    const parts = pathname.split('/').filter(part => part !== '')

    if (parts.length >= 2) {
      const genreSlug = parts[1]

      if (genreSlug) {
        const formattedGenre = genreSlug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())

        presenceData.details = `${formattedGenre} kategorisine göz atıyor`
      }
      else {
        presenceData.details = 'Kategorilere göz atıyor'
      }
      if (settings?.showButtons) {
        presenceData.buttons = [
          {
            label: 'Kategoriyi Görüntüle',
            url: document.location.href,
          },
        ]
      }
    }
  }

  public static handleSearchPage(
    presenceData: PresenceData,
    search: string,
  ): void {
    const queryParams = new URLSearchParams(search)
    const searchQuery = queryParams.get('s')

    if (searchQuery) {
      const decodedQuery = searchQuery.replace(/\+/g, ' ')

      presenceData.details = `'${decodedQuery}' için arama yapıyor`
    }
    else {
      this.handleDefaultPage(presenceData)
    }
  }

  public static handleAzListPage(
    presenceData: PresenceData,
    search: string,
  ): void {
    const queryParams = new URLSearchParams(search)
    const letter = queryParams.get('show')

    if (letter) {
      presenceData.details = 'A-Z Manga Listesine göz atıyor'
      presenceData.state = `'${letter}' harfiyle başlayan serilere bakıyor`
    }
    else {
      presenceData.details = 'A-Z Manga Listesine göz atıyor'
    }
  }

  public static handleHomePage(presenceData: PresenceData): void {
    presenceData.details = 'Ana Sayfa görüntüleniyor'
  }

  public static handleBookmarkPage(presenceData: PresenceData): void {
    presenceData.details = 'Kitaplık görüntüleniyor'
  }

  public static handleDefaultPage(presenceData: PresenceData): void {
    presenceData.details = 'Sayfa görüntüleniyor..'
  }
}
