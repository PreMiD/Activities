import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1373817718192734268',
})

const siteStartTimestamp = Math.floor(Date.now() / 1000)
let pauseStartTimestamp: number | null = null

function formatAnimeSlug(slug: string | null): string | null {
  if (!slug)
    return null
  return slug
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function getAnimeIdFromPathname(pathname: string): string | null {
  if (typeof pathname !== 'string')
    return null
  const match = pathname.match(/\/(?:watch|anime)\/(\d+)/)
  return match?.[1] ?? null
}

interface AniListMedia {
  title: {
    english?: string
    romaji?: string
    userPreferred?: string
  }
  coverImage: {
    extraLarge?: string
    large?: string
  }
}

const aniListCache = new Map<number, AniListMedia | null>()

async function fetchAniListMedia(animeId: number): Promise<AniListMedia | null> {
  const cached = aniListCache.get(animeId)
  if (cached !== undefined) {
    return cached
  }

  try {
    const query = `
      query ($id: Int) {
        Media (id: $id, type: ANIME) {
          title {
            english
            romaji
            userPreferred
          }
          coverImage {
            extraLarge
            large
          }
        }
      }
    `
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { id: animeId },
      }),
    })

    if (!response.ok) {
      throw new Error(`AniList API returned ${response.status}`)
    }

    const result = await response.json()
    const media = result?.data?.Media || null
    aniListCache.set(animeId, media)
    return media
  }
  catch {
    aniListCache.set(animeId, null)
    return null
  }
}

function getAnimeTitleFromDOM(pathname: string): string | null {
  if (pathname === '/info' || pathname === '/info.html') {
    const titleElem = document.querySelector('#info-title')
    if (titleElem && titleElem.textContent?.trim()) {
      return titleElem.textContent.trim()
    }
  }
  if (pathname === '/anime' || pathname === '/anime.html') {
    const titleElem = document.querySelector('#aa-name')
    if (titleElem && titleElem.textContent?.trim()) {
      return titleElem.textContent.trim()
    }
  }
  return null
}

function parseTimeToSeconds(timeStr: string | null): number | null {
  if (!timeStr) {
    return null
  }
  const parts = timeStr.trim().split(':').map(Number)
  if (parts.some(Number.isNaN)) {
    return null
  }
  if (parts.length === 2) {
    const [minutes = 0, seconds = 0] = parts
    return minutes * 60 + seconds
  }
  else if (parts.length === 3) {
    const [hours = 0, minutes = 0, seconds = 0] = parts
    return hours * 3600 + minutes * 60 + seconds
  }
  return null
}

