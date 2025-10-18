import { ActivityType } from 'premid'
import { RouteHandlers } from './handlers/route.js'
import { PosterManager } from './managers/poster.js'
import { SettingsManager } from './managers/settings.js'
import { Images } from './types.js'
import { Utils } from './utils.js'

const presence = new Presence({
  clientId: '1429082368739905616',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

class AtsumaruPresence {
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
        this.handlePresenceUpdate()
      }, 1000)
    })
  }

  private buildBasePresence(): PresenceData {
    const settings = this.settingsManager.currentSettings

    const largeImage
            = !settings?.privacy
              && settings?.showPosters
              && this.posterManager.posterUrl
              ? this.posterManager.posterUrl
              : Images.Logo

    const presenceData: PresenceData = {
      largeImageKey: largeImage,
      startTimestamp: browsingTimestamp,
      type: ActivityType.Watching,
    }

    return presenceData
  }

  private async handlePresenceUpdate(): Promise<void> {
    await this.settingsManager.getSettings()
    const settings = this.settingsManager.currentSettings!

    const presenceData = this.buildBasePresence()

    if (settings?.privacy) {
      presenceData.details = 'Atsumaru'

      presence.setActivity(presenceData)
      return
    }

    const routePattern = Utils.getRoutePattern(document.location)
    const routeHandlers: Record<string, () => void> = {
      '/': () => RouteHandlers.handleHomePage(presenceData),
      '/search': () => RouteHandlers.handleSearchPage(presenceData, document.location.search),
      '/manga/': () => RouteHandlers.handleMangaPage(presenceData, settings),
      '/read/': () => RouteHandlers.handleMangaReadPage(presenceData, settings),
      '/browse/': () => RouteHandlers.handleBrowsePage(presenceData, settings, document.location.pathname),
      '/leaderboard': () => RouteHandlers.handleLeaderboardPage(presenceData),
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

const _AtsumaruPresence = new AtsumaruPresence()
