import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1548298408375091381',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    playing: 'general.playing',
    paused: 'general.paused',
    browsing: 'general.browsing',
    viewHome: 'general.viewHome',
    search: 'general.search',
    searchFor: 'general.searchFor',
    viewAnime: 'general.viewAnime',
    viewAccount: 'general.viewAccount',
    watchingMovie: 'general.watchingMovie',
    buttonWatchAnime: 'general.buttonWatchAnime',
    buttonViewEpisode: 'general.buttonViewEpisode',
    buttonViewAnime: 'general.buttonViewAnime',
    buttonViewProfile: 'general.buttonViewProfile',
    viewProfile: 'general.viewProfile',
  })
}

const HOME_URL = 'https://anikage.cc/'
const VISIT_ANIKAGE = 'Visit Anikage'

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

interface EmbedVideoData {
  currTime?: number
  duration?: number
  paused?: boolean
  url?: string
}
let embedVideo: EmbedVideoData | null = null

function watchUrlKey(): string {
  return document.location.pathname + document.location.search
}

presence.on('iFrameData', (data: unknown) => {
  const payload = (data as { iframe_video?: EmbedVideoData & { iFrameVideo?: boolean } })?.iframe_video
  if (payload) {
    embedVideo = {
      currTime: payload.currTime,
      duration: payload.duration,
      paused: payload.paused,
      url: watchUrlKey(),
    }
  }
})

function cleanText(text: string | null | undefined, max = 128): string | undefined {
  if (!text)
    return undefined
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned || cleaned === 'undefined' || cleaned === '[object Object]')
    return undefined
  return [...cleaned].slice(0, max).join('')
}

function parseWatchTitle(): { title?: string, episode?: number } {
  const raw = document.title.replace(/ - Watch on Anikage$/, '').trim()
  const epMatch = raw.match(/ - Episode (\d+)$/)
  if (epMatch?.[1])
    return { title: cleanText(raw.slice(0, epMatch.index)), episode: Number.parseInt(epMatch[1], 10) }
  return { title: cleanText(raw) }
}

function getEpisodeNumber(titleEpisode?: number): number {
  const param = new URLSearchParams(document.location.search).get('ep')
  const fromParam = param ? Number.parseInt(param, 10) : Number.NaN
  if (Number.isFinite(fromParam) && fromParam > 0)
    return fromParam
  if (titleEpisode && titleEpisode > 0)
    return titleEpisode
  return 1
}

function isActiveToggle(el: Element): boolean {
  return el.getAttribute('aria-pressed') === 'true'
    || el.getAttribute('data-active') === 'true'
    || el.classList.contains('active')
    || el.className.toString().includes('bg-action')
}

function getActiveToggleLabel(options: string[]): string | undefined {
  const buttons = [...document.querySelectorAll('button')]
  for (const label of options) {
    const el = buttons.find(b => b.textContent?.trim() === label)
    if (el && isActiveToggle(el))
      return label
  }
  return undefined
}

presence.on('UpdateData', updateActivity)

let searchInputHooked: HTMLInputElement | null = null
let searchDebounce: number | undefined

function hookSearchInput(input: HTMLInputElement | null) {
  if (searchInputHooked?.isConnected)
    return
  searchInputHooked = null
  if (!input)
    return
  searchInputHooked = input
  // Push presence as typing happens instead of waiting for the next poll.
  // Trailing debounce keeps rapid keystrokes to one serialized update.
  input.addEventListener('input', () => {
    window.clearTimeout(searchDebounce)
    searchDebounce = window.setTimeout(() => {
      void updateActivity()
    }, 250)
  })
}

