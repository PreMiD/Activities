import { ActivityType, Assets, getTimestamps, StatusDisplayType, supports, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '846282107462352927',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/BreathFM/assets/0.jpg',
}

async function getStrings(lang: string) {
  return presence.getStrings({
    browsing: 'general.browsing',
    viewHome: 'general.viewHome',
    viewPage: 'general.viewPage',
    viewAccount: 'general.viewAccount',
    reading: 'general.reading',
    live: 'general.live',
    playing: 'general.playing',
    listeningMusic: 'general.listeningMusic',
    buttonListenAlong: 'general.buttonListenAlong',
    buttonViewPage: 'general.buttonViewPage',
    terms: 'general.terms',
    privacy: 'general.privacy',
  }, lang)
}

let strings: Awaited<ReturnType<typeof getStrings>>
let currentLang: string | undefined

function text(selector: string): string {
  return document.querySelector(selector)?.textContent?.trim() ?? ''
}

/** Findet den Link des Players (Song-Infos), um die Spotify-ID des laufenden Songs zu bekommen. */
function getPlayerTrackId(audio: HTMLAudioElement): string | undefined {
  const links = audio.parentElement?.querySelectorAll<HTMLAnchorElement>('a[href^="/track/"]')
  const href = links?.[0]?.getAttribute('href')
  return href?.split('/track/')[1]?.split(/[?#]/)[0]
}

/** Liest "elapsed - duration" aus der Player-Leiste. Ohne Dauer handelt es sich um einen Livestream. */
function getPlayerTimes(audio: HTMLAudioElement): [number, number] | null {
  const match = audio.parentElement?.textContent?.match(/(\d+:\d{2}(?::\d{2})?)\s*-\s*(\d+:\d{2}(?::\d{2})?)/)
  if (!match)
    return null
  const elapsed = timestampFromFormat(match[1]!)
  const duration = timestampFromFormat(match[2]!)
  return duration > 0 ? [elapsed, duration] : null
}

/** Die Webseite speichert den aktuell gewählten Sender im Cookie `lastStation` (Sender-ID). */
function getStationId(): string | undefined {
  const match = document.cookie.match(/(?:^|;\s*)lastStation=(\d+)/)
  return match?.[1]
}

/** Aktuelle Hörer der Station (Anzeige im Player). */
function getListeners(audio: HTMLAudioElement): number | undefined {
  const label = audio.parentElement?.querySelector('[aria-label$="Hörer"]')?.getAttribute('aria-label')
  const value = label ? Number.parseInt(label) : Number.NaN
  return Number.isNaN(value) ? undefined : value
}

function absoluteUrl(src?: string): string | undefined {
  if (!src)
    return undefined
  try {
    return new URL(src, location.origin).href
  }
  catch {
    return undefined
  }
}

interface Playback {
  station: string
  stationId?: string
  title: string
  artist?: string
  cover?: string
  trackId?: string
  times: [number, number] | null
  listeners?: number
}

/** Zustand, den die Webseite unter `window.__breathfm` bereitstellt (ab Extension 2.14). */
interface BreathFmBridge {
  version: number
  playing: boolean
  isLive: boolean
  stationId: number | null
  stationName: string | null
  shortcode: string | null
  title: string | null
  artist: string | null
  cover: string | null
  spotifyId: string | null
  elapsed: number
  duration: number
  listeners: number | null
}

async function getPlayback(): Promise<Playback | null> {
  if (supports(presence, 'execInPage')) {
    const bridge = await presence.execInPage<BreathFmBridge | undefined>({ get: '__breathfm' }).catch(() => undefined)
    if (bridge?.version === 1) {
      if (!bridge.playing || !bridge.title)
        return null
      return {
        station: bridge.stationName || 'BreathFM',
        stationId: bridge.shortcode || (bridge.stationId != null ? String(bridge.stationId) : undefined),
        title: bridge.title,
        artist: bridge.artist ?? undefined,
        cover: bridge.cover ?? undefined,
        trackId: bridge.spotifyId ?? undefined,
        times: !bridge.isLive && bridge.duration > 0 ? [bridge.elapsed, bridge.duration] : null,
        listeners: bridge.listeners ?? undefined,
      }
    }
  }

  // Fallback für ältere Extensions oder Webseiten ohne Schnittstelle: Werte aus dem DOM lesen.
  const audio = document.querySelector<HTMLAudioElement>('audio')
  const meta = 'mediaSession' in navigator ? navigator.mediaSession.metadata : null
  if (!audio || audio.paused || !meta?.title)
    return null
  return {
    station: meta.album || 'BreathFM',
    stationId: getStationId(),
    title: meta.title,
    artist: meta.artist || undefined,
    cover: absoluteUrl(meta.artwork[0]?.src),
    trackId: getPlayerTrackId(audio),
    times: getPlayerTimes(audio),
    listeners: getListeners(audio),
  }
}

function getPageData(privacy: boolean): PresenceData {
  const segments = location.pathname.split('/').filter(Boolean)
  const page = segments[0] ?? ''
  const data: PresenceData = {
    name: 'BreathFM',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Reading,
  }

  switch (page) {
    case '':
      data.details = strings.viewHome
      data.smallImageKey = Assets.Viewing
      break
    case 'track': {
      data.details = strings.viewPage
      const title = text('h1')
      const artist = document.querySelector('h1')?.nextElementSibling?.textContent?.trim()
      if (title && !privacy) {
        data.state = artist ? `${title} – ${artist}` : title
        const cover = document.querySelector<HTMLImageElement>('img[alt^="Cover von"]')
        if (cover?.src) {
          data.largeImageKey = absoluteUrl(cover.src)
          data.largeImageText = cover.alt
          data.smallImageKey = ActivityAssets.Logo
        }
      }
      break
    }
    case 'dashboard':
      data.details = strings.viewAccount
      break
    case 'login':
      data.details = strings.viewAccount
      break
    case 'agb':
      data.details = strings.reading
      data.state = strings.terms
      break
    case 'datenschutz':
      data.details = strings.reading
      data.state = strings.privacy
      break
    default:
      data.details = strings.viewPage
      data.state = text('h1') || undefined
  }

  if (privacy && page === 'dashboard')
    data.state = undefined

  return data
}

presence.on('UpdateData', async () => {
  const [privacy, showButtons, showTimestamps, showListeners, lang] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('listeners'),
    presence.getSetting<string>('lang').catch(() => 'en'),
  ])

  if (!strings || currentLang !== lang) {
    currentLang = lang
    strings = await getStrings(lang)
  }

  const playback = await getPlayback()

  if (!playback) {
    presence.setActivity(getPageData(privacy))
    return
  }

  const { station, times, trackId } = playback
  const listeners = showListeners ? playback.listeners : undefined

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    name: station,
    statusDisplayType: StatusDisplayType.Details,
    details: playback.title,
    state: playback.artist || strings.listeningMusic,
    largeImageKey: playback.cover ?? ActivityAssets.Logo,
    largeImageText: listeners !== undefined ? `${station} • ${listeners} 🎧` : station,
    smallImageKey: times ? Assets.Play : Assets.Live,
    smallImageText: times ? strings.playing : strings.live,
  }

  const stationUrl = playback.stationId
    ? `${location.origin}/?station=${encodeURIComponent(playback.stationId)}`
    : `${location.origin}/`
  presenceData.stateUrl = stationUrl
  presenceData.smallImageUrl = stationUrl

  if (trackId) {
    const trackUrl = `${location.origin}/track/${trackId}`
    presenceData.largeImageUrl = trackUrl
    presenceData.detailsUrl = trackUrl
  }

  if (showTimestamps) {
    if (times)
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(times[0], times[1])
    else
      presenceData.startTimestamp = browsingTimestamp
  }

  if (showButtons) {
    presenceData.buttons = [{ label: strings.buttonListenAlong, url: stationUrl }]
    if (trackId)
      presenceData.buttons.push({ label: strings.buttonViewPage, url: `${location.origin}/track/${trackId}` })
  }

  presence.setActivity(presenceData)
})
