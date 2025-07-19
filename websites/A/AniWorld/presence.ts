import { ActivityType, Assets, getTimestamps } from 'premid'
import { AnimeDataFetcher } from './functions/animeData.js'

const presence = new Presence({
  clientId: '1387112561362604104',
})

async function getStrings() {
  return presence.getStrings({
    videoPaused: 'general.paused',
    videoPlaying: 'general.playing',
    buttonWatchAnime: 'general.buttonWatchAnime',
    buttonWatchEpisode: 'general.buttonViewEpisode',
    buttonWatchMovie: 'general.buttonWatchMovie',
    buttonViewProfile: 'general.buttonViewProfile',
    account: 'general.viewAccount',
    animes: 'aniworld.animes',
    calendar: 'aniworld.calendar',
    catalogBrowsing: 'aniworld.catalog.browsing',
    catalogBrowsingState: 'aniworld.catalog.state',
    dmca: 'aniworld.dmca',
    editinfo: 'aniworld.edit.info',
    episodeList: 'aniworld.episodeList',
    guide: 'aniworld.support.guide',
    home: 'general.viewHome',
    login: 'aniworld.login',
    messages: 'aniworld.messages',
    new: 'aniworld.new',
    notifications: 'aniworld.notifications',
    popular: 'aniworld.popular',
    profile: 'general.viewProfile',
    random: 'aniworld.random',
    registration: 'aniworld.registration',
    searchLoading: 'aniworld.search.loading',
    searchQuery: 'aniworld.search.query',
    settings: 'aniworld.settings',
    subscribed: 'aniworld.subscribed',
    terms: 'general.terms',
    watchlist: 'aniworld.watchlist',
    wishes: 'aniworld.wishes',
    faq: 'aniworld.support.faq',
    support: 'aniworld.support.help',
    supportQuestion: 'aniworld.support.question',
    supportQuestionState: 'aniworld.support.questionState',
    supportViewingQuestion: 'aniworld.support.viewingQuestion',
    browsing: 'general.browsing',
  })
}

interface StaticPageInfo {
  details: string
  smallImageKey?: Assets
  smallImageText?: string
  largeImageKey?: string
  largeImageText?: string
  state?: string
  buttons?: { label: string, url: string }[]
  startTimestamp?: number
  endTimestamp?: number
}

let videoData: {
  currTime?: number
  duration?: number
  paused?: boolean
  title?: string | null
} | null = null

presence.on('iFrameData', (data: unknown) => {
  const iframeData = (data as { iframe_video?: any })?.iframe_video
  if (iframeData) {
    videoData = {
      currTime: iframeData.currTime,
      duration: iframeData.duration,
      paused: iframeData.paused,
      title: iframeData.iFrameTitle || null,
    }
  }
})

let oldLang: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>