async function updateActivity() {
  const [newLang, privacy, showTimestamp, showCover, showAudioMode, showSearchQuery, showButtons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showAudioMode'),
    presence.getSetting<boolean>('showSearchQuery'),
    presence.getSetting<boolean>('showButtons'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  // Store art: metadata logo/thumbnail go live on the CDN at merge time.
  // Until then the activity's own imgur logo keeps art working everywhere.
  const logoUrl = 'https://i.imgur.com/8byHs8E.jpeg'
  const presenceData = {
    largeImageKey: logoUrl,
    startTimestamp: browsingTimestamp,
  } as PresenceData

  if (privacy) {
    presenceData.details = strings.browsing
    presenceData.smallImageKey = Assets.Reading
    presence.setActivity(presenceData)
    return
  }

  const { pathname } = document.location

  // --- Watch page ---
  if (pathname.startsWith('/anime/watch/')) {
    const id = pathname.split('/')[3] ?? ''
    const { title, episode: titleEpisode } = parseWatchTitle()
    const episode = getEpisodeNumber(titleEpisode)
    const cover = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
    const audioMode = showAudioMode ? getActiveToggleLabel(['SUB', 'DUB']) : undefined

    const video = document.querySelector<HTMLVideoElement>('video')
    const playButton = document.querySelector('media-play-button')
    const playLabel = playButton?.getAttribute('aria-label') ?? ''
    // Embed servers render a cross-origin player: fall back to iframe data.
    // The cache is keyed by watch URL so SPA episode/server switches never
    // reuse the previous page's time.
    if (embedVideo && embedVideo.url !== watchUrlKey())
      embedVideo = null
    const currTime = video && Number.isFinite(video.currentTime) ? video.currentTime : embedVideo?.currTime
    const duration = video && Number.isFinite(video.duration) && video.duration > 0 ? video.duration : embedVideo?.duration
    const paused = video
      ? video.paused
      : embedVideo?.paused ?? (playLabel ? !/^pause/i.test(playLabel) && /play/i.test(playLabel) : true)

    presenceData.type = ActivityType.Watching
    presenceData.details = title ?? 'Anikage'
    presenceData.largeImageText = title ?? 'Anikage'
    presenceData.state = `Episode ${episode}${audioMode ? ` • ${audioMode}` : ''}`
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? strings.paused : strings.playing
    if (showCover && cover)
      presenceData.largeImageKey = cover

    if (duration !== undefined && currTime !== undefined && Number.isFinite(duration) && duration > 0 && Number.isFinite(currTime)) {
      const [start, end] = getTimestamps(Math.floor(currTime), Math.floor(duration));
      [presenceData.startTimestamp, presenceData.endTimestamp] = [start, end]
      if (paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    const watchUrl = `https://anikage.cc/anime/watch/${id}?ep=${episode}`
    presenceData.buttons = [
      { label: strings.buttonWatchAnime, url: watchUrl },
      { label: VISIT_ANIKAGE, url: HOME_URL },
    ]
  }
  // --- Info page ---
  else if (pathname.startsWith('/anime/info/')) {
    const id = pathname.split('/')[3] ?? ''
    const title = cleanText(document.querySelector('h1')?.textContent)
      ?? cleanText(document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content?.replace(/ - Watch on Anikage$/, ''))
      ?? parseWatchTitle().title
    const cover = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
    presenceData.details = strings.viewAnime
    presenceData.state = title
    presenceData.smallImageKey = Assets.Reading
    if (showCover && cover) {
      presenceData.largeImageKey = cover
      presenceData.largeImageText = title
    }
    presenceData.buttons = [
      { label: strings.buttonViewAnime, url: `https://anikage.cc/anime/info/${id}` },
      { label: VISIT_ANIKAGE, url: HOME_URL },
    ]
  }
  // --- Browse (+ search) ---
  else if (pathname.startsWith('/browse')) {
    const input = document.querySelector<HTMLInputElement>('input#default-search')
    hookSearchInput(input)
    const query = (input?.value ?? '').trim()
    if (query && showSearchQuery) {
      presenceData.details = strings.searchFor
      presenceData.state = cleanText(query, 100)
    }
    else if (query) {
      presenceData.details = strings.search
    }
    else {
      presenceData.details = strings.browsing
      presenceData.state = 'Browsing anime'
    }
    presenceData.smallImageKey = Assets.Search
    presenceData.buttons = [{ label: VISIT_ANIKAGE, url: HOME_URL }]
    delete presenceData.startTimestamp
    presenceData.startTimestamp = browsingTimestamp
  }
  // --- Schedule ---
  else if (pathname.startsWith('/schedule')) {
    presenceData.details = 'Viewing anime schedule'
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [{ label: VISIT_ANIKAGE, url: HOME_URL }]
  }
  // --- Music ---
  else if (pathname.startsWith('/music')) {
    presenceData.details = 'Exploring anime music'
    presenceData.smallImageKey = Assets.Search
    presenceData.buttons = [{ label: VISIT_ANIKAGE, url: HOME_URL }]
  }
  // --- Torrents / DMCA ---
  else if (pathname.startsWith('/torrents')) {
    presenceData.details = 'Browsing torrents'
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [{ label: VISIT_ANIKAGE, url: HOME_URL }]
  }
  else if (pathname.startsWith('/dmca')) {
    presenceData.details = strings.browsing
    presenceData.state = 'Reading DMCA'
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [{ label: VISIT_ANIKAGE, url: HOME_URL }]
  }
  // --- Account shells (login-walled SPA, no title) ---
  else if (['/profile', '/settings', '/notifications'].some(p => pathname.startsWith(p))) {
    presenceData.details = strings.viewAccount
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [{ label: VISIT_ANIKAGE, url: HOME_URL }]
  }
  // --- Public user profiles (/u/:username, client-rendered) ---
  else if (pathname.startsWith('/u/')) {
    const username = cleanText(pathname.split('/')[2], 32)
    if (!username || !/^[\w.-]+$/.test(username)) {
      presenceData.details = strings.browsing
      presenceData.smallImageKey = Assets.Reading
      presenceData.buttons = [{ label: VISIT_ANIKAGE, url: HOME_URL }]
    }
    else {
      presenceData.details = strings.viewProfile
      presenceData.state = username
      presenceData.smallImageKey = Assets.Reading
      presenceData.buttons = [
        { label: strings.buttonViewProfile, url: `https://anikage.cc/u/${username}` },
        { label: VISIT_ANIKAGE, url: HOME_URL },
      ]
    }
  }
  // --- Home ---
  else if (pathname === '/') {
    presenceData.details = strings.viewHome
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [{ label: VISIT_ANIKAGE, url: HOME_URL }]
  }
  // --- Fallback ---
  else {
    presenceData.details = strings.browsing
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [{ label: VISIT_ANIKAGE, url: HOME_URL }]
  }

  if (!showCover)
    presenceData.largeImageKey = logoUrl
  if (!showButtons)
    delete presenceData.buttons
  if (!showTimestamp) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (presenceData.details)
    presenceData.name = 'Anikage'
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
}
