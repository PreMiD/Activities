import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1348239315767132160',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let strings: { pause: string, play: string } | null = null
let oldLang: string | null = null

async function getStrings() {
  const lang = await presence.getSetting<string>('lang').catch(() => 'en')
  return lang === 'vi'
    ? { pause: 'Tạm Dừng', play: 'Đang Phát' }
    : { pause: 'Pause', play: 'Playing' }
}

enum ActivityAssets {
  Logo = 'https://i.imgur.com/GXPcBZj.png',
}

async function updatePresence() {
  try {
    const video = document.querySelector('video')
    const playback = !!document.querySelector('#title')
      || (video && video.className !== 'previewVideo')

    const { pathname } = document.location
    const [newLang, _button] = await Promise.all([
      presence.getSetting<string>('lang').catch(() => 'en'),
      presence.getSetting<boolean>('buttons'),
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

    const splitPath = pathname.split('/')

    if (!playback) {
      const pathMap: Record<string, string> = {
        'danh-sach': 'Đang xem Danh sách phim',
        'lich-chieu-phim': 'Đang xem Lịch chiếu phim',
        'bang-xep-hang': 'Đang xem Bảng xếp hạng',
      }

      presenceData.details = pathMap[splitPath[1] ?? ''] ?? 'Đang ở Trang chủ'

      if (splitPath[1] === 'tim-kiem') {
        const content = document.querySelector<HTMLSpanElement>('span.font-bold.truncate')?.textContent?.trim() ?? ''
        presenceData.details = `Đang tìm kiếm phim: ${content}`
      }

      if (splitPath[1] === 'tai-khoan') {
        const accountPaths: Record<string, string> = {
          follow: 'Đang xem Tủ phim',
          history: 'Đang xem Lịch sử phim',
          setting: 'Đang xem Cài đặt Tài Khoản',
        }
        presenceData.details = accountPaths[splitPath[2] ?? ''] ?? 'Đang ở trang cá nhân'
      }

      if (splitPath[1] === 'playlist') {
        const playlistName = document.querySelector('div[class*="text-[28px]"]')?.childNodes[0]?.textContent?.trim() ?? 'Không rõ'
        const description = document.querySelector('p.flex-1')?.textContent?.trim() ?? 'Không có mô tả'

        presenceData.details = 'Đang ở Playlist'
        presenceData.state = `"${playlistName}" - "${description}"`
      }
    }
    else {
      if (splitPath[1] === 'phim') {
        const titleElement = document.querySelector<HTMLHeadingElement>('h1.line-clamp-2.text-weight-medium')

        const currentURL = pathname
        const episodeElements = document.querySelectorAll('.q-btn-item')

        const episodes = Array.from(episodeElements)
          .map((ep) => {
            const href = ep.getAttribute('href')
            const numMatch = ep.textContent?.trim().match(/\d+/)
            return href && numMatch ? { num: Number.parseInt(numMatch[0]), url: href } : null
          })
          .filter(ep => ep)
          .sort((a, b) => (a?.num ?? 0) - (b?.num ?? 0))

        let animeEpisode: number | null = null
        const currentEpisode = episodes.find(ep => ep && currentURL.includes(ep.url))

        if (currentEpisode) {
          animeEpisode = currentEpisode.num
        }

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
        }

        presenceData.details = titleElement?.textContent || 'Đang xem...'
        presenceData.state = `Tập: ${animeEpisode ?? 'N/A'}`
        presenceData.largeImageKey = video?.poster || ActivityAssets.Logo
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
