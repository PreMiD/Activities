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
  if (!timeStr)
    return null
  const parts = timeStr.trim().split(':').map(Number)
  if (parts.some(Number.isNaN))
    return null
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
    if (src && src.startsWith('http'))
      return src
  }

  if (pathname === '/anime' || pathname === '/anime.html') {
    const posterDiv = document.querySelector<HTMLElement>('#aa-poster')
    if (posterDiv) {
      const style = posterDiv.style.backgroundImage
      const match = style?.match(/url\((['"]?)(.*?)\1\)/)
      const src = match ? match[2] : null
      if (src && src.startsWith('http'))
        return src
    }
  }

  const coverImg = document.querySelector<HTMLImageElement>('img[src*="anilistcdn/media/anime/cover/"]')
    || document.querySelector<HTMLImageElement>('img[data-nw-last-good-src*="anilistcdn"]')
    || document.querySelector<HTMLImageElement>('img[data-nimg="fill"]')
    || document.querySelector<HTMLImageElement>('img[src*="screencap"]')
    || document.querySelector<HTMLImageElement>('img[src*="episode"]')
    || document.querySelector<HTMLImageElement>('img[class*="object-cover"]')
  const src = coverImg?.src || coverImg?.getAttribute('src') || coverImg?.getAttribute('data-nw-last-good-src')
  return src && src.startsWith('http') ? src : null
}

function getStreakNumber(): string | null {
  const streakContainer = document.querySelector('#nw-profile-streak')
  if (streakContainer?.getAttribute('data-streak-value')) {
    return streakContainer.getAttribute('data-streak-value')
  }

  const streakElem = document.querySelector('.nw-streak-value')
  if (!streakElem?.textContent)
    return null

  const match = streakElem.textContent.match(/\d+/)
  return match ? match[0] : null
}

function hasProfileBadges(): boolean {
  const badgeElems = document.querySelectorAll('.nw-profile-badge')
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

async function getPageData(urlStr: string): Promise<PageMetadata> {
  const cached = dataCache.get(urlStr)
  if (cached)
    return cached

  const url = new URL(urlStr)
  const { pathname } = url

  const animeTitle = getAnimeTitleFromDOM(pathname)

  let username: string | null = null
  if (pathname.startsWith('/@')) {
    username = pathname.split('/')[1]?.replace('@', '') || null
  }
  if (!username) {
    const usernameElem = document.querySelector('.nw-profile-name, .anilist-profile-name')
    username = usernameElem?.textContent?.trim() || null
  }

  const coverUrlProfile = getCoverImageFromDOM(pathname, true)
  const coverUrlAnime = getCoverImageFromDOM(pathname)
  const coverUrlDefault = getCoverImageFromDOM(pathname)

  const activeEpBtn = document.querySelector('.ep-item.active, button[aria-current="episode"]')
  const epTitleFromAttr = activeEpBtn?.getAttribute('data-ep-title')
  const epTitleText = epTitleFromAttr || document.querySelector('.ep-item-title')?.textContent?.trim() || null

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
  const isInfo = pathname === '/info' || pathname === '/info.html'
  const isAnime = pathname === '/anime' || pathname === '/anime.html'

  let buttonLabel: string | null = null

  const needsUpdate = !cached
    || (isProfile && !cached.username)
    || (isProfile && !cached.coverUrlProfile && getCoverImageFromDOM(pathname, true))
    || (isInfo && !cached.animeTitle && getAnimeTitleFromDOM(pathname))
    || (isAnime && !cached.animeTitle && getAnimeTitleFromDOM(pathname))
    || (isAnime && !cached.coverUrlAnime && getCoverImageFromDOM(pathname))

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
    largeImageKey: 'https://i.imgur.com/LtP6hmP.jpeg',
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
        const tab = searchParams.get('tab')
        let stateText = 'Viewing Profile'

        if (tab === 'activity') {
          stateText = 'Viewing Activity'
        }
        else if (tab === 'comments') {
          stateText = 'Viewing Comments'
        }

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

    case pathname === '/browse' || pathname === '/browse.html': {
      presenceData.details = 'Nekowatch'
      const q = searchParams.get('q')
      const sort = searchParams.get('sort')
      const season = searchParams.get('season')
      const status = searchParams.get('status')
      const format = searchParams.get('format')
      const year = searchParams.get('year')
      const audio = searchParams.get('audio')

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
      presenceData.largeImageKey = 'https://i.imgur.com/LtP6hmP.jpeg'

      if (showButtons) {
        buttonLabel = 'View Info'
      }
      break
    }

    case isAnime: {
      const epNum = searchParams.get('ep') ?? '1'
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

      presenceData.largeImageKey = coverUrl || 'https://i.imgur.com/LtP6hmP.jpeg'

      const videos = Array.from(document.querySelectorAll('video'))
      const video = videos.find(v => v.src && !v.src.startsWith('blob:') && v.src.startsWith('http'))
        || videos.find(v => v.src)
        || videos[0]
        || null
      const isPaused = video ? video.paused : true

      const timeSpans = Array.from(document.querySelectorAll('span[class*="font-medium"][class*="tracking-wide"]'))
      const currentTimeText = timeSpans[0]?.textContent || null
      const durationText = timeSpans[1]?.textContent || null

      const elementTime = parseTimeToSeconds(currentTimeText) ?? video?.currentTime ?? 0
      const elementDuration = parseTimeToSeconds(durationText) ?? video?.duration ?? 0

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
      presenceData.largeImageKey = coverUrlDefault || 'https://i.imgur.com/LtP6hmP.jpeg'
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
