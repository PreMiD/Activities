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
  if (isProfile || pathname === '/profile' || pathname === '/profile.html') {
    const avatarImg = document.querySelector<HTMLImageElement>('img[src*="user/avatar/"], img[data-nw-last-good-src*="user/avatar/"], img[alt*="avatar"]')
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
const getStrings = presence.getStrings({
  browsing: 'general.browsing',
  searching: 'general.searching',
  viewHome: 'general.viewHome',
  viewing: 'general.viewing',
})

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)
  const [useMultiLanguage, showAnimeAsTitle, showButtons, showEpTitle] = await Promise.all([
    presence.getSetting<string | boolean>('multiLanguage'),
    presence.getSetting<boolean>('showAnimeAsTitle'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('showEpTitle'),
  ])
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
    case pathname === '/' || pathname === '/home': {
      presenceData.details = 'Nekowatch'
      presenceData.state = getString('viewHome', 'On Homepage')
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
    case pathname === '/circles': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Watching in Circles'
      break
    }
    case pathname === '/schedule' || pathname === '/schedule.html': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Checking Release Schedule'
      break
    }
    case pathname === '/changelog' || pathname === '/changelog.html': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Reading Changelog'
      break
    }
    case pathname === '/about' || pathname === '/about.html': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Reading About Page'
      break
    }
    case pathname === '/status' || pathname === '/status.html': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Checking Server Status'
      break
    }
    case pathname === '/settings' || pathname === '/settings.html': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Viewing Settings'
      break
    }
    case pathname === '/privacy' || pathname === '/privacy.html': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Reading Privacy Policy'
      break
    }
    case pathname === '/terms' || pathname === '/terms.html': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Reading Terms of Service'
      break
    }
    case pathname === '/dmca' || pathname === '/dmca.html': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Reading DMCA Policy'
      break
    }
    case pathname === '/donate': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Viewing Donation Page'
      break
    }

    case pathname === '/feedback': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Viewing Feedback Page'
      break
    }
    case pathname === '/profile' || pathname === '/profile.html': {
      presenceData.details = 'Nekowatch'
      const usernameElem = document.querySelector('.anilist-profile-name')
      const username = usernameElem?.textContent?.trim() || null
      presenceData.state = username ? `Viewing ${username}'s Profile` : 'Viewing Profile'

      const coverUrl = getCoverImageFromDOM(pathname, true)
      if (coverUrl) {
        presenceData.largeImageKey = coverUrl
      }
      break
    }
    case pathname === '/info' || pathname === '/info.html': {
      const animeTitle = getAnimeTitleFromDOM(pathname)
      presenceData.details = 'Viewing Anime Info'
      presenceData.state = animeTitle || 'Reading Details & Overview'

      presenceData.largeImageKey = 'https://i.imgur.com/LtP6hmP.jpeg'

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
    case pathname === '/anime' || pathname === '/anime.html': {
      const epNum = searchParams.get('ep') ?? '1'
      const lang = searchParams.get('audio') ?? ''
      const showTitle = getAnimeTitleFromDOM(pathname) || 'Anime'
      const coverUrl = getCoverImageFromDOM(pathname)

      let epTitle = ''
      if (showEpTitle) {
        const activeEpBtn = document.querySelector('.ep-item.active, button[aria-current="episode"]')
        const epTitleFromAttr = activeEpBtn?.getAttribute('data-ep-title')
        const epTitleFromDOM = epTitleFromAttr || document.querySelector('.ep-item-title')?.textContent?.trim() || null
        if (epTitleFromDOM && epTitleFromDOM !== epNum) {
          epTitle = ` - ${epTitleFromDOM}`
        }
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
      const animeTitle = getAnimeTitleFromDOM(pathname)
      const coverUrl = getCoverImageFromDOM(pathname)
      presenceData.details = getString('browsing', 'Browsing...')
      presenceData.state = animeTitle ? `${getString('viewing', 'Viewing')} ${animeTitle}` : 'Exploring Catalog'
      presenceData.largeImageKey = coverUrl || 'https://i.imgur.com/LtP6hmP.jpeg'
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
