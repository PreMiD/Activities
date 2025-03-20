import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1321328844497752124',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const strings = presence.getStrings({
  playing: 'general.playing',
  pause: 'general.paused',
  home: 'general.viewHome',
  search: 'general.searchFor',
  browse: 'general.browsing',
  reading: 'general.reading',
  buttonViewPage: 'general.buttonViewPage',
  buttonViewEpisode: 'general.buttonViewEpisode',
  buttonWatchAnime: 'general.buttonWatchAnime',
  buttonWatchMovie: 'general.buttonWatchMovie',
  buttonViewSeries: 'general.buttonViewSeries',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/Freek/assets/logo.png',
}

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Unsupported Page',
  }

  const { href, pathname } = document.location
  const [showTimestamp, showButtons, privacy] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('privacy'),
  ])

  if (privacy) {
    presenceData.details = 'Watching Freek'
    presence.setActivity(presenceData)
    return
  }

  const pages: Record<string, PresenceData> = {
    '/': {
      details: (await strings).home,
      smallImageKey: Assets.Viewing,
    },
    '/watchlist': {
      details: `${(await strings).browse} Watchlist`,
      smallImageKey: Assets.Viewing,
    },
    '/history': {
      details: `${(await strings).browse} History`,
      smallImageKey: Assets.Viewing,
    },
    '/settings': {
      details: `${(await strings).browse} Settings`,
      smallImageKey: Assets.Viewing,
    },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(path))
      presenceData = { ...presenceData, ...data, type: ActivityType.Watching }
  }

  const pageNumber = href.includes('?page=') ? href.split('?page=')[1] : 1
  const searchInput = document.querySelector('input')
    ? document.querySelector('input')?.getAttribute('value')
    : null
  const searchResults = document.querySelector(
    'div.flex.items-center.justify-between > span.flex.items-center.gap-1',
  )?.textContent
  const steamTitle = document.querySelector('div#right-header > div')
    ? document.querySelector('div#right-header > div')?.textContent
    : document.querySelector('div.flex > span.flex-grow')?.textContent

  if (pathname.includes('/watch/')) {
    const [startTimestamp, endTimestamp] = presence.getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )
    const episodeName = document.querySelector(
      'div.pointer-events-none > button > div > span.font-light',
    )
    const episodeNumber = href.includes('?ep=') ? href.split('?ep=')[1] : 1

    switch (pathname.split('/watch')[1]?.split('/')[1]) {
      case 'movie':
        presenceData.details = steamTitle
        presenceData.state = `⭐ ${
          document.querySelector('div.flex > div.false > span.rounded-md')
            ?.textContent
        } 🗓️ ${
          document.querySelectorAll('div.flex.flex-col > span')[3]?.textContent
        }`
        presenceData.largeImageKey = document
          .querySelector(
            'div.flex > div.false > span.lazy-load-image-background > img',
          )
          ?.getAttribute('src')
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? (await strings).pause
          : (await strings).playing
        presenceData.buttons = [
          {
            label: (await strings).buttonWatchMovie,
            url: href,
          },
        ]
        break
      case 'tv':
      case 'anime':
        presenceData.details = steamTitle
        presenceData.state = `📺 ${
          episodeName
            ? `${episodeName?.textContent}`
            : `Episode ${episodeNumber}`
        }`
        presenceData.largeImageText = `Season ${
          href.includes('?season=') ? href.split('?season=')[1] : 1
        }, Episode ${episodeNumber}`
        presenceData.largeImageKey = document
          .querySelector(
            'div.flex > div.false > span.lazy-load-image-background > img',
          )
          ?.getAttribute('src')
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? (await strings).pause
          : (await strings).playing
        presenceData.buttons = [
          {
            label: (await strings).buttonViewEpisode,
            url: href,
          },
        ]
        break
      default:
        presenceData.details = 'Watching a Video'
        break
    }

    if (showTimestamp) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = [
        startTimestamp,
        endTimestamp,
      ]
    }

    if (video.paused)
      delete presenceData.endTimestamp
  }
  else if (pathname.includes('/read/')) {
    const mangaName = document.querySelector(
      'div.pointer-events-none > button > div > span.font-light',
    )

    presenceData.details = steamTitle
    presenceData.state = `📺 ${
      mangaName
        ? `${mangaName?.textContent}`
        : `Chapter ${href.includes('?ep=') ? href.split('?ep=')[1] : 1}`
    }`
    presenceData.largeImageKey = document
      .querySelector(
        'div.flex > div.false > span.lazy-load-image-background > img',
      )
      ?.getAttribute('src')
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = (await strings).reading
    presenceData.buttons = [
      {
        label: (await strings).buttonViewSeries,
        url: href,
      },
    ]
  }
  else if (pathname.includes('/explore')) {
    presenceData.state = `Page ${pageNumber} - ${searchResults}`
    presenceData.smallImageKey = Assets.Viewing

    if (searchInput) {
      presenceData.state = `Query: ${searchInput}`
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = `Page ${pageNumber} - ${searchResults}`
    }

    switch (pathname.split('/explore/')[1]) {
      case 'movie':
        presenceData.details = 'Exploring Movies'

        if (searchInput)
          presenceData.details = `${(await strings).search} Movies`

        break
      case 'tv':
        presenceData.details = 'Exploring TV Shows'

        if (searchInput)
          presenceData.details = `${(await strings).search} TV Shows`
        break
      case 'anime':
        presenceData.details = 'Exploring Anime'
        if (searchInput)
          presenceData.details = `${(await strings).search} Anime`
        break
      case 'manga':
        presenceData.details = 'Exploring Manga'
        if (searchInput)
          presenceData.details = `${(await strings).search} Manga`
        break
      default:
        presenceData.details = 'Exploring'
        break
    }
  }
  else if (pathname.includes('/search')) {
    presenceData.details = `Searching for ${
      href.includes('type=') ? href.split('type=')[1] : 'movie'
    }`
    presenceData.state = `Query: ${document
      .querySelector('input')
      ?.getAttribute('value')}`
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = `Page ${
      href.includes('page=') ? href.split('page=')[1]?.split('&type')[0] : 1
    } - ${searchResults}`
  }

  if (!showButtons && presenceData.buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
