import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1109528360746504222',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

enum ActivityAssets {
  Logo = 'https://phamhung.xyz/images/webfilm-logo512x512.png',
}

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

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  // Phân tích đường dẫn
  const { pathname } = document.location
  const splitPath = pathname.split('/')

  // Xác định kiểu trang
  const isHomePage = pathname === '/'
  const isCategoryPage = pathname.includes('/the-loai')
  const isRegion = pathname.includes('/quoc-gia')
  const isDetailsPage = splitPath.length === 3 && splitPath[1] === 'phim'
  const isWatchingPage = splitPath.length >= 4 && splitPath[1] === 'phim' && splitPath[3]?.startsWith('tap-')
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

  // Xử lý các kiểu trang khác nhau
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
    const bannerLink = document.querySelector('.ds-vod-detail .this-pic-bj') as HTMLImageElement
    if (bannerLink && bannerLink.src) {
      presenceData.largeImageKey = bannerLink.src
    }
  }
  else if (isWatchingPage) {
    if (iFrameVideo && showTimestamps && !Number.isNaN(duration)) {
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
      presenceData.details = `${movieName}`
      presenceData.state = `Tập ${episodeNumberStr} - ⭐ ${Rating} - 🗓️ ${yearOfMovie}`
    }
    else {
      presenceData.details = `${movieName}`
      presenceData.state = `Tập ${episodeNumberStr} - ⭐ ${Rating} - 🗓️ ${yearOfMovie}`
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: '📺 Xem Phim',
          url: document.location.href,
        },
      ]
    }
  }
  else if (
    document.querySelector(
      'body > div.box-width > div.player-info > div.player-info-text > div.title > h2 > a > span',
    )
  ) {
    if (iFrameVideo && showTimestamps && !Number.isNaN(duration)) {
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
      presenceData.details = `${movieName}`
      presenceData.state = `Tập ${episodeNumberStr} - ⭐ ${Rating} - 🗓️ ${yearOfMovie}`
    }
    else {
      presenceData.details = `${movieName}`
      presenceData.state = `Tập ${episodeNumberStr} - ⭐ ${Rating} - 🗓️ ${yearOfMovie}`
    }

    // Thêm nút cho presence
    if (showButtons) {
      presenceData.buttons = [
        {
          label: '📺 Xem Phim',
          url: document.location.href,
        },
      ]
    }
  }
  else {
    // Các trang khác không được xác định cụ thể
    presenceData.details = 'Đang duyệt trang web'
  }

  // Đặt activity nếu có details
  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.setActivity()
})
