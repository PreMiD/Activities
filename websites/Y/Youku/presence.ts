import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1487705643983835156',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Y/Youku/assets/0.png',
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatchingVideo = false

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    search: 'general.search',
    watching: 'general.watching',
    episode: 'general.episode',
    watchVideo: 'general.buttonWatchVideo',
    watchSeries: 'general.buttonWatchSeries',
    viewPage: 'general.buttonViewPage',
    watchingContent: 'youku.watchingContent',
    browsingYouku: 'youku.browsingYouku',
    homePage: 'youku.homePage',
    searchingContent: 'youku.searchingContent',
    lookingForVideos: 'youku.lookingForVideos',
    browsingCategory: 'youku.browsingCategory',
    exploringShows: 'youku.exploringShows',
    exploringContent: 'youku.exploringContent',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

function findVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>('video')
    ?? document.querySelector<HTMLVideoElement>('.youku-player video')
    ?? document.querySelector<HTMLVideoElement>('#player video')
    ?? document.querySelector<HTMLVideoElement>('.prism-player video')
}

// Cache the portrait show poster keyed by showId so we don't re-fetch the
// page variable on every UpdateData tick. Reset when the show changes.
let cachedShowId: string | null = null
let cachedShowPoster: string | null = null

async function getPosterImage(): Promise<string | null> {
  // Youku ships per-page bootstrap state on `window.__INITIAL_DATA__`.
  // `data.data.data.extra.showImgV` is the show's portrait poster (the same
  // artwork that appears on trending/grid cards). It's stable across episodes
  // of the same show, so we cache it per showId.
  try {
    const page = await presence.getPageVariable<{
      '__INITIAL_DATA__.showId': string
      '__INITIAL_DATA__.data.data.data.extra.showImgV': string
      '__INITIAL_DATA__.data.data.data.extra.showImg': string
    }>(
      '__INITIAL_DATA__.showId',
      '__INITIAL_DATA__.data.data.data.extra.showImgV',
      '__INITIAL_DATA__.data.data.data.extra.showImg',
    )
    const showId = page['__INITIAL_DATA__.showId']
    if (showId && showId !== cachedShowId) {
      cachedShowId = showId
      cachedShowPoster = page['__INITIAL_DATA__.data.data.data.extra.showImgV']
        || page['__INITIAL_DATA__.data.data.data.extra.showImg']
        || null
    }
    if (cachedShowPoster)
      return cachedShowPoster
  }
  catch {
    // Page variable unavailable — fall through to meta-tag fallback.
  }

  // Fallback: per-episode 16:9 still from meta tags.
  return document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
    ?? document.querySelector<HTMLMetaElement>('meta[itemprop="image"]')?.content
    ?? document.querySelector<HTMLLinkElement>('link[rel="image_src"]')?.href
    ?? null
}

function cleanTitle(raw: string | null | undefined): string {
  if (!raw)
    return ''
  // Strip common Youku suffixes (with hyphen, en-dash, or underscore separator).
  return raw.replace(/[\s\-_–]+(?:YOUKU|优酷)[\s\S]*$/i, '').trim()
}

function parseTitleAndEpisode(raw: string): { title: string, episode: number | null } {
  // Youku title formats observed:
  //   document.title (live-updates on SPA nav):
  //     "Show Name Show Name NN-YOUKU-..."   → show=Show Name, episode=NN
  //   og:title (stale on SPA nav, kept as fallback):
  //     "Show Name 第N集 Show Name NN"        → show=Show Name, episode=N
  //     "Show Name 第N集"                     → show=Show Name, episode=N
  //   Plain:
  //     "Show Name"                           → show=Show Name, episode=null

  // Chinese episode marker — most explicit when present.
  const cn = raw.match(/^([^第]*)第(\d+)集/)
  if (cn) {
    return {
      title: cn[1]!.trim(),
      episode: Number.parseInt(cn[2]!, 10),
    }
  }

  // document.title pattern: trailing digits after the (often duplicated) show name.
  const trailing = raw.match(/^(.*\S)\s+(\d{1,4})$/)
  if (trailing) {
    return {
      title: dedupeShowName(trailing[1]!.trim()),
      episode: Number.parseInt(trailing[2]!, 10),
    }
  }

  return { title: dedupeShowName(raw), episode: null }
}

