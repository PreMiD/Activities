import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  // Discord app "Shahid"
  clientId: '1568043054709866577',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/sXfV5v7.png',
}

/** Page title without the "MBC Shahid |" part */
function getPageTitle(): string {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
  const raw = (og || document.title || '').trim()
  return raw
    .replace(/^(?:MBC\s*)?Shahid\s*[|\-–]\s*/i, '')
    .replace(/\s*[|\-–]\s*(?:MBC\s*)?Shahid$/i, '')
    .replace(/^شاهد\s*[|\-–]\s*/, '')
    .trim()
}

/** "Al-Hashashin-season-1-episode-3" -> "Al Hashashin Season 1 Episode 3" */
function slugToText(slug: string): string {
  let text = slug
  try {
    text = decodeURIComponent(slug)
  }
  catch {}
  return text
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ')
}

/** Pulls show name / season / episode out of an episode slug or title */
function parseEpisode(text: string) {
  const season = text.match(/season\s*(\d+)/i)?.[1] || text.match(/الموسم\s*(\d+)/)?.[1] || ''
  const episode = text.match(/episode\s*(\d+)/i)?.[1] || text.match(/الحلقة\s*(\d+)/)?.[1] || ''
  const show = text
    .split(/\s*(?:season\s*\d+|episode\s*\d+|الموسم\s*\d+|الحلقة\s*\d+)/i)[0]
    ?.replace(/[\s|\-–:]+$/, '')
    .trim() || text
  return { show, season, episode }
}

/** The show/movie poster Shahid puts in the page (og:image), or null */
function getPoster(): string | null {
  const img = document.querySelector<HTMLMetaElement>('meta[property="og:image"], meta[name="og:image"], meta[name="twitter:image"]')?.content
  if (!img || /mbc-shahid|favicon|logo/i.test(img))
    return null
  return img.startsWith('//') ? `https:${img}` : img
}

function getHeading(): string {
  return document.querySelector('h1')?.textContent?.trim() || ''
}

/** Finds the main playing video on the page (if any) */
function getVideo(): HTMLVideoElement | null {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'))
  return videos.find(v => v.readyState > 0 && (v.duration > 0 || v.duration === Infinity)) || null
}

