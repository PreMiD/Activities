import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1521564654491402330',
})

enum ActivityAssets {
  Logo = 'https://files.catbox.moe/p5rvgo.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
const MAX_COVER_CACHE = 20
const MAX_FAILED_CACHE = 50
const coverCache = new Map<string, Blob>()
const coverPending = new Set<string>()
const coverFailed = new Set<string>()

interface ThumbCandidate {
  url: string
  element?: HTMLImageElement
}

function cacheCoverBlob(url: string, blob: Blob): void {
  if (coverCache.has(url)) {
    coverCache.delete(url)
  }
  else if (coverCache.size >= MAX_COVER_CACHE) {
    const oldestKey = coverCache.keys().next().value
    if (oldestKey)
      coverCache.delete(oldestKey)
  }
  coverCache.set(url, blob)
}

function markCoverFailed(url: string): void {
  if (coverFailed.size >= MAX_FAILED_CACHE) {
    const oldestKey = coverFailed.values().next().value
    if (oldestKey)
      coverFailed.delete(oldestKey)
  }
  coverFailed.add(url)
}

async function toSquareCoverBlob(source: HTMLImageElement | Blob): Promise<Blob | null> {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return null

  let objectUrl: string | null = null
  try {
    let drawable: CanvasImageSource
    let srcW: number
    let srcH: number

    if (source instanceof HTMLImageElement) {
      drawable = source
      srcW = source.naturalWidth
      srcH = source.naturalHeight
    }
    else {
      objectUrl = URL.createObjectURL(source)
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image()
        el.onload = () => resolve(el)
        el.onerror = () => reject(new Error('Image load failed'))
        el.src = objectUrl!
      })
      drawable = img
      srcW = img.naturalWidth
      srcH = img.naturalHeight
    }

    if (!srcW || !srcH)
      return null

    const scale = Math.max(size / srcW, size / srcH)
    const drawW = srcW * scale
    const drawH = srcH * scale
    ctx.drawImage(drawable, (size - drawW) / 2, (size - drawH) / 2, drawW, drawH)

    return await new Promise<Blob | null>(resolve =>
      canvas.toBlob(b => resolve(b), 'image/png'),
    )
  }
  catch {
    return null
  }
  finally {
    if (objectUrl)
      URL.revokeObjectURL(objectUrl)
  }
}

function resolveCleanImageUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== 'string')
    return null
  const trimmed = rawUrl.trim()
  if (!trimmed)
    return null

  try {
    const url = new URL(trimmed, document.location.href)
    if (!url.protocol.startsWith('http'))
      return null
    if (url.origin === document.location.origin && url.pathname === document.location.pathname)
      return null

    return url.href
  }
  catch {
    return null
  }
}

function getMovieCover(candidate: ThumbCandidate | null): Blob | string {
  if (!candidate)
    return ActivityAssets.Logo

  const { url, element } = candidate
  const cached = coverCache.get(url)
  if (cached)
    return cached

  if (!coverPending.has(url) && !coverFailed.has(url)) {
    coverPending.add(url)
    void (async () => {
      try {
        if (element && element.complete && element.naturalWidth > 0) {
          const domBlob = await toSquareCoverBlob(element)
          if (domBlob) {
            cacheCoverBlob(url, domBlob)
            return
          }
        }

        const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
        if (!res.ok) {
          markCoverFailed(url)
          return
        }

        const rawBlob = await res.blob()
        const finalBlob = (await toSquareCoverBlob(rawBlob))
          || (rawBlob.type.startsWith('image/') ? rawBlob : null)

        if (finalBlob) {
          cacheCoverBlob(url, finalBlob)
        }
        else {
          markCoverFailed(url)
        }
      }
      catch {
        markCoverFailed(url)
      }
      finally {
        coverPending.delete(url)
      }
    })()
  }

  return url
}

