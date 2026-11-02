import { ActivityType, Assets, getTimestamps, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1560652339201974272',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

function stripCountrySuffix(value: string): string {
  return value.replace(/\s*\([^)]*\)\s*$/, '').trim()
}

function formatTitleCase(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDisplayDate(value: string): string {
  const cleaned = stripCountrySuffix(value)
    .replace(/^(?:released on|release date)\s*:\s*/i, '')
    .replace(/^[a-z]+,\s*/i, '')
    .trim()

  const date = new Date(cleaned)
  if (Number.isNaN(date.getTime()))
    return cleaned

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }).format(date)
}

function formatShowDateRange(value: string): string {
  const cleaned = stripCountrySuffix(value)
    .replace(/^(?:first aired|last aired)\s*:\s*/gi, '')
    .replace(/\s+[–-]\s+/g, ' - ')
    .trim()

  const segments = cleaned
    .split(/\s+-\s+/)
    .map(segment => segment.trim())
    .filter(Boolean)

  if (segments.length !== 2)
    return formatDisplayDate(cleaned)

  const dates = segments.map((segment) => {
    const withoutWeekday = segment.replace(/^[a-z]+,\s*/i, '')
    const date = new Date(withoutWeekday)
    return Number.isNaN(date.getTime()) ? null : date
  })

  if (dates.some(date => !date))
    return formatDisplayDate(cleaned)

  const start = dates[0]!
  const end = dates[1]!

  return `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(start)} - ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(end)}`
}

interface IFrameVideoData {
  currentTime: number
  duration: number
  paused: boolean
}

let iframeVideoData: IFrameVideoData | null = null

function getExpectedVideoDurationSeconds(): number | null {
  const runtimeText = document.querySelector('#Movie\\ Runtime time p')?.textContent

  if (!runtimeText)
    return null

  const runtimeMinutes = Number.parseInt(runtimeText.match(/\d+/)?.[0] ?? '', 10)
  if (Number.isNaN(runtimeMinutes) || runtimeMinutes <= 0)
    return null

  return runtimeMinutes * 60
}

function isDurationCompatibleWithRuntime(duration: number): boolean {
  const expectedDuration = getExpectedVideoDurationSeconds()

  if (!expectedDuration || duration <= 0)
    return true

  const ratio = Math.abs(duration - expectedDuration) / expectedDuration
  return ratio <= 0.75 && duration >= expectedDuration * 0.25
}

presence.on('iFrameData', (data: unknown) => {
  if (!data || typeof data !== 'object') {
    iframeVideoData = null
    return
  }

  const payload = data as { iframeVideo?: Partial<IFrameVideoData> | null }

  if (!payload.iframeVideo) {
    iframeVideoData = null
    return
  }

  const { currentTime: rawCurrentTime, duration: rawDuration, paused } = payload.iframeVideo
  const currentTime = Number(rawCurrentTime)
  const duration = Number(rawDuration)

  if (!Number.isFinite(currentTime) || !Number.isFinite(duration)) {
    iframeVideoData = null
    return
  }

  if (!isDurationCompatibleWithRuntime(duration)) {
    iframeVideoData = null
    return
  }

  iframeVideoData = {
    currentTime,
    duration,
    paused: Boolean(paused),
  }
})

function resolveStreamTimeInfo(): { currentTime: number, duration: number, paused?: boolean } | null {
  if (iframeVideoData && Number.isFinite(iframeVideoData.currentTime) && Number.isFinite(iframeVideoData.duration)) {
    return iframeVideoData
  }

  return null
}

function applyStreamState(
  presenceData: PresenceData,
  streamTime: { currentTime: number, duration: number, paused?: boolean } | null,
): PresenceData {
  const currentTime = streamTime?.currentTime ?? 0
  const duration = streamTime?.duration ?? 0
  const isPaused = streamTime?.paused ?? false

  if (duration > 0 && !isPaused) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
  }

  presenceData.smallImageKey = isPaused || currentTime <= 0 ? Assets.Pause : Assets.Play
  presenceData.smallImageText = isPaused || currentTime <= 0 ? 'Paused' : 'Playing'

  return presenceData
}

