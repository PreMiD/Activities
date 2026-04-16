import { ActivityType } from 'premid'
import { RouteHandlers } from './handlers/route.js'
import { swarmCoverToDataUrl } from './managers/coverDataUrl.js'
import { PosterManager } from './managers/poster.js'
import { SettingsManager } from './managers/settings.js'
import { Images } from './types.js'
import { Utils } from './utils.js'

const presence = new Presence({
  clientId: '1352725672363298866',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

class SwarmPresence {
  private settingsManager: SettingsManager
  private posterManager: PosterManager

  constructor() {
    this.settingsManager = new SettingsManager(presence)
    this.posterManager = new PosterManager()

    this.init()
  }

  private init(): void {
    presence.on('UpdateData', async () => {
      setTimeout(() => {
        this.posterManager.updatePoster()
        void this.handlePresenceUpdate()
      }, 1000)
    })
  }

  private async buildBasePresence(): Promise<PresenceData> {
    const settings = this.settingsManager.currentSettings

    let largeImage: string = Images.Logo
    if (!settings?.privacy && settings?.showPosters && this.posterManager.posterUrl) {
      largeImage
        = (await swarmCoverToDataUrl(this.posterManager.posterUrl)) ?? Images.Logo
    }

    const presenceData: PresenceData = {
      largeImageKey: largeImage,
      startTimestamp: browsingTimestamp,
      type: ActivityType.Watching,
    }

    if (largeImage !== Images.Logo) {
      presenceData.smallImageKey = Images.Logo
    }

    return presenceData
  }

  private async handlePresenceUpdate(): Promise<void> {
    await this.settingsManager.getSettings()
    const settings = this.settingsManager.currentSettings!

    const presenceData = await this.buildBasePresence()

    if (settings?.privacy) {
      presenceData.details = 'Swarm'
      presence.setActivity(presenceData)
      return
    }

    const routePattern = Utils.getRoutePattern(document.location)
    const { href, pathname } = document.location

    const routeHandlers: Record<string, () => void> = {
      '/': () => RouteHandlers.handleHomePage(presenceData, settings, href),
      '/browse': () => RouteHandlers.handleBrowsePage(presenceData, settings, href),
      '/popular': () => RouteHandlers.handlePopularPage(presenceData, settings, href),
      '/random': () => RouteHandlers.handleRandomPage(presenceData, settings, href),
      '/search': () => RouteHandlers.handleSearchPage(presenceData, document.location.search),
      '/comic/chapter': () =>
        RouteHandlers.handleComicChapter(presenceData, settings, href, pathname),
      '/novel/chapter': () =>
        RouteHandlers.handleNovelChapter(presenceData, settings, href, pathname),
      '/comic/covers': () =>
        RouteHandlers.handleComicCovers(presenceData, settings, href, pathname),
      '/comic': () =>
        RouteHandlers.handleComicSeries(presenceData, settings, href, pathname),
      '/novel': () =>
        RouteHandlers.handleNovelSeries(presenceData, settings, href, pathname),
      '/novels': () => RouteHandlers.handleNovelsList(presenceData),
      '/history': () => RouteHandlers.handleHistoryPage(presenceData),
      '/bookmarks': () => RouteHandlers.handleBookmarksPage(presenceData),
      '/lists': () => RouteHandlers.handleListsPage(presenceData),
      '/my-list': () => RouteHandlers.handleMyListPage(presenceData),
      '/profile': () => RouteHandlers.handleProfilePage(presenceData),
      '/settings': () => RouteHandlers.handleSettingsPage(presenceData),
      '/account': () => RouteHandlers.handleAccountPage(presenceData),
      '/upload': () => RouteHandlers.handleUploadPage(presenceData),
      '/management': () => RouteHandlers.handleManagementPage(presenceData),
      '/help': () => RouteHandlers.handleHelpPage(presenceData),
      '/offline-read': () => RouteHandlers.handleOfflineReadPage(presenceData),
    }

    if (routeHandlers[routePattern]) {
      routeHandlers[routePattern]()
    }
    else {
      RouteHandlers.handleDefaultPage(presenceData)
    }

    presence.setActivity(presenceData)
  }
}

const _SwarmPresence = new SwarmPresence()
