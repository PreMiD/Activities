import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1521564654491402330',
})

enum ActivityAssets {
  Logo = 'https://files.catbox.moe/ghuz3s.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
const defaultAdoLogo = `https://wsrv.nl/?url=${encodeURIComponent('https://bunbongonvl.online/images/ado-chibi.png')}&w=512&h=512&fit=cover&output=png`

function formatImageUrl(rawUrl: string | null | undefined): string | null {
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

    // fit=cover lấp đầy hoàn hảo khung vuông 512x512 của Discord, không bị co dẹp
    return `https://wsrv.nl/?url=${encodeURIComponent(url.href)}&w=512&h=512&fit=cover&output=png`
  }
  catch {
    return null
  }
}

function getMovieThumbImage(): string | null {
  // 1. Thẻ video poster
  const video = document.querySelector<HTMLVideoElement>('video')
  const videoPoster = video?.getAttribute('poster') || video?.poster
  if (videoPoster) {
    const formatted = formatImageUrl(videoPoster)
    if (formatted)
      return formatted
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
      const formatted = formatImageUrl(meta.content)
      if (formatted)
        return formatted
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
      const formatted = formatImageUrl(src)
      if (formatted)
        return formatted
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

  // Match episode pattern at the end: e.g. "Sword Art Online - Tập 1" or "Tenet - Full"
  const epMatch = clean.match(/^(.*?)\s*[-–—]\s*(?:(?:tập|tap)\s*)?(\d+|full|hoàn tất.*)$/i)
  if (epMatch && epMatch[1] && epMatch[2]) {
    const movieName = epMatch[1].trim()
    const ep = epMatch[2].trim()
    const episodeStr = /^tập\s*/i.test(ep) ? ep : `Tập ${ep}`
    return { movieName, episodeStr }
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

  const dynamicThumb = getMovieThumbImage()
  const currentLogo = defaultAdoLogo || ActivityAssets.Logo

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: currentLogo,
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

      presenceData.largeImageKey = dynamicThumb || currentLogo
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
      presenceData.largeImageKey = dynamicThumb || currentLogo
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
      presenceData.largeImageKey = dynamicThumb || currentLogo
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
