import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1565331266465697802',
})

const nakanimeLogo = 'https://i.imgur.com/6Sgsj9h.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

interface IFrameData {
  video?: {
    paused: boolean
    startTimestamp: number
    endTimestamp: number
  } | null
}

interface StructuredData {
  '@type'?: string | string[]
  '@graph'?: StructuredData[]
  'name'?: string
  'episodeNumber'?: number | string
  'image'?: string | { url?: string } | Array<string | { url?: string }>
  'partOfSeries'?: {
    name?: string
  }
}

let iframeData: IFrameData = {}

presence.on('iFrameData', (data: IFrameData) => {
  iframeData = data
})

function getBrowsingState(pathname: string, hash: string): string {
  if (pathname === '/')
    return 'Sur la page d’accueil'

  if (pathname.startsWith('/saison/'))
    return 'Regarde les saisons'

  if (pathname.startsWith('/profile/'))
    return 'Consulte un profil'

  switch (pathname) {
    case '/catalog':
      return 'Explore le catalogue'

    case '/schedule':
      return 'Consulte le calendrier des sorties'

    case '/feed':
      return 'Consulte le fil d’actualité'

    case '/saisons':
      return 'Consulte toutes les saisons'

    case '/quests':
      return 'Consulte ses quêtes'

    case '/leaderboard':
      return 'Consulte le classement'

    case '/settings':
      return hash === '#playlists'
        ? 'Gère ses playlists'
        : 'Consulte ses paramètres'

    case '/changelog':
      return 'Consulte les nouveautés'

    case '/about':
      return 'Découvre Nakanime'

    case '/latest':
      return 'Consulte les dernières sorties'

    default:
      return 'Explore Nakanime'
  }
}

function getStructuredEntries(): StructuredData[] {
  const scripts = document.querySelectorAll(
    'script[type="application/ld+json"]',
  )

  const entries: StructuredData[] = []

  function addEntries(value: unknown): void {
    if (Array.isArray(value)) {
      for (const item of value)
        addEntries(item)

      return
    }

    if (!value || typeof value !== 'object')
      return

    const entry = value as StructuredData

    entries.push(entry)

    if (entry['@graph'])
      addEntries(entry['@graph'])
  }

  for (const script of scripts) {
    try {
      const parsed: unknown = JSON.parse(script.textContent || '')
      addEntries(parsed)
    }
    catch {
      continue
    }
  }

  return entries
}

function hasStructuredType(
  entry: StructuredData,
  type: string,
): boolean {
  const types = entry['@type']

  if (Array.isArray(types))
    return types.includes(type)

  return types === type
}

function getStructuredImage(
  image: StructuredData['image'],
): string | undefined {
  if (!image)
    return undefined

  if (Array.isArray(image)) {
    for (const item of image) {
      const url = typeof item === 'string'
        ? item
        : item?.url

      if (url)
        return url
    }

    return undefined
  }

  return typeof image === 'string'
    ? image
    : image.url
}

presence.on('UpdateData', async () => {
  const pathname = document.location.pathname
  const hash = document.location.hash

  const episodeMatch = pathname.match(
    /\/anime\/(\d+)\/season\/(\d+)\/episode\/(\d+)/,
  )

  const isEpisodePage = Boolean(episodeMatch)

  const structuredEntries = isEpisodePage
    ? getStructuredEntries()
    : []

  const episodeData = structuredEntries.find(
    entry => hasStructuredType(entry, 'TVEpisode'),
  )

  const seriesData = structuredEntries.find(
    entry => hasStructuredType(entry, 'TVSeries'),
  )

  const animeTitle = isEpisodePage
    ? episodeData?.partOfSeries?.name
    || seriesData?.name
    || 'Nakanime'
    : 'Nakanime'

  const episodeNumber = isEpisodePage
    ? episodeData?.episodeNumber?.toString()
    || episodeMatch?.[3]
    : undefined

  const poster = getStructuredImage(episodeData?.image)
    || getStructuredImage(seriesData?.image)
    || document.querySelector<HTMLMetaElement>(
      'meta[property="og:image"]',
    )?.content

  const video = iframeData.video

  const presenceData: PresenceData = {
    name: 'Nakanime',
    type: ActivityType.Watching,
    details: animeTitle,
    state: isEpisodePage
      ? `Épisode ${episodeNumber || '?'}`
      : getBrowsingState(pathname, hash),
    largeImageKey: isEpisodePage && poster
      ? poster
      : nakanimeLogo,
    largeImageText: animeTitle,
  }

  if (isEpisodePage) {
    const episodeUrl = new URL(document.location.href)
    episodeUrl.searchParams.set('ref', 'premid')

    presenceData.buttons = [
      {
        label: 'Regarder l’épisode',
        url: episodeUrl.toString(),
      },
    ]
  }

  if (isEpisodePage && video) {
    presenceData.state = video.paused
      ? `En pause • Épisode ${episodeNumber || '?'}`
      : `En lecture • Épisode ${episodeNumber || '?'}`

    presenceData.smallImageKey = video.paused
      ? Assets.Pause
      : Assets.Play

    presenceData.smallImageText = video.paused
      ? 'En pause'
      : 'En lecture'

    if (!video.paused) {
      presenceData.startTimestamp = video.startTimestamp
      presenceData.endTimestamp = video.endTimestamp
    }
  }
  else {
    presenceData.startTimestamp = browsingTimestamp
  }

  presence.setActivity(presenceData)
})
