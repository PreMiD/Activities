import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1109528360746504222',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
let iFrameVideo: boolean
let currentTime: number
let duration: number
let paused: boolean

interface IFrameData {
  iframeVideo: {
    dur: number
    iFrameVideo: boolean
    paused: boolean
    currTime: number
  }
}

presence.on('iFrameData', (data: unknown) => {
  const data2 = data as IFrameData
  if (data2?.iframeVideo) {
    ({
      iFrameVideo,
      paused,
      currTime: currentTime,
      dur: duration,
    } = data2.iframeVideo)
  }
})

const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniKenji%20Movie/assets/logo.png',
}

function getMetaTagContent(property: string): string | null {
  const metaElement = document.querySelector<HTMLMetaElement>(
    `meta[property='${property}'], meta[name='${property}']`,
  )
  return metaElement?.content?.trim() || null
}

function normalizeImageUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl, document.location.href)
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
      url.hostname = 'anikenji.tech'
      url.protocol = 'https:'
      url.port = ''
    }

    // Luôn ưu tiên dùng ảnh Thumb thay vì poster hoặc backdrop
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length >= 3 && parts[0] === 'storage' && parts[1] === 'images') {
      url.pathname = `/${parts[0]}/${parts[1]}/${parts[2]}/thumb.jpg`
    }

    return url.href
  }
  catch {
    return null
  }
}

function getMovieThumbImage(): string | null {
  // 1. Tìm thẻ img thumbnail trong DOM (các class thumb/card của CMS)
  const thumbImg = document.querySelector<HTMLImageElement>(
    'img[src*="thumb.jpg"], img[src*="thumb."], img[src*="/thumb"]',
  )
  if (thumbImg && thumbImg.src) {
    const normalized = normalizeImageUrl(thumbImg.src)
    if (normalized)
      return normalized
  }

  // 2. Tìm trong các thẻ meta og:image, twitter:image
  const selectors = [
    `meta[property='og:image']`,
    `meta[name='twitter:image']`,
    `meta[itemprop='image']`,
  ]
  for (const selector of selectors) {
    const metaElement = document.querySelector<HTMLMetaElement>(selector)
    if (metaElement && metaElement.content) {
      const normalized = normalizeImageUrl(metaElement.content)
      if (normalized)
        return normalized
    }
  }

  // 3. Fallback tìm ảnh phim bất kỳ trong storage
  const imgElement = document.querySelector<HTMLImageElement>(
    'img[src*="/storage/images/"]',
  )
  if (imgElement && imgElement.src) {
    const normalized = normalizeImageUrl(imgElement.src)
    if (normalized)
      return normalized
  }

  return null
}

function cleanDiscordString(text: string | null | undefined, fallback: string): string {
  if (!text)
    return fallback
  const trimmed = text.trim()
  if (trimmed.length < 2)
    return fallback
  return trimmed.length > 128 ? `${trimmed.slice(0, 125)}...` : trimmed
}

function parseWatchTitle(rawTitle: string): { movie: string, episode: string } | null {
  if (!rawTitle)
    return null
  const cleanTitle = rawTitle.replace(/\s*[|\-–—]\s*AniKenji.*$/i, '').trim()
  if (!cleanTitle.toLowerCase().startsWith('xem phim '))
    return null

  const content = cleanTitle.slice(9).trim()
  const parts = content.split(/\s+tập(?:\s+tap)?\s+/i)
  if (parts.length >= 2) {
    const movie = parts[0]?.trim() || ''
    const epPart = parts[1]?.trim() || ''
    const episode = epPart.split(/[\s|]+/)[0] || ''
    return { movie, episode }
  }
  return null
}