function getCoverImageFromDOM(pathname: string, isProfile?: boolean): string | null {
  if (isProfile || pathname.startsWith('/@') || pathname === '/profile' || pathname === '/profile.html') {
    const avatarImg = document.querySelector<HTMLImageElement>(
      'img.nw-profile-avatar-img, img[src*="discordapp.com/avatars/"], img[src*="user/avatar/"], img[data-nw-last-good-src*="avatars"]',
    )
    const src = avatarImg?.getAttribute('data-nw-last-good-src') || avatarImg?.src || avatarImg?.getAttribute('src')
    if (src && src.startsWith('http')) {
      return src
    }
  }

  if (pathname === '/anime' || pathname === '/anime.html') {
    const posterDiv = document.querySelector<HTMLElement>('#aa-poster')
    if (posterDiv) {
      const style = posterDiv.style.backgroundImage
      const match = style?.match(/url\((['"]?)(.*?)\1\)/)
      const src = match ? match[2] : null
      if (src && src.startsWith('http')) {
        return src
      }
    }
  }

  return null
}

function getStreakNumber(): string | null {
  const streakContainer = document.querySelector('#nw-profile-streak')
  if (streakContainer?.getAttribute('data-streak-value')) {
    return streakContainer.getAttribute('data-streak-value')
  }

  const streakElem = document.querySelector('.nw-streak-value')
  if (streakElem?.textContent) {
    const match = streakElem.textContent.match(/\d+/)
    if (match) {
      return match[0]
    }
  }

  const spans = Array.from(document.querySelectorAll('span'))
  const streakSpan = spans.find(span => span.textContent?.toLowerCase().includes('streak'))
  if (streakSpan?.textContent) {
    const match = streakSpan.textContent.match(/\d+/)
    if (match) {
      return match[0]
    }
  }

  return null
}

function hasProfileBadges(): boolean {
  const badgeElems = document.querySelectorAll('.nw-profile-badge, [data-profile-badge]')
  return badgeElems.length > 0
}

const getStrings = presence.getStrings({
  browsing: 'general.browsing',
  searching: 'general.searching',
  viewHome: 'general.viewHome',
  viewing: 'general.viewing',
})

interface PageMetadata {
  animeTitle: string | null
  username: string | null
  coverUrlProfile: string | null
  coverUrlAnime: string | null
  coverUrlDefault: string | null
  epTitleText: string | null
}

const dataCache = new Map<string, PageMetadata>()
// Owner confirmed i can use this method to get watching data.
let latestWatchData: any = null

if (typeof window !== 'undefined') {
  const scriptId = 'nekowatch-fetch-interceptor'
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script')
    script.id = scriptId
    script.textContent = `
      (function() {
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
          const response = await originalFetch(...args);
          try {
            const url = args[0];
            if (typeof url === 'string' && url.includes('sync_own_watch_progress')) {
              const options = args[1];
              if (options && options.body) {
                const bodyText = typeof options.body === 'string' ? options.body : new TextDecoder().decode(options.body);
                const payload = JSON.parse(bodyText);
                if (payload && payload.p_items && payload.p_items[0]) {
                  window.dispatchEvent(new CustomEvent('nekowatch-progress-sync', { detail: payload.p_items[0] }));
                }
              }
            }
          } catch (e) {
          }
          return response;
        };
      })();
    `
    document.documentElement.appendChild(script)
    script.remove()
  }

  window.addEventListener('nekowatch-progress-sync', (event: any) => {
    latestWatchData = event.detail
    if (latestWatchData) {
      const currentId = getAnimeIdFromPathname(document.location.pathname)
      const isWatch = document.location.pathname.startsWith('/watch/')
      if (isWatch && currentId && String(latestWatchData.anime_id) === currentId) {
        const cached = dataCache.get(document.location.href)
        if (cached) {
          if (latestWatchData.anime_title) {
            cached.animeTitle = latestWatchData.anime_title
          }
          if (latestWatchData.poster_url && (!cached.coverUrlAnime || (!cached.coverUrlAnime.includes('artworks.thetvdb.com') && !cached.coverUrlAnime.includes('screencap')))) {
            cached.coverUrlAnime = latestWatchData.poster_url
            cached.coverUrlDefault = latestWatchData.poster_url
          }
          if (latestWatchData.episode_title) {
            cached.epTitleText = latestWatchData.episode_title
          }
        }
      }
    }
  })
}

async function getPageData(urlStr: string): Promise<PageMetadata> {
  const cached = dataCache.get(urlStr)
  if (cached)
    return cached

  const url = new URL(urlStr)
  const { pathname } = url

  const currentId = getAnimeIdFromPathname(pathname)
  const isWatch = pathname.startsWith('/watch/')
  const currentEp = url.searchParams.get('episode') ?? url.searchParams.get('ep') ?? '1'
  const useSync = latestWatchData && isWatch && currentId && String(latestWatchData.anime_id) === currentId && String(latestWatchData.episode) === String(currentEp)

  let animeTitle = getAnimeTitleFromDOM(pathname)
  let username: string | null = null
  if (pathname.startsWith('/@')) {
    username = pathname.split('/')[1]?.replace('@', '') || null
  }
  if (!username) {
    const usernameElem = document.querySelector('.nw-profile-name, .anilist-profile-name')
    username = usernameElem?.textContent?.trim() || null
  }

  const coverUrlProfile = getCoverImageFromDOM(pathname, true)
  let coverUrlAnime = getCoverImageFromDOM(pathname)
  let coverUrlDefault = getCoverImageFromDOM(pathname)

  if (currentId) {
    const media = await fetchAniListMedia(Number.parseInt(currentId))
    if (media) {
      animeTitle = media.title.english || media.title.userPreferred || media.title.romaji || animeTitle
      if (media.coverImage.extraLarge || media.coverImage.large) {
        coverUrlAnime = media.coverImage.extraLarge || media.coverImage.large || ''
        coverUrlDefault = coverUrlAnime
      }
    }
  }

  let epTitleText: string | null = null
  let epCoverUrl: string | null = null

  if (isWatch) {
    const epNum = url.searchParams.get('episode') ?? url.searchParams.get('ep') ?? '1'
    const epButtons = Array.from(document.querySelectorAll('button'))
    const activeEpBtn = epButtons.find((btn) => {
      const pTags = btn.querySelectorAll('p')
      return Array.from(pTags).some((p) => {
        const text = p.textContent?.trim().toLowerCase() || ''
        return text === `episode ${epNum}` || text === `ep ${epNum}`
      })
    })

    if (activeEpBtn) {
      const pTags = Array.from(activeEpBtn.querySelectorAll('p'))
      const titleP = pTags.find((p) => {
        const text = p.textContent?.trim().toLowerCase() || ''
        return !text.startsWith('episode') && !text.startsWith('ep')
      })
      epTitleText = titleP?.textContent?.trim() || null

      const img = activeEpBtn.querySelector('img')
      epCoverUrl = img?.src || img?.getAttribute('src') || null
    }
  }

  if (epCoverUrl) {
    coverUrlAnime = epCoverUrl
    coverUrlDefault = epCoverUrl
  }

  if (useSync && pathname.startsWith('/watch/')) {
    if (latestWatchData.poster_url && !epCoverUrl) {
      coverUrlAnime = latestWatchData.poster_url
      coverUrlDefault = latestWatchData.poster_url
    }
  }

  const activeEpBtnLegacy = document.querySelector('.ep-item.active, button[aria-current="episode"]')
  const epTitleFromAttr = activeEpBtnLegacy?.getAttribute('data-ep-title')
  if (!epTitleText) {
    epTitleText = epTitleFromAttr || document.querySelector('.ep-item-title')?.textContent?.trim() || null
  }

  if (useSync && pathname.startsWith('/watch/')) {
    epTitleText = latestWatchData.episode_title || epTitleText
  }

  const data: PageMetadata = {
    animeTitle,
    username,
    coverUrlProfile,
    coverUrlAnime,
    coverUrlDefault,
    epTitleText,
  }

  dataCache.set(urlStr, data)
  return data
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)

  const [
    useMultiLanguage,
    showAnimeAsTitle,
    showButtons,
    showEpTitle,
    showProfileStreak,
  ] = await Promise.all([
    presence.getSetting<string | boolean>('multiLanguage'),
    presence.getSetting<boolean>('showAnimeAsTitle'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('showEpTitle'),
    presence.getSetting<boolean>('showProfileStreak'),
  ])

  let cached = dataCache.get(href)

  const isProfile = pathname.startsWith('/@') || pathname === '/profile' || pathname === '/profile.html'
  const isInfo = pathname === '/info' || pathname === '/info.html' || pathname.startsWith('/anime/')
  const isAnime = pathname === '/anime' || pathname === '/anime.html' || pathname.startsWith('/watch/')
  const isWatch = pathname.startsWith('/watch/')

  const currentId = getAnimeIdFromPathname(pathname)
  const currentEp = searchParams.get('episode') ?? searchParams.get('ep') ?? '1'
  const useSync = latestWatchData && isWatch && currentId && String(latestWatchData.anime_id) === currentId && String(latestWatchData.episode) === String(currentEp)

  let buttonLabel: string | null = null

  const hasEpisodeButtons = Boolean(document.querySelector('button img[src*="artworks.thetvdb.com"], button img[src*="screencap"]'))
  const needsWatchImageUpdate = isWatch
    && hasEpisodeButtons
    && cached
    && (!cached.coverUrlAnime || (!cached.coverUrlAnime.includes('artworks.thetvdb.com') && !cached.coverUrlAnime.includes('screencap')))
  const needsWatchTitleUpdate = isWatch
    && cached
    && !cached.epTitleText

  const needsUpdate = !cached
    || (isProfile && !cached.username)
    || (isProfile && !cached.coverUrlProfile && getCoverImageFromDOM(pathname, true))
    || (isInfo && !cached.animeTitle && getAnimeTitleFromDOM(pathname))
    || (isAnime && !cached.animeTitle && ((useSync && latestWatchData?.anime_title) || getAnimeTitleFromDOM(pathname)))
    || (isAnime && !cached.coverUrlAnime && ((useSync && latestWatchData?.poster_url) || getCoverImageFromDOM(pathname)))
    || needsWatchImageUpdate
    || needsWatchTitleUpdate

  if (needsUpdate) {
    dataCache.delete(href)
    cached = await getPageData(href)
  }

  const {
    animeTitle,
    username,
    coverUrlProfile,
    coverUrlAnime,
    coverUrlDefault,
    epTitleText,
  } = cached!

  const rawStrings = await getStrings
  const getString = (key: keyof typeof rawStrings, fallback: string) => {
    if (!useMultiLanguage)
      return fallback
    const val = rawStrings[key]
    return val && !val.startsWith('general.') ? val : fallback
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Nekowatch/assets/logo.jpeg',
    startTimestamp: siteStartTimestamp,
  }

  switch (true) {
    case pathname === '/' || pathname === '/home' || pathname === '/home.html': {
      presenceData.details = 'Nekowatch'
      presenceData.state = getString('viewHome', 'On Homepage')
      break
    }

    case isProfile: {
      presenceData.details = username ? `User: @${username}` : 'Viewing Profile'

      const isEditing = Boolean(document.querySelector('#nw-edit-title'))

      if (isEditing) {
        presenceData.state = 'Editing Profile'
      }
      else {
        let stateText = 'Viewing Profile'

        if (hasProfileBadges()) {
          stateText += ' • ⭐'
        }

        if (showProfileStreak !== false) {
          const streakNum = getStreakNumber()
          if (streakNum) {
            stateText += ` • 🔥 ${streakNum}`
          }
        }

        presenceData.state = stateText
      }

      if (coverUrlProfile) {
        presenceData.largeImageKey = coverUrlProfile
      }

      if (showButtons) {
        buttonLabel = 'View Profile'
      }
      break
    }

    case pathname === '/browse' || pathname === '/browse.html' || pathname === '/search' || pathname === '/search.html': {
      presenceData.details = 'Nekowatch'
      const q = searchParams.get('q')
      const sort = searchParams.get('sort')
      const season = searchParams.get('season')
      const status = searchParams.get('status')
      const format = searchParams.get('format')
      const year = searchParams.get('year')
      const audio = searchParams.get('audio')
      const genre = searchParams.get('genre')

      presenceData.details = q ? `Searching: "${q}"` : 'Browsing Catalog'

      const filters: string[] = []
      if (season)
        filters.push(formatAnimeSlug(season) || '')
      if (year)
        filters.push(year)
      if (format)
        filters.push(format.toUpperCase() === 'TV' ? 'TV' : (formatAnimeSlug(format) || ''))
      if (status)
        filters.push(formatAnimeSlug(status) || '')
      if (audio)
        filters.push(formatAnimeSlug(audio) || '')
      if (genre)
        filters.push(formatAnimeSlug(genre) || '')

      let sortText = ''
      if (sort === 'SCORE_DESC')
        sortText = 'Top Rated'
      else if (sort === 'POPULARITY_DESC')
        sortText = 'Popular'
      else if (sort === 'UPDATED_AT_DESC')
        sortText = 'Recently Updated'
      else if (sort === 'START_DATE_DESC')
        sortText = 'Newest'
      else if (sort)
        sortText = `Sort: ${formatAnimeSlug(sort.replace('_DESC', ''))}`

      if (sortText) {
        filters.push(sortText)
      }

      presenceData.state = filters.length > 0 ? filters.join(' • ') : 'All Anime'
      break
    }

    case isInfo: {
      presenceData.details = 'Viewing Anime Info'
      presenceData.state = animeTitle || 'Reading Details & Overview'
      presenceData.largeImageKey = coverUrlAnime || coverUrlDefault || 'https://cdn.rcd.gg/PreMiD/websites/N/Nekowatch/assets/logo.jpeg'

      if (showButtons) {
        buttonLabel = 'View Anime'
      }
      break
    }

    case isAnime: {
      const epNum = searchParams.get('episode') ?? searchParams.get('ep') ?? '1'
      const lang = searchParams.get('audio') ?? ''
      const showTitle = animeTitle || 'Anime'
      const coverUrl = coverUrlAnime

      let epTitle = ''
      if (showEpTitle && epTitleText && epTitleText !== epNum) {
        epTitle = ` - ${epTitleText}`
      }

      let epLine = `Episode ${epNum}${epTitle}`
      if (lang) {
        epLine += ` [${lang.charAt(0).toUpperCase() + lang.slice(1)}]`
      }

      if (showAnimeAsTitle && showTitle) {
        presenceData.name = showTitle
        presenceData.details = epLine
        delete presenceData.state
      }
      else {
        delete presenceData.name
        presenceData.details = showTitle
        presenceData.state = epLine
      }

      presenceData.largeImageKey = coverUrl || 'https://cdn.rcd.gg/PreMiD/websites/N/Nekowatch/assets/logo.jpeg'

      const videos = Array.from(document.querySelectorAll('video'))
      const video = videos.find(v => v.src && !v.src.startsWith('blob:') && v.src.startsWith('http'))
        || videos.find(v => v.src)
        || videos[0]
        || null
      const isPaused = video ? video.paused : true

      const timeSpans = Array.from(document.querySelectorAll('span[class*="font-medium"][class*="tracking-wide"]'))
      const currentTimeText = timeSpans[0]?.textContent || null
      const durationText = timeSpans[1]?.textContent || null

      const elementTime = parseTimeToSeconds(currentTimeText)
        ?? video?.currentTime
        ?? (useSync && isWatch ? latestWatchData.progress_seconds : 0)
      const elementDuration = parseTimeToSeconds(durationText)
        ?? video?.duration
        ?? (useSync && isWatch ? latestWatchData.duration_seconds : 0)

      if (!isPaused) {
        pauseStartTimestamp = null
        delete presenceData.smallImageKey
        delete presenceData.smallImageText

        if (elementDuration > 0) {
          const [start, end] = getTimestamps(elementTime, elementDuration)
          presenceData.startTimestamp = start
          presenceData.endTimestamp = end
        }
        else {
          presenceData.startTimestamp = siteStartTimestamp
          delete presenceData.endTimestamp
        }
      }
      else {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Paused'

        if (!pauseStartTimestamp) {
          pauseStartTimestamp = Math.floor(Date.now() / 1000)
        }
        presenceData.startTimestamp = pauseStartTimestamp
        delete presenceData.endTimestamp
      }

      if (showButtons) {
        buttonLabel = 'Watch Episode'
      }
      break
    }

    default: {
      const pageName = pathname.replace(/^\//, '').replace('.html', '')
      if (pageName) {
        presenceData.details = 'Nekowatch'
        const formattedPage = pageName
          .split(/[-_]/)
          .map(w => w.toUpperCase() === 'DMCA' ? 'DMCA' : (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
          .join(' ')
        presenceData.state = `Viewing ${formattedPage}`
      }
      else {
        presenceData.details = getString('browsing', 'Browsing...')
        presenceData.state = animeTitle ? `${getString('viewing', 'Viewing')} ${animeTitle}` : 'Exploring Catalog'
      }
      presenceData.largeImageKey = coverUrlDefault || 'https://cdn.rcd.gg/PreMiD/websites/N/Nekowatch/assets/logo.jpeg'
      break
    }
  }

  if (showButtons && buttonLabel) {
    presenceData.buttons = [
      {
        label: buttonLabel,
        url: href,
      },
    ]
  }

  presence.setActivity(presenceData)
})
