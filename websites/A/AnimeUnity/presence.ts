// presence.ts
import { ActivityType, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1253802090774532176',
})

// Use a DIRECT image URL (e.g. https://i.imgur.com/xxxx.png), not an Imgur album link. [page:1]
const LOGO_URL = 'https://i.imgur.com/cfWB8O0.png'

let pageStartTs = Math.floor(Date.now() / 1000)
let lastHref = ''

// ---- iFrame video data ----
interface VideoData { currentTime: number, duration: number, paused: boolean }
let lastVideoData: VideoData | null = null

presence.on('iFrameData', (data: any) => {
  const v = data?.video
  if (
    v
    && typeof v.currentTime === 'number'
    && typeof v.duration === 'number'
    && typeof v.paused === 'boolean'
    && Number.isFinite(v.duration)
    && v.duration > 0
  ) {
    lastVideoData = { currentTime: v.currentTime, duration: v.duration, paused: v.paused }
  }
  else {
    lastVideoData = null
  }
})

// ---- AniList cache ----
const anilistCoverCache = new Map<string, string | null>()
const anilistInFlight = new Map<string, Promise<string | null>>()

function pickText(selectors: string[]): string {
  for (const selector of selectors) {
    const el = document.querySelector<HTMLElement>(selector)
    const txt = el?.textContent?.trim()
    if (txt)
      return txt
  }
  return ''
}

function getEpisodeNumber(): string {
  const active = document.querySelector<HTMLElement>('.episode.episode-item.active a')
  const raw = active?.textContent?.trim() ?? ''
  return raw.match(/\d+/)?.[0] ?? '?'
}

function normalizeTitle(title: string): string {
  return title
    .replace(/\s+/g, ' ')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\b(?:ITA|SUB|DUB)\b/gi, '')
    .trim()
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

async function fetchAniListCover(searchTitle: string): Promise<string | null> {
  if (anilistCoverCache.has(searchTitle))
    return anilistCoverCache.get(searchTitle)!
  if (anilistInFlight.has(searchTitle))
    return anilistInFlight.get(searchTitle)!

  const p = (async () => {
    try {
      const query = `
        query ($search: String) {
          Media(search: $search, type: ANIME) {
            coverImage { extraLarge large medium }
          }
        }
      `

      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query, variables: { search: searchTitle } }),
      })

      if (!res.ok) {
        anilistCoverCache.set(searchTitle, null)
        return null
      }

      const json = await res.json()
      const url: string | undefined
        = json?.data?.Media?.coverImage?.extraLarge
          || json?.data?.Media?.coverImage?.large
          || json?.data?.Media?.coverImage?.medium

      const finalUrl = url?.trim() ? url.trim() : null
      anilistCoverCache.set(searchTitle, finalUrl)
      return finalUrl
    }
    catch {
      anilistCoverCache.set(searchTitle, null)
      return null
    }
    finally {
      anilistInFlight.delete(searchTitle)
    }
  })()

  anilistInFlight.set(searchTitle, p)
  return p
}

presence.on('UpdateData', async () => {
  try {
    const { pathname, href } = document.location

    // Reset "page opened" timer when URL changes
    if (href !== lastHref) {
      lastHref = href
      pageStartTs = Math.floor(Date.now() / 1000)
    }

    // HOME
    if (pathname === '/' || pathname.startsWith('/home')) {
      presence.setActivity({
        type: ActivityType.Playing,
        details: 'AnimeUnity',
        state: 'Home',
        largeImageKey: LOGO_URL,
        startTimestamp: pageStartTs,
      })
      return
    }

    // ANY PROFILE PAGE (generic)
    if (pathname.startsWith('/user/')) {
      const nameFromDom
        = document.querySelector<HTMLElement>('#name strong')?.textContent?.trim()
          || document.querySelector<HTMLElement>('#name')?.textContent?.trim()

      const nameFromUrl = pathname.split('/')[2] // /user/<name>/... [file:350]
      const profileName = nameFromDom || nameFromUrl || 'User'

      presence.setActivity({
        type: ActivityType.Playing,
        details: 'AnimeUnity',
        state: `Viewing ${profileName} profile`,
        largeImageKey: LOGO_URL,
        smallImageKey: LOGO_URL,
        smallImageText: 'AnimeUnity',
        startTimestamp: pageStartTs,
      })
      return
    }

    // NOT /anime
    const isAnimePage = pathname.startsWith('/anime')
    if (!isAnimePage) {
      presence.setActivity({
        type: ActivityType.Playing,
        details: 'AnimeUnity',
        state: 'Browsing',
        largeImageKey: LOGO_URL,
        startTimestamp: pageStartTs,
      })
      return
    }

    // ANIME PAGE
    const rawTitle = pickText([
      '#anime h1.title',
      '#anime .general h1.title',
      '#anime h1',
      'h1.title',
      'h1',
    ])
    if (!rawTitle)
      return

    const animeTitle = rawTitle.trim()
    const normalized = normalizeTitle(animeTitle)
    const episodeNumber = getEpisodeNumber()

    const cover
      = (await fetchAniListCover(normalized))
        || (normalized !== animeTitle ? await fetchAniListCover(animeTitle) : null)

    const data: PresenceData = {
      type: ActivityType.Watching,
      details: animeTitle,
      state: `Episode ${episodeNumber}`,
      largeImageKey: cover ?? LOGO_URL,
      largeImageText: animeTitle,
      largeImageUrl: href,

      // Keep small logo always
      smallImageKey: LOGO_URL,
      smallImageText: `AnimeUnity • Ep. ${episodeNumber}`,

      // Always show a timer (fallback = page open time)
      startTimestamp: pageStartTs,
    }

    // If we have real playback data:
    if (lastVideoData) {
      if (lastVideoData.paused) {
        // Pause: do not set endTimestamp (avoid progress advancing)
        data.endTimestamp = null
        data.state = `Episode ${episodeNumber} (Paused at ${formatTime(lastVideoData.currentTime)})`
      }
      else {
        [data.startTimestamp, data.endTimestamp] = getTimestamps(
          lastVideoData.currentTime,
          lastVideoData.duration,
        )
      }
    }

    presence.setActivity(data)
  }
  catch (err) {
    console.error('AnimeUnity presence error:', err)
    presence.clearActivity()
  }
})