function extractWatchInfo(): {
  movieName: string
  episodeStr: string
  originName: string
} {
  let movieName = ''
  let episodeStr = ''
  let originName = ''

  // 1. Check h1 on Next.js watch page:
  // <h1>{movie.name} - <span className="text-red-500">Tập {activeEpisode.name}</span></h1>
  const h1 = document.querySelector('h1')
  if (h1) {
    const epSpan = h1.querySelector('span')
    if (epSpan && epSpan.textContent) {
      episodeStr = epSpan.textContent.replace(/^tập\s*/i, '').trim()
      const mainNode = h1.childNodes[0]
      if (mainNode?.textContent) {
        movieName = mainNode.textContent.replace(/[-–—\s]+$/, '').trim()
      }
      else {
        movieName = h1.textContent
          ? h1.textContent.replace(epSpan.textContent, '').replace(/[-–—\s]+$/, '').trim()
          : ''
      }
    }
    else if (h1.textContent) {
      const parts = h1.textContent.split(/\s*[-–—]\s*(?:tập|tap)\s*/i)
      if (parts.length >= 2) {
        movieName = parts[0]?.trim() || ''
        episodeStr = parts[1]?.trim() || ''
      }
      else {
        movieName = h1.textContent.trim()
      }
    }
  }

  // 2. Fallback movieName from "Trở về {movie.name}" link
  if (!movieName) {
    const backLink = document.querySelector<HTMLAnchorElement>('a[href^="/phim/"]')
    if (backLink && backLink.textContent && backLink.textContent.includes('Trở về')) {
      movieName = backLink.textContent.replace(/^.*?Trở về\s+/i, '').trim()
    }
  }

  // 3. Fallback episodeStr from "Đang phát: Tập {name}" top bar badge
  if (!episodeStr) {
    const badges = document.querySelectorAll('span')
    for (const badge of badges) {
      const text = badge.textContent?.trim() || ''
      if (text.startsWith('Đang phát:')) {
        const match = text.match(/Đang phát:\s*(?:(?:tập|tap)\s*)?(\S+)/i)
        if (match && match[1]) {
          episodeStr = match[1].trim()
          break
        }
      }
    }
  }

  // 4. Fallback episodeStr from active episode link (class bg-red-600)
  if (!episodeStr) {
    const activeEpLink = document.querySelector<HTMLAnchorElement>(
      'a[href*="/phim/"][class*="bg-red-600"]',
    )
    if (activeEpLink && activeEpLink.textContent) {
      episodeStr = activeEpLink.textContent.replace(/^tập\s*/i, '').trim()
    }
  }

  // 5. Fallback movieName and episodeStr from meta og:title or document.title
  const titleSources = [
    getMetaTagContent('og:title'),
    getMetaTagContent('twitter:title'),
    document.title,
  ]

  for (const rawTitle of titleSources) {
    if (!rawTitle)
      continue
    const parsed = parseWatchTitle(rawTitle)
    if (parsed) {
      if (!movieName && parsed.movie)
        movieName = parsed.movie
      if (!episodeStr && parsed.episode)
        episodeStr = parsed.episode
      break
    }
  }

  // 6. Fallback episodeStr from URL segment (/phim/slug/tap-1)
  if (!episodeStr) {
    const segments = document.location.pathname.split('/').filter(Boolean)
    if (segments.length >= 3) {
      const epSegment = segments[2]
      if (epSegment) {
        episodeStr = epSegment.replace(/^tap[-_]?/i, '').trim()
      }
    }
  }

  // 7. Legacy fallback for old Ophim theme classes
  if (!movieName) {
    const oldTitle = document.querySelector('div.TPMvCn > a > h1.Title')
    if (oldTitle && oldTitle.textContent) {
      movieName = oldTitle.textContent.trim()
    }
  }

  // Origin name (<p className="text-xs text-slate-400">{movie.origin_name}</p>)
  const originEl = document.querySelector('h1 + p, h1 ~ p.text-slate-400')
  if (originEl && originEl.textContent) {
    originName = originEl.textContent.trim()
  }

  return { movieName, episodeStr, originName }
}

function extractDetailInfo(): {
  movieName: string
  originName: string
  year: string
  rating: string
} {
  let movieName = ''
  let originName = ''
  let year = ''
  let rating = ''

  // 1. Heading on detail page
  const h1 = document.querySelector('h1')
  if (h1 && h1.textContent) {
    movieName = h1.textContent.trim()
  }

  // 2. Fallback movieName from og:title or document.title
  if (!movieName) {
    const titleSources = [
      getMetaTagContent('og:title'),
      getMetaTagContent('twitter:title'),
      document.title,
    ]
    for (const rawTitle of titleSources) {
      if (!rawTitle)
        continue
      const cleanTitle = rawTitle.replace(/\s*[|\-–—]\s*AniKenji.*$/i, '').trim()
      if (cleanTitle.toLowerCase().startsWith('phim ')) {
        movieName = cleanTitle.slice(5).trim()
        break
      }
      else if (cleanTitle && !cleanTitle.toLowerCase().includes('xem phim')) {
        movieName = cleanTitle
        break
      }
    }
  }

  // 3. Origin name: <p className="text-sm font-medium text-slate-400 mt-1">{movie.origin_name}</p>
  const originEl = document.querySelector('h1 + p')
  if (originEl && originEl.textContent) {
    originName = originEl.textContent.trim()
  }

  // 4. Year & Rating from badges
  const badges = document.querySelectorAll('span')
  for (const b of badges) {
    const text = b.textContent?.trim() || ''
    if (!year && /^(?:19|20)\d{2}$/.test(text)) {
      year = text
    }
    if (!rating && /^\d+\.\d+$/.test(text)) {
      rating = text
    }
  }

  return { movieName, originName, year, rating }
}

