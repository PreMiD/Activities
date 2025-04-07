import { Assets } from 'premid'

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

presence.on('UpdateData', async () => {
  const playback = !!document.querySelector('#title')
    || (document.querySelectorAll('video').length
      && document.querySelectorAll('video')[0]?.className !== 'previewVideo')
  const { pathname, href } = document.location
  const [newLang, buttons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('buttons'),
  ])
  const splitPath = pathname.split('/')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Animevietsub/assets/logo.jpeg',
    startTimestamp: browsingTimestamp,
  }

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (!playback) {
    switch (splitPath[1]) {
      case 'anime-bo':
      case 'anime-sap-chieu':
      case 'anime-le':
      case 'danh-sach':
      case 'hoat-hinh-trung-quoc': {
        presenceData.details = 'Đang chọn phim'
        presenceData.buttons = [
          {
            label: 'Xem Phim',
            url: href,
          },
        ]
        break
      }
      case '': {
        presenceData.details = 'Đang xem trang chủ...'
        break
      }
      case 'tim-kiem': {
        presenceData.details = 'Đang tìm kiếm...'
        break
      }
      case 'the-laoi': {
        presenceData.details = 'Đang chọn thể loại phim'
        break
      }
      case 'tu-phim': {
        presenceData.details = 'Đang xem danh sách đã lưu trong hộp phim'
        break
      }
      case 'season': {
        presenceData.details = 'Đang chọn mùa phim'
        presenceData.buttons = [
          {
            label: 'Xem Phần',
            url: href,
          },
        ]
        break
      }
      case 'bang-xep-hang': {
        presenceData.details = 'Đang xem bảng xếp hạng anime'
        break
      }
      case 'phim': {
        presenceData.details = `Định xem phim ${
          document.querySelector<HTMLAnchorElement>('.Title')?.textContent
        }`
        presenceData.buttons = [
          {
            label: 'Xem Phim',
            url: href,
          },
        ]
        break
      }
      case 'quen-mat-khau.html': {
        presenceData.details = 'Đang bị quên mật khẩu kek.'
        break
      }
      case '/lich-chieu-phim.html': {
        presenceData.details = 'Đang xem lịch chiếu anime'
        break
      }
      case 'anime':
      case 'account': {
        switch (splitPath[2]) {
          case 'info': {
            presenceData.details = 'Đang xem profile...'
            break
          }
          case 'login': {
            presenceData.details = 'Đang đăng nhập...'
            break
          }
          case 'register': {
            presenceData.details = 'Đang đăng ký...'
            break
          }
          case 'library': {
            presenceData.details = 'Đang xem thử viện alime'
            presenceData.buttons = [
              {
                label: 'Xem Thư Viện Anime',
                url: href,
              },
            ]
            break
          }
        }
        break
      }
      default: {
        presenceData.details = 'Đang xem trang chủ...'
        break
      }
    }
  }
  else {
    const [video] = document.querySelectorAll('video')

    if (video && !Number.isNaN(video.duration)) {
      delete presenceData.startTimestamp
      const [titleArrOne] = (
        document.querySelectorAll('.Title')
          ? document.querySelector('.Title')?.textContent
          : 'Không tìm thấy còn cặc - Tập ?'
      )?.split(' - ') ?? []
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? strings.pause : strings.play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)

      presenceData.details = `Đang xem: ${titleArrOne} `
      presenceData.state = `Tập: ${
        document.querySelector<HTMLAnchorElement>('.episode.playing')
          ?.textContent
      }`
      presenceData.buttons = [
        {
          label: 'Xem Phim',
          url: href,
        },
      ]
      if (video.paused)
        delete presenceData.endTimestamp
    }
  }
  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
