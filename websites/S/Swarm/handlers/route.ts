import type { Settings } from '../types.js'
import { Assets } from 'premid'
import { Utils } from '../utils.js'

export class RouteHandlers {
  private static seriesHeading(pathname: string): string {
    const slug = pathname.split('/').filter(Boolean)[1] ?? ''
    const docTitle = Utils.titleFromDocument()
    const fromSlug = Utils.formatSlugSegment(slug)
    return Utils.trunc(Utils.seriesTitleFromPageTitle(docTitle, fromSlug))
  }

  static handleHomePage(
    presenceData: PresenceData,
    _settings: Settings,
    _href: string,
  ): void {
    presenceData.details = 'swarm.ws'
    delete presenceData.state
  }

  static handleBrowsePage(
    presenceData: PresenceData,
    _settings: Settings,
    _href: string,
  ): void {
    presenceData.details = 'Browsing'
    presenceData.state = 'Exploring the catalog'
  }

  static handlePopularPage(
    presenceData: PresenceData,
    _settings: Settings,
    _href: string,
  ): void {
    presenceData.details = 'Browsing'
    presenceData.state = 'Seeing what\'s popular'
  }

  static handleRandomPage(
    presenceData: PresenceData,
    _settings: Settings,
    _href: string,
  ): void {
    presenceData.details = 'Feeling lucky'
    presenceData.state = 'Random series'
  }

  static handleSearchPage(presenceData: PresenceData, search: string): void {
    const params = new URLSearchParams(search)
    const raw
      = params.get('q') ?? params.get('query') ?? params.get('search')

    if (raw) {
      const query = raw.replace(/\+/g, ' ')
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching'
      presenceData.details = Utils.trunc(`Searching for '${query}'`)
      presenceData.state = 'Finding something to read'
    }
    else {
      presenceData.details = 'Searching'
      presenceData.state = 'Finding something to read'
    }
  }

  static handleComicChapter(
    presenceData: PresenceData,
    _settings: Settings,
    _href: string,
    pathname: string,
  ): void {
    const chapterId = pathname.split('/').filter(Boolean)[3] ?? ''
    const title = this.seriesHeading(pathname)
    const chapter = Utils.chapterDisplayNumber(chapterId)

    presenceData.details = Utils.trunc(title)
    presenceData.state = `Reading chapter ${chapter}`
  }

  static handleNovelChapter(
    presenceData: PresenceData,
    _settings: Settings,
    _href: string,
    pathname: string,
  ): void {
    const chapterId = pathname.split('/').filter(Boolean)[3] ?? ''
    const title = this.seriesHeading(pathname)
    const chapter = Utils.chapterDisplayNumber(chapterId)

    presenceData.details = Utils.trunc(title)
    presenceData.state = `Reading chapter ${chapter}`
  }

  static handleComicCovers(
    presenceData: PresenceData,
    _settings: Settings,
    _href: string,
    pathname: string,
  ): void {
    const title = this.seriesHeading(pathname)
    presenceData.details = Utils.trunc(title)
    presenceData.state = 'Checking the series out'
  }

  static handleComicSeries(
    presenceData: PresenceData,
    _settings: Settings,
    _href: string,
    pathname: string,
  ): void {
    const title = this.seriesHeading(pathname)
    presenceData.details = Utils.trunc(title)
    presenceData.state = 'Checking the series out'
  }

  static handleNovelSeries(
    presenceData: PresenceData,
    _settings: Settings,
    _href: string,
    pathname: string,
  ): void {
    const title = this.seriesHeading(pathname)
    presenceData.details = Utils.trunc(title)
    presenceData.state = 'Checking the series out'
  }

  static handleNovelsList(presenceData: PresenceData): void {
    presenceData.details = 'Browsing'
    presenceData.state = 'Exploring novels'
  }

  static handleHistoryPage(presenceData: PresenceData): void {
    presenceData.details = 'Browsing'
    presenceData.state = 'Reading history'
  }

  static handleBookmarksPage(presenceData: PresenceData): void {
    presenceData.details = 'Browsing'
    presenceData.state = 'Saved bookmarks'
  }

  static handleListsPage(presenceData: PresenceData): void {
    presenceData.details = 'Browsing'
    presenceData.state = 'Curating lists'
  }

  static handleMyListPage(presenceData: PresenceData): void {
    presenceData.details = 'Browsing'
    presenceData.state = 'On my list'
  }

  static handleProfilePage(presenceData: PresenceData): void {
    const docTitle = Utils.titleFromDocument()
    presenceData.details = 'Browsing'
    presenceData.state = docTitle
      ? Utils.trunc(`Profile — ${docTitle}`)
      : 'Checking a profile'
  }

  static handleSettingsPage(presenceData: PresenceData): void {
    presenceData.details = 'Browsing'
    presenceData.state = 'Tweaking settings'
  }

  static handleAccountPage(presenceData: PresenceData): void {
    presenceData.details = 'Account'
    presenceData.state = 'Signing in or joining'
  }

  static handleUploadPage(presenceData: PresenceData): void {
    presenceData.details = 'Browsing'
    presenceData.state = 'Uploads & contributions'
  }

  static handleManagementPage(presenceData: PresenceData): void {
    presenceData.details = 'Working'
    presenceData.state = 'Site management'
  }

  static handleHelpPage(presenceData: PresenceData): void {
    presenceData.details = 'Browsing'
    presenceData.state = 'Reading help'
  }

  static handleOfflineReadPage(presenceData: PresenceData): void {
    presenceData.details = 'Reading'
    presenceData.state = 'Offline mode'
  }

  static handleDefaultPage(presenceData: PresenceData): void {
    const docTitle = Utils.titleFromDocument()
    presenceData.details = 'Browsing Swarm'
    presenceData.state = docTitle ? Utils.trunc(docTitle) : 'Exploring'
  }
}
