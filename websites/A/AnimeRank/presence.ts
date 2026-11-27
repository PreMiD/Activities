import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1519847995862945813',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const LOGO = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeRank/assets/logo.png'

interface AnimeInfo {
  title: string
  cover?: string
}

interface AnimeImages {
  coverLarge?: string
  coverSmall?: string
  banner?: string
  backdrop1080?: string
  hero_image?: string
}

const animeCache = new Map<string, AnimeInfo>()
// id -> time the lookup started
const pending = new Map<string, number>()
// Failed lookups are retried with a growing delay instead of being cached as "unknown" forever.
// API failures and missing covers are counted separately, so earlier API errors do not use up
// the cover attempts.
interface RetryState { count: number, at: number }
const apiRetry = new Map<string, RetryState>()
const coverRetry = new Map<string, RetryState>()

// Discord downloads the image itself, so it needs an absolute, small, raster URL.
// The API returns site-relative paths (some already proxied) and very large originals.
function toProxyUrl(raw: string): string {
  const { origin } = document.location
  const source = raw.startsWith('/api/proxy/img')
    ? new URL(raw, origin).searchParams.get('url') ?? ''
    : raw
  return source
    ? `${origin}/api/proxy/img?url=${encodeURIComponent(source)}&w=512&format=jpeg`
    : ''
}

// Returns the first image that really resolves to a raster file. A dead source answers with a
// redirect to an SVG placeholder, which Discord cannot render (it shows a question mark).
// Requesting it here also warms the proxy cache before Discord asks for the same URL.
async function pickCover(images?: AnimeImages): Promise<string | undefined> {
  const candidates = [
    images?.coverLarge,
    images?.coverSmall,
    images?.banner,
    images?.backdrop1080,
    images?.hero_image,
  ]
  const tried = new Set<string>()
  for (const raw of candidates) {
    const url = raw
      ? toProxyUrl(raw)
      : ''
    if (!url || tried.has(url))
      continue
    tried.add(url)
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
      })
      const type = res.headers.get('content-type') ?? ''
      if (res.ok && !res.redirected && /^image\/(?:jpeg|png|webp|gif)/.test(type))
        return url
    }
    catch {
      // try the next candidate
    }
  }
  return undefined
}

