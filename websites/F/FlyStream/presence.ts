import { ActivityType, Assets, getTimestampsFromMedia, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1542153163312857159',
})
const openedAt = Math.floor(Date.now() / 1000)
const site = 'https://flystream.net'

enum ActivityAssets {
  Logo = 'https://i.imgur.com/Ltlbamw.png',
}

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>

const browsePages: Record<string, string> = {
  watchlist: 'My Profile',
  history: 'Watch History',
  calendar: 'Release Calendar',
  leaks: 'New Releases',
  notifications: 'Notifications',
  people: 'People',
  wrapped: 'Wrapped',
  apps: 'Apps',
  faq: 'FAQ',
}

const namedPages: Record<string, string> = {
  'settings': 'In Settings',
  'remote': 'Using the TV remote',
  'cast': 'Casting to a TV',
  'activate': 'Pairing a TV',
  'pair': 'Pairing a TV',
  'random-horror': 'Picking a random horror movie',
}

function text(selector: string) {
  return document.querySelector(selector)?.textContent?.trim() || undefined
}

function squarePoster(source: string | null | undefined) {
  const file = source?.match(/\/(?:api\/tmdb-image|t\/p)\/\w+\/([\w.-]+)/)?.[1]
  if (!file)
    return
  return /\.jpe?g$/i.test(file) ? `${site}/api/poster-square/512/${file}` : `https://image.tmdb.org/t/p/w500/${file}`
}

