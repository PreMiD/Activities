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
  Logo = 'https://phamhung.xyz/images/webfilm-logo512x512.png',
}

// --- HÀM TIỆN ÍCH LẤY HÌNH ẢNH ---
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

    const isHomePage = pathname === '/'
    const isCategoryPage = pathname.includes('/the-loai')
    const isRegion = pathname.includes('/quoc-gia')
    const isDetailsPage = splitPath.length === 3 && splitPath[1] === 'phim'

    const [
      showButtons,
      showTimestamps,
    ] = await Promise.all([
      presence.getSetting<boolean>('buttons'),
      presence.getSetting<boolean>('showtimestamps'),
    ])
    const Rating = document.querySelector('body > div.box-width > div.player-info > div.player-info-text > div.this-desc-info > span.this-desc-score')?.textContent?.trim() || 'N/A'
    const Year = document.querySelector('body > div.box-width > div.player-info > div.player-info-text > div.this-desc-labels > span.this-tag')?.textContent?.trim() || 'N/A'
    let yearOfMovie = ''
    const yearRegex = /[Nn]ăm\s*(\d+)/
    const matchYear = Year.match(yearRegex)
    if (matchYear && matchYear[1]) {
      yearOfMovie = matchYear[1]
    }
    const movieName = document.querySelector('body > div.box-width > div.player-info > div.player-info-text > div.title > h2 > a > span')?.textContent?.trim() || ''
    const fullTitle = document.querySelector('body > div.box-width > div.player-info > div.player-info-text > div.title > h2')?.textContent?.trim() || ''
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
    if (isDetailsPage || iFrameVideo || isPlayback) {
      dynamicBannerUrl = getMetaTagImage()
    }

    if (isHomePage) {
      presenceData.details = 'Đang xem trang chủ'
    }
    else if (isCategoryPage) {
      presenceData.details = 'Đang xem danh mục'
      const categoryText = document.querySelector('body > div.box-width > div.title > div.title-left > h4')?.textContent?.trim().split('Phim thể loại')?.[1]?.trim() || ''
      presenceData.state = `Thể loại: ${categoryText}`
    }
    else if (isRegion) {
      presenceData.details = 'Đang xem danh mục'
      const Region = document.querySelector('body > div.box-width > div.title > div.title-left > h4')?.textContent?.trim().split('Phim quốc gia')?.[1]?.trim() || ''
      presenceData.state = `Phim: ${Region}`
    }
    else if (isDetailsPage) {
      const fullTitle = document.querySelector('head > title')?.textContent?.trim() || ''
      const titleAfterPrefix = fullTitle.split('Phim')?.[1]?.trim() || fullTitle.split('Xem Phim')?.[1]?.trim() || ''
      presenceData.details = 'Định xem phim...'
      presenceData.state = titleAfterPrefix
      presenceData.largeImageKey = dynamicBannerUrl
    }
    if (isPlayback) {
      // get jwplayer
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
        presenceData.details = `${movieName}`
        presenceData.state = `Tập ${episodeNumberStr} - ⭐ ${Rating} - 🗓️ ${yearOfMovie}`
        if (showButtons) {
          presenceData.buttons = [
            {
              label: '📺 Xem Phim',
              url: document.location.href,
            },
          ]
        }
      }
    }
    // get iFrame
    else if (iFrameVideo && showTimestamps && !Number.isNaN(duration)) {
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? (await strings).pause : (await strings).play

      if (!paused && !Number.isNaN(currentTime)) {
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
      presenceData.state = `Tập ${episodeNumberStr} - ⭐ ${Rating} - 🗓️ ${yearOfMovie}`
      if (showButtons) {
        presenceData.buttons = [
          {
            label: '📺 Xem Phim',
            url: document.location.href,
          },
        ]
      }
    }

    presence.setActivity(presenceData)
  }
  catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error)
  }
}

presence.on('UpdateData', updatePresence)
