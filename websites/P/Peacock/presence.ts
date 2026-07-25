import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '767402228825980929',
})
const newStrings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
  browsing: 'general.browsing',
  watchingVid: 'general.watchingVid',
})
const elapsed = Math.floor(Date.now() / 1000)

let strings: Awaited<typeof newStrings>

function getCoverKey(): string | undefined {
  const heroImage = document.querySelector<HTMLImageElement>('[data-testid="immersive-image"]')
  return heroImage?.srcset.split(',')[0]?.trim().split(' ')[0]
}

function findWatchingVideo(): HTMLVideoElement | null {
  const video = document.querySelector<HTMLVideoElement>('#core-video-shaka')
    || document.querySelector<HTMLVideoElement>('.video-player-component video')

  // The detail page autoplays a muted preview clip in the background; that
  // isn't the user deliberately watching something, so it doesn't count.
  if (video?.closest('[data-gsp-shortform-player]'))
    return null

  return video
}

presence.on('UpdateData', async () => {
  const [privacy, showBrowsingStatus, showTimestamps, showSmallImage, usePresenceName, showCover] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showBrowsingStatus'),
    presence.getSetting<boolean>('showTimestamps'),
    presence.getSetting<boolean>('showSmallImage'),
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('showCover'),
  ])

  let extra = '...'

  const path = document.location.pathname
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Peacock/assets/logo.png',
    startTimestamp: elapsed,
  }

  strings ??= await newStrings

  if (path.includes('/movies/highlights'))
    extra = ' Movies'
  else if (path.includes('/watch/tv/highlights'))
    extra = ' TV Shows'
  else if (path.includes('/watch/kids/highlights'))
    extra = ' Kids'
  else if (path.includes('/watch/sports/highlights'))
    extra = ' Sports'
  else if (path.includes('/watch/latino/highlights'))
    extra = ' Latino'
  else if (path.includes('/watch/my-stuff'))
    extra = ' My Stuff'

  presenceData.details = `${strings.browsing}${extra}`

  if (path.includes('/watch/search'))
    presenceData.details = 'Searching...'

  let isWatching = false

  if (path.includes('/watch/playback') || path.includes('/watch/asset')) {
    const video = findWatchingVideo()
    if (video) {
      isWatching = true
      ;(presenceData as PresenceData).type = ActivityType.Watching

      const title = document.querySelector('[data-testid="metadata-title"]')
        || document.querySelector('.playback-header__title')
        || document.querySelector('.playback-metadata__container-title')
      const timestamps = getTimestamps(
        Math.floor(video.currentTime),
        Math.floor(video.duration),
      )
      const live = timestamps[1] === Infinity
      const desc = document.querySelector('[data-testid="metadata-description"]')
        || document.querySelector(
          '.playback-metadata__container-episode-metadata-info',
        )
        || document.querySelector('.playback-metadata__container-description')
        || document.querySelector(
          '.swiper-slide-active .playlist-item-overlay__container-title',
        )

      if (privacy) {
        presenceData.details = strings.watchingVid
        delete presenceData.state
      }
      else {
        let titleText = title?.textContent ?? undefined
        if (titleText && path.includes('/watch/playback/playlist'))
          titleText += ' Playlist'

        if (usePresenceName && titleText) {
          presenceData.name = titleText
          if (desc)
            presenceData.details = desc.textContent
        }
        else {
          if (titleText)
            presenceData.details = titleText
          if (desc)
            presenceData.state = desc.textContent
        }
      }

      if (showSmallImage) {
        presenceData.smallImageKey = live
          ? Assets.Live
          : video.paused
            ? Assets.Pause
            : Assets.Play
        presenceData.smallImageText = live
          ? strings.live
          : video.paused
            ? strings.pause
            : strings.play
      }

      if (showTimestamps && !live && !privacy && !video.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else if (path.includes('/watch/asset') && !privacy) {
      isWatching = true

      const synopsis = document.querySelector('[data-testid="synopsis"]')
      const titleText = document.title.replace(/ - Peacock$/, '')

      if (usePresenceName) {
        presenceData.name = titleText
        if (synopsis)
          presenceData.details = synopsis.textContent
      }
      else {
        presenceData.details = titleText
        if (synopsis)
          presenceData.state = synopsis.textContent
      }

      if (showCover) {
        const cover = getCoverKey()
        if (cover)
          presenceData.largeImageKey = cover
      }
    }
  }

  if (!isWatching && !path.includes('/watch/search') && !showBrowsingStatus)
    return presence.clearActivity()

  presence.setActivity(presenceData)
})
