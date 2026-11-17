import { ActivityType, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1572307039282012342',
})

// Get translated strings
const strings = presence.getStrings({
  browsing: 'general.browsing',
  paused: 'general.paused',
  watching: 'general.watching',
  episode: 'general.episode',
})

presence.on('UpdateData', async () => {
  // Get translations
  const translatedStrings = await strings

  // Get the current URL
  const path = decodeURIComponent(
    document.location.pathname,
  )

  const parts = path.split('/')

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    details: `${translatedStrings.browsing.replace(/\.+$/, '').trim()} HKAnime`,
    state: 'Looking for anime to watch',
    largeImageKey: 'https://i.imgur.com/4lKtB9R.png',
    largeImageText: 'HKAnime',
  }

  // Check if user is watching an anime episode
  if (parts[1] === 'play' && parts[2]) {
    const animeTitle = parts[2]

    // Find the currently selected episode
    const episodeElement = document.querySelector(
      '#ep-list-container .eplist.active',
    )

    // Get the episode number
    const episodeNumber = episodeElement?.getAttribute(
      'data-episode-number',
    )

    // Get the episode title
    const episodeTitle = document.querySelector(
      '#ep-list-container .eplist.active span:not(.playing-label)',
    )?.textContent?.trim()

    // Display the anime title
    presenceData.details = animeTitle

    // Get HKAnime's thumbnail
    const thumbnail = document
      .querySelector<HTMLMetaElement>(
        'meta[property="og:image"]',
      )
      ?.getAttribute('content')

    if (thumbnail) {
      presenceData.largeImageKey = thumbnail
      presenceData.largeImageText = animeTitle
    }

    // Display episode number and title
    if (episodeNumber) {
      // Remove release date from episode title
      const cleanTitle = episodeTitle
        ?.replace(/\s*\(\d{4}\/\d{2}\/\d{2}\)/g, '')
        .trim()

      presenceData.state = cleanTitle
        ? `EP${episodeNumber} ${cleanTitle}`
        : `${translatedStrings.episode} ${episodeNumber}`
    }
    else {
      presenceData.state = translatedStrings.watching
    }
  }

  // Find the HKAnime video player
  const video = document.querySelector<HTMLVideoElement>(
    'video.jw-video',
  )

  // Detect video playback and paused status
  if (video && parts[1] === 'play') {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      if (video.paused) {
        // Display paused status
        presenceData.state
          = `${translatedStrings.paused} | ${presenceData.state}`
      }
      else {
        // Calculate playback progress
        [
          presenceData.startTimestamp,
          presenceData.endTimestamp,
        ] = getTimestampsFromMedia(video)
      }
    }
  }

  // Update Discord Rich Presence
  presence.setActivity(presenceData)
})
