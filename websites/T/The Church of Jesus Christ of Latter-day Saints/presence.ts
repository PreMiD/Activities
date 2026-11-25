import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1383261402197917828',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/logo.png',
  OldTestament = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/0.jpeg',
  NewTestament = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/1.jpeg',
  BookOfMormon = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/2.jpeg',
  DoctrineAndCovenants = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/3.jpeg',
  PearlOfGreatPrice = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/4.jpeg',
}

interface LibraryCollection {
  title: string
  image: string
}

const libraryCollections = new Map<string, LibraryCollection>()

const scriptureCollections: Record<string, LibraryCollection> = {
  '/study/scriptures/ot': {
    title: 'Old Testament',
    image: ActivityAssets.OldTestament,
  },
  '/study/scriptures/nt': {
    title: 'New Testament',
    image: ActivityAssets.NewTestament,
  },
  '/study/scriptures/bofm': {
    title: 'Book of Mormon',
    image: ActivityAssets.BookOfMormon,
  },
  '/study/scriptures/dc-testament': {
    title: 'Doctrine and Covenants',
    image: ActivityAssets.DoctrineAndCovenants,
  },
  '/study/scriptures/pgp': {
    title: 'Pearl of Great Price',
    image: ActivityAssets.PearlOfGreatPrice,
  },
}

// Covers from the Music Library's own collection tiles. These are only
// fallbacks for direct navigation or when browser storage is unavailable.
const musicCollectionFallbacks: Record<string, LibraryCollection> = {
  '/media/music/collections/hymns-for-home-and-church': {
    title: 'Hymns for Home and Church',
    image: 'https://www.churchofjesuschrist.org/imgs/37108f66ca8411eeba3aeeeeac1ea51f5750182f/full/400,/0/default',
  },
  '/media/music/collections/hymns': {
    title: 'Hymns of The Church of Jesus Christ of Latter-day Saints',
    image: 'https://www.churchofjesuschrist.org/imgs/5023629405813dccd787ddcc8056bcf16a1d791f/full/400,/0/default',
  },
  '/media/music/collections/childrens-songbook': {
    title: 'Children’s Songbook of The Church of Jesus Christ of Latter-day Saints',
    image: 'https://www.churchofjesuschrist.org/imgs/cec7d26a5f55ec87aeec196e50f71a4d91eb9698/full/400,/0/default',
  },
}

const libraryDetails: Record<string, string> = {
  '/study/scriptures': 'Browsing the scriptures...',
  '/study/general-conference': 'Browsing conference talks...',
}

let previousPath = ''
let browsingTimestamp = Math.floor(Date.now() / 1000)

function rememberLibraryCollection(pathname: string, collection: LibraryCollection) {
  const previous = libraryCollections.get(pathname)
  if (previous?.title === collection.title && previous.image === collection.image)
    return

  libraryCollections.set(pathname, collection)

  // Media Library navigation may reload the document and recreate this script.
  if (pathname.startsWith('/media/music/') || pathname.startsWith('/media/collection/')
    || pathname.startsWith('/media/video/')) {
    try {
      sessionStorage.setItem(`premid:church:${pathname.startsWith('/media/music/') ? 'music' : 'broadcasts'}:${pathname}`, JSON.stringify(collection))
    }
    catch {
      // The in-memory cache remains usable if browser storage is unavailable.
    }
  }
}

function getCachedLibraryCollection(pathname: string) {
  const collection = libraryCollections.get(pathname)
  if (collection || !(pathname.startsWith('/media/music/')
    || pathname.startsWith('/media/collection/') || pathname.startsWith('/media/video/'))) {
    return collection
  }

  try {
    const stored = sessionStorage.getItem(`premid:church:${pathname.startsWith('/media/music/') ? 'music' : 'broadcasts'}:${pathname}`)
    if (stored) {
      const data = JSON.parse(stored) as LibraryCollection
      if (typeof data?.title === 'string' && typeof data.image === 'string'
        && data.image.startsWith('https://')) {
        // Ignore any legacy collage fields in stored entries.
        const collection = { title: data.title, image: data.image }
        libraryCollections.set(pathname, collection)
        return collection
      }
    }
  }
  catch {
    // Fall back to the page's own artwork.
  }

  return undefined
}

