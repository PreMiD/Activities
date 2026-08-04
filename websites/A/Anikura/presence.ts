import { ActivityType, getTimestamps, Assets } from 'premid'

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
  return slug
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
  }

  if (epNum) {
    const langQuery = lang ? `[href*="lang=${lang}"]` : ''
    const activeLink = document.querySelector<HTMLAnchorElement>(`a[href*="ep=${epNum}"]${langQuery}`)
      || document.querySelector<HTMLAnchorElement>(`a[href*="ep=${epNum}"]`)

    const activeImg = activeLink?.querySelector('img')
    if (activeImg) {
      const src = activeImg.src || activeImg.getAttribute('src')
      if (src && src.startsWith('http'))
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
  return src && src.startsWith('http') ? src : null
}
presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)
  const [useMultiLanguage, showAnimeAsTitle, showButtons, showEpTitle] = await Promise.all([
    presence.getSetting<boolean>('multiLanguage'),
    presence.getSetting<boolean>('showAnimeAsTitle'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('showEpTitle'),
  ])
  const rawStrings = await presence.getStrings({
    browsing: 'general.browsing',
    searching: 'general.searching',
    viewHome: 'general.viewHome',
    viewing: 'general.viewing',
  })
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
    case pathname === '/profile' || pathname.startsWith('/@'): {
      presenceData.details = 'Anikura'
      const isProfile = pathname.startsWith('/@')
      if (isProfile) {
        const username = pathname.replace('/@', '')
        const view = searchParams.get('view')
        const tab = searchParams.get('tab')

        let subText = ''
        if (tab === 'followers') {
          const count = getFollowersCountFromDOM()
          subText = ` (Followers${count ? `: ${count}` : ''})`
        }
        else if (tab === 'following') {
          const count = getFollowingCountFromDOM()
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
        presenceData.state = 'Viewing Profile'
      }

      const coverUrl = getCoverImageFromDOM(undefined, undefined, isProfile || pathname === '/profile')
      if (coverUrl) {
        presenceData.largeImageKey = coverUrl
      }
      break
    }
    case pathname === '/membership': {
      presenceData.details = 'Anikura'
      presenceData.state = 'Viewing Membership'
      break
    }
    case pathname.includes('/search') || searchParams.has('query') || searchParams.has('q'): {
      const query = searchParams.get('query') ?? searchParams.get('q') ?? searchParams.get('search') ?? ''
      const searchingStr = getString('searching', 'Searching')
      presenceData.details = 'Anikura'
      presenceData.state = query ? `${searchingStr} "${query}"` : `${searchingStr}...`
      break
    }
    case /\/anime\/\d+\/[^?/#]+/i.test(pathname): {
      const infoMatch = pathname.match(/\/anime\/\d+\/([^?/#]+)/i)
      const animeTitle = getAnimeTitleFromDOM() || (infoMatch && infoMatch[1] ? formatAnimeSlug(infoMatch[1]) : null)
      const coverUrl = getCoverImageFromDOM()
      presenceData.details = animeTitle ? `${getString('viewing', 'Viewing')} ${animeTitle}` : 'Browsing Anime Info'
      presenceData.state = animeTitle ? 'Reading Details & Overview' : 'Exploring Info Catalog'
      presenceData.largeImageKey = coverUrl || ActivityAssets.Logo
      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'View Info',
            url: href,
          },
        ]
      }
      break
    }
    case /\/watch\/\d+\/[^?/#]+/i.test(pathname): {
      const watchMatch = pathname.match(/\/watch\/\d+\/([^?/#]+)/i)
      const epNum = searchParams.get('ep') ?? '1'
      const lang = searchParams.get('lang') ?? ''
      const showTitle = getAnimeTitleFromDOM() || (watchMatch && watchMatch[1] ? formatAnimeSlug(watchMatch[1]) : null) || 'Anime'
      const epTitle = getEpisodeTitleFromDOM()
      const { chapter, subtitleLang } = getChapterOrSubtitleFromDOM()
      const coverUrl = getCoverImageFromDOM(epNum, lang)
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
        presenceData.buttons = [
          {
            label: 'Watch Episode',
            url: href,
          },
        ]
      }
      break
    }
    default: {
      const catalogMatch = pathname.match(/\/(?:anime|watch)\/\d+\/([^?/#]+)/i)
      const animeTitle = getAnimeTitleFromDOM() || (catalogMatch && catalogMatch[1] ? formatAnimeSlug(catalogMatch[1]) : null)
      const coverUrl = getCoverImageFromDOM()
      presenceData.details = getString('browsing', 'Browsing...')
      presenceData.state = animeTitle ? `${getString('viewing', 'Viewing')} ${animeTitle}` : 'Exploring Catalog'
      presenceData.largeImageKey = coverUrl || ActivityAssets.Logo
      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'View Page',
            url: href,
          },
        ]
      }
      break
    }
  }
  presence.setActivity(presenceData)
})
