import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1541447121809444954',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

const strings = presence.getStrings({
  browsing: 'general.browsing',
  searchFor: 'general.searchFor',
  viewHome: 'general.viewHome',
  viewAnime: 'general.viewAnime',
  viewProfile: 'general.viewProfile',
  viewAccount: 'general.viewAccount',
  viewCategory: 'general.viewCategory',
  viewPage: 'general.viewPage',
  viewAList: 'general.viewAList',
  readingArticle: 'general.readingArticle',
  anime: 'general.anime',
  episode: 'general.episode',
  watchingLive: 'general.watchingLive',
  paused: 'general.paused',
  playing: 'general.playing',
  buttonWatchAnime: 'general.buttonWatchAnime',
  buttonViewAnime: 'general.buttonViewAnime',
  buttonViewProfile: 'general.buttonViewProfile',
  buttonReadArticle: 'general.buttonReadArticle',
  buttonViewPage: 'general.buttonViewPage',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/wDr0XrH.png',
}

function text(selector: string): string | null {
  return document.querySelector(selector)?.textContent?.trim() || null
}

function image(selector: string): string | null {
  const src = document.querySelector<HTMLImageElement>(selector)?.src
  return src?.startsWith('http') ? src : null
}

//* The player never changes the URL, so the episode number only lives in a badge next to the title.
//* Three known layouts: "Эпизод 1", "Эп. 1 · <dub>" and "1 эпизод".
function episodeNumber(): string | null {
  const sidebar = document.querySelector('#aon-dub-sidebar')
  for (const span of document.querySelectorAll('#player span')) {
    if (sidebar?.contains(span))
      continue
    const label = span.textContent?.trim() ?? ''
    const match = label.match(/^Эп(?:изод)?\.?\s*(\d+)/i) ?? label.match(/^(\d+)\s+эпизод/i)
    if (match)
      return match[1] ?? null
  }
  return null
}

//* /quests has no <main> element and no progressbar role; the daily counter is
//* the page's only leaf reading exactly "N/M" (per-quest ones render as "/3").
function questProgress(): string | null {
  for (const span of document.querySelectorAll('span')) {
    if (span.children.length)
      continue
    const label = span.textContent?.trim() ?? ''
    if (/^\d+\/\d+$/.test(label))
      return label
  }
  return null
}

//* A collection page carries exactly one "<count> аниме" pair, and the count sits
//* in the element right before that label.
function collectionSize(): string | null {
  const label = [...document.querySelectorAll('span')]
    .find(span => !span.children.length && span.textContent?.trim() === 'аниме')
  const count = label?.previousElementSibling?.textContent?.trim()
  return count && /^\d+$/.test(count) ? count : null
}

//* Section names already sit in the URL, so a page can be labelled from it instead of
//* from a heading that might greet the visitor by name. Only the first segment is used;
//* deeper ones can carry identifiers, as /user/<name> does.
function pathLabel(pathname: string): string | null {
  const segment = pathname.split('/')[1]
  if (!segment)
    return null
  const words = segment.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function clockToSeconds(clock: string): number | null {
  const parts = clock.split(':').map(Number)
  if (!parts.length || parts.some(Number.isNaN))
    return null
  return parts.reduce((total, part) => total * 60 + part, 0)
}

//* /together never mounts a <video>, so the position has to come from the airing card,
//* which prints it as "<elapsed>−<remaining>" in one row. That dash is U+2212, not a
//* hyphen, and it is the page's only such label.
function togetherTimestamps(): [number, number] | null {
  const row = [...document.querySelectorAll('span')]
    .find(span => !span.children.length && /^[−-]\d{1,2}:\d{2}$/.test(span.textContent?.trim() ?? ''))
    ?.parentElement
  const [elapsed, remaining] = (row?.textContent?.trim() ?? '').split(/[−-]/).map(part => clockToSeconds(part.trim()))
  if (elapsed === null || elapsed === undefined || remaining === null || remaining === undefined)
    return null
  return getTimestamps(elapsed, elapsed + remaining)
}

//* The airing card on /together and a room card both put the episode in a single leaf,
//* but only the room variant appends the dub, so the longest match is the richest one.
//* On both pages the anime title is the document's only link into /anime/.
function togetherStream(): { title: string | null, line: string | null } {
  const lines = [...document.querySelectorAll('span')]
    .filter(span => !span.children.length)
    .map(span => span.textContent?.trim() ?? '')
    .filter(label => /^Серия\s+\d+/.test(label))
    .sort((a, b) => b.length - a.length)

  return { title: text('a[href^="/anime/"]'), line: lines[0] ?? null }
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)
  const [showTimestamps, showCover, showButtons, showJoinButton, privacy] = await Promise.all([
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('joinButton'),
    presence.getSetting<boolean>('privacy'),
  ])
  const {
    browsing,
    searchFor,
    viewHome,
    viewAnime,
    viewProfile,
    viewAccount,
    viewCategory,
    viewPage,
    viewAList,
    readingArticle,
    anime,
    episode,
    watchingLive,
    paused,
    playing,
    buttonWatchAnime,
    buttonViewAnime,
    buttonViewProfile,
    buttonReadArticle,
    buttonViewPage,
  } = await strings

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  let buttonLabel: string | null = null

  switch (true) {
    case pathname === '/': {
      presenceData.details = 'AnimeOn'
      presenceData.state = viewHome
      break
    }
    case pathname.startsWith('/anime/'): {
      const animeId = pathname.match(/^\/anime\/.*?-(\d+)\/?$/)?.[1]
      const title = text('h1') ?? anime
      const video = document.querySelector<HTMLVideoElement>('#player video')
      const cover = animeId ? image(`img[src*="/anime/posters/${animeId}_"]`) : null

      if (showCover && cover)
        presenceData.largeImageKey = cover

      if (video && Number.isFinite(video.duration)) {
        const number = episodeNumber()
        const dub = text('#aon-dub-sidebar button[aria-current="true"] span[title]')

        const epLine = [number && `${episode} ${number}`, dub].filter(Boolean).join(' • ')

        presenceData.details = title
        if (epLine)
          presenceData.state = epLine
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused ? paused : playing

        if (!video.paused) {
          const [start, end] = getTimestampsFromMedia(video)
          presenceData.startTimestamp = start
          presenceData.endTimestamp = end
        }
        buttonLabel = buttonWatchAnime
      }
      else {
        presenceData.details = viewAnime
        presenceData.state = title
        buttonLabel = buttonViewAnime
      }
      break
    }
    case pathname === '/catalog': {
      const query = searchParams.get('search')
      const genre = searchParams.get('genre')

      if (query) {
        presenceData.details = searchFor
        presenceData.state = query
        presenceData.smallImageKey = Assets.Search
      }
      else if (genre) {
        presenceData.details = viewCategory
        presenceData.state = genre
      }
      else {
        presenceData.details = browsing
        presenceData.state = 'Catalog'
      }
      break
    }
    case pathname.startsWith('/news/category/'): {
      presenceData.details = viewCategory
      presenceData.state = text('h1') ?? 'News'
      break
    }
    case pathname.startsWith('/news/'): {
      presenceData.details = readingArticle
      presenceData.state = text('h1') ?? 'News'
      buttonLabel = buttonReadArticle
      break
    }
    case pathname.startsWith('/collections/'): {
      const size = collectionSize()

      presenceData.details = viewAList
      presenceData.state = [text('h1') ?? 'Collection', size && `${size} ${anime}`].filter(Boolean).join(' • ')
      buttonLabel = buttonViewPage
      break
    }
    case pathname.startsWith('/user/'): {
      presenceData.details = viewProfile
      presenceData.state = text('h1') ?? decodeURIComponent(pathname.slice('/user/'.length))
      if (showCover)
        presenceData.largeImageKey = image('img[src*="/media/cosmetic/avatars/"]') ?? ActivityAssets.Logo
      buttonLabel = buttonViewProfile
      break
    }
    case pathname.startsWith('/together'): {
      const { title, line } = togetherStream()

      presenceData.details = title ?? 'Watch Together'
      if (line)
        presenceData.state = line
      //* Only the media element tells the truth here: a room listed as "Пауза" still
      //* renders a LIVE badge on its own page, because that badge means "room is open".
      const video = document.querySelector<HTMLVideoElement>('video')
      //* The card shows only two things: preview stills cycling until the stream is
      //* started, and real video afterwards. No media element exists in the first state,
      //* so its presence is what separates looking at the broadcast from watching it.
      //* /together itself cannot be paused, its only control is "Остановить эфир",
      //* which tears the element back down to the stills, but a room host can pause,
      //* and there the element stays mounted reporting paused.
      const watching = video !== null && video.readyState > 0
      const streamPaused = watching && video?.paused === true

      if (streamPaused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = paused
      }
      else if (watching) {
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = watchingLive
      }
      else {
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = browsing
      }

      if (streamPaused) {
        //* Leaving the page timer running would imply progress that is not happening.
        delete presenceData.startTimestamp
      }
      else {
        //* The player only mounts once the stream is started, so until then the position
        //* has to come off the card's text instead.
        const times = video && Number.isFinite(video.duration)
          ? getTimestampsFromMedia(video)
          : togetherTimestamps()

        //* getTimestampsFromMedia reports [0, 0] while the media is still unreadable.
        if (times && times[1] > 0) {
          presenceData.startTimestamp = times[0]
          presenceData.endTimestamp = times[1]
        }
      }

      //* Only offer the invite when something is actually on; otherwise it leads nowhere.
      //* An extension that has not picked the setting up yet reports undefined, so the
      //* declared default of true has to survive that.
      if (showJoinButton !== false && title)
        buttonLabel = pathname === '/together' ? 'Join Stream' : 'Join Room'
      break
    }
    case pathname === '/schedule': {
      presenceData.details = browsing
      presenceData.state = 'Release schedule'
      break
    }
    //* Auth-gated pages whose headings were checked to carry no personal data.
    case pathname === '/quests' || pathname === '/achievements' || pathname === '/store' || pathname === '/cosmetics': {
      const heading = text('h1')
      const progress = pathname === '/quests' ? questProgress() : null

      presenceData.details = viewPage
      if (heading)
        presenceData.state = progress ? `${heading} • ${progress}` : heading
      break
    }
    //* The /profile heading greets the user by name, so it must never reach the presence.
    //* (/premium does the same, but the default branch labels it from the URL alone.)
    case pathname === '/profile': {
      presenceData.details = viewAccount
      break
    }
    case pathname === '/list': {
      const tab = text('[role="tab"][aria-selected="true"]')?.replace(/\d+$/, '').trim()

      presenceData.details = viewPage
      presenceData.state = [text('h1'), tab].filter(Boolean).join(' • ') || 'My list'
      break
    }
    default: {
      const label = pathLabel(pathname)

      presenceData.details = browsing
      if (label)
        presenceData.state = label
      break
    }
  }

  //* Privacy Mode has to leave nothing behind that says what is being watched.
  if (privacy) {
    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.details = browsing
    delete presenceData.state
    delete presenceData.smallImageKey
    delete presenceData.smallImageText
    delete presenceData.endTimestamp
    buttonLabel = null
  }

  if (!showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (showButtons && buttonLabel)
    presenceData.buttons = [{ label: buttonLabel, url: href }]

  presence.setActivity(presenceData)
})
