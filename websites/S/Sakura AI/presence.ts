import { ActivityType } from 'premid'
import { RouteHandlers } from './handlers/route.js'
import { PosterManager } from './managers/poster.js'
import { SettingsManager } from './managers/settings.js'
import { Images } from './types.js'
import { Utils } from './utils.js'

const presence = new Presence({
  clientId: '1412685978111443027',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

class SakuraAIPresence {
  private settingsManager: SettingsManager
  private posterManager: PosterManager

  constructor() {
    this.settingsManager = new SettingsManager(presence)
    this.posterManager = new PosterManager()

    this.init()
  }

  private init(): void {
    presence.on('UpdateData', async () => {
      this.posterManager.updatePoster()

      this.handlePresenceUpdate()
    })
  }

  private buildBasePresence(): PresenceData {
    const settings = this.settingsManager.currentSettings

    const largeImage
            = !settings?.privacy && settings?.showPosters && this.posterManager.posterUrl
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
    const settings = this.settingsManager.currentSettings

    const presenceData = this.buildBasePresence()

    if (settings?.privacy) {
      presenceData.details = 'Sakura AI'

      presence.setActivity(presenceData)
      return
    }

    const routePattern = Utils.getRoutePattern(document.location)

    const routeHandlers: Record<string, () => void> = {
      '/': () => RouteHandlers.handleHomePage(presenceData),
      '/search/': () => RouteHandlers.handleSearchPage(presenceData, document.location.search),
      '/tags/': () => RouteHandlers.handleTagsPage(presenceData, document.location.search),
      '/search-with-tags/': () => RouteHandlers.handleSearchwithTagsPage(presenceData, document.location.search),
      '/chat/': () => RouteHandlers.handleChatPage(presenceData),

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

const _SakuraAIPresence = new SakuraAIPresence()