function cacheLibraryCollections(root = '/study') {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    root === '/study' ? '#app main a[href]' : 'main#root a[href]',
  )

  for (const link of links) {
    // Resolve the raw href instead of depending on live anchor properties.
    const href = link.getAttribute('href') || link.href
    if (!href)
      continue

    let url: URL
    try {
      url = new URL(href, document.location.href)
    }
    catch {
      continue
    }

    if (url.origin !== new URL(document.location.href).origin)
      continue

    if (!url.pathname.startsWith(`${root}/`))
      continue

    const image = link.querySelector('img')
    const title = link.querySelector('h4')?.textContent?.trim()
      || link.textContent?.trim()

    if (!image || !title)
      continue

    const srcset = image.getAttribute('srcset') || image.srcset || ''
    const src = image.getAttribute('src') || image.src
    // Music tiles advertise 0w descriptors; use their actual URL width.
    const imageUrl = srcset.match(/(?:^|,\s*)(\S+)\s+640w(?:,|$)/)?.[1]
      || srcset.match(/(?:^|,\s*)(\S+\/400,\/0\/default)\s+\d+w(?:,|$)/)?.[1]
      || (root === '/media/music' ? src || image.currentSrc : image.currentSrc || src)

    if (!imageUrl)
      continue

    rememberLibraryCollection(url.pathname.replace(/\/+$/, ''), {
      title,
      image: imageUrl,
    })
  }
}

function findLibraryCollection(pathname: string) {
  let path = pathname

  // Prioritize custom scripture artwork.
  while (path.startsWith('/study/')) {
    const scripture = scriptureCollections[path]

    if (scripture) {
      return {
        ...scripture,
        pathname: path,
      }
    }

    path = path.substring(0, path.lastIndexOf('/'))
  }

  // Find the nearest dynamically discovered collection.
  path = pathname

  while (path.startsWith('/study/') || path.startsWith('/media/music/')) {
    const collection = getCachedLibraryCollection(path) ?? musicCollectionFallbacks[path]

    if (collection) {
      return {
        ...collection,
        pathname: path,
      }
    }

    path = path.substring(0, path.lastIndexOf('/'))
  }

  return undefined
}

function isMusicPath(pathname: string) {
  return pathname === '/media/music' || pathname.startsWith('/media/music/')
}

