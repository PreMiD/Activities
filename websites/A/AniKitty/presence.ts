import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1520723875003105361',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://anikitty.moe/icon-512x512.png',
}

/** Discord truncates these hard — keep cards clean. */
const DETAILS_MAX = 128
const STATE_MAX = 128

interface WatchInfo {
  anime: string
  episodeNumber: number | null
  episodeTitle: string | null
  seasonNumber: number | null
  poster: string | null
}

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max)
    return t
  return `${t.slice(0, max - 1).trimEnd()}…`
}

function parseWatchTitle(raw: string): { anime: string, episodeNumber: number | null } {
  const cleaned = raw.replace(/\s*\|\s*AniKitty\s*$/i, '').trim()
  if (!cleaned || /^anikitty$/i.test(cleaned))
    return { anime: 'Anime', episodeNumber: null }

  const separators = [' — ', ' – ', ' - '] as const
  for (const sep of separators) {
    const index = cleaned.lastIndexOf(sep)
    if (index === -1)
      continue
    const anime = cleaned.slice(0, index).trim()
    const episode = cleaned.slice(index + sep.length).trim()
    const num = episode.match(/Episode\s+(\d+)/i)?.[1]
    if (anime && num)
      return { anime, episodeNumber: Number(num) }
  }

  return { anime: cleaned, episodeNumber: null }
}

function readWatchInfo(search: string): WatchInfo {
  const hook = document.querySelector('#anikitty-presence')
  const fromHook = {
    anime: hook?.getAttribute('data-anikitty-title')?.trim() || '',
    episodeNumber: Number(hook?.getAttribute('data-anikitty-episode') || '') || null,
    episodeTitle: hook?.getAttribute('data-anikitty-episode-title')?.trim() || null,
    seasonNumber: Number(hook?.getAttribute('data-anikitty-season') || '') || null,
    poster: hook?.getAttribute('data-anikitty-poster')?.trim() || null,
  }

  const media = navigator.mediaSession?.metadata
  const fromMedia = {
    anime: media?.artist?.trim() || '',
    episodeTitle: media?.title?.trim() || null,
  }

  const fromTitle = parseWatchTitle(document.title)
  const episodeFromUrl = new URLSearchParams(search).get('episode')?.match(/(\d+)/)?.[1]
  const episodeNumber
    = fromHook.episodeNumber
      || fromTitle.episodeNumber
      || (episodeFromUrl ? Number(episodeFromUrl) : null)

  let episodeTitle = fromHook.episodeTitle || fromMedia.episodeTitle
  // Drop generic "Episode N" titles — use chip + state fallback instead
  if (episodeTitle && /^episode\s*\d+$/i.test(episodeTitle))
    episodeTitle = null

  return {
    anime: fromHook.anime || fromMedia.anime || fromTitle.anime || 'Anime',
    episodeNumber,
    episodeTitle,
    seasonNumber: fromHook.seasonNumber,
    poster:
      fromHook.poster
      || document.querySelector('meta[property="og:image"]')?.getAttribute('content')
      || document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
      || null,
  }
}

function episodeChip(info: WatchInfo): string | null {
  if (!info.episodeNumber)
    return null
  if (info.seasonNumber)
    return `Season ${info.seasonNumber}, Episode ${info.episodeNumber}`
  return `Episode ${info.episodeNumber}`
}

function episodeState(info: WatchInfo): string {
  if (info.episodeTitle)
    return info.episodeTitle
  if (info.episodeNumber)
    return `Episode ${info.episodeNumber}`
  return 'Watching'
}

function isPrivatePath(pathname: string): boolean {
  return (
    pathname.startsWith('/admin')
    || pathname.startsWith('/settings')
    || pathname.startsWith('/messages')
    || pathname.startsWith('/chat')
    || pathname.startsWith('/link-discord')
    || pathname.startsWith('/api/')
  )
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location

  // Never leak admin / account chrome into Discord
  if (isPrivatePath(pathname)) {
    presence.clearActivity()
    return
  }

  const [privacy, showTimestamps, showCover, showButtons, titleAsPresence, hideWhenPaused]
    = await Promise.all([
      presence.getSetting<boolean>('privacy').catch(() => false),
      presence.getSetting<boolean>('timestamps').catch(() => true),
      presence.getSetting<boolean>('cover').catch(() => true),
      presence.getSetting<boolean>('buttons').catch(() => true),
      presence.getSetting<boolean>('titleAsPresence').catch(() => false),
      presence.getSetting<boolean>('hideWhenPaused').catch(() => false),
    ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  } as PresenceData

  if (pathname.startsWith('/anime/watch')) {
    presenceData.type = ActivityType.Watching

    if (privacy) {
      presenceData.details = 'Watching anime'
      presence.setActivity(presenceData)
      return
    }

    const info = readWatchInfo(search)
    const chip = episodeChip(info)
    const video = document.querySelector('video')
    const hasVideo = Boolean(
      video && video.readyState > 0 && Number.isFinite(video.duration) && video.duration > 0,
    )
    const paused = hasVideo ? video!.paused || video!.ended : false

    if (paused && hideWhenPaused) {
      presence.clearActivity()
      return
    }

    if (titleAsPresence)
      presenceData.name = clip(info.anime, DETAILS_MAX)
    else
      presenceData.details = clip(info.anime, DETAILS_MAX)

    presenceData.state = clip(episodeState(info), STATE_MAX)

    if (showCover && info.poster)
      presenceData.largeImageKey = info.poster
    if (chip)
      presenceData.largeImageText = chip

    if (hasVideo) {
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? 'Paused' : 'Playing'

      if (paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
      else if (showTimestamps) {
        [presenceData.startTimestamp, presenceData.endTimestamp]
          = getTimestampsFromMedia(video!)
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else {
      // Still show the card while the stream loads
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Loading'
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Watch',
          url: href.split('#')[0]!,
        },
      ]
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
        = document.querySelector('#anikitty-presence')?.getAttribute('data-anikitty-title')?.trim()
          || document.querySelector('h1')?.textContent?.trim()
          || document.title.replace(/\s*\|\s*AniKitty\s*$/i, '').trim()
          || 'Anime'
      presenceData.details = 'Viewing anime'
      presenceData.state = clip(title, STATE_MAX)
      const cover
        = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null
      if (showCover && cover) {
        presenceData.largeImageKey = cover
        presenceData.smallImageKey = ActivityAssets.Logo
        presenceData.smallImageText = 'AniKitty'
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
        presenceData.state = clip(q, STATE_MAX)
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
        presenceData.state = clip(decodeURIComponent(user), STATE_MAX)
    }
  }
  else if (pathname === '/' || pathname.startsWith('/home')) {
    presenceData.details = 'Browsing homepage'
  }
  else if (pathname.startsWith('/history')) {
    presenceData.details = 'Viewing watch history'
  }
  else if (pathname.startsWith('/new') || pathname.startsWith('/community')) {
    presenceData.details = 'Browsing AniKitty'
  }
  else {
    // Unknown routes — don't invent status (avoids leaking odd pages)
    presence.clearActivity()
    return
  }

  presence.setActivity(presenceData)
})
