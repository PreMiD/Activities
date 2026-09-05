import { ActivityType, Assets, getTimestampsFromMedia, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '854999470357217290',
})

// Localized strings: displayed in the viewer's Discord language.
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
  browsing: 'general.browsing',
  search: 'general.search',
  viewHome: 'general.viewHome',
  viewSeries: 'general.viewSeries',
  buttonWatchVideo: 'general.buttonWatchVideo',
  buttonWatchStream: 'general.buttonWatchStream',
  buttonViewSeries: 'general.buttonViewSeries',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/logo.png',
}

// Broadcaster logos (existing assets) keyed by the brand shown in a video's
// info line / live channel name.
const channelAssets: Record<string, string> = {
  'zdf': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/0.png',
  '3sat': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/1.png',
  'phoenix': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/2.png',
  'arte': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/3.png',
  'zdfinfo': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/4.png',
  'zdfneo': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/5.png',
  'kika': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/6.png',
}

interface VideoInfo {
  series?: string
  seriesUrl?: string
  title?: string
  episode?: string
  genre?: string
  year?: string
  channel?: string
}

/**
 * The player overlay (series link, episode title, info line) only lives in the
 * DOM while the controls/overlay are visible. The values never change for a
 * given video, so we capture them per-URL and keep showing them during
 * playback even after the overlay fades out. The `<meta og:*>` tags in the head
 * are always present and act as a fallback.
 */
const infoCache = new Map<string, VideoInfo>()

let browsingTimestamp = Math.floor(Date.now() / 1000)
let prevPath = document.location.pathname

function getMeta(property: string): string | undefined {
  return (
    document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)?.content
    ?? document.querySelector<HTMLMetaElement>(`meta[name="${property}"]`)?.content
    ?? undefined
  )
}

/** Normalizes a broadcaster name ("KiKA", "3sat", "ZDFinfo") to an asset key. */
function channelKey(name?: string): string | undefined {
  if (!name)
    return undefined
  const key = name.toLowerCase().replace(/[\s.]/g, '').replace('ki.ka', 'kika')
  return key in channelAssets ? key : undefined
}

/**
 * Reads the player overlay around the "more about this show" link.
 * Anchored on the stable `.zdfplayer-icon-return` player-library class rather
 * than the build-hashed Svelte class names, which change on every deploy.
 */
function readOverlay(): VideoInfo | undefined {
  const link
    = document.querySelector<HTMLAnchorElement>('a[title^="mehr zu"]')
      ?? document.querySelector('.zdfplayer-icon-return')?.closest('a')
  if (!link)
    return undefined

  const info: VideoInfo = {}
  info.series = (link.querySelector('span')?.textContent ?? link.textContent)?.trim()
  info.seriesUrl = link.href

  // The link sits in a wrapper next to the <h2> title and <p> info line.
  const container = link.closest('div')?.parentElement
  info.title = container?.querySelector('h2')?.textContent?.trim()

  const infoLine = container?.querySelector('p')?.textContent ?? ''
  // e.g. "Musik • Dokumentation • authentisch • UT • F03 • 27 min • 2026 • ZDF"
  const tokens = infoLine.split('•').map(t => t.trim()).filter(Boolean)
  for (const token of tokens) {
    if (/^\d{4}$/.test(token))
      info.year = token
    else if (/^F\d+$/i.test(token))
      info.episode = `Folge ${Number(token.slice(1))}`
    else if (channelKey(token))
      info.channel = token
  }
  // First token is the primary genre (skip subtitle/audio-description flags).
  info.genre = tokens.find(t => !/^(?:UT|AD|F\d+|\d{4}|\d+\s*min)$/i.test(t) && !channelKey(t))

  return info
}

