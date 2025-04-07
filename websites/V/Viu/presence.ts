import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '815947069117169684',
})
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browse: 'general.browsing',
      episode: 'general.episode',
      searchSomething: 'general.searchSomething',
      watchVideo: 'general.buttonWatchVideo',
      viewPage: 'general.viewPage',
      viewingShow: 'general.viewShow',
      viewingMovie: 'general.viewMovie',
      watchMovie: 'general.buttonWatchMovie',
      watchEpisode: 'general.buttonViewEpisode',
      searching: 'general.search',
    },

  )
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

let strings: Awaited<ReturnType<typeof getStrings>>
let oldPath: string | null = null
let oldLang: string | null = null
let seriesInfo: SeriesInfo[] | null = null
let isWatingForResponse = false

async function getSeriesInfo(
  id: string,
  request: '/product/listall' | '/vod/product-list',
): Promise<SeriesInfo[]> {
  isWatingForResponse = true

  const params = new URLSearchParams({
    platform_flag_label: 'web',
    area_id: '2',
    language_flag_id: '3',
    platformFlagLabel: 'web',
    areaId: '2',
    languageFlagId: '3',
    countryCode: location.pathname.split('/')[2]!.toUpperCase(),
    ut: '0',
    r: request,
    series_id: id,
    product_id: id,
    os_flag_id: '1',
  }).toString()

  const token = await generateToken()
  const resp = await fetch(
    `https://api-gateway-global.viu.com/api/mobile?${params}`,
    {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
      },
      method: 'GET',
    },
  )

  return resp.json().then((x) => {
    isWatingForResponse = false

    if (request === '/product/listall')
      return x.data.product
    else return x.data.product_list
  })
}

async function generateToken() {
  const response = await fetch(
    'https://api-gateway-global.viu.com/api/auth/token',
    {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        appVersion: '3.0.10',
        countryCode: location.pathname.split('/')[2]!.toUpperCase(),
        language: 4,
        platform: 'browser',
        platformFlagLabel: 'web',
        uuid: globalThis.crypto.randomUUID(),
      }),
      method: 'POST',
    },
  )

  return response.json().then(x => x.token)
}

// Hack to resolve Deepscan
const no_op = (a: number) => a + 1
no_op(0)
interface SeriesInfo {
  is_movie: number
  series_id: string
  series_name: string
  series_category_name?: string
  series_cover_landscape_image_url?: string
  series_cover_portrait_image_url?: string
  number?: string
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/V/Viu/assets/0.png',
  LogoText = 'https://cdn.rcd.gg/PreMiD/websites/V/Viu/assets/1.png',
}

presence.on('UpdateData', async () => {
  const [newLang, buttonsOn, presenceLogo] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<number>('logo'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (
    (!seriesInfo || oldPath !== location.pathname)
    && location.pathname.includes('/vod/')
    && !isWatingForResponse
  ) {
    oldPath = location.pathname

    const info = await getSeriesInfo(
      location.pathname.split('/')[5]!,
      '/product/listall',
    )
    if (info)
      seriesInfo = await getSeriesInfo(info[0]!.series_id, '/vod/product-list')
  }

  const presenceData: PresenceData = {
    details: strings.browse,
    smallImageKey: Assets.Reading,
    largeImageKey: [ActivityAssets.Logo, ActivityAssets.LogoText, ActivityAssets.Logo, ActivityAssets.Logo][
      presenceLogo
    ],
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  if (document.location.pathname.includes('/vod/')) {
    const video = document.querySelector('video')
    const fullEpisodeName = document.querySelector(
      '.css-330rps #series_ep_title',
    )?.textContent
    const isMovie = !fullEpisodeName

    if (video) {
      let episodeNumber = ''
      let episodeName = ''
      let hasEpName = false
      let part: string[] = []

      if (fullEpisodeName) {
        episodeNumber = fullEpisodeName.split('.')[0]!
        episodeName = fullEpisodeName.split('.').slice(1).join('.')
        hasEpName = !episodeName.includes('EP.')
        part = episodeName.match(/([1-9]\/[1-9])/g) ?? []
      }

      presenceData.details = document.querySelector('#series_title')?.textContent
      if (isMovie) {
        presenceData.state = 'Movie'
      }
      else {
        presenceData.state = `EP.${episodeNumber}${
          part ? ` • ${part[0]} ` : ''
        }${hasEpName ? ` • ${episodeName}` : ''}`
      }

      const coverPortraitImage = seriesInfo?.[0]?.series_cover_portrait_image_url
      const coverLandscapeImage = seriesInfo?.[0]?.series_cover_landscape_image_url

      if (presenceLogo > 1) {
        presenceData.largeImageKey = [
          coverPortraitImage || coverLandscapeImage,
          coverLandscapeImage || coverPortraitImage,
        ][presenceLogo - 2] || ActivityAssets.Logo
      }

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? strings.pause : strings.play;

      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)

      if (buttonsOn) {
        presenceData.buttons = [
          {
            label: isMovie ? strings.watchMovie : strings.watchEpisode,
            url: document.baseURI,
          },
        ]
      }

      if (video.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else {
      presenceData.details = isMovie
        ? strings.viewingMovie
        : strings.viewingShow

      presenceData.state = document.querySelector('#series_title')?.textContent
    }
  }
  else if (
    document.querySelector('input#search_input_txt')
    && document.location.search
  ) {
    presenceData.details = strings.searchSomething

    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.searching
  }

  presence.setActivity(presenceData)
})
