import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1016991973531451502',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

async function getStrings(): Promise<{ pause: string, play: string }> {
  return presence.getStrings({
    pause: 'general.paused',
    play: 'general.playing',
  })
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Animevietsub/assets/logo.jpeg',
}

async function updatePresence(): Promise<void> {
  try {
    const video = document.querySelector<HTMLVideoElement>('video')
    const isPlayback = !!document.querySelector('#title') || (video && video.className !== 'previewVideo')
    const { pathname } = document.location
    const splitPath = pathname.split('/')

    const [
      newLang,
      showButtons,
      usePresenceName,
      showTimestamps,
    ] = await Promise.all([
      presence.getSetting<string>('lang').catch(() => 'en'),
      presence.getSetting<boolean>('buttons'),
      presence.getSetting<boolean>('usePresenceName'),
      presence.getSetting<boolean>('showtimestamps'),
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

    if (!isPlayback) {
      const pathMap: Record<string, string> = {
        'lich-chieu-phim.html': 'Đang xem Lịch chiếu phim',
        'tu-phim': 'Đang xem Tủ phim',
        'lich-su': 'Đang xem Lịch sử phim',
      }

      presenceData.details = pathMap[splitPath[1] || ''] ?? 'Đang ở Trang chủ'
      presenceData.smallImageKey = Assets.Viewing

      if (['anime-bo', 'anime-le', 'hoat-hinh-trung-quoc', 'danh-sach', 'anime-sap-chieu'].includes(splitPath[1] || '')) {
        const spanElement = document.querySelector<HTMLSpanElement>('.ml-title-page span')
        const getText = spanElement?.textContent?.trim().split('Danh Sách')?.[1]?.trim() || ''
        presenceData.details = 'Đang duyệt anime...'
        presenceData.state = `Duyệt theo - ${getText}`
      }

      if (splitPath[1] === 'season') {
        const seasonSpan = document.querySelector<HTMLSpanElement>('.ml-title.ml-title-page span')
        const seasonText = seasonSpan?.textContent?.trim().split(': Mùa')?.[1]?.trim() || 'Không xác định'
        presenceData.details = 'Đang duyệt anime theo mùa 📅'
        presenceData.state = `Mùa: ${seasonText} 🗓️`
      }

      if (splitPath[1] === 'tim-kiem') {
        const searchSpan = document.querySelector<HTMLSpanElement>('.ml-title.ml-title-page span')
        const searchText = searchSpan?.textContent?.trim().split('Kết quả tìm kiếm')?.[1]?.trim()
        presenceData.details = 'Đang tìm kiếm anime... 🔎'
        presenceData.state = searchText ? `Kết quả: ${searchText}` : 'Không tìm thấy kết quả'
        presenceData.smallImageKey = Assets.Search
      }

      if (splitPath[1] === 'anime') {
        const animeSpan = document.querySelector<HTMLSpanElement>('.ml-title.ml-title-page span')
        const animeTitle = animeSpan?.textContent?.trim() || 'N/A'
        presenceData.details = 'Đang duyệt anime...'
        presenceData.state = animeTitle
      }

      if (splitPath[1] === 'bang-xep-hang' || splitPath[1] === 'bang-xep-hang.html') {
        const rankingHeader = document.querySelector<HTMLSpanElement>('.title-list-index')
        if (rankingHeader) {
          const rawText = rankingHeader.textContent?.toLowerCase().split('bảng xếp hạng')?.[1]?.trim() || ''
          const formattedText = rawText ? rawText.charAt(0).toUpperCase() + rawText.slice(1) : 'Thông tin không có sẵn'
          presenceData.details = 'Đang xem bảng xếp hạng... 📊'
          presenceData.state = `Xếp hạng - ${formattedText}`
        }
      }

      if (splitPath[1] === 'the-loai') {
        const categorySpan = document.querySelector<HTMLSpanElement>('.ml-title-page span')
        const categoryText = categorySpan?.textContent?.trim().split('Danh Sách Anime Thuộc Thể Loại ')?.[1]?.trim() || ''
        presenceData.details = 'Đang duyệt Anime theo thể loại📂'
        presenceData.state = `Thể loại - ${categoryText}`
      }

      if (splitPath[1] === 'account') {
        const accountMap: Record<string, string> = {
          info: 'Đang xem profile...',
          login: 'Đang đăng nhập...',
          register: 'Đang đăng ký...',
        }
        presenceData.details = accountMap[splitPath[2] || ''] ?? 'Đang ở trang tài khoản...'
      }

      if (splitPath[1] === 'phim') {
        const bannerLink = document.querySelector<HTMLImageElement>('figure.Objf img.wp-post-image')
        const name = document.querySelector<HTMLAnchorElement>('.Title')?.textContent || 'N/A'
        presenceData.details = 'Định xem phim...'
        presenceData.state = name
        if (bannerLink && bannerLink.src) {
          presenceData.largeImageKey = bannerLink.src
        }
      }
    }
    else if (video) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? strings.pause : strings.play

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

      const thumbnailLink = (document.querySelector<HTMLImageElement>('div.TPostBg.Objf > img'))?.src
      if (thumbnailLink) {
        presenceData.largeImageKey = thumbnailLink
      }

      const durationInSeconds = video.duration
      const minutes = Math.floor(durationInSeconds / 60)
      const seconds = Math.floor(durationInSeconds % 60)
      const formattedDuration
        = minutes < 60
          ? `${minutes}:${seconds.toString().padStart(2, '0')}`
          : (() => {
              const hours = Math.floor(minutes / 60)
              const remainingMinutes = minutes % 60
              return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            })()

      const titleText = document.querySelector<HTMLAnchorElement>('.Title')?.textContent || 'N/A'
      const [title] = titleText.split(' - ')
      const episodeElement = document.querySelector<HTMLAnchorElement>('.episode.playing')
      let animeEpisode: number | string = 'Unknown'
      if (episodeElement?.textContent) {
        const raw = episodeElement.textContent.trim().toLowerCase()
        if (raw.includes('xem full')) {
          animeEpisode = 'Movie/(OVA)'
        }
        else {
          const match = raw.match(/\d+/)
          if (match) {
            animeEpisode = Number.parseInt(match[0], 10)
          }
        }
      }

      const rating = document.querySelector('#average_score')?.textContent?.trim() || 'N/A'
      const year = document.querySelector<HTMLAnchorElement>('span.Date.AAIco-date_range a')?.textContent?.trim() || 'N/A'

      if (!usePresenceName) {
        presenceData.details = title
        presenceData.state = `Tập ${animeEpisode} - ⭐ ${rating} 🕒 ${formattedDuration} 🗓️ ${year}`
      }
      else {
        presenceData.name = title
        presenceData.details = 'Animevietsub'
        presenceData.state = `Tập ${animeEpisode} - ⭐ ${rating} 🕒 ${formattedDuration} 🗓️ ${year}`
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

    presence.setActivity(presenceData)
  }
  catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error)
  }
}

presence.on('UpdateData', updatePresence)
