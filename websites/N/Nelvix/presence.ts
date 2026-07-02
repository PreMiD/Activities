import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1504836023920627743',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
const defaultLogo = 'https://res.cloudinary.com/debvitdiw/image/upload/w_512,h_512,c_scale/v1782274767/Nelvix.png'

const genreTranslations: Record<string, string> = {
  // Indonesian
  'aksi': 'Action',
  'petualangan': 'Adventure',
  'animasi': 'Animation',
  'komedi': 'Comedy',
  'kejahatan': 'Crime',
  'kriminal': 'Crime',
  'dokumenter': 'Documentary',
  'drama': 'Drama',
  'keluarga': 'Family',
  'fantasi': 'Fantasy',
  'sejarah': 'History',
  'horor': 'Horror',
  'musik': 'Music',
  'misteri': 'Mystery',
  'romantis': 'Romance',
  'percintaan': 'Romance',
  'romansa': 'Romance',
  'fiksi ilmiah': 'Sci-Fi',
  'sci-fi': 'Sci-Fi',
  'film tv': 'TV Movie',
  'thriller': 'Thriller',
  'mendebarkan': 'Thriller',
  'perang': 'War',
  'barat': 'Western',
  'western': 'Western',

  // Spanish / Portuguese / French / Italian (basic common ones just in case)
  'acción': 'Action',
  'aventura': 'Adventure',
  'animación': 'Animation',
  'comedia': 'Comedy',
  'crimen': 'Crime',
  'documental': 'Documentary',
  'familia': 'Family',
  'fantasía': 'Fantasy',
  'historia': 'History',
  'música': 'Music',
  'misterio': 'Mystery',
  'romance': 'Romance',
  'ciencia ficción': 'Sci-Fi',
  'película de tv': 'TV Movie',
  'bélico': 'War',

  // French
  'aventure': 'Adventure',
  'comédie': 'Comedy',
  'documentaire': 'Documentary',
  'histoire': 'History',
  'guerre': 'War',

  // Korean
  '액션': 'Action',
  '모험': 'Adventure',
  '애니메이션': 'Animation',
  '코미디': 'Comedy',
  '범죄': 'Crime',
  '다큐멘터리': 'Documentary',
  '드라마': 'Drama',
  '가족': 'Family',
  '판타지': 'Fantasy',
  '역사': 'History',
  '공포': 'Horror',
  '음악': 'Music',
  '미스터리': 'Mystery',
  '로맨스': 'Romance',
  'sf': 'Sci-Fi',
  'tv 영화': 'TV Movie',
  '스릴러': 'Thriller',
  '전쟁': 'War',
  '서부': 'Western',

  // Chinese
  '动作': 'Action',
  '冒险': 'Adventure',
  '动画': 'Animation',
  '喜剧': 'Comedy',
  '犯罪': 'Crime',
  '纪录': 'Documentary',
  '纪录片': 'Documentary',
  '剧情': 'Drama',
  '家庭': 'Family',
  '奇幻': 'Fantasy',
  '历史': 'History',
  '恐怖': 'Horror',
  '音乐': 'Music',
  '悬疑': 'Mystery',
  '爱情': 'Romance',
  '科幻': 'Sci-Fi',
  '电视电影': 'TV Movie',
  '惊悚': 'Thriller',
  '驚悚': 'Thriller',
  '战争': 'War',
  '西部': 'Western',

  // Japanese
  'アクション': 'Action',
  'アドベンチャー': 'Adventure',
  'アニメ': 'Animation',
  'アニメーション': 'Animation',
  'コメディ': 'Comedy',
  'ドキュメンタリー': 'Documentary',
  'ファミリー': 'Family',
  'ファンタジー': 'Fantasy',
  '歴史': 'History',
  'ホラー': 'Horror',
  '音楽': 'Music',
  'ミステリー': 'Mystery',
  'ロマンス': 'Romance',
  'テレビ映画': 'TV Movie',
  'スリルラー': 'Thriller',
  'スリラー': 'Thriller',
  '戦争': 'War',
  '西部劇': 'Western',
}