function formatMusicBrowsingArtwork(image: string) {
  // The original presence explicitly requested JPEGs from this image service.
  // Preserve that convention for collection covers sent to Discord.
  return /^https:\/\/www\.churchofjesuschrist\.org\/imgs\/[^?#]+\/default$/.test(image)
    ? `${image}.jpeg`
    : image
}

function getMusicPageTitle() {
  // The current page supplies its own title, even on a cold navigation.
  const titles = [
    document.querySelector('main h1')?.textContent?.trim(),
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content?.trim(),
    document.title.trim(),
  ]

  return titles.find(title => title && title !== 'Music Library' && title !== 'Media Library')
}

function findMusicBreadcrumb() {
  if (!document.location.pathname.startsWith('/media/music/songs/'))
    return undefined

  const link = document.querySelector<HTMLAnchorElement>(
    'main .eden-breadcrumbs__ol a[href*="/media/music/collections/"]',
  )

  if (link?.origin === document.location.origin) {
    const title = link.textContent?.trim()
    if (title)
      return { title, pathname: link.pathname.replace(/\/+$/, '') }
  }

  return undefined
}

function findMusicCollection(pathname: string, search: string) {
  const collection = findLibraryCollection(pathname)

  // Song pages are siblings of collections, not descendants. The Church
  // includes the originating collection's slug in its crumbs parameter.
  if (pathname.startsWith('/media/music/songs/')) {
    const slug = new URLSearchParams(search).get('crumbs')
    const parentPath = slug && /^[a-z0-9-]+$/i.test(slug)
      ? `/media/music/collections/${slug}`
      : pathname === document.location.pathname.replace(/\/+$/, '')
        ? findMusicBreadcrumb()?.pathname
        : undefined

    if (parentPath) {
      const parent = findLibraryCollection(parentPath)
      if (parent)
        return parent
    }
  }

  return collection
}

function getPageArtwork() {
  const image = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content?.trim()
  if (!image)
    return undefined

  try {
    const url = new URL(image, document.location.href)
    if (url.protocol === 'https:' || url.protocol === 'http:')
      return formatMusicBrowsingArtwork(url.href)
  }
  catch {
    // Ignore invalid page metadata.
  }
  return undefined
}

function applyNewsroomActivity(presenceData: PresenceData, pathname: string) {
  const isEvents = pathname === '/events' || pathname.startsWith('/events/')
    || pathname === '/event' || pathname.startsWith('/event/')
  presenceData.details = isEvents ? 'Browsing church events...' : 'Browsing the newsroom...'

  const isArticle = pathname.startsWith('/article/')
  const isEvent = pathname.startsWith('/event/')
  if (!isArticle && !isEvent)
    return

  const title = document.querySelector('#article-title')?.textContent?.trim()
    || document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content?.trim()
    || document.title.trim()
  if (!title)
    return

  presenceData.details = isArticle ? 'Reading a news article...' : 'Viewing a church event...'
  presenceData.state = title
  presenceData.smallImageKey = Assets.Reading
  presenceData.smallImageText = isArticle ? 'Reading the newsroom' : 'Viewing an event'
  presenceData.largeImageKey = getPageArtwork() || ActivityAssets.Logo
  presenceData.buttons = [{
    label: isArticle ? 'Read Article' : 'View Event',
    url: document.location.href,
  }]
}

function cacheBroadcastCollections() {
  // Recording collections have flat URLs; remember their tiles before navigating.
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-testid^="CollectionGridView-tile-"]')) {
    const href = link.getAttribute('href')
    if (!href)
      continue

    const url = new URL(href, document.location.href)
    if (url.origin !== document.location.origin
      || !/^\/media\/(?:collection|video)\//.test(url.pathname)) {
      continue
    }

    const title = link.textContent?.trim().replace(/^\d+\s+Items?\s*/i, '')
    const image = link.querySelector('img')
    const imageUrl = image?.srcset.match(/(?:^|,\s*)(\S+)\s+640w(?:,|$)/)?.[1]
      || image?.currentSrc || image?.src
    if (title && imageUrl)
      rememberLibraryCollection(url.pathname.replace(/\/+$/, ''), { title, image: imageUrl })
  }
}

function applyBroadcastActivity(presenceData: PresenceData, pathname: string) {
  if (pathname === '/media/broadcasts') {
    presenceData.details = 'Browsing broadcasts...'
    return true
  }

  if (pathname.startsWith('/media/broadcasts/')) {
    presenceData.details = 'Viewing a broadcast...'
    const title = document.querySelector('[data-testid="EventInfo-wrapper"] h1')?.textContent?.trim()
      || document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content?.trim()
      || document.title.trim()
    if (title && title !== 'Broadcasts') {
      presenceData.state = title
      presenceData.largeImageKey = getPageArtwork() || ActivityAssets.Logo
      presenceData.buttons = [{ label: 'View Broadcast', url: document.location.href }]
    }
    return true
  }

  const isLibrary = pathname === '/media/collection/broadcasts'
  const isCollection = pathname.startsWith('/media/collection/')
  const slug = pathname.split('/')[3]
  // The library uses flat collection URLs, including these non-prefixed slugs.
  const isBroadcastCollection = isCollection && Boolean(slug && (
    slug.startsWith('broadcasts-') || slug.endsWith('-broadcasts') || [
      'general-conference',
      'young-adult-and-youth-devotionals',
      'music-and-the-spoken-word',
      'christmas-devotionals',
      'worldwide-relief-society-devotional-and-testimony-meeting-broadcast',
      'byu-womens-conference',
      'byu-devotionals',
      'love-share-invite',
      'pres-nelsons-100-birthday-celebration',
      'be-one',
      'teaching-religion-to-youth-and-young-adults',
    ].includes(slug)
  ))
  const hasBroadcastBreadcrumb = isCollection && Array.from(document.querySelectorAll<HTMLAnchorElement>(
    'nav[aria-label="Breadcrumb"] a[href], .eden-breadcrumbs__ol a[href]',
  )).some(link => link.origin === document.location.origin
    && link.pathname.replace(/\/+$/, '') === '/media/collection/broadcasts')
  if (!isLibrary && !isBroadcastCollection && !hasBroadcastBreadcrumb)
    return false

  const collection = getCachedLibraryCollection(pathname)
  const title = document.querySelector('[data-testid="CollectionPage-title"]')?.textContent?.trim()
    || document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content?.trim()
    || document.title.trim()
    || collection?.title
  presenceData.details = !isLibrary && title
    ? `Browsing ${title}...`
    : 'Browsing the broadcast library...'
  presenceData.largeImageKey = getPageArtwork()
    || (collection ? formatMusicBrowsingArtwork(collection.image) : ActivityAssets.Logo)
  cacheBroadcastCollections()
  return true
}