function getMovieThumbCandidate(): ThumbCandidate | null {
  // 1. Thẻ video poster
  const video = document.querySelector<HTMLVideoElement>('video')
  const videoPoster = video?.getAttribute('poster') || video?.poster
  if (videoPoster) {
    const resolved = resolveCleanImageUrl(videoPoster)
    if (resolved)
      return { url: resolved }
  }

  // 2. Thẻ meta og:image, twitter:image
  const selectors = [
    `meta[property='og:image']`,
    `meta[name='twitter:image']`,
    `meta[itemprop='image']`,
  ]
  for (const selector of selectors) {
    const meta = document.querySelector<HTMLMetaElement>(selector)
    if (meta?.content) {
      const resolved = resolveCleanImageUrl(meta.content)
      if (resolved)
        return { url: resolved }
    }
  }

  // 3. Ảnh poster hoặc banner trong DOM
  const images = Array.from(document.querySelectorAll<HTMLImageElement>('img'))
  for (const img of images) {
    const src = img.currentSrc || img.src || img.getAttribute('src') || ''
    if (
      src
      && (src.includes('img.nguonc.com') || src.includes('phimimg.com') || src.includes('tmdb.org') || src.includes('/uploads/') || src.includes('poster') || src.includes('thumb'))
      && !src.includes('ado-chibi')
      && !src.includes('premid')
    ) {
      const resolved = resolveCleanImageUrl(src)
      if (resolved)
        return { url: resolved, element: img }
    }
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

function parseMovieHeading(heading: string, defaultTitle: string): { movieName: string, episodeStr: string } {
  const clean = (heading || defaultTitle).replace(/^(?:Xem Phim|Phim)\s+/i, '').trim()

  const delimiters = [' — ', ' - ', ' – ', '—', '–', '-']
  for (const delim of delimiters) {
    const idx = clean.lastIndexOf(delim)
    if (idx > 0) {
      const movieName = clean.slice(0, idx).trim()
      let ep = clean.slice(idx + delim.length).trim()
      if (ep && (/^(?:\d+|full|hoàn tất)/i.test(ep) || /^tập/i.test(ep))) {
        if (!/^tập/i.test(ep)) {
          ep = `Tập ${ep}`
        }
        return { movieName, episodeStr: ep }
      }
    }
  }

  return { movieName: clean, episodeStr: '' }
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const video = document.querySelector<HTMLVideoElement>('video')

  const [showButtons, showTimestamps] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamps'),
  ])

  const thumbCandidate = getMovieThumbCandidate()
  const currentCover = getMovieCover(thumbCandidate)

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'AnimeVault - bunbongonvl.online',
  }

  if (showTimestamps) {
    presenceData.startTimestamp = browsingTimestamp
  }

  const pageFirstTitle = document.title ? (document.title.split('-')[0]?.trim() ?? '') : ''

  switch (true) {
    case pathname.startsWith('/xem/'): {
      const heading = document.querySelector('h1')?.textContent?.trim() || ''
      const { movieName, episodeStr } = parseMovieHeading(heading, pageFirstTitle)

      presenceData.largeImageKey = currentCover
      presenceData.largeImageText = cleanDiscordString(movieName, 'AnimeVault')
      presenceData.details = cleanDiscordString(movieName, 'Đang xem phim')
      if (episodeStr) {
        presenceData.state = cleanDiscordString(episodeStr, 'Đang phát')
      }

      if (video && !Number.isNaN(video.duration) && video.duration > 0) {
        if (showTimestamps) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            Math.floor(video.currentTime),
            Math.floor(video.duration),
          )
        }

        if (video.paused) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Tạm dừng'
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        else {
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Đang phát'
        }
      }
      else if (!episodeStr) {
        presenceData.state = 'Đang tải trình phát...'
      }

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Cùng Xem Phim Này',
            url: href,
          },
        ]
      }
      break
    }

    case pathname.startsWith('/xem-chung/'): {
      const roomTitle = document.querySelector('.wp-room-header h1')?.textContent?.trim() || 'Phòng chiếu VIP'
      presenceData.largeImageKey = currentCover
      presenceData.details = 'Phòng Xem Chung'
      presenceData.state = cleanDiscordString(roomTitle, 'Phòng chiếu')

      if (video && !Number.isNaN(video.duration) && video.duration > 0) {
        if (showTimestamps) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            Math.floor(video.currentTime),
            Math.floor(video.duration),
          )
        }

        if (video.paused) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Tạm dừng'
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        else {
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Đang phát'
        }
      }

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Tham Gia Phòng Chiếu',
            url: href,
          },
        ]
      }
      break
    }

    case pathname === '/xem-chung': {
      presenceData.details = 'Sảnh Xem Chung'
      presenceData.state = 'Tìm kiếm phòng chiếu'
      break
    }

    case pathname.startsWith('/quiz'): {
      presenceData.details = 'Luyện Tập Tiếng Nhật AI'
      presenceData.state = 'Quiz từ vựng Anime'
      break
    }

    case pathname.startsWith('/lich-chieu'): {
      presenceData.details = 'Lịch Chiếu Anime'
      presenceData.state = 'Xem lịch phát sóng'
      break
    }

    case pathname.startsWith('/phim/'): {
      const movieTitle = document.querySelector('h1')?.textContent?.trim() || pageFirstTitle
      presenceData.largeImageKey = currentCover
      presenceData.largeImageText = cleanDiscordString(movieTitle, 'AnimeVault')
      presenceData.details = 'Thông tin phim'
      presenceData.state = cleanDiscordString(movieTitle, 'Chi tiết tác phẩm')

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Xem Chi Tiết Phim',
            url: href,
          },
        ]
      }
      break
    }

    case pathname === '/' || pathname === '/home': {
      presenceData.details = 'Đang xem trang chủ'
      presenceData.state = 'Khám phá phim mới'
      break
    }

    default: {
      presenceData.details = 'Khám phá kho phim'
      presenceData.state = cleanDiscordString(pageFirstTitle, 'Trang chủ')
      break
    }
  }

  if (!showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