presence.on('UpdateData', async () => {
  const [privacy, showTimestamps, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('buttons'),
  ])

  const { pathname, href, search } = document.location
  // strip the language prefix (/en, /ar, ...)
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/i, '') || '/'
  const parts = path.split('/').filter(Boolean)

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'MBC Shahid',
    details: 'Browsing',
    startTimestamp: browsingTimestamp,
  }

  const video = getVideo()
  // only the real player counts — the homepage/series pages autoplay trailers
  const inPlayer = path.startsWith('/player') || path.startsWith('/livestream/')

  // ───────────── WATCHING ─────────────
  if (inPlayer && video) {
    const isLive = video.duration === Infinity || /live/i.test(path)
    const isEpisode = /episode/i.test(path)
    const isMovie = /movie/i.test(path)

    // best guess at a title: page title -> slug in URL
    const slug = parts.find(p => /season|episode/i.test(p))
      || parts.filter(p => !/^(?:player|play|episodes?|movies?|clips?|livestream|id-\d+|\d+)$/i.test(p))[0]
      || ''
    const title = getPageTitle() || slugToText(slug)
    const poster = getPoster()
    if (poster && !privacy)
      presenceData.largeImageKey = poster

    if (isLive) {
      presenceData.details = privacy ? 'Watching live TV' : (title || 'Live TV')
      presenceData.state = 'Live'
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live'
    }
    else if (isEpisode || /season|episode|الحلقة/i.test(title)) {
      const ep = parseEpisode(title || slugToText(slug))
      // Shahid titles look like "Show, E6" — clean that up and grab season/episode from the URL slug
      const shortEp = ep.show.match(/,?\s*E(\d+)\s*$/i)
      if (shortEp) {
        ep.show = ep.show.replace(/,?\s*E\d+\s*$/i, '').trim()
        ep.episode ||= shortEp[1] ?? ''
      }
      const fromSlug = parseEpisode(slugToText(slug))
      ep.season ||= fromSlug.season
      ep.episode ||= fromSlug.episode
      if (privacy) {
        presenceData.details = 'Watching a series'
      }
      else {
        presenceData.details = ep.show
        presenceData.state = [
          ep.season ? `Season ${ep.season}` : '',
          ep.episode ? `Episode ${ep.episode}` : '',
        ].filter(Boolean).join(' • ') || 'Watching'
      }
    }
    else {
      if (privacy) {
        presenceData.details = isMovie ? 'Watching a movie' : 'Watching something'
      }
      else {
        presenceData.details = title || 'Watching'
        presenceData.state = isMovie ? 'Movie' : 'Watching'
      }
    }

    if (!isLive) {
      if (!video.paused && !video.ended) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Playing'
        if (showTimestamps && Number.isFinite(video.duration)) {
          const [start, end] = getTimestampsFromMedia(video)
          presenceData.startTimestamp = start
          presenceData.endTimestamp = end
        }
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }

    if (showButtons && !privacy) {
      presenceData.buttons = [{ label: isLive ? 'Watch Live' : 'Watch on Shahid', url: href }]
    }
  }

  // ───────────── BROWSING ─────────────
  else if (parts[0] === 'series' && parts[1]) {
    // /series/{Title-Slug}/series-{id}
    const name = getHeading() || getPageTitle() || slugToText(parts[1])
    presenceData.details = 'Viewing a series'
    if (!privacy)
      presenceData.largeImageKey = getPoster() ?? ActivityAssets.Logo
    presenceData.state = privacy ? undefined : name
    presenceData.smallImageKey = Assets.Viewing
    if (showButtons && !privacy)
      presenceData.buttons = [{ label: 'View Series', url: href }]
  }
  else if (/^movies?$/.test(parts[0] || '') && parts[1]) {
    // /movie/{Title-Slug}/movie-{id}
    const name = getHeading() || getPageTitle() || slugToText(parts[1])
    presenceData.details = 'Viewing a movie'
    if (!privacy)
      presenceData.largeImageKey = getPoster() ?? ActivityAssets.Logo
    presenceData.state = privacy ? undefined : name
    presenceData.smallImageKey = Assets.Viewing
    if (showButtons && !privacy)
      presenceData.buttons = [{ label: 'View Movie', url: href }]
  }
  else if (parts[0] === 'series') {
    presenceData.state = 'TV Shows'
  }
  else if (/^movies?$/.test(parts[0] || '')) {
    presenceData.state = 'Movies'
  }
  else if (parts[0] === 'livestream' || parts[0] === 'allchannels') {
    presenceData.state = 'Live channels'
    presenceData.smallImageKey = Assets.Live
  }
  else if (parts[0] === 'meta' && parts[1] === 'genres' && parts[2]) {
    presenceData.state = `Genre: ${slugToText(parts[2])}`
  }
  else if (parts[0] === 'search') {
    const params = new URLSearchParams(search)
    const query = params.get('term') || params.get('q') || params.get('query')
      || document.querySelector<HTMLInputElement>('input[type="search"], input[type="text"]')?.value
      || ''
    presenceData.details = 'Searching'
    presenceData.state = privacy || !query ? undefined : query
    presenceData.smallImageKey = Assets.Search
  }
  else if (/my-?list|favorites|watchlist/i.test(path)) {
    presenceData.state = 'My List'
  }
  else if (parts[0] === 'listen') {
    presenceData.type = ActivityType.Listening
    presenceData.state = 'Listen'
  }
  else if (parts[0] === 'hub' || /account|profile|settings/i.test(path)) {
    presenceData.state = 'Account'
  }
  else {
    presenceData.state = 'Home'
  }

  if (!showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