function findActiveMedia<T extends HTMLMediaElement>(elements: T[]) {
  const available = elements.filter(media => !media.ended
    && !media.error && media.readyState >= 1)

  // Prefer playing media, then media that has already started.
  return available.find(media => !media.paused)
    ?? available.find(media => media.currentTime > 0)
}

function setPlaybackTimestamps(
  presenceData: PresenceData,
  currentTime: number,
  duration: number,
  playbackRate: number,
  advancing: boolean,
) {
  // Remove browsing timestamps, including when paused or buffering.
  delete presenceData.startTimestamp
  delete presenceData.endTimestamp

  if (advancing && Number.isFinite(duration) && duration > 0
    && Number.isFinite(currentTime) && currentTime >= 0
    && currentTime < duration && Number.isFinite(playbackRate) && playbackRate > 0) {
    const now = Date.now() / 1000
    presenceData.startTimestamp = Math.floor(now - currentTime / playbackRate)
    presenceData.endTimestamp = Math.floor(now + (duration - currentTime) / playbackRate)
  }
}

function applyPlaybackTimestamps(presenceData: PresenceData, media: HTMLMediaElement) {
  setPlaybackTimestamps(
    presenceData,
    media.currentTime,
    media.duration,
    media.playbackRate,
    !media.paused && !media.seeking && media.readyState >= 3,
  )
}

function parsePlaybackTime(text: string | null | undefined) {
  const value = text?.trim()

  if (!value || !/^\d+(?::[0-5]\d){1,2}$/.test(value))
    return Number.NaN

  return value.split(':').reduce((seconds, part) => seconds * 60 + Number(part), 0)
}

const audioProgress = new WeakMap<HTMLAudioElement, { source: string, elapsed: number, lastProgress: number }>()

function isAudioAdvancing(audio: HTMLAudioElement, paused: boolean, elapsed: number) {
  const hasNativeState = audio.readyState >= 1 || audio.paused === false
    || (Number.isFinite(audio.duration) && audio.duration > 0)

  if (paused || audio.seeking || hasNativeState) {
    audioProgress.delete(audio)
    return !paused && !audio.paused && !audio.seeking && audio.readyState >= 3
  }

  // A pause control alone does not prove that playback is advancing.
  if (!Number.isFinite(elapsed)) {
    audioProgress.delete(audio)
    return false
  }

  const source = audio.currentSrc || audio.src
  const now = Date.now()
  const previous = audioProgress.get(audio)
  let lastProgress = 0
  if (previous && previous.source === source && elapsed >= previous.elapsed) {
    lastProgress = elapsed > previous.elapsed ? now : previous.lastProgress
  }

  audioProgress.set(audio, { source, elapsed, lastProgress })
  // The rendered clock has second-level precision, so allow a short grace period.
  return lastProgress > 0 && now - lastProgress <= 2000
}

