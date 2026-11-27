import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({ clientId: '1573275415030530128' })

const browsingTimestamp = Math.floor(Date.now() / 1000)
const SITE_URL = 'https://mirainime.com'

enum ActivityAssets {
  Logo = 'https://i.imgur.com/toBOGDT.png',
}

const ROUTE = {
  episode: /^\/anime\/([^/]+)\/episode\/(\d+)(?:\/(download))?\/?$/,
  animeDownload: /^\/anime\/([^/]+)\/download\/?$/,
  anime: /^\/anime\/([^/]+)\/?$/,
  reel: /^\/reel\/([^/]+)\/?$/,
  genre: /^\/genre\/([^/]+)\/?$/,
  season: /^\/season\/([^/]+)\/?$/,
}

const STATIC_ROUTES: Array<{ pattern: RegExp, key: string }> = [
  { pattern: /^\/$/, key: 'home' },
  { pattern: /^\/home\/?$/, key: 'social' },
  { pattern: /^\/ongoing\/?$/, key: 'ongoing' },
  { pattern: /^\/complete\/?$/, key: 'complete' },
  { pattern: /^\/upcoming\/?$/, key: 'upcoming' },
  { pattern: /^\/(?:schedule|jadwal-tayang-anime|app\/scundle)\/?$/, key: 'schedule' },
  { pattern: /^\/(?:anime|anime-list)\/?$/, key: 'browse' },
  { pattern: /^\/search\/?$/, key: 'search' },
  { pattern: /^\/karakter(?:\/.*)?$/, key: 'characters' },
  { pattern: /^\/people(?:\/.*)?$/, key: 'people' },
  { pattern: /^\/aulaperingkat\/?$/, key: 'ranking' },
  { pattern: /^\/community(?:\/.*)?$/, key: 'community' },
  { pattern: /^\/bookmarks\/?$/, key: 'bookmarks' },
  { pattern: /^\/history(?:\/.*)?$/, key: 'history' },
  { pattern: /^\/notifications\/?$/, key: 'notifications' },
  { pattern: /^\/badge\/?$/, key: 'badge' },
  { pattern: /^\/task\/?$/, key: 'task' },
  { pattern: /^\/premium(?:\/.*)?$/, key: 'premium' },
  { pattern: /^\/my-playlist(?:\/.*)?$/, key: 'playlist' },
  { pattern: /^\/theme-songs\/?$/, key: 'themes' },
  { pattern: /^\/reel\/?$/, key: 'reels' },
]

type TranslatedStrings = Record<string, string>

/** Ambil string terjemahan dengan fallback aman (repo memakai strict TS). */
function t(strings: TranslatedStrings, key: string, fallback: string): string {
  return strings[key] ?? fallback
}

