import { ActivityType, Assets, getTimestamps } from 'premid'

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeHeaven/assets/logo.png',
}

const presence = new Presence({
  clientId: '1488094461455241266',
})

const strings = presence.getStrings({
  buttonViewAnime: 'general.buttonViewAnime',
  browsing: 'general.browsing',
  paused: 'general.paused',
  playing: 'general.playing',
})

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastContext = ''
const animeCoverCache = new Map<string, string>()
const animeCoverRequests = new Map<string, Promise<string | undefined>>()

function cleanText(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim() || undefined
}

function toAbsoluteUrl(url: string) {
  return new URL(url, document.location.href).href
}

function updateBrowsingTimestamp(context: string) {
  if (context !== lastContext) {
    lastContext = context
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }
}

function getBookmarkCount() {
  return localStorage.getItem('bookmark')?.split('*').filter(Boolean).length || 0
}

async function getAnimeCover(url: string) {
  const normalizedUrl = toAbsoluteUrl(url)

  if (animeCoverCache.has(normalizedUrl))
    return animeCoverCache.get(normalizedUrl)

  const pendingRequest = animeCoverRequests.get(normalizedUrl)

  if (pendingRequest)
    return pendingRequest

  const request = fetch(normalizedUrl)
    .then(response => response.text())
    .then((html) => {
      const parsedDocument = new DOMParser().parseFromString(html, 'text/html')
      const posterUrl = cleanText(
        parsedDocument.querySelector<HTMLImageElement>('.posterimg')?.src,
      ) ?? cleanText(
        parsedDocument
          .querySelector<HTMLMetaElement>('meta[property="og:image"]')
          ?.getAttribute('content'),
      )

      if (!posterUrl)
        return undefined

      const absolutePosterUrl = new URL(posterUrl, normalizedUrl).href
      animeCoverCache.set(normalizedUrl, absolutePosterUrl)
      return absolutePosterUrl
    })
    .catch(() => undefined)
    .finally(() => animeCoverRequests.delete(normalizedUrl))

  animeCoverRequests.set(normalizedUrl, request)
  return request
}

function getPageTitle() {
  return cleanText(
    document.title
      .replace(/\s*\|\s*AnimeHeaven\.Me$/i, '')
      .replace(/^AnimeHeaven\.Me$/i, ''),
  )
}

function getSeasonLabel(pathname: string) {
  const seasonMatch = pathname.match(/^\/(\d{4})(spring|summer|fall|winter)\.php$/i)

  if (!seasonMatch?.[1] || !seasonMatch[2])
    return

  const year = seasonMatch[1]
  const season = seasonMatch[2]
  return `${season.charAt(0).toUpperCase()}${season.slice(1).toLowerCase()} ${year}`
}

function getAnimeInfoText() {
  const [episodes, year] = Array.from(
    document.querySelectorAll<HTMLDivElement>('.infoyear .inline'),
  )
    .map(info => cleanText(info.textContent))
    .filter((info): info is string => Boolean(info))

  const parts = [
    episodes ? `${episodes} episodes` : undefined,
    year,
  ].filter((part): part is string => Boolean(part))

  return cleanText(parts.join(' | '))
}

