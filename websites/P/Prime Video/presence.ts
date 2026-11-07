import { ActivityType } from 'premid'
import { getPlaybackMetadata, isMetadataLoading } from './api/metadata.js'
import { ActivityAssets, CLIENT_ID, DETAIL_PATH } from './config/constants.js'
import { applyBrowsingPresence } from './page/browsing.js'
import { findBannerImage, findPageTitle, findPlayerVideo } from './page/dom.js'
import { getPlaybackDisplay } from './player/display.js'
import { applyPlayerPresence, resetElapsedTime } from './player/player.js'
import { getLiveViewerTime } from './player/timeline.js'
import { startTimelineTracking } from './player/timelineTracker.js'

const presence = new Presence({
  clientId: CLIENT_ID,
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

startTimelineTracking(presence)

presence.on('UpdateData', async () => {
  const [usePresenceName, showCover, imageType, useMediaImage, time, strings] = await Promise.all([
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<number>('imageType'),
    presence.getSetting<boolean>('useMediaImage'),
    presence.getSetting<boolean>('time'),
    presence.getStrings({
      paused: 'general.paused',
      playing: 'general.playing',
    }),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const video = findPlayerVideo()
  const playerActive = !!video && !video.className.includes('tst') && window.getComputedStyle(document.body).overflow === 'hidden'

  // Page title and banner are only used by the player and the detail pages
  const needsPageInfo = playerActive || document.location.pathname.includes(DETAIL_PATH)
  const pageTitle = needsPageInfo ? findPageTitle() : undefined
  const bannerImg = needsPageInfo && showCover ? findBannerImage() : undefined

  // Title and episode come from the playback API, even when the player overlay is hidden.
  // While a new media is loading, the previous activity is kept.
  const metadata = playerActive ? getPlaybackMetadata() : null
  if (playerActive && !metadata && isMetadataLoading())
    return
  const viewerTime = video && !Number.isFinite(video.duration)
    ? getLiveViewerTime(video, metadata?.schedule?.clockOffset ?? 0)
    : undefined
  const display = getPlaybackDisplay(metadata, viewerTime)
  const contentTitle = display.title || pageTitle

  if (video && playerActive && contentTitle) {
    applyPlayerPresence(presenceData, {
      video,
      display,
      contentTitle,
      viewerTime,
      bannerImg,
      usePresenceName,
      showCover,
      imageType,
      useMediaImage,
      strings,
    })
  }
  else {
    resetElapsedTime()
    applyBrowsingPresence(presenceData, { pathname: document.location.pathname, pageTitle, bannerImg, showCover, imageType })
  }

  // Without any timestamp, Discord shows a timer that resets after ~1h10: the fixed start is kept
  if (!time) {
    presenceData.startTimestamp = browsingTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
