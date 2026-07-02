const presence = new Presence({
  clientId: '1514249657549586482',
})

let lastTrackTitle = ''
let lastArtist = ''
let elapsedSinceChange = 0

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/OpenJam/assets/logo.png',
  }

  const [showButtons, showTimestamps] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamps'),
  ])
  const path = document.location.pathname

  const roomMatch = path.match(/^\/room\/(.+)/)

  if (roomMatch) {
    const roomId = roomMatch[1]
    const trackTitleEl = document.querySelector('[data-presence="track-name"], .mp-track-title')
    const artistEl = document.querySelector('[data-presence="artist"], .mp-track-artist')
    const playBtn = document.querySelector<HTMLButtonElement>('.mp-play-btn-large')
    const isPlaying = playBtn?.title === 'Pause'

    const trackTitle = trackTitleEl?.textContent?.trim() || ''
    const artist = artistEl?.textContent?.trim() || ''

    if (trackTitle && artist && trackTitle !== 'Nothing playing' && isPlaying) {
      if (trackTitle !== lastTrackTitle || artist !== lastArtist) {
        lastTrackTitle = trackTitle
        lastArtist = artist
        elapsedSinceChange = Date.now()
      }

      presenceData.details = trackTitle.substring(0, 127)
      presenceData.state = `by ${artist.substring(0, 120)}`

      if (showTimestamps) {
        presenceData.startTimestamp = Math.floor(elapsedSinceChange / 1000)
      }
    }
    else {
      lastTrackTitle = ''
      lastArtist = ''

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
    lastTrackTitle = ''
    lastArtist = ''
  }

  presence.setActivity(presenceData)
})
