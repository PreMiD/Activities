import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  // Crea tu aplicación en https://discord.com/developers/applications y pega aquí su Client ID
  clientId: '1545854937341239306',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/WTlbzGb.png',
}

interface VideoData {
  duration: number
  currentTime: number
  paused: boolean
}

interface SchemaNode {
  '@type'?: string | string[]
  name?: string
  image?: string
  partOfSeason?: { seasonNumber?: number }
  partOfSeries?: { name?: string }
}

let video: VideoData = { duration: 0, currentTime: 0, paused: true }
let lastIFrameUpdate = 0
const iframeCacheDuration = 5000
const browsingTimestamp = Math.floor(Date.now() / 1000)

const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browse: 'general.browsing',
})

presence.on('iFrameData', (data: unknown) => {
  video = data as VideoData
  lastIFrameUpdate = Date.now()
})

function getSchemaNode(): SchemaNode | null {
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const parsed = JSON.parse(script.textContent ?? '') as SchemaNode & { '@graph'?: SchemaNode[] }
      const graph = parsed['@graph']
      const nodes = Array.isArray(graph) ? graph : [parsed]
      for (const node of nodes) {
        const type = Array.isArray(node['@type']) ? node['@type'][0] : node['@type']
        if (type === 'TVEpisode' || type === 'Movie' || type === 'TVSeries')
          return node
      }
    }
    catch {
      continue
    }
  }
  return null
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/^\s*Ver\s+/i, '')
    .replace(/\s*\(\d{4}\)\s*Online.*$/i, '')
    .replace(/\s+Online.*$/i, '')
    .replace(/\s*\|\s*SoloLatino\.Net\s*$/i, '')
    .trim()
}

function getOgTitle(): string {
  return document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content ?? ''
}

function getOgImage(): string {
  return document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ?? ''
}

function getYear(): string {
  return getOgTitle().match(/\((\d{4})\)/)?.[1] ?? ''
}

function prettify(value: string): string {
  return value
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength)
    return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

function getParentVideo(): VideoData | null {
  const el = document.querySelector<HTMLVideoElement>('#player-frame video')
  if (!el || Number.isNaN(el.duration) || el.duration <= 0 || Number.isNaN(el.currentTime))
    return null
  return { duration: el.duration, currentTime: el.currentTime, paused: el.paused }
}

function getVideoData(): VideoData | null {
  if (Date.now() - lastIFrameUpdate < iframeCacheDuration && video.duration > 0)
    return video
  const parentVideo = getParentVideo()
  return parentVideo || (video.duration > 0 ? video : null)
}

function applyVideoState(
  presenceData: PresenceData,
  showTime: boolean,
  showPlayState: boolean,
  playLabel: string,
  pauseLabel: string,
): void {
  const currentVideo = getVideoData()
  if (!currentVideo || currentVideo.duration <= 0 || Number.isNaN(currentVideo.duration) || Number.isNaN(currentVideo.currentTime))
    return

  if (showTime && !currentVideo.paused) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
      Math.floor(currentVideo.currentTime),
      Math.floor(currentVideo.duration),
    )
  }

  if (showPlayState) {
    presenceData.smallImageKey = currentVideo.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = currentVideo.paused ? pauseLabel : playLabel
  }
}

function applyButton(presenceData: PresenceData, showButton: boolean, url: string): void {
  if (showButton)
    presenceData.buttons = [{ label: 'Ver ahora', url }]
}

