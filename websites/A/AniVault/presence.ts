const presence = new Presence({
  clientId: '1489078772291342418',
})

enum ActivityAssets {
  Logo = 'https://anivault.xyz/icon-512.png',
  Play = 'https://cdn.rcd.gg/PreMiD/resources/play.png',
  Pause = 'https://cdn.rcd.gg/PreMiD/resources/pause.png',
  Search = 'https://cdn.rcd.gg/PreMiD/resources/search.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'AniVault',
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = window.location

  const [privacy, showCover, showBrowsing, hideWhenPaused] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showBrowsing'),
    presence.getSetting<boolean>('hideWhenPaused'),
  ])

  // ── Watch Page ──
  if (pathname === '/watch') {
    const video = document.querySelector<HTMLVideoElement>('video')
    const premidData = document.querySelector<HTMLElement>('#premid-data')

    // Always read paused state from video element to avoid stale values
    const paused = video?.paused ?? true
    const currentTime = video?.currentTime ?? 0
    const duration = (video && !Number.isNaN(video.duration)) ? video.duration : 0

    const animeTitle = premidData?.dataset.animeTitle || 'Unknown Anime'
    const episodeNumber = premidData?.dataset.episodeNumber || '1'
    const episodeTitle = premidData?.dataset.episodeTitle || ''
    const animePoster = premidData?.dataset.animePoster || ''

    // Title line
    if (privacy)
      presenceData.details = 'Watching anime'
    else
      presenceData.details = animeTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    // Episode line
    if (!privacy) {
      presenceData.state = episodeTitle
        ? `Ep ${episodeNumber} — ${episodeTitle}`
        : `Episode ${episodeNumber}`
    }

    // Cover art
    if (showCover && !privacy && animePoster) {
      presenceData.largeImageKey = animePoster
      presenceData.largeImageText = animeTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }

    // Play/pause indicator
    presenceData.smallImageKey = paused ? ActivityAssets.Pause : ActivityAssets.Play
    presenceData.smallImageText = paused ? 'Paused' : 'Playing'

    // Timestamps — only when video has valid duration
    if (!paused && !privacy && duration > 0) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
        Math.floor(currentTime),
        Math.floor(duration),
      )
    }

    // Hide when paused
    if (paused) {
      if (hideWhenPaused)
        return presence.clearActivity()
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    // Buttons
    if (!privacy) {
      const animeSlug = premidData?.dataset.animeSlug || ''
      presenceData.buttons = [
        {
          label: 'Watch on AniVault',
          url: window.location.href,
        },
        {
          label: 'View Anime',
          url: `https://anivault.xyz/anime/${animeSlug}`,
        },
      ]
    }
  }

  // ── Browse Page ──
  else if (pathname === '/browse' && showBrowsing && !privacy) {
    presenceData.details = 'Browsing anime'
    presenceData.smallImageKey = ActivityAssets.Search
    presenceData.smallImageText = 'Browsing'
  }

  // ── Search Page ──
  else if (pathname === '/search' && showBrowsing && !privacy) {
    const query = document.querySelector<HTMLInputElement>(
      'input[type="text"], input[type="search"]',
    )?.value
    presenceData.details = 'Searching'
    presenceData.state = query || undefined
    presenceData.smallImageKey = ActivityAssets.Search
  }

  // ── Trending Page ──
  else if (pathname === '/trending' && showBrowsing && !privacy) {
    presenceData.details = 'Viewing trending anime'
  }

  // ── Schedule Page ──
  else if (pathname === '/schedule' && showBrowsing && !privacy) {
    presenceData.details = 'Checking anime schedule'
  }

  // ── Anime Detail Page ──
  else if (pathname.startsWith('/anime/') && showBrowsing && !privacy) {
    const title = document.querySelector<HTMLHeadingElement>('h1')?.textContent
    presenceData.details = 'Viewing anime'
    presenceData.state = title || undefined
  }

  // ── Home / Other Pages ──
  else if (showBrowsing || privacy) {
    presenceData.details = privacy ? 'Browsing' : 'On the home page'
    delete presenceData.state
    delete presenceData.smallImageKey
  }
  else {
    return presence.clearActivity()
  }

  presence.setActivity(presenceData)
})
