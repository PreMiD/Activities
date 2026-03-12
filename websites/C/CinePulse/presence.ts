import { getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1411027222445297736',
})

const assets = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/C/CinePulse/assets/logo.png',
  play: 'https://cdn.rcd.gg/PreMiD/websites/C/CinePulse/assets/0.png',
  pause: 'https://cdn.rcd.gg/PreMiD/websites/C/CinePulse/assets/1.png',
}

function _formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return '0:00'
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function findPosterImage(): string {
  const possibleSelectors = [
    'img[src*="tmdb.org"]',
    'img[data-src*="tmdb.org"]',
    'img[style*="tmdb.org"]',
    '.poster img',
    '.movie-poster img',
    '.serie-poster img',
    '.backdrop img',
    '[class*="poster"] img',
    '[class*="cover"] img',
  ]

  for (const selector of possibleSelectors) {
    const elements = document.querySelectorAll(selector)
    for (const element of elements) {
      const img = element as HTMLImageElement
      let imageUrl = img.src || img.getAttribute('data-src') || ''

      if (!imageUrl && img.style.backgroundImage) {
        const styleMatch = img.style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/)
        imageUrl = styleMatch?.[1] || ''
      }
      if (imageUrl && imageUrl.includes('tmdb.org') && imageUrl.includes('/t/p/')) {
        const optimizedUrl = imageUrl
          .replace(/w1920_and_h800_multi_faces|w500|w780|w1280|original/g, 'w500')
          .replace(/h632|h948/g, 'h750')
        return optimizedUrl
      }
    }
  }

  return assets.logo
}

function parseMediaTitle(ariaLabel: string): {
  title: string
  episodeInfo: string
  episodeTitle: string
  isEpisode: boolean
} {
  if (!ariaLabel) {
    return {
      title: 'Contenu en cours',
      episodeInfo: '',
      episodeTitle: '',
      isEpisode: false,
    }
  }

  const cleanedLabel = ariaLabel
    .replace(/^(?:Video Player|Player|Lecteur)(?:\s*[-–—]\s*)?/i, '')
    .replace(/^\s*[-–—]+\s*/, '')
    .replace(/\s*[-–—]+\s*$/, '')
    .trim()

  const titleMatch = cleanedLabel.match(/"([^"]+)"|'([^']+)'|«([^»]+)»/)
  const episodeTitle = titleMatch?.[1] || titleMatch?.[2] || titleMatch?.[3] || ''

  const episodePatterns = [
    /S(\d+)[\s:]*E(\d+)/i,
    /Saison\s*(\d+)[\s:]*Episode\s*(\d+)/i,
    /Season\s*(\d+)[\s:]*Episode\s*(\d+)/i,
    /(\d+)x(\d+)/,
    /EP?\.?\s*(\d+)/i,
  ]

  let episodeInfo = ''
  let isEpisode = false

  for (const pattern of episodePatterns) {
    const match = cleanedLabel.match(pattern)
    if (match) {
      isEpisode = true
      if (match.length === 3 && match[1] && match[2]) {
        const season = match[1].padStart(2, '0')
        const episode = match[2].padStart(2, '0')
        episodeInfo = `S${season}E${episode}`
      }
      else if (match[1]) {
        episodeInfo = `Ép. ${match[1]}`
      }
      break
    }
  }

  let mainTitle = cleanedLabel

  if (episodeTitle && titleMatch) {
    mainTitle = mainTitle.replace(titleMatch[0], '').trim()
  }

  if (episodeInfo) {
    for (const pattern of episodePatterns) {
      mainTitle = mainTitle.replace(pattern, '').trim()
    }
  }

  mainTitle = mainTitle
    .replace(/^\s*[-–—]+\s*/, '')
    .replace(/\s*[-–—]+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!mainTitle) {
    mainTitle = isEpisode ? 'Série inconnue' : 'Film inconnu'
  }

  return {
    title: mainTitle,
    episodeInfo,
    episodeTitle,
    isEpisode,
  }
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  const player = document.getElementById('vds-media-player-root')

  const [showTimestamp, showPoster, showEpisodeInfo] = await Promise.all([
    presence.getSetting('showTimestamp'),
    presence.getSetting('showPoster'),
    presence.getSetting('showEpisodeInfo'),
  ])

  const presenceData: any = {
    type: 3,
    largeImageKey: assets.logo,
    largeImageText: 'CinePulse.cc',
    startTimestamp: browsingTimestamp,
  }

  if (player && video) {
    const ariaLabel = player.getAttribute('aria-label') ?? ''
    const mediaInfo = parseMediaTitle(ariaLabel)

    if (showPoster) {
      const posterUrl = findPosterImage()
      presenceData.largeImageKey = posterUrl
      presenceData.largeImageText = mediaInfo.title
    }

    presenceData.details = mediaInfo.title

    if (mediaInfo.isEpisode && showEpisodeInfo) {
      let stateText = ''
      if (mediaInfo.episodeInfo && mediaInfo.episodeTitle) {
        stateText = `${mediaInfo.episodeInfo} - ${mediaInfo.episodeTitle}`
      }
      else if (mediaInfo.episodeInfo) {
        stateText = mediaInfo.episodeInfo
      }
      else if (mediaInfo.episodeTitle) {
        stateText = mediaInfo.episodeTitle
      }
      else {
        stateText = video.paused ? 'En pause' : 'En cours de lecture'
      }
      presenceData.state = stateText
    }
    else if (mediaInfo.isEpisode && !showEpisodeInfo) {
      presenceData.state = video.paused ? 'Série en pause' : 'Regarder une série'
    }
    else {
      if (mediaInfo.episodeTitle) {
        presenceData.state = mediaInfo.episodeTitle
      }
      else {
        presenceData.state = video.paused ? 'Film en pause' : 'Regarder un film'
      }
    }

    if (video && !Number.isNaN(video.duration) && Number.isFinite(video.duration)) {
      if (!video.paused && showTimestamp) {
        const [startTs, endTs] = getTimestampsFromMedia(video)
        presenceData.startTimestamp = startTs
        presenceData.endTimestamp = endTs
        presenceData.smallImageKey = assets.play
        presenceData.smallImageText = 'En lecture'
      }
      else if (!video.paused && !showTimestamp) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
        presenceData.smallImageKey = assets.play
        presenceData.smallImageText = 'En lecture'
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
        presenceData.smallImageKey = assets.pause
        presenceData.smallImageText = 'En pause'
      }
    }
  }
  else {
    presenceData.details = 'Navigation sur CinePulse.cc'
    presenceData.state = 'Parcours du catalogue'
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  presence.setActivity(presenceData)
})