function translateGenre(genre: string): string {
  if (!genre)
    return ''
  const lower = genre.trim().toLowerCase()
  if (genreTranslations[lower]) {
    return genreTranslations[lower]
  }
  return genre.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function cleanMovieOrShowTitle(rawTitle: string): string {
  if (!rawTitle)
    return ''
  // 1. Remove the website suffix starting with a separator containing "Nelvix"
  let cleaned = rawTitle.replace(/\s*[—|•-]\s*(?:\S.*)?Nelvix.*$/i, '')

  // 2. Remove other common site/watch prefixes or suffixes in various languages
  cleaned = cleaned.replace(/^(?:Watch|Nonton|시청|观看|視聴)\s+/i, '')
  cleaned = cleaned.replace(/\s+Free\s+Online$/i, '')
  cleaned = cleaned.replace(/\s+Online\s+Free$/i, '')
  cleaned = cleaned.replace(/\s+Online$/i, '')
  cleaned = cleaned.replace(/\s+Free$/i, '')
  cleaned = cleaned.replace(/\s+Online\s+Gratis$/i, '')
  cleaned = cleaned.replace(/\s+Gratis$/i, '')

  return cleaned.trim()
}

function getShowData(): { type: 'movie' | 'tv' | 'live-tv', data: any } | null {
  // 1. Try Next.js client-side router components cache (most reliable for client-side navigation)
  try {
    const router = (window as any).next?.router
    const route = router?.route
    const props = router?.components?.[route]?.props?.pageProps
    if (props) {
      if (props.movie)
        return { type: 'movie', data: props.movie }
      if (props.tv)
        return { type: 'tv', data: props.tv }
      if (props.selectedChannel)
        return { type: 'live-tv', data: props.selectedChannel }
    }
  }
  catch {
    // ignore
  }

  // 2. Try SSR __NEXT_DATA__ JSON script tag
  try {
    const script = document.getElementById('__NEXT_DATA__')
    if (script && script.textContent) {
      const nextData = JSON.parse(script.textContent)
      const props = nextData?.props?.pageProps
      if (props) {
        if (props.movie)
          return { type: 'movie', data: props.movie }
        if (props.tv)
          return { type: 'tv', data: props.tv }
        if (props.selectedChannel)
          return { type: 'live-tv', data: props.selectedChannel }
      }
    }
  }
  catch {
    // ignore
  }

  return null
}

presence.on('UpdateData', async () => {
  const [
    usePresenceName,
    privacy,
    showBrowsing,
    showCover,
    showMovies,
    showShows,
    showTimestamp,
    showButtons,
  ] = await Promise.all([
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showBrowsing'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showMovies'),
    presence.getSetting<boolean>('showShows'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
  ])

  const path = document.location.pathname
  let cleanPath = path
  const localeMatch = path.match(/^\/[a-z]{2}(?:-[a-zA-Z]{2})?(?=\/|$)/)
  if (localeMatch) {
    cleanPath = path.substring(localeMatch[0].length) || '/'
  }
  const title = document.title

  const presenceData: PresenceData = {
    largeImageKey: defaultLogo,
  }

  // Retrieve clean title from the custom hidden metadata element if available (for exact English titles), otherwise fallback
  const pmdMeta = document.getElementById('premid-metadata')
  const englishTitleFromMeta = pmdMeta?.getAttribute('data-english-title')?.trim() || null
  const seasonNumber = pmdMeta?.getAttribute('data-season-number') ? Number.parseInt(pmdMeta.getAttribute('data-season-number')!, 10) : null
  const episodeNumber = pmdMeta?.getAttribute('data-episode-number') ? Number.parseInt(pmdMeta.getAttribute('data-episode-number')!, 10) : null
  const episodeName = pmdMeta?.getAttribute('data-episode-name')?.trim() || null
  const watchPartyCode = pmdMeta?.getAttribute('data-watch-party-code')?.trim() || null
  const watchPartyMembers = pmdMeta?.getAttribute('data-watch-party-members') ? Number.parseInt(pmdMeta.getAttribute('data-watch-party-members')!, 10) : null
  const watchPartyMediaType = pmdMeta?.getAttribute('data-watch-party-media-type')?.trim() || null
  const genresFromMeta = pmdMeta?.getAttribute('data-genres')?.trim() || null
  const yearFromMeta = pmdMeta?.getAttribute('data-year')?.trim() || null
  const ratingFromMeta = pmdMeta?.getAttribute('data-rating')?.trim() || null
  const taglineFromMeta = pmdMeta?.getAttribute('data-tagline')?.trim() || null

  // Retrieve clean title from H1 if available, otherwise parse document title
  const h1Element = document.querySelector('h1')
  const cleanH1Title = h1Element ? h1Element.textContent?.trim() : null
  const fallbackTitle = cleanMovieOrShowTitle(title)

  const metaImage = document.querySelector('meta[property="og:image"]')
  const imageUrl = metaImage ? metaImage.getAttribute('content') : null

  const showInfo = getShowData()

  // 1. Handle Privacy Mode
  if (privacy) {
    if (watchPartyCode || cleanPath.startsWith('/watch-party')) {
      const isMovie = watchPartyMediaType === 'movie'
      const isTv = watchPartyMediaType === 'tv'
      presenceData.details = isMovie ? 'Watching Movie' : isTv ? 'Watching TV Show' : 'Watching Content'
    }
    else {
      const isWatch = cleanPath.includes('/watch/')
      const isMovie = cleanPath.includes('/movie/')
      const isTv = cleanPath.includes('/tv/')
      const isLive = cleanPath.startsWith('/live-tv/')

      if (isWatch) {
        presenceData.details = isMovie ? 'Watching Movie' : isTv ? 'Watching TV Show' : isLive ? 'Watching Live TV' : 'Watching Content'
      }
      else {
        presenceData.details = 'Browsing Content'
      }
    }

    presence.setActivity(presenceData)
    return
  }

  // 1.5 Handle Active Watch Party Room
  if (watchPartyCode) {
    const isMovie = watchPartyMediaType === 'movie'
    const isTv = watchPartyMediaType === 'tv'

    if (isMovie && !showMovies) {
      presence.clearActivity()
      return
    }
    if (isTv && !showShows) {
      presence.clearActivity()
      return
    }

    // Resolve clean title
    const showTitle = englishTitleFromMeta || cleanH1Title || fallbackTitle || 'Content'
    let titleOnly = showTitle
    let year = ''

    const yearMatch = showTitle.match(/\((\d{4})\)$/)
    if (yearMatch) {
      year = yearMatch[1] || ''
      titleOnly = showTitle.replace(/\s*\(\d{4}\)$/, '').trim()
    }
    const formattedTitle = year ? `${titleOnly} (${year})` : titleOnly

    presenceData.type = ActivityType.Watching

    // State text
    let displayState = ''
    if (isTv) {
      const season = seasonNumber || 1
      const episode = episodeNumber || 1
      displayState = episodeName
        ? `S${season}:E${episode} - ${episodeName}`
        : `Season ${season} Episode ${episode}`
    }
    else {
      displayState = year ? `Movie (${year})` : 'Movie'
    }

    const membersCount = watchPartyMembers || 1
    const membersText = membersCount === 1 ? '1 member' : `${membersCount} members`
    const detailsText = `Watch Party (Room ${watchPartyCode})`

    if (usePresenceName) {
      presenceData.name = formattedTitle
      presenceData.details = detailsText
      presenceData.state = `${displayState} • ${membersText}`
    }
    else {
      presenceData.details = `${formattedTitle} (${displayState})`
      presenceData.state = `${detailsText} • ${membersText}`
    }

    if (showCover && imageUrl) {
      presenceData.largeImageKey = imageUrl
    }

    const video = document.querySelector('video')
    if (video) {
      const { paused } = video
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? 'Paused' : 'Playing'

      if (showTimestamp && !paused) {
        const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Join Watch Party', url: document.location.href },
        { label: 'Watch on Nelvix', url: document.location.href.replace(/\/watch-party\/[A-Za-z0-9].*$/, '') },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // 2. Parse path and update activity details & state
  if (cleanPath.startsWith('/movie/watch/')) {
    if (!showMovies) {
      presence.clearActivity()
      return
    }

    const movie = showInfo?.type === 'movie' ? showInfo.data : null
    const movieTitle = englishTitleFromMeta || movie?.englishTitle || movie?.title || movie?.name || cleanH1Title || fallbackTitle || 'Unknown Movie'
    let titleOnly = movieTitle
    let year = yearFromMeta || movie?.release_date?.slice(0, 4) || ''

    if (!year) {
      const yearMatch = movieTitle.match(/\((\d{4})\)$/)
      if (yearMatch) {
        year = yearMatch[1] || ''
        titleOnly = movieTitle.replace(/\s*\(\d{4}\)$/, '').trim()
      }
    }
    const formattedTitle = year ? `${titleOnly} (${year})` : titleOnly

    const genresText = genresFromMeta
      ? genresFromMeta.split(',').map(g => translateGenre(g.trim())).slice(0, 3).join(', ')
      : (movie?.genres?.map((g: any) => translateGenre(g.name)).slice(0, 3).join(', ') || '')

    const ratingText = ratingFromMeta
      ? `${ratingFromMeta} ★`
      : (movie?.vote_average ? `${movie.vote_average.toFixed(1)} ★` : '')

    const movieState = [year, ratingText, genresText].filter(Boolean).join(' • ') || 'Movie'

    presenceData.type = ActivityType.Watching

    if (usePresenceName) {
      presenceData.name = formattedTitle
      presenceData.details = 'Watching Movie'
      presenceData.state = movieState
    }
    else {
      presenceData.details = titleOnly
      presenceData.state = movieState
    }

    if (showCover) {
      if (imageUrl) {
        presenceData.largeImageKey = imageUrl
      }
    }

    const video = document.querySelector('video')
    if (video) {
      const { paused } = video
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? 'Paused' : 'Playing'

      if (showTimestamp && !paused) {
        const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }

    if (showButtons) {
      const detailUrl = document.location.href.replace('/watch/', '/')
      presenceData.buttons = [
        { label: 'Watch Movie', url: document.location.href },
        { label: 'View Details', url: detailUrl },
      ]
    }
  }
  else if (cleanPath.startsWith('/tv/watch/')) {
    if (!showShows) {
      presence.clearActivity()
      return
    }

    const tv = showInfo?.type === 'tv' ? showInfo.data : null
    const showTitle = englishTitleFromMeta || tv?.englishName || tv?.name || tv?.title || cleanH1Title || fallbackTitle || 'Watching TV Show'
    let titleOnly = showTitle
    let year = yearFromMeta || tv?.first_air_date?.slice(0, 4) || ''

    if (!year) {
      const yearMatch = showTitle.match(/\((\d{4})\)$/)
      if (yearMatch) {
        year = yearMatch[1] || ''
        titleOnly = showTitle.replace(/\s*\(\d{4}\)$/, '').trim()
      }
    }
    const formattedTitle = year ? `${titleOnly} (${year})` : titleOnly

    const parts = cleanPath.split('/')
    const season = seasonNumber || (parts[4] ? Number.parseInt(parts[4], 10) : 1)
    const episode = episodeNumber || (parts[5] ? Number.parseInt(parts[5], 10) : 1)
    const displayEpisodeText = episodeName
      ? `S${season}:E${episode} - ${episodeName}`
      : `Season ${season} Episode ${episode}`

    presenceData.type = ActivityType.Watching

    if (usePresenceName) {
      presenceData.name = formattedTitle
      presenceData.details = displayEpisodeText
      presenceData.state = 'Watching TV Show'
    }
    else {
      presenceData.details = titleOnly
      presenceData.state = displayEpisodeText
    }

    if (showCover) {
      if (imageUrl) {
        presenceData.largeImageKey = imageUrl
      }
    }

    const video = document.querySelector('video')
    if (video) {
      const { paused } = video
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? 'Paused' : 'Playing'

      if (showTimestamp && !paused) {
        const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }

    if (showButtons) {
      const detailUrl = document.location.href.replace(/\/watch\/(\d+)(?:\/.*)?$/, '/$1')
      presenceData.buttons = [
        { label: episodeName ? 'Watch Episode' : `Watch ${titleOnly}`, url: document.location.href },
        { label: 'View Series', url: detailUrl },
      ]
    }
  }
  else if (cleanPath.startsWith('/movie/')) {
    if (!showMovies) {
      presence.clearActivity()
      return
    }

    const movie = showInfo?.type === 'movie' ? showInfo.data : null
    const movieTitle = englishTitleFromMeta || movie?.englishTitle || movie?.title || movie?.name || cleanH1Title || fallbackTitle || 'Unknown Movie'
    let titleOnly = movieTitle
    let year = yearFromMeta || movie?.release_date?.slice(0, 4) || ''

    if (!year) {
      const yearMatch = movieTitle.match(/\((\d{4})\)$/)
      if (yearMatch) {
        year = yearMatch[1] || ''
        titleOnly = movieTitle.replace(/\s*\(\d{4}\)$/, '').trim()
      }
    }
    const formattedTitle = year ? `${titleOnly} (${year})` : titleOnly

    const genresText = genresFromMeta
      ? genresFromMeta.split(',').map(g => translateGenre(g.trim())).slice(0, 3).join(', ')
      : (movie?.genres?.map((g: any) => translateGenre(g.name)).slice(0, 3).join(', ') || '')

    const ratingText = ratingFromMeta
      ? `${ratingFromMeta} ★`
      : (movie?.vote_average ? `${movie.vote_average.toFixed(1)} ★` : '')

    const tagline = taglineFromMeta || movie?.tagline || (movie?.overview ? (`${movie.overview.substring(0, 100)}...`) : '')

    if (usePresenceName) {
      presenceData.name = formattedTitle
      presenceData.details = tagline || 'Movie Details'
      presenceData.state = [year, ratingText, genresText].filter(Boolean).join(' • ') || 'Movie Details'
    }
    else {
      presenceData.details = `Viewing Movie`
      presenceData.state = formattedTitle
    }

    if (showCover) {
      if (imageUrl) {
        presenceData.largeImageKey = imageUrl
      }
    }

    if (showButtons) {
      presenceData.buttons = [{ label: 'View Details', url: document.location.href }]
    }
  }
  else if (cleanPath.startsWith('/tv/')) {
    if (!showShows) {
      presence.clearActivity()
      return
    }

    const tv = showInfo?.type === 'tv' ? showInfo.data : null
    const showTitle = englishTitleFromMeta || tv?.englishName || tv?.name || tv?.title || cleanH1Title || fallbackTitle || 'Unknown TV Show'
    let titleOnly = showTitle
    let year = yearFromMeta || tv?.first_air_date?.slice(0, 4) || ''

    if (!year) {
      const yearMatch = showTitle.match(/\((\d{4})\)$/)
      if (yearMatch) {
        year = yearMatch[1] || ''
        titleOnly = showTitle.replace(/\s*\(\d{4}\)$/, '').trim()
      }
    }
    const formattedTitle = year ? `${titleOnly} (${year})` : titleOnly

    const genresText = genresFromMeta
      ? genresFromMeta.split(',').map(g => translateGenre(g.trim())).slice(0, 3).join(', ')
      : (tv?.genres?.map((g: any) => translateGenre(g.name)).slice(0, 3).join(', ') || '')

    const ratingText = ratingFromMeta
      ? `${ratingFromMeta} ★`
      : (tv?.vote_average ? `${tv.vote_average.toFixed(1)} ★` : '')

    const tagline = taglineFromMeta || tv?.tagline || (tv?.overview ? (`${tv.overview.substring(0, 100)}...`) : '')

    if (usePresenceName) {
      presenceData.name = formattedTitle
      presenceData.details = tagline || 'TV Show Details'
      presenceData.state = [year, ratingText, genresText].filter(Boolean).join(' • ') || 'TV Show Details'
    }
    else {
      presenceData.details = `Viewing TV Show`
      presenceData.state = formattedTitle
    }

    if (showCover) {
      if (imageUrl) {
        presenceData.largeImageKey = imageUrl
      }
    }

    if (showButtons) {
      presenceData.buttons = [{ label: 'View Details', url: document.location.href }]
    }
  }
  else if (cleanPath.startsWith('/live-tv/')) {
    const channel = showInfo?.type === 'live-tv' ? showInfo.data : null
    const channelName = channel?.name || cleanH1Title || fallbackTitle || 'Live TV'

    presenceData.details = 'Watching Live TV'
    presenceData.state = channelName
    if (usePresenceName) {
      presenceData.name = channelName
      presenceData.state = 'Live TV'
    }

    if (showCover && imageUrl) {
      presenceData.largeImageKey = imageUrl
    }

    const video = document.querySelector('video')
    if (video) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'
      if (showTimestamp && !video.paused) {
        presenceData.startTimestamp = Math.floor((Date.now() - video.currentTime * 1000) / 1000)
      }
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }

    if (showButtons) {
      presenceData.buttons = [{ label: 'Watch Live TV', url: document.location.href }]
    }
  }
  else {
    if (!showBrowsing) {
      presence.clearActivity()
      return
    }

    let detailsLabel = ''
    if (cleanPath === '/' || cleanPath.toLowerCase() === '/home') {
      detailsLabel = 'Browsing Home'
    }
    else if (cleanPath.startsWith('/anime')) {
      detailsLabel = 'Browsing Anime'
    }
    else if (cleanPath.startsWith('/korean')) {
      detailsLabel = 'Browsing Korean Drama'
    }
    else if (cleanPath.startsWith('/live-tv')) {
      detailsLabel = 'Watching Live TV'
    }
    else if (cleanPath.startsWith('/schedule')) {
      detailsLabel = 'Browsing Release Schedule'
    }
    else if (cleanPath.startsWith('/search')) {
      detailsLabel = 'Searching Content'
    }
    else if (cleanPath === '/movies' || cleanPath === '/movie') {
      detailsLabel = 'Browsing Movies'
    }
    else if (cleanPath === '/tv') {
      detailsLabel = 'Browsing TV Shows'
    }
    else if (cleanPath.startsWith('/genre') || cleanPath.startsWith('/genres')) {
      detailsLabel = 'Browsing Genres'
    }
    else if (cleanPath.startsWith('/popular')) {
      detailsLabel = 'Browsing Popular'
    }
    else if (cleanPath.startsWith('/person/')) {
      detailsLabel = 'Viewing Cast Details'
    }
    else if (cleanPath.startsWith('/keyword/')) {
      detailsLabel = 'Browsing Tag'
    }
    else if (cleanPath.startsWith('/user/history')) {
      detailsLabel = 'Viewing Watch History'
    }
    else if (cleanPath.startsWith('/user/settings')) {
      detailsLabel = 'Viewing Settings'
    }
    else if (cleanPath.startsWith('/user/account')) {
      detailsLabel = 'Viewing Account'
    }
    else if (cleanPath.startsWith('/profiles')) {
      detailsLabel = 'Viewing Profiles'
    }
    else if (cleanPath.startsWith('/watch-party')) {
      detailsLabel = 'In a Watch Party'
    }
    else if (cleanPath.startsWith('/auth')) {
      detailsLabel = 'Signing In'
    }
    else if (cleanPath.startsWith('/dmca')) {
      detailsLabel = 'Browsing DMCA'
    }
    else if (cleanPath.startsWith('/privacy')) {
      detailsLabel = 'Browsing Privacy Policy'
    }
    else if (cleanPath.startsWith('/terms')) {
      detailsLabel = 'Browsing Terms of Service'
    }
    else if (cleanPath.startsWith('/support')) {
      detailsLabel = 'Browsing Support'
    }
    else if (cleanPath.startsWith('/community')) {
      detailsLabel = 'Browsing Community'
    }
    else {
      const cleanTitle = cleanMovieOrShowTitle(title) || 'Content'
      if (cleanTitle === 'Nelvix' || cleanTitle.toLowerCase() === 'home') {
        detailsLabel = 'Browsing Home'
      }
      else {
        detailsLabel = `Browsing ${cleanTitle}`
      }
    }

    presenceData.details = detailsLabel
    presenceData.largeImageKey = defaultLogo
    if (showTimestamp) {
      presenceData.startTimestamp = browsingTimestamp
    }
  }

  presence.setActivity(presenceData)
})
