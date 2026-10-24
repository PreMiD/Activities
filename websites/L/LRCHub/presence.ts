import { ActivityType, StatusDisplayType, supports } from 'premid'

interface Snapshot {
  title: string
  artist: string
  album?: string
  lyric: string
  lyricAvailable?: boolean
  lyricStatus?: string
  artwork: string
  url: string
  currentTime: number
  duration: number
  updatedAt: number
  playbackState: 'playing' | 'paused' | 'browsing'
  source?: string
  enabled?: boolean
  isAdvertisement?: boolean
  templates?: string[]
  startedAt?: number
  endsAt?: number
}
interface Track { video_id: string, track?: string, artist?: string, album?: string, offset_ms?: number }
interface LyricLine { time_ms: number | null, waiting?: boolean, text?: string }
interface Player { getPlayerState: () => number, getCurrentTime: () => number, getDuration: () => number }
interface MusicState { player?: Player, playerReady?: boolean, loadedVideoId?: string, lyricLines?: LyricLine[] }
// Existing LRCHub page variables; declarations are erased before execInPage serialization.
declare const state: MusicState | undefined
declare const player: Player | undefined
declare const playerReady: boolean | undefined
declare const loadedVideoId: string | undefined
declare const lyricLines: LyricLine[] | undefined
declare const currentTrack: (() => Track | null) | undefined
declare const artworkFor: ((track: Track) => string) | undefined

const presence = new Presence({ clientId: '1555828595778265119' })

