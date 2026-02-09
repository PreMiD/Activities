import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia } from 'premid'

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/Waipu.tv/assets/logo.png',
}

const presence = new Presence({
  clientId: '1454116232948088954',
})

// Create browsing timestamp outside UpdateData to maintain consistent timing
let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatchingVideo = false

// Cache for show data to persist through cinema-mode
interface CachedShowData {
  showTitle: string
  episodeTitle: string | undefined
  channel: string
  channelLogoUrl: string | undefined
  seasonNumber: string | undefined
  episodeNumber: string | undefined
  largeImageText: string
  timeText: string | undefined
}

let cachedShowData: CachedShowData | null = null

// Hardcoded list of NSFW channel paths
const NSFW_CHANNELS = [
  'darkromance',
  'pridetv',
  'hotpassion',
  'obsessiontv',
]

/**
 * Parses a comma-separated list of channels from a string
 * @param channelsString Comma-separated string of channel names
 * @returns Array of channel names (trimmed and lowercased), empty array if input is empty
 */
function parseChannelsList(channelsString: string | null | undefined): string[] {
  if (!channelsString || channelsString.trim().length === 0) {
    return []
  }

  return channelsString
    .split(',')
    .map(channel => channel.trim().toLowerCase())
    .filter(channel => channel.length > 0)
}

/**
 * Checks if the current URL matches any channel in the given list
 * @param url The URL to check
 * @param channels Array of channel names to check against
 * @returns true if the URL matches any channel in the list
 */
function isChannelInList(url: string, channels: string[]): boolean {
  if (channels.length === 0)
    return false

  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase().trim()

    // Remove leading and trailing slashes, then split by '/'
    const pathSegments = pathname.split('/').filter(segment => segment.length > 0)

    // Check if the first path segment matches any channel
    if (pathSegments.length === 0)
      return false

    const firstSegment = pathSegments[0]
    return channels.some(channel => firstSegment === channel.toLowerCase())
  }
  catch {
    return false
  }
}

/**
 * Checks if the current URL is an NSFW channel
 * @param url The URL to check
 * @param nsfwChannels Array of NSFW channel names to check against
 * @returns true if the URL matches an NSFW channel path
 */
function isNSFWChannel(url: string, nsfwChannels: string[]): boolean {
  return isChannelInList(url, nsfwChannels)
}

/**
 * Parses time information from the HTML to calculate video timestamps
 * Format: "Seit 14:40 Uhr ⋅ noch 9 Min." (Since 14:40 ⋅ still 9 Min.)
 * @param timeText The time text from the HTML element
 * @returns [currentTime, duration] in seconds, or null if parsing fails
 */
function parseTimeFromHTML(timeText: string | null | undefined): [number, number] | null {
  if (!timeText)
    return null

  try {
    // Match pattern: "Seit HH:MM Uhr ⋅ noch X Min."
    const match = timeText.match(/Seit\s+(\d{1,2}):(\d{2})\s+Uhr\s+⋅\s+noch\s+(\d+)\s+Min\./i)
    if (!match || match.length < 4)
      return null

    const startHour = match[1]
    const startMinute = match[2]
    const remainingMinutes = match[3]

    if (!startHour || !startMinute || !remainingMinutes)
      return null

    const startHourNum = Number.parseInt(startHour, 10)
    const startMinuteNum = Number.parseInt(startMinute, 10)
    const remainingMinutesNum = Number.parseInt(remainingMinutes, 10)

    // Get current time
    const now = new Date()

    // Calculate start time (today at the parsed hour:minute)
    const startTime = new Date(now)
    startTime.setHours(startHourNum, startMinuteNum, 0, 0)

    // If start time is in the future (e.g., it's past midnight), it was yesterday
    if (startTime > now) {
      startTime.setDate(startTime.getDate() - 1)
    }

    // Calculate elapsed time in seconds
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)

    // Calculate total duration: elapsed + remaining
    const totalDurationSeconds = elapsedSeconds + (remainingMinutesNum * 60)

    // Validate the calculated times
    if (
      elapsedSeconds >= 0
      && totalDurationSeconds > 0
      && elapsedSeconds <= totalDurationSeconds
      && totalDurationSeconds < 86400 // Less than 24 hours (reasonable for a TV show)
    ) {
      return [elapsedSeconds, totalDurationSeconds]
    }
  }
  catch {
    // If parsing fails, return null
  }

  return null
}

