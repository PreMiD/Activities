const presence = new Presence({
  clientId: '1514249657549586482',
})

let lastTrackTitle = ''
let elapsedSinceChange = 0

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://files.catbox.moe/oz8aca.png',
  }

  const showButtons = await presence.getSetting<boolean>('buttons')
  const showTimestamps = await presence.getSetting<boolean>('timestamps')
  const path = document.location.pathname

  const roomMatch = path.match(/^\/room\/(.+)/)

  if (roomMatch) {
    const roomId = roomMatch[1]
    const trackTitleEl = document.querySelector('[data-presence="track-name"], .mp-track-title')
    const artistEl = document.querySelector('[data-presence="artist"], .mp-track-artist')
    const playBtn = document.querySelector<HTMLButtonElement>('.mp-play-btn-large')

    if (playBtn && trackTitleEl && artistEl) {
      const trackTitle = trackTitleEl.textContent?.trim() || ''
      const artist = artistEl.textContent?.trim() || ''
      const isPlaying = playBtn.title === 'Pause'

      if (trackTitle && artist && trackTitle !== 'Nothing playing' && isPlaying) {
        if (trackTitle !== lastTrackTitle) {
          lastTrackTitle = trackTitle
          elapsedSinceChange = Date.now()
        }

        presenceData.details = trackTitle.substring(0, 127)
        presenceData.state = `by ${artist.substring(0, 120)}`

        if (showTimestamps)
          presenceData.startTimestamp = Math.floor(elapsedSinceChange / 1000)
      }
      else {
        presenceData.details = 'In a Jam Room'
        presenceData.state = 'Waiting for music...'
      }
    }
    else {
      presenceData.details = 'In a Jam Room'
      presenceData.state = 'Waiting for music...'
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Join Jam Room',
          url: `${document.location.origin}/room/${roomId}`,
        },
      ]
    }
  }
  else {
    presenceData.details = 'Browsing OpenJam'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