function readAudioPlayback(audio: HTMLAudioElement) {
  // Both library players expose their playback state through accessible controls.
  // These also work when live media properties are unavailable to PreMiD.
  const player = audio.closest('[data-testid="wrapper"], [data-test-id="wrapper"]')
  const pauseButton = player?.querySelector('button[aria-label="Pause"], button[aria-label="Pause Song"]')
  const playButton = player?.querySelector('button[aria-label="Play"], button[aria-label="Play Song"]')
  const range = player?.querySelector('input[data-test-id="range"]')
  let elapsed = Number.NaN
  let duration = Number.NaN

  // The range has an additional wrapper in the Music Library.
  let slider = range?.parentElement
  while (slider && slider !== player) {
    elapsed = parsePlaybackTime(slider.previousElementSibling?.textContent)
    duration = parsePlaybackTime(slider.nextElementSibling?.textContent)
    if (Number.isFinite(elapsed) && Number.isFinite(duration))
      break

    slider = slider.parentElement
  }
  const hasControls = Boolean(pauseButton || playButton)
  const hasNativeTiming = audio.readyState >= 1
    && Number.isFinite(audio.currentTime)
    && Number.isFinite(audio.duration) && audio.duration > 0

  if (audio.error || audio.ended) {
    audioProgress.delete(audio)
    return undefined
  }

  if (!hasControls && !hasNativeTiming && audio.paused !== false)
    return undefined

  const paused = hasControls ? !pauseButton : audio.paused
  // Prefer native timing when it agrees with the rendered player.
  const nativeAgrees = hasNativeTiming && audio.paused === paused
    && (!Number.isFinite(elapsed) || Math.abs(audio.currentTime - elapsed) < 3)
    && (!Number.isFinite(duration) || Math.abs(audio.duration - duration) < 3)

  const currentTime = nativeAgrees || (!Number.isFinite(elapsed) && hasNativeTiming)
    ? audio.currentTime
    : elapsed
  const totalTime = nativeAgrees || (!Number.isFinite(duration) && hasNativeTiming)
    ? audio.duration
    : duration
  const playbackRate = Number.isFinite(audio.playbackRate) && audio.playbackRate > 0
    ? audio.playbackRate
    : 1

  const advancing = isAudioAdvancing(audio, paused, elapsed)

  if (paused && !(currentTime > 0))
    return undefined

  if (paused && Number.isFinite(totalTime) && currentTime >= totalTime)
    return undefined

  return {
    paused,
    currentTime,
    duration: totalTime,
    playbackRate,
    advancing,
  }
}

function applyVideoActivity(presenceData: PresenceData) {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('main video'))
    .filter(video => video.getClientRects().length > 0
      || document.pictureInPictureElement === video)

  // Prefer a playing video over a previously paused one.
  const video = findActiveMedia(videos)

  // Opening a page with an untouched video should still count as reading.
  if (!video)
    return false

  const player = video.closest('.bitmovinplayer-container')
  const playbackButtonTitle = player?.querySelector<HTMLButtonElement>(
    '.bmpui-ui-playbacktogglebutton[title]',
  )?.title

  const playerTitle = playbackButtonTitle && /^Play\/Pause\s/.test(playbackButtonTitle)
    ? playbackButtonTitle.slice('Play/Pause'.length).trim()
    : undefined
  const title = playerTitle
    || document.title.trim()
    || 'Video'

  const poster = player?.querySelector<HTMLElement>('.bitmovinplayer-poster')
  const posterUrl = poster?.style.backgroundImage.match(
    /^url\(["']?(.*?)["']?\)$/,
  )?.[1]

  const pageImage = document.querySelector<HTMLMetaElement>(
    'meta[property="og:image"]',
  )?.content

  const article = video.closest<HTMLElement>('article#main[data-content-type]')
  const isConferenceVideo = article?.dataset.contentType?.startsWith('general-conference-')
    && title === document.title.trim()

  presenceData.type = ActivityType.Watching
  presenceData.details = `Watching ${title}`
  presenceData.largeImageKey = video.poster || posterUrl || (pageImage ? getPageArtwork() : undefined)
    || presenceData.largeImageKey || ActivityAssets.Logo
  presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
  presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'

  // Keep the conference speaker and calling for the talk's own video.
  if (!isConferenceVideo)
    delete presenceData.state

  const conferenceButton = isConferenceVideo ? presenceData.buttons?.[1] : undefined

  presenceData.buttons = [{
    label: isConferenceVideo ? 'Watch Conference Talk' : 'Watch Video',
    url: document.location.href,
  }]

  if (conferenceButton)
    presenceData.buttons.push(conferenceButton)

  applyPlaybackTimestamps(presenceData, video)
  return true
}

function getMusicCard(audio: HTMLAudioElement) {
  return audio.closest('[data-test-id="wrapper"], [data-testid="wrapper"]')?.parentElement
}

function getMusicArtwork(card: Element | null | undefined) {
  const image = card?.querySelector('img')
  return image?.srcset.match(/(?:^|,\s*)(\S+)\s+500w(?:,|$)/)?.[1]
    || image?.src || image?.currentSrc
}

function findMusicSongUrl(title: string) {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('main a[href*="/media/music/songs/"]'))
    .filter(link => link.origin === document.location.origin)
  const normalizedTitle = title.replace(/^\d+\.\s*/, '')
  const matches = links.filter(link => link.textContent?.trim().replace(/^\d+\.\s*/, '') === normalizedTitle)

  // The collection exposes the active song (including its hymn number) on its row.
  const active = matches.filter(link => link.parentElement?.querySelector(
    'button[aria-pressed="true"][aria-label^="Pause Song "]',
  ))
  if (active.length > 0)
    return active.length === 1 && active[0] ? new URL(active[0].href) : undefined

  if (/^\d+\.\s*/.test(title)) {
    const numbered = matches.filter(link => link.textContent?.trim() === title)
    if (numbered.length > 0)
      return numbered.length === 1 && numbered[0] ? new URL(numbered[0].href) : undefined
  }

  // An individual song page identifies the tune by its route. Do not choose
  // a different song with the same title from the previous/next navigation.
  if (document.location.pathname.startsWith('/media/music/songs/') && getMusicPageTitle() === title) {
    if (matches.every(link => new URL(link.href).pathname === document.location.pathname))
      return new URL(document.location.href)
    return undefined
  }

  // A title alone cannot distinguish different tunes with the same name.
  return matches.length === 1 && matches[0] ? new URL(matches[0].href) : undefined
}

