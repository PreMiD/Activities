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
  if (data2.iframeVideo.dur) {
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

// --- HÀM TIỆN ÍCH LẤY META TAG ---
function getMetaTagContent(property: string): string | null {
  const metaElement = document.querySelector<HTMLMetaElement>(`meta[property='${property}']`)
  return metaElement?.content?.trim() || null
}

function getMetaTagImage(): string | null {
  const selectors = [
    `meta[property='og:image']`,
    `meta[name='twitter:image']`,
    `meta[itemprop='image']`,
  ]
  for (const selector of selectors) {
    const metaElement = document.querySelector<HTMLMetaElement>(selector)
    if (metaElement && metaElement.content) {
      return new URL(metaElement.content, document.location.href).href
    }
  }
  return null
}
async function updatePresence(): Promise<void> {
  try {
    const video = document.querySelector<HTMLVideoElement>('video')
    const isPlayback = !!document.querySelector('#title') || (video && video.className !== 'previewVideo')
    const { pathname } = document.location
    const splitPath = pathname.split('/')

    const isHomePage = pathname === '/watch'
    const isProfilePage = pathname === '/profile'
    const isCategoryPage = pathname.includes('/the-loai')
    const isRegion = pathname.includes('/quoc-gia')
    const isDetailsPage = splitPath.length === 3 && splitPath[1] === 'phim' // /phim/ten-phim/tap-X
    const isWatchPage = splitPath.length === 4 && splitPath[1] === 'phim' // /phim/ten-phim/tap-X/tap-X
    const isWatchTogetherListing = pathname === '/xem-chung' // Trang danh sách phòng xem chung
    const isWatchTogetherRoom = splitPath.length === 3 && splitPath[1] === 'xem-chung' && splitPath[2] // /xem-chung/{ROOM_ID}
    const isSchedulePage = pathname === '/lich-chieu' // Trang lịch chiếu phim

    const [
      showButtons,
      showTimestamps,
    ] = await Promise.all([
      presence.getSetting<boolean>('showButtons'),
      presence.getSetting<boolean>('showtimestamps'),
    ])
    const Rating = document.querySelector('div.post-ratings > span')?.textContent?.trim() || 'N/A'
    const Year = document.querySelector('div.TPMvCn > div.Info > span.Date')?.textContent?.trim() || 'N/A'
    const movieName = document.querySelector('div.TPMvCn > a > h1.Title')?.textContent?.trim() || ''
    const fullTitle = document.querySelector('Title')?.textContent?.trim() || ''
    let episodeNumberStr = ''
    const regex = /[Tt]ập\s*(\d+)/
    const match = fullTitle.match(regex)
    if (match && match[1]) {
      episodeNumberStr = match[1]
    }

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
    }
    // get banner
    let dynamicBannerUrl: string | null = null
    if (isDetailsPage || isWatchPage || iFrameVideo || isPlayback || isWatchTogetherRoom) {
      dynamicBannerUrl = getMetaTagImage()
    }

    if (isHomePage) {
      presenceData.details = 'Đang xem trang chủ'
    }
    else if (isProfilePage) {
      presenceData.details = 'Đang xem tài khoản'
    }
    else if (isCategoryPage) {
      presenceData.details = 'Đang xem danh mục'
      const categoryText = document.querySelector('div.Top > h2.Title')?.textContent?.trim().split('Phim thể loại')?.[1]?.trim() || ''
      presenceData.state = `Thể loại: ${categoryText}`
    }
    else if (isRegion) {
      presenceData.details = 'Đang xem danh mục'
      const Region = document.querySelector('div.Top > h2.Title')?.textContent?.trim().split('Phim quốc gia')?.[1]?.trim() || ''
      presenceData.state = `Phim: ${Region}`
    }
    else if (isWatchTogetherListing) {
      // Trang danh sách phòng xem chung
      presenceData.details = 'Đang tìm phòng xem chung'
      presenceData.state = 'Xem Chung'
    }
    else if (isSchedulePage) {
      presenceData.details = 'Đang xem lịch chiếu phim'
    }
    else if (isDetailsPage) {
      // Trang thông tin phim (chưa vào xem)
      const fullTitle = document.querySelector('head > title')?.textContent?.trim() || ''
      presenceData.details = 'Định xem phim...'
      presenceData.state = fullTitle
      presenceData.largeImageKey = dynamicBannerUrl
    }
    // Xử lý trang xem phim (isWatchPage)
    if (isWatchPage) {
      // Trường hợp có video element
      if (isPlayback && video) {
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused ? (await strings).pause : (await strings).play
        if (showTimestamps && !Number.isNaN(video.currentTime) && !Number.isNaN(video.duration) && video.duration > 0) {
          if (!video.paused) {
            const timestamps = getTimestamps(video.currentTime, video.duration)
            presenceData.startTimestamp = timestamps[0]
            presenceData.endTimestamp = timestamps[1]
          }
          else {
            delete presenceData.endTimestamp
          }
        }
        presenceData.largeImageKey = dynamicBannerUrl
        presenceData.details = `${movieName}`
        presenceData.state = `Tập ${episodeNumberStr} - ⭐ ${Rating} - 🗓️ ${Year}`
        if (showButtons) {
          presenceData.buttons = [
            {
              label: 'Xem Phim',
              url: document.location.href,
            },
          ]
        }
      }
      // Trường hợp có iframe
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
        presenceData.largeImageKey = dynamicBannerUrl
        presenceData.details = `${movieName}`
        presenceData.state = `Tập ${episodeNumberStr} - ⭐ ${Rating} - 🗓️ ${Year}`
        if (showButtons) {
          presenceData.buttons = [
            {
              label: 'Xem Phim',
              url: document.location.href,
            },
          ]
        }
      }
      // Không tìm thấy video hoặc iframe - chỉ hiển thị thông tin thuần
      else {
        presenceData.largeImageKey = dynamicBannerUrl
        presenceData.details = `${movieName}`
        presenceData.state = `Tập ${episodeNumberStr} - ⭐ ${Rating} - 🗓️ ${Year}`
        // Không có icon play/pause, không có timestamps
        delete presenceData.smallImageKey
        delete presenceData.smallImageText
      }
    }

    // Xử lý trang room xem chung (isWatchTogetherRoom)
    if (isWatchTogetherRoom) {
      // og:title = description (tên phòng), og:description = tên phim
      const roomHost = getMetaTagContent('og:title') || 'Phòng xem chung'
      const movieTitle = getMetaTagContent('og:description') || 'Đang xem phim'
      // Trường hợp có video element
      if (video) {
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused ? (await strings).pause : (await strings).play
        if (showTimestamps && !Number.isNaN(video.currentTime) && !Number.isNaN(video.duration) && video.duration > 0) {
          if (!video.paused) {
            const timestamps = getTimestamps(video.currentTime, video.duration)
            presenceData.startTimestamp = timestamps[0]
            presenceData.endTimestamp = timestamps[1]
          }
          else {
            delete presenceData.endTimestamp
          }
        }
        presenceData.largeImageKey = dynamicBannerUrl
        presenceData.details = roomHost
        presenceData.state = movieTitle
        if (showButtons) {
          presenceData.buttons = [
            {
              label: 'Vào Phòng',
              url: document.location.href,
            },
          ]
        }
      }
      // Trường hợp có iframe
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
        presenceData.largeImageKey = dynamicBannerUrl
        presenceData.details = movieTitle
        presenceData.state = roomHost
        if (showButtons) {
          presenceData.buttons = [
            {
              label: 'Vào Phòng',
              url: document.location.href,
            },
          ]
        }
      }
      // Không tìm thấy video hoặc iframe - hiển thị thông tin thuần
      else {
        presenceData.largeImageKey = dynamicBannerUrl
        presenceData.details = movieTitle
        presenceData.state = roomHost
        delete presenceData.smallImageKey
        delete presenceData.smallImageText
      }
    }

    presence.setActivity(presenceData)
  }
  catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error)
  }
}

presence.on('UpdateData', updatePresence)
