import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1379377567760388196',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://imgur.com/ORJy91l.png',
}

const TEXTS = {
  en: {
    NAV_ROOT_DETAILS: 'Browsing',
    NAV_ROOT_STATE: 'Checking extras',

    NAV_HOME_DETAILS: 'Browsing',
    NAV_HOME_STATE: 'Thinking what to watch!',

    NAV_BROWSE_DETAILS: 'Exploring',
    NAV_BROWSE_STATE: 'New anime!',

    NAV_SEARCH_DETAILS: 'Searching',
    NAV_SEARCH_STATE: 'An anime!',

    NAV_SECTION_DETAILS: 'Viewing sections',
    NAV_SECTION_STATE: 'Checking genres!',

    NAV_WATCHLIST_DETAILS: 'Browsing lists',
    NAV_WATCHLIST_STATE: 'Checking my lists!',

    NAV_RELEASES_DETAILS: 'Checking releases',
    NAV_RELEASES_STATE: 'New premieres!',

    NAV_SEASON_DETAILS: 'Watching a show',
    NAV_SEASON_STATE: 'Checking the season!',

    NAV_PLAYLIST_DETAILS: 'Watching a movie',
    NAV_PLAYLIST_STATE: 'Checking its duration!',
  },
  es: {
    NAV_ROOT_DETAILS: 'Navegando',
    NAV_ROOT_STATE: 'Revisando extras',

    NAV_HOME_DETAILS: 'Navegando',
    NAV_HOME_STATE: 'Pensando qué ver!',

    NAV_BROWSE_DETAILS: 'Explorando',
    NAV_BROWSE_STATE: 'Nuevos animes!',

    NAV_SEARCH_DETAILS: 'Buscando',
    NAV_SEARCH_STATE: '¡Un anime!',

    NAV_SECTION_DETAILS: 'Viendo secciones',
    NAV_SECTION_STATE: '¡Revisando géneros!',

    NAV_WATCHLIST_DETAILS: 'Buscando listas',
    NAV_WATCHLIST_STATE: '¡Revisando mis listas!',

    NAV_RELEASES_DETAILS: 'Revisando lanzamientos',
    NAV_RELEASES_STATE: '¡Nuevos estrenos!',

    NAV_SEASON_DETAILS: 'Viendo un anime',
    NAV_SEASON_STATE: '¡Revisando la temporada!',

    NAV_PLAYLIST_DETAILS: 'Viendo una película',
    NAV_PLAYLIST_STATE: '¡Revisando su duración!',
  }
} as const

type Lang = keyof typeof TEXTS

function detectLanguage(): Lang {
  const nav = navigator.language.toLowerCase()
  if (nav.startsWith('es')) {
    return 'es'
  }
  return 'en'
}

const lang: Lang = detectLanguage()

function extractVideoId(urlStr: string): string | null | undefined {
  try {
    const pathname = new URL(urlStr).pathname
    const parts = pathname.split('/')
    if (parts.length >= 3 && parts[1] === 'video') {
      return parts[2]
    }
    return null
  }
  catch {
    return null
  }
}

let cachedSeason = {
  seasonId: '',
  title: '',
  bannerUrl: '',
  seasonNumber: '',
  lastVideoId: '',
}

let cachedPlaylist = {
  playlistId: '',
  title: '',
  bannerUrl: '',
  lastVideoId: '',
}

async function updateSeasonCache(seasonId: string) {
  if (cachedSeason.seasonId === seasonId) {
    return
  }
  try {
    const res = await fetch(`https://www.hidive.com/season/${seasonId}`)
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    const ogTitle = doc.querySelector('meta[property=\'og:title\']')?.getAttribute('content')?.trim() || ''
    const [animeTitleRaw, seasonRaw = 'Season 1'] = ogTitle.split(' - ').map(s => s.trim())
    const titleAnime = animeTitleRaw || 'Unknown Title'

    const bannerAnime = doc.querySelector('meta[property=\'og:image\']')?.getAttribute('content')?.trim() || ''

    const matched = seasonRaw.match(/Season\s+(\d+)/)
    const seasonNumber = matched && matched[1] ? matched[1] : '1'

    cachedSeason = {
      seasonId,
      title: titleAnime,
      bannerUrl: bannerAnime,
      seasonNumber,
      lastVideoId: '',
    }
  }
  catch (e) {
    console.error('Error fetching season page:', e)
  }
}

async function updatePlaylistCache(playlistId: string) {
  if (cachedPlaylist.playlistId === playlistId) {
    return
  }
  try {
    const res = await fetch(`https://www.hidive.com/playlist/${playlistId}`)
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    const ogTitle = doc.querySelector('meta[property=\'og:title\']')?.getAttribute('content')?.trim() || 'Película Desconocida'
    const banner = doc.querySelector('meta[property=\'og:image\']')?.getAttribute('content')?.trim() || ''

    cachedPlaylist = {
      playlistId,
      title: ogTitle,
      bannerUrl: banner,
      lastVideoId: '',
    }
  }
  catch (e) {
    console.error('Error fetching playlist:', e)
  }
}

