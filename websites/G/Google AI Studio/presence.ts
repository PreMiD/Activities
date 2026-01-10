import { RouteHandlers } from './handlers/route.js'
import { SettingsManager } from './managers/settings.js'
import { Images } from './types.js'
import { Utils } from './utils.js'

const presence = new Presence({
  clientId: '1412019269562269769',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

class GoogleAIStudioPresence {
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
      presenceData.details = 'Google AI Studio'

      presence.setActivity(presenceData)
      return
    }

    const pathname = document.location.pathname
    const routePattern = Utils.getRoutePattern(pathname)

    const routeHandlers: Record<string, () => void> = {
      '/': () => RouteHandlers.handleHomePage(presenceData),
      '/prompts/': () => RouteHandlers.handlePromptPage(presenceData, settings),
      '/prompts/new_images': () => RouteHandlers.handleImagenPromptPage(presenceData, settings),
      '/generate-speech': () => RouteHandlers.handleSpeechPromptPage(presenceData, settings),
      '/live': () => RouteHandlers.handleLivePage(presenceData, settings),
      '/library': () => RouteHandlers.handleLibraryPage(presenceData),
      '/gen-media': () => RouteHandlers.handleGenerateMediaPage(presenceData),
      '/apikey': () => RouteHandlers.handleApiKeysPage(presenceData),
      '/usage': () => RouteHandlers.handleUsagePage(presenceData),
      '/status': () => RouteHandlers.handleStatusPage(presenceData),
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

const _googleAIStudioPresence = new GoogleAIStudioPresence()
