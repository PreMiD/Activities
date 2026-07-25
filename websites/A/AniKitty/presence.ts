import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1520723875003105361',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://anikitty.moe/icon-512x512.png',
}

function parseWatchTitle(raw: string): { anime: string, episode: string | null } {
  const cleaned = raw.replace(/\s*\|\s*AniKitty\s*$/i, '').trim()
  if (!cleaned || /^anikitty$/i.test(cleaned))
    return { anime: 'Anime', episode: null }

  const separators = [' — ', ' – ', ' - '] as const
  for (const sep of separators) {
    const index = cleaned.lastIndexOf(sep)
    if (index === -1)
      continue
    const anime = cleaned.slice(0, index).trim()
    const episode = cleaned.slice(index + sep.length).trim()
    if (anime && /^Episode\s+\d+$/i.test(episode))
      return { anime, episode }
  }

  return { anime: cleaned, episode: null }
}

function getCover(): string | null {
  return (
    document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    || document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
    || null
  )
}

function applyVideoState(
  presenceData: PresenceData,
  video: HTMLVideoElement,
  showTimestamps: boolean,
): void {
  const duration = video.duration
  const currentTime = video.currentTime
  const hasDuration = Number.isFinite(duration) && duration > 0

  if (video.paused || video.ended) {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
    return
  }

  presenceData.smallImageKey = Assets.Play
  presenceData.smallImageText = 'Playing'

  if (showTimestamps && hasDuration && Number.isFinite(currentTime)) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
  }
}

presence.on('UpdateData', async () => {
  const privacy = await presence.getSetting<boolean>('privacy').catch(() => false)
  const showTimestamps = await presence.getSetting<boolean>('timestamps').catch(() => true)
  const showCover = await presence.getSetting<boolean>('cover').catch(() => true)
  const showButtons = await presence.getSetting<boolean>('buttons').catch(() => true)

  const { pathname, href, search } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Browsing AniKitty',
  } as PresenceData

  if (pathname.startsWith('/anime/watch')) {
    ;(presenceData as PresenceData).type = ActivityType.Watching

    if (privacy) {
      presenceData.details = 'Watching anime'
    }
    else {
      const { anime, episode } = parseWatchTitle(document.title)
      const episodeFromUrl = new URLSearchParams(search).get('episode')?.match(/(\d+)/)?.[1]
      const episodeLabel = episode || (episodeFromUrl ? `Episode ${episodeFromUrl}` : null)

      presenceData.details = anime
      presenceData.state = episodeLabel || 'Watching'

      const cover = getCover()
      if (showCover && cover) {
        presenceData.largeImageKey = cover
        presenceData.smallImageKey = ActivityAssets.Logo
        presenceData.smallImageText = 'AniKitty'
      }

      const video = document.querySelector('video')
      if (video && video.readyState > 0)
        applyVideoState(presenceData, video, showTimestamps)

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Watch on AniKitty',
            url: href.split('#')[0]!,
          },
        ]
      }
    }
  }
  else if (
    pathname.startsWith('/anime/')
    && pathname !== '/anime'
    && !pathname.startsWith('/anime/watch')
  ) {
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
            url: href.split('#')[0]!,
          },
        ]
      }
    }
  }
  else if (pathname.startsWith('/search')) {
    presenceData.details = privacy ? 'Searching' : 'Searching for anime'
    presenceData.smallImageKey = Assets.Search
    if (!privacy) {
      const q
        = new URLSearchParams(search).get('q')
          || new URLSearchParams(search).get('query')
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
  else if (
    pathname.startsWith('/settings')
    || pathname.startsWith('/messages')
    || pathname.startsWith('/chat')
  ) {
    presence.clearActivity()
    return
  }

  presence.setActivity(presenceData)
})
