import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1379377567760388196',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/HIDIVE/assets/logo.png',
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    NAV_ROOT_DETAILS: 'general.browsing',
    NAV_ROOT_STATE: 'general.viewHome',

    NAV_HOME_DETAILS: 'general.browsing',
    NAV_HOME_STATE: 'general.viewHome',

    NAV_BROWSE_DETAILS: 'general.browsing',
    NAV_BROWSE_STATE: 'general.searchSomething',

    NAV_SEARCH_DETAILS: 'general.search',
    NAV_SEARCH_STATE: 'general.searchSomething',

    NAV_SECTION_DETAILS: 'general.browsing',
    NAV_SECTION_STATE: 'general.viewCategory',

    NAV_WATCHLIST_DETAILS: 'general.browsing',
    NAV_WATCHLIST_STATE: 'general.viewPlaylists',

    NAV_RELEASES_DETAILS: 'general.browsing',
    NAV_RELEASES_STATE: 'general.viewHome',

    NAV_SEASON_DETAILS: 'general.browsing',
    NAV_SEASON_STATE: 'general.viewAnime',

    NAV_PLAYLIST_DETAILS: 'general.browsing',
    NAV_PLAYLIST_STATE: 'general.viewMovie',

    NAV_PAUSED_STATE: 'general.paused',
    NAV_PLAYED_STATE: 'general.playing',
    NAV_WATCHING_STATE: 'general.watching',
    NAV_UNKNOWTITLE_STATE: 'general.anime',
  })
}

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
  const { pathname, href } = document.location
  const url = new URL(href)

  const currentLang = navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  if (!strings || oldLang !== currentLang) {
    strings = await getStrings()
    oldLang = currentLang
  }

  if (pathname === '/') {
    const presenceData: PresenceData = {
      details: strings.NAV_ROOT_DETAILS,
      state: strings.NAV_ROOT_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Reading,
      smallImageText: strings.NAV_ROOT_STATE,
      type: ActivityType.Watching,
      startTimestamp: browsingTimestamp,
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname === '/home') {
    const presenceData: PresenceData = {
      details: strings.NAV_HOME_DETAILS,
      state: strings.NAV_HOME_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Reading,
      smallImageText: strings.NAV_HOME_STATE,
      type: ActivityType.Watching,
      startTimestamp: browsingTimestamp,
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/browse')) {
    const presenceData: PresenceData = {
      details: strings.NAV_BROWSE_DETAILS,
      state: strings.NAV_BROWSE_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Search,
      smallImageText: strings.NAV_BROWSE_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/search')) {
    const presenceData: PresenceData = {
      details: strings.NAV_SEARCH_DETAILS,
      state: strings.NAV_SEARCH_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Search,
      smallImageText: strings.NAV_SEARCH_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/section')) {
    const sectionTitle = document.querySelector('h1')?.textContent?.trim() || 'Unknown'

    const presenceData: PresenceData = {
      details: strings.NAV_SECTION_DETAILS,
      state: `${strings.NAV_SECTION_STATE} ${sectionTitle}`,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Search,
      smallImageText: strings.NAV_SECTION_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/watchlists')) {
    const presenceData: PresenceData = {
      details: strings.NAV_WATCHLIST_DETAILS,
      state: strings.NAV_WATCHLIST_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Search,
      smallImageText: strings.NAV_WATCHLIST_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/releases')) {
    const presenceData: PresenceData = {
      details: strings.NAV_RELEASES_DETAILS,
      state: strings.NAV_RELEASES_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Reading,
      smallImageText: strings.NAV_RELEASES_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/season')) {
    const seasonIdFromUrl = pathname.split('/season/')[1]?.split('/')[0] || ''

    if (seasonIdFromUrl && seasonIdFromUrl !== cachedSeason.seasonId) {
      await updateSeasonCache(seasonIdFromUrl)
    }

    const animeTitle = cachedSeason.title || 'Unknown Title'

    const presenceData: PresenceData = {
      details: strings.NAV_SEASON_DETAILS,
      state: `${strings.NAV_SEASON_STATE} ${animeTitle}`,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Reading,
      smallImageText: strings.NAV_SEASON_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/playlist')) {
    const playlistIdFromUrl = pathname.split('/playlist/')[1]?.split('/')[0] || ''

    if (playlistIdFromUrl && playlistIdFromUrl !== cachedPlaylist.playlistId) {
      await updatePlaylistCache(playlistIdFromUrl)
    }

    const movieTitle = cachedPlaylist.title || 'Unknown Title'

    const presenceData: PresenceData = {
      details: strings.NAV_PLAYLIST_DETAILS,
      state: `${strings.NAV_PLAYLIST_STATE} ${movieTitle}`,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'HIDIVE',
      smallImageKey: Assets.Reading,
      smallImageText: strings.NAV_PLAYLIST_STATE,
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/video/')) {
    const videoId = extractVideoId(href) || ''
    const seasonIdParam = url.searchParams.get('seasonId') || ''
    const playlistIdParam = url.searchParams.get('playlistId') || ''

    if (seasonIdParam && seasonIdParam !== cachedSeason.seasonId) {
      await updateSeasonCache(seasonIdParam)
      cachedSeason.lastVideoId = videoId
    }
    else if (!seasonIdParam && videoId && videoId !== cachedSeason.lastVideoId) {
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
    }
    else if (!playlistIdParam && videoId && videoId !== cachedPlaylist.lastVideoId) {
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

    const displayTitle = contextTitle || strings.NAV_UNKNOWTITLE_STATE
    const displayBanner = contextBanner || ActivityAssets.Logo
    const displaySeasonOrNothing = contextSeasonNumber ? `S${contextSeasonNumber} • ` : ''

    const presenceData: PresenceData = {
      details: `${strings.NAV_WATCHING_STATE} ${displayTitle}`,
      state: `${displaySeasonOrNothing}${titleEp}`,
      largeImageKey: displayBanner,
      largeImageText: displayTitle,
      smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
      smallImageText: isPlaying ? strings.NAV_PLAYED_STATE : strings.NAV_PAUSED_STATE,
      type: ActivityType.Watching,
    }

    if (isPlaying) {
      const videoEl = document.querySelector<HTMLVideoElement>('#dice-player > video')
      if (videoEl && !Number.isNaN(videoEl.duration)) {
        const [startTs, endTs] = getTimestampsFromMedia(videoEl)
        presenceData.startTimestamp = startTs
        presenceData.endTimestamp = endTs
      }
    }
    presence.setActivity(presenceData)
  }
})
