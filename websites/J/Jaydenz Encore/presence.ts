const presence = new Presence({
  clientId: '1392106746906153073',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://jaydenzkoci.github.io/assets/images/icon512.png',
  }

  const [showButtons, showDetails, showTime] = await Promise.all([
    presence.getSetting('useButtons'),
    presence.getSetting('useDetails'),
    presence.getSetting('useTime'),
  ])

  let secondaryButton: ButtonData | undefined
  const searchInputEl = document.querySelector<HTMLInputElement>('#searchInput')

  if (document.body.classList.contains('video-popup-open')) {
    const videoTitle = document.getElementById('videoTrackTitle')?.textContent
    const videoCover = document.getElementById('videoTrackCover') as HTMLImageElement

    presenceData.details = `Watching: ${videoTitle || 'A video'}`

    if (showDetails) {
      const videoArtist = document.getElementById('videoTrackArtist')?.textContent
      const songInfo = document.getElementById('videoTrackDuration')?.textContent
      presenceData.state = `${videoArtist || 'an artist'} | ${songInfo || ''}`
    }

    if (videoCover?.src) {
      presenceData.largeImageKey = videoCover.src
    }

    const player = (window as any).player
    if (showTime && player && typeof player.getCurrentTime === 'function') {
      const currentTime = player.getCurrentTime()
      const duration = player.getDuration()

      if (duration > 0) {
        presenceData.startTimestamp = Date.now() - (currentTime * 1000)
        presenceData.endTimestamp = presenceData.startTimestamp + (duration * 1000)
      }
    }

    const videoUrl = (window as any).player?.getVideoUrl ? (window as any).player.getVideoUrl() : null
    if (videoUrl) {
      secondaryButton = { label: 'Watch Video', url: videoUrl }
    }
  }
  else if (document.body.classList.contains('modal-open')) {
    const modalTitleEl = document.getElementById('modalTitle')?.textContent

    presenceData.details = modalTitleEl || 'A track'

    if (showDetails) {
      const modalArtistEl = document.getElementById('modalArtist')?.textContent
      const songInfo = document.getElementById('modalDuration')?.textContent
      presenceData.state = `${modalArtistEl || 'an artist'} | ${songInfo || ''}`
    }

    const modalCover = document.getElementById('modalCover') as HTMLImageElement
    if (modalCover?.src) {
      presenceData.largeImageKey = modalCover.src
    }

    const modalElement = document.getElementById('trackModal')
    const previewUrl = modalElement?.getAttribute('data-preview-url')
    if (previewUrl) {
      secondaryButton = { label: 'Listen to Preview', url: previewUrl }
    }
  }
  else {
    if (searchInputEl?.value) {
      presenceData.details = 'Searching for a track...'
      presenceData.state = `Query: '${searchInputEl.value}'`
    }
    else {
      presenceData.details = 'Browse Tracks'
      const trackCountEl = document.getElementById('trackCount')
      const trackCountText = trackCountEl?.textContent || ''
      const trackCount = trackCountText.match(/\d+/) || [0]
      presenceData.state = `Searching ${trackCount[0]} Tracks`
    }
  }

  if (showButtons && secondaryButton) {
    presenceData.buttons = [secondaryButton]
  }

  presence.setActivity(presenceData)
})
