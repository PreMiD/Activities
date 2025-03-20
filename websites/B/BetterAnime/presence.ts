import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '839409255979155516',
})
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browse: 'general.browsing',
      searchFor: 'general.searchFor',
      searchSomething: 'general.searchSomething',
      viewEpisode: 'general.buttonViewEpisode',
      viewAnime: 'general.viewAnime',
      viewSeries: 'general.buttonViewSeries',
      viewAccount: 'general.viewAccount',
      viewMovie: 'general.viewMovie',
      buttonViewMovie: 'general.buttonViewMovie',
      watchMovie: 'general.watchingMovie',
      watchSeries: 'general.watchingSeries',
    },
  )
}
const data: {
  oldLang?: string
  startedSince?: number
  meta?: {
    [key: string]: string | undefined
  }
  presence: {
    [key: string]: {
      disabled?: boolean
      setPresenceData?: () => void
    }
  }
  presenceData: PresenceData
} = {
  presence: {},
  meta: {},
  oldLang: '',
  startedSince: ~~(Date.now() / 1000),
  presenceData: {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/BetterAnime/assets/logo.png',
    smallImageKey: Assets.Search,
  },
}

let strings: Awaited<ReturnType<typeof getStrings>>
let video: {
  duration: number
  currentTime: number
  paused: boolean
}
const coverCache = new Map<string, string>()

async function fetchCover(downloadUrl: string): Promise<string | null> {
  let cachedCover = coverCache.get(downloadUrl)
  if (cachedCover)
    return cachedCover

  try {
    const response = await fetch(downloadUrl)
    if (response.ok) {
      const html = await response.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const coverImgElem = doc.querySelector<HTMLImageElement>('.infos-img > img')
      if (coverImgElem?.src) {
        cachedCover = coverImgElem.src
        coverCache.set(downloadUrl, cachedCover)
        return cachedCover
      }
    }
  }
  catch (err) {
    presence.error(`Error fetching cover image: ${err}`)
  }

  const fallback = 'https://cdn.rcd.gg/PreMiD/websites/B/BetterAnime/assets/logo.png'
  coverCache.set(downloadUrl, fallback)
  return fallback
}

presence.on('iFrameData', (data: unknown) => {
  if (data)
    video = data as typeof video
})

