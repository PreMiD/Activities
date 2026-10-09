import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1274812737247248384',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/cihx7oo.png',
}

const serviceName = 'Animefire'
const browsingTimestamp = Math.floor(Date.now() / 1000)
const coverCache = new Map<string, string>()
const coverLoading = new Set<string>()

const catalogs: Record<string, string> = {
  '/animes': 'Animes',
  '/animes/filmes': 'Filmes',
  '/animes/lancamentos': 'Lançamentos',
}

function text(el: Element | null | undefined): string {
  return el?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

function cleanTitle(title: string): string {
  return title.replace(/\s+-\s+(?:Legendado|Dublado)$/i, '').trim()
}

function getAnimeId(value: string): string | null {
  return value.match(/\/anime\/([^/?#]+)/)?.[1] ?? null
}

function toPoster(url: string): string {
  return url.replace(/\/t\/p\/(?:original|w\d+)\//, '/t/p/w500/')
}

function plural(value: string, one: string, many: string): string {
  return `${value} ${value === '1' ? one : many}`
}

// Procura a capa vertical no HTML da página do anime (og:image / twitter:image)
// e, se não achar, usa o hero (paisagem) como último recurso
function extractCover(doc: Document): string | null {
  const metas = [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
  ]

  for (const selector of metas) {
    const url = doc.querySelector<HTMLMetaElement>(selector)?.content
    if (url?.includes('image.tmdb.org')) {
      return toPoster(url)
    }
  }

  const hero = doc.querySelector<HTMLImageElement>('img[alt="Hero art"]')?.getAttribute('src')
  if (hero?.includes('image.tmdb.org')) {
    return toPoster(hero)
  }

  return null
}

async function loadCover(id: string): Promise<void> {
  if (coverCache.has(id) || coverLoading.has(id)) {
    return
  }

  coverLoading.add(id)

  try {
    const res = await fetch(`/anime/${id}`)
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html')
    coverCache.set(id, extractCover(doc) ?? ActivityAssets.Logo)
  }
  catch {
    coverCache.set(id, ActivityAssets.Logo)
  }
  finally {
    coverLoading.delete(id)
  }
}

// Hero (paisagem) da página do anime que está aberta agora — só vale se for o mesmo anime
function liveHero(id: string): string | null {
  if (getAnimeId(document.location.pathname) !== id) {
    return null
  }

  const src = document.querySelector<HTMLImageElement>('img[alt="Hero art"]')?.currentSrc
  return src?.includes('image.tmdb.org') ? toPoster(src) : null
}

function coverFor(id: string | null): string {
  if (!id) {
    return ActivityAssets.Logo
  }

  void loadCover(id)

  const cached = coverCache.get(id)
  if (cached && cached !== ActivityAssets.Logo) {
    return cached
  }

  return liveHero(id) ?? ActivityAssets.Logo
}

// Sobe na árvore a partir de um elemento até achar o seletor (o mais próximo vence)
function findNear<T extends Element>(from: Element, selector: string, maxDepth = 8): T | null {
  let node: Element | null = from

  for (let i = 0; i < maxDepth && node; i++) {
    const found = node.querySelector<T>(selector)
    if (found) {
      return found
    }
    node = node.parentElement
  }

  return null
}

interface PlayerInfo {
  video: HTMLVideoElement
  title: string
  episode: string
  id: string | null
}

// O player fica na própria página (home ou /anime/ID), então detectamos pelo DOM
function getPlayer(): PlayerInfo | null {
  const video = document.querySelector<HTMLVideoElement>('video')
  const slider = document.querySelector('media-time-slider')

  if (!video || !slider || !Number.isFinite(video.duration) || video.duration <= 0) {
    return null
  }

  const titleEl = findNear<HTMLElement>(slider, 'a[appcloseplayer], h5.line-clamp-1')
    ?? document.querySelector<HTMLElement>('a[appcloseplayer], h5.line-clamp-1')

  if (!titleEl) {
    return null
  }

  const episodeEl = findNear<HTMLElement>(titleEl, 'p.line-clamp-1')
  const id = getAnimeId(titleEl.getAttribute('href') ?? '') ?? getAnimeId(document.location.pathname)

  return {
    video,
    title: text(titleEl),
    episode: text(episodeEl),
    id,
  }
}

function getProfileStats() {
  const stats: { comments?: string, likes?: string, watched?: string } = {}

  for (const span of document.querySelectorAll('span.flex.items-center.gap-2')) {
    const content = text(span)
    const comments = content.match(/(\d[\d.,]*)\s*coment/i)?.[1]
    const likes = content.match(/(\d[\d.,]*)\s*curtida/i)?.[1]

    if (comments) {
      stats.comments = comments
    }
    if (likes) {
      stats.likes = likes
    }
  }

  const label = [...document.querySelectorAll('h2 span')].find(el => text(el) === 'Assistidos')
  stats.watched = text(label?.closest('h2')?.nextElementSibling).match(/\d[\d.,]*/)?.[0]

  return stats
}

// Sempre Watching: fora do anime/player o nome é o do serviço, com a logo
function buildPresence(viewPage: string): PresenceData {
  const { href, origin, pathname, search } = document.location
  const path = pathname.replace(/\/+$/, '') || '/'
  const genre = new URLSearchParams(search).get('genre')
  const player = getPlayer()
  const buttons: PresenceData['buttons'] = [{ label: viewPage, url: href }]

  if (player) {
    const { video, title, episode, id } = player
    const [startTimestamp, endTimestamp] = getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )

    return {
      type: ActivityType.Watching,
      name: title || serviceName,
      details: episode || 'Assistindo',
      largeImageKey: coverFor(id),
      smallImageKey: video.paused ? Assets.Pause : Assets.Play,
      smallImageText: video.paused ? 'Pausado' : 'Assistindo',
      ...(video.paused ? {} : { startTimestamp, endTimestamp }),
      ...(id ? { buttons: [{ label: viewPage, url: `${origin}/anime/${id}` }] } : {}),
    }
  }

  if (path === '/') {
    return {
      type: ActivityType.Watching,
      name: serviceName,
      details: 'Navegando na página inicial',
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
    }
  }

  if (path in catalogs) {
    const catalog = catalogs[path]
    const showGenre = genre && path !== '/animes/lancamentos'

    return {
      type: ActivityType.Watching,
      name: serviceName,
      details: 'Explorando Catálogo:',
      state: showGenre ? `${catalog} - ${genre}` : catalog,
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
      buttons,
    }
  }

  if (/^\/perfil\/[^/]+$/.test(path)) {
    const username = text(document.querySelector('h1.truncate'))
    const avatar = document.querySelector<HTMLImageElement>('img.size-28[alt="Avatar"]')?.src
    const { watched, likes, comments } = getProfileStats()
    const stats = [
      watched && plural(watched, 'Anime', 'Animes'),
      likes && plural(likes, 'Curtida', 'Curtidas'),
      comments && plural(comments, 'Comentário', 'Comentários'),
    ].filter(Boolean).join(' | ')

    return {
      type: ActivityType.Watching,
      name: serviceName,
      details: username || 'Visualizando perfil',
      ...(stats ? { state: stats } : {}),
      largeImageKey: avatar || ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
      buttons,
    }
  }

  if (/^\/anime\/[^/]+$/.test(path)) {
    const title = document.querySelector('h1[title]')?.getAttribute('title') ?? cleanTitle(document.title)

    return {
      type: ActivityType.Watching,
      name: title || serviceName,
      details: 'Verificando informações',
      largeImageKey: coverFor(getAnimeId(path)),
      startTimestamp: browsingTimestamp,
      buttons,
    }
  }

  return {
    type: ActivityType.Watching,
    name: serviceName,
    details: 'Navegando no AnimeFire',
    state: document.title.replace(/\s+-\s+AnimeFire.*$/i, '') || undefined,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    buttons,
  }
}

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    viewPage: 'general.buttonViewPage',
  })

  presence.setActivity(buildPresence(strings.viewPage))
})