function format(template: string, info: VideoInfo, fallbackTitle: string): string {
  return template
    .replace(/%title%/gi, info.title || fallbackTitle)
    .replace(/%series%/gi, info.series ?? '')
    .replace(/%episode%/gi, info.episode ?? '')
    .replace(/%genre%/gi, info.genre ?? '')
    .replace(/%year%/gi, info.year ?? '')
    .trim()
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location

  if (pathname !== prevPath) {
    prevPath = pathname
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }

  const [
    privacy,
    hidePaused,
    showCover,
    channelLogo,
    timestamps,
    showButtons,
    vidDetail,
    vidState,
    displayType,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('channelLogo'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<string>('vidDetail'),
    presence.getSetting<string>('vidState'),
    presence.getSetting<number>('displayType'),
  ])

  const localized = await strings
  const video = document.querySelector<HTMLVideoElement>(
    '.zdfplayer-video-container video',
  )
  // The selector only matches the main player, so a mounted player is a
  // reliable "watching" signal even on live URLs that aren't under /play.
  const isWatchPage
    = /^\/(?:play|video)\//.test(pathname)
      || (!!video && !Number.isNaN(video.duration))

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  switch (displayType) {
    case 0:
      presenceData.statusDisplayType = StatusDisplayType.Name
      break
    case 1:
      presenceData.statusDisplayType = StatusDisplayType.Details
      break
    default:
      presenceData.statusDisplayType = StatusDisplayType.State
  }

  if (isWatchPage) {
    // Keep the per-URL info cache warm whenever the overlay is in the DOM.
    const overlay = readOverlay()
    if (overlay && (overlay.title || overlay.series))
      infoCache.set(href, overlay)
    const info = infoCache.get(href) ?? overlay ?? {}

    const ogTitle = getMeta('og:title')
    const cover = getMeta('og:image')
    const fallbackTitle = info.title ?? ogTitle ?? document.title

    const hasMedia = !!video && !Number.isNaN(video.duration)
    // Only treat as live once metadata has loaded, otherwise a NaN duration
    // (still loading) would briefly flag a VOD as live.
    const live = hasMedia && !Number.isFinite(video!.duration)

    presenceData.name = info.series ?? ogTitle ?? 'ZDFmediathek'
    presenceData.details = format(vidDetail || '%title%', info, fallbackTitle) || fallbackTitle

    const stateText = vidState?.includes('{0}')
      ? ''
      : format(vidState || '%series%', info, fallbackTitle)
    if (stateText)
      presenceData.state = stateText

    presenceData.largeImageKey = showCover !== false && cover ? cover : ActivityAssets.Logo
    presenceData.largeImageText = info.series ?? ogTitle

    const channel = channelKey(info.channel)
    const paused = !!video?.paused

    if (channelLogo !== false && channel && hasMedia && !paused) {
      presenceData.smallImageKey = channelAssets[channel]
      presenceData.smallImageText = info.channel
    }
    else if (live) {
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = localized.live
    }
    else {
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? localized.pause : localized.play
    }

    if (hasMedia && !paused && !live && timestamps !== false) {
      [presenceData.startTimestamp, presenceData.endTimestamp]
        = getTimestampsFromMedia(video!)
    }
    else {
      delete presenceData.endTimestamp
    }

    if (hidePaused && hasMedia && paused)
      return presence.clearActivity()

    if (showButtons !== false) {
      presenceData.buttons = [
        { label: live ? localized.buttonWatchStream : localized.buttonWatchVideo, url: href },
      ]
      if (info.seriesUrl) {
        presenceData.buttons.push({
          label: localized.buttonViewSeries,
          url: info.seriesUrl,
        })
      }
    }
  }
  else if (pathname === '/') {
    presenceData.details = localized.viewHome
  }
  else if (pathname.startsWith('/suche')) {
    presenceData.details = localized.search
    presenceData.state
      = document.querySelector<HTMLInputElement>('input[type="search"], input[type="text"]')?.value
        || new URLSearchParams(search).get('q')
        || undefined
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/live-tv') {
    presenceData.details = localized.browsing
    presenceData.state = 'Live & TV'
    presenceData.smallImageKey = Assets.Reading
  }
  else {
    const segments = pathname.split('/').filter(Boolean)
    const heading = document.querySelector('h1')?.textContent?.trim()
    // A show/series detail page ends in a "-<number>" content slug.
    if (segments.length > 1 && /-\d+$/.test(segments.at(-1)!)) {
      presenceData.details = localized.viewSeries
      presenceData.state = heading ?? getMeta('og:title')
    }
    else {
      // Category landing pages (/dokus, /serien, /filme, /kinder …).
      presenceData.details = localized.browsing
      presenceData.state = heading ?? document.title
    }
    presenceData.smallImageKey = Assets.Reading
  }

  // Privacy mode: only reveal that the user is on ZDFmediathek.
  if (privacy) {
    presenceData.name = 'ZDFmediathek'
    presenceData.details = localized.browsing
    delete presenceData.state
    delete presenceData.smallImageKey
    delete presenceData.smallImageText
    delete presenceData.largeImageText
    delete presenceData.buttons
    delete presenceData.endTimestamp
    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.startTimestamp = browsingTimestamp
  }

  if (timestamps === false) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
