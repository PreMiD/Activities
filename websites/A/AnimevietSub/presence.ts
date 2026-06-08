import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1511990578332827718',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let strings: Awaited<ReturnType<typeof getStrings>> | null = null
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

const LOGO_URL = 'http://gsvr1.hypercore.vn:25767/uploads/580928016289366017_20260608_163658_0_1000023100-removebg-preview.png';

presence.on('iFrameData', (data) => {
  if (data.hasVideo) {
    iframeVideoData = data
  } else {
    iframeVideoData = null
  }
})

function formatDuration(seconds: number): string {
  if (!seconds || Number.isNaN(seconds)) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

async function updatePresence() {
  try {
    const video = document.querySelector('video')
    const { pathname, href } = document.location
    
    if (currentVideoUrl !== href) {
      currentVideoUrl = href
      fallbackStartTime = null
    }
    
    const isWatchPage = pathname.includes('/phim/') || 
                        pathname.includes('/xem-phim/') || 
                        href.includes('-tap-') || 
                        href.includes('/tap-') || 
                        document.querySelector('.watching') !== null ||
                        document.querySelector('#player-area') !== null ||
                        document.querySelector('.list-episode') !== null;

    const newLang = await presence.getSetting<string>('lang').catch(() => 'en')

    if (oldLang !== newLang || !strings) {
      oldLang = newLang
      strings = await getStrings()
    }

    const presenceData: any = {
      type: ActivityType.Watching,
      largeImageKey: LOGO_URL,
      startTimestamp: browsingTimestamp,
    }

    if (isWatchPage) {
      let posterKey: string = LOGO_URL
      let schemaTitle: string | null = null
      let schemaEpisode: string | null = null
      let schemaDuration: number = 0

      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      for (const script of Array.from(scripts)) {
        try {
          const data = JSON.parse(script.textContent || '{}')
          
          if (data['@type'] === 'BreadcrumbList' && data.itemListElement && data.itemListElement.length >= 3) {
             schemaTitle = data.itemListElement[2].name;
          }

          if (data['@type'] === 'TVEpisode' || data['@type'] === 'VideoObject') {
            if (typeof data.image === 'string') posterKey = data.image
            else if (data.thumbnailUrl) posterKey = data.thumbnailUrl
            else if (data.video && typeof data.video.thumbnailUrl === 'string') posterKey = data.video.thumbnailUrl

            if (!schemaTitle && data.partOfSeries && typeof data.partOfSeries.name === 'string') {
              schemaTitle = data.partOfSeries.name
            }
            else if (!schemaTitle && data.name && data['@type'] === 'VideoObject') {
               schemaTitle = data.name;
            }

            if (data.episodeNumber) schemaEpisode = `Tập ${data.episodeNumber}`
            
            const rawDuration = data.duration || (data.video && data.video.duration)
            if (rawDuration) {
              const match = rawDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
              if (match) {
                const hours = parseInt(match[1] || '0', 10)
                const minutes = parseInt(match[2] || '0', 10)
                const seconds = parseInt(match[3] || '0', 10)
                schemaDuration = (hours * 3600) + (minutes * 60) + seconds
              }
            }
          }
        } catch (e) {
          // Bỏ qua lỗi
        }
      }

      if (posterKey === LOGO_URL) {
        const metaImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
        const domImage = document.querySelector('.film-info img, .movie-l-img img, .info-m-poster img, .m-thumb img, .film-poster img')?.getAttribute('src')
        
        if (metaImage) {
          posterKey = metaImage
        } else if (domImage) {
          posterKey = domImage
        }
      }
      
      if (posterKey && posterKey.startsWith('/')) {
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
        if (match) seasonText = ` - Phần ${match[0].replace(/season/i, '').trim()}`
      } else if (fullTitle.toLowerCase().includes('phần')) {
        const match = fullTitle.match(/phần\s*\d+/i)
        if (match) seasonText = ` - ${match[0]}`
      }

      if (!episodeText) {
        const urlMatch = href.match(/tap-(\d+)/i) || href.match(/-ep-(\d+)/i) || href.match(/-tap-(\d+)/i)
        
        if (urlMatch && urlMatch[1]) {
          episodeText = `Tập ${urlMatch[1]}`
        } else {
          const allActiveLinks = document.querySelectorAll('.list-episode a.active, ul.episodes a.active, .episodes a.active, .ep-item.active, .btn-episode.active')
          const epNode = Array.from(allActiveLinks).find(el => {
            const text = el.textContent?.toLowerCase() || ''
            return !text.includes('phần') && !text.includes('season') && !text.includes('dự') && !text.includes('du') && !text.includes('thuyết')
          })

          if (epNode && epNode.textContent) {
            let epNum = epNode.textContent.trim()
            episodeText = /^\d+$/.test(epNum) ? `Tập ${epNum}` : epNum
          } else {
            episodeText = 'Đang xem'
          }
        }
      }

      let isPaused: boolean = false
      let currentTime: number = 0
      let duration: number = 0
      let hasValidVideo: boolean = false

      if (video) {
        isPaused = video.paused
        currentTime = video.currentTime
        duration = video.duration
        hasValidVideo = true
      } else if (iframeVideoData && iframeVideoData.hasVideo) {
        isPaused = iframeVideoData.paused
        currentTime = iframeVideoData.currentTime
        duration = iframeVideoData.duration
        if (!posterKey || posterKey === LOGO_URL) {
            if (iframeVideoData.poster) posterKey = iframeVideoData.poster
        }
        hasValidVideo = true
      }

      presenceData.largeImageKey = posterKey
      presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play

      let finalDurationToDisplay = 0;

      if (hasValidVideo && !Number.isNaN(duration) && duration > 0) {
        finalDurationToDisplay = duration;
        if (!isPaused) {
          const timestamps = getTimestamps(currentTime, duration)
          presenceData.startTimestamp = timestamps[0]
          presenceData.endTimestamp = timestamps[1]
        } else {
          delete presenceData.endTimestamp
        }
      } else if (schemaDuration > 0) {
        finalDurationToDisplay = schemaDuration;
        if (!isPaused) {
          if (!fallbackStartTime) {
            fallbackStartTime = Math.floor(Date.now() / 1000)
          }
          presenceData.startTimestamp = fallbackStartTime
          presenceData.endTimestamp = fallbackStartTime + schemaDuration
        } else {
          delete presenceData.endTimestamp
        }
      } else {
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Đang tải video...'
      }

      // Đã loại bỏ chuỗi thời gian timeString khỏi State
      presenceData.state = `${episodeText}${seasonText}`;

      const baseStatusText = strings ? (isPaused ? strings.pause : strings.play) : (isPaused ? "Tạm dừng" : "Đang phát");
      presenceData.smallImageText = finalDurationToDisplay > 0 ? `${baseStatusText} - Tổng: ${formatDuration(finalDurationToDisplay)}` : baseStatusText;

      presenceData.buttons = [
        {
          label: 'Xem phim',
          url: document.location.href,
        },
        {
          label: 'Animevietsub',
          url: window.location.origin,
        }
      ]

    } else {
      presenceData.details = 'Đang lướt web'
      presenceData.state = 'Animevietsub'
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presence.setActivity(presenceData)
  } catch (error) {
    console.error('Lỗi:', error)
  }
}

presence.on('UpdateData', updatePresence)