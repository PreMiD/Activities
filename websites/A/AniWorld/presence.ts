import type { AnimeData } from './functions/animeData.js'
import { ActivityType, Assets, getTimestamps, StatusDisplayType } from 'premid'
import { fetchCover, getAnimeData } from './functions/animeData.js'

const presence = new Presence({
  clientId: '1387112561362604104',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniWorld/assets/logo.png',
}

enum CoverMode {
  Logo = 0,
  AniWorld = 1,
  Kitsu = 2,
}

enum DisplayType {
  Name = 0,
  Details = 1,
  State = 2,
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

//* Checked before the static list so that /support/frage/<slug> is not
//* swallowed by the /support entry.
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
      //* Appending would not translate: the string is a prefix in English but a
      //* full sentence in other locales.
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

//* Sub pages such as /account/support/new are only listed by their base path.
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

let kitsuSlug: string | null = null
let kitsuCover: string | undefined
let pendingCover: Promise<string | undefined> | null = null

//* Cached per series so an episode switch does not re-query Kitsu.
async function getKitsuCover(animeData: AnimeData): Promise<string | undefined> {
  if (kitsuSlug === animeData.slug)
    return kitsuCover

  //* UpdateData keeps firing while the lookup is still open, so share it.
  pendingCover ??= fetchCover(animeData.title).finally(() => {
    pendingCover = null
  })

  const cover = await pendingCover

  //* Discard a result that arrived after the user moved on.
  if (getAnimeData().slug !== animeData.slug)
    return undefined

  kitsuSlug = animeData.slug
  kitsuCover = cover

  return cover
}

async function getCover(animeData: AnimeData, mode: CoverMode): Promise<string> {
  if (mode === CoverMode.Logo)
    return ActivityAssets.Logo

  //* Either source may come up empty, so fall through to the other one.
  const cover = mode === CoverMode.Kitsu
    ? await getKitsuCover(animeData) ?? animeData.coverImg
    : animeData.coverImg ?? await getKitsuCover(animeData)

  return cover ?? ActivityAssets.Logo
}

function getEpisodeTitle(): string | undefined {
  const heading = document.querySelector('h2')
  if (!heading)
    return undefined

  //* The English title sits in a sibling <small> and would otherwise be glued
  //* on without a separator.
  const title = heading.querySelector('.episodeGermanTitle')?.textContent
    ?? Array.from(heading.childNodes)
      .filter(node => !(node instanceof Element && node.matches('small.episodeEnglishTitle')))
      .map(node => node.textContent ?? '')
      .join('')

  return title.trim() || undefined
}

//* Unlike the raw %season%/%episode% placeholders this stays correct on movie
//* pages, which have neither.
function getProgress(animeData: AnimeData): string {
  if (animeData.movie !== undefined)
    return `Movie ${animeData.movie}`
  if (animeData.episode === undefined)
    return ''

  return animeData.season === undefined
    ? `E${animeData.episode}`
    : `S${animeData.season}E${animeData.episode}`
}

//* Empty placeholders collapse together with their separator, so a missing
//* episode title cannot leave a dangling dash behind.
function formatRow(format: string, animeData: AnimeData, episodeTitle: string | undefined): string {
  return format
    .replace(/%anime%/g, animeData.title)
    .replace(/%episodeTitle%/g, episodeTitle ?? '')
    .replace(/%progress%/g, getProgress(animeData))
    .replace(/%season%/g, animeData.season?.toString() ?? '')
    .replace(/%episode%/g, animeData.episode?.toString() ?? '')
    .replace(/%movie%/g, animeData.movie?.toString() ?? '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-–·|]+|[\s\-–·|]+$/g, '')
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
  const [
    lang,
    privacyMode,
    showTitleAsPresence,
    coverMode,
    detailsFormat,
    stateFormat,
    displayType,
    showTimestamp,
    hidePaused,
  ] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showTitleAsPresence'),
    presence.getSetting<number>('cover'),
    presence.getSetting<string>('detailsFormat'),
    presence.getSetting<string>('stateFormat'),
    presence.getSetting<number>('displayType'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('hidePaused'),
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

  const statusDisplayType = displayType === DisplayType.Name
    ? StatusDisplayType.Name
    : displayType === DisplayType.State
      ? StatusDisplayType.State
      : StatusDisplayType.Details

  if (page.startsWith('/anime/')) {
    const animeData = getAnimeData()
    const isMovie = animeData.movie !== undefined
    const isEpisode = animeData.episode !== undefined
    const name = showTitleAsPresence ? animeData.title : 'AniWorld'
    const largeImageKey = await getCover(animeData, coverMode)

    if (!isEpisode && !isMovie) {
      await presence.setActivity({
        type: ActivityType.Watching,
        name,
        details: name,
        state: strings.episodeList,
        largeImageKey,
        largeImageText: animeData.title,
        smallImageKey: Assets.Reading,
        smallImageText: strings.episodeList,
        startTimestamp: getBrowsingTimestamp(),
        statusDisplayType,
        buttons: [{ label: strings.buttonWatchAnime, url: document.location.href }],
      })
      return
    }

    wasWatching = true

    const video = getVideoData()
    //* No player data yet, e.g. while the hoster loads.
    const paused = video?.paused ?? true

    if (paused && hidePaused) {
      await presence.clearActivity()
      return
    }

    const episodeTitle = getEpisodeTitle()
    const details = formatRow(detailsFormat, animeData, episodeTitle)
    const state = formatRow(stateFormat, animeData, episodeTitle)

    const episodeButton = {
      label: isMovie ? strings.buttonWatchMovie : strings.buttonWatchEpisode,
      url: document.location.href,
    }
    const seriesButton = animeData.slug
      ? {
          label: strings.buttonWatchAnime,
          url: `${document.location.origin}/anime/stream/${animeData.slug}`,
        }
      : undefined

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      name,
      details: details || animeData.title,
      largeImageKey,
      largeImageText: isMovie
        ? `Movie ${animeData.movie}`
        : `Season ${animeData.season ?? 'N/A'}, Episode ${animeData.episode}`,
      smallImageKey: paused ? Assets.Pause : Assets.Play,
      smallImageText: paused ? strings.videoPaused : strings.videoPlaying,
      statusDisplayType,
      buttons: seriesButton ? [episodeButton, seriesButton] : [episodeButton],
    }

    //* "{0}" lets users drop the row entirely.
    if (state && !stateFormat.includes('{0}'))
      presenceData.state = state

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