async function getStaticPages(): Promise<{ [key: string]: StaticPageInfo }> {
  strings = await getStrings()

  return {
    '/animes': {
      details: strings.animes,
      smallImageKey: Assets.Reading,
      smallImageText: strings.animes,
    },
    '/beliebte-animes': {
      details: strings.popular,
    },
    '/support/anleitung': {
      details: strings.guide,
      smallImageKey: Assets.Reading,
      smallImageText: strings.guide,
    },
    '/animekalender': {
      details: strings.calendar,
      smallImageKey: Assets.Search,
      smallImageText: strings.calendar,
    },
    '/random': {
      details: strings.random,
      smallImageKey: Assets.Search,
      smallImageText: strings.random,
    },
    '/zufall': {
      details: strings.random,
      smallImageKey: Assets.Search,
      smallImageText: strings.random,
    },
    '/neu': {
      details: strings.new,
      smallImageKey: Assets.Search,
      smallImageText: strings.new,
    },
    '/support/regeln': {
      details: strings.terms,
      smallImageKey: Assets.Reading,
      smallImageText: strings.terms,
    },
    '/dmca': {
      details: strings.dmca,
      smallImageKey: Assets.Reading,
      smallImageText: strings.dmca,
    },
    '/animewuensche': {
      details: strings.wishes,
      smallImageKey: Assets.Reading,
      smallImageText: strings.wishes,
    },
    '/login': {
      details: strings.login,
      smallImageKey: Assets.Writing,
      smallImageText: strings.login,
    },
    '/registrierung': {
      details: strings.registration,
      smallImageKey: Assets.Writing,
      smallImageText: strings.registration,
    },
    '/account': {
      details: strings.account,
      smallImageKey: Assets.Reading,
      smallImageText: strings.account,
    },
    '/account/nachrichten': {
      details: strings.messages,
      smallImageKey: Assets.Reading,
      smallImageText: strings.messages,
    },
    '/account/notifications': {
      details: strings.notifications,
      smallImageKey: Assets.Reading,
      smallImageText: strings.notifications,
    },
    '/account/support': {
      details: strings.support,
      smallImageKey: Assets.Reading,
      smallImageText: strings.support,
    },
    '/account/watchlist': {
      details: strings.watchlist,
      smallImageKey: Assets.Reading,
      smallImageText: strings.watchlist,
    },
    '/account/subscribed': {
      details: strings.subscribed,
      smallImageKey: Assets.Reading,
      smallImageText: strings.subscribed,
    },
    '/account/settings': {
      details: strings.settings,
      smallImageKey: Assets.Reading,
      smallImageText: strings.settings,
    },
    '/support/fragen': {
      details: strings.faq,
      smallImageKey: Assets.Question,
      smallImageText: strings.faq,
    },
    '/support': {
      details: strings.support,
      smallImageKey: Assets.Reading,
      smallImageText: strings.support,
    },
    '/edit:information': {
      details: strings.editinfo,
      smallImageKey: Assets.Writing,
      smallImageText: strings.editinfo,
    },
    '/user/profil': {
      details: strings.profile,
      smallImageKey: Assets.Reading,
      smallImageText: strings.profile,
    },
  }
}
let lastAnimeKey: string | null = null
let cachedAnimeData: Awaited<ReturnType<AnimeDataFetcher['loadAnimeData']>> | null = null
let isLoadingAnimeData = false
let lastLoadPromise: Promise<Awaited<ReturnType<AnimeDataFetcher['loadAnimeData']>>> | null = null
function getAnimeKeyFromUrl(url: string): string | null {
  const match = url.match(/\/anime\/stream\/(.+?)\/?$/);
  return match && typeof match[1] === 'string' ? match[1] : null;
}

async function getCachedAnimeData(): Promise<AnimeDataFetcher['animeData'] | null> {
  const key = getAnimeKeyFromUrl(document.location.pathname)
  if (!key) {
    lastAnimeKey = null
    cachedAnimeData = null
    lastLoadPromise = null
    return null
  }

  if (cachedAnimeData && lastAnimeKey === key) {
    return cachedAnimeData
  }

  if (isLoadingAnimeData && lastLoadPromise) {
    const data = await lastLoadPromise
    if (getAnimeKeyFromUrl(document.location.pathname) === key) {
      return data
    }
    return null
  }

  isLoadingAnimeData = true
  const animeDataFetcher = new AnimeDataFetcher()
  const loadPromise = animeDataFetcher.loadAnimeData()
  lastLoadPromise = loadPromise

  try {
    const data = await loadPromise
    if (getAnimeKeyFromUrl(document.location.pathname) === key) {
      cachedAnimeData = data
      lastAnimeKey = key
      return data
    }
    return null
  }
  finally {
    isLoadingAnimeData = false
    lastLoadPromise = null
  }
}

