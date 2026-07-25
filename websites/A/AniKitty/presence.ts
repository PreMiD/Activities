import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1520723875003105361',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://anikitty.moe/anikitty-logo.png',
}

function parseWatchTitle(raw: string): { anime: string, episode: string | null } {
  const cleaned = raw.replace(/\s*\|\s*AniKitty\s*$/i, '').trim()
  const match = cleaned.match(/^(.*?)\s*[—–-]\s*(Episode\s+\d+)\s*$/i)
  if (match?.[1] && match[2]) {
    return { anime: match[1].trim(), episode: match[2].trim() }
  }
  return { anime: cleaned || 'Anime', episode: null }
}

function getCover(): string | null {
  return (
    document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    || document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
    || null
  )
}

presence.on('UpdateData', async () => {
  const [privacy, showTimestamps, showCover, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
  ])

  const { pathname, href, search } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  } as PresenceData

  if (pathname.startsWith('/anime/watch')) {
    if (privacy) {
      presenceData.details = 'Watching anime'
      ;(presenceData as PresenceData).type = ActivityType.Watching
    }
    else {
      const { anime, episode } = parseWatchTitle(document.title)
      const params = new URLSearchParams(search)
      const episodeParam = params.get('episode')
      const episodeFromUrl = episodeParam?.match(/(\d+)/)?.[1]
      const episodeLabel
        = episode
          || (episodeFromUrl ? `Episode ${episodeFromUrl}` : null)

      presenceData.details = anime
      presenceData.state = episodeLabel || 'Watching'
      ;(presenceData as PresenceData).type = ActivityType.Watching
      presenceData.name = anime

      const cover = getCover()
      if (showCover && cover) {
        presenceData.largeImageKey = cover
        presenceData.smallImageKey = ActivityAssets.Logo
        presenceData.smallImageText = 'AniKitty'
      }

      const video = document.querySelector('video')
      if (video && video.readyState > 0) {
        if (video.paused) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        else {
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Playing'
          if (showTimestamps) {
            [presenceData.startTimestamp, presenceData.endTimestamp]
              = getTimestampsFromMedia(video)
          }
        }
      }

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Watch on AniKitty',
            url: href,
          },
        ]
      }
    }
  }
  else if (pathname.startsWith('/anime/') && pathname !== '/anime' && !pathname.startsWith('/anime/watch')) {
    if (privacy) {
      presenceData.details = 'Browsing anime'
    }
    else {
      const title
        = document.querySelector('h1')?.textContent?.trim()
          || document.title.replace(/\s*\|\s*AniKitty\s*$/i, '').trim()
          || 'Anime'
      presenceData.details = 'Viewing anime'
      presenceData.state = title
      const cover = getCover()
      if (showCover && cover) {
        presenceData.largeImageKey = cover
        presenceData.smallImageKey = ActivityAssets.Logo
      }
      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'View Anime',
            url: href,
          },
        ]
      }
    }
  }
  else if (pathname.startsWith('/search')) {
    presenceData.details = privacy ? 'Searching' : 'Searching for anime'
    presenceData.smallImageKey = Assets.Search
    if (!privacy) {
      const q = new URLSearchParams(search).get('q') || new URLSearchParams(search).get('query')
      if (q)
        presenceData.state = q
    }
  }
  else if (pathname.startsWith('/schedule')) {
    presenceData.details = 'Browsing schedule'
  }
  else if (pathname.startsWith('/trending')) {
    presenceData.details = 'Browsing trending'
  }
  else if (pathname.startsWith('/forum')) {
    presenceData.details = 'Browsing forum'
  }
  else if (pathname.startsWith('/watch-together')) {
    presenceData.details = 'Watch together'
  }
  else if (pathname.startsWith('/profile/')) {
    presenceData.details = privacy ? 'Viewing a profile' : 'Viewing profile'
    if (!privacy) {
      const user = pathname.split('/')[2]
      if (user)
        presenceData.state = decodeURIComponent(user)
    }
  }
  else if (pathname === '/' || pathname.startsWith('/home')) {
    presenceData.details = 'Browsing homepage'
  }
  else if (pathname.startsWith('/history')) {
    presenceData.details = 'Viewing watch history'
  }
  else if (pathname.startsWith('/settings') || pathname.startsWith('/messages') || pathname.startsWith('/chat')) {
    presence.clearActivity()
    return
  }
  else {
    presenceData.details = 'Browsing AniKitty'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
