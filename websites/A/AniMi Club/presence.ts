import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniMi%20Club/assets/logo.png',
}

interface VideoData {
  duration: number
  currentTime: number
  paused: boolean
}

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    viewPage: 'general.viewPage',
    page: 'general.page',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let video: VideoData = {
  duration: 0,
  currentTime: 0,
  paused: true,
}

presence.on('iFrameData', (data: unknown) => {
  video = data as typeof video
})

presence.on('UpdateData', async () => {
  const [privacy, time] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
  ])
  const presenceData: PresenceData = {
    details: 'Где-то на сайте',
    largeImageKey: ActivityAssets.Logo,
    smallImageText: 'AniMi Club',
    name: 'AniMi Club',
  }

  if (!strings)
    strings = await getStrings()

  const typeCurrent = document
    .querySelector('meta[property=\'og:url\']')
    ?.getAttribute('content')
    ?.split('/')[3] === 'anime'
    ? 'аниме'
    : 'манга'

  if (document.location.pathname === '/') {
    presenceData.details = 'На главной странице'
  }
  else if (document.location.pathname.match(/\/(anime|manga)\//)) {
    const title = document
      .querySelector('meta[property=\'og:title\']')
      ?.getAttribute('content') ?? 'Неизвестное название'

    presenceData.details = `Смотрит страницу ${typeCurrent}`

    if (!privacy) {
      presenceData.state = `«${title}»`

      presenceData.buttons = [
        {
          label: 'Смотреть страницу',
          url: document
            .querySelector('meta[property=\'og:url\']')
            ?.getAttribute('content') || '',
        },
      ]
    }

    if (video.duration) {
      presenceData.smallImageKey = video.paused ? Assets.Play : Assets.Pause
      presenceData.smallImageText = video.paused ? strings.play : strings.pause

      if (time) {
        if (video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        else {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
        }
      }
    }
  }

  presence.setActivity(presenceData)
})
