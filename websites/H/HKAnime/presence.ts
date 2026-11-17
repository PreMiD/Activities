import { ActivityType, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1572307039282012342',
})

presence.on('UpdateData', async () => {
  // get the current URL
  const path = decodeURIComponent(
    document.location.pathname
  )

  const parts = path.split('/')

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    details: 'Browsing HKAnime',
    state: 'Looking for anime to watch',
  }

  // check if user is watching an anime episode
  if (parts[1] === 'play' && parts[2]) {
    const animeTitle = parts[2]

    // find the currently selected episode
    const episodeElement = document.querySelector(
      '#ep-list-container .eplist.active'
    )

    // get the episode number
    const episodeNumber = episodeElement?.getAttribute(
      'data-episode-number'
    )

    // get the episode title
    const episodeTitle = document.querySelector(
      '#ep-list-container .eplist.active span:not(.playing-label)'
    )?.textContent?.trim()

    // display the anime title
    presenceData.details = animeTitle

    // hk anime thumbnail
    const thumbnail = document
      .querySelector<HTMLMetaElement>(
        'meta[property="og:image"]'
      )
      ?.getAttribute('content')

    if (thumbnail) {
      presenceData.largeImageKey = thumbnail
      presenceData.largeImageText = animeTitle
    }

    // display episode number and title
    if (episodeNumber) {
      // remove other information from episode
      const cleanTitle = episodeTitle
        ?.replace(/\s*\(\d{4}\/\d{2}\/\d{2}\)/g, '')
        .trim()

      presenceData.state = cleanTitle
        ? `EP${episodeNumber} ${cleanTitle}`
        : `Episode ${episodeNumber}`
    }
    else {
      presenceData.state = 'Watching anime'
    }
  }

  // hk anime video player
  const video = document.querySelector<HTMLVideoElement>(
    'video.jw-video'
  )

  // detect if video is playing or paused
  if (video && parts[1] === 'play') {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      if (video.paused) {
        // paused status
        presenceData.state = `Paused | ${presenceData.state}`
      }
      else {
        // video playback progress
        [
          presenceData.startTimestamp,
          presenceData.endTimestamp
        ] = getTimestampsFromMedia(video)
      }
    }
  }

  // update rpc
  presence.setActivity(presenceData)
})
