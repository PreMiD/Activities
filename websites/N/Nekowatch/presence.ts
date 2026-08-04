import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1373817718192734268',
})

const siteStartTimestamp = Math.floor(Date.now() / 1000)
enum ActivityAssets {
  Logo = 'https://i.imgur.com/LtP6hmP.jpeg',
}

function formatAnimeSlug(slug: string | null): string | null {
  if (!slug)
    return null
  return slug
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}
function getAnimeTitleFromDOM(): string | null {
  const titleElem = document.querySelector('#info-title, #aa-name')
  if (titleElem && titleElem.textContent?.trim()) {
    return titleElem.textContent.trim()
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

function getCoverImageFromDOM(epNum?: string, lang?: string, isProfile?: boolean): string | null {
  if (isProfile) {
    const avatarImg = document.querySelector<HTMLImageElement>('img[src*="user/avatar/"], img[alt*="avatar"]')
    const src = avatarImg?.src || avatarImg?.getAttribute('src')
    if (src && src.startsWith('http'))
      return src
  }

  const posterDiv = document.querySelector<HTMLElement>('#aa-poster')
  if (posterDiv) {
    const style = posterDiv.style.backgroundImage
    const match = style?.match(/url\((['"]?)(.*?)\1\)/)
    const src = match ? match[2] : null
    if (src && src.startsWith('http'))
      return src
  }

  const infoPoster = document.querySelector<HTMLImageElement>('#info-poster-img')
  if (infoPoster) {
    const src = infoPoster.src || infoPoster.getAttribute('src')
    if (src && src.startsWith('http'))
      return src
  }

  const coverImg = document.querySelector<HTMLImageElement>('img[src*="anilistcdn/media/anime/cover/"]')
    || document.querySelector<HTMLImageElement>('img[data-nimg="fill"]')
    || document.querySelector<HTMLImageElement>('img[src*="screencap"]')
    || document.querySelector<HTMLImageElement>('img[src*="episode"]')
    || document.querySelector<HTMLImageElement>('img[class*="object-cover"]')
  const src = coverImg?.src || coverImg?.getAttribute('src')
  return src && src.startsWith('http') ? src : null
}
presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)
  const [useMultiLanguage, showAnimeAsTitle, showButtons] = await Promise.all([
    presence.getSetting<boolean>('multiLanguage'),
    presence.getSetting<boolean>('showAnimeAsTitle'),
    presence.getSetting<boolean>('buttons'),
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
    case pathname === '/' || pathname === '/home': {
      presenceData.details = 'Nekowatch'
      presenceData.state = getString('viewHome', 'On Homepage')
      break
    }
    case pathname === '/browse.html': {
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
    case pathname === '/schedule.html': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Checking Release Schedule'
      break
    }
    case pathname === '/donate': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Viewing Donation Page'
      break
    }
    case pathname === '/settings.html': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Viewing Settings'
      break
    }
    case pathname === '/feedback': {
      presenceData.details = 'Nekowatch'
      presenceData.state = 'Viewing Feedback Page'
      break
    }
    case pathname === '/profile.html': {
      presenceData.details = 'Nekowatch'
      const avatarImg = document.querySelector<HTMLImageElement>('img[src*="user/avatar/"], img[alt*="avatar"]')
      const altText = avatarImg?.getAttribute('alt') || ''
      const match = altText.match(/(.+?)\s+avatar/i)
      const username = match && match[1] ? match[1].trim() : null
      presenceData.state = username ? `Viewing ${username}'s Profile` : 'Viewing Profile'

      const coverUrl = getCoverImageFromDOM(undefined, undefined, true)
      if (coverUrl) {
        presenceData.largeImageKey = coverUrl
      }
      break
    }
    case pathname === '/info.html': {
      const animeTitle = getAnimeTitleFromDOM()
      const coverUrl = getCoverImageFromDOM()
      presenceData.details = 'Viewing Anime Info'
      presenceData.state = animeTitle || 'Reading Details & Overview'
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
    case pathname === '/anime.html': {
      const epNum = searchParams.get('ep') ?? '1'
      const lang = searchParams.get('audio') ?? ''
      const showTitle = getAnimeTitleFromDOM() || 'Anime'
      const coverUrl = getCoverImageFromDOM()
      let epLine = `Episode ${epNum}`
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
      const animeTitle = getAnimeTitleFromDOM()
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