presence.on('UpdateData', async () => {
  strings = await getStrings()

  const [lang, privacyMode, showTitleAsPresence, showCover, showTimestamp] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showTitleAsPresence'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('timestamp'),
  ])

  if (oldLang !== lang) {
    oldLang = lang
    strings = await getStrings()
  }

  const page = document.location.pathname
  const staticPages = await getStaticPages()

  if (privacyMode) {
    await presence.setActivity({
      details: strings.browsing,
      smallImageKey: Assets.Reading,
      smallImageText: strings.browsing,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AniWorld/assets/logo.png',
    })
    return
  }

  if (page.startsWith('/anime/')) {
    const hasEpisode = page.includes('episode-')

    const animeData = await getCachedAnimeData()
    const detailsText = showTitleAsPresence ? animeData?.title ?? 'AniWorld' : 'AniWorld'
    const largeImageKey = showCover
      ? animeData?.coverImg || 'https://cdn.rcd.gg/PreMiD/websites/A/AniWorld/assets/logo.png'
      : 'https://cdn.rcd.gg/PreMiD/websites/A/AniWorld/assets/logo.png'

    if (!hasEpisode) {
      await presence.setActivity({
        type: ActivityType.Watching,
        name: detailsText,
        details: detailsText,
        state: strings.episodeList,
        largeImageKey,
        largeImageText: animeData?.title ?? 'AniWorld',
        smallImageKey: Assets.Reading,
        smallImageText: strings.episodeList,
        buttons: [{ label: strings.buttonWatchAnime, url: document.location.href }],
      })
      return
    }

    const title = document.querySelector('title')?.textContent ?? ''
    const heading = document.querySelector('h2')
    const textWithoutSmall = heading
      ? Array.from(heading.childNodes)
          .filter(node => !(node.nodeType === Node.ELEMENT_NODE && (node as Element).matches('small.episodeEnglishTitle')))
          .map(node => node.textContent ?? '')
          .join('')
          .trim()
      : ''
    const stateText = [title, textWithoutSmall]
      .map((t) => {
        const str = typeof t === 'string' ? t : (t && typeof (t as any).textContent === 'string' ? (t as any).textContent ?? '' : '')
        return str.replace(/Staffel.*|Episode.*|Filme von| \| AniWorld\.to - Animes gratis online ansehen/g, '').trim()
      })
      .filter(Boolean)
      .join(' - ')
      .replace(/^-\s*/, '')

    let timestamps: [number, number] = [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)]
    if (videoData?.currTime != null && videoData?.duration != null) {
      timestamps = getTimestamps(videoData.currTime, videoData.duration)
    }

    if (videoData?.paused || !videoData) {
      await presence.setActivity({
        type: ActivityType.Watching,
        name: detailsText,
        details: detailsText,
        state: stateText,
        largeImageKey,
        largeImageText: `Season ${animeData?.season ?? 'N/A'}, Episode ${animeData?.episode ?? 'N/A'}`,
        smallImageKey: Assets.Pause,
        smallImageText: strings.videoPaused,
        buttons: [{ label: strings.buttonWatchAnime, url: document.location.href }],
      })
      return
    }

    await presence.setActivity({
      type: ActivityType.Watching,
      name: detailsText,
      details: detailsText,
      state: stateText,
      largeImageKey,
      largeImageText: `Season ${animeData?.season ?? 'N/A'}, Episode ${animeData?.episode ?? 'N/A'}`,
      smallImageKey: Assets.Play,
      smallImageText: strings.videoPlaying,
      startTimestamp: showTimestamp ? timestamps[0] : undefined,
      endTimestamp: showTimestamp ? timestamps[1] : undefined,
      buttons: [{ label: strings.buttonWatchAnime, url: document.location.href }],
    })
    return
  }

  if (page === '/') {
    await presence.setActivity({
      details: strings.home,
      smallImageKey: Assets.Reading,
      smallImageText: strings.home,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AniWorld/assets/logo.png',
    })
    return
  }

  if (page in staticPages) {
    const info = staticPages[page]
    if (info) {
      const { largeImageText, buttons, ...restPageInfo } = info
      const activityData: Record<string, unknown> = {
        ...restPageInfo,
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AniWorld/assets/logo.png',
      }

      if (buttons && buttons.length > 0) {
        activityData.buttons = buttons.slice(0, 2) as [typeof buttons[0], typeof buttons[1]?]
      }

      if (largeImageText) {
        activityData.largeImageText = largeImageText
      }

      await presence.setActivity(activityData)
      return
    }
  }

  await presence.setActivity({
    details: strings.browsing,
    smallImageKey: Assets.Reading,
    smallImageText: strings.browsing,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AniWorld/assets/logo.png',
  })
})