async function updatePresence(): Promise<void> {
  try {
    const video = document.querySelector<HTMLVideoElement>('video')
    const { pathname, search } = document.location
    const segments = pathname.split('/').filter(Boolean)

    const isHomePage = pathname === '/' || pathname === '/watch'
    const isProfilePage = pathname === '/tai-khoan' || pathname === '/profile'
    const isSearchPage = pathname === '/tim-kiem' || pathname.startsWith('/tim-kiem')
    const isCategoryPage = pathname.includes('/the-loai') || search.includes('category=')
    const isRegionPage = pathname.includes('/quoc-gia') || search.includes('region=')
    const isSchedulePage = pathname.includes('/lich-chieu')
    const isLoginPage = pathname === '/login'
    const isRegisterPage = pathname === '/register'

    // Watch together
    const isWatchTogetherListing = pathname === '/xem-chung'
    const isWatchTogetherRoom = segments[0] === 'xem-chung' && segments.length >= 2

    // Movie routes: /phim/{slug} vs /phim/{slug}/{episode}
    const isDetailsPage = segments[0] === 'phim' && segments.length === 2
    const isWatchPage = segments[0] === 'phim' && segments.length >= 3

    const [showButtons, showTimestamps] = await Promise.all([
      presence.getSetting<boolean>('showButtons'),
      presence.getSetting<boolean>('showtimestamps'),
    ])

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
    }

    const dynamicThumbUrl = getMovieThumbImage()

    if (isHomePage) {
      presenceData.details = 'Đang xem trang chủ'
      presenceData.state = 'Khám phá phim mới'
    }
    else if (isSearchPage) {
      const searchParam = new URLSearchParams(search).get('q')
      presenceData.details = 'Đang tìm kiếm phim'
      presenceData.state = searchParam
        ? cleanDiscordString(`Từ khóa: ${searchParam}`, 'Tìm kiếm...')
        : 'Tìm kiếm phim'
    }
    else if (isProfilePage) {
      presenceData.details = 'Đang xem tài khoản'
      presenceData.state = 'Hồ sơ cá nhân'
    }
    else if (isLoginPage) {
      presenceData.details = 'Đăng nhập'
      presenceData.state = 'Xác thực tài khoản'
    }
    else if (isRegisterPage) {
      presenceData.details = 'Đăng ký'
      presenceData.state = 'Tạo tài khoản mới'
    }
    else if (isCategoryPage) {
      const catText = document.querySelector('h1, h2')?.textContent?.trim() || ''
      presenceData.details = 'Đang xem thể loại'
      presenceData.state = cleanDiscordString(catText || 'Thể loại phim', 'Danh mục phim')
    }
    else if (isRegionPage) {
      const regText = document.querySelector('h1, h2')?.textContent?.trim() || ''
      presenceData.details = 'Đang xem quốc gia'
      presenceData.state = cleanDiscordString(regText || 'Quốc gia', 'Danh mục phim')
    }
    else if (isSchedulePage) {
      presenceData.details = 'Đang xem lịch chiếu'
      presenceData.state = 'Lịch phát sóng'
    }
    else if (isWatchTogetherListing) {
      presenceData.details = 'Đang tìm phòng xem chung'
      presenceData.state = 'Xem Chung'
    }
    else if (isDetailsPage) {
      const { movieName, originName, year, rating } = extractDetailInfo()
      presenceData.largeImageKey = dynamicThumbUrl || ActivityAssets.Logo
      presenceData.largeImageText = cleanDiscordString(movieName, 'AniKenji Movie')
      presenceData.details = cleanDiscordString(`Định xem ${movieName}`, 'Định xem phim...')

      let stateText = originName
      if (year && rating)
        stateText = `⭐ ${rating} • 🗓️ ${year}`
      else if (year)
        stateText = `Năm phát hành: ${year}`
      else if (rating)
        stateText = `Đánh giá: ⭐ ${rating}`

      presenceData.state = cleanDiscordString(stateText, 'Chi tiết phim')

      if (showButtons) {
        let btnUrl = document.location.href
        if (document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1') {
          btnUrl = `https://anikenji.tech${pathname}${search}`
        }
        presenceData.buttons = [
          {
            label: 'Chi Tiết Phim',
            url: btnUrl,
          },
        ]
      }
    }
    else if (isWatchPage) {
      const { movieName, episodeStr, originName } = extractWatchInfo()
      const displayMovie = cleanDiscordString(movieName, 'Đang xem phim')
      const displayEpisode = episodeStr ? `Tập ${episodeStr}` : 'Đang phát'

      let stateText = displayEpisode
      if (originName && stateText.length + originName.length + 3 <= 128) {
        stateText = `${displayEpisode} • ${originName}`
      }

      presenceData.largeImageKey = dynamicThumbUrl || ActivityAssets.Logo
      presenceData.largeImageText = displayMovie
      presenceData.details = displayMovie
      presenceData.state = cleanDiscordString(stateText, displayEpisode)

      // Xử lý video playback: Native video vs iFrame video
      if (video && !video.paused) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = (await strings).play
        if (showTimestamps && !Number.isNaN(video.currentTime) && !Number.isNaN(video.duration) && video.duration > 0) {
          const timestamps = getTimestamps(video.currentTime, video.duration)
          presenceData.startTimestamp = timestamps[0]
          presenceData.endTimestamp = timestamps[1]
        }
      }
      else if (video && video.paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = (await strings).pause
        delete presenceData.endTimestamp
      }
      else if (iFrameVideo && !Number.isNaN(duration) && duration > 0) {
        presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = paused ? (await strings).pause : (await strings).play

        if (showTimestamps && !paused && !Number.isNaN(currentTime)) {
          const [startTimestamp, endTimestamp] = getTimestamps(
            Math.floor(currentTime),
            Math.floor(duration),
          )
          presenceData.startTimestamp = startTimestamp
          presenceData.endTimestamp = endTimestamp
        }
        else {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
          presenceData.startTimestamp = browsingTimestamp
        }
      }
      else {
        // Chưa play hoặc iframe chưa sẵn sàng
        delete presenceData.smallImageKey
        delete presenceData.smallImageText
      }

      if (showButtons) {
        let btnUrl = document.location.href
        if (document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1') {
          btnUrl = `https://anikenji.tech${pathname}${search}`
        }
        presenceData.buttons = [
          {
            label: 'Xem Phim',
            url: btnUrl,
          },
        ]
      }
    }
    else if (isWatchTogetherRoom) {
      const roomHost = getMetaTagContent('og:title') || 'Phòng xem chung'
      const movieTitle = getMetaTagContent('og:description') || 'Đang xem phim'

      presenceData.largeImageKey = dynamicThumbUrl || ActivityAssets.Logo
      presenceData.details = cleanDiscordString(movieTitle, 'Xem Chung')
      presenceData.state = cleanDiscordString(roomHost, 'Phòng xem chung')

      if (video && !video.paused) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = (await strings).play
      }
      else if (video && video.paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = (await strings).pause
      }
      else if (iFrameVideo && !Number.isNaN(duration) && duration > 0) {
        presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = paused ? (await strings).pause : (await strings).play

        if (showTimestamps && !paused && !Number.isNaN(currentTime)) {
          const [startTimestamp, endTimestamp] = getTimestamps(
            Math.floor(currentTime),
            Math.floor(duration),
          )
          presenceData.startTimestamp = startTimestamp
          presenceData.endTimestamp = endTimestamp
        }
      }

      if (showButtons) {
        let btnUrl = document.location.href
        if (document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1') {
          btnUrl = `https://anikenji.tech${pathname}${search}`
        }
        presenceData.buttons = [
          {
            label: 'Vào Phòng',
            url: btnUrl,
          },
        ]
      }
    }
    else {
      // Default fallback
      const pageTitle = cleanDiscordString(document.title.replace(/\s*[|\-–—]\s*AniKenji.*$/i, ''), 'AniKenji Movie')
      presenceData.details = 'Đang xem AniKenji'
      presenceData.state = pageTitle
    }

    presence.setActivity(presenceData)
  }
  catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error)
  }
}

presence.on('UpdateData', updatePresence)
