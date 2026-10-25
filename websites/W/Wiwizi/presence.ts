import {
  ActivityType,
  Assets,
  getTimestampsFromMedia,
} from 'premid'

const presence = new Presence({
  clientId: '1524803642383663114',
})

enum ActivityAssets {
  Logo = 'https://wiwizi.com/assets/logo.png',
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath = ''

interface SchemaData {
  name?: string
  image?: string
  datePublished?: string
  startDate?: string
  genre?: string | string[]
  aggregateRating?: {
    ratingValue?: string | number
  }
}

function getSchemaData(): SchemaData | null {
  const scripts = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || '{}')
      if (data.name && (data['@type'] === 'Movie' || data['@type'] === 'TVSeries' || data['@type'] === 'Animation' || data.image)) {
        return data
      }
    }
    catch {}
  }
  return null
}

function cleanTitle(rawTitle: string): string {
  return rawTitle
    .replace(/\s*-\s*wiwizi.*$/i, '')
    .replace(/\s*\|\s*wiwizi.*$/i, '')
    .replace(/\s*-\s*Oyuncular.*$/i, '')
    .trim()
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  if (pathname !== lastPath) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    lastPath = pathname
  }

  const showButtons = await presence.getSetting<boolean>('showButtons')
  const showTimestamps = await presence.getSetting<boolean>('showTimestamps')

  const video = document.querySelector<HTMLVideoElement>('video')
  const schema = getSchemaData()

  // URL tabanlı içerik detay kontrolü (Film, Dizi, Anime detay sayfaları)
  const isFilmDetail = Boolean(pathname.match(/\/(?:film|watch)\/\d+/))
  const isTvDetail = Boolean(pathname.match(/\/(?:tv|dizi)\/\d+/))
  const isAnimeDetail = Boolean(
    pathname.match(/\/anime\/[^/]+/)
    && !pathname.match(/\/anime\/(?:tv|movie|top|new|popular)(?:$|[#?])/),
  )

  const isContentDetail = Boolean(schema?.name) || isFilmDetail || isTvDetail || isAnimeDetail

  // ==========================================
  // 1. İÇERİK DETAY SAYFASI (Film, Dizi, Anime)
  // ==========================================
  if (isContentDetail) {
    // 1. İçerik Başlığı
    let title = schema?.name
    if (!title) {
      const h1s = Array.from(document.querySelectorAll('h1'))
      const contentH1 = h1s.find(h => !h.textContent?.includes('wiwizi - Social') && !h.classList.contains('sr-only'))
      title = contentH1?.textContent?.trim() || cleanTitle(document.title) || 'İçerik Detayı'
    }

    // 2. Poster Görseli
    let poster = schema?.image
    if (!poster) {
      const posterImg = document.querySelector<HTMLImageElement>(
        'img[src*="image.tmdb.org"], img[src*="media-cache"], img[src*="anime-cover"], div[class*="aspect-[2/3]"] img',
      )
      poster = posterImg?.src || document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content || ActivityAssets.Logo
    }

    // 3. Kısa Bilgi (Yıl, Puan, Türler)
    const year = (schema?.datePublished || schema?.startDate || '').split('-')[0]
      || document.title.match(/\((\d{4})\)/)?.[1]
      || null

    const ratingVal = schema?.aggregateRating?.ratingValue
    const rating = ratingVal ? `⭐ ${ratingVal}` : null

    let genres: string | null = null
    if (schema?.genre) {
      genres = Array.isArray(schema.genre) ? schema.genre.slice(0, 2).join(', ') : (schema.genre as string)
    }

    const metaParts = [year, rating, genres].filter(Boolean)
    const defaultState = isAnimeDetail ? 'Anime inceliyor' : isTvDetail ? 'Dizi inceliyor' : 'Film inceliyor'
    const shortInfo = metaParts.length > 0 ? metaParts.join(' • ') : defaultState

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      details: title,
      state: shortInfo,
      largeImageKey: poster,
      largeImageText: title,
      smallImageKey: ActivityAssets.Logo,
      smallImageText: 'wiwizi.com',
      startTimestamp: browsingTimestamp,
    }

    // Video oynatılıyorsa
    if (video && video.readyState > 0) {
      if (!video.paused) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Oynatılıyor'
        if (showTimestamps) {
          const [start, end] = getTimestampsFromMedia(video)
          presenceData.startTimestamp = start
          presenceData.endTimestamp = end
        }
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Duraklatıldı'
      }
    }

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Wiwizi\'de İncele', url: href },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // ==========================================
  // 2. KATALOG, LİSTE VE GEZİNME SAYFALARI
  // ==========================================
  const pathLower = pathname.toLowerCase()

  let pageTitle = 'Ana sayfada'
  if (pathLower.includes('anime')) {
    pageTitle = 'Anime sayfasında'
  }
  else if (pathLower.includes('film') || pathLower.includes('movie')) {
    pageTitle = 'Film sayfasında'
  }
  else if (pathLower.includes('dizi') || pathLower.includes('tv')) {
    pageTitle = 'Dizi sayfasında'
  }
  else if (pathLower.includes('seri') || pathLower.includes('collection')) {
    pageTitle = 'Seriler sayfasında'
  }
  else if (pathLower.includes('listem') || pathLower.includes('watchlist')) {
    pageTitle = 'İzleme listesinde'
  }
  else if (pathLower.includes('/u/') || pathLower.includes('/profile') || pathLower.includes('/kullanici/')) {
    const username = pathname.split('/').filter(Boolean).pop() || 'kullanıcı'
    pageTitle = `@${username} profilinde`
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    details: pageTitle,
    state: 'Keşfediyor',
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'wiwizi.com',
    startTimestamp: browsingTimestamp,
  }

  presence.setActivity(presenceData)
})