// Youku's document.title repeats the show name (e.g. "The Double The Double").
// Collapse "X X" → "X" when both halves are identical.
function dedupeShowName(text: string): string {
  const mid = Math.floor(text.length / 2)
  const a = text.slice(0, mid).trim()
  const b = text.slice(mid).trim()
  if (a && a === b)
    return a
  // Also handle "X X" where halves differ only by a leading space.
  const halves = text.split(/\s+/)
  if (halves.length >= 2 && halves.length % 2 === 0) {
    const half = halves.length / 2
    const left = halves.slice(0, half).join(' ')
    const right = halves.slice(half).join(' ')
    if (left === right)
      return left
  }
  return text
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function getVideoQuality(): string | null {
  const sel = document.querySelector('.quality-selector .active, [data-quality].active, .video-quality .selected')
  const text = sel?.textContent?.trim()
  return text && /\d{3,4}p|HD|4K/i.test(text) ? text : null
}

function getPlaybackSpeed(video: HTMLVideoElement | null): string | null {
  if (!video)
    return null
  const rate = video.playbackRate
  return rate && rate !== 1 ? `${rate}x` : null
}

presence.on('UpdateData', async () => {
  const [newLang, privacy, showTimestamp, showButtons, showCover, showProgress, showVideoDetails, compactMode] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showProgress'),
    presence.getSetting<boolean>('showVideoDetails'),
    presence.getSetting<boolean>('compactMode'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const { pathname, href } = document.location
  // Only treat as a watch page on known video paths so we don't latch onto
  // homepage hero / autoplay previews. Youku.tv watch URLs look like
  // /v/v_show/id_XXX.html — /v/ is the common prefix.
  const isWatchPath = /^\/v\//i.test(pathname)
  const video = isWatchPath ? findVideo() : null

  const isPlayingVideo = !!video
    && (video.src !== '' || video.currentSrc !== '')
    && video.duration > 0
    && video.readyState >= 2
    && !video.ended

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Youku',
  }

  if (isPlayingVideo) {
    // document.title is the one source that updates on SPA episode navigation;
    // og:title and h1 frequently go stale.
    const rawTitle = document.title
      || document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
      || document.querySelector<HTMLMetaElement>('meta[name="title"]')?.content
      || document.querySelector('h1')?.textContent
      || ''
    const { title, episode } = parseTitleAndEpisode(cleanTitle(rawTitle))

    const poster = showCover ? await getPosterImage() : null
    if (poster)
      presenceData.largeImageKey = poster
    // Discord renders an "S{x}E{y}" badge when largeImageText matches the
    // pattern "<word> <season>, <word> <episode>". We don't know the season,
    // so default to 1.
    if (episode !== null)
      presenceData.largeImageText = `Season 1, Episode ${episode}`

    if (privacy) {
      presenceData.details = strings.watchingContent
    }
    else {
      presenceData.details = compactMode ? truncate(title, 35) : truncate(title, 128)
      const stateParts: string[] = []
      if (episode !== null)
        stateParts.push(`${strings.episode} ${episode}`)
      else
        stateParts.push(strings.watching)

      if (showVideoDetails && !video!.paused) {
        const q = getVideoQuality()
        if (q)
          stateParts.push(q)
        const s = getPlaybackSpeed(video)
        if (s)
          stateParts.push(s)
      }

      if (showProgress && !video!.paused && video!.duration > 0) {
        const pct = Math.floor((video!.currentTime / video!.duration) * 100)
        stateParts.push(`${pct}%`)
      }

      presenceData.state = stateParts.join(' • ')
    }

    if (!video!.paused) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.play
      if (showTimestamp) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video!)
      }
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.pause
    }

    wasWatchingVideo = true
  }
  else {
    if (wasWatchingVideo) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatchingVideo = false
    }

    const isHomePage = pathname === '/' || pathname === ''
    const isSearchPage = pathname.startsWith('/search') || pathname.startsWith('/soku')
    const isCategoryPage = pathname.startsWith('/category') || pathname.startsWith('/show')

    if (isHomePage) {
      presenceData.details = compactMode ? 'Youku' : strings.browsingYouku
      presenceData.state = strings.homePage
    }
    else if (isSearchPage) {
      presenceData.details = compactMode ? strings.search : strings.searchingContent
      presenceData.state = strings.lookingForVideos
      presenceData.smallImageKey = Assets.Search
    }
    else if (isCategoryPage) {
      presenceData.details = compactMode ? strings.browse : strings.browsingCategory
      presenceData.state = strings.exploringShows
    }
    else {
      presenceData.details = compactMode ? 'Youku' : strings.browsingYouku
      presenceData.state = strings.exploringContent
    }

    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }

  if (showButtons && !privacy) {
    const buttonLabel = isPlayingVideo
      ? strings.watchVideo
      : isWatchPath
        ? strings.watchSeries
        : strings.viewPage
    presenceData.buttons = [{ label: buttonLabel, url: href }]
  }

  presence.setActivity(presenceData)
})
