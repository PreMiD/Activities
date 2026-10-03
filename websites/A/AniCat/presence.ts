import { ActivityType, Assets, getTimestamps } from 'premid'

// То же Discord-приложение, что у десктопного шелла AniCat
// (apps/desktop/src-tauri/src/lib.rs, DISCORD_CLIENT_ID).
const presence = new Presence({ clientId: '1553861006164238507' })

// Логотип — Imgur (гайдлайны PreMiD требуют Imgur для картинок; локальный
// /symbol.png на проде 404-ит и недоступен для медиа-прокси Discord).
enum ActivityAssets {
  Logo = 'https://i.imgur.com/72dpXW6.png',
}

// Локали сайта: ru — без префикса в пути, en и uk — с префиксом.
const LOCALE_PREFIX = /^\/(?:ru|en|uk)(?=\/|$)/

// Kodik-мост шлёт тики раз в секунду, поэтому 5 секунд тишины означают,
// что iframe-плеер остановлен или уже не на странице.
const TICK_STALE_MS = 5000

// Приватные разделы: состояние в Discord не отдаём.
const PRIVATE_PATHS = ['/auth', '/settings', '/admin', '/desktop-auth', '/desktop-connect', '/banned', '/unsubscribe']

interface PlayerState {
  currentTime: number
  duration: number
  paused: boolean
  lastTickAt: number
}

// Состояние iframe-плееров (Kodik/Moonlight). Нативный плеер AniCat
// рендерит <video> прямо в DOM и читается на каждом тике, а iframe-плееры
// видны только через postMessage — те же мосты, что потребляет сама
// страница (apps/web/src/lib/kodikBridge.ts и moonlightBridge.ts в
// репозитории AniCat).
let iframePlayer: PlayerState | null = null
let lastRouteKey = ''

window.addEventListener('message', (event: MessageEvent) => {
  const data: unknown = event.data
  if (!data || typeof data !== 'object')
    return

  // Kodik: { key: 'kodik_player_*', value }, значения секунд приходят и
  // числами, и числовыми строками — приводятся через toSeconds().
  const key = (data as { key?: unknown }).key
  if (typeof key === 'string') {
    const seconds = toSeconds((data as { value?: unknown }).value)

    switch (key) {
      case 'kodik_player_time_update': {
        if (seconds == null)
          return
        iframePlayer = {
          currentTime: seconds,
          duration: iframePlayer?.duration ?? 0,
          paused: false,
          lastTickAt: Date.now(),
        }
        return
      }
      case 'kodik_player_duration_update': {
        if (seconds == null)
          return
        if (iframePlayer)
          iframePlayer.duration = seconds
        else iframePlayer = { currentTime: 0, duration: seconds, paused: true, lastTickAt: Date.now() }
        return
      }
      case 'kodik_player_pause': {
        if (iframePlayer) {
          iframePlayer.paused = true
          if (seconds != null)
            iframePlayer.currentTime = seconds
        }
        return
      }
      case 'kodik_player_play': {
        if (iframePlayer) {
          iframePlayer.paused = false
          iframePlayer.lastTickAt = Date.now()
        }
        return
      }
      case 'kodik_player_video_ended': {
        if (iframePlayer)
          iframePlayer.paused = true
      }
    }
    return
  }

  // Мост Moonlight: формат { event: 'time', time, duration } слишком
  // общий, поэтому фильтруем по origin — список совпадает с frame-src
  // CSP сайта. Протокол молчит с 09.2026, слушатель оставлен на случай,
  // пока вендор не вернёт события (см. комментарий в moonlightBridge.ts).
  const origin = event.origin
  if (origin !== 'https://moonanime.art' && !origin.endsWith('.moonanime.art'))
    return

  const moonEvent = (data as { event?: unknown }).event
  const time = (data as { time?: unknown }).time
  if (typeof time !== 'number')
    return

  if (moonEvent === 'time') {
    const duration = (data as { duration?: unknown }).duration
    iframePlayer = {
      currentTime: time,
      duration: typeof duration === 'number' ? duration : iframePlayer?.duration ?? 0,
      paused: false,
      lastTickAt: Date.now(),
    }
  }
  else if (moonEvent === 'pause' && iframePlayer) {
    iframePlayer.paused = true
    iframePlayer.currentTime = time
  }
})

