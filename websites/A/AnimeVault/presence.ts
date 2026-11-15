import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1521564654491402330',
})

enum ActivityAssets {
  Logo = 'https://files.catbox.moe/ghuz3s.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const video = document.querySelector<HTMLVideoElement>('video')

  const [showButtons, showTimestamps] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamps'),
  ])

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'AnimeVault - bunbongonvl.online',
    startTimestamp: browsingTimestamp,
  }

  const pageFirstTitle = document.title ? (document.title.split('-')[0]?.trim() ?? '') : ''

  switch (true) {
    case pathname.startsWith('/xem/'): {
      const heading = document.querySelector('h1')?.textContent?.trim() || ''
      const cleanTitle = heading.replace(/^(?:Xem Phim|Phim)\s+/i, '') || pageFirstTitle

      presenceData.details = cleanTitle || 'Đang xem phim'

      if (video && !Number.isNaN(video.duration) && video.duration > 0) {
        if (showTimestamps) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            Math.floor(video.currentTime),
            Math.floor(video.duration),
          )
        }

        if (video.paused) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Tạm dừng'
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        else {
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Đang phát'
        }
      }
      else {
        presenceData.state = 'Đang tải trình phát...'
      }

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Cùng Xem Phim Này',
            url: href,
          },
        ]
      }
      break
    }

    case pathname.startsWith('/xem-chung/'): {
      const roomTitle = document.querySelector('.wp-room-header h1')?.textContent?.trim() || 'Phòng chiếu VIP'
      presenceData.details = 'Phòng Xem Chung'
      presenceData.state = roomTitle

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Tham Gia Phòng Chiếu',
            url: href,
          },
        ]
      }
      break
    }

    case pathname === '/xem-chung': {
      presenceData.details = 'Sảnh Xem Chung'
      presenceData.state = 'Tìm kiếm phòng chiếu'
      break
    }

    case pathname.startsWith('/quiz'): {
      presenceData.details = 'Luyện Tập Tiếng Nhật AI'
      presenceData.state = 'Quiz từ vựng Anime'
      break
    }

    case pathname.startsWith('/lich-chieu'): {
      presenceData.details = 'Lịch Chiếu Anime'
      presenceData.state = 'Xem lịch phát sóng'
      break
    }

    case pathname.startsWith('/phim/'): {
      const movieTitle = document.querySelector('h1')?.textContent?.trim() || pageFirstTitle
      presenceData.details = 'Thông tin phim'
      presenceData.state = movieTitle || 'Chi tiết tác phẩm'

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Xem Chi Tiết Phim',
            url: href,
          },
        ]
      }
      break
    }

    default: {
      presenceData.details = 'Khám phá kho phim'
      presenceData.state = 'Trang chủ'
      break
    }
  }

  presence.setActivity(presenceData)
})