async function getEpisodeInfo() {
  const title = document.querySelector('.player-title')?.textContent?.trim() || 'Unknown Episode'
  const currentTime = document.querySelector('.time__elapsed')?.textContent?.trim() || '0:00'
  const totalDuration = document.querySelector('.time__duration')?.textContent?.trim() || '0:00'

  const tooltipText = document.querySelector('.dice-player-control .tooltip__message')?.textContent?.trim()
  const isPlaying = tooltipText === 'Pause (k)'

  return {
    title,
    currentTime,
    totalDuration,
    isPlaying,
  }
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const url = new URL(document.location.href)
  const t = TEXTS[lang]

  if (pathname === '/') {
    const presenceData: PresenceData = {
      details: t.NAV_ROOT_DETAILS,
      state: t.NAV_ROOT_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Reading,
      smallImageText: t.NAV_ROOT_STATE,
      type: ActivityType.Watching,
      startTimestamp: browsingTimestamp,
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname === '/home') {
    const presenceData: PresenceData = {
      details: t.NAV_HOME_DETAILS,
      state: t.NAV_HOME_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Reading,
      smallImageText: t.NAV_HOME_STATE,
      type: ActivityType.Watching,
      startTimestamp: browsingTimestamp,
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/browse')) {
    const presenceData: PresenceData = {
      details: t.NAV_BROWSE_DETAILS,
      state: t.NAV_BROWSE_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Search,
      smallImageText: t.NAV_BROWSE_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/search')) {
    const presenceData: PresenceData = {
      details: t.NAV_SEARCH_DETAILS,
      state: t.NAV_SEARCH_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Search,
      smallImageText: t.NAV_SEARCH_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/section')) {
    const presenceData: PresenceData = {
      details: t.NAV_SECTION_DETAILS,
      state: t.NAV_SECTION_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Search,
      smallImageText: t.NAV_SECTION_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/watchlists')) {
    const presenceData: PresenceData = {
      details: t.NAV_WATCHLIST_DETAILS,
      state: t.NAV_WATCHLIST_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Search,
      smallImageText: t.NAV_WATCHLIST_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/releases')) {
    const presenceData: PresenceData = {
      details: t.NAV_RELEASES_DETAILS,
      state: t.NAV_RELEASES_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Reading,
      smallImageText: t.NAV_RELEASES_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/season')) {
    const presenceData: PresenceData = {
      details: t.NAV_SEASON_DETAILS,
      state: t.NAV_SEASON_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Reading,
      smallImageText: t.NAV_SEASON_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/playlist')) {
    const presenceData: PresenceData = {
      details: t.NAV_PLAYLIST_DETAILS,
      state: t.NAV_PLAYLIST_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Reading,
      smallImageText: t.NAV_PLAYLIST_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/video/')) {
    const videoId = extractVideoId(document.location.href) || ''
    const seasonIdParam = url.searchParams.get('seasonId') || ''
    const playlistIdParam = url.searchParams.get('playlistId') || ''

    if (seasonIdParam && seasonIdParam !== cachedSeason.seasonId) {
      await updateSeasonCache(seasonIdParam)
      cachedSeason.lastVideoId = videoId
    } else if (!seasonIdParam && videoId && videoId !== cachedSeason.lastVideoId) {
      cachedSeason = {
        seasonId: '',
        title: '',
        bannerUrl: '',
        seasonNumber: '',
        lastVideoId: '',
      }
    }

    if (playlistIdParam && playlistIdParam !== cachedPlaylist.playlistId) {
      await updatePlaylistCache(playlistIdParam)
      cachedPlaylist.lastVideoId = videoId
    } else if (!playlistIdParam && videoId && videoId !== cachedPlaylist.lastVideoId) {
      cachedPlaylist = {
        playlistId: '',
        title: '',
        bannerUrl: '',
        lastVideoId: '',
      }
    }

    const { title: titleEp, isPlaying } = await getEpisodeInfo()

    const isSeasonContext = !!cachedSeason.seasonId
    const contextTitle = isSeasonContext ? cachedSeason.title : cachedPlaylist.title
    const contextBanner = isSeasonContext ? cachedSeason.bannerUrl : cachedPlaylist.bannerUrl
    const contextSeasonNumber = isSeasonContext ? cachedSeason.seasonNumber : ''

    const displayTitle = contextTitle || 'Un Anime'
    const displayBanner = contextBanner || ActivityAssets.Logo
    const displaySeasonOrNothing = contextSeasonNumber ? `S${contextSeasonNumber} • ` : ''

    const presenceData: PresenceData = {
      details: `Viendo ${displayTitle}`,
      state: `${displaySeasonOrNothing}${titleEp}`,
      largeImageKey: displayBanner,
      largeImageText: displayTitle,
      smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
      smallImageText: isPlaying ? 'Reproduciendo' : 'Pausado',
      type: ActivityType.Watching,
    };

    if (isPlaying) {
      const videoEl = document.querySelector<HTMLVideoElement>('#dice-player > video')
      if (videoEl && !Number.isNaN(videoEl.duration)) {
        const [startTs, endTs] = getTimestampsFromMedia(videoEl)
        presenceData.startTimestamp = startTs
        presenceData.endTimestamp = endTs
      }
    }
    presence.setActivity(presenceData)
    return
  }
})
