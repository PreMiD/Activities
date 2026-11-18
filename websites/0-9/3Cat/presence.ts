import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({ clientId: '1549793977589309622' })

async function setting(id: string): Promise<boolean> {
  try {
    return (await presence.getSetting<boolean>(id)) ?? true
  }
  catch {
    return true
  }
}

const DEFAULT_IMAGE = ''
const HOME_URL = 'https://3cat.cat'
const STATE_TEXT = '3cat'

interface MediaState {
  currentTime: number
  duration: number
  paused: boolean
  live: boolean
}

const SECTIONS: Record<string, string> = {
  'directes': 'Directes',
  'entreteniment': 'Entreteniment',
  'series': 'Sèries',
  'podcasts': 'Pòdcasts',
  'mes-top': 'El més top',
  'meva-llista': 'La meva llista',
  'actualitat': 'Actualitat',
  'esports': 'Esports',
  'campus': 'Campus',
  'cultura': 'Cultura i divulgació',
  'pellicules': 'Pel·lícules',
  'documentals-i-reportatges': 'Documentals i reportatges',
  'musica': 'Música',
  'cuines': 'Cuines',
  'sx3': 'SX3',
  'eva': 'EVA',
  'colleccions': 'Col·leccions',
  'ultims-dies': 'Últims 10 dies',
  'accessibilitat': 'Continguts accessibles',
  'aran': 'Continguts d\'Aran',
  'tot-cataleg': 'Tot el catàleg',
}

const SITES: Record<string, string> = {
  'tv3': 'TV3',
  '3catinfo': '3Cat Info',
  'catradio': 'Catalunya Ràdio',
}

const SITE_SUB: Record<string, string> = {
  sx3: 'SX3',
  marato: 'La Marató',
  programacio: 'la programació de TV3',
}

const CHANNELS: Record<string, string> = {
  'tv3': 'TV3',
  '3catinfo-tv': '3Cat Info TV',
  'esport3': 'Esport3',
  'sx3': 'SX3',
  '33': '33',
  'catalunya-radio': 'Catalunya Ràdio',
  'ocr1': 'OCR1',
  '3catinfo-radio': '3Cat Info Ràdio',
  'icat': 'iCat',
  'catalunya-musica': 'Catalunya Música',
  'tem1': 'Canal temàtic 1',
  'tem2': 'Canal temàtic 2',
  'fc1': 'Canal temàtic FC1',
  'fc2': 'Canal temàtic FC2',
  'fc3': 'Canal temàtic FC3',
  'fc4': 'Canal temàtic FC4',
  'beauties': 'Beauties',
  'oca1': 'Canal ocasional',
}

const RADIO_CHANNELS = ['catalunya-radio', 'ocr1', '3catinfo-radio', 'icat', 'catalunya-musica']

let lastPath = ''
let pageTimestamp = Math.floor(Date.now() / 1000)
let iframeData: (MediaState & { at: number }) | null = null

presence.on('iFrameData', (data: unknown) => {
  iframeData = { ...(data as MediaState), at: Date.now() }
})

function clean(text?: string | null): string {
  const value = (text ?? '').replace(/\s+/g, ' ').replace(/\s*[-|–]\s*3Cat\s*$/i, '').trim()
  return value.length > 128 ? `${value.slice(0, 125)}...` : value
}

function pretty(slug?: string): string {
  if (!slug)
    return ''
  return slug.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase())
}

function meta(property: string): string {
  return document.querySelector<HTMLMetaElement>(`meta[property="${property}"], meta[name="${property}"]`)?.content ?? ''
}

function metaIsFresh(): boolean {
  try {
    const ogUrl = meta('og:url')
    if (!ogUrl)
      return true
    const strip = (p: string) => p.replace(/\/+$/, '')
    return strip(new URL(ogUrl, document.location.href).pathname) === strip(document.location.pathname)
  }
  catch {
    return true
  }
}

