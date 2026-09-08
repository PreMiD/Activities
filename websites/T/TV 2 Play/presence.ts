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

function largestVideo(root: ParentNode = document): HTMLVideoElement | null {
  return [...root.querySelectorAll('video')]
    .filter(video =>
      video.readyState > 0
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

  const codeRegex
    = new RegExp(`^S${season}E${episode}$`, 'i')

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
      parentText.replace(
        new RegExp(`\\bS${season}E${episode}\\b`, 'i'),
        '',
      ),
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

    presenceData.type = ActivityType.Watching
    presenceData.details = showTitle

    if (season && episode) {
      presenceData.state = episodeTitle
        ? `Sesong ${season} • Episode ${episode} • ${episodeTitle}`
        : `Sesong ${season} • Episode ${episode}`
    }
    else if (live) {
      presenceData.state = 'Direkte'
    }
    else {
      presenceData.state
        = video.paused ? 'Satt på pause' : 'Ser på'
    }

    if (live) {
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Direkte'
    }
    else if (!video.paused) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Spiller av'

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
      presenceData.smallImageText = 'Pause'
    }

    presenceData.buttons = [
      {
        label: 'Se på TV 2 Play',
        url: document.location.href,
      },
    ]

    wasWatching = true
  }
  else {
    if (wasWatching) {
      browsingTimestamp
        = Math.floor(Date.now() / 1000)

      wasWatching = false
    }

    presenceData.details = 'Utforsker TV 2 Play'
    presenceData.state = 'Leter etter noe å se på'
    presenceData.startTimestamp = browsingTimestamp
  }

  if (presenceData.details)
    await presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