presence.on('UpdateData', async () => {
  const s = await strings
  const brand = await presence.getSetting<boolean>('brand')
  const showTempEp = await presence.getSetting<boolean>('showTempEp')
  const showTime = await presence.getSetting<boolean>('showTime')
  const showCover = await presence.getSetting<boolean>('showCover')
  const showPlayState = await presence.getSetting<boolean>('showPlayState')
  const showButton = await presence.getSetting<boolean>('showButton')

  const { pathname, href, search } = document.location
  const schema = getSchemaNode()

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    name: 'SoloLatino',
    largeImageKey: ActivityAssets.Logo,
  }

  const episodeMatch = pathname.match(/^\/serie\/([^/]+)\/temporada-(\d+)\/episodio-(\d+)/)
  const seriesMatch = pathname.match(/^\/serie\/([^/]+)\/?$/)
  const movieMatch = pathname.match(/^\/pelicula\/([^/]+)\/?$/)

  if (episodeMatch) {
    const seasonNumber = episodeMatch[2]
    const episodeNumber = episodeMatch[3]
    const seriesName = schema?.partOfSeries?.name || cleanTitle(getOgTitle()) || 'Serie'
    const episodeTitle = schema?.name || document.querySelector('h1')?.textContent?.trim() || ''
    const cover = getOgImage()
    const tempEp = `Temporada ${seasonNumber} · Episodio ${episodeNumber}`

    if (brand) {
      presenceData.details = `Viendo ${seriesName}`
      if (showTempEp)
        presenceData.state = episodeTitle ? truncate(`${tempEp} · ${episodeTitle}`, 120) : tempEp
      else if (episodeTitle)
        presenceData.state = truncate(episodeTitle, 120)
    }
    else {
      presenceData.name = seriesName
      if (showTempEp)
        presenceData.details = tempEp
      if (episodeTitle)
        presenceData.state = truncate(episodeTitle, 120)
    }

    presenceData.largeImageKey = showCover && cover ? cover : ActivityAssets.Logo
    presenceData.largeImageText = seriesName
    applyVideoState(presenceData, showTime, showPlayState, s.play, s.pause)
    applyButton(presenceData, showButton, href)
    return presence.setActivity(presenceData)
  }

  if (movieMatch) {
    const movieName = schema?.name || cleanTitle(getOgTitle()) || 'Película'
    const cover = getOgImage()
    const year = getYear()
    const movieLabel = year ? `Película · ${year}` : 'Película'

    if (brand) {
      presenceData.details = `Viendo ${movieName}`
      presenceData.state = movieLabel
    }
    else {
      presenceData.name = movieName
      presenceData.details = movieLabel
    }

    presenceData.largeImageKey = showCover && cover ? cover : ActivityAssets.Logo
    presenceData.largeImageText = movieName
    applyVideoState(presenceData, showTime, showPlayState, s.play, s.pause)
    applyButton(presenceData, showButton, href)
    return presence.setActivity(presenceData)
  }

  if (seriesMatch) {
    const seriesName = schema?.name || cleanTitle(getOgTitle()) || 'Serie'
    const cover = schema?.image || getOgImage()

    if (brand) {
      presenceData.details = `Explorando ${seriesName}`
      presenceData.state = 'Serie'
    }
    else {
      presenceData.name = seriesName
      presenceData.details = 'Serie'
    }

    presenceData.largeImageKey = showCover && cover ? cover : ActivityAssets.Logo
    presenceData.largeImageText = seriesName
    presenceData.startTimestamp = browsingTimestamp
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = s.browse
    applyButton(presenceData, showButton, href)
    return presence.setActivity(presenceData)
  }

  presenceData.details = 'Explorando SoloLatino'
  presenceData.state = 'Navegando'
  presenceData.startTimestamp = browsingTimestamp
  presenceData.smallImageKey = Assets.Search
  presenceData.smallImageText = s.browse

  if (pathname === '/' || pathname === '') {
    presenceData.state = 'Página principal'
  }
  else if (/^\/(series|peliculas|animes|doramas)\/?$/.test(pathname)) {
    presenceData.state = prettify(pathname.replace(/\//g, ''))
  }
  else if (/^\/genero\/[^/]+/.test(pathname)) {
    presenceData.state = `Género: ${prettify(pathname.split('/')[2] ?? '')}`
  }
  else if (/^\/red\/[^/]+/.test(pathname)) {
    presenceData.state = `Plataforma: ${prettify(pathname.split('/')[2] ?? '')}`
  }
  else if (pathname.startsWith('/buscar')) {
    const query = new URLSearchParams(search).get('q')
    presenceData.state = query ? truncate(`Buscando: ${query}`, 80) : 'Buscando contenido'
  }

  return presence.setActivity(presenceData)
})
