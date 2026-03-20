import { ActivityType } from 'premid'

// Note: Ensure you set a valid Discord Application ID for `clientId` when finalizing the module.
const presence = new Presence({
  clientId: '1482841271625318530',
})

// Use the provided FreeTV logo URL from metadata
const defaultLogo = 'https://cacavision.site/assets/freetv.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  let details = 'Browsing FreeTV'
  let state = 'Looking for a channel'
  const largeImageKey = defaultLogo
  const largeImageText = 'FreeTV'
  let smallImageKey = ''
  let smallImageText = ''
  const startTimestamp = browsingTimestamp
  const endTimestamp = 0

  const playerContainer = document.querySelector<HTMLElement>('.player-container')

  // Look for the currently active channel. The profile/home page has a different structure than the player.
  if (playerContainer || document.location.pathname.includes('/play')) {
    const channelNameElement = document.querySelector<HTMLElement>('.ChannelTitle') || document.querySelector<HTMLElement>('.ChannelGridItemTitlesContainer .title') || document.querySelector<HTMLElement>('.PlayerUIControls .title') || document.querySelector<HTMLElement>('.ProgramInfoHeaderTitles .title')
    const programTitleElement = document.querySelector<HTMLElement>('.ProgramInfoHeaderTitles .Typography.bold.h3') || document.querySelector<HTMLElement>('.ProgramTitle') || document.querySelector<HTMLElement>('.ProgramSubtitle') || document.querySelector<HTMLElement>('.PlayerUIControls .subtitle') || document.querySelector<HTMLElement>('.ProgramInfoHeaderTitles .subtitle')

    let channelName = channelNameElement?.textContent?.trim()
    let programTitle = programTitleElement?.textContent?.trim()

    // Fallback: The document title often contains "Program - Channel" or "Channel - Program"
    if (!channelName && !programTitle && document.title && document.title !== 'Free TV') {
      const titleParts = document.title.split('-').map(t => t.trim())
      if (titleParts.length >= 2) {
        channelName = titleParts[0] // Assume first part is Channel for now, could be inverse
        programTitle = titleParts[1]
      }
      else {
        channelName = document.title
      }
    }

    if (channelName || programTitle) {
      details = channelName ? `Watching ${channelName}` : 'Watching FreeTV'
      state = programTitle || 'Live Broadcast'
      // Fetch the img tag that is a sibling or near .circleBackground
      const channelIconElement = document.querySelector<HTMLImageElement>('.CircularProgress.small.showProgress img')
      let iconSrc = channelIconElement?.src

      // FreeTV channel logos are rectangular. Discord expects a square and will crop the edges.
      // We route the image through wsrv.nl to force a 512x512 square canvas with transparent padding.
      if (iconSrc && iconSrc.includes('oqee.net')) {
        // Try to fetch a higher resolution by removing the 'w48' (width constraint) string
        const highResSrc = iconSrc.replace(/\/w\d+$/, '')
        iconSrc = `https://wsrv.nl/?url=${encodeURIComponent(highResSrc)}&w=512&h=512&fit=contain&cbg=transparent`
      }

      // Fallback: Check if the image is a background-image on the class itself
      if (!iconSrc) {
        const bgContainer = document.querySelector<HTMLElement>('.circleBackground') || document.querySelector<HTMLElement>('.ChannelGridItemThumbnailImage')
        if (bgContainer) {
          const bg = window.getComputedStyle(bgContainer).backgroundImage
          if (bg && bg !== 'none') {
            iconSrc = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
          }
        }
      }

      if (iconSrc) {
        smallImageKey = iconSrc
        smallImageText = channelName || 'Channel'
      }
      else {
        const videoElement = document.querySelector<HTMLVideoElement>('video')
        if (videoElement) {
          if (!videoElement.paused) {
            smallImageKey = defaultLogo // Play state fallback
            smallImageText = 'Playing'
          }
          else {
            smallImageKey = defaultLogo // Pause state fallback
            smallImageText = 'Paused'
          }
        }
      }
    }
  }

  // PreMiD strongly recommends keeping strings below 128 characters to avoid Discord RPC errors
  if (details.length > 128)
    details = `${details.substring(0, 125)}...`
  if (state.length > 128)
    state = `${state.substring(0, 125)}...`

  presence.setActivity({
    type: ActivityType.Watching,
    details,
    state,
    largeImageKey,
    largeImageText,
    smallImageKey,
    smallImageText,
    startTimestamp,
    endTimestamp,
  })
})
