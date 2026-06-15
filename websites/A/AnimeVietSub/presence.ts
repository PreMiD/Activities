import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1264754447276310599',
})

let browsingTimestamp = Number.parseInt(sessionStorage.getItem('PMD_browsing_time') || '0', 10)
if (!browsingTimestamp || Number.isNaN(browsingTimestamp)) {
  browsingTimestamp = Math.floor(Date.now() / 1000)
  sessionStorage.setItem('PMD_browsing_time', browsingTimestamp.toString())
}

let iFrameData: {
  currTime: number
  duration: number
  paused: boolean
} | null = null

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVietSub/assets/logo.png',
}

presence.on(
  'iFrameData',
  (data: {
    currTime: number
    duration: number
    paused: boolean
  }) => {
    iFrameData = data
  },
)

function getAnimeTitle(): string | null {
  const selectors = [
    'h1.Title',
    'h1.film-name',
    'h1.dynamic-name',
    'h1.title-detail',
    '.title-detail h1',
    '.film-info h1',
    '.anime-title h1',
    '.movie-detail h1',
    '.info h1',
    'h1',
  ]

  for (const selector of selectors) {
    const el = document.querySelector<HTMLElement>(selector)
    if (el?.textContent?.trim())
      return el.textContent.trim()
  }

  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
  if (ogTitle?.content)
    return ogTitle.content.replace(/- AnimeVietsub.*$/i, '').trim()

  return null
}
function getAnimePoster(): string | undefined {
  const metaSelectors = [
    'meta[property="og:image"]',
    'meta[itemprop="image"]',
    'meta[name="twitter:image"]',
    'link[rel="image_src"]',
  ]

  for (const selector of metaSelectors) {
    const meta = document.querySelector(selector)
    const content = meta?.getAttribute('content') || meta?.getAttribute('href')
    if (content)
      return content
  }

  const imgSelectors = [
    '.Objf img',
    'figure.Objf img',
    '.Image img',
    'img.Image',
    '.film-poster img',
    '.poster img',
    '.detail-poster img',
    '#poster img',
  ]

  for (const selector of imgSelectors) {
    const img = document.querySelector<HTMLImageElement>(selector)
    if (img?.src)
      return img.src
  }

  return undefined
}

function getEpisodeName(): string | null {
  const selectors = [
    '.episode.playing',
    '.episode-name',
    '.ep-name',
    '.episode.active',
    '.episodes a.active',
    '.server-item .btn.active',
    '.ep-item.active a',
    '#episode_page a.active',
  ]

  for (const selector of selectors) {
    const el = document.querySelector<HTMLElement>(selector)
    if (el?.textContent?.trim())
      return el.textContent.trim()
  }

  // Fallback: Extract from URL (e.g., /tap-07-113601.html)
  const urlMatch = document.location.pathname.match(/(?:tap|ep|episode)-?(\d+)/i)
  if (urlMatch && urlMatch[1]) {
    return `Tập ${urlMatch[1]}`
  }

  return null
}

function isWatchPage(): boolean {
  const { pathname, href } = document.location

  if (/\/xem-phim\//i.test(pathname))
    return true
  if (/\/xem\//i.test(pathname))
    return true
  if (/\/tap-\d+/i.test(pathname))
    return true
  if (/[?&]tap=/i.test(href))
    return true

  // Detect player explicitly (avoiding simple iframes which might just be trailers)
  if (document.querySelector('.watch-player, #media-player, #player, .play-video, #video-player')) {
    return true
  }

  return false
}

function isDetailPage(): boolean {
  const { pathname } = document.location
  return /^\/phim\//.test(pathname)
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { pathname, href } = document.location
  const buttons = await presence.getSetting<boolean>('buttons')
  const privateMode = await presence.getSetting<boolean>('privateMode')

  if (isWatchPage()) {
    const title = getAnimeTitle()
    const episode = getEpisodeName()
    const poster = getAnimePoster()

    if (poster) {
      presenceData.largeImageKey = poster
    }
    else {
      delete presenceData.largeImageKey
    }

    if (title)
      presenceData.details = title

    let stateText = ''
    if (episode) {
      const epStr = episode.trim()
      let epFormatted = ''
      if (/^\d+$/.test(epStr)) {
        epFormatted = `Tập: ${epStr}`
      }
      else if (/^tập\s+/i.test(epStr)) {
        epFormatted = epStr.replace(/^tập\s*/i, 'Tập: ')
      }
      else if (/^tập/i.test(epStr)) {
        epFormatted = epStr.replace(/^tập/i, 'Tập: ')
      }
      else {
        epFormatted = `Tập: ${epStr}`
      }

      const seasonMatch = (title || '').match(/season\s*(\d+)|\b(\d+)(?:st|nd|rd|th)\s*season/i)
        || document.querySelector<HTMLImageElement>('.Objf img')?.alt.match(/season\s*(\d+)|\b(\d+)(?:st|nd|rd|th)\s*season/i)

      if (seasonMatch) {
        const seasonNum = seasonMatch[1] || seasonMatch[2]
        stateText = `Mùa: ${seasonNum} ${epFormatted}`
      }
      else {
        stateText = epFormatted
      }
    }

    if (stateText)
      presenceData.state = stateText

    const video = document.querySelector<HTMLVideoElement>('video')

    if (video && !Number.isNaN(video.duration)) {
      if (!video.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Đang phát'
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Tạm dừng'
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else if (iFrameData) {
      if (!iFrameData.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          Math.floor(iFrameData.currTime),
          Math.floor(iFrameData.duration),
        )
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Đang phát'
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Tạm dừng'
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Xem Anime',
          url: href,
        },
      ]
    }
  }
  else if (isDetailPage()) {
    const title = getAnimeTitle()
    const poster = getAnimePoster()

    if (poster) {
      presenceData.largeImageKey = poster
    }
    else {
      delete presenceData.largeImageKey
    }
    if (title) {
      presenceData.details = title
      presenceData.state = 'Đang xem'
    }
    else {
      presenceData.details = 'Đang xem'
    }

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Xem anime',
          url: href,
        },
      ]
    }
  }
  else {
    const pathMap: Record<string, string> = {
      'the-loai': 'Đang xem Thể loại',
      'danh-sach': 'Đang xem Danh sách',
      'bang-xep-hang': 'Đang xem Bảng xếp hạng',
      'lich-chieu': 'Đang xem Lịch chiếu',
      'tim-kiem': 'Đang tìm kiếm',
    }

    const firstSegment = pathname.split('/').filter(Boolean)[0] ?? ''

    if (!firstSegment) {
      presenceData.details = 'Trang Chủ'
      presenceData.state = 'Đang tìm anime'
    }
    else {
      presenceData.details = pathMap[firstSegment] ?? 'Đang lướt web'
    }

    if (firstSegment === 'tim-kiem') {
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Tìm kiếm'

      const searchInput = document.querySelector<HTMLInputElement>('input[type="text"], input[name="q"], input.search-input, #search-input')
      if (searchInput?.value)
        presenceData.state = searchInput.value
    }
  }

  if (privateMode && (isWatchPage() || isDetailPage())) {
    presenceData.details = 'Đang xem Anime'
    delete presenceData.state
    presenceData.largeImageKey = ActivityAssets.Logo
    delete presenceData.smallImageKey
    delete presenceData.smallImageText

    // Override video timestamps with web browsing time to hide video length
    presenceData.startTimestamp = browsingTimestamp
    delete presenceData.endTimestamp

    delete presenceData.buttons
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
