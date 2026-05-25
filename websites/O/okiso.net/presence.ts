import { Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({ clientId: '1505219461152636949' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const releaseTitle = document.querySelector('[data-premid-release-title]')?.getAttribute('data-premid-release-title')
  const releaseCover = document.querySelector('[data-premid-release-cover]')?.getAttribute('data-premid-release-cover')

  const presenceData: any = {
    type: 3, // ActivityType.Watching
    largeImageKey: 'https://i.imgur.com/0Qraju1.png',
    largeImageText: 'okiso.net',
    startTimestamp: browsingTimestamp,
    buttons: [
      { label: 'Visit okiso.net', url: `https://okiso.net${pathname === '/' ? '' : pathname}` },
      { label: 'Join Discord', url: 'https://discord.gg/okiso' },
    ],
  }

  // ─── Global Overrides ───
  if (releaseTitle) {
    presenceData.details = 'Viewing Release'
    presenceData.state = `🎵 ${releaseTitle}`
    if (releaseCover) {
      presenceData.largeImageKey = releaseCover
      presenceData.largeImageText = releaseTitle
    }
  }
  // ─── Home Page ───
  else if (pathname === '/') {
    // Check for Modals
    const termsModal = document.querySelector('[data-premid-modal="terms"]')
    const contactModal = document.querySelector('[data-premid-modal="contact"]')
    
    if (termsModal) {
      presenceData.details = 'Reading Content Terms'
      presenceData.state = 'Legal & Guidelines'
    }
    else if (contactModal) {
      presenceData.details = 'Viewing Contact Info'
      presenceData.state = 'Business & Collaborations'
    }
    else {
      // Check for live broadcast
      const isLive = document.querySelector('[data-premid-live="true"]')
      if (isLive) {
        presenceData.details = 'Watching Live Broadcast'
        presenceData.state = '🔴 LIVE on Twitch'
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = 'Live'
        delete presenceData.startTimestamp
      }
      else {
        // Check for video playback
        const videoPlayer = document.querySelector('[data-premid-title]')
        if (videoPlayer) {
          const videoTitle = videoPlayer.getAttribute('data-premid-title')
          const paused = videoPlayer.getAttribute('data-premid-paused') === 'true'
          const videoPoster = videoPlayer.getAttribute('data-premid-poster')

          presenceData.details = videoTitle || 'Watching a Video'
          presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
          presenceData.smallImageText = paused ? 'Paused' : 'Playing'

          if (videoPoster) {
            presenceData.largeImageKey = videoPoster
          }

          if (!paused) {
            const video = document.querySelector<HTMLVideoElement>('[data-premid-title] video')
            if (video) {
              const timestamps = getTimestampsFromMedia(video)
              presenceData.startTimestamp = timestamps[0]
              presenceData.endTimestamp = timestamps[1]
            }
          }

          presenceData.state = paused ? '⏸ Paused' : '▶ Playing'
        }
        else {
          presenceData.details = 'Browsing'
          presenceData.state = 'Home Page'
        }
      }
    }
  }
  // ─── Discography ───
  else if (pathname === '/releases') {
    const container = document.querySelector('[data-premid-page="releases"]')
    const viewMode = container?.getAttribute('data-premid-view')

    presenceData.details = viewMode === 'orbit' ? 'Exploring 3D Audio Archive' : 'Browsing Discography'
    presenceData.state = viewMode === 'orbit' ? 'Interactive 3D Mode' : 'List View'
  }

  // ─── Upcoming Page ───
  else if (pathname === '/upcoming') {
    presenceData.details = 'Browsing'
    presenceData.state = 'Upcoming Releases'
  }
  // ─── Fallback ───
  else {
    presenceData.details = document.title || 'Browsing'
    presenceData.state = 'okiso.net'
  }

  // ─── Global Music Player ───
  const musicContainer = document.getElementById('spotify-embed-container-data')
  const trackTitle = musicContainer?.getAttribute('data-premid-track-title')

  if (trackTitle) {
    const artist = musicContainer?.getAttribute('data-premid-track-artist')
    const coverUrl = musicContainer?.getAttribute('data-premid-cover-url')
    const spotifyLink = musicContainer?.getAttribute('data-premid-link')
    const paused = musicContainer?.getAttribute('data-premid-paused') === 'true'

    // Override the main details if they are listening to music
    presenceData.type = 2 // ActivityType.Listening
    presenceData.details = paused ? `Paused: ${trackTitle}` : `Listening to ${trackTitle}`
    presenceData.state = `by ${artist || 'OKISO'}`
    presenceData.smallImageKey = paused ? Assets.Pause : 'logo'
    presenceData.smallImageText = paused ? 'Paused' : 'okiso.net'
    
    if (coverUrl) {
      presenceData.largeImageKey = coverUrl
      presenceData.largeImageText = trackTitle
    }
    
    if (spotifyLink) {
      presenceData.buttons = [
        { label: 'Listen on Spotify', url: spotifyLink },
        { label: 'Join Discord', url: 'https://discord.gg/okiso' },
      ]
    }
    
    delete presenceData.startTimestamp // Remove browsing timestamp so it doesn't look like a long song
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