function pagePoster() {
  const detail = document.querySelector<HTMLElement>('.detail')
  return squarePoster(detail?.style.getPropertyValue('--mobile-poster').match(/url\(['"]?([^'")]+)/)?.[1])
}

function pageYear() {
  return [...document.querySelectorAll('.detail__meta span')]
    .map(span => span.textContent?.trim())
    .find(value => /^\d{4}$/.test(value ?? ''))
}

const titleDetails = new Map<string, { poster?: string, year?: string }>()

function partyTitle(pathname: string) {
  const media = pathname.match(/^\/party\/[^/]+\/watch\/(movie|tv)\/(\d+)/)
  if (!media)
    return
  const key = `${media[1]}/${media[2]}`
  if (!titleDetails.has(key)) {
    titleDetails.set(key, {})
    fetch(`/api/tmdb/${key}?language=en-US`, { credentials: 'same-origin' })
      .then(response => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data)
          return
        const date: string = data.release_date || data.first_air_date || ''
        titleDetails.set(key, {
          poster: data.poster_path ? squarePoster(`/t/p/w500${data.poster_path}`) : undefined,
          year: date.slice(0, 4) || undefined,
        })
      })
      .catch(() => {})
  }
  return titleDetails.get(key)
}

function partySize(): PresenceData['party'] {
  const members = Number(text('.party-dock__count'))
  if (!(members > 0))
    return
  const limit = Number(text('.party-room__count')?.match(/\/\s*(\d+)/)?.[1]) || 100
  return { partyId: 'flystream-watch-party', partySize: members, maxPartySize: Math.max(members, limit) }
}

function titleLink(pathname: string) {
  const media = pathname.match(/(?:^|\/)(movie|tv)\/(\d+)/)
  if (media)
    return `${site}/${media[1]}/${media[2]}`
  const anime = pathname.match(/(?:^|\/)anime\/(?:anilist\/)?(\d+)/)
  if (anime)
    return `${site}/anime/anilist/${anime[1]}`
}

function parseTitle(value: string) {
  const series = value.match(/^(.+) S(\d+)E(\d+)$/)
  if (series)
    return { name: series[1]!, season: Number(series[2]), episode: Number(series[3]) }
  const anime = value.match(/^(.+) E(\d+)$/)
  if (anime)
    return { name: anime[1]!, episode: Number(anime[2]) }
  return { name: value }
}

function playback(presenceData: PresenceData, video: HTMLVideoElement, line?: string) {
  presenceData.type = ActivityType.Watching
  presenceData.statusDisplayType = StatusDisplayType.Details
  presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
  presenceData.smallImageText = video.paused ? strings.pause : strings.play
  const state = video.paused ? [line, 'Paused'].filter(Boolean).join(' · ') : line
  if (state)
    presenceData.state = state
  if (video.paused)
    delete presenceData.startTimestamp
  else
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'FlyStream',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: openedAt,
  }
  const { pathname } = document.location
  const [privacy, buttons, covers] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  if (!strings)
    strings = await getStrings()

  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0] ?? ''
  const partySetup = first === 'party' && ['join', 'create'].includes((segments[1] ?? '').toLowerCase())
  const inParty = first === 'party' && !partySetup
  const link = titleLink(pathname)
  const titlePage = Boolean(link) || first === 'nextended'

  const video = document.querySelector<HTMLVideoElement>('.rp video')
  const playerTitle = text('.rp__title')

  if (video && playerTitle && Number.isFinite(video.duration)) {
    if (privacy) {
      presenceData.details = 'Watching something'
      playback(presenceData, video)
    }
    else {
      const title = parseTitle(playerTitle)
      const party = inParty ? partyTitle(pathname) : undefined
      const episodeName = text('.rp__episode-card.is-active .rp__episode-card-title')
      let line = title.season
        ? `S${title.season} E${title.episode}`
        : title.episode ? `Episode ${title.episode}` : pageYear() ?? party?.year
      if (inParty) {
        const size = partySize()
        line = [line, size ? `Watch party ${size.partySize}/${size.maxPartySize}` : 'Watch party'].filter(Boolean).join(' · ')
      }
      else if (line && title.episode && episodeName) {
        line = `${line} · ${episodeName}`
      }
      presenceData.details = title.name
      playback(presenceData, video, line)
      if (covers)
        presenceData.largeImageKey = pagePoster() ?? party?.poster ?? ActivityAssets.Logo
      if (buttons && link)
        presenceData.buttons = [{ label: 'Watch on FlyStream', url: link }]
    }
    presence.setActivity(presenceData)
    return
  }

  const trailer = document.querySelector<HTMLVideoElement>('.card-trailer-theater video')
  if (trailer && document.querySelector('.card-trailer-theater-open') && Number.isFinite(trailer.duration)) {
    presenceData.details = 'Watching a trailer'
    playback(presenceData, trailer, privacy ? undefined : text('.card-trailer-theater__heading h2'))
    if (covers && !privacy)
      presenceData.largeImageKey = squarePoster(trailer.poster) ?? ActivityAssets.Logo
    presence.setActivity(presenceData)
    return
  }

  const searchInput = document.querySelector<HTMLInputElement>('#search-overlay-input')
  const heading = text('.listing-title')

  if (privacy) {
    presenceData.details = 'Browsing'
  }
  else if ((searchInput?.offsetParent && searchInput.value) || first === 'search') {
    presenceData.details = 'Searching'
    presenceData.smallImageKey = Assets.Search
  }
  else if (inParty) {
    const readying = text('.party-head__title')
    const picked = readying && readying !== 'Watch party' ? readying : undefined
    presenceData.details = picked ? 'Watch party · getting ready' : 'In a watch party'
    presenceData.state = picked ?? 'In the lobby'
    if (covers && readying)
      presenceData.largeImageKey = squarePoster(document.querySelector<HTMLImageElement>('.party-head__poster')?.src) ?? ActivityAssets.Logo
    const count = text('.party-room__count')?.match(/(\d+)\s*\/\s*(\d+)/)
    if (count && Number(count[1]) > 0) {
      presenceData.party = {
        partyId: 'flystream-watch-party',
        partySize: Number(count[1]),
        maxPartySize: Math.max(Number(count[1]), Number(count[2])),
      }
    }
  }
  else if (partySetup) {
    presenceData.details = 'Setting up a watch party'
  }
  else if (titlePage) {
    const title = text('.detail__title') || document.querySelector<HTMLImageElement>('.detail__logo')?.alt
    const year = pageYear()
    const kind = link?.includes('/movie/') || first === 'nextended' ? 'a movie' : link?.includes('/tv/') ? 'a show' : link?.includes('/anime/') ? 'an anime' : 'a title'
    const label = title && year ? `${title} (${year})` : title || year
    presenceData.details = `Looking at ${kind}`
    if (label)
      presenceData.state = label
    if (covers)
      presenceData.largeImageKey = pagePoster() ?? ActivityAssets.Logo
    if (buttons && title)
      presenceData.buttons = [{ label: 'Open on FlyStream', url: link ?? `${site}${pathname}` }]
  }
  else if (first === 'person') {
    presenceData.details = 'Looking at the cast'
    if (heading)
      presenceData.state = heading
    if (covers)
      presenceData.largeImageKey = squarePoster(document.querySelector<HTMLImageElement>('.person-hero__photo')?.src) ?? ActivityAssets.Logo
  }
  else if (first === 'category' || first === 'browse') {
    presenceData.details = 'Browsing'
    presenceData.state = heading ?? 'The catalogue'
  }
  else if (namedPages[first]) {
    presenceData.details = namedPages[first]
  }
  else {
    const page = first ? browsePages[first] : 'Home'
    presenceData.details = 'Browsing'
    if (page)
      presenceData.state = page
  }

  presence.setActivity(presenceData)
})
