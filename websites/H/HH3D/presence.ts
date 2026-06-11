import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1513468333360550030',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
let iframeVideoData: any = null

let fallbackStartTime: number | null = null
let currentVideoUrl: string = ''

async function getStrings() {
  return presence.getStrings({
    pause: 'general.paused',
    play: 'general.playing',
  })
}

enum ActivityAssets {
  Logo = 'http://gsvr1.hypercore.vn:25767/uploads/580928016289366017_20260608_182625_0_logo_new_year_1.png',
}

presence.on('iFrameData', (data) => {
  if (data.hasVideo) {
    iframeVideoData = data
  }
  else {
    iframeVideoData = null
  }
})

async function updatePresence() {
  try {
    const video = document.querySelector('video')
    const { pathname, href } = document.location

    // Nếu đổi tập phim thì reset lại thời gian dự phòng
    if (currentVideoUrl !== href) {
      currentVideoUrl = href
      fallbackStartTime = null
    }

    const isWatchPage = pathname.includes('/phim/') || pathname.includes('/xem-phim/') || pathname.includes('/tap-') || document.querySelector('.watching') !== null

    const [newLang] = await Promise.all([
      presence.getSetting<string>('lang').catch(() => 'en'),
    ])

    if (oldLang !== newLang || !strings) {
      oldLang = newLang
      strings = await getStrings()
    }

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
    }

    if (isWatchPage) {
      let posterKey: string = ActivityAssets.Logo
      let schemaTitle: string | null = null
      let schemaEpisode: string | null = null
      let schemaDuration: number = 0

      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      for (const script of Array.from(scripts)) {
        try {
          const data = JSON.parse(script.textContent || '{}')
          if (data['@type'] === 'TVEpisode') {
            if (typeof data.image === 'string') {
              posterKey = data.image
            }
            else if (data.video && typeof data.video.thumbnailUrl === 'string') {
              posterKey = data.video.thumbnailUrl
            }

            if (data.partOfSeries && typeof data.partOfSeries.name === 'string') {
              schemaTitle = data.partOfSeries.name
            }
            if (data.episodeNumber) {
              schemaEpisode = `Tập ${data.episodeNumber}`
            }

            if (data.duration || (data.video && data.video.duration)) {
              const rawDuration = data.duration || data.video.duration
              const match = rawDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
              if (match) {
                const hours = Number.parseInt(match[1] || '0', 10)
                const minutes = Number.parseInt(match[2] || '0', 10)
                const seconds = Number.parseInt(match[3] || '0', 10)
                schemaDuration = (hours * 3600) + (minutes * 60) + seconds
              }
            }
            break
          }
        }
        catch {
        }
      }

      if (posterKey === ActivityAssets.Logo) {
        const metaImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
        const domImage = document.querySelector('.film-info img, .movie-l-img img, .info-m-poster img, .m-thumb img')?.getAttribute('src')

        if (metaImage) {
          posterKey = metaImage
        }
        else if (domImage) {
          posterKey = domImage
        }
      }

      if (posterKey.startsWith('/')) {
        posterKey = window.location.origin + posterKey
      }

      const titleElement = document.querySelector('h1.entry-title, .movie-title h1, .title-film, h1, .film-info h1')
      const fullTitle = schemaTitle || titleElement?.textContent?.trim() || 'Đang xem Hoạt Hình 3D'

      presenceData.details = fullTitle
      presenceData.largeImageText = fullTitle

      let episodeText = schemaEpisode || ''
      let seasonText = ''

      if (fullTitle.toLowerCase().includes('season')) {
        const match = fullTitle.match(/season\s*\d+/i)
        if (match)
          seasonText = ` - Phần ${match[0].replace(/season/i, '').trim()}`
      }
      else if (fullTitle.toLowerCase().includes('phần')) {
        const match = fullTitle.match(/phần\s*\d+/i)
        if (match)
          seasonText = ` - ${match[0]}`
      }

      if (!episodeText) {
        const urlMatch = href.match(/tap-(\d+)/i) || href.match(/-ep-(\d+)/i) || href.match(/-tap-(\d+)/i)

        if (urlMatch && urlMatch[1]) {
          episodeText = `Tập ${urlMatch[1]}`
        }
        else {
          const allActiveLinks = document.querySelectorAll('.list-episode a.active, ul.episodes a.active, .episodes a.active, .ep-item.active')
          const epNode = Array.from(allActiveLinks).find((el) => {
            const text = el.textContent?.toLowerCase() || ''
            return !text.includes('phần') && !text.includes('season') && !text.includes('dự') && !text.includes('du') && !text.includes('thuyết')
          })

          if (epNode && epNode.textContent) {
            const epNum = epNode.textContent.trim()
            episodeText = /^\d+$/.test(epNum) ? `Tập ${epNum}` : epNum
          }
          else {
            episodeText = 'Đang xem'
          }
        }
      }

      presenceData.state = `${episodeText}${seasonText}`

      let isPaused: boolean = false
      let currentTime: number = 0
      let duration: number = 0
      let hasValidVideo: boolean = false
      let videoPoster: string = posterKey

      if (video) {
        isPaused = video.paused
        currentTime = video.currentTime
        duration = video.duration
        if (video.poster)
          videoPoster = video.poster
        hasValidVideo = true
      }
      else if (iframeVideoData && iframeVideoData.hasVideo) {
        isPaused = iframeVideoData.paused
        currentTime = iframeVideoData.currentTime
        duration = iframeVideoData.duration
        if (iframeVideoData.poster)
          videoPoster = iframeVideoData.poster
        hasValidVideo = true
      }

      presenceData.largeImageKey = videoPoster
      presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = isPaused ? strings.pause : strings.play

      if (hasValidVideo && !Number.isNaN(duration) && duration > 0) {
        if (!isPaused) {
          const timestamps = getTimestamps(currentTime, duration)
          presenceData.startTimestamp = timestamps[0]
          presenceData.endTimestamp = timestamps[1]
        }
        else {
          delete presenceData.endTimestamp
        }
      }
      else if (schemaDuration > 0) {
        // ĐÃ SỬA LỖI GIẬT LÙI THỜI GIAN Ở ĐÂY
        if (!isPaused) {
          if (!fallbackStartTime) {
            // Chỉ chốt thời gian 1 lần duy nhất khi bắt đầu xem
            fallbackStartTime = Math.floor(Date.now() / 1000)
          }
          presenceData.startTimestamp = fallbackStartTime
          presenceData.endTimestamp = fallbackStartTime + schemaDuration
        }
        else {
          delete presenceData.endTimestamp
        }
      }
      else {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Đang tải video...'
      }

      presenceData.buttons = [
        {
          label: 'Watch Video',
          url: document.location.href,
        },
      ]
    }
    else {
      presenceData.details = 'Đang lướt web'
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presence.setActivity(presenceData)
  }
  catch (error) {
    console.error('Lỗi:', error)
  }
}

presence.on('UpdateData', updatePresence)
