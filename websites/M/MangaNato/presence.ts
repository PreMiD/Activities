import { ActivityType } from 'premid'
import { RouteHandlers } from './handlers/route.js'
import { SettingsManager } from './managers/settings.js'
import { Images } from './types.js'
import { Utils } from './utils.js'

const presence = new Presence({
  clientId: '1413503275273289749',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

class MangaNatoPresence {
  private settingsManager: SettingsManager

  constructor() {
    this.settingsManager = new SettingsManager(presence)
    this.init()
  }

  private init(): void {
    presence.on('UpdateData', async () => {
      this.handlePresenceUpdate()
    })
  }

  private buildBasePresence(): PresenceData {
    const largeImage = Images.Logo

    const presenceData: PresenceData = {
      largeImageKey: largeImage,
      startTimestamp: browsingTimestamp,
      type: ActivityType.Watching,
    }

    return presenceData
  }

  private async handlePresenceUpdate(): Promise<void> {
    await this.settingsManager.getSettings()
    const settings = this.settingsManager.currentSettings

    const presenceData = this.buildBasePresence()

    if (settings?.privacy) {
      presenceData.details = 'Manga Nato'

      presence.setActivity(presenceData)
      return
    }

    const routePattern = Utils.getRoutePattern(document.location)

    const MANGA_CATEGORIES = [
      'latest-manga',
      'hot-manga',
      'new-manga',
      'completed-manga',
    ]

    const routeHandlers: Record<string, () => void> = {
      '/': () => RouteHandlers.handleHomePage(presenceData),
      '/manga/': () => RouteHandlers.handleMangaReadingPage(presenceData, settings),
      '/manga/details': () => RouteHandlers.handleMangaDetailsPage(presenceData, settings),
      '/search/': () => RouteHandlers.handleSearchPage(presenceData),
      '/genre/': () => RouteHandlers.handleGenrePage(presenceData, document.location.pathname),

    }

    for (const route of MANGA_CATEGORIES) {
      routeHandlers[route] = () => RouteHandlers.handleMangaCategoryPage(presenceData, route)
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

const _MangaNatoPresence = new MangaNatoPresence()
