import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1373817718192734268',
})

const siteStartTimestamp = Math.floor(Date.now() / 1000)
enum ActivityAssets {
  Logo = 'https://i.imgur.com/7J9jL7R.png',
}

function formatAnimeSlug(slug: string | null): string | null {
  if (!slug)
    return null
  const cleanedSlug = slug.replace(/-[a-z0-9]{5}$/i, '')
  return cleanedSlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
function getAnimeTitleFromDOM(): string | null {
  const titleSpan = document.querySelector<HTMLElement>('span[class*="truncate"][class*="text-snow"]')
    || document.querySelector<HTMLElement>('span[style*="view-transition-name: title-"]')
  if (titleSpan && titleSpan.textContent?.trim()) {
    return titleSpan.textContent.trim()
  }
  const titleElem = document.querySelector('.anime-title, .show-title, h1[class*="text-snow"], h1')
  if (titleElem && titleElem.textContent?.trim()) {
    return titleElem.textContent.trim()
  }
  return null
}
function getChapterOrSubtitleFromDOM(): { chapter: string | null, subtitleLang: string | null } {
  const chapterElem = document.querySelector('.vds-chapter-title')
  const chapter = chapterElem?.textContent?.trim() || null
  const trackElem = document.querySelector<HTMLTrackElement>('track[default], track[kind="captions"][src]')
  const subtitleLang = trackElem?.label || trackElem?.srclang?.toUpperCase() || null
  return { chapter, subtitleLang }
}
function getEpisodeTitleFromDOM(): string | null {
  const epTitleSpan = document.querySelector('.ep-title')
    || document.querySelector('h1[class*="text-[clamp"]')
    || document.querySelector('h1.text-snow')
  if (epTitleSpan && epTitleSpan.textContent?.trim()) {
    return epTitleSpan.textContent.trim()
  }
  const epImg = document.querySelector('img[alt*="titled"]')
  if (!epImg)
    return null
  const altText = epImg.getAttribute('alt') || ''
  const match = altText.match(/titled\s+['"](.+?)['"]/i)
  return match && match[1] ? match[1].trim() : null
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
function getFollowersCountFromDOM(): string | null {
  const links = Array.from(document.querySelectorAll<HTMLElement>('a, button, span, div'))
  const followersLink = links.find(el => el.textContent?.toLowerCase().includes('followers'))
  if (followersLink) {
    const span = followersLink.querySelector('.tabular-nums') || followersLink.querySelector('span')
    if (span && span.textContent?.trim()) {
      return span.textContent.trim()
    }
  }
  return null
}
function getFollowingCountFromDOM(): string | null {
  const links = Array.from(document.querySelectorAll<HTMLElement>('a, button, span, div'))
  const followingLink = links.find((el) => {
    const text = el.textContent?.toLowerCase() || ''
    return text.includes('following') && !text.includes('followers')
  })
  if (followingLink) {
    const span = followingLink.querySelector('.tabular-nums') || followingLink.querySelector('span')
    if (span && span.textContent?.trim()) {
      return span.textContent.trim()
    }
  }
  return null
}
function getCoverImageFromDOM(epNum?: string, lang?: string, isProfile?: boolean): string | null {
  if (isProfile) {
    const avatarImg = document.querySelector<HTMLImageElement>('main img[src*="/avatars/"]')
      || document.querySelector<HTMLImageElement>('img[src*="/avatars/"]')
    const src = avatarImg?.src || avatarImg?.getAttribute('src')
    if (src && src.startsWith('http'))
      return src
    return null
  }

  if (epNum) {
    const langQuery = lang ? `[href*="lang=${lang}"]` : ''
    const activeLink = document.querySelector<HTMLAnchorElement>(`a[href*="ep=${epNum}"]${langQuery}`)
      || document.querySelector<HTMLAnchorElement>(`a[href*="ep=${epNum}"]`)

    const activeImg = activeLink?.querySelector('img')
    if (activeImg) {
      const src = activeImg.src || activeImg.getAttribute('src')
      if (src && src.startsWith('http') && !src.includes('/avatars/'))
        return src
    }
  }

  const coverImg = document.querySelector<HTMLImageElement>('img[src*="anilistcdn/media/anime/cover/"]')
    || document.querySelector<HTMLImageElement>('img[data-nimg="fill"]')
    || document.querySelector<HTMLImageElement>('img[src*="screencap"]')
    || document.querySelector<HTMLImageElement>('img[src*="episode"]')
    || document.querySelector<HTMLImageElement>('img[class*="object-cover"]')
    || document.querySelector<HTMLImageElement>('img._infoImage_aojp4_125')
    || document.querySelector<HTMLImageElement>('img[class*="_infoImage_"]')
    || document.querySelector<HTMLImageElement>('img._coverImg_2wrhc_89')
    || document.querySelector<HTMLImageElement>('img[class*="_coverImg_"]')
  const src = coverImg?.src || coverImg?.getAttribute('src')
  return src && src.startsWith('http') && !src.includes('/avatars/') ? src : null
}

const getStrings = presence.getStrings({
  browsing: 'general.browsing',
  searching: 'general.searching',
  viewHome: 'general.viewHome',
  viewing: 'general.viewing',
})

interface PageMetadata {
  useMultiLanguage: string | boolean | undefined
  showAnimeAsTitle: boolean | undefined
  showButtons: boolean | undefined
  showEpTitle: boolean | undefined
  animeTitle: string | null
  chapter: string | null
  subtitleLang: string | null
  epTitle: string | null
  followersCount: string | null
  followingCount: string | null
  coverUrlProfile: string | null
  coverUrlWatch: string | null
  coverUrlDefault: string | null
}

const dataCache = new Map<string, PageMetadata>()

async function getPageData(urlStr: string): Promise<PageMetadata> {
  const cached = dataCache.get(urlStr)
  if (cached)
    return cached

  const url = new URL(urlStr)
  const { pathname, search } = url
  const searchParams = new URLSearchParams(search)

  const [useMultiLanguage, showAnimeAsTitle, showButtons, showEpTitle] = await Promise.all([
    presence.getSetting<string | boolean>('multiLanguage'),
    presence.getSetting<boolean>('showAnimeAsTitle'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('showEpTitle'),
  ])

  const animeTitle = getAnimeTitleFromDOM()
  const { chapter, subtitleLang } = getChapterOrSubtitleFromDOM()
  const epTitle = getEpisodeTitleFromDOM()
  const followersCount = getFollowersCountFromDOM()
  const followingCount = getFollowingCountFromDOM()

  const isProfile = pathname.startsWith('/@') || pathname === '/social'
  const epNum = searchParams.get('ep') ?? '1'
  const lang = searchParams.get('lang') ?? ''

  const coverUrlProfile = getCoverImageFromDOM(undefined, undefined, isProfile)
  const coverUrlWatch = getCoverImageFromDOM(epNum, lang)
  const coverUrlDefault = getCoverImageFromDOM()

  const data: PageMetadata = {
    useMultiLanguage,
    showAnimeAsTitle,
    showButtons,
    showEpTitle,
    animeTitle,
    chapter,
    subtitleLang,
    epTitle,
    followersCount,
    followingCount,
    coverUrlProfile,
    coverUrlWatch,
    coverUrlDefault,
  }

  dataCache.set(urlStr, data)
  return data
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)

  let cached = dataCache.get(href)

  const isWatch = /\/watch\/\d+\/[^?/#]+/i.test(pathname)
  const isAnime = /\/anime\/\d+\/[^?/#]+/i.test(pathname)
  const isProfile = pathname === '/social' || pathname.startsWith('/@')

  let buttonLabel: string | null = null

  const needsUpdate = !cached
    || (isWatch && !cached.animeTitle && getAnimeTitleFromDOM())
    || (isWatch && !cached.epTitle && getEpisodeTitleFromDOM())
    || (isWatch && !cached.coverUrlWatch && getCoverImageFromDOM(searchParams.get('ep') ?? '1', searchParams.get('lang') ?? ''))
    || (isAnime && !cached.animeTitle && getAnimeTitleFromDOM())
    || (isProfile && !cached.coverUrlProfile && getCoverImageFromDOM(undefined, undefined, true))

  if (needsUpdate) {
    dataCache.delete(href)
    cached = await getPageData(href)
  }

  const {
    useMultiLanguage,
    showAnimeAsTitle,
    showButtons,
    showEpTitle,
    animeTitle,
    chapter,
    subtitleLang,
    epTitle,
    followersCount,
    followingCount,
    coverUrlProfile,
    coverUrlWatch,
    coverUrlDefault,
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
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: siteStartTimestamp,
  }
  switch (true) {
    case pathname === '/' || pathname === '': {
      presenceData.details = 'Anikura'
      presenceData.state = getString('viewHome', 'On Homepage')
      break
    }
    case pathname === '/login': {
      presenceData.details = 'Anikura'
      presenceData.state = 'Logging In'
      break
    }
    case pathname === '/browse': {
      presenceData.details = 'Anikura'
      const sort = searchParams.get('sort')
      const year = searchParams.get('year')
      const status = searchParams.get('status')
      const format = searchParams.get('format')
      const audio = searchParams.get('audio')

      let base = 'Anime'
      const parts: string[] = []
      if (status)
        parts.push(formatAnimeSlug(status) || '')
      if (year)
        parts.push(year)
      if (format)
        parts.push(format.toUpperCase())

      let sortText = ''
      if (sort === 'score')
        sortText = 'Top Rated'
      else if (sort === 'year')
        sortText = 'Newest'
      else if (sort === 'title')
        sortText = 'A-Z'
      else if (sort)
        sortText = `by ${formatAnimeSlug(sort)}`

      if (sortText) {
        if (sortText === 'A-Z') {
          base = 'Anime (A-Z)'
        }
        else {
          parts.push(sortText)
        }
      }

      const filterDesc = parts.length > 0 ? `${parts.join(' ')} ${base}` : base
      const audioText = audio ? ` [${formatAnimeSlug(audio)}]` : ''
      presenceData.state = `Browsing ${filterDesc}${audioText}`
      break
    }
    case pathname === '/genres' || pathname.startsWith('/genres/'): {
      presenceData.details = 'Anikura'
      if (pathname.startsWith('/genres/')) {
        const genreSlug = pathname.replace('/genres/', '')
        const genreName = formatAnimeSlug(genreSlug)
        presenceData.state = `Browsing ${genreName} Genre`
      }
      else {
        presenceData.state = 'Browsing Genres'
      }
      break
    }
    case pathname === '/social' || pathname.startsWith('/@'): {
      presenceData.details = 'Anikura'
      const isActualProfile = pathname.startsWith('/@')
      if (isActualProfile) {
        const username = pathname.replace('/@', '')
        const view = searchParams.get('view')
        const tab = searchParams.get('tab')

        let subText = ''
        if (tab === 'followers') {
          const count = followersCount
          subText = ` (Followers${count ? `: ${count}` : ''})`
        }
        else if (tab === 'following') {
          const count = followingCount
          subText = ` (Following${count ? `: ${count}` : ''})`
        }
        else if (tab) {
          subText = ` (${formatAnimeSlug(tab)})`
        }
        else if (view) {
          subText = ` (${formatAnimeSlug(view)} List)`
        }

        presenceData.state = `Viewing ${username}'s Profile${subText}`
      }
      else {
        const view = searchParams.get('view')
        const tab = searchParams.get('tab')
        const lib = searchParams.get('lib')

        let stateText = 'Viewing Social'
        if (view) {
          if (view === 'library') {
            let libText = ''
            if (lib) {
              libText = lib === 'mal' || lib === 'anilist' ? lib.toUpperCase() : formatAnimeSlug(lib) || ''
            }
            let tabText = ''
            if (tab) {
              tabText = ` • ${formatAnimeSlug(tab)}`
            }
            stateText = `Viewing Social Library${libText ? ` (${libText})` : ''}${tabText}`
          }
          else {
            stateText = `Viewing Social ${formatAnimeSlug(view)}`
          }
        }
        presenceData.state = stateText
      }

      const coverUrl = coverUrlProfile
      if (coverUrl) {
        presenceData.largeImageKey = coverUrl
      }
      if (showButtons) {
        buttonLabel = isActualProfile ? 'View Profile' : 'View Social'
      }
      break
    }
    case pathname === '/membership': {
      presenceData.details = 'Anikura'
      presenceData.state = 'Viewing Membership'
      break
    }
    case pathname === '/settings': {
      presenceData.details = 'Anikura'
      const tab = searchParams.get('tab')
      presenceData.state = tab ? `Editing Settings (${formatAnimeSlug(tab)})` : 'Editing Settings'
      break
    }
    case pathname.includes('/search') || searchParams.has('query') || searchParams.has('q'): {
      const query = searchParams.get('query') ?? searchParams.get('q') ?? searchParams.get('search') ?? ''
      const searchingStr = getString('searching', 'Searching')
      presenceData.details = 'Anikura'
      presenceData.state = query ? `${searchingStr} "${query}"` : `${searchingStr}...`
      break
    }
    case isAnime: {
      const infoMatch = pathname.match(/\/anime\/\d+\/([^?/#]+)/i)
      const finalAnimeTitle = animeTitle || (infoMatch && infoMatch[1] ? formatAnimeSlug(infoMatch[1]) : null)
      const coverUrl = coverUrlDefault
      presenceData.details = finalAnimeTitle ? `${getString('viewing', 'Viewing')} ${finalAnimeTitle}` : 'Browsing Anime Info'
      presenceData.state = finalAnimeTitle ? 'Reading Details & Overview' : 'Exploring Info Catalog'
      presenceData.largeImageKey = coverUrl || ActivityAssets.Logo
      if (showButtons) {
        buttonLabel = 'View Info'
      }
      break
    }
    case isWatch: {
      const watchMatch = pathname.match(/\/watch\/\d+\/([^?/#]+)/i)
      const epNum = searchParams.get('ep') ?? '1'
      const lang = searchParams.get('lang') ?? ''
      const showTitle = animeTitle || (watchMatch && watchMatch[1] ? formatAnimeSlug(watchMatch[1]) : null) || 'Anime'
      const coverUrl = coverUrlWatch || coverUrlDefault
      let epLine = `Episode ${epNum}`
      const finalEpTitle = showEpTitle ? epTitle : null
      if (showEpTitle && (chapter || finalEpTitle)) {
        epLine += ` - ${chapter || finalEpTitle}`
      }
      const finalLang = lang || subtitleLang
      if (finalLang) {
        epLine += ` [${finalLang.charAt(0).toUpperCase() + finalLang.slice(1)}]`
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
      presenceData.largeImageKey = coverUrl || ActivityAssets.Logo

      const video = document.querySelector('video')
      const isPaused = video ? video.paused : true

      if (!isPaused) {
        delete presenceData.smallImageKey
        delete presenceData.smallImageText

        const timeSpans = Array.from(document.querySelectorAll('span[class*="font-medium"][class*="tracking-wide"]'))
        const currentTimeText = timeSpans[0]?.textContent || null
        const durationText = timeSpans[1]?.textContent || null

        const elementTime = parseTimeToSeconds(currentTimeText) ?? video?.currentTime ?? 0
        const elementDuration = parseTimeToSeconds(durationText) ?? video?.duration ?? 0

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

        presenceData.startTimestamp = siteStartTimestamp
        delete presenceData.endTimestamp
      }

      if (showButtons) {
        buttonLabel = 'Watch Episode'
      }
      break
    }
    default: {
      const catalogMatch = pathname.match(/\/(?:anime|watch)\/\d+\/([^?/#]+)/i)
      const finalAnimeTitle = animeTitle || (catalogMatch && catalogMatch[1] ? formatAnimeSlug(catalogMatch[1]) : null)
      const coverUrl = coverUrlDefault
      presenceData.details = getString('browsing', 'Browsing...')
      presenceData.state = finalAnimeTitle ? `${getString('viewing', 'Viewing')} ${finalAnimeTitle}` : 'Exploring Catalog'
      presenceData.largeImageKey = coverUrl || ActivityAssets.Logo
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
