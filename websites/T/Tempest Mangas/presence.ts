import { RouteHandlers } from './handlers/route.js'
import { SettingsManager } from './managers/settings.js'
import { Images } from './types.js'
import { Utils } from './utils.js'

const presence = new Presence({
  clientId: '1412150382729363597',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

class TempestMangasPresence {
  private settingsManager: SettingsManager

  constructor() {
    this.settingsManager = new SettingsManager(presence)
    this.init()
  }

  private init(): void {
    presence.on('UpdateData', async () => {
      setTimeout(() => {
        this.handlePresenceUpdate()
      }, 1000)
    })
  }

  private buildBasePresence(): PresenceData {
    const largeImage = Images.Logo

    const presenceData: PresenceData = {
      largeImageKey: largeImage,
      startTimestamp: browsingTimestamp,
    }

    return presenceData
  }

  private async handlePresenceUpdate(): Promise<void> {
    await this.settingsManager.getSettings()
    const settings = this.settingsManager.currentSettings!

    const presenceData = this.buildBasePresence()

    if (settings?.privacy) {
      presenceData.details = 'Tempest Mangas'

      presence.setActivity(presenceData)
      return
    }

    const pathname = document.location.pathname
    const routePattern = Utils.getRoutePattern(document.location)

    const routeHandlers: Record<string, () => void> = {
      '/': () => RouteHandlers.handleHomePage(presenceData),
      '/search/': () => RouteHandlers.handleSearchPage(presenceData, document.location.search),
      '/az-list/': () => RouteHandlers.handleAzListPage(presenceData, document.location.search),
      '/manga/': () => RouteHandlers.handleMangaPage(presenceData),
      '/manga/detail': () => RouteHandlers.handleMangaDetailPage(presenceData, settings, pathname),
      '/chapter/': () => RouteHandlers.handleChapterPage(presenceData, settings),
      '/genres/': () => RouteHandlers.handleGenrePage(presenceData, settings, pathname),
      '/bookmark/': () => RouteHandlers.handleBookmarkPage(presenceData),

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

const _TempestMangasPresence = new TempestMangasPresence()