function toSeconds(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value))
    return value
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value)))
    return Number(value)
  return null
}

// Нативный плеер AniCat — рендерер по умолчанию, видео в основном документе.
function getNativePlayer(): PlayerState | null {
  const video = document.querySelector('video')
  if (!video || video.readyState === 0)
    return null
  if (!Number.isFinite(video.duration) || video.duration <= 0)
    return null
  return { currentTime: video.currentTime, duration: video.duration, paused: video.paused, lastTickAt: Date.now() }
}

function getActivePlayer(): PlayerState | null {
  const native = getNativePlayer()
  if (native)
    return native
  if (iframePlayer && Date.now() - iframePlayer.lastTickAt < TICK_STALE_MS)
    return iframePlayer
  return null
}

// schema.org JSON-LD на страницах тайтла и просмотра: имя, постер и число
// эпизодов — стабильный источник без парсинга переведённого UI.
function getTitleLd(): Record<string, unknown> | null {
  for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const parsed: unknown = JSON.parse(el.textContent ?? '')
      for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
        const record = item as Record<string, unknown>
        if (record && (record['@type'] === 'TVSeries' || record['@type'] === 'Movie'))
          return record
      }
    }
    catch {
      continue
    }
  }
  return null
}

function getLdString(ld: Record<string, unknown> | null, field: string): string | null {
  const value = ld?.[field]
  return typeof value === 'string' && value.length > 0 ? value : null
}

// Имена эпизодов (публичный API сайта, данные AniList). Кэшируется на
// страницу; пустой объект — отрицательный кэш, чтобы не дёргать API
// на каждом тике, если запрос не удался.
const episodeNamesCache = new Map<string, Record<number, string>>()

function loadEpisodeNames(id: string): void {
  if (episodeNamesCache.has(id))
    return
  episodeNamesCache.set(id, {})
  fetch(`https://api.anicat.cc/v1/titles/${id}/episode-names`)
    .then(res => (res.ok ? res.json() : null))
    .then((data: { episodes?: Record<number, string> } | null) => {
      episodeNamesCache.set(id, data?.episodes ?? {})
    })
    .catch(() => {})
}

let browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const [showButtons, showTimestamp, showPoster] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showPoster'),
  ])

  const strings = await presence.getStrings({
    browse: 'general.browsing',
    watchingAnime: 'general.watchingAnime',
    viewAnime: 'general.viewAnime',
    viewProfile: 'general.viewProfile',
    searchFor: 'general.searchFor',
    episode: 'general.episode',
    season: 'general.season',
    playing: 'general.playing',
    paused: 'general.paused',
    watchAnime: 'general.buttonWatchAnime',
    viewAnimeButton: 'general.buttonViewAnime',
    catalog: 'anicat.catalog',
    schedule: 'anicat.schedule',
    myList: 'anicat.myList',
    feed: 'anicat.feed',
    changelog: 'anicat.changelog',
    notifications: 'anicat.notifications',
    watchTogether: 'anicat.watchTogether',
  })

  const { pathname, href, search } = document.location
  const path = pathname.replace(LOCALE_PREFIX, '')
  const routeKey = path + search

  // Переход на другую страницу (включая смену серии/озвучки) — свежий
  // отсчёт времени и чистое состояние плеера.
  if (routeKey !== lastRouteKey) {
    lastRouteKey = routeKey
    iframePlayer = null
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }

  // Без type (не-медиа страницы) largeImageText запрещён типами PreMiD —
  // он подставляется только в media-варианте ниже.
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const watchMatch = path.match(/^\/watch\/(\d+)\/(\d+)$/)

  if (watchMatch) {
    // Регекс гарантирует обе группы, но при noUncheckedIndexedAccess
    // индексация RegExpMatchArray даёт string | undefined.
    const titleId = watchMatch[1] ?? ''
    const episode = watchMatch[2] ?? ''
    const ld = getTitleLd()
    const title = getLdString(ld, 'name') ?? 'AniCat'
    const poster = getLdString(ld, 'image')
    // У фильмов numberOfEpisodes === 1 — «Серия 1» в статусе не нужна.
    const isMovie = ld?.numberOfEpisodes === 1
    // ?s= — сезон; паттерн «Season N, Episode M» Discord превращает в
    // бейдж SxEy на карточке активности.
    const season = Number(new URLSearchParams(search).get('s')) || 1
    // ?room= — просмотр вместе (watch-together).
    const watchTogether = new URLSearchParams(search).has('room')

    loadEpisodeNames(titleId)

    const stateParts: string[] = []
    if (season > 1)
      stateParts.push(`${strings.season} ${season}`)
    stateParts.push(isMovie ? strings.watchingAnime : `${strings.episode} ${episode}`)
    const episodeName = episodeNamesCache.get(titleId)?.[Number(episode)]
    if (episodeName)
      stateParts.push(episodeName)
    if (watchTogether)
      stateParts.push(strings.watchTogether)

    const watchData: PresenceData = {
      type: ActivityType.Watching,
      details: title,
      state: stateParts.join(' · '),
      largeImageKey: showPoster && poster ? poster : ActivityAssets.Logo,
      largeImageText: season > 1 ? `Season ${season}, Episode ${episode}` : title,
      startTimestamp: browsingTimestamp,
    }

    const player = getActivePlayer()
    if (player && !player.paused) {
      watchData.smallImageKey = Assets.Play
      watchData.smallImageText = strings.playing
      if (showTimestamp && player.duration > 0 && player.currentTime > 0)
        [watchData.startTimestamp, watchData.endTimestamp] = getTimestamps(player.currentTime, player.duration)
    }
    else {
      watchData.smallImageKey = Assets.Pause
      watchData.smallImageText = strings.paused
    }

    if (showButtons) {
      // Вторая кнопка — на страницу тайтла с сохранением префикса локали.
      const localePrefix = pathname.slice(0, pathname.length - path.length)
      const titleUrl = `${location.origin}${localePrefix}/titles/${titleId}`
      watchData.buttons = [
        { label: strings.watchAnime, url: href },
        { label: strings.viewAnimeButton, url: titleUrl },
      ]
    }

    presence.setActivity(watchData)
    return
  }

  if (PRIVATE_PATHS.some(privatePath => path === privatePath || path.startsWith(`${privatePath}/`))) {
    presence.clearActivity()
    return
  }
  else {
    if (path === '/' || path === '') {
      presenceData.details = strings.browse
    }
    else if (path.startsWith('/catalog')) {
      presenceData.details = strings.catalog
    }
    else if (path.startsWith('/search')) {
      presenceData.details = strings.searchFor
      const query = new URLSearchParams(search).get('q')?.trim()
      if (query)
        presenceData.state = query
    }
    else if (path.startsWith('/titles/')) {
      const ld = getTitleLd()
      const title = getLdString(ld, 'name')
      const poster = getLdString(ld, 'image')
      presenceData.details = strings.viewAnime
      presenceData.state = title ?? strings.browse
      if (showPoster && poster)
        presenceData.largeImageKey = poster
      if (showButtons)
        presenceData.buttons = [{ label: strings.viewAnimeButton, url: href }]
    }
    else if (path.startsWith('/schedule')) {
      presenceData.details = strings.schedule
    }
    else if (path.startsWith('/list')) {
      presenceData.details = strings.myList
    }
    else if (path.startsWith('/profile/')) {
      presenceData.details = strings.viewProfile
      const username = path.split('/')[2]
      if (username)
        presenceData.state = `@${decodeURIComponent(username)}`
    }
    else if (path.startsWith('/feed')) {
      presenceData.details = strings.feed
    }
    else if (path.startsWith('/changelog')) {
      presenceData.details = strings.changelog
    }
    else if (path.startsWith('/notifications')) {
      presenceData.details = strings.notifications
    }
    else {
      presenceData.details = strings.browse
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