function getMedia(): MediaState | null {
  const el = [...document.querySelectorAll<HTMLMediaElement>('video, audio')]
    .find(m => m.readyState >= 1 && (m.duration > 0 || !Number.isFinite(m.duration)))
  if (el) {
    return {
      currentTime: el.currentTime,
      duration: el.duration,
      paused: el.paused,
      live: !Number.isFinite(el.duration),
    }
  }
  if (iframeData && Date.now() - iframeData.at < 4000)
    return iframeData
  return null
}

function applyMedia(data: PresenceData, media: MediaState | null) {
  if (!media)
    return
  data.smallImageKey = media.paused ? Assets.Pause : Assets.Play
  data.smallImageText = media.paused ? 'En pausa' : 'Reproduint'

  if (media.paused) {
    delete data.startTimestamp
    delete data.endTimestamp
    return
  }
  if (media.live)
    return
  const [start, end] = getTimestamps(media.currentTime, media.duration)
  data.startTimestamp = start
  data.endTimestamp = end
}

async function update() {
  const [showButtons, showCover, showBrowsing, hideSearch] = await Promise.all([
    setting('buttons'),
    setting('cover'),
    setting('browsing'),
    setting('privacy'),
  ])

  const path = document.location.pathname.replace(/\/+$/, '') || '/'
  const segs = path.split('/').filter(Boolean)
  if (path !== lastPath) {
    lastPath = path
    pageTimestamp = Math.floor(Date.now() / 1000)
  }

  const shareUrl = `${document.location.origin}${document.location.pathname}`
  const fresh = metaIsFresh()
  const h1 = clean(document.querySelector('h1')?.textContent)
  const ogTitle = fresh ? clean(meta('og:title')) : ''
  const ogImage = fresh ? meta('og:image') : ''
  const coverImage = (showCover !== false && ogImage) ? new URL(ogImage, document.location.href).href : DEFAULT_IMAGE

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: DEFAULT_IMAGE,
    largeImageText: '3Cat',
    state: STATE_TEXT,
    stateUrl: HOME_URL,
    startTimestamp: pageTimestamp,
  }

  const videoIdx = segs.indexOf('video')
  const audioIdx = segs.indexOf('audio')
  const isAudio = audioIdx !== -1 && /^\d+$/.test(segs[audioIdx + 1] ?? '')
  const isVideo = isAudio || (videoIdx !== -1 && /^\d+$/.test(segs[videoIdx + 1] ?? ''))
  const isLive = segs[0] === '3cat' && segs[1] === 'directes'
  const isRadio = segs[0] === 'catradio'
  const isSearch = segs.includes('cercador')
  const isHome = segs.length === 0 || (segs.length === 1 && segs[0] === '3cat')
  const isSection = segs[0] === '3cat' && !!segs[1] && !!SECTIONS[segs[1]] && !isVideo
  const subName = SITES[segs[0] ?? ''] ? SITE_SUB[segs[1] ?? ''] : undefined
  const isSite = !!SITES[segs[0] ?? ''] && !isRadio && !isVideo
    && (segs.length === 1 || (!!subName && segs.length === 2) || segs[0] === '3catinfo')
  const isProgram = !isVideo && ((segs[0] === '3cat' && segs.length >= 2 && !SECTIONS[segs[1] ?? '']) || (segs[0] === 'tv3' && segs.length >= 2))

  let isMediaPage = false
  let isProgramPage = false

  if (isVideo) {
    isMediaPage = true
    if (isAudio)
      presenceData.type = ActivityType.Listening
    const prefix = (h1 && ogTitle.endsWith(h1)) ? ogTitle.slice(0, ogTitle.length - h1.length).replace(/\s*[-–]\s*$/, '').trim() : ''
    const series = /^(?:Pel·lícula|Documental|Reportatge|Curtmetratge|Telefilm|Programa|Sèrie|Vídeo|Àudio|Podcast|Pòdcast)$/i.test(prefix) ? '' : prefix
    const videoTitle = h1 || ogTitle || 'Contingut de 3Cat'
    presenceData.details = clean(series ? `${series} - ${videoTitle}` : videoTitle)
    presenceData.detailsUrl = shareUrl
    presenceData.largeImageKey = coverImage
    presenceData.largeImageText = ogTitle || presenceData.details
    applyMedia(presenceData, getMedia())
  }
  else if (isLive) {
    const slug = segs[2] ?? ''
    const channel = slug ? (CHANNELS[slug] ?? pretty(slug)) : ''
    isMediaPage = !!channel
    const isAudio = RADIO_CHANNELS.includes(slug)
    if (isAudio)
      presenceData.type = ActivityType.Listening
    presenceData.details = channel ? (isAudio ? `Escoltant ${channel}` : `${channel} en directe`) : 'Explorant els directes'
    presenceData.detailsUrl = shareUrl
    presenceData.largeImageText = channel ? (isAudio ? 'Ràdio en directe' : 'Directe de 3Cat') : 'Directes de 3Cat'
    if (channel)
      applyMedia(presenceData, getMedia())
  }
  else if (isRadio) {
    isMediaPage = true
    const name = 'Catalunya Ràdio'
    presenceData.type = ActivityType.Listening
    presenceData.details = `Escoltant ${name}`
    presenceData.detailsUrl = shareUrl
    presenceData.largeImageText = '3Cat Ràdio'
    applyMedia(presenceData, getMedia())
  }
  else if (isSearch) {
    const params = new URLSearchParams(document.location.search)
    const term = clean(
      params.get('text') ?? params.get('q') ?? params.get('cerca') ?? params.get('query')
      ?? document.querySelector<HTMLInputElement>('input[type="search"], input[name="text"], input[name="q"]')?.value,
    )
    presenceData.details = (!hideSearch && term) ? `Cercant: ${term}` : 'Cercant a 3Cat'
    presenceData.detailsUrl = shareUrl
    presenceData.largeImageText = 'Cercador de 3Cat'
  }
  else if (isHome) {
    presenceData.details = 'A la pàgina d\'inici'
    presenceData.detailsUrl = shareUrl
    presenceData.largeImageText = '3Cat · Inici'
  }
  else if (isSection) {
    const name = SECTIONS[segs[1]!]!
    presenceData.details = `Explorant ${name}`
    presenceData.detailsUrl = shareUrl
    presenceData.largeImageText = `3Cat · ${name}`
  }
  else if (isSite) {
    const name = subName ?? SITES[segs[0]!]!
    presenceData.details = `Explorant ${name}`
    presenceData.detailsUrl = shareUrl
    presenceData.largeImageText = name
  }
  else if (isProgram) {
    isProgramPage = true
    const season = path.match(/temporada[-/](\d+)/i)?.[1]
    const name = h1 || pretty(segs[1])
    presenceData.details = season ? `${name} (Temporada ${season})` : name
    presenceData.detailsUrl = shareUrl
    presenceData.largeImageKey = coverImage
    presenceData.largeImageText = ogTitle || name
  }
  else {
    presenceData.details = 'Navegant per 3Cat'
    presenceData.detailsUrl = shareUrl
    presenceData.largeImageText = clean(document.title) || '3Cat'
  }

  if (!isMediaPage && showBrowsing === false) {
    presence.clearActivity()
    return
  }

  if (!presenceData.largeImageKey)
    delete presenceData.largeImageKey

  if (showButtons !== false && (isMediaPage || isProgramPage)) {
    presenceData.buttons = [
      { label: 'Mireu-ho Junts', url: shareUrl },
    ]
  }

  presence.setActivity(presenceData)
}

presence.on('UpdateData', async () => {
  try {
    await update()
  }
  catch (error) {
    console.error('[3cat]', error)
  }
})
