import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1109528360746504222',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

enum ActivityAssets {
  Logo = 'https://movie.anikenji.xyz/images/webfilm-logo.png',
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
  const isDetailsPage = splitPath.length === 3 && splitPath[1] === 'phim'
  const isWatchingPage = splitPath.length >= 4 && splitPath[1] === 'phim' && splitPath[3]?.startsWith('tap-')

  // Xử lý các kiểu trang khác nhau
  if (isHomePage) {
    presenceData.details = 'Đang xem trang chủ'
  }
  else if (isCategoryPage) {
    presenceData.details = 'Đang xem danh mục:'
    const categoryText = document.querySelector('body > div.box-width > div.title > div.title-left > h4')?.textContent?.trim().split('Phim thể loại')?.[1]?.trim() || ''
    presenceData.state = `Thể loại: ${categoryText}`
  }
  else if (isDetailsPage) {
    // Trang chi tiết phim
    const fullTitle = document.querySelector('head > title')?.textContent?.trim() || ''
    const titleAfterPrefix = fullTitle.split('Phim')?.[1]?.trim() || fullTitle.split('Xem Phim')?.[1]?.trim() || ''
    presenceData.details = 'Định xem phim...'
    presenceData.state = titleAfterPrefix

    // Lấy thumbnail nếu có
    const bannerLink = document.querySelector('.ds-vod-detail .this-pic-bj') as HTMLImageElement
    if (bannerLink && bannerLink.src) {
      presenceData.largeImageKey = bannerLink.src
    }
  }
  else if (isWatchingPage) {
    // Trang xem phim
    /*
    const fullTitle = document.querySelector('head > title')?.textContent?.trim() || ''
    const titleAfterPrefix = fullTitle.split('Phim')?.[1]?.trim() || fullTitle.split('Xem Phim')?.[1]?.trim() || ''
    const episodeIndex = titleAfterPrefix.toLowerCase().indexOf('tập')
    const MovieName = episodeIndex > -1 ? titleAfterPrefix.substring(0, episodeIndex).trim() : titleAfterPrefix
    const episodeInfo = episodeIndex > -1 ? `Tập ${titleAfterPrefix.substring(episodeIndex + 3).trim()}` : ''
    */

    const movieName = document.querySelector('body > div.box-width > div.player-info > div.player-info-text > div.title > h2 > a > span')?.textContent?.trim() || ''
    const fullTitle = document.querySelector('body > div.box-width > div.player-info > div.player-info-text > div.title > h2')?.textContent?.trim() || ''
    // Ví dụ: fullTitle = "Tên Phim Gì Đó Chi tiết Tập 15"
    // 2. Khai báo biến để lưu số tập đã lọc
    let episodeNumberStr = ''
    // 3. Dùng Regex để tìm và lọc số tập
    const regex = /[Tt]ập\s*(\d+)/ // Tìm "Tập" hoặc "tập", theo sau bởi số
    const match = fullTitle.match(regex)
    // 4. Lấy số từ kết quả khớp (nếu có)
    if (match && match[1]) {
      episodeNumberStr = match[1] // Chỉ lấy phần số, ví dụ: "15"
    }
    // const Episode = document.querySelector('body > div.box-width > div.player-info > div.player-info-text > div.title > h2')?.textContent?.trim() || ''

    // Kiểm tra xem có video đang phát không (từ iframe)
    if (iFrameVideo && !Number.isNaN(duration)) {
      // Có video từ iframe
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
        // Xóa timestamps nếu video đang tạm dừng
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
        presenceData.startTimestamp = browsingTimestamp
      }

      presenceData.details = `${movieName}`
      presenceData.state = `Tập ${episodeNumberStr}`
    }
    else {
      // Đang ở trang xem phim nhưng chưa phát video hoặc không tìm thấy video
      presenceData.details = `Chuẩn bị xem: ${movieName}`
      presenceData.state = `Tập ${episodeNumberStr}`
    }

    // Thêm nút xem phim
    presenceData.buttons = [
      {
        label: '📺 Xem Phim',
        url: document.location.href,
      },
    ]
  }
  else if (
    document.querySelector(
      'body > div.container > div:nth-child(3) > div > div.movie-info > div > div.block-wrapper.page-single > div > div.block-movie-info.movie-info-box > div > div.col-6.movie-detail > h1 > span.title-1',
    )
  ) {
    // Trang chi tiết phim (selector cụ thể)
    presenceData.details = 'Đang xem:'
    presenceData.state = document.querySelector(
      'body > div.container > div:nth-child(3) > div > div.movie-info > div > div.block-wrapper.page-single > div > div.block-movie-info.movie-info-box > div > div.col-6.movie-detail > h1 > span.title-1',
    )?.textContent ?? ''
    presenceData.smallImageKey = Assets.Reading
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
