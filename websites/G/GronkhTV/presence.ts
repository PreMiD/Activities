import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1393645881785585674',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/Ht9axHi.jpeg',
}

let currentTime: number,
  paused: boolean,
  playback: boolean,
  currentDuration: number

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  const { pathname, href } = window.location
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp')

  // Language strings - corrected implementation
  const strings = await presence.getStrings({
    browsing: 'general.browsing',
    watching: 'general.watching',
    paused: 'general.paused',
    loading: 'general.loading',
    viewVideo: 'general.buttonViewVideo',
    episode: 'general.episode',
    homepage: 'general.viewHome',
    streams: 'general.browsing',
  })

  if (pathname === '/' || pathname === '/landing') {
    presenceData.details = 'Viewing Gronkh.tv'
    presenceData.state = strings.homepage || 'Browsing homepage'
    presenceData.startTimestamp = Date.now()

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Visit Gronkh.tv',
          url: href,
        },
      ]
    }
  }

  else if (pathname.startsWith('/streams/')) {
    const episodeMatch = pathname.match(/\/streams\/(\d+)/)
    const episodeNumber = episodeMatch ? episodeMatch[1] : null

    const titleElement = document.querySelector('h1, .video-title, [class*="title"], .g-stream-title, .stream-title')
    let videoTitle = titleElement?.textContent?.trim() || 'Unknown Video'

    if (videoTitle.length > 80)
      videoTitle = `${videoTitle.substring(0, 77)}...`

    const videoElement = document.querySelector('video') as HTMLVideoElement
    const currentTimeElement = document.querySelector('.grui-video-timestamp-current')
    const totalTimeElement = document.querySelector('.grui-video-timestamp-total')
    const playButton = document.querySelector('button[aria-label*="Video Fortsetzen"], button[aria-label*="Video Pausieren"]')

    const parseTimeString = (timeStr: string): number => {
      if (!timeStr)
        return 0
      const parts = timeStr.split(':').map(Number)
      if (parts.length === 3 && parts[0] !== undefined && parts[1] !== undefined && parts[2] !== undefined) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
      }
      else if (parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined) {
        return parts[0] * 60 + parts[1]
      }
      return 0
    }

    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)

      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      else {
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
    }

    if (videoElement || (currentTimeElement && totalTimeElement)) {
      const currentTimeText = currentTimeElement?.textContent?.trim() || '0:00'
      const totalTimeText = totalTimeElement?.textContent?.trim() || '0:00'

      currentTime = parseTimeString(currentTimeText)
      currentDuration = parseTimeString(totalTimeText)

      if (videoElement) {
        paused = videoElement.paused
      }
      else {
        const buttonIcon = playButton?.textContent?.trim()
        paused = buttonIcon === 'play_arrow'
      }

      playback = currentDuration > 0

      presenceData.details = `${videoTitle}${episodeNumber ? ` (Episode ${episodeNumber})` : ''}`

      if (playback) {
        const currentTimeFormatted = currentTimeText || formatTime(currentTime)
        const totalTimeFormatted = totalTimeText || formatTime(currentDuration)
        const statusText = paused ? (strings.paused || 'Paused') : (strings.watching || 'Watching')
        presenceData.state = `${statusText} • ${currentTimeFormatted} / ${totalTimeFormatted}`

        if (showTimestamp && !paused) {
          presenceData.startTimestamp = Date.now() - currentTime * 1000
          presenceData.endTimestamp = Date.now() + (currentDuration - currentTime) * 1000
        }
      }
      else {
        presenceData.state = paused ? (strings.paused || 'Paused') : (strings.watching || 'Watching')
      }

      if (paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = strings.paused || 'Paused'
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
      else if (playback) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = strings.watching || 'Watching'
      }
    }
    else {
      presenceData.details = `${videoTitle}${episodeNumber ? ` (${strings.episode || 'Episode'} ${episodeNumber})` : ''}`
      presenceData.state = 'Loading video'
      presenceData.startTimestamp = Date.now()
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Watch Video',
          url: href,
        },
      ]
    }
  }
  else if (pathname.startsWith('/streams')) {
    presenceData.details = 'Viewing Gronkh.tv'
    presenceData.state = strings.browsing || 'Browsing streams'
    presenceData.startTimestamp = Date.now()

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Browse Streams',
          url: href,
        },
      ]
    }
  }
  else {
    presenceData.details = 'Viewing Gronkh.tv'
    presenceData.state = strings.browsing || 'Browsing'
    presenceData.startTimestamp = Date.now()

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Visit Gronkh.tv',
          url: href,
        },
      ]
    }
  }

  presence.setActivity(presenceData)
})
