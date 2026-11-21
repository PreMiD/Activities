import type { FramePlayback } from './iframe.js'
import { ActivityType, Assets, getTimestamps } from 'premid'
import metadata from './metadata.json' with { type: 'json' }

const presence = new Presence({
  clientId: '1481368310590210119',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/V/Voxani/assets/logo.png',
}

function normalizeWatchSlug(raw: string): string {
  let value = decodeURIComponent(raw || '').trim()

  if (!value)
    return ''

  if (value.startsWith('legacy:')) {
    const params = new URLSearchParams(value.slice('legacy:'.length))
    value = params.get('default') || value
  }

  if (value.startsWith('kenjitsu:')) {
    const params = new URLSearchParams(value.slice('kenjitsu:'.length))
    value = params.get('kaido') || params.get('default') || params.get('anizone') || value
  }

  if (value.includes('?ep='))
    value = value.split('?ep=')[0] || value

  if (value.includes('$episode$'))
    value = value.split('$episode$')[0] || value

  value = value.replace(/-episode-\d+$/i, '')
  value = value.replace(/-\d+$/, '')

  return value
}

// helper: turn a url slug like "one-piece-100" into "One Piece"
function formatSlug(raw: string): string {
  return normalizeWatchSlug(raw)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// helper: try to pull a clean anime name from document.title
// Title format: "Watch {Name} Online Free — Stream in HD — Voxani"
//            or "Watch {Name} Online Free — English Sub & Dub — Voxani"
function getNameFromTitle(slugName: string): string {
  const title = document.title
  // New format: starts with "Watch " and contains " Online Free"
  if (title.startsWith('Watch ') && title.includes(' Online Free')) {
    const titleName = title.replace(/^Watch\s+/i, '').split(/\s+Online Free/i)[0]?.trim() || ''
    if (!titleName)
      return ''
    const a = titleName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const b = slugName.toLowerCase().replace(/[^a-z0-9]/g, '')
    return (a && b && a.includes(b.slice(0, 8))) ? titleName : ''
  }
  // Legacy format fallback: "Name - Watch Online"
  if (title.includes(' - Watch Online')) {
    const titleName = title.split(' - Watch Online')[0]?.trim() || ''
    const a = titleName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const b = slugName.toLowerCase().replace(/[^a-z0-9]/g, '')
    return (a && b && a.includes(b.slice(0, 8))) ? titleName : ''
  }
  return ''
}

function cleanTabText(raw: string): string {
  if (!raw)
    return ''
  let text = raw.trim()

  // 1. Remove trailing numbers / count badges like "51", "(51)", "[51]"
  text = text.replace(/[\s\d()[\]]+$/g, '').trim()

  // 2. Remove duplicated words caused by sr-only text / icon labels (e.g. "WatchingWatching" -> "Watching")
  const half = Math.floor(text.length / 2)
  if (half >= 3 && text.slice(0, half).toLowerCase() === text.slice(half).toLowerCase()) {
    text = text.slice(0, half)
  }

  // 3. Normalize known tab names
  const lower = text.toLowerCase()
  if (lower.includes('watching'))
    return 'Watching'
  if (lower.includes('completed'))
    return 'Completed'
  if (lower.includes('plan'))
    return 'Plan to Watch'
  if (lower.includes('hold'))
    return 'On Hold'
  if (lower.includes('dropped'))
    return 'Dropped'
  if (lower.includes('for you'))
    return 'For You'
  if (lower.includes('ai rec') || lower.includes('recommendation'))
    return 'AI Recs'
  if (lower === 'all')
    return 'All'

  return text
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath = ''

const embedPattern = new RegExp(metadata.iFrameRegExp)
const maxPlaybackAge = 15_000
const lastFrameSamples = new WeakMap<HTMLIFrameElement, { url: string, documentStartedAt: number, sampledAt: number }>()
let newestFrameDocument = 0
let embed: {
  element: HTMLIFrameElement
  url: URL
  episode: string
  direct?: FramePlayback
  fallback?: FramePlayback & { reportsPlaying: boolean }
  anchor?: { sample: FramePlayback, start: number, end: number }
} | undefined

function getActiveEmbed(): HTMLIFrameElement | undefined {
  const frames = document.querySelectorAll<HTMLIFrameElement>('.video-player-container iframe[src]')
  const knownFrames = [...frames].filter(frame => embedPattern.test(frame.src))
  return knownFrames.length === 1 ? knownFrames[0] : undefined
}

function isActiveEmbed(): boolean {
  return Boolean(embed?.element.isConnected && embed.element.src === embed.url.href
    && embed.episode === document.location.pathname + document.location.search)
}

function isTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isFresh(sample: FramePlayback | undefined, now: number): sample is FramePlayback {
  return Boolean(sample && sample.sampledAt <= now && now - sample.sampledAt <= maxPlaybackAge)
}

presence.on('iFrameData', (data: unknown) => {
  if (!embed || !isActiveEmbed() || !data || typeof data !== 'object')
    return

  const sample = data as FramePlayback
  if (typeof sample.url !== 'string' || !embedPattern.test(sample.url))
    return

  const url = new URL(sample.url)
  if (url.origin !== embed.url.origin || url.pathname !== embed.url.pathname
    || (url.searchParams.get('lang') ?? 'sub') !== (embed.url.searchParams.get('lang') ?? 'sub')) {
    return
  }

  if (!isTime(sample.sampledAt) || !isFresh(sample, Date.now())
    || !isTime(sample.documentStartedAt) || sample.documentStartedAt === 0
    || Math.floor(sample.documentStartedAt) > sample.sampledAt
    || !isTime(sample.currentTime) || (sample.duration !== null
      && (!isTime(sample.duration) || sample.duration === 0 || sample.currentTime > sample.duration + 1))
    || typeof sample.paused !== 'boolean' || typeof sample.ended !== 'boolean' || typeof sample.buffering !== 'boolean'
    || !Number.isInteger(sample.readyState) || sample.readyState < 0 || sample.readyState > 4
    || typeof sample.mediaId !== 'string' || !isTime(sample.seeks) || !isTime(sample.rate)) {
    return
  }

  // Query-only navigation can reset presence while the same iframe keeps playing.
  const previous = lastFrameSamples.get(embed.element)
  if (sample.documentStartedAt < newestFrameDocument || (sample.documentStartedAt === newestFrameDocument
    && (previous?.documentStartedAt !== sample.documentStartedAt || previous.url !== embed.url.href
      || sample.sampledAt <= previous.sampledAt))) {
    return
  }
  newestFrameDocument = sample.documentStartedAt
  lastFrameSamples.set(embed.element, { url: embed.url.href, documentStartedAt: sample.documentStartedAt, sampledAt: sample.sampledAt })
  embed.direct = sample
})

window.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (!embed || !isActiveEmbed() || event.origin !== embed.url.origin || event.source !== embed.element.contentWindow)
    return

  // Voxani's two providers emit playback events to the containing page.
  const now = Date.now()
  let value = event.data
  const isAniEmbed = embed.url.hostname === 'aniembed.se'
  if (!isAniEmbed && typeof value === 'string' && value.length <= 2048) {
    try {
      value = JSON.parse(value)
    }
    catch {
      return
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return

  const message = value as Record<string, unknown>
  let timing = message
  let kind = message.event
  let sampledAt = now
  let mediaId = 'provider'
  let rate = 1
  if (isAniEmbed) {
    if (message.source !== 'aniembed' || message.version !== 1 || message.type !== 'event'
      || !message.data || typeof message.data !== 'object') {
      return
    }

    timing = message.data as Record<string, unknown>
    kind = message.name
    const [, , anime, episode] = embed.url.pathname.split('/')
    if ((timing.animeId !== anime && timing.animeId !== Number(anime)) || timing.episode !== Number(episode)
      || !isTime(timing.sentAt) || timing.sentAt > now || now - timing.sentAt > maxPlaybackAge
      || (timing.language !== 'sub' && timing.language !== 'dub') || typeof timing.paused !== 'boolean'
      || (timing.providerId != null && (typeof timing.providerId !== 'string' || !/^[a-z0-9_-]{1,48}$/.test(timing.providerId)))) {
      return
    }
    sampledAt = timing.sentAt
    mediaId = `provider:${timing.language}:${timing.providerId ?? ''}`
    if (isTime(timing.playbackRate) && timing.playbackRate > 0 && timing.playbackRate <= 16)
      rate = timing.playbackRate
  }
  else if (kind === 'time' || message.type === 'watching-log') {
    kind = 'progress'
  }

  const previous = embed.fallback
  if (previous && sampledAt <= previous.sampledAt)
    return
  const ended = kind === 'error' || (isAniEmbed ? kind === 'ended' : kind === 'complete')
  const loading = isAniEmbed && kind === 'providerchange'
  const currentTime = isAniEmbed || message.type === 'watching-log' ? timing.currentTime : timing.time
  const duration = timing.duration
  if (!ended && !loading
    && ((isAniEmbed ? !['ready', 'play', 'pause', 'progress', 'seeked'].includes(String(kind)) : kind !== 'progress')
      || !isTime(currentTime) || !isTime(duration) || duration === 0 || currentTime > duration + 1)) {
    return
  }
  if (previous?.ended && previous.mediaId === mediaId && kind === 'progress')
    return

  embed.fallback = {
    url: embed.url.href,
    documentStartedAt: 0,
    sampledAt,
    currentTime: isTime(currentTime) ? currentTime : 0,
    duration: isTime(duration) && duration > 0 ? duration : null,
    paused: ended || (isAniEmbed && timing.paused === true),
    ended,
    readyState: loading ? 0 : 3,
    buffering: false,
    mediaId,
    seeks: (previous?.seeks ?? 0) + Number(kind === 'seeked' && (!previous || !isTime(currentTime)
      || Math.abs(currentTime - previous.currentTime) >= 0.75)),
    rate,
    reportsPlaying: isAniEmbed && (kind === 'play' || kind === 'progress') && timing.paused === false,
  }
})

function updateEmbedPlayback(element: HTMLIFrameElement, presenceData: PresenceData) {
  const episode = document.location.pathname + document.location.search
  if (embed?.element !== element || embed.url.href !== element.src || embed.episode !== episode) {
    embed = undefined
    const url = new URL(element.src)
    const [, , id, third, fourth] = url.pathname.split('/')
    const embedEpisode = url.hostname === 'aniembed.se' ? third : id === 's-2' ? undefined : fourth
    const requested = new URLSearchParams(document.location.search).get('ep')
    if (embedEpisode && requested && /^\d+(?:\.\d+)?$/.test(requested) && Number(embedEpisode) !== Number(requested))
      return

    embed = { element, url, episode }
  }

  const now = Date.now()
  const direct = embed.direct
  const fallback = isFresh(embed.fallback, now) && (!(direct?.paused || direct?.ended) || embed.fallback.sampledAt > direct.sampledAt)
    ? embed.fallback
    : undefined
  const sample = isFresh(direct, now) && direct.readyState > 0
    ? (direct.paused || direct.ended) && fallback?.reportsPlaying ? fallback : direct
    : fallback
  if (!sample || sample.ended || sample.readyState === 0) {
    embed.anchor = undefined
    return
  }
  if (sample.paused) {
    embed.anchor = undefined
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'
    return
  }
  if (sample.buffering) {
    embed.anchor = undefined
    return
  }
  if (sample.rate <= 0)
    return

  presenceData.smallImageKey = Assets.Play
  presenceData.smallImageText = 'Playing'
  const previous = embed.anchor?.sample
  if (!previous || previous.documentStartedAt !== sample.documentStartedAt || previous.mediaId !== sample.mediaId
    || previous.seeks !== sample.seeks || previous.rate !== sample.rate
    || (previous.duration === null) !== (sample.duration === null)
    || Math.abs((previous.duration ?? 0) - (sample.duration ?? 0)) > 1
    || Math.abs(sample.currentTime - previous.currentTime - (sample.sampledAt - previous.sampledAt) / 1000 * sample.rate) >= 3) {
    const position = sample.currentTime / sample.rate + (now - sample.sampledAt) / 1000
    const [start, end] = getTimestamps(position, (sample.duration ?? 0) / sample.rate)
    if (!Number.isFinite(start) || start <= 0)
      return
    embed.anchor = { sample, start, end }
  }

  if (embed.anchor) {
    presenceData.startTimestamp = embed.anchor.start
    if (sample.duration !== null && Number.isFinite(embed.anchor.end) && embed.anchor.end > embed.anchor.start)
      presenceData.endTimestamp = embed.anchor.end
  }
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const showButtons = await presence.getSetting<boolean>('showPresenceButtons')

  // reset timer on SPA navigation
  if (pathname !== lastPath) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    embed = undefined
    lastPath = pathname
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    smallImageKey: Assets.Reading,
    smallImageText: 'Voxani',
  }

  // watch page
  if (pathname.startsWith('/watch/')) {
    // Target only the main player video, not the hidden thumbnail video (which has preload="none")
    const video = document.querySelector<HTMLVideoElement>('video:not([preload="none"])')
    delete presenceData.smallImageKey
    delete presenceData.smallImageText

    const slugName = formatSlug(pathname.split('/')[2] || '')
    const animeName = getNameFromTitle(slugName)
      // Fallback: anime title button in the WatchPage header (lines 1168-1175 WatchPage.tsx)
      || document.querySelector<HTMLButtonElement>('button.font-semibold.text-left.text-foreground')?.textContent?.trim()
      || slugName || 'Anime'

    // data-poster is set by React after hydration; guard against empty string from SSR initial render
    const poster = document.querySelector('[data-poster]')?.getAttribute('data-poster')
    if (poster && poster.startsWith('http'))
      presenceData.largeImageKey = poster

    presenceData.name = animeName

    // episode info
    const epText = document.querySelector('h1.font-display')?.textContent?.trim() || ''
    const epMatch = epText.match(/Episode\s+(\d+)/i)
    const epNum = epMatch ? epMatch[1] || '1' : '1'
    const epTitle = document.querySelector('.text-muted-foreground.text-sm.mt-1.line-clamp-1')?.textContent?.trim()

    // single episode = movie
    const epBtns = document.getElementById('episode-list-container')?.querySelectorAll('button')
    if (epBtns && epBtns.length === 1) {
      presenceData.details = animeName
      presenceData.state = 'Watching Movie'
    }
    else {
      presenceData.details = animeName
      if (epTitle)
        presenceData.state = epTitle
      const sMatch = animeName.match(/Season\s+(\d+)/i)
      presenceData.largeImageText = `Season ${sMatch ? sMatch[1] || '1' : '1'}, Episode ${epNum}`
    }

    // playback state
    const embedIframe = getActiveEmbed()
    if (!embedIframe)
      embed = undefined

    if (video && !embedIframe) {
      if (!video.paused && video.readyState > 0) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Playing'
        if (Number.isFinite(video.duration) && video.duration > 0) {
          // Full progress bar: start + end timestamps
          ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            Math.floor(video.currentTime),
            Math.floor(video.duration),
          )
        }
        else {
          // Duration not yet loaded — show elapsed video time counting up
          presenceData.startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(video.currentTime)
        }
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
        // Show position in episode where user paused
        if (video.currentTime > 0)
          presenceData.startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(video.currentTime)
      }
    }
    else if (embedIframe) {
      updateEmbedPlayback(embedIframe, presenceData)
    }
    else {
      // Video not yet loaded
      presenceData.startTimestamp = browsingTimestamp
    }

    if (showButtons)
      presenceData.buttons = [{ label: 'Watch Episode', url: href }]

  // anime detail
  }
  else if (pathname.startsWith('/anime/')) {
    const slugName = formatSlug(pathname.split('/')[2] || '')
    const title = getNameFromTitle(slugName)
      || document.querySelector('h1.font-display')?.textContent?.trim()
      || slugName || 'Anime'

    const poster = document.querySelector('[data-poster]')?.getAttribute('data-poster')
    if (poster)
      presenceData.largeImageKey = poster

    presenceData.details = 'Looking'
    presenceData.state = title
    presenceData.startTimestamp = browsingTimestamp

    if (showButtons)
      presenceData.buttons = [{ label: 'View Anime', url: href }]

  // search
  }
  else if (pathname.startsWith('/search') || pathname.startsWith('/image-search')) {
    presenceData.details = 'Searching Anime'
    presenceData.state = 'Exploring Catalog'
    presenceData.smallImageKey = Assets.Search
    presenceData.startTimestamp = browsingTimestamp

  // trending
  }
  else if (pathname.startsWith('/trending')) {
    // find the active timeframe tab
    const activeBtn = document.querySelector('button[class*="bg-primary"]')
    const txt = cleanTabText(activeBtn?.textContent?.trim() || '')
    presenceData.details = 'Trending Anime'
    presenceData.state = ['Today', 'This Week', 'This Month', 'All Time'].includes(txt) ? txt : 'What\'s Hot Right Now'
    presenceData.startTimestamp = browsingTimestamp

  // profile
  }
  else if (pathname === '/profile' || pathname.startsWith('/user/') || pathname.startsWith('/@')) {
    let userName = ''
    if (pathname.startsWith('/@'))
      userName = decodeURIComponent(pathname.substring(2))
    else if (pathname.startsWith('/user/'))
      userName = decodeURIComponent(pathname.split('/')[2] || '')

    if (!userName) {
      const t = document.querySelector<HTMLElement>('span[class*="text-muted"]')?.textContent?.trim() || ''
      if (t.startsWith('@') && t.length > 2)
        userName = t.substring(1)
    }

    presenceData.details = 'Viewing Profile'
    presenceData.state = userName ? `@${userName}` : 'My Profile'
    presenceData.startTimestamp = browsingTimestamp

  // my lists / favorites
  }
  else if (pathname.startsWith('/favorites') || pathname.startsWith('/my-lists')) {
    // active tab: mobile uses data-state, desktop uses bg-white class
    const activeTab = document.querySelector('[data-state="active"]')
      ?? document.querySelector('button[class*="bg-primary"][class*="text-primary-foreground"]')
      ?? document.querySelector('button[class*="bg-white"][class*="text-black"]')
    const rawTab = activeTab?.textContent?.trim() || ''
    const tab = cleanTabText(rawTab)
    const isFavorites = pathname.startsWith('/favorites')

    presenceData.details = 'Browsing Library'
    presenceData.state = tab
      ? `${isFavorites ? 'Favorites' : 'My Lists'} · ${tab}`
      : (isFavorites ? 'Favorites' : 'My Lists')
    presenceData.startTimestamp = browsingTimestamp

  // collections (uses radix Tabs with data-state + desktop sidebar buttons)
  }
  else if (pathname.startsWith('/collections')) {
    // mobile: TabsTrigger with data-state="active"
    // desktop: sidebar button with bg-primary class
    const mobileActive = document.querySelector('[role="tablist"] [data-state="active"]')
    const desktopActive = document.querySelector('button[class*="bg-primary"][class*="text-primary-foreground"]')
    const rawTab = mobileActive?.textContent?.trim() || desktopActive?.textContent?.trim() || ''
    const tab = cleanTabText(rawTab)

    presenceData.details = 'Browsing Library'
    presenceData.state = tab ? `Collections · ${tab}` : 'Collections'
    presenceData.startTimestamp = browsingTimestamp

  // playlists
  }
  else if (pathname.startsWith('/playlists') || pathname.startsWith('/playlist/') || pathname.startsWith('/p/')) {
    presenceData.details = 'Browsing Library'
    // single playlist view: h1 has the playlist name (font-black or font-bold class)
    // list view (/playlists): h1 says "My Playlists"
    if (pathname.startsWith('/playlist/') || pathname.startsWith('/p/')) {
      const name = document.querySelector('h1')?.textContent?.trim() || ''
      presenceData.state = name || 'Playlist'
    }
    else {
      presenceData.state = 'My Playlists'
    }
    presenceData.startTimestamp = browsingTimestamp

  // continue watching
  }
  else if (pathname.startsWith('/continue-watching')) {
    presenceData.details = 'Browsing Library'
    presenceData.state = 'Continue Watching'
    presenceData.startTimestamp = browsingTimestamp

  // community
  }
  else if (pathname.startsWith('/community')) {
    if (pathname.includes('/forum/new')) {
      presenceData.details = 'Community'
      presenceData.state = 'Creating Post'
    }
    else if (pathname.includes('/forum/')) {
      const t = document.querySelector<HTMLElement>('h1')?.textContent?.trim()
      presenceData.details = t ? `Reading: ${t}` : 'Reading Post'
      presenceData.state = 'Community Forum'
    }
    else {
      const activeNav = document.querySelector('[data-state="active"]')
      presenceData.details = 'Browsing Community'
      presenceData.state = activeNav?.textContent?.trim() || 'Exploring Discussions'
    }
    presenceData.startTimestamp = browsingTimestamp

  // character page
  }
  else if (pathname.startsWith('/char/')) {
    presenceData.details = document.querySelector<HTMLElement>('h1')?.textContent?.trim() || 'Character'
    presenceData.state = 'Viewing Character'
    presenceData.startTimestamp = browsingTimestamp

  // tier lists
  }
  else if (pathname.startsWith('/tierlists') || pathname.startsWith('/tierlist')) {
    presenceData.details = 'Community Rankings'
    presenceData.state = 'Viewing Tier Lists'
    presenceData.startTimestamp = browsingTimestamp

  // ai recs
  }
  else if (pathname.startsWith('/recommendations')) {
    presenceData.details = 'AI Recommendations'
    presenceData.state = 'Discovering Anime'
    presenceData.startTimestamp = browsingTimestamp

  // genre browsing
  }
  else if (pathname.startsWith('/genre/')) {
    presenceData.details = 'Exploring Genre'
    presenceData.state = formatSlug(pathname.split('/')[2] || '') || 'Genre'
    presenceData.startTimestamp = browsingTimestamp

  // scene search (trace.moe)
  }
  else if (pathname.startsWith('/trace')) {
    presenceData.details = 'Trace.moe Search'
    presenceData.state = 'Finding Scene'
    presenceData.startTimestamp = browsingTimestamp

  // stats / wrapped
  }
  else if (pathname.startsWith('/stats') || pathname.startsWith('/wrapped')) {
    presenceData.details = 'Viewing Statistics'
    presenceData.state = 'Voxani Wrapped'
    presenceData.startTimestamp = browsingTimestamp

  // language filter
  }
  else if (pathname.startsWith('/languages')) {
    presenceData.details = 'Language Filter'
    presenceData.state = pathname.split('/')[2]
      ? formatSlug(pathname.split('/')[2]!)
      : 'Browsing Languages'
    presenceData.startTimestamp = browsingTimestamp

  // settings
  }
  else if (pathname.startsWith('/settings')) {
    presenceData.details = 'Adjusting Preferences'
    presenceData.state = 'Settings'
    presenceData.startTimestamp = browsingTimestamp

  // admin panel
  }
  else if (pathname.startsWith('/admin')) {
    presenceData.details = 'Managing Site'
    presenceData.state = 'Admin Panel'
    presenceData.startTimestamp = browsingTimestamp

  // private pages — clear activity
  }
  else if (
    pathname.startsWith('/auth')
    || pathname.startsWith('/onboarding')
    || pathname.startsWith('/reset-password')
    || pathname.startsWith('/update-password')
    || pathname.startsWith('/integration')
  ) {
    return presence.clearActivity()

  // home / landing page (/ is the main app; /home redirects to /)
  }
  else if (pathname === '/' || pathname.startsWith('/home')) {
    presenceData.details = 'Looking for Anime'
    presenceData.state = 'Browsing Voxani'
    presenceData.startTimestamp = browsingTimestamp

  // anything else
  }
  else {
    presenceData.details = 'Browsing Voxani'
    presenceData.state = 'Exploring'
    presenceData.startTimestamp = browsingTimestamp
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