/** Bersihkan judul SEO (mis. "One Piece Sub Indo : Episode ... - Mirainime"). */
function cleanTitle(raw?: string | null): string {
  if (!raw)
    return ''

  return raw
    .replace(/^Nonton\s+/i, '')
    .replace(/\s+Sub(?:title)?\s*Indo.*$/i, '')
    .replace(/\s*[-|]\s*Mirainime.*$/i, '')
    .replace(/\s*:\s*Episode\s+\d.*$/i, '')
    .replace(/\s+Episode\s+\d.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** decodeURIComponent tanpa melempar pada escape rusak (mis. `/genre/%`). */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

/** Discord memotong details/state di ±128 karakter; rapikan sebelum dikirim. */
const MAX_TEXT_LENGTH = 128

function clipText(value: string | Node | null | undefined): string | undefined {
  // `PresenceData` juga mengizinkan Node (mis. elemen), tapi activity ini hanya
  // memakai string.
  if (typeof value !== 'string' || value === '')
    return undefined

  return value.length > MAX_TEXT_LENGTH
    ? `${value.slice(0, MAX_TEXT_LENGTH - 1).trimEnd()}…`
    : value
}

/** "one-piece-sub-indo" -> "One Piece". */
function prettifySlug(slug?: string): string {
  if (!slug)
    return ''

  return safeDecode(slug)
    .replace(/-sub-indo$|-subtitle-indonesia$/i, '')
    .split('-')
    .filter(Boolean)
    .map(word => word.length <= 3
      ? word.toUpperCase()
      : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Judul anime dari player, meta og:title, document.title, atau slug. */
function animeTitle(slug?: string): string {
  const fromPlayer = document.querySelector('#episode-watch-title')?.getAttribute('data-anime-title')
  if (fromPlayer)
    return cleanTitle(fromPlayer)

  const fromOg = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
  const cleanedOg = cleanTitle(fromOg)
  if (cleanedOg)
    return cleanedOg

  const fromDocument = cleanTitle(document.title)
  if (fromDocument)
    return fromDocument

  return prettifySlug(slug)
}

/** Judul episode dari halaman tonton (kalau ada). */
function episodeTitle(): string {
  return document.querySelector('#episode-watch-title .line-clamp-2')?.textContent?.trim() ?? ''
}

function videoElement(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>(
    '#anime-player-container video, #anime-video, video',
  )
}

/** Tambahkan ikon play/pause + timestamp sesuai status pemutaran. */
function applyPlayback(
  data: PresenceData,
  playingText: string,
  pausedText: string,
  showTimestamp: boolean,
): void {
  const video = videoElement()
  if (!video)
    return

  const isPlaying = !video.paused && !video.ended && video.currentTime > 0

  data.smallImageKey = isPlaying ? Assets.Play : Assets.Pause
  data.smallImageText = isPlaying ? playingText : pausedText

  if (isPlaying && showTimestamp && Number.isFinite(video.duration) && video.duration > 0) {
    const [start, end] = getTimestamps(video.currentTime, video.duration)
    data.startTimestamp = start
    data.endTimestamp = end
  }
}

presence.on('UpdateData', async () => {
  const [buttonsSetting, timestampSetting, episodeTitleSetting] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showEpisodeTitle'),
  ])

  const showButtons = buttonsSetting !== false
  const showTimestamp = timestampSetting !== false
  const showEpisodeTitle = episodeTitleSetting !== false

  const strings: TranslatedStrings = await presence.getStrings({
    playing: 'general.playing',
    paused: 'general.paused',
    browsing: 'mirainime.browsing',
    home: 'mirainime.home',
    social: 'mirainime.social',
    ongoing: 'mirainime.ongoing',
    complete: 'mirainime.complete',
    upcoming: 'mirainime.upcoming',
    schedule: 'mirainime.schedule',
    browse: 'mirainime.browse',
    search: 'mirainime.search',
    characters: 'mirainime.characters',
    people: 'mirainime.people',
    ranking: 'mirainime.ranking',
    community: 'mirainime.community',
    bookmarks: 'mirainime.bookmarks',
    history: 'mirainime.history',
    notifications: 'mirainime.notifications',
    badge: 'mirainime.badge',
    task: 'mirainime.task',
    premium: 'mirainime.premium',
    playlist: 'mirainime.playlist',
    themes: 'mirainime.themes',
    reels: 'mirainime.reels',
    detail: 'mirainime.detail',
    episode: 'mirainime.episode',
    movie: 'mirainime.movie',
    download: 'mirainime.download',
    animePage: 'mirainime.animePage',
    explore: 'mirainime.explore',
    genreLabel: 'mirainime.genreLabel',
    seasonLabel: 'mirainime.seasonLabel',
  })

  const playingText = t(strings, 'playing', 'Playing')
  const pausedText = t(strings, 'paused', 'Paused')
  const browsingText = t(strings, 'browsing', 'Browsing Mirainime')

  const path = document.location.pathname

  const episodeMatch = path.match(ROUTE.episode)
  const animeDownloadMatch = episodeMatch
    ? null
    : path.match(ROUTE.animeDownload)
  const animeMatch = episodeMatch || animeDownloadMatch
    ? null
    : path.match(ROUTE.anime)
  const reelMatch = path.match(ROUTE.reel)
  const genreMatch = path.match(ROUTE.genre)
  const seasonMatch = path.match(ROUTE.season)

  const data: PresenceData = {
    // Watching: satu-satunya tipe media yang mengizinkan largeImageText
    // (NonMediaPresenceData melarang largeImageText).
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Mirainime',
  }

  if (episodeMatch) {
    const slug = episodeMatch[1] ?? ''
    const episodeNumber = Number(episodeMatch[2] ?? '0')
    const download = Boolean(episodeMatch[3])
    const title = animeTitle(slug)

    data.type = ActivityType.Watching
    data.details = title

    if (download) {
      data.state = t(strings, 'download', 'Download Page')
    }
    else if (episodeNumber === 0) {
      data.state = t(strings, 'movie', 'Movie')
      applyPlayback(data, playingText, pausedText, showTimestamp)
    }
    else {
      const parts = [`${t(strings, 'episode', 'Episode')} ${episodeNumber}`]
      const titleOfEpisode = episodeTitle()

      if (
        showEpisodeTitle
        && titleOfEpisode
        && !/^Episode\s+\d+$/i.test(titleOfEpisode)
        && titleOfEpisode.toLowerCase() !== title.toLowerCase()
      ) {
        parts.push(titleOfEpisode)
      }

      data.state = parts.join(' · ')
      applyPlayback(data, playingText, pausedText, showTimestamp)
    }

    if (showButtons) {
      data.buttons = [
        {
          label: t(strings, 'animePage', 'Anime Page'),
          url: `${SITE_URL}/anime/${slug}`,
        },
      ]
    }
  }
  else if (animeDownloadMatch) {
    const slug = animeDownloadMatch[1] ?? ''

    data.type = ActivityType.Watching
    data.details = animeTitle(slug)
    data.state = t(strings, 'download', 'Download Page')

    if (showButtons) {
      data.buttons = [
        {
          label: t(strings, 'animePage', 'Anime Page'),
          url: `${SITE_URL}/anime/${slug}`,
        },
      ]
    }
  }
  else if (animeMatch) {
    const slug = animeMatch[1] ?? ''

    data.type = ActivityType.Watching
    data.details = animeTitle(slug)
    data.state = t(strings, 'detail', 'Anime Details')

    if (showTimestamp)
      data.startTimestamp = browsingTimestamp

    if (showButtons) {
      data.buttons = [
        {
          label: t(strings, 'explore', 'Explore Anime'),
          url: `${SITE_URL}/anime-list`,
        },
      ]
    }
  }
  else if (reelMatch) {
    const slug = reelMatch[1] ?? ''

    data.type = ActivityType.Watching
    data.details = animeTitle(slug)
    data.state = t(strings, 'reels', 'Reels')

    if (showButtons) {
      data.buttons = [
        {
          label: t(strings, 'animePage', 'Anime Page'),
          url: `${SITE_URL}/anime/${slug}`,
        },
      ]
    }
  }
  else if (genreMatch) {
    data.details = `${t(strings, 'genreLabel', 'Genre')}: ${prettifySlug(genreMatch[1])}`
    data.state = browsingText

    if (showTimestamp)
      data.startTimestamp = browsingTimestamp

    if (showButtons) {
      data.buttons = [
        {
          label: t(strings, 'genreLabel', 'Genre'),
          url: `${SITE_URL}${path}`,
        },
      ]
    }
  }
  else if (seasonMatch) {
    data.details = `${t(strings, 'seasonLabel', 'Season')}: ${prettifySlug(seasonMatch[1])}`
    data.state = browsingText

    if (showTimestamp)
      data.startTimestamp = browsingTimestamp

    if (showButtons) {
      data.buttons = [
        {
          label: t(strings, 'seasonLabel', 'Season'),
          url: `${SITE_URL}${path}`,
        },
      ]
    }
  }
  else {
    const staticRoute = STATIC_ROUTES.find(route => route.pattern.test(path))

    data.details = staticRoute
      ? t(strings, staticRoute.key, browsingText)
      : browsingText

    const pageTitle = cleanTitle(document.title)
    if (pageTitle && pageTitle.toLowerCase() !== String(data.details).toLowerCase())
      data.state = pageTitle

    if (showTimestamp)
      data.startTimestamp = browsingTimestamp

    // Tombol ke halaman home tidak diizinkan reviewer PreMiD. Untuk halaman
    // statis lain, tombol mengarah ke halaman yang sedang dibuka (spesifik).
    if (
      showButtons
      && staticRoute
      && staticRoute.key !== 'home'
      && staticRoute.key !== 'social'
    ) {
      data.buttons = [
        {
          label: t(strings, staticRoute.key, 'Open Page'),
          url: document.location.href,
        },
      ]
    }
  }

  // Batasi panjang teks supaya tidak melewati batas Discord (128 karakter).
  // Hanya details & state yang isinya dinamis (judul anime/episode dari situs);
  // largeImageText/smallImageText selalu konstanta pendek.
  data.details = clipText(data.details)
  data.state = clipText(data.state)

  if (data.details)
    presence.setActivity(data)
  else
    presence.clearActivity()
})
