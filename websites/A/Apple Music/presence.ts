import { Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '842112189618978897',
})

const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase())
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey:
      'https://cdn.rcd.gg/PreMiD/websites/A/Apple%20Music/assets/logo.png',
  }

  const [
    hidePaused,
    displayType,
    timestamps,
    cover,
    playback,
    buttons,
    listening,
  ] = await Promise.all([
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<number>('displayType'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('playback'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('listening'),
  ])

  let data: any = null

  // Use MediaSession for cross-browser compatibility
  const metadata = navigator.mediaSession?.metadata
  if (metadata) {
    const audio = document.querySelector<HTMLAudioElement>('audio')
    const video = document.querySelector<HTMLVideoElement>('video')
    const media = audio || video
    if (media && !media.ended) {
      const paused = media.paused || media.readyState <= 2
      data = {
        album: metadata.album || '',
        artist: metadata.artist || '',
        artwork: metadata.artwork?.[0]?.src?.replace(/\d{1,2}x\d{1,2}[a-z]{1,2}/, '512x512') || '',
        duration: media.duration || 0,
        elapsed: media.currentTime || 0,
        name: metadata.title || '',
        paused,
      }
    }
  }

  // If playing music, show song info
  if (data && listening) {
    if (data.paused && hidePaused) {
      presence.setActivity()
      return
    }

    // Set details and state based on displayType
    switch (displayType) {
      case 1: // Artist Name
        presenceData.details = data.artist
        presenceData.state = data.name
        break
      case 2: // Song Title
        presenceData.details = data.name
        break
      default: // Activity Name / default
        presenceData.details = `Listening to ${data.name} by ${data.artist}`
        break
    }

    if (cover) {
      presenceData.largeImageKey = data.artwork || presenceData.largeImageKey
    }

    if (playback) {
      if (data.paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = (await strings).pause
      }
      else {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = (await strings).play
      }
    }

    if (timestamps) {
      const [start, end] = getTimestamps(data.elapsed, data.duration)
      presenceData.startTimestamp = start
      presenceData.endTimestamp = end
    }

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Listen on Apple Music',
          url: window.location.href,
        },
      ]
    }

    presence.setActivity(presenceData)
    return
  }
  else {
    // Show page info
    const path = window.location.pathname
    const parts = path.split('/').filter(p => p)

    presenceData.details = 'On Home'

    if (parts.length >= 4 && parts[2]) {
      const type = parts[1]
      const nameSlug = parts[2]
      const id = parts[3]

      if (type === 'album' || type === 'song' || type === 'playlist') {
        const name = capitalizeWords(nameSlug.replace(/-/g, ' '))
        const typeName = type === 'album' ? 'Album' : type === 'song' ? 'Song' : 'Playlist'
        presenceData.details = `On ${typeName}: ${name}`

        // Try to get cover image
        if (cover && (type === 'album' || type === 'song')) {
          try {
            const entity = type === 'album' ? 'album' : 'song'
            const response = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=${entity}`)
            const data = await response.json()
            if (data.results && data.results[0] && data.results[0].artworkUrl100) {
              presenceData.largeImageKey = data.results[0].artworkUrl100.replace('100x100', '512x512')
            }
          }
          catch {
            // Fallback to logo
          }
        }
      }
    }
    else if (parts.length >= 2) {
      const page = parts[1]
      if (page === 'radio') {
        presenceData.details = 'On Radio'
      }
      else if (page === 'library') {
        presenceData.details = 'In Library'
      }
      else if (page === 'search') {
        presenceData.details = 'Searching Music'
      }
    }
  }

  presence.setActivity(presenceData)
})
