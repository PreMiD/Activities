const iframe = new iFrame()

let videoFound = false
let jwPlayerInterval: number | null = null
let lastUpdateTime = 0

interface JWPlayer {
  getDuration: () => number
  getPosition: () => number
  getState: () => string
}

declare global {
  interface Window {
    jwplayer?: () => JWPlayer
  }
}

function findAndTrackVideo() {
  if (window.location.hostname.includes('abysscdn.com')) {
    const playerDiv = document.getElementById('player')
    if (playerDiv) {
      const video = playerDiv.querySelector('video')
      if (video && !Number.isNaN(video.duration) && video.duration > 0) {
        setupVideoTracking(video)
        return true
      }
    }
  }

  const videoSelectors = [
    'video',
    '.video-js video',
    '.plyr video',
    '*[id*="player"] video',
    '.jw-video',
    '.vjs-tech',
    'video.op-player__media',
    'iframe video',
    '.Video video',
    '#player video',
    '#hydrax-player video',
  ]

  for (const selector of videoSelectors) {
    const video = document.querySelector<HTMLVideoElement>(selector)
    if (video && !Number.isNaN(video.duration) && video.duration > 0) {
      setupVideoTracking(video)
      return true
    }
  }

  if (window.jwplayer) {
    const player = window.jwplayer()
    if (player && typeof player.getDuration === 'function' && typeof player.getPosition === 'function') {
      setupJWPlayerTracking(player)
      return true
    }
  }

  const elements = document.querySelectorAll('*')
  for (const elem of elements) {
    if (elem.shadowRoot) {
      const video = elem.shadowRoot.querySelector('video')
      if (video && !Number.isNaN(video.duration) && video.duration > 0) {
        setupVideoTracking(video)
        return true
      }
    }
  }

  const scripts = document.querySelectorAll('script')
  for (const script of scripts) {
    if (script.src && (
      script.src.includes('iamcdn.net')
      || script.src.includes('abysscdn.com')
      || script.src.includes('core.bundle')
    )) {
      setTimeout(() => {
        const video = document.querySelector('video')
        if (video && !Number.isNaN(video.duration) && video.duration > 0) {
          setupVideoTracking(video)
        }
      }, 1000)
    }
  }

  return false
}

function setupJWPlayerTracking(player: JWPlayer) {
  if (jwPlayerInterval !== null) {
    clearInterval(jwPlayerInterval)
  }

  sendJWPlayerData(player)

  jwPlayerInterval = setInterval(() => {
    sendJWPlayerData(player)
  }, 3000)

  videoFound = true

  return true
}

function sendJWPlayerData(player: JWPlayer) {
  try {
    const duration = player.getDuration()
    const currentTime = player.getPosition()
    const paused = player.getState() !== 'playing'

    iframe.send({
      currTime: currentTime,
      duration,
      paused,
      assets: {
        large_image: paused ? 'pause' : 'play',
      },
      state: {
        currentTime,
        duration,
        paused,
      },
      playback: {
        currTime: currentTime,
        duration,
        paused,
      },
    })
  }
  catch {
    // Ignore errors
  }
}

function setupVideoTracking(video: HTMLVideoElement) {
  video.removeEventListener('timeupdate', onTimeUpdate)
  video.addEventListener('timeupdate', onTimeUpdate)
  sendVideoData(video)
  videoFound = true
  return true
}

function onTimeUpdate(event: Event) {
  const video = event.target as HTMLVideoElement
  sendVideoData(video)
}

function sendVideoData(video: HTMLVideoElement) {
  if (video && !Number.isNaN(video.duration) && video.duration > 0) {
    const now = Date.now()
    if (now - lastUpdateTime < 3000) {
      return
    }

    iframe.send({
      currTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
      assets: {
        large_image: video.paused ? 'pause' : 'play',
      },
      state: {
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
      },
      playback: {
        currTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
      },
    })

    lastUpdateTime = now
  }
}

let lastCheckTime = 0
iframe.on('UpdateData', () => {
  const now = Date.now()
  if (now - lastCheckTime > 5000) {
    if (!findAndTrackVideo() && !videoFound) {
      iframe.send({
        currTime: 0,
        duration: 0,
        paused: true,
        assets: {
          large_image: 'pause',
        },
      })
    }
    lastCheckTime = now
  }
})

const periodicCheck = setInterval(() => {
  if (!videoFound) {
    if (!findAndTrackVideo()) {
      iframe.send({
        currTime: 0,
        duration: 0,
        paused: true,
        assets: {
          large_image: 'pause',
        },
        domain: window.location.hostname,
      })
    }
    else {
      clearInterval(periodicCheck)
    }
  }
  else {
    clearInterval(periodicCheck)
  }
}, 3000)

if (window.location.hostname.includes('animedekho.co')
  || window.location.hostname.includes('abysscdn.com')
  || window.location.hostname.includes('short.icu')) {
  findAndTrackVideo()

  setTimeout(() => {
    if (!videoFound) {
      findAndTrackVideo()
    }
  }, 2000)

  setTimeout(() => {
    if (!videoFound) {
      findAndTrackVideo()
    }
  }, 5000)

  setTimeout(() => {
    if (!videoFound && !findAndTrackVideo()) {
      iframe.send({
        currTime: 0,
        duration: 0,
        paused: true,
        assets: {
          large_image: 'pause',
        },
        state: {
          currentTime: 0,
          duration: 0,
          paused: true,
        },
        playback: {
          currTime: 0,
          duration: 0,
          paused: true,
        },
        domain: window.location.hostname,
      })
    }
  }, 8000)
}
else {
  if (!findAndTrackVideo()) {
    iframe.send({
      currTime: 0,
      duration: 0,
      paused: true,
      assets: {
        large_image: 'pause',
      },
      state: {
        currentTime: 0,
        duration: 0,
        paused: true,
      },
      playback: {
        currTime: 0,
        duration: 0,
        paused: true,
      },
    })
  }
}
