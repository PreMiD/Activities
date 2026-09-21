import { ActivityType, Assets, getTimestamps, StatusDisplayType, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '640561280800915456',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/Bandcamp/assets/logo.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    pause: 'general.paused',
    browse: 'general.browsing',
    view: 'general.view',
    readingArticle: 'general.readingArticle',
    viewProfile: 'general.viewProfile',
    viewWishlist: 'general.viewWishlist',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

interface Settings {
  cover: boolean
  timestamp: boolean
  links: boolean
  displayType: number
}

function text(selector: string, root: ParentNode = document): string | undefined {
  return root.querySelector(selector)?.textContent?.trim() || undefined
}

function link(element: Element | null | undefined): string | undefined {
  const href = element?.getAttribute('href')
  if (!href || href === '#')
    return undefined

  try {
    // Drop tracking parameters such as ?from=discover_page.
    const url = new URL(href, document.location.href)

    return url.origin + url.pathname
  }
  catch {
    return undefined
  }
}

const pageUrl = () => document.location.origin + document.location.pathname
const isTrackPage = () => document.location.pathname.includes('/track/')
const isAlbumPage = () => document.location.pathname.includes('/album/')
const isDiscover = () => document.location.hostname === 'bandcamp.com'

interface Player {
  root: Element
  playing: boolean
  title?: string
  titleUrl?: string
  elapsed: number
  duration: number
}

interface PlayerData {
  playing: boolean
  title?: string
  titleUrl?: string
  elapsedText?: string
  totalText?: string
}

function createPlayer(root: Element, data: PlayerData): Player | null {
  const elapsed = timestampFromFormat(data.elapsedText ?? '')

  // Bandcamp preloads the first track into the player, paused at 0:00, so a paused track only
  // counts once it has actually been played into. It keeps its elapsed time while paused.
  if (!data.playing && elapsed === 0)
    return null

  return {
    root,
    playing: data.playing,
    title: data.title,
    titleUrl: data.titleUrl,
    elapsed,
    duration: timestampFromFormat(data.totalText ?? ''),
  }
}

// Artist, album and track pages.
function getPagePlayer(): Player | null {
  const root = document.querySelector('#trackInfoInner .inline_player')
  if (!root)
    return null

  return createPlayer(root, {
    playing: !!root.querySelector('.playbutton.playing'),
    title: text('.title-section .title', root),
    titleUrl: link(root.querySelector('.title-section a')),
    elapsedText: text('.time_elapsed', root),
    totalText: text('.time_total', root),
  })
}

// bandcamp.com/discover, which is a separate app with its own markup.
function getDiscoverPlayer(): Player | null {
  const root = document.querySelector('.discover-player')
  if (!root)
    return null

  return createPlayer(root, {
    // The play button's aria-label is localized, the Media Session state is not.
    playing: navigator.mediaSession.playbackState === 'playing',
    title: text('.player-info .title', root),
    elapsedText: text('.playback-time.current', root),
    totalText: text('.playback-time.total', root),
  })
}

interface TrackInfo {
  title?: string
  artist?: string
  artistUrl?: string
  album?: string
  albumUrl?: string
}

function getDiscoverTrackInfo(player: Player): TrackInfo {
  const links = Array.from(player.root.querySelectorAll('.player-info a'))
  const albumLink = links.find(anchor => /\/(?:album|track)\//.test(anchor.getAttribute('href') ?? ''))
  const artistLink = links.find(anchor => anchor !== albumLink)

  // The visible links carry a localized "from " / "by " prefix, of which only the English one is removed.
  return {
    title: player.title,
    artist: navigator.mediaSession.metadata?.artist || artistLink?.textContent?.trim().replace(/^by\s+/i, ''),
    artistUrl: link(artistLink),
    album: albumLink?.textContent?.trim().replace(/^from\s+/i, ''),
    albumUrl: link(albumLink),
  }
}

function getTrackInfo(player: Player | null): TrackInfo {
  if (player && isDiscover())
    return getDiscoverTrackInfo(player)

  const heading = text('#name-section h2.trackTitle')
  // On track pages the first link in the byline is the album, so the artist is always the last one.
  const artist = Array.from(document.querySelectorAll('#name-section h3 > span > a')).pop()
  const fromAlbum = document.querySelector('#name-section .fromAlbum')

  return {
    title: player?.title ?? (isTrackPage() ? heading : undefined),
    artist: artist?.textContent?.trim(),
    artistUrl: link(artist),
    album: isTrackPage() ? fromAlbum?.textContent?.trim() : heading,
    albumUrl: isTrackPage() ? link(fromAlbum?.closest('a')) : pageUrl(),
  }
}

function getCover(settings: Settings, player?: Player): string {
  if (!settings.cover)
    return ActivityAssets.Logo

  // Discover shows the cover in the pane around its player. Elsewhere Bandcamp wraps the
  // artwork in <picture>, so the <img> is not a direct child of .popupImage.
  const image = player?.root.closest('.tralbum-purchase-options-browser')?.querySelector<HTMLImageElement>('img.cover')
    ?? document.querySelector<HTMLImageElement>('#tralbumArt .popupImage img')
    ?? document.querySelector<HTMLImageElement>('.popupImage img')

  return image?.src.replace(/_\d+\.jpg$/, '_5.jpg') ?? ActivityAssets.Logo
}

function getListeningData(player: Player, title: string, track: TrackInfo, settings: Settings): MediaPresenceData {
  const presenceData: MediaPresenceData = {
    type: ActivityType.Listening,
    largeImageKey: getCover(settings, player),
    details: title,
  }

  if (track.artist)
    presenceData.state = track.artist
  if (track.album)
    presenceData.largeImageText = track.album

  if (settings.displayType === 1)
    presenceData.statusDisplayType = StatusDisplayType.State
  else if (settings.displayType === 2)
    presenceData.statusDisplayType = StatusDisplayType.Details

  if (settings.links) {
    const detailsUrl = player.titleUrl ?? (isTrackPage() ? pageUrl() : undefined)

    if (detailsUrl)
      presenceData.detailsUrl = detailsUrl
    if (track.artistUrl)
      presenceData.stateUrl = track.artistUrl
    if (track.albumUrl)
      presenceData.largeImageUrl = track.albumUrl
  }

  if (player.playing) {
    const [startTimestamp, endTimestamp] = getTimestamps(player.elapsed, player.duration)

    presenceData.startTimestamp = startTimestamp
    // The total time can be empty for a moment while a track loads.
    if (player.duration > player.elapsed)
      presenceData.endTimestamp = endTimestamp
  }
  else {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = strings.pause
  }

  return presenceData
}

function getBrowsingData(track: TrackInfo, settings: Settings): PresenceData {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const fan = isDiscover() ? text('#fan-bio-vm .name h1 span') : undefined

  if (document.location.hostname === 'daily.bandcamp.com') {
    const article = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content

    if (article && document.location.pathname !== '/') {
      presenceData.details = strings.readingArticle
      presenceData.state = article
      presenceData.smallImageKey = Assets.Reading
    }
    else {
      presenceData.details = 'Bandcamp Daily'
      presenceData.state = strings.browse
    }
  }
  else if (isAlbumPage() || isTrackPage()) {
    const name = [track.title ?? track.album, track.artist].filter(Boolean).join(' by ')

    presenceData.details = isTrackPage() ? 'Viewing track' : 'Viewing album'
    if (name)
      presenceData.state = name
    presenceData.largeImageKey = getCover(settings)
  }
  else if (fan) {
    presenceData.details = document.location.pathname.endsWith('/wishlist') ? strings.viewWishlist : strings.viewProfile
    presenceData.state = fan
  }
  else {
    presenceData.details = strings.view
    if (document.title)
      presenceData.state = document.title
  }

  return presenceData
}

presence.on('UpdateData', async () => {
  const [cover, timestamp, links, displayType, newLang] = await Promise.all([
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('links'),
    presence.getSetting<number>('displayType'),
    presence.getSetting<string>('lang').catch(() => 'en'),
  ])
  const settings: Settings = { cover, timestamp, links, displayType }

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const player = isDiscover() ? getDiscoverPlayer() : getPagePlayer()
  const track = getTrackInfo(player)
  const { title } = track
  const presenceData = player && title
    ? getListeningData(player, title, track, settings)
    : getBrowsingData(track, settings)

  if (!settings.timestamp) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
