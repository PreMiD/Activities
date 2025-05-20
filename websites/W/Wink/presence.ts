import type { VideoData } from './utils/utils.js'
import { ActivityType, Assets, getTimestamps } from 'premid'
import { getImage, getTextContent, getVideoContent } from './utils/utils.js'

const presence = new Presence({
  clientId: '1373849674980528290',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/4mPGGrk.png',
}

let video: VideoData | null = null
presence.on('iFrameData', (data: VideoData) => {
  video = data
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [privacy, logo, buttons, time] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('logo'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('time'),
  ])
  const currentHeader = getTextContent('header a.i1hf71lu.inyg6eq')
  const title = getTextContent('.lltcpd8.ld9ti8i') || 'Неизвестно'
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  if (currentHeader) {
    presenceData.details = 'Смотрит раздел'
    presenceData.state = currentHeader
    presenceData.smallImageKey = Assets.Viewing
  }

  presenceData.buttons = [
    {
      label: 'Открыть страницу',
      url: href,
    },
  ]

  switch (pathList[0]) {
    case 'tv':
      if (!pathList[1]) {
        break
      }

      presenceData.details = 'Смотрит о ТВ-канале'
      presenceData.state = title

      if (pathList[2] && pathList[2] === 'player') {
        if (!privacy) {
          presenceData.details = getTextContent('.r1lbxtse.r2wuh73')
          presenceData.state = getTextContent('.r1lbxtse.reg964v')
        }
        else {
          presenceData.details = 'Смотрит ТВ-канал'
        }

        if (!video) {
          video = getVideoContent('video')
        }

        if (video) {
          presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        }
      }
      break
    case 'persons':
      if (!pathList[1]) {
        break
      }

      presenceData.details = 'Смотрит о человеке'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.state = title
      break
    case 'collections':
      if (!pathList[1]) {
        break
      }

      presenceData.details = 'Смотрит подборку'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.state = title

      if (!privacy && logo) {
        const image = getImage('.h1ozwylq img')
        if (image) {
          presenceData.largeImageKey = image
          presenceData.smallImageKey = ActivityAssets.Logo
        }
      }
      break
    case 'search':
      presenceData.details = 'В поиске'
      presenceData.smallImageKey = Assets.Search

      if (!privacy) {
        const inputValue = document.querySelector<HTMLInputElement>('.i1bb00ut')?.value
        const searchType = getTextContent('.iqzy5e5.ibs3wg5.i3byvia')
        if (inputValue) {
          presenceData.state = inputValue
          if (searchType) {
            presenceData.state += ` – ${searchType}`
          }
        }
      }
      break
    case 'my':
      presenceData.details = 'Смотрит свой профиль'
      presenceData.state = getTextContent('.lltcpd8.ld9ti8i')
      presenceData.smallImageKey = Assets.Viewing

      if (pathList[1] === 'journal') {
        presenceData.state += ` – ${getTextContent('.r11w5ir7.rq58l1q .r1lbxtse')}`
      }
      break
    case 'movies':
    case 'series':
    case 'episodes':
      if (!pathList[1] || pathList[1] === 'catalog') {
        break
      }

      presenceData.details = `Смотрит о ${pathList[0] === 'movies' ? 'фильме' : 'сериале'}`
      presenceData.state = title

      if (!privacy && logo) {
        const image = getImage('picture.b11ck05s.b1nt63x3 img')
        if (image) {
          presenceData.largeImageKey = image
          presenceData.smallImageKey = ActivityAssets.Logo
        }
      }

      if (pathList[2] && pathList[2] === 'player') {
        (presenceData as PresenceData).type = ActivityType.Watching
        video = getVideoContent('video')

        if (video) {
          if (!privacy) {
            presenceData.details = video.title
          }
          else {
            presenceData.details = `Смотрит ${pathList[0] === 'movies' ? 'фильм' : 'сериал'}`
          }
          if (!privacy && logo && video?.poster) {
            presenceData.largeImageKey = video?.poster
          }
          delete presenceData.state
          presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play

          if (video.currentTime && video.duration) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)
          }

          if (video.paused) {
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }
        }
      }
      break
  }

  if (!time) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (privacy) {
    delete presenceData.state
    if (!buttons) {
      delete presenceData.buttons
    }
  }

  presence.setActivity(presenceData)
})
