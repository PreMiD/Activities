import { Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1016991973531451502',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

async function getStrings() {
  return presence.getStrings(
    {
      pause: 'general.paused',
      play: 'general.playing',
    },
  )
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Animevietsub/assets/logo.jpeg',
}

async function updatePresence() {
  try {
    const video = document.querySelector('video')
    const playback = !!document.querySelector('#title') || (video && video.className !== 'previewVideo')

    const { pathname } = document.location
    const splitPath = pathname.split('/')

    const [newLang, showButtons, usePresenceName] = await Promise.all([
      presence.getSetting<string>('lang').catch(() => 'en'),
      presence.getSetting<boolean>('buttons'),
      presence.getSetting<boolean>('usePresenceName'),
    ])

    if (oldLang !== newLang || !strings) {
      oldLang = newLang
      strings = await getStrings()
    }

    const presenceData: PresenceData = {
      type: 3,
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
    }

    if (!playback) {
      const pathMap: Record<string, string> = {
        'lich-chieu-phim.html': 'Đang xem Lịch chiếu phim',
        'tu-phim': 'Đang xem Tủ phim',
        'lich-su': 'Đang xem Lịch sử phim',
      }

      presenceData.details = pathMap[splitPath[1] ?? ''] ?? 'Đang ở Trang chủ'
      presenceData.smallImageKey = Assets.Viewing

      if (['anime-bo', 'anime-le', 'hoat-hinh-trung-quoc', 'danh-sach', 'anime-sap-chieu'].includes(splitPath[1] || '')) {
        const spanElement = document.querySelector<HTMLSpanElement>('.ml-title-page span')
        const getSpanText = spanElement?.textContent?.trim() ?? ''
        const getText = getSpanText.split('Danh Sách')?.[1]?.trim()
        presenceData.details = 'Đang duyệt anime...'
        presenceData.state = `Duyệt theo - ${getText}`
      }

      if (splitPath[1] === 'season') {
        const getSeasonText = document.querySelector<HTMLSpanElement>('.ml-title.ml-title-page span')?.textContent?.trim() ?? ''
        const seasonText = getSeasonText.split(': Mùa')?.[1]?.trim() || 'Không xác định'

        presenceData.details = 'Đang duyệt anime theo mùa 📅'
        presenceData.state = `Mùa: ${seasonText} 🗓️`
      }

      if (splitPath[1] === 'tim-kiem') {
        const getsearchText = document.querySelector<HTMLSpanElement>('.ml-title.ml-title-page span')?.textContent?.trim()
        const searchText = getsearchText?.split('Kết quả tìm kiếm')?.[1]?.trim()
        presenceData.details = ` Đang tìm kiếm anime... 🔎`
        presenceData.state = searchText ? `Kết quả: ${searchText}` : `Không tìm thấy kết quả`
        presenceData.smallImageKey = Assets.Search
      }

      if (splitPath[1] === 'anime') {
        const getText = document.querySelector<HTMLSpanElement>('.ml-title.ml-title-page span')?.textContent?.trim()
        presenceData.details = ' Đang duyệt anime...'
        presenceData.state = `${getText}`
      }

      if (splitPath[1] === 'bang-xep-hang' || splitPath[1] === 'bang-xep-hang.html') {
        const rankingHeader = document.querySelector<HTMLSpanElement>('.title-list-index')
        if (rankingHeader) {
          const getText = rankingHeader.textContent?.toLowerCase().split('bảng xếp hạng')?.[1]?.trim()
          const formattedText = getText && getText.length > 0
            ? getText.charAt(0).toUpperCase() + getText.slice(1)
            : 'Thông tin không có sẵn'
          presenceData.details = 'Đang xem bảng xếp hạng... 📊'
          presenceData.state = `Xếp hạng - ${formattedText}`
        }
      }

      if (splitPath[1] === 'the-loai') {
        const getCategoryText = document.querySelector<HTMLSpanElement>('.ml-title-page span')?.textContent?.trim() ?? ''
        const getText = getCategoryText.split('Danh Sách Anime Thuộc Thể Loại ')?.[1]?.trim()
        presenceData.details = 'Đang duyệt Anime theo thể loại📂'
        presenceData.state = `Thể loại - ${getText}`
      }

      if (splitPath[1] === 'account') {
        const accountMap: Record<string, string> = {
          info: 'Đang xem profile...',
          login: 'Đang đăng nhập...',
          register: 'Đang đăng ký...',
        }

        const accountState = accountMap[splitPath[2] ?? ''] ?? 'Đang ở trang tài khoản...'
        presenceData.details = accountState
      }
      if (splitPath[1] === 'phim') {
        const imageLink = document.querySelector('figure.Objf img.wp-post-image') as HTMLImageElement
        const name = document.querySelector<HTMLAnchorElement>('.Title')?.textContent

        presenceData.details = 'Định xem phim...'
        presenceData.state = `Tên phim: ${name}`
        presenceData.largeImageKey = imageLink
      }
    }
    else {
      const [video] = document.querySelectorAll('video')
      const [titleArrOne] = (
        document.querySelectorAll('.Title')
          ? document.querySelector('.Title')?.textContent
          : 'N/A'
      )?.split(' - ') ?? []
      const imageLink = (document.querySelector('div.TPostBg.Objf > img') as HTMLImageElement)?.src
      const rating = document.querySelector('#average_score')?.textContent?.trim()
      const linkElement = document.querySelector('span.Date.AAIco-date_range a')
      const year = linkElement && linkElement.textContent ? linkElement.textContent.trim() : null

      if (video) {
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused ? strings.pause : strings.play

        if (!Number.isNaN(video.currentTime) && !Number.isNaN(video.duration) && video.duration > 0) {
          if (!video.paused) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
              video.currentTime,
              video.duration,
            )
          }
          else {
            delete presenceData.endTimestamp
          }
        }

        const durationInSeconds = video.duration
        const minutes = Math.floor(durationInSeconds / 60)
        const seconds = Math.floor(durationInSeconds % 60)

        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`

        presenceData.largeImageKey = imageLink

        if (!usePresenceName) {
          presenceData.details = `${titleArrOne}`
          presenceData.state = `Tập ${document.querySelector<HTMLAnchorElement>('.episode.playing')
          ?.textContent
          } - ⭐ ${rating} 🕒 ${formattedDuration} 🗓️ ${year}`
        }
        else {
          presenceData.name = `${titleArrOne}`
          presenceData.details = `Animevietsub`
          presenceData.state = `Tập ${document.querySelector<HTMLAnchorElement>('.episode.playing')
          ?.textContent
          } - ⭐ ${rating} 🕒 ${formattedDuration} 🗓️ ${year}`
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
    }
    presence.setActivity(presenceData)
  }
  catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error)
  }
}

presence.on('UpdateData', updatePresence)
