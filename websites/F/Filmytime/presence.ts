import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1499195388081475604',
})

const LOGO = 'https://i.imgur.com/tew3bhe.png'
const BASE_URL = 'https://filmytime.site'

presence.on('UpdateData', async () => {
  const [showButtons, privacyMode] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('privacyMode'),
  ])

  const { pathname } = document.location
  const segments = pathname.split('/').filter(Boolean)
  const type = segments[0]
  const contentId = segments[1]

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: LOGO,
    largeImageText: 'Filmytime',
  } as any

  const getText = (selector: string): string =>
    document.querySelector(selector)?.textContent?.trim() || ''

  const getTitle = (): string => {
    const h1 = getText('h1')
    if (h1)
      return h1
    return (document.title || '')
      .replace(/ [-|] ?(?:fimytime|filmytime).*/i, '')
      .trim() || 'Unknown Title'
  }

  const getPoster = (): string => {
    const img = document.querySelector<HTMLImageElement>(
      'img[src*=\'image.tmdb.org\'], img[src*=\'tmdb.org\'][src*=\'w500\'], img[src*=\'tmdb.org\'][src*=\'w300\']',
    )
    return img?.src || LOGO
  }

  const getGenre = (): string =>
    document.querySelector('.glass-pill')?.textContent?.trim() || ''

  const getRating = (): string => {
    for (const sel of ['[class*=\'vote\']', '[class*=\'rating\']', '.text-5xl']) {
      const num = Number.parseFloat(getText(sel))
      if (!Number.isNaN(num) && num > 0 && num <= 10)
        return `⭐ ${num.toFixed(1)}`
    }
    return ''
  }

  const video = (Array.from(document.querySelectorAll('video')) as HTMLVideoElement[])
    .filter(v => !Number.isNaN(v.duration) && v.duration > 1800)
    .sort((a, b) => b.duration - a.duration)[0] ?? null

  if (video) {
    const title = getTitle()
    presenceData.name = 'Filmytime'
    presenceData.details = privacyMode ? 'Watching something' : title
    presenceData.state = getGenre() || getRating() || (video.paused ? 'Paused' : 'Playing')
    presenceData.largeImageKey = privacyMode ? LOGO : getPoster()
    ;(presenceData as any).largeImageText = privacyMode ? 'Filmytime' : title
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'

    if (!video.paused) {
      const [start, end] = getTimestampsFromMedia(video)
      presenceData.startTimestamp = start
      presenceData.endTimestamp = end
    }

    if (showButtons && !privacyMode && contentId) {
      presenceData.buttons = [
        { label: 'Watch on Filmytime', url: `${BASE_URL}/${type}/${contentId}` },
      ]
    }
  }
  else if (type === 'movie' && contentId) {
    const title = getTitle()
    presenceData.details = privacyMode ? 'Browsing a movie' : `🎬 ${title}`
    presenceData.state = getGenre() || getRating() || 'Movie'
    presenceData.largeImageKey = privacyMode ? LOGO : getPoster()
    if (showButtons && !privacyMode) {
      presenceData.buttons = [
        { label: 'View Movie', url: `${BASE_URL}/movie/${contentId}` },
      ]
    }
  }
  else if (type === 'tv' && contentId) {
    const title = getTitle()
    presenceData.details = privacyMode ? 'Browsing a show' : `📺 ${title}`
    presenceData.state = getGenre() || getRating() || 'TV Series'
    presenceData.largeImageKey = privacyMode ? LOGO : getPoster()
    if (showButtons && !privacyMode) {
      presenceData.buttons = [
        { label: 'View Series', url: `${BASE_URL}/tv/${contentId}` },
      ]
    }
  }
  else if (type === 'anime' && contentId) {
    const title = getTitle()
    presenceData.details = privacyMode ? 'Browsing anime' : `🎌 ${title}`
    presenceData.state = getGenre() || getRating() || 'Anime'
    presenceData.largeImageKey = privacyMode ? LOGO : getPoster()
    if (showButtons && !privacyMode) {
      presenceData.buttons = [
        { label: 'View Anime', url: `${BASE_URL}/anime/${contentId}` },
      ]
    }
  }
  else if (type === 'sports') {
    presenceData.details = '⚽ Sports'
    presenceData.state = 'Browsing sports'
  }
  else if (type === 'live-tv') {
    presenceData.details = '📡 Live TV'
    presenceData.state = 'Browsing channels'
  }
  else if (type === 'search') {
    const q = new URLSearchParams(document.location.search).get('q')
    presenceData.details = '🔍 Searching'
    presenceData.state = q ? `"${q}"` : 'Looking for content'
  }
  else if (!type || type === 'home') {
    presenceData.details = '🏠 Home'
    presenceData.state = 'Browsing movies & shows'
  }
  else {
    presenceData.details = '🌟 Filmytime'
    presenceData.state = 'Exploring content'
  }

  presence.setActivity(presenceData)
})
