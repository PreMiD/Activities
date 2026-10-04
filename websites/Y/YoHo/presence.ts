import { ActivityType } from 'premid';

(() => {
  'use strict'

  // This is PreMiD's public Discord application. See README.txt to use a
  // dedicated YoHo application name instead of "PreMiD" in Discord.
  const presence = new Presence({ clientId: '503557087041683458' })
  const LOGO = 'https://reyoho.ru/icon?57a86ae42f7a6ded'
  const PLAYER_DATA_TTL = 35000

  interface PlayerState {
    duration: number
    currentTime: number
    paused: boolean
    episode: string
    receivedAt: number
  }

  interface MessagedEpisode {
    label: string
    receivedAt: number
  }

  interface TitleData {
    title: string
    year: string
    mediaType: 'film' | 'series'
  }

  interface PlaybackData {
    duration: number
    currentTime: number
    paused: boolean
    episode: string
  }

  interface IFramePayload {
    url?: unknown
    duration?: unknown
    currentTime?: unknown
    paused?: unknown
    episode?: unknown
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
  }

  const playerStates = new Map<string, PlayerState>()
  let lastPathname = location.pathname
  let messagedEpisode: MessagedEpisode = { label: '', receivedAt: 0 }
  let updateTimer: ReturnType<typeof setTimeout> | undefined

  window.addEventListener('message', (event) => {
    let hostname = ''

    try {
      hostname = new URL(event.origin).hostname
    }
    catch {
      return
    }

    if (!/(?:nextembed\.ws|stravers\.live|kodikplayer\.com|obrut\.show)$/i.test(hostname)) {
      return
    }

    let data: unknown = event.data

    if (typeof data === 'string' && data.startsWith('{')) {
      try {
        data = JSON.parse(data) as unknown
      }
      catch {
        return
      }
    }

    if (!isRecord(data) || data.event !== 'changeEpisode')
      return

    const season = cleanText(data.season)
    const episode = cleanText(data.episode)

    if (episode) {
      messagedEpisode = {
        label: season ? `Сезон ${season} • серия ${episode}` : `Серия ${episode}`,
        receivedAt: Date.now(),
      }
    }
  })

  presence.on('iFrameData', (rawData) => {
    const data = rawData as IFramePayload

    if (typeof data.url !== 'string' || !data.url)
      return

    const duration = Number(data.duration)
    const currentTime = Number(data.currentTime)

    playerStates.set(data.url, {
      duration: Number.isFinite(duration) && duration > 0 ? duration : 0,
      currentTime: Number.isFinite(currentTime) && currentTime >= 0 ? currentTime : 0,
      paused: data.paused !== false,
      episode: cleanText(data.episode),
      receivedAt: Date.now(),
    })
  })

  function cleanText(value: unknown): string {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
  }

  function absoluteUrl(value: unknown): string {
    if (typeof value !== 'string' || !value)
      return ''

    try {
      return new URL(value, location.origin).href
    }
    catch {
      return ''
    }
  }

  function findTitleData(): TitleData | null {
    if (!/^\/(?:film|series)\/\d+\/?$/.test(location.pathname))
      return null

    const marker = document.querySelector<HTMLElement>('[data-yoho-film="true"]')
    if (!marker)
      return null

    return {
      title: cleanText(marker.dataset.title) || titleFromMeta(),
      year: cleanText(marker.dataset.year),
      mediaType: marker.dataset.mediaType === 'tv' ? 'series' : 'film',
    }
  }

  function titleFromMeta(): string {
    const value = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content || ''
    return cleanText(value.replace(/\s*[|–-]\s*(?:смотреть.*|YoHo.*)$/i, ''))
  }

  function jsonLdEntries(value: unknown): Record<string, unknown>[] {
    if (Array.isArray(value))
      return value.flatMap(jsonLdEntries)
    if (!isRecord(value))
      return []

    const graph = value['@graph']
    if (Array.isArray(graph))
      return graph.flatMap(jsonLdEntries)

    return [value]
  }

  function imageFromJsonLd(): string {
    for (const script of document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')) {
      try {
        const entries = jsonLdEntries(JSON.parse(script.textContent || 'null') as unknown)
        const media = entries.find(entry =>
          entry['@type'] === 'Movie' || entry['@type'] === 'TVSeries',
        )

        if (!media)
          continue

        const image = Array.isArray(media.image) ? media.image[0] : media.image
        const value = isRecord(image) ? image.url : image
        const url = absoluteUrl(value)

        if (url)
          return url
      }
      catch {
        // Ignore unrelated or temporarily incomplete JSON-LD blocks.
      }
    }

    return ''
  }

  function findPoster(): string {
    const image = document.querySelector<HTMLImageElement>(
      'img[alt^="Постер фильма"], img[alt^="Постер сериала"], img[class*="FilmInfo"][class*="poster"]',
    )

    const fromDom = absoluteUrl(
      image?.currentSrc || image?.getAttribute('src') || image?.getAttribute('data-src') || '',
    )

    return fromDom || imageFromJsonLd() || LOGO
  }

  function findPageVideo(): HTMLVideoElement | null {
    return Array.from(document.querySelectorAll<HTMLVideoElement>('video'))
      .filter(video => Number.isFinite(video.duration) && video.duration > 0)
      .sort((a, b) => b.duration - a.duration)[0] ?? null
  }

  function getPlayback(): PlaybackData | null {
    const video = findPageVideo()

    if (video) {
      return {
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
        episode: '',
      }
    }

    const now = Date.now()

    for (const [key, value] of playerStates) {
      if (now - value.receivedAt > PLAYER_DATA_TTL)
        playerStates.delete(key)
    }

    const states = Array.from(playerStates.values())

    return states.find(state => !state.paused && (state.duration > 0 || state.currentTime > 0))
      || states.find(state => state.duration > 0)
      || states.find(state => state.episode)
      || null
  }

  function getMessagedEpisode(): string {
    return Date.now() - messagedEpisode.receivedAt <= PLAYER_DATA_TTL
      ? messagedEpisode.label
      : ''
  }

  function formatDuration(seconds: number): string {
    const total = Math.max(0, Math.floor(seconds))
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const secs = total % 60

    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      : `${minutes}:${String(secs).padStart(2, '0')}`
  }

  function timestamps(currentTime: number, duration: number): [number, number] {
    const now = Math.floor(Date.now() / 1000)
    return [
      now - Math.floor(currentTime),
      now + Math.floor(duration - currentTime),
    ]
  }

  function episodeLabel(value: string): string {
    if (!value)
      return ''

    const seasonEpisode = value.match(
      /(?:сезон|season|s)\s*(\d+)\D{0,80}(?:серия|episode|ep|e)\s*(\d+)/i,
    )

    if (seasonEpisode) {
      return `Сезон ${seasonEpisode[1]} • серия ${seasonEpisode[2]}`
    }

    const episode = value.match(/(?:серия|episode|ep)\s*(\d+)/i)
    return episode ? `Серия ${episode[1]}` : value.slice(0, 80)
  }

  async function updateActivity(): Promise<void> {
    if (lastPathname !== location.pathname) {
      playerStates.clear()
      messagedEpisode = { label: '', receivedAt: 0 }
      lastPathname = location.pathname
    }

    const [showButtonsSetting, showPosterSetting] = await Promise.all([
      presence.getSetting('showButtons'),
      presence.getSetting('showPoster'),
    ])

    const showButtons = Boolean(showButtonsSetting)
    const showPoster = Boolean(showPosterSetting)
    const titleData = findTitleData()

    if (!titleData) {
      const search = cleanText(
        document.querySelector<HTMLInputElement>(
          'input[aria-label="Поиск фильма или сериала"]',
        )?.value,
      )

      const browsingData: PresenceData = {
        type: ActivityType.Watching,
        details: search ? 'Ищет на YoHo' : 'Выбирает, что посмотреть',
        largeImageKey: LOGO,
        largeImageText: 'YoHo',
      }

      if (search)
        browsingData.state = search.slice(0, 128)

      presence.setActivity(browsingData)
      return
    }

    const playback = getPlayback()
    const kind = titleData.mediaType === 'series' ? 'сериал' : 'фильм'

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      details: titleData.title || 'Смотрит на YoHo',
      state: titleData.year
        ? `${kind[0]!.toUpperCase()}${kind.slice(1)} • ${titleData.year}`
        : kind,
      largeImageKey: showPoster ? findPoster() : LOGO,
      largeImageText: titleData.year
        ? `${titleData.title} (${titleData.year})`
        : titleData.title,
    }

    if (showButtons) {
      presenceData.buttons = [{ label: 'Смотреть на YoHo', url: location.href }]
    }

    if (playback && (playback.duration > 0 || playback.currentTime > 0 || playback.episode)) {
      const episode = episodeLabel(playback.episode || getMessagedEpisode())
      const duration = playback.duration > 0 ? formatDuration(playback.duration) : ''

      if (playback.paused && playback.duration <= 0 && playback.currentTime <= 0) {
        presenceData.state = `${episode} • выбирает серию`
      }
      else if (playback.paused) {
        const progress = playback.duration > 0
          ? `${formatDuration(playback.currentTime)} / ${duration}`
          : formatDuration(playback.currentTime)

        presenceData.state = `${episode ? `${episode} • ` : ''}Пауза • ${progress}`
      }
      else {
        presenceData.state = `${episode || `Смотрит ${kind}`}${duration ? ` • ${duration}` : ''}`

        if (playback.duration > playback.currentTime) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps(
            playback.currentTime,
            playback.duration,
          )
        }
        else if (playback.currentTime > 0) {
          presenceData.startTimestamp = Math.floor(
            Date.now() / 1000 - playback.currentTime,
          )
        }
      }
    }
    else if (document.querySelector('#watch [data-yoho-player-host]')) {
      presenceData.state = `Выбирает источник • ${kind}`
    }

    presence.setActivity(presenceData)
  }

  function scheduleUpdate(delay = 100): void {
    if (updateTimer !== undefined)
      clearTimeout(updateTimer)
    updateTimer = setTimeout(() => void updateActivity(), delay)
  }

  presence.on('UpdateData', updateActivity)

  let observedUrl = location.href

  new MutationObserver(() => {
    if (location.href !== observedUrl) {
      observedUrl = location.href
      scheduleUpdate(0)
    }
  }).observe(document.documentElement, { childList: true, subtree: true })

  window.addEventListener('popstate', () => scheduleUpdate(0))

  document.addEventListener(
    'click',
    () => {
      setTimeout(() => {
        if (location.href !== observedUrl) {
          observedUrl = location.href
          scheduleUpdate(0)
        }
      }, 0)
    },
    true,
  )

  document.addEventListener(
    'input',
    (event) => {
      if (
        event.target instanceof HTMLInputElement
        && event.target.matches('input[aria-label="Поиск фильма или сериала"]')
      ) {
        scheduleUpdate(100)
      }
    },
    true,
  )
})()
