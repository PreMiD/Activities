import type { IframeData } from './types.js'
import { ActivityType, Assets, getTimestamps } from 'premid'
import { RouteHandlers } from './handlers/route.js'
import { PosterManager } from './managers/poster.js'
import { SettingsManager } from './managers/settings.js'

import { Utils } from './utils.js'

const presence = new Presence({
  clientId: '1342545631629152287',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

class AniziumPresence {
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
        this.handleWatchPage()
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
            = settings?.showPosters && this.posterManager.posterUrl
              ? this.posterManager.posterUrl
              : this.settingsManager.getLogo()

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
        ? 'Duraklatıldı'
        : 'Oynatılıyor'

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

  private handleWatchPage(): void {
    if (!document.location.pathname.includes('/anime/'))
      return

    const presenceData = this.buildBasePresence()

    if (document.location.pathname.includes('/watch/')) {
      const animeTitle = Utils.getAnimeTitle()
      const { title, episode } = Utils.parseAnimeTitle(animeTitle)

      presenceData.details = title
      presenceData.state = episode
    }
    else {
      presenceData.details
                = document.querySelector('.trailer-content h1')?.textContent
                  || 'Loading'
      presenceData.state = 'Bölümler görüntüleniyor'
    }

    presence.setActivity(presenceData)
  }

  private async handlePresenceUpdate(): Promise<void> {
    await this.settingsManager.getSettings()
    const settings = this.settingsManager.currentSettings!

    const presenceData = this.buildBasePresence()
    const pathname = document.location.pathname
    const routePattern = Utils.getRoutePattern(pathname)

    const routeHandlers: Record<string, () => void> = {
      // Statik routelar
      '/': () => RouteHandlers.handleHomePage(presenceData),
      '/profiles': () => RouteHandlers.handleProfilesPage(presenceData),
      '/avatar-list': () => RouteHandlers.handleAvatarListPage(presenceData),
      '/animes': () => RouteHandlers.handleAnimesPage(presenceData),
      '/anime-request': () => RouteHandlers.handleAnimeRequestsPage(presenceData),
      '/premium': () => RouteHandlers.handlePremiumPage(presenceData),
      '/pay/process': () => RouteHandlers.handlePayPage(presenceData),
      '/calendar': () => RouteHandlers.handleCalendarPage(presenceData),
      '/account': () => RouteHandlers.handleAccountPage(presenceData),
      '/ticket': () => RouteHandlers.handleTicketPage(presenceData),
      '/search': () => RouteHandlers.handleSearchPage(presenceData),
      '/favorite-list': () => RouteHandlers.handleFavoriteList(presenceData),
      '/watch-list': () => RouteHandlers.handleWatchList(presenceData),
      '/watched-list': () => RouteHandlers.handleWatchedList(presenceData),
      '/studio': () => RouteHandlers.handleStudioPage(presenceData),
      '/privacy-policy': () => RouteHandlers.handlePrivacyPolicy(presenceData),
      '/comment-policy': () => RouteHandlers.handleCommentPolicy(presenceData),
      '/tos': () => RouteHandlers.handleTos(presenceData),

      // Dinamik routelar
      '/watch/': () => RouteHandlers.handleWatchPageUpdate(presenceData, settings),
      '/anime/': () => RouteHandlers.handleAnimePageUpdate(presenceData, settings),
      '/catalog/': () => RouteHandlers.handleCatalogPage(presenceData),
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

const _aniziumPresence = new AniziumPresence()
