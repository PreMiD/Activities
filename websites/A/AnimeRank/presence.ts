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

const animeCache = new Map<string, AnimeInfo | null>()
const pending = new Set<string>()

// Detail and watch pages carry the MAL id in the path: /anime/<id>[-slug], /watch/<id>[-slug]/<episode>.
// Title and cover come from the site's public API once per anime and are cached.
function getAnime(id: string): AnimeInfo | null {
  if (animeCache.has(id))
    return animeCache.get(id) ?? null
  if (!pending.has(id)) {
    pending.add(id)
    fetch(`/api/anime/${id}`)
      .then(r => (r.ok ? r.json() : null))
      .then((d) => {
        const a = d?.anime ?? d?.data ?? d
        const t = a?.title ?? {}
        const title = t.turkish || t.english || t.romaji || ''
        const raw: string | undefined = a?.images?.coverLarge || a?.images?.coverSmall
        // The API returns site-relative paths and very large originals; Discord needs an absolute, small image.
        const cover = raw
          ? `${document.location.origin}/api/proxy/img?url=${encodeURIComponent(raw)}&w=512&format=jpeg`
          : undefined
        animeCache.set(id, title ? { title, cover } : null)
      })
      .catch(() => animeCache.set(id, null))
      .finally(() => pending.delete(id))
  }
  return null
}

// While the API answer is pending, fall back to the page title ("<title> · Bölüm N · AnimeRank").
function titleFromDocument(): string {
  return document.title.split(' · ')[0]?.replace(/\s*[—-]\s*AnimeRank.*$/, '').trim() || ''
}

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
    const title = anime?.title || titleFromDocument()
    // The watch page also has preview/background <video> elements; read the main player only.
    const video = document.querySelector<HTMLVideoElement>('#ar-main-video')
      ?? [...document.querySelectorAll<HTMLVideoElement>('video')]
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
      if (showTimestamp && !video.paused)
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
      else if (video.paused)
        delete presenceData.startTimestamp
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
    const title = anime?.title || titleFromDocument()
    presenceData.details = privacy ? 'Sitede geziniyor' : 'Animeye göz atıyor'
    if (!privacy) {
      presenceData.state = title
      if (showCover && anime?.cover)
        presenceData.largeImageKey = anime.cover
      if (showButtons)
        presenceData.buttons = [{ label: 'Animeye Göz At', url: href }]
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
