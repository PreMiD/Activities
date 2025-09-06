import type { IframeData } from './types.js'
import { ActivityType, Assets, getTimestamps } from 'premid'
import { RouteHandlers } from './handlers/route.js'
import { PosterManager } from './managers/poster.js'
import { SettingsManager } from './managers/settings.js'
import { Images } from './types.js'
import { Utils } from './utils.js'

const presence = new Presence({
  clientId: '1413107013562404865',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

class MoikatsuPresence {
  private video: IframeData | undefined
  private settingsManager: SettingsManager
  private posterManager: PosterManager

  constructor() {
    this.settingsManager = new SettingsManager(presence)
    this.posterManager = new PosterManager()

    this.init()
  }

  private init(): void {
    presence.on('iFrameData', (data: unknown) => {
      if (data) {
        this.video = data as IframeData
        this.posterManager.updatePoster()
      }
    })

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
            = !settings?.privacy && settings?.showPosters && this.posterManager.posterUrl
              ? this.posterManager.posterUrl
              : Images.Logo

    const presenceData: PresenceData = {
      largeImageKey: largeImage,
      startTimestamp: browsingTimestamp,
      type: ActivityType.Watching,
    }

    if (!settings?.privacy && this.video && document.location.pathname.includes('/watch/')) {
      presenceData.smallImageKey = this.video.paused
        ? Assets.Pause
        : Assets.Play
      presenceData.smallImageText = this.video.paused
        ? 'Paused'
        : 'Playing'

      if (settings?.showTimestamp) {
        const [start, end] = getTimestamps(
          this.video.currentTime,
          this.video.duration,
        )
        presenceData.startTimestamp = start

        if (!this.video.paused) {
          presenceData.endTimestamp = end
        }
      }
    }

    return presenceData
  }

  private async handlePresenceUpdate(): Promise<void> {
    await this.settingsManager.getSettings()
    const settings = this.settingsManager.currentSettings

    const presenceData = this.buildBasePresence()

    if (settings?.privacy) {
      presenceData.details = 'Moikatsu'

      presence.setActivity(presenceData)
      return
    }

    const routePattern = Utils.getRoutePattern(document.location)

    const animeCategoryRoutes = [
      '/most-popular',
      '/top-airing',
      '/most-favorite',
      '/completed',
      '/recently-updated',
      '/recently-added',
      '/top-upcoming',
      '/movie',
    ]

    const routeHandlers: Record<string, () => void> = {
      '/': () => RouteHandlers.handleHomePage(presenceData),
      '/home': () =>
        RouteHandlers.handleHomePage(presenceData),
      '/search/': () => RouteHandlers.handleSearchPage(presenceData, document.location.search),
      '/watch/': () => RouteHandlers.handleWatchPageUpdate(presenceData, settings, document.location.search),
      '/details/': () => RouteHandlers.handleDetailsPage(presenceData, settings),
      '/genre/': () => RouteHandlers.handleGenrePage(presenceData, document.location.pathname),

    }

    for (const route of animeCategoryRoutes) {
      routeHandlers[route] = () => RouteHandlers.handleAnimeCategoryPage(presenceData, route)
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

const _MoikatsuPresence = new MoikatsuPresence()
