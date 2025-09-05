import type { IframeData } from './types.js'
import { ActivityType, Assets, getTimestamps } from 'premid'
import { RouteHandlers } from './handlers/route.js'
import { PosterManager } from './managers/poster.js'
import { SettingsManager } from './managers/settings.js'

import { Images } from './types.js'
import { Utils } from './utils.js'

const presence = new Presence({
  clientId: '1412481875209097307',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

class StigstreamPresence {
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
    if (this.video && document.location.pathname.includes('/watch/')) {
      presenceData.smallImageKey = this.video.paused
        ? Assets.Pause
        : Assets.Play
      presenceData.smallImageText = this.video.paused
        ? 'Paused'
        : 'Playing'

      if (this.settingsManager.currentSettings?.showTimestamp) {
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
    const settings = this.settingsManager.currentSettings!

    const presenceData = this.buildBasePresence()

    if (settings?.privacy) {
      presenceData.details = 'Stigstream'

      presence.setActivity(presenceData)
      return
    }

    const routePattern = Utils.getRoutePattern(document.location)

    const routeHandlers: Record<string, () => void> = {
      '/': () => RouteHandlers.handleHomePage(presenceData),
      '/movies': () => RouteHandlers.handleMoviesPage(presenceData),
      '/tv': () => RouteHandlers.handleTVShowsPage(presenceData),
      '/my-list': () => RouteHandlers.handleMyListPage(presenceData),
      '/search/': () => RouteHandlers.handleSearchPage(presenceData, document.location.search),
      '/content-detail': () => RouteHandlers.handleContentDetailPage(presenceData, settings),
      '/watch/': () => RouteHandlers.handleWatchPageUpdate(presenceData, settings),

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

const _StigstreamPresence = new StigstreamPresence()
