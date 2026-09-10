import type { AnimeData } from './functions/animeData.js'
import { ActivityType, Assets, getTimestamps } from 'premid'
import { fetchCover, getAnimeData } from './functions/animeData.js'

const presence = new Presence({
  clientId: '1387112561362604104',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniWorld/assets/logo.png',
}

//* The hoster iframe stops sending as soon as it is unloaded (episode switch,
//* hoster change, closed player), so data that is no longer being refreshed has
//* to be dropped instead of freezing the presence on the last known position.
const VIDEO_DATA_TTL = 10_000

interface IFrameVideoData {
  currentTime: number
  duration: number
  paused: boolean
}

interface PageInfo {
  details: string
  state?: string
  smallImageKey?: Assets
  smallImageText?: string
}

async function getStrings() {
  return presence.getStrings({
    videoPaused: 'general.paused',
    videoPlaying: 'general.playing',
    buttonWatchAnime: 'general.buttonWatchAnime',
    buttonWatchEpisode: 'general.buttonViewEpisode',
    buttonWatchMovie: 'general.buttonWatchMovie',
    account: 'general.viewAccount',
    animes: 'aniworld.animes',
    browsing: 'general.browsing',
    calendar: 'aniworld.calendar',
    catalog: 'aniworld.catalog.browsing',
    dmca: 'aniworld.dmca',
    editinfo: 'aniworld.edit.info',
    episodeList: 'aniworld.episodeList',
    faq: 'aniworld.support.faq',
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
    support: 'aniworld.support.help',
    supportQuestion: 'aniworld.support.question',
    supportQuestionState: 'aniworld.support.questionState',
    terms: 'general.terms',
    watchlist: 'aniworld.watchlist',
    wishes: 'aniworld.wishes',
  })
}

type Strings = Awaited<ReturnType<typeof getStrings>>

function getStaticPages(strings: Strings): Record<string, PageInfo> {
  return {
    '/': {
      details: strings.home,
      smallImageKey: Assets.Reading,
      smallImageText: strings.home,
    },
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
    '/neue-episoden': {
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

/**
 * Pages whose path carries the interesting part. Checked before the static list
 * so that e.g. /support/frage/<slug> is not swallowed by /support.
 */
function getDynamicPage(pathname: string, strings: Strings): PageInfo | undefined {
  const profile = pathname.match(/^\/user\/profil\/([^/]+)/)?.[1]
  if (profile) {
    return {
      details: strings.profile,
      //* "general.viewProfile" ends with a colon and expects the name next to it.
      state: document.querySelector('h1')?.textContent?.trim() || decodeURIComponent(profile),
      smallImageKey: Assets.Reading,
      smallImageText: strings.profile,
    }
  }

  const letter = pathname.match(/^\/katalog\/([^/]+)/)?.[1]
  if (letter) {
    return {
      details: strings.catalog,
      //* Keep the letter in its own field: the string reads as a prefix in
      //* English ("Viewing animes with") but as a full sentence in other
      //* locales, so appending to it would not translate.
      state: decodeURIComponent(letter),
      smallImageKey: Assets.Search,
      smallImageText: strings.animes,
    }
  }

  if (/^\/support\/frage\//.test(pathname)) {
    return {
      details: strings.supportQuestion,
      smallImageKey: Assets.Question,
      smallImageText: strings.supportQuestionState,
    }
  }

  if (pathname === '/search') {
    const query = document.querySelector<HTMLInputElement>('#search')?.value.trim()
    const info: PageInfo = {
      details: query ? strings.searchQuery : strings.searchLoading,
      smallImageKey: Assets.Search,
      smallImageText: strings.searchLoading,
    }

    if (query)
      info.state = query

    return info
  }

  return undefined
}

/**
 * Sub pages such as /account/support/new are only listed by their base path, so
 * fall back to the longest matching prefix.
 */
function findStaticPage(pathname: string, pages: Record<string, PageInfo>): PageInfo | undefined {
  let matched: [string, PageInfo] | undefined

  for (const entry of Object.entries(pages)) {
    if (pathname !== entry[0] && !pathname.startsWith(`${entry[0]}/`))
      continue

    if (!matched || entry[0].length > matched[0].length)
      matched = entry
  }

  return matched?.[1]
}

let videoData: IFrameVideoData | null = null
let videoDataUpdatedAt = 0

presence.on('iFrameData', (data: IFrameVideoData) => {
  videoData = data
  videoDataUpdatedAt = Date.now()
})

function getVideoData(): IFrameVideoData | null {
  if (videoData && Date.now() - videoDataUpdatedAt > VIDEO_DATA_TTL)
    videoData = null

  return videoData
}

let coverSlug: string | null = null
let coverImg: string | undefined
let pendingCover: Promise<string | undefined> | null = null

/**
 * Resolves the cover once per series - it does not change between episodes, so
 * the Kitsu fallback must not be queried again on every episode switch.
 */
async function getCover(animeData: AnimeData): Promise<string | undefined> {
  if (animeData.coverImg)
    return animeData.coverImg

  if (coverSlug === animeData.slug)
    return coverImg

  //* UpdateData keeps firing while the lookup is still open, so share it.
  pendingCover ??= fetchCover(animeData.title).finally(() => {
    pendingCover = null
  })

  const cover = await pendingCover

  //* Discard a result that arrived after the user moved on to another series.
  if (getAnimeData().slug !== animeData.slug)
    return undefined

  coverSlug = animeData.slug
  coverImg = cover

  return cover
}

function getEpisodeTitle(): string | undefined {
  const heading = document.querySelector('h2')
  if (!heading)
    return undefined

  //* The heading carries the localized title plus the English one in a sibling
  //* <small>, which would otherwise be glued on without a separator.
  const title = heading.querySelector('.episodeGermanTitle')?.textContent
    ?? Array.from(heading.childNodes)
      .filter(node => !(node instanceof Element && node.matches('small.episodeEnglishTitle')))
      .map(node => node.textContent ?? '')
      .join('')

  return title.trim() || undefined
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatching = false

function getBrowsingTimestamp(): number {
  if (wasWatching) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    wasWatching = false
  }

  return browsingTimestamp
}

let oldLang: string | null = null
let strings: Strings
let staticPages: Record<string, PageInfo>

presence.on('UpdateData', async () => {
  const [lang, privacyMode, showTitleAsPresence, showCover, showTimestamp] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showTitleAsPresence'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('timestamp'),
  ])

  //* getStrings() is a round trip to the extension, so only refresh the strings
  //* when the selected language actually changed.
  if (!strings || oldLang !== lang) {
    oldLang = lang
    strings = await getStrings()
    staticPages = getStaticPages(strings)
  }

  const page = document.location.pathname

  if (privacyMode) {
    await presence.setActivity({
      details: strings.browsing,
      smallImageKey: Assets.Reading,
      smallImageText: strings.browsing,
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: getBrowsingTimestamp(),
    })
    return
  }

  if (page.startsWith('/anime/')) {
    const animeData = getAnimeData()
    const isMovie = animeData.movie !== undefined
    const isEpisode = animeData.episode !== undefined
    const title = showTitleAsPresence ? animeData.title : 'AniWorld'
    const largeImageKey = (showCover ? await getCover(animeData) : undefined) ?? ActivityAssets.Logo

    if (!isEpisode && !isMovie) {
      await presence.setActivity({
        type: ActivityType.Watching,
        name: title,
        details: title,
        state: strings.episodeList,
        largeImageKey,
        largeImageText: animeData.title,
        smallImageKey: Assets.Reading,
        smallImageText: strings.episodeList,
        startTimestamp: getBrowsingTimestamp(),
        buttons: [{ label: strings.buttonWatchAnime, url: document.location.href }],
      })
      return
    }

    wasWatching = true

    const video = getVideoData()
    //* Without player data the safest assumption is that nothing is running,
    //* e.g. while the hoster is still loading.
    const paused = video?.paused ?? true

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      name: title,
      details: title,
      largeImageKey,
      largeImageText: isMovie
        ? `Movie ${animeData.movie}`
        : `Season ${animeData.season ?? 'N/A'}, Episode ${animeData.episode}`,
      smallImageKey: paused ? Assets.Pause : Assets.Play,
      smallImageText: paused ? strings.videoPaused : strings.videoPlaying,
      buttons: [{
        label: isMovie ? strings.buttonWatchMovie : strings.buttonWatchEpisode,
        url: document.location.href,
      }],
    }

    const episodeTitle = getEpisodeTitle()
    if (episodeTitle)
      presenceData.state = episodeTitle

    if (video && !paused && showTimestamp)
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)

    await presence.setActivity(presenceData)
    return
  }

  const pageInfo = getDynamicPage(page, strings)
    ?? findStaticPage(page, staticPages)
    ?? {
      details: strings.browsing,
      smallImageKey: Assets.Reading,
      smallImageText: strings.browsing,
    }

  await presence.setActivity({
    ...pageInfo,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: getBrowsingTimestamp(),
  })
})