function applyMusicActivity(
  presenceData: PresenceData,
  audio: HTMLAudioElement,
  playback: NonNullable<ReturnType<typeof readAudioPlayback>>,
) {
  const card = getMusicCard(audio)
  const title = card?.querySelector('h5')?.textContent?.trim()

  if (!title)
    return false

  const recording = card?.querySelector<HTMLSelectElement>('select[aria-label="Select Recording Type"]')
    ?.selectedOptions[0]
    ?.textContent
    ?.trim()
  const album = document.querySelector('main h1')?.textContent?.trim()
  const imageUrl = getMusicArtwork(card)

  const songUrl = findMusicSongUrl(title)
  // The song-list filters are unnecessary for opening an individual recording.
  songUrl?.searchParams.delete('songListFilters')

  const shortTitle = title.length > 15 ? `${title.substring(0, 15)}...` : title
  presenceData.type = ActivityType.Listening
  presenceData.details = title
  presenceData.smallImageKey = playback.paused ? Assets.Pause : Assets.Play
  presenceData.smallImageText = playback.paused ? 'Paused' : 'Playing'

  const cachedCollection = (songUrl ? findMusicCollection(songUrl.pathname, songUrl.search) : undefined)
    ?? findMusicCollection(document.location.pathname.replace(/\/+$/, ''), document.location.search)
  presenceData.largeImageKey = imageUrl || cachedCollection?.image
    || presenceData.largeImageKey || ActivityAssets.Logo
  const breadcrumb = album === title ? findMusicBreadcrumb() : undefined
  const collection = breadcrumb?.title || (album && album !== title && album !== 'Music Library'
    ? album
    : cachedCollection?.title)
  const state = [collection, recording].filter(Boolean).join(' - ')
  if (state)
    presenceData.state = state
  else
    delete presenceData.state

  if (songUrl) {
    presenceData.buttons = [{
      label: `Listen to ${shortTitle}`,
      url: songUrl.href,
    }]
  }
  else {
    delete presenceData.buttons
  }

  setPlaybackTimestamps(
    presenceData,
    playback.currentTime,
    playback.duration,
    playback.playbackRate,
    playback.advancing,
  )
  return true
}

