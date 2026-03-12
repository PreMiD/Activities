import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1133347072200949770',
})

let prevData = ''
let animeData: detail = {}
let animeDataEpisode: episode = {}

interface detail {
  id?: string
  name?: string
  img?: string
  is_ending?: boolean
  animation_info?: {
    air_year_quarter?: string
  }
  meta_info?: {
    avg_rating?: string
  }
}

interface episode {
  id?: string
  title?: string
  subject?: string
  episode_num?: string
}

presence.on('UpdateData', async () => {
  const { pathname, search } = document.location
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/%23/%EB%9D%BC%ED%94%84%ED%85%94/assets/logo.jpg',
  }

  if (pathname === '/') {
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = '둘러보는중'
    presenceData.details = '홈'
  }
  else if (pathname.startsWith('/search')) {
    presenceData.details = '라프텔 검색'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = '검색중'
    presenceData.state = `"${getQuery().keyword}"`
  }
  else if (pathname.match(/^\/item\/\d/)) {
    if (prevData === pathname && animeData.name) {
      presenceData.details = animeData.name
      presenceData.largeImageKey = animeData.img
      presenceData.smallImageKey = Assets.VideoCall
      presenceData.smallImageText = animeData.is_ending ? '완결작품' : '방영중'
      presenceData.state = animeData.animation_info?.air_year_quarter

      presenceData.buttons = [
        {
          label: '감상하기',
          url: `https://laftel.net/item/${animeData.id}`,
        },
        {
          label: `별점 ${animeData.meta_info?.avg_rating}점`,
          url: `https://laftel.net/item/${animeData.id}/review`,
        },
      ]
    }
    else {
      prevData = pathname
      animeData = await (
        await fetch(
          `https://laftel.net/api/v1.0/items/${pathname.split('/')[2]}/detail/`,
          {
            headers: {
              laftel: 'TeJava',
            },
          },
        )
      ).json()

      presenceData.details = animeData.name
      presenceData.largeImageKey = animeData.img
      presenceData.smallImageKey = Assets.VideoCall
      presenceData.smallImageText = animeData.is_ending ? '완결작품' : '방영중'
      presenceData.state = animeData.animation_info?.air_year_quarter

      presenceData.buttons = [
        {
          label: '감상하기',
          url: `https://laftel.net/item/${animeData.id}`,
        },
        {
          label: `별점 ${animeData.meta_info?.avg_rating}점`,
          url: `https://laftel.net/item/${animeData.id}/review`,
        },
      ]
    }
  }
  else if (pathname.match(/\/player\/\d*\/\d/)) {
    const video = document.querySelector<HTMLVideoElement>('video')
    if (video && !Number.isNaN(video.duration)) {
      if (prevData !== pathname) {
        prevData = pathname
        animeDataEpisode = await (
          await fetch(
            `https://laftel.net/api/episodes/v1/${pathname.split('/')[3]}`,
            {
              headers: {
                laftel: 'TeJava',
              },
            },
          )
        ).json()
      }

      if (!animeData.id) {
        animeData = await (
          await fetch(
            `https://laftel.net/api/v1.0/items/${
              pathname.split('/')[2]
            }/detail/`,
            {
              headers: {
                laftel: 'TeJava',
              },
            },
          )
        ).json()
      }

      presenceData.details = `${animeDataEpisode.title}`
      presenceData.state = `${animeDataEpisode.episode_num}화 ${animeDataEpisode.subject}`
      presenceData.largeImageKey = animeData.img

      presenceData.buttons = [
        {
          label: '자세히 보기',
          url: `https://laftel.net/item/${animeData.id}`,
        },
        {
          label: `${animeDataEpisode.episode_num}화 감상하기`,
          url: `https://laftel.net/player/${animeData.id}/${animeDataEpisode.id}`,
        },
      ]
      if (
        video.currentTime > 0
        && !video.paused
        && !video.ended
        && video.readyState > 2
      ) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = '재생중'
      }
      else {
        presenceData.state = '일시 정지됨'
        presenceData.smallImageKey = Assets.Pause
      }
    }
  }

  presence.setActivity(presenceData)

  function getQuery() {
    return JSON.parse(
      `{"${decodeURI(search.substring(1))
        .replaceAll('"', '\\"')
        .replaceAll('&', '","')
        .replaceAll('=', '":"')}"}`,
    )
  }
})