const defaults = ['%lyric%', '%song%', '%artist%', '%album%']
// eslint-disable-next-line no-control-regex -- Remove control characters from Discord text.
const text = (value: unknown): string => typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim() : ''
const limited = (value: unknown): string => Array.from(text(value)).slice(0, 128).join('')
function https(value: unknown): string | null {
  try {
    const url = new URL(String(value))
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  }
  catch { return null }
}
function clock(value: unknown): string {
  const seconds = Math.max(0, Math.floor(Number(value) || 0))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
function activityFromSnapshot(snapshot: Snapshot | null, now: number): PresenceData | null {
  if (!snapshot || snapshot.enabled !== true || snapshot.isAdvertisement === true
    || !['playing', 'paused', 'browsing'].includes(snapshot.playbackState) || !text(snapshot.title)
    || !Number.isFinite(snapshot.updatedAt) || now - snapshot.updatedAt > 45000 || snapshot.updatedAt > now + 5000) {
    return null
  }
  const values: Record<string, string> = {
    song: text(snapshot.title),
    title: text(snapshot.title),
    artist: text(snapshot.artist),
    album: text(snapshot.album),
    lyric: text(snapshot.lyric) || (snapshot.playbackState === 'browsing' ? '' : text(snapshot.title)),
    lyrics: text(snapshot.lyric) || (snapshot.playbackState === 'browsing' ? '' : text(snapshot.title)),
    state: snapshot.playbackState === 'playing' ? 'Playing' : snapshot.playbackState === 'paused' ? 'Paused' : 'Browsing lyrics',
    position: clock(snapshot.currentTime),
    duration: clock(snapshot.duration),
    lyric_status: snapshot.lyricStatus || '',
    debug: '1555828595778265119',
  }
  const templates = Array.isArray(snapshot.templates) && snapshot.templates.length >= 3 ? snapshot.templates : defaults
  const rows = [...templates.slice(0, 3), templates[3] ?? defaults[3]].map(template => limited(text(template).slice(0, 256).replace(/<([a-z_]+)>|%([a-z_]+)%/gi, (token: string, angleKey: string | undefined, percentKey: string | undefined) => values[(angleKey || percentKey || '').toLowerCase()] ?? token)))
  const data: PresenceData = {
    type: ActivityType.Listening,
    statusDisplayType: StatusDisplayType.Name,
    name: rows[0] || limited(values.song),
    details: rows[1] || limited(values.artist || values.song),
  }
  data.state = rows[2] || limited(values.song)
  const artwork = https(snapshot.artwork)
  if (artwork) {
    data.largeImageKey = artwork
    if (rows[3])
      data.largeImageText = rows[3]
  }
  const url = https(snapshot.url)
  if (url)
    data.buttons = [{ label: snapshot.source === 'youtubeMusic' ? 'Listen on YouTube Music' : 'Open LRCHub', url }]
  const duration = Number(snapshot.duration)
  const current = Number(snapshot.currentTime)
  if (snapshot.playbackState === 'playing' && Number.isFinite(duration) && duration > 0
    && Number.isFinite(current) && current >= 0 && current < duration) {
    // Bridge times are epoch milliseconds; recompute when no authoritative times exist.
    const started = Number(snapshot.startedAt)
    const ends = Number(snapshot.endsAt)
    data.startTimestamp = started > 0 && Number.isFinite(started) ? started : now - current * 1000
    data.endTimestamp = ends > now && Number.isFinite(ends) ? ends : now + (duration - current) * 1000
  }
  return data
}
// Read only existing page elements. No injected website bridge or server change.
function readDomSnapshot(): Snapshot | null {
  const get = (id: string): HTMLElement | null => document.getElementById(id)
  const value = (...ids: string[]) => ids.map(id => get(id)?.textContent?.trim()).find(Boolean) || ''
  const parseClock = (input: string) => String(input || '').replace(/^-/, '').split(':').reduce((sum, part) => sum * 60 + Number(part), 0)
  const detail = !!get('detail-track')
  const title = detail ? value('detail-track', 'detail-title') : value('music-title', 'music-mini-title', 'music-player-title')
  if (!title || ['Player', '読み込み中', '曲を選択'].includes(title))
    return null
  const currentTime = parseClock(value('music-current-time'))
  const durationText = value('music-duration')
  const duration = parseClock(durationText) + (durationText.startsWith('-') ? currentTime : 0)
  const play = get('music-play') as HTMLButtonElement | null
  if (!detail && (!play || play.disabled))
    return null
  const active = document.querySelector('#music-player-lyrics .music-player-lyric-line.active, #music-lyrics .music-lyric-line.active')
  return { title, artist: detail ? value('detail-byline') : value('music-artist', 'music-mini-artist'), lyric: detail ? '' : active?.textContent || '', artwork: ((get(detail ? 'detail-artwork' : 'music-cover') || get('music-mini-cover')) as HTMLImageElement | null)?.src || '', url: location.href, currentTime, duration, updatedAt: Date.now(), playbackState: detail ? 'browsing' : play?.getAttribute('aria-label') === '一時停止' ? 'playing' : 'paused' }
}
// This function is serialized by PreMiD into the page realm: no activity closures.
function readPagePlayback(): Snapshot | null {
  const standalone = !!document.getElementById('music-app')
  const musicState = !standalone && typeof state !== 'undefined' ? state : null
  const yt = standalone ? (typeof player !== 'undefined' ? player : null) : musicState?.player
  const ready = standalone ? (typeof playerReady !== 'undefined' && playerReady) : musicState?.playerReady
  if (!ready || !yt || typeof currentTrack !== 'function')
    return null
  const track = currentTrack()
  const loaded = standalone ? (typeof loadedVideoId !== 'undefined' ? loadedVideoId : '') : musicState?.loadedVideoId
  if (!track || loaded !== track.video_id)
    return null
  const ytState = yt.getPlayerState()
  if (![1, 2, 3].includes(ytState))
    return null
  const position = Number(yt.getCurrentTime()) || 0
  const lines = standalone ? (typeof lyricLines !== 'undefined' ? lyricLines : []) : musicState?.lyricLines || []
  let lyric = ''
  for (const line of lines) {
    if (line.time_ms == null || line.time_ms > position * 1000 - Number(track.offset_ms || 0))
      continue
    lyric = line.waiting ? '' : line.text || ''
  }
  return { title: track.track || '', artist: track.artist || '', album: track.album || '', lyric, artwork: typeof artworkFor === 'function' ? artworkFor(track) : '', url: location.href, currentTime: position, duration: Number(yt.getDuration()) || 0, updatedAt: Date.now(), playbackState: ytState === 2 ? 'paused' : 'playing' }
}
// Serialized into YouTube Music's page realm, where MediaSession metadata is available.
// Every sample builds fresh artwork and text, so a previous track cannot supply its cover.
function readYouTubeMusicSnapshot(): Snapshot | null {
  const clean = (value: unknown): string => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
  const bar = document.querySelector('ytmusic-player-bar') || document.querySelector('ytmusic-miniplayer')
  const video = document.querySelector('video')
  if (!bar || !video || video.ended || video.readyState === 0
    || document.querySelector('#movie_player.ad-showing, #movie_player.ad-interrupting')
    || (bar.hasAttribute('is-advertisement') && bar.getAttribute('is-advertisement') !== 'false')) {
    return null
  }
  const metadata = navigator.mediaSession?.metadata
  const domTitle = clean((bar.querySelector('.title') || bar.querySelector('.ytmusicTrackInfoTitle'))?.textContent)
  const title = domTitle || clean(metadata?.title)
  if (!title)
    return null
  // MediaSession can lag a track switch; use it only when it agrees with the visible title.
  const metadataMatches = !!metadata && (!domTitle || clean(metadata.title) === domTitle)
  const byline = bar.querySelector('.byline') || bar.querySelector('.ytmusicTrackInfoByline')
  const artistLink = byline?.querySelector<HTMLAnchorElement>('a')
  const artist = clean(artistLink?.textContent) || (metadataMatches ? clean(metadata.artist) : '')
    || clean(byline?.textContent).split(/\s*[•·]\s*/)[0] || ''
  const image = bar.querySelector<HTMLImageElement>('img')
  const artwork = image?.currentSrc || image?.src
    || (metadataMatches ? metadata.artwork?.[metadata.artwork.length - 1]?.src : '') || ''
  const currentTime = Number(video.currentTime)
  const duration = Number(video.duration)
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0)
    return null
  // Read lyrics already selected and rendered by YTM-Immersion.
  const activeLines = Array.from(document.querySelectorAll?.('#my-lyrics-container .lyric-line.active') || [])
  const cues = Array.from(document.querySelectorAll?.('.ytm-animated-caption-stage .ytm-animated-caption-cue') || [])
  const rendered = cues.length
    ? clean(cues[cues.length - 1]?.textContent)
    : activeLines.map(row => clean((row.querySelector('.lyric-main') || row).textContent)).filter(Boolean).slice(-1)[0] || ''
  let lyric = rendered
  let lyricAvailable = activeLines.length > 0 || cues.length > 0
  const watch = bar.querySelector<HTMLAnchorElement>('a[href*="watch?v="]') || document.querySelector<HTMLAnchorElement>('#movie_player a.ytp-title-link, a.ytp-title-link')
  const currentUrl = new URL(watch?.href || location.href, location.href)
  const videoId = currentUrl.searchParams.get('v')
  const url = videoId ? `https://music.youtube.com/watch?v=${encodeURIComponent(videoId)}` : 'https://music.youtube.com/'
  // Prefer the installed Immersion extension's current playback lyric, including blank gaps.
  // It has no freshness timestamp, so require matching identity, position and state.
  try {
    const bridge = JSON.parse(document.getElementById('ytm-immersion-discord-presence')?.textContent || 'null')
    const bridgeUrl = bridge?.url ? new URL(bridge.url, location.href) : null
    if (bridge?.schema === 1 && bridge.source === 'ytm-immersion' && !bridge.isAdvertisement
      && clean(bridge.title) === title && clean(bridge.artist) === artist && videoId
      && bridgeUrl?.hostname === 'music.youtube.com' && bridgeUrl.searchParams.get('v') === videoId
      && bridge.playbackState === (video.paused ? 'paused' : 'playing')
      && Number.isFinite(bridge.currentTime) && Math.abs(bridge.currentTime - currentTime) <= 2
      && Number.isFinite(bridge.duration) && Math.abs(bridge.duration - duration) <= 2) {
      // The existing Immersion bridge joins overlapping lines with this delimiter.
      lyric = clean(bridge.lyric).split(' / ').slice(-1)[0] || ''
      lyricAvailable = true
    }
  }
  catch { /* Invalid or old optional bridge does not block native playback. */ }

  return { source: 'youtubeMusic', title, artist, album: metadataMatches ? clean(metadata.album) : '', lyric, lyricAvailable, artwork, url, currentTime, duration, updatedAt: Date.now(), playbackState: video.paused ? 'paused' : 'playing' }
}
let lastVisibleAt: number | null = null
let lastSentData: PresenceData | null = null
let hasCleared = false
const transitionGraceMs = 10000
presence.on('UpdateData', async () => {
  let data: PresenceData | null = null
  let retainDuringTransition = false

  try {
    const enabled = await presence.getSetting<boolean>('enabled')
    if (enabled === true) {
      const templates = await Promise.all(['line1', 'line2', 'line3', 'line4'].map(async (id) => {
        try {
          return await presence.getSetting<string>(id)
        }
        catch { return defaults[Number(id.slice(4)) - 1] || '' }
      }))
      const youtubeMusic = new URL(location.href).hostname === 'music.youtube.com'
      const bar = youtubeMusic ? (document.querySelector('ytmusic-player-bar') || document.querySelector('ytmusic-miniplayer')) : null
      const advertisement = youtubeMusic && (document.querySelector('#movie_player.ad-showing, #movie_player.ad-interrupting') || (bar?.hasAttribute('is-advertisement') && bar.getAttribute('is-advertisement') !== 'false'))
      retainDuringTransition = youtubeMusic && !advertisement
      let snapshot = youtubeMusic ? readYouTubeMusicSnapshot() : readDomSnapshot()
      if (supports(presence, 'execInPage') && (youtubeMusic || !document.getElementById('detail-track'))) {
        try {
          const pageSnapshot = await presence.execInPage<Snapshot | null>(youtubeMusic ? readYouTubeMusicSnapshot : readPagePlayback)
          // A null sample means the authoritative player is idle, ended, or changing track.
          snapshot = pageSnapshot
        }
        catch { /* CSP or unavailable page realm: retain DOM fallback. */ }
      }
      if (snapshot) {
        if (youtubeMusic)
          snapshot.lyricStatus = snapshot.lyricAvailable ? 'Receiving YTM-Immersion lyrics' : 'Waiting for the current YTM-Immersion lyric'
        data = activityFromSnapshot({ ...snapshot, enabled, templates }, Date.now())
      }
    }
  }
  catch { /* Invalid settings or missing player clears previous activity. */ }
  if (data) {
    lastVisibleAt = Date.now()
    // Normal clock sampling may drift by milliseconds; keep the sent anchor.
    if (lastSentData && data.buttons?.[0]?.url === lastSentData.buttons?.[0]?.url && data.name === lastSentData.name
      && Number.isFinite(data.startTimestamp) && Number.isFinite(lastSentData.startTimestamp)
      && Math.abs(Number(data.startTimestamp) - Number(lastSentData.startTimestamp)) < 2000
      && Math.abs(Number(data.endTimestamp) - Number(lastSentData.endTimestamp)) < 2000) {
      data.startTimestamp = lastSentData.startTimestamp
      data.endTimestamp = lastSentData.endTimestamp
    }
    if (JSON.stringify(data) !== JSON.stringify(lastSentData)) {
      await presence.setActivity(data)
      lastSentData = data
      hasCleared = false
    }
  }
  else if (!(retainDuringTransition && lastVisibleAt !== null && Date.now() - lastVisibleAt < transitionGraceMs)) {
    lastVisibleAt = null
    if (!hasCleared) {
      await presence.clearActivity()
      lastSentData = null
      hasCleared = true
    }
  }
})
