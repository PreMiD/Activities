import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({ clientId: '1469323355910967426' })

enum ActivityAssets {
  Logo = 'https://anime-town.vercel.app/icons/icon-512.png',
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPathname = ''
let wasWatchingVideo = false

function getVideo(): HTMLVideoElement | null {
  const v = document.querySelector<HTMLVideoElement>('video')
  return v && v.readyState > 0 ? v : null
}

function getAnimeTitle(): string {
  const fromSpan = document.querySelector<HTMLElement>('span.mr-2.w-full.tracking-wide')?.textContent?.trim() ?? document.querySelector<HTMLElement>('span.opacity-90.tracking-wide')?.textContent?.trim()

  if (fromSpan)
    return fromSpan

  return document.title.replace(/ Episode \d.*/i, '').replace(/ -\s*AnimeTown/i, '').trim() || 'Unknown Anime'
}

function getAnimeCover(): string | undefined {
  return document.querySelector<HTMLImageElement>('img[src*="s4.anilist.co"][src*="/cover/"]')?.src ?? undefined
}

function getEpisodeNumber(): number | null {
  // Primary: ?ep= query param (e.g. /watch/21319?ep=5)
  const epParam = new URLSearchParams(document.location.search).get('ep')
  if (epParam && /^\d+$/.test(epParam))
    return Number.parseInt(epParam, 10)
  // Fallback: path segment (e.g. /watch/anime-slug-episode-5)
  const match = document.location.pathname.match(/episode-(\d+)/i)
  if (match?.[1])
    return Number.parseInt(match[1], 10)
  return null
}

function getAniListId(): string | null {
  const { pathname } = document.location
  // Match plain numeric ID: /watch/21319 or /anime/21319
  const plainId = pathname.match(/^\/(?:watch|anime)\/(\d+)(?:\/|$)/)
  if (plainId?.[1])
    return plainId[1]
  // Match slug with ID: /watch/attack-on-titan-21319
  const slugId = pathname.match(/-(\d{4,6})-episode-\d+$/) ?? pathname.match(/-(\d{4,6})(?:\/|$)/)
  return slugId?.[1] ?? null
}

function getAniListUrl(): string | null {
  const id = getAniListId()
  return document.querySelector<HTMLAnchorElement>('a[href*="anilist.co/anime/"]')?.href ?? (id ? `https://anilist.co/anime/${id}` : null)
}

function getSubDubMode(): string | null {
  // Try active lang button (sub/dub toggle)
  const activeBtn = document.querySelector<HTMLElement>('button[class*="active"] span, button[class*="bg-primary"] span:last-child')
  const text = activeBtn?.textContent?.trim()
  if (text && (text.toLowerCase().includes('sub') || text.toLowerCase().includes('dub')))
    return text
  return null
}

function getGenres(): string {
  return [...document.querySelectorAll<HTMLElement>('a[href*="catalog?genres"]')]
    .map(a => a.textContent?.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(', ')
}

presence.on(
  'UpdateData',
  async () => {
    const [showButtons, showTimestamp] = await Promise.all(
      [
        presence.getSetting<boolean>('showButtons').catch(() => true),
        presence.getSetting<boolean>('showTimestamp').catch(() => true),
      ],
    )

    const strings = await presence.getStrings({
      play: 'general.playing',
      pause: 'general.paused',
      browse: 'general.browsing',
      viewPage: 'general.viewPage',
    })

    const { pathname, href } = document.location

    if (pathname !== lastPathname) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      lastPathname = pathname
    }

    const presenceData: PresenceData = {
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'AnimeTown',
      type: ActivityType.Watching,
    }

    if (pathname.startsWith('/watch/')) {
      const animeTitle = getAnimeTitle()
      const episodeNum = getEpisodeNumber()
      const subDub = getSubDubMode()
      const animeCover = getAnimeCover()
      const anilistUrl = getAniListUrl()
      const video = getVideo()

      presenceData.largeImageKey = animeCover ?? ActivityAssets.Logo
      presenceData.largeImageText = episodeNum !== null
        ? `Episode ${episodeNum}`
        : subDub
          ? `${animeTitle} \u00B7 ${subDub}`
          : animeTitle

      presenceData.details = animeTitle
      presenceData.state = `${episodeNum !== null ? `Episode ${episodeNum}` : 'Unknown Episode'}${subDub ? ` \u00B7 ${subDub}` : ''}`

      if (video) {
        const paused = video.paused
        presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = paused ? strings.pause : strings.play

        // Use a finite, valid duration to render the Discord seek bar (progress line).
        // Number.isFinite filters out Infinity which HLS live streams may return.
        const hasValidDuration = Number.isFinite(video.duration) && video.duration > 0

        if (showTimestamp && hasValidDuration) {
          // Both timestamps → Discord shows "current ──●── total" seek bar.
          // Works for both playing (bar moves) and paused (bar frozen at position).
          ;[presenceData.startTimestamp, presenceData.endTimestamp]
            = getTimestamps(video.currentTime, video.duration)
        }
        else if (showTimestamp) {
          // No valid duration (still loading / live) — fall back to elapsed counter.
          presenceData.startTimestamp = browsingTimestamp
          delete presenceData.endTimestamp
        }
        else {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }

        wasWatchingVideo = true
      }
      else {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = strings.play

        if (showTimestamp) {
          presenceData.startTimestamp = browsingTimestamp
        }
        else {
          delete presenceData.startTimestamp
        }
        delete presenceData.endTimestamp
        wasWatchingVideo = false
      }

      const currentUrl = href.replace(/^http:\/\/localhost:\d+/, 'https://anime-town.vercel.app')

      if (showButtons) {
        presenceData.buttons = anilistUrl
          ? [
              { label: 'Watch Episode', url: currentUrl },
              { label: 'View on AniList', url: anilistUrl },
            ]
          : [{ label: 'Watch Episode', url: currentUrl }]
      }
      else {
        delete presenceData.buttons
      }
    }
    else if (pathname.startsWith('/anime/')) {
      if (wasWatchingVideo) {
        browsingTimestamp = Math.floor(Date.now() / 1000)
        wasWatchingVideo = false
      }

      const title = document.querySelector<HTMLElement>('h1, span.mr-2.w-full.tracking-wide')?.textContent?.trim()
        ?? pathname.replace('/anime/', '').replace(/-\d+$/, '').replace(/-/g, ' ')

      const animeCover = getAnimeCover()
      const anilistUrl = getAniListUrl()
      const genres = getGenres()

      presenceData.largeImageKey = animeCover ?? ActivityAssets.Logo
      presenceData.largeImageText = genres || 'AnimeTown'
      presenceData.details = strings.viewPage ?? 'Viewing anime'
      presenceData.state = title
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.browse

      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
      else {
        delete presenceData.startTimestamp
      }
      delete presenceData.endTimestamp

      const currentUrl = href.replace(/^http:\/\/localhost:\d+/, 'https://anime-town.vercel.app')

      if (showButtons) {
        presenceData.buttons = anilistUrl
          ? [
              { label: 'View Anime', url: currentUrl },
              { label: 'View on AniList', url: anilistUrl },
            ]
          : [{ label: 'View Anime', url: currentUrl }]
      }
      else {
        delete presenceData.buttons
      }
    }
    else if (pathname.startsWith('/catalog')) {
      if (wasWatchingVideo) {
        browsingTimestamp = Math.floor(Date.now() / 1000)
        wasWatchingVideo = false
      }

      const params = new URLSearchParams(document.location.search)
      const query = params.get('search')
      const genre = params.get('genres')

      presenceData.details = query ? 'Searching' : genre ? 'Browsing genre' : strings.browse
      presenceData.state = query ? `"${query}"` : (genre ?? 'All anime')
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.browse

      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
      else {
        delete presenceData.startTimestamp
      }
      delete presenceData.endTimestamp
      delete presenceData.buttons
    }
    else {
      if (wasWatchingVideo) {
        browsingTimestamp = Math.floor(Date.now() / 1000)
        wasWatchingVideo = false
      }

      const pageMap: Record<string, [string, string]> = {
        '/community': [strings.browse, 'Community'],
        '/schedule': [strings.browse, 'Schedule'],
        '/settings': [strings.browse, 'Settings'],
        '/home': [strings.browse, 'Home'],
        '/': [strings.browse, 'AnimeTown'],
      }

      const [details, state] = pageMap[pathname]
        ?? [strings.browse, document.title.replace(/ - AnimeTown/i, '').trim() || 'AnimeTown']

      presenceData.details = details
      presenceData.state = state
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.browse

      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
      else {
        delete presenceData.startTimestamp
      }
      delete presenceData.endTimestamp
      delete presenceData.buttons
    }

    presence.setActivity(presenceData)
  },
)
