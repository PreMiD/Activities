import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1519847995862945813',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const LOGO = 'https://animerank.tv/icons/icon-512.png'

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
        animeCache.set(id, title ? { title, cover: a?.images?.coverLarge || a?.images?.coverSmall } : null)
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

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    paused: 'general.paused',
    playing: 'general.playing',
    episode: 'general.episode',
    buttonViewEpisode: 'general.buttonViewEpisode',
    buttonViewSeries: 'general.buttonViewSeries',
    viewHome: 'general.viewHome',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const [newLang, privacy, showCover, showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
  ])
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

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
    const video = document.querySelector<HTMLVideoElement>('video')

    presenceData.details = privacy ? 'Anime izliyor' : title
    presenceData.state = `${strings.episode ?? 'Bölüm'} ${ep}`
    if (!privacy && showCover && anime?.cover)
      presenceData.largeImageKey = anime.cover
    presenceData.largeImageText = privacy ? 'AnimeRank' : title

    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? (strings.paused ?? 'Duraklatıldı') : (strings.playing ?? 'Oynatılıyor')
      if (showTimestamp && !video.paused)
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
      else if (video.paused)
        delete presenceData.startTimestamp
    }
    if (!privacy && showButtons) {
      presenceData.buttons = [
        { label: strings.buttonViewEpisode ?? 'Bölümü İzle', url: href },
        { label: strings.buttonViewSeries ?? 'Animeye Göz At', url: `${origin}/anime/${id}` },
      ]
    }
  }
  else if (detail) {
    const [, id] = detail
    const anime = getAnime(id!)
    const title = anime?.title || titleFromDocument()
    presenceData.details = privacy ? (strings.browsing ?? 'Bakınıyor') : 'Animeye göz atıyor'
    if (!privacy) {
      presenceData.state = title
      if (showCover && anime?.cover)
        presenceData.largeImageKey = anime.cover
      if (showButtons)
        presenceData.buttons = [{ label: strings.buttonViewSeries ?? 'Animeye Göz At', url: href }]
    }
    presenceData.smallImageKey = Assets.Viewing
  }
  else {
    presenceData.details = strings.browsing ?? 'Bakınıyor'
    if (!privacy) {
      const pages: Record<string, string> = {
        '/': strings.viewHome ?? 'Ana sayfa',
        '/kesfet': 'Keşfet',
        '/animeler': 'Keşfet',
        '/takvim': 'Yayın takvimi',
        '/koleksiyonlar': 'Koleksiyonlar',
        '/arkadaslar': 'Arkadaşlar',
        '/premium': 'Premium',
        '/ayarlar': 'Ayarlar',
        '/kim-izliyor': 'Profil seçiyor',
      }
      const key = Object.keys(pages).find(p => pathname === p || (p !== '/' && pathname.startsWith(`${p}/`)))
      if (key)
        presenceData.state = pages[key]
      else if (pathname.startsWith('/profil'))
        presenceData.state = 'Profil'
      else if (pathname.startsWith('/koleksiyon/'))
        presenceData.state = 'Koleksiyon'
    }
    presenceData.smallImageKey = Assets.Search
  }

  presence.setActivity(presenceData)
})
