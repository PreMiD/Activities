import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1546656432051454054',
})

const logoUrl = 'https://i.imgur.com/3dAnDrb.png'

let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatching = false

function clean(value?: string | null): string {
  return (value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isVisible(element: Element | null): element is HTMLElement {
  if (!(element instanceof HTMLElement))
    return false

  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)

  return (
    rect.width > 1
    && rect.height > 1
    && style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity) > 0.05
  )
}

function isTitlePage(): boolean {
  const path = document.location.pathname.toLowerCase()

  return /^\/(?:serie|serier|film|filmer)\/[^/]+\/?$/.test(path)
}

function isShortPreview(video: HTMLVideoElement): boolean {
  return (
    Number.isFinite(video.duration)
    && video.duration > 0
    && video.duration <= 15 * 60
  )
}

function isMutedAutoplayPreview(video: HTMLVideoElement): boolean {
  if (!isTitlePage())
    return false

  const muted
    = video.muted
      || video.defaultMuted
      || video.volume === 0

  const durationLooksLikePreview
    = !Number.isFinite(video.duration)
      || video.duration <= 15 * 60

  return muted && durationLooksLikePreview
}

function isAudibleTrailer(video: HTMLVideoElement): boolean {
  return (
    isTitlePage()
    && isShortPreview(video)
    && !video.muted
    && !video.defaultMuted
    && video.volume > 0
  )
}

function largestVideo(root: ParentNode = document): HTMLVideoElement | null {
  return [...root.querySelectorAll('video')]
    .filter(video =>
      video.isConnected
      && isVisible(video)
      && !isMutedAutoplayPreview(video)
      && video.readyState > 0
      && Boolean(video.currentSrc || video.src || video.srcObject),
    )
    .map(video => ({
      video,
      rect: video.getBoundingClientRect(),
      active: !video.paused && !video.ended,
    }))
    .sort((a, b) => {
      if (a.active !== b.active)
        return Number(b.active) - Number(a.active)

      return (
        b.rect.width * b.rect.height
        - a.rect.width * a.rect.height
      )
    })[0]
    ?.video || null
}

function unique(values: string[]): string[] {
  return [...new Set(values.map(clean).filter(Boolean))]
}

function readPlayerMeta(player: Element | null): string[] {
  if (!player)
    return []

  const meta
    = player.querySelector('[data-testid="player-meta"]')
      || player.querySelector('[class*="meta"]')

  if (!meta)
    return []

  const preferredSelectors = [
    'h1',
    'h2',
    'h3',
    '[data-testid*="title"]',
    '[data-testid*="episode"]',
    '[data-testid*="season"]',
  ]

  const preferred = unique(
    preferredSelectors.flatMap(selector =>
      [...meta.querySelectorAll(selector)]
        .filter(isVisible)
        .map(element => clean(element.textContent)),
    ),
  )

  if (preferred.length)
    return preferred

  return unique(
    [...meta.querySelectorAll('span, p, div')]
      .filter(element => element.children.length === 0)
      .filter(isVisible)
      .map(element => clean(element.textContent)),
  )
}

function readOpenGraphTitle(): string {
  return clean(
    document.querySelector<HTMLMetaElement>(
      'meta[property="og:title"]',
    )?.content,
  )
}

function cleanTv2Title(value?: string | null): string {
  return clean(value)
    .replace(/\s*[|–-]\s*TV\s*2\s*Play.*$/i, '')
    .replace(/\s*[|–-]\s*TV2\s*Play.*$/i, '')
    .trim()
}

function browserTitle(): string {
  return cleanTv2Title(document.title)
}

function parseEpisodeInfo(lines: string[]) {
  const pathMatch = document.location.pathname.match(
    /\/sesong-(\d+)\/episode-(\d+)/i,
  )

  if (pathMatch) {
    return {
      season: pathMatch[1],
      episode: pathMatch[2],
    }
  }

  const joined = lines.join(' • ')

  const compact
    = joined.match(/\bS(\d+)\s*E(\d+)\b/i)

  if (compact) {
    return {
      season: compact[1],
      episode: compact[2],
    }
  }

  const season
    = joined.match(/(?:sesong|season)\s*(\d+)/i)?.[1]

  const episode
    = joined.match(/(?:episode|ep\.?)\s*(\d+)/i)?.[1]

  return { season, episode }
}