presence.on('UpdateData', async () => {
  const [
    { browsing, buttonViewAnime, paused, playing },
    showButtons,
    showBrowsingTimestamp,
  ] = await Promise.all([
    strings,
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showBrowsingTimestamp'),
  ])

  const { href, pathname, search } = document.location
  const lowerPath = pathname.toLowerCase()
  const query = new URLSearchParams(search)
  const pageTitle = getPageTitle()

  const presenceData = {
    name: 'AnimeHeaven',
    largeImageKey: ActivityAssets.Logo,
  } as PresenceData

  if (lowerPath === '/gate.php') {
    const video = document.querySelector<HTMLVideoElement>('#vid')
    const animeTitle = cleanText(document.querySelector('.linetitle3 a')?.textContent)
    const episodeText = cleanText(document.querySelector('.linetitle3')?.textContent)
    const episodeNumber = episodeText?.match(/Episode\s+([A-Z0-9.-]+)/i)?.[1]
    const animeUrl = document.querySelector<HTMLAnchorElement>('.linetitle3 a')?.href
    const coverArt = animeUrl ? await getAnimeCover(animeUrl) : undefined

    updateBrowsingTimestamp(`watch:${animeTitle ?? href}:${episodeNumber ?? ''}`)

    presenceData.name = animeTitle ?? 'AnimeHeaven'
    presenceData.type = ActivityType.Watching
    presenceData.details = episodeNumber ? `Episode ${episodeNumber}` : 'Watching episode'
    presenceData.state = video?.paused ? paused : playing
    presenceData.largeImageKey = coverArt ?? ActivityAssets.Logo
    presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video?.paused ? paused : playing

    if (
      video
      && !video.paused
      && Number.isFinite(video.duration)
      && video.duration > 0
    ) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
        video.currentTime,
        video.duration,
      )
    }

    if (showButtons && animeUrl) {
      presenceData.buttons = [
        {
          label: buttonViewAnime,
          url: new URL(animeUrl, href).href,
        },
      ]
    }
  }
  else if (lowerPath === '/anime.php') {
    const animeTitle = cleanText(document.querySelector('.infotitle')?.textContent)
    const posterArt = document.querySelector<HTMLImageElement>('.posterimg')?.src

    updateBrowsingTimestamp(`anime:${animeTitle ?? href}`)

    presenceData.name = animeTitle ?? 'AnimeHeaven'
    presenceData.details = animeTitle ?? 'Viewing anime'
    presenceData.state = getAnimeInfoText() ?? 'Viewing anime details'
    presenceData.largeImageKey = posterArt ?? ActivityAssets.Logo
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing details'
  }
  else if (lowerPath === '/search.php') {
    const searchQuery = cleanText(query.get('s'))

    updateBrowsingTimestamp(`search:${searchQuery ?? ''}`)

    presenceData.details = 'Searching anime'
    presenceData.state = searchQuery ? `Query: ${searchQuery}` : 'Search results'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
  }
  else if (lowerPath === '/bookmarks.php') {
    const bookmarkCount = getBookmarkCount()

    updateBrowsingTimestamp(`bookmarks:${bookmarkCount}`)

    presenceData.details = 'Managing bookmarks'
    presenceData.state = bookmarkCount > 0 ? `${bookmarkCount} saved anime` : 'My Bookmarks'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = browsing
  }
  else if (lowerPath === '/new.php') {
    updateBrowsingTimestamp('new')

    presenceData.details = 'Browsing new episodes'
    presenceData.state = 'Latest releases'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = browsing
  }
  else if (lowerPath === '/popular.php') {
    updateBrowsingTimestamp('popular')

    presenceData.details = 'Browsing popular anime'
    presenceData.state = 'Popular Today'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = browsing
  }
  else if (lowerPath === '/tags.php') {
    const tag = cleanText(query.get('tag'))

    updateBrowsingTimestamp(`tag:${tag ?? ''}`)

    presenceData.details = 'Browsing tag'
    presenceData.state = tag ?? 'Anime tags'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = browsing
  }
  else if (lowerPath === '/tools.php') {
    updateBrowsingTimestamp('tools')

    presenceData.details = 'Using AnimeHeaven tools'
    presenceData.state = 'Utilities'
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = browsing
  }
  else if (lowerPath.startsWith('/up')) {
    updateBrowsingTimestamp('upload')

    presenceData.details = 'Using upload tools'
    presenceData.state = 'AnimeHeaven tools'
    presenceData.smallImageKey = Assets.Uploading
    presenceData.smallImageText = 'Uploading'
  }
  else if (lowerPath === '/randomdot.php') {
    updateBrowsingTimestamp('randomdot')

    presenceData.details = 'Using random dot tool'
    presenceData.state = 'AnimeHeaven tools'
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = browsing
  }
  else if (lowerPath === '/snakev2.php') {
    updateBrowsingTimestamp('snake')

    presenceData.details = 'Playing Snake'
    presenceData.state = 'AnimeHeaven tools'
    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = 'Playing'
  }
  else if (lowerPath === '/random.php') {
    updateBrowsingTimestamp('random')

    presenceData.details = 'Picking a random anime'
    presenceData.state = 'Discovering something new'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = browsing
  }
  else {
    const seasonLabel = getSeasonLabel(lowerPath)

    updateBrowsingTimestamp(seasonLabel ?? lowerPath)

    if (lowerPath === '/') {
      presenceData.details = 'Browsing homepage'
      presenceData.state = pageTitle ?? 'Subbed Anime Schedule'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = browsing
    }
    else if (seasonLabel) {
      presenceData.details = 'Browsing seasonal anime'
      presenceData.state = seasonLabel
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = browsing
    }
    else {
      presenceData.details = 'Browsing AnimeHeaven'
      presenceData.state = pageTitle ?? 'Anime website'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = browsing
    }
  }

  if (showBrowsingTimestamp && lowerPath !== '/gate.php')
    presenceData.startTimestamp = browsingTimestamp

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