presence.on('UpdateData', async () => {
  // Get settings
  const [privacy, excludedChannelsString] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<string>('excludedChannels'),
  ])

  // Get translations
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    watchingShow: 'general.watchingShow',
    watchButton: 'general.buttonWatchVideo',
    season: 'general.season',
    episode: 'general.episode',
  })

  // Parse excluded channels list (always active, regardless of other settings)
  const excludedChannels = parseChannelsList(excludedChannelsString)

  // Check if current URL is in the excluded channels list - if so, block immediately
  if (isChannelInList(document.location.href, excludedChannels)) {
    presence.setActivity()
    return
  }

  // Check if current URL is an NSFW channel
  const isNSFW = isNSFWChannel(document.location.href, NSFW_CHANNELS)

  // If it's an NSFW channel, show a generic viewing message
  if (isNSFW) {
    const presenceData: PresenceData = {
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'waipu.tv',
      details: strings.watchingShow,
      startTimestamp: browsingTimestamp,
      type: ActivityType.Watching,
    }
    presence.setActivity(presenceData)
    return
  }

  // Get the video element
  const video = document.querySelector<HTMLVideoElement>('video#video')

  if (video && video.readyState > 0) {
    // Check if OSD is in cinema-mode (info bar hidden)
    const osdElement = document.querySelector('#media-player-osd')
    const isCinemaMode = osdElement?.classList.contains('cinema-mode') ?? false

    let showTitle: string
    let episodeTitle: string | undefined
    let channel: string
    let channelLogoUrl: string | undefined
    let seasonNumber: string | undefined
    let episodeNumber: string | undefined
    let largeImageText: string
    let timeText: string | undefined

    // Only update cached data when OSD is visible (not in cinema-mode)
    if (!isCinemaMode) {
      // Get show information from the OSD (On-Screen Display)
      const osdTitle = document.querySelector('.osd__title')?.textContent?.trim()

      // Get detailed information from the program details overlay
      showTitle = document.querySelector('[data-testid="program-teaser-informations-title"]')?.textContent?.trim()
        || osdTitle
        || 'Unknown Show'

      episodeTitle = document.querySelector('.c-hzayXV.c-dznuqJ.c-kitxqv')?.textContent?.trim()

      // Get channel name
      channel = document.querySelector('.c-knIRGr.c-cZoquc')?.textContent?.trim()
        || document.querySelector('.osd__icon--channel-logo img')?.getAttribute('alt')
        || 'Unknown Channel'

      // Get channel logo URL from the OSD channel logo image
      const channelLogoImg = document.querySelector('.osd__icon--channel-logo img[data-testid="osd-channel-logo"]')
      channelLogoUrl = channelLogoImg?.getAttribute('src') || undefined

      // Get metadata (contains Season and Episode info for TV series)
      const metaInfo = document.querySelector('.c-hDXjIm.c-idbSSC')?.textContent?.trim()

      // Extract season and episode from metadata (format: "... ⋅ Staffel 11 ⋅ Episode 6")
      if (metaInfo) {
        const seasonMatch = metaInfo.match(/Staffel\s+(\d+)/i)
        const episodeMatch = metaInfo.match(/Episode\s+(\d+)/i)

        if (seasonMatch)
          seasonNumber = seasonMatch[1]
        if (episodeMatch)
          episodeNumber = episodeMatch[1]
      }

      // Get time information from program details overlay
      timeText = document.querySelector('.c-legVgA.c-jvujVL')?.textContent?.trim()

      // Calculate large image text
      largeImageText = seasonNumber && episodeNumber
        ? `${channel} - ${strings.season} ${seasonNumber}, ${strings.episode} ${episodeNumber}`
        : channel

      // Cache the data
      cachedShowData = {
        showTitle,
        episodeTitle,
        channel,
        channelLogoUrl,
        seasonNumber,
        episodeNumber,
        largeImageText,
        timeText,
      }
    }
    else {
      // Use cached data when in cinema-mode
      if (cachedShowData) {
        showTitle = cachedShowData.showTitle
        episodeTitle = cachedShowData.episodeTitle
        channel = cachedShowData.channel
        channelLogoUrl = cachedShowData.channelLogoUrl
        seasonNumber = cachedShowData.seasonNumber
        episodeNumber = cachedShowData.episodeNumber
        largeImageText = cachedShowData.largeImageText
        timeText = cachedShowData.timeText
      }
      else {
        // Fallback if no cached data available
        const osdTitle = document.querySelector('.osd__title')?.textContent?.trim()
        showTitle = osdTitle || 'Unknown Show'
        channel = document.querySelector('.osd__icon--channel-logo img')?.getAttribute('alt') || 'Unknown Channel'
        largeImageText = channel
        // Try to get logo even in fallback
        const channelLogoImg = document.querySelector('.osd__icon--channel-logo img[data-testid="osd-channel-logo"]')
        channelLogoUrl = channelLogoImg?.getAttribute('src') || undefined
      }
    }

    const isPlaying = !video.paused

    // Build the state string and details
    let state: string | undefined
    let details: string
    let finalLargeImageText: string

    if (privacy) {
      // Privacy mode: hide specific details
      details = strings.watchingShow
      // Don't show episode information in largeImageText when privacy is enabled
      finalLargeImageText = 'waipu.tv'
    }
    else {
      // Normal mode: show full details
      details = showTitle
      finalLargeImageText = largeImageText
      if (seasonNumber && episodeNumber && episodeTitle) {
        state = `S${seasonNumber}:E${episodeNumber} - ${episodeTitle}`
      }
      else if (seasonNumber && episodeNumber) {
        state = `S${seasonNumber}:E${episodeNumber}`
      }
      else if (episodeTitle) {
        state = episodeTitle
      }
      else {
        // For movies, just show the channel name
        state = channel
      }
    }

    const presenceData: PresenceData = {
      largeImageKey: channelLogoUrl || ActivityAssets.Logo,
      largeImageText: finalLargeImageText,
      type: ActivityType.Watching,
      details,
    }

    // Only add state if it's defined (not in privacy mode)
    if (state) {
      presenceData.state = state
    }

    if (isPlaying) {
      // Set the small image key and text for playing state
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.play

      // Try to get time information from HTML first (more reliable for live TV)
      // Use cached timeText if in cinema-mode, otherwise get fresh data
      const parsedTime = parseTimeFromHTML(timeText)

      if (parsedTime) {
        // Use parsed time from HTML
        const [currentTime, duration] = parsedTime
        const [startTimestamp, endTimestamp] = getTimestamps(currentTime, duration)

        if (Number.isFinite(startTimestamp) && Number.isFinite(endTimestamp) && endTimestamp > startTimestamp) {
          presenceData.startTimestamp = startTimestamp
          presenceData.endTimestamp = endTimestamp
        }
      }
      else {
        // Fallback to video element if HTML parsing fails
        const duration = video.duration
        const currentTime = video.currentTime

        // Only set timestamps if duration is valid (finite, greater than 0, and not NaN)
        if (
          Number.isFinite(duration)
          && duration > 0
          && Number.isFinite(currentTime)
          && currentTime >= 0
          && currentTime <= duration
        ) {
          // Calculate timestamps using getTimestampsFromMedia
          const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)

          // Additional validation: ensure timestamps are valid numbers
          if (Number.isFinite(startTimestamp) && Number.isFinite(endTimestamp) && endTimestamp > startTimestamp) {
            presenceData.startTimestamp = startTimestamp
            presenceData.endTimestamp = endTimestamp
          }
          // If timestamps are invalid, don't set them (just show "Playing" without progress)
        }
        // If duration is invalid, don't set timestamps (just show "Playing" without progress)
      }
    }
    else {
      // Set the small image key and text for paused state
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.pause

      // Remove timestamps when paused
      if (presenceData.startTimestamp)
        delete presenceData.startTimestamp
      if (presenceData.endTimestamp)
        delete presenceData.endTimestamp
    }

    // Add buttons (always show unless privacy mode)
    if (!privacy) {
      presenceData.buttons = [
        {
          label: strings.watchButton,
          url: document.location.href,
        },
      ]
    }

    wasWatchingVideo = true

    // Set the activity
    presence.setActivity(presenceData)
  }
  else {
    // User is browsing the website
    // Only update browsing timestamp when changing from watching to browsing
    if (wasWatchingVideo) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatchingVideo = false
      // Clear cached data when not watching
      cachedShowData = null
    }

    const presenceData: PresenceData = {
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'waipu.tv',
      details: strings.browse,
      startTimestamp: browsingTimestamp,
      type: ActivityType.Watching,
    }

    // Set the activity
    presence.setActivity(presenceData)
  }
})