function getMovieInfo() {
  const match = document.location.pathname.match(/\/movies\/(\d+)(?:-([^/]+))?/)

  if (!match || !match[1])
    return null

  const movieName = match[2]?.replace(/-/g, ' ') || 'Unknown Movie'
  const formattedMovieName = formatTitleCase(movieName)

  const rating = document.querySelector('.radial-progress span.text-white')?.textContent?.trim() || 'N/A'
  const runtime = document.querySelector('#Movie\\ Runtime time p')?.textContent?.match(/\d+/)?.[0] || 'N/A'
  const releaseDate = formatDisplayDate(document.querySelector('#Movie\\ Release\\ Date time p')?.textContent?.trim() || 'N/A')
  const posterSrc = document.querySelector('figure img.object-cover')?.getAttribute('src') ?? null

  return {
    formattedMovieName,
    rating,
    runtime,
    releaseDate,
    posterSrc,
  }
}

function getTvInfo() {
  const match = document.location.pathname.match(/\/tv\/(\d+)(?:-([^/]+))?/)

  if (!match || !match[1])
    return null

  const showName = match[2]?.replace(/-/g, ' ') || 'Unknown Show'
  const formattedShowName = formatTitleCase(showName)

  const urlParams = new URLSearchParams(document.location.search)
  const seasonFromQuery = Number.parseInt(urlParams.get('season') ?? '', 10)
  const episodeFromQuery = Number.parseInt(urlParams.get('episode') ?? '', 10)

  let seasonNo = 0
  let episodeNo = 0

  if (!Number.isNaN(seasonFromQuery))
    seasonNo = seasonFromQuery
  if (!Number.isNaN(episodeFromQuery))
    episodeNo = episodeFromQuery

  const rating = document.querySelector('.radial-progress span.text-white')?.textContent?.trim() || 'N/A'
  const releaseDate = formatShowDateRange(document.querySelector('#TV\\ Shows\\ Air\\ Date time')?.textContent?.trim() || 'N/A')

  return {
    formattedShowName,
    seasonNo,
    episodeNo,
    rating,
    releaseDate,
  }
}