presence.on('UpdateData', async () => {
  const [
    newLang,
    privacy,
    browse,
    timestamp,
  ] = await Promise.all([
    presence.getSetting<string>('lang'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('browse'),
    presence.getSetting<boolean>('timestamp'),
  ])
  const { pathname, search, href } = document.location

  if (data.oldLang !== newLang || !strings) {
    data.oldLang = newLang
    strings = await getStrings()
  }

  if (browse)
    data.presenceData.details = strings.browse
  if (
    timestamp
    && !data.presenceData.startTimestamp
    && !data.presenceData.endTimestamp
  ) {
    data.presenceData.startTimestamp = data.startedSince
  }

  data.presence = {
    '/anime/(dublado|legendado)/([a-zA-Z0-9-]+)/([a-z-0-9]+)': {
      async setPresenceData() {
        if (video) {
          const downloadUrl = `${document.location.href}/download`
          data.presenceData.largeImageKey = await fetchCover(downloadUrl)

          data.meta!.episode = document.querySelector(
            'div.anime-title > h3',
          )?.textContent ?? undefined
          data.meta!.title = document
            .querySelector('div.anime-title')
            ?.textContent
            ?.replace(data.meta?.episode ?? '', '')

          data.presenceData.smallImageKey = video.paused
            ? Assets.Pause
            : Assets.Play
          data.presenceData.smallImageText = video.paused
            ? strings.pause
            : strings.play;

          [data.presenceData.startTimestamp, data.presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)
          const seriesURL = document.querySelector<HTMLAnchorElement>(
            'div.anime-title > h2 > a',
          )?.href
          if (!seriesURL) {
            data.presenceData.buttons = [
              {
                label: strings.viewEpisode,
                url: href,
              },
            ]
          }
          else {
            data.presenceData.buttons = [
              {
                label: strings.viewEpisode,
                url: href,
              },
              {
                label: strings.viewSeries,
                url: seriesURL,
              },
            ]
          }

          if (video.paused) {
            delete data.presenceData.endTimestamp
          }
        }
      },
    },
    '/anime/(dublado|legendado)/([a-zA-Z0-9-]+)': {
      disabled: privacy,
      async setPresenceData() {
        data.presenceData.details = strings.viewAnime
        data.presenceData.state = document.querySelector(
          'div.infos_left > div > h2',
        )?.textContent

        data.presenceData.buttons = [
          {
            label: strings.viewSeries,
            url: href,
          },
        ]
      },
    },
    '/filme/(dublado|legendado)/([a-zA-Z0-9-]+)/([a-z-]+)': {
      async setPresenceData() {
        if (video) {
          const downloadUrl = `${document.location.href}/download`
          data.presenceData.largeImageKey = await fetchCover(downloadUrl)

          data.meta!.title = document
            .querySelector('div.anime-title')
            ?.textContent
            ?.replace(
              document.querySelector('div.anime-title > h3')?.textContent ?? '',
              '',
            ) ?? ''

          data.presenceData.smallImageKey = video.paused
            ? Assets.Pause
            : Assets.Play
          data.presenceData.smallImageText = video.paused
            ? strings.pause
            : strings.play;

          [data.presenceData.startTimestamp, data.presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)

          data.presenceData.buttons = [
            {
              label: strings.buttonViewMovie,
              url: href,
            },
          ]

          if (video.paused) {
            delete data.presenceData.endTimestamp
          }
        }
      },
    },
    '/filme/(dublado|legendado)/([a-zA-Z0-9-]+)': {
      disabled: privacy,
      async setPresenceData() {
        data.presenceData.details = strings.viewMovie
        data.presenceData.state = document.querySelector(
          'div.infos_left > div > h2',
        )?.textContent

        data.presenceData.buttons = [
          {
            label: strings.buttonViewMovie,
            url: href,
          },
        ]
      },
    },
    '/minha-conta': {
      disabled: privacy,
      async setPresenceData() {
        data.presenceData.details = strings.viewAccount
      },
    },
    '/pesquisa': {
      async setPresenceData() {
        data.presenceData.details = strings.searchFor
        data.presenceData.state = new URLSearchParams(search).get('titulo')
      },
    },
  }

  const settings = [
    { id: 'timestamp', uses: ['startTimestamp', 'endTimestamp'] },
    { id: 'buttons', uses: ['buttons'] },
    { id: 'privacy', uses: ['buttons'] },
  ].filter(async setting => await presence.getSetting<boolean>(setting.id).catch(() => false))

  for (const setting of settings) {
    for (const field of setting.uses) {
      delete data.presenceData[field as keyof PresenceData]
    }
  }

  const currentPath = pathname
  for (const [pattern, pageData] of Object.entries(data.presence)) {
    if (currentPath.match(pattern) && !pageData.disabled) {
      pageData.setPresenceData?.()
      break
    }
  }

  if (privacy) {
    if (currentPath.match('/pesquisa')) {
      delete data.presenceData.state
      data.presenceData.details = strings.searchSomething
    }
    if (currentPath.match('/anime/.+/.+')) {
      data.presenceData.details = strings.watchSeries
    }
    if (currentPath.match('/filme/.+/.+')) {
      data.presenceData.details = strings.watchMovie
    }
  }
  else if (data.meta) {
    const useActivtyName = await presence.getSetting<boolean>('useActivtyName')

    if (currentPath.match('/anime/.+/.+')) {
      if (useActivtyName) {
        data.presenceData.name = data.meta.title
        data.presenceData.details = data.meta.episode
        data.presenceData.state = 'Anime'
      }
      else {
        data.presenceData.details = data.meta.title
        data.presenceData.state = data.meta.episode
      }
    }

    if (currentPath.match('/filme/.+/.+')) {
      if (useActivtyName)
        data.presenceData.name = data.meta.title
      data.presenceData.details = data.meta.title
      data.presenceData.state = 'Film'
    }
  }

  for (const x of ['state', 'details']) {
    if (data.presenceData[x as 'details'] === 'undefined')
      delete data.presenceData[x as 'details']
  }

  if (!data.presenceData.details)
    presence.setActivity()
  else presence.setActivity(data.presenceData)
})
