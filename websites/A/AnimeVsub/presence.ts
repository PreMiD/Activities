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
  const playback = !!document.querySelector('#title')
    || (document.querySelectorAll('video').length
      && document.querySelector('video')?.className !== 'previewVideo')

  const { pathname } = document.location
  const [newLang] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('buttons'),
  ])
  const splitPath = pathname.split('/')
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (!playback) {
    switch (splitPath[1]) {
      case 'danh-sach':
        presenceData.details = 'Đang xem danh sách phim'
        break
      case 'lich-chieu-phim':
        presenceData.details = 'Đang xem lịch chiếu phim'
        break
      case 'bang-xep-hang':
        presenceData.details = 'Đang xem bảng xếp hạng'
        break
      default:
        presenceData.details = 'Đang ở trang chủ'
        break
    }
  }
  else {
    if (splitPath[1] === 'phim') {
      try {
        const titleElement = document.querySelector<HTMLHeadingElement>(
          'h1.line-clamp-2.text-weight-medium',
        )
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

        const video = document.querySelector('video')

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

            if (!video.paused) {
              // presenceData.endTimestamp = endTimestamp
            }
            else {
              delete presenceData.endTimestamp
            }
          }
        }

        presenceData.details = titleElement?.textContent || 'Đang xem...'
        presenceData.state = `Tập: ${animeEpisode ?? 1}`
        presenceData.largeImageKey = video?.poster || ActivityAssets.Logo
        presenceData.buttons = [
          {
            label: '📺Xem Phim',
            url: window.location.href,
          },
        ]
      }
      catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error)
      }
    }
  }
  presence.setActivity(presenceData)
}

presence.on('UpdateData', updatePresence)