const ActivityAssets = {
  Logo: 'https://cdn.rcd.gg/PreMiD/websites/0-9/1Shows/assets/logo.png',
  house: 'https://i.postimg.cc/d1JjfN3Y/house-solid.png',
  compass: 'https://i.postimg.cc/85TmYXcj/compass-solid.png',
  calendarDays: 'https://i.postimg.cc/C1ws2r5d/calendar-days-solid.png',
  userSecret: 'https://i.postimg.cc/63BfPbqp/user-secret-solid.png',
  tv: 'https://i.postimg.cc/nznGWSrF/tv-solid.png',
  towerBroadcast: 'https://i.postimg.cc/rmqNHZsM/tower-broadcast-solid.png',
  football: 'https://i.postimg.cc/HxT9Nvn8/football-solid.png',
  gamepad: 'https://i.postimg.cc/rmqNHZsd/gamepad-solid.png',
  addressCard: 'https://i.postimg.cc/NMQknCFf/address-card-solid.png',
  arrowRightToBracket: 'https://i.postimg.cc/63BfPbqQ/arrow-right-to-bracket-solid.png',
  fileContract: 'https://i.postimg.cc/XJnkP1qr/file-contract-solid.png',
  magnet: 'https://i.postimg.cc/sX34LHxV/magnet-solid.png',
  moviesAndTv: 'https://i.postimg.cc/SsmfP1RQ/movies-And-Tv.png',
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const { pathname } = document.location

  const privacy = await presence.getSetting<boolean>('privacy')
  const hideBranding = await presence.getSetting<boolean>('hideBranding')

  if (hideBranding) {
    presenceData.largeImageKey = ActivityAssets.moviesAndTv
    presenceData.name = 'Movies & TV'
  }

  const staticPages: Record<string, PresenceData> = {
    '/': {
      details: `Browsing Home`,
      state: `Looking for a movie`,
      smallImageKey: ActivityAssets.house,
    },
    '/tv': {
      details: 'Browsing TV Shows',
      state: 'Looking for something to watch',
      smallImageKey: ActivityAssets.tv,
    },
    '/livetv': {
      details: 'Browsing Live TV',
      state: 'Seeing what\'s on',
      smallImageKey: ActivityAssets.towerBroadcast,
    },
    '/sports': {
      details: 'Browsing Live Sports',
      state: 'Waiting for Kickoff',
      smallImageKey: ActivityAssets.football,
    },
    '/games': {
      details: 'Browsing Games',
      state: 'Searching the library',
      smallImageKey: ActivityAssets.gamepad,
    },
    '/torrent': {
      details: 'Browsing Torrents',
      state: 'Looking for a download',
      smallImageKey: ActivityAssets.magnet,
    },
    '/login': {
      details: 'Signing in',
      state: 'Trying to remember the password',
      smallImageKey: ActivityAssets.arrowRightToBracket,
    },
    '/register': {
      details: 'Creating an account',
      state: 'Filling out the form',
      smallImageKey: ActivityAssets.fileContract,
    },
    '/profile': {
      details: 'Viewing their profile',
      state: 'Checking out their stats',
      smallImageKey: ActivityAssets.addressCard,
    },
  }

  if (privacy) {
    presenceData.details = 'Something Cool'
    presenceData.state = `In Incognito Mode`
    presenceData.smallImageKey = ActivityAssets.userSecret
  }
  else if (staticPages[pathname]) {
    presenceData = {
      ...presenceData,
      ...staticPages[pathname],
      type: ActivityType.Watching,
    }
  }
  else if (pathname.includes('/movies/')) {
    const movieInfo = getMovieInfo()

    if (!movieInfo) {
      presenceData.details = 'Browsing a Movie'
    }
    else {
      const { formattedMovieName, rating, runtime, releaseDate, posterSrc } = movieInfo

      if (posterSrc)
        presenceData.largeImageKey = posterSrc

      const urlParams = new URLSearchParams(document.location.search)
      const streamTime = resolveStreamTimeInfo()
      const isStreaming = urlParams.get('streaming') === 'true'

      if (!isStreaming) {
        presenceData.details = 'Checking Movie Details'
        presenceData.state = `${formattedMovieName} | ⭐ ${rating} 🕒 ${runtime} mins 🗓️ ${releaseDate}`
        presenceData.smallImageKey = ActivityAssets.compass
      }
      else {
        presenceData.details = formattedMovieName || 'Unknown Movie'
        presenceData.type = ActivityType.Watching
        presenceData.statusDisplayType = StatusDisplayType.Details
        presenceData.state = `⭐ ${rating} 🕒 ${runtime} mins 🗓️ ${releaseDate}`
        presenceData = applyStreamState(presenceData, streamTime)
      }
    }
  }
  else if (pathname.includes('/tv/')) {
    const tvInfo = getTvInfo()

    if (!tvInfo) {
      presenceData.details = 'Browsing a TV Show'
    }
    else {
      const { formattedShowName, seasonNo, episodeNo, rating, releaseDate } = tvInfo
      const isEpisodeDetails = seasonNo > 0 && episodeNo > 0

      const posterSrc = document.querySelector<HTMLImageElement>('section.md\\:col-\\[1\\/4\\] img')?.src
      if (posterSrc)
        presenceData.largeImageKey = posterSrc

      const urlParams = new URLSearchParams(document.location.search)
      const streamTime = resolveStreamTimeInfo()
      const isStreaming = urlParams.get('streaming') === 'true'

      if (!isStreaming) {
        presenceData.details = isEpisodeDetails ? 'Checking Episode Details' : 'Checking TV Show Details'
        presenceData.type = ActivityType.Watching
        presenceData.statusDisplayType = StatusDisplayType.Details
        presenceData.state = `${formattedShowName} | ⭐ ${rating} 🗓️ ${releaseDate}`
        presenceData.smallImageKey = ActivityAssets.compass
        if (isEpisodeDetails)
          presenceData.largeImageText = `Season ${seasonNo}, Episode ${episodeNo}`
      }
      else {
        presenceData.details = formattedShowName || 'Unknown Show'
        presenceData.type = ActivityType.Watching
        presenceData.statusDisplayType = StatusDisplayType.Details
        presenceData.state = `⭐ ${rating} 🗓️ ${releaseDate}`
        if (isEpisodeDetails)
          presenceData.largeImageText = `Season ${seasonNo}, Episode ${episodeNo}`
        presenceData = applyStreamState(presenceData, streamTime)
      }
    }
  }
  else if (pathname.includes('/search')) {
    presenceData.details = `Search`
    const query = document.querySelector('input')?.getAttribute('value')
    if (query) {
      presenceData.state = `Looking for: ${query}`
    }
    else {
      presenceData.state = `Looking for something particular`
    }
    presenceData.smallImageKey = Assets.Search
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