function readEpisodeTitle(
  player: Element | null,
  season?: string,
  episode?: string,
): string {
  if (!player || !season || !episode)
    return ''

  const codeRegex = new RegExp(
    `^(?:S${season}\\s*E${episode}|(?:Sesong|Season)\\s*${season}\\s*(?:[•·|\\-–—]\\s*)?(?:Episode|Ep\\.?)\\s*${episode}|(?:Episode|Ep\\.?)\\s*${episode})$`,
    'i',
  )

  const removeCodeRegex = new RegExp(
    `\\bS${season}\\s*E${episode}\\b|\\b(?:Sesong|Season)\\s*${season}\\b|\\b(?:Episode|Ep\\.?)\\s*${episode}\\b`,
    'gi',
  )

  const candidates = [
    ...player.querySelectorAll<HTMLElement>(
      'span, p, h1, h2, h3, div',
    ),
  ]

  const codeElement = candidates.find(element =>
    isVisible(element)
    && codeRegex.test(clean(element.textContent)),
  )

  if (!codeElement)
    return ''

  const parentText
    = clean(codeElement.parentElement?.textContent)

  if (parentText) {
    const withoutCode = clean(
      parentText.replace(removeCodeRegex, ''),
    )

    if (
      withoutCode
      && withoutCode.length <= 100
      && !/^\d{1,2}:\d{2}/.test(withoutCode)
    ) {
      return withoutCode
    }
  }

  let sibling
    = codeElement.previousElementSibling as HTMLElement | null

  while (sibling) {
    const value = clean(sibling.textContent)

    if (
      value
      && value.length <= 100
      && !/^\d{1,2}:\d{2}/.test(value)
    ) {
      return value
    }

    sibling
      = sibling.previousElementSibling as HTMLElement | null
  }

  return ''
}

function getTitles(player: Element | null) {
  const lines = readPlayerMeta(player)

  const { season, episode }
    = parseEpisodeInfo(lines)

  const showTitle
    = browserTitle()
      || cleanTv2Title(readOpenGraphTitle())
      || 'TV 2 Play'

  const episodeTitle
    = readEpisodeTitle(player, season, episode)

  return {
    showTitle,
    episodeTitle,
    season,
    episode,
  }
}

function isLiveVideo(video: HTMLVideoElement): boolean {
  if (!Number.isFinite(video.duration) || video.duration === Infinity)
    return true

  const path = document.location.pathname.toLowerCase()

  return path === '/direkte-tv' || path.startsWith('/direkte-tv/')
}

presence.on('UpdateData', async () => {
  const language
    = await presence.getSetting<number>('language')

  const privacyMode
    = await presence.getSetting<boolean>('privacyMode')

  const english = language === 1

  const text = english
    ? {
        browsingDetails: 'Exploring TV 2 Play',
        browsingState: 'Looking for something to watch',
        live: 'Live',
        watching: 'Watching',
        paused: 'Paused',
        playing: 'Playing',
        pause: 'Paused',
        button: 'Watch on TV 2 Play',
        season: 'Season',
        episode: 'Episode',
        privacy: 'Privacy mode',
        privateSeries: 'Watching a series',
        privateMovie: 'Watching a movie',
        privateLive: 'Watching live TV',
        trailer: 'Watching a trailer',
      }
    : {
        browsingDetails: 'Utforsker TV 2 Play',
        browsingState: 'Leter etter noe å se på',
        live: 'Direkte',
        watching: 'Ser på',
        paused: 'Satt på pause',
        playing: 'Spiller av',
        pause: 'Pause',
        button: 'Se på TV 2 Play',
        season: 'Sesong',
        episode: 'Episode',
        privacy: 'Privat modus',
        privateSeries: 'Ser på en serie',
        privateMovie: 'Ser på en film',
        privateLive: 'Ser på direktesendt TV',
        trailer: 'Ser på en trailer',
      }

  const player
    = document.querySelector('[data-testid="player"]')

  const video
    = largestVideo(player || document)

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: logoUrl,
    largeImageText: 'TV 2 Play',
  }

  if (video && video.readyState > 0) {
    const {
      showTitle,
      episodeTitle,
      season,
      episode,
    } = getTitles(player)

    const live = isLiveVideo(video)
    const trailer = isAudibleTrailer(video)

    presenceData.type = ActivityType.Watching

    if (privacyMode) {
      presenceData.details = trailer
        ? text.trailer
        : live
          ? text.privateLive
          : season && episode
            ? text.privateSeries
            : text.privateMovie

      presenceData.state = text.privacy

      if (live) {
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = text.live
      }
      else if (!video.paused) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = text.playing
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = text.pause
      }

      wasWatching = true
    }
    else {
      presenceData.details = showTitle

      if (trailer) {
        presenceData.state = text.trailer
      }
      else if (season && episode) {
        presenceData.state = episodeTitle
          ? `${text.season} ${season} • ${text.episode} ${episode} • ${episodeTitle}`
          : `${text.season} ${season} • ${text.episode} ${episode}`
      }
      else if (live) {
        presenceData.state = text.live
      }
      else {
        presenceData.state
          = video.paused ? text.paused : text.watching
      }

      if (live) {
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = text.live
      }
      else if (!video.paused) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = text.playing

        if (
          Number.isFinite(video.duration)
          && video.duration > 0
        ) {
          ;[
            presenceData.startTimestamp,
            presenceData.endTimestamp,
          ] = getTimestampsFromMedia(video)
        }
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = text.pause
      }

      presenceData.buttons = [
        {
          label: text.button,
          url: document.location.href,
        },
      ]

      wasWatching = true
    }
  }
  else {
    if (wasWatching) {
      browsingTimestamp
        = Math.floor(Date.now() / 1000)

      wasWatching = false
    }

    // Privacy mode must not override normal browsing status.
    presenceData.details = text.browsingDetails
    presenceData.state = text.browsingState
    presenceData.startTimestamp = browsingTimestamp
  }

  if (presenceData.details)
    await presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