function applyAudioActivity(presenceData: PresenceData) {
  const audios = Array.from(document.querySelectorAll<HTMLAudioElement>('main audio'))
  const playbackStates = audios.map(audio => ({ audio, playback: readAudioPlayback(audio) }))
  const active = playbackStates.find(state => state.playback && !state.playback.paused)
    ?? playbackStates.find(state => state.playback !== undefined)

  if (!active?.playback)
    return false

  const { audio, playback } = active
  const { pathname, href } = document.location

  if (isMusicPath(pathname))
    return applyMusicActivity(presenceData, audio, playback)

  const article = document.querySelector<HTMLElement>('article#main[data-content-type][data-uri]')

  // The Gospel Library player reads the current article.
  const articleUri = article?.dataset.uri
  if (!articleUri || `/study${articleUri}` !== pathname.replace(/\/+$/, ''))
    return false

  const title = document.title.trim()
  if (!title)
    return false

  const isConference = article?.dataset.contentType?.startsWith('general-conference-')
  const collectionButton = presenceData.buttons?.[1]

  presenceData.type = ActivityType.Listening
  presenceData.details = `Listening to ${title}`
  presenceData.smallImageKey = playback.paused ? Assets.Pause : Assets.Play
  presenceData.smallImageText = playback.paused ? 'Paused' : 'Playing'

  if (isConference) {
    const author = article?.querySelector('.author-name')?.textContent?.trim()
    const role = article?.querySelector('.author-role')?.textContent?.trim()

    if (author)
      presenceData.state = role ? `${author}, ${role}` : author
    else
      delete presenceData.state
  }
  else {
    const collection = findLibraryCollection(pathname.replace(/\/+$/, ''))

    if (collection)
      presenceData.state = collection.title
    else
      delete presenceData.state
  }

  presenceData.buttons = [{
    label: isConference ? 'Listen to Conference Talk' : 'Listen to Audio',
    url: href,
  }]

  if (collectionButton)
    presenceData.buttons.push(collectionButton)

  setPlaybackTimestamps(
    presenceData,
    playback.currentTime,
    playback.duration,
    playback.playbackRate,
    playback.advancing,
  )
  return true
}