async function loadAnime(id: string): Promise<AnimeInfo> {
  const res = await fetch(`/api/anime/${id}`, {
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`)
  const body = await res.json()
  const anime = body?.anime ?? body?.data ?? body
  const names = anime?.title ?? {}
  const title: string = names.turkish || names.english || names.romaji || ''
  if (!title)
    throw new Error('Anime has no title')
  return { title, cover: await pickCover(anime?.images) }
}

// A title without a usable cover is looked up again a few times, in case the image service was
// briefly down; an anime that really has no image stops after that.
const MAX_COVER_RETRIES = 3

function scheduleRetry(map: Map<string, RetryState>, id: string): void {
  const count = (map.get(id)?.count ?? 0) + 1
  map.set(id, { count, at: Date.now() + Math.min(60, 5 * 2 ** (count - 1)) * 1000 })
}

function waiting(state?: RetryState): boolean {
  return state !== undefined && Date.now() < state.at
}

// Detail and watch pages carry the MAL id in the path: /anime/<id>[-slug], /watch/<id>[-slug]/<episode>.
// Title and cover come from the site's public API once per anime and are cached.
function getAnime(id: string): AnimeInfo | null {
  const cached = animeCache.get(id) ?? null
  const coverFailed = coverRetry.get(id)
  const complete = cached && (cached.cover || (coverFailed?.count ?? 0) >= MAX_COVER_RETRIES)
  if (complete || pending.has(id) || waiting(apiRetry.get(id)) || (cached && waiting(coverFailed)))
    return cached

  pending.set(id, Date.now())
  loadAnime(id)
    .then((info) => {
      apiRetry.delete(id)
      animeCache.set(id, info)
      if (info.cover)
        coverRetry.delete(id)
      else
        scheduleRetry(coverRetry, id)
    })
    .catch(() => scheduleRetry(apiRetry, id))
    .finally(() => pending.delete(id))
  return cached
}

// The first answer normally arrives well within this window. Waiting for it avoids publishing a
// logo-only activity that is replaced a moment later (every change is a separate Discord update).
function isLoading(id: string): boolean {
  const startedAt = pending.get(id)
  return startedAt !== undefined && Date.now() - startedAt < 2500
}

// Fallback while the API answer is missing. Client-side title: "<title> · Bölüm N · AnimeRank",
// server-rendered title: "<title> N. Bölüm 4K Türkçe Altyazılı İzle — AnimeRank".
function titleFromDocument(): string {
  return document.title
    .split(' · ')[0]
    ?.replace(/\s*[—-]\s*AnimeRank.*$/, '')
    .replace(/\s+(?:\d+\. Bölüm|4K|Türkçe)\s.*$/, '')
    .trim() || ''
}

let lastTimestamps: [number, number] | null = null

presence.on('UpdateData', async () => {
  const [privacy, showCover, showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
  ])

  const { pathname, href, origin } = document.location
  const presenceData: PresenceData = {
    largeImageKey: LOGO,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const watch = pathname.match(/^\/watch\/(\d+)(?:-[^/]*)?\/(\d+)/)
  const detail = pathname.match(/^\/anime\/(\d+)/)

  if (watch) {
    const [, id, ep] = watch
    const anime = getAnime(id!)
    if (!anime && isLoading(id!))
      return
    const title = anime?.title || titleFromDocument()
    // The watch page also has preview/background <video> elements; read the main player only.
    const video = document.querySelector<HTMLVideoElement>('#ar-main-video')
      ?? [
        ...document.querySelectorAll<HTMLVideoElement>('video'),
      ]
        .filter(v => Number.isFinite(v.duration))
        .sort((a, b) => b.duration - a.duration)[0]
        ?? null

    presenceData.details = privacy ? 'Anime izliyor' : title
    if (!privacy)
      presenceData.state = `${ep}. Bölüm`
    if (!privacy && showCover && anime?.cover)
      presenceData.largeImageKey = anime.cover
    presenceData.largeImageText = privacy ? 'AnimeRank' : title

    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? 'Duraklatıldı' : 'Oynatılıyor'
      if (video.paused) {
        delete presenceData.startTimestamp
        lastTimestamps = null
      }
      else if (showTimestamp) {
        // While the player is buffering or seeking the computed start time moves on every tick,
        // which would send one update per second. Keep the last value until playback continues.
        const stalled = video.seeking || video.readyState < 3
        if (!stalled || !lastTimestamps)
          lastTimestamps = getTimestampsFromMedia(video)
        const [start, end] = lastTimestamps
        presenceData.startTimestamp = start
        presenceData.endTimestamp = end
      }
    }
    if (!privacy && showButtons) {
      presenceData.buttons = [
        { label: 'Bölümü İzle', url: href },
        { label: 'Animeye Göz At', url: `${origin}/anime/${id}` },
      ]
    }
  }
  else if (detail) {
    const [, id] = detail
    const anime = getAnime(id!)
    if (!anime && isLoading(id!))
      return
    const title = anime?.title || titleFromDocument()
    presenceData.details = privacy ? 'Sitede geziniyor' : 'Animeye göz atıyor'
    if (!privacy) {
      presenceData.state = title
      if (showCover && anime?.cover)
        presenceData.largeImageKey = anime.cover
      if (showButtons) {
        presenceData.buttons = [
          { label: 'Animeye Göz At', url: href },
        ]
      }
    }
    presenceData.smallImageKey = Assets.Viewing
  }
  else {
    presenceData.details = 'Sitede geziniyor'
    if (!privacy) {
      const pages: Record<string, string> = {
        '/': 'Ana sayfada',
        '/kesfet': 'Keşfet sayfasında',
        '/animeler': 'Anime listesinde',
        '/takvim': 'Yayın takvimine bakıyor',
        '/koleksiyonlar': 'Koleksiyonlara bakıyor',
        '/arkadaslar': 'Arkadaşlarına bakıyor',
        '/premium': 'Premium paketlere bakıyor',
        '/ayarlar': 'Ayarlarda',
        '/kim-izliyor': 'Profil seçiyor',
        '/topluluk': 'Toplulukta',
        '/birlikte': 'Birlikte İzle odasında',
      }
      const key = Object.keys(pages).find(p => pathname === p || (p !== '/' && pathname.startsWith(`${p}/`)))
      if (key)
        presenceData.state = pages[key]
      else if (pathname.startsWith('/profil'))
        presenceData.state = 'Profile bakıyor'
      else if (pathname.startsWith('/koleksiyon/'))
        presenceData.state = 'Koleksiyona bakıyor'
    }
    presenceData.smallImageKey = Assets.Search
  }

  presence.setActivity(presenceData)
})