presence.on('UpdateData', () => {
  const { pathname, href, origin, search } = document.location
  const path = pathname.split('/').filter(Boolean)
  const currentPath = `/${path.join('/')}`

  if (currentPath !== previousPath) {
    previousPath = currentPath
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }

  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Search,
    smallImageText: 'Browsing...',
    startTimestamp: browsingTimestamp,
    details: 'Browsing...',
  }

  const isNewsroom = document.location.hostname === 'newsroom.churchofjesuschrist.org'
  const section = isNewsroom ? 'newsroom' : isMusicPath(currentPath) ? 'music' : path[0]

  switch (section) {
    case 'my-home':
      presenceData.details = 'Browsing their home page...'
      break

    case 'study': {
      const article = document.querySelector<HTMLElement>(
        'article#main[data-content-type][data-uri]',
      )

      const articleUri = article?.dataset.uri

      // Distinguish reading content from collection navigation.
      const isReading = articleUri
        && `/study${articleUri}` === currentPath
        && !article?.querySelector('nav.manifest')
        && !/\/_(?:manifest|contents)$/.test(articleUri)

      if (!isReading)
        cacheLibraryCollections()

      const collection = findLibraryCollection(currentPath)
      const scripture = collection
        ? scriptureCollections[collection.pathname]
        : undefined

      const collectionTitle = scripture
        ? `the ${scripture.title}`
        : collection?.title

      if (collection)
        presenceData.largeImageKey = collection.image

      const conference = currentPath.match(
        /^\/study\/general-conference\/(\d{4})\/(04|10)(?:\/|$)/,
      )

      const conferenceDate = conference
        ? `${conference[2] === '04' ? 'April' : 'October'} ${conference[1]}`
        : undefined

      // Preserve the selected language in collection links.
      const language = new URLSearchParams(search).get('lang')

      if (isReading) {
        const title = document.title.trim()

        // General Conference reading.
        if (
          article?.dataset.contentType?.startsWith('general-conference-')
          && title
        ) {
          const author = article.querySelector('.author-name')
            ?.textContent
            ?.trim()

          const role = article.querySelector('.author-role')
            ?.textContent
            ?.trim()

          const image = document.querySelector<HTMLMetaElement>(
            'meta[property="og:image"]',
          )?.content

          presenceData.details = `Reading the ${title}`
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = `The ${title}`
          presenceData.largeImageKey = image || ActivityAssets.Logo

          if (author)
            presenceData.state = role ? `${author}, ${role}` : author

          presenceData.buttons = [
            {
              label: 'View Conference Talk',
              url: href,
            },
          ]

          if (conference && conferenceDate) {
            const conferenceUrl = new URL(
              `/study/general-conference/${conference[1]}/${conference[2]}`,
              origin,
            )

            if (language)
              conferenceUrl.searchParams.set('lang', language)

            presenceData.buttons.push({
              label: `Read Conference ${conferenceDate}`,
              url: conferenceUrl.href,
            })
          }

          break
        }

        // Generic reading, including scriptures and study materials.
        if (title) {
          const shortTitle = title.length > 20
            ? `${title.substring(0, 20)}...`
            : title

          presenceData.details = collectionTitle
            ? `Reading ${collectionTitle}`
            : 'Reading...'

          presenceData.state = title
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = scripture
            ? `The ${scripture.title}`
            : collection?.title || 'Reading'

          presenceData.buttons = [
            {
              label: `View ${shortTitle}`,
              url: href,
            },
          ]

          if (collection && collection.pathname !== currentPath) {
            const collectionUrl = new URL(
              collection.pathname,
              origin,
            )

            if (language)
              collectionUrl.searchParams.set('lang', language)

            presenceData.buttons.push({
              label: `Read ${collectionTitle}`.substring(0, 32),
              url: collectionUrl.href,
            })
          }

          break
        }
      }

      // General Conference collection browsing.
      if (conferenceDate) {
        presenceData.details = `Browsing ${conferenceDate} conference talks...`
        break
      }

      // Generic library browsing.
      presenceData.details = libraryDetails[currentPath]
        ?? (collectionTitle
          ? `Browsing ${collectionTitle}...`
          : 'Browsing the library...')

      break
    }

    case 'music': {
      // Establish the Music Library activity before looking for page metadata.
      presenceData.details = 'Browsing the music library...'

      cacheLibraryCollections('/media/music')
      const collection = findMusicCollection(currentPath, search)
      const isSong = currentPath.startsWith('/media/music/songs/')
      const pageTitle = getMusicPageTitle()
      const title = isSong ? pageTitle : pageTitle || collection?.title

      if (currentPath !== '/media/music' && title)
        presenceData.details = `Browsing ${title}...`

      if (collection)
        presenceData.largeImageKey = formatMusicBrowsingArtwork(collection.image)

      if (title && (isSong || currentPath.startsWith('/media/music/collections/'))) {
        const audio = document.querySelector<HTMLAudioElement>('main audio')
        const card = audio ? getMusicCard(audio) : undefined
        const trackTitle = card?.querySelector('h5')?.textContent?.trim()
        const breadcrumb = isSong ? findMusicBreadcrumb() : undefined
        const songUrl = !isSong && trackTitle ? findMusicSongUrl(trackTitle) : undefined
        const songCollection = songUrl?.searchParams.get('crumbs')
        const playerMatchesPage = isSong
          ? trackTitle === title
          : songCollection === currentPath.split('/').pop()

        // The player exposes the cover even before playback starts.
        // Do not use artwork from a track belonging to another collection.
        if (playerMatchesPage && (!collection || collection.pathname !== currentPath)) {
          const image = getMusicArtwork(card)
          if (image) {
            if (!collection || !isSong)
              presenceData.largeImageKey = formatMusicBrowsingArtwork(image)

            const parent = isSong ? breadcrumb : { pathname: currentPath, title }
            if (parent && !getCachedLibraryCollection(parent.pathname))
              rememberLibraryCollection(parent.pathname, { title: parent.title, image })
          }
        }

        if (breadcrumb)
          presenceData.state = breadcrumb.title
      }

      break
    }

    case 'newsroom':
      applyNewsroomActivity(presenceData, currentPath)
      break

    case 'media':
      if (!applyBroadcastActivity(presenceData, currentPath))
        presenceData.details = 'Browsing the media library...'
      break

    case 'life':
      presenceData.details = 'Browsing life help resources...'
      break

    case 'callings':
      presenceData.details = 'Browsing callings...'
      break

    case 'serve':
      presenceData.details = 'Browsing service opportunities...'
      break

    case 'temples':
      presenceData.details = 'Browsing temples...'
      break

    case 'learn':
      presenceData.details = path[1] === 'family-history'
        ? 'Browsing family history...'
        : 'Browsing topics and questions...'
      break

    case 'family-history':
      presenceData.details = 'Browsing family history...'
      break

    case 'welcome':
      presenceData.details = 'Viewing a welcome section!'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Welcome to the Church of Jesus Christ of Latter-day Saints'
      break

    default:
      break
  }

  // Video always takes priority over audio, including paused videos.
  if (isNewsroom || path[0] === 'study' || path[0] === 'media') {
    if (!applyVideoActivity(presenceData))
      applyAudioActivity(presenceData)
  }

  presence.setActivity(presenceData)
})
