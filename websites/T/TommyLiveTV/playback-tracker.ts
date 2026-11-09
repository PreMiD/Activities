const PLAYER_FRAME_SELECTOR = '.media-player-stage iframe, .media-player-frame iframe'
const WATCH_ROUTE = /^\/movies\/(?:movie|tv)\//
const MAX_DURATION_SECONDS = 7 * 24 * 60 * 60
const REPORT_STALE_MS = 6000
const INFERRED_PLAYING_MS = 2500

type PlayerState = 'playing' | 'paused' | 'unknown'
type PlaybackEventState = Exclude<PlayerState, 'unknown'> | null
type PlaybackUpdateKind = 'position' | 'seek'

interface PlaybackUpdate {
  position: number | null
  duration: number | null
  state: PlaybackEventState
  kind: PlaybackUpdateKind
}

interface PlaybackEnd {
  ended: true
}

interface PlaybackRecord {
  position: number
  duration: number
  state: PlayerState
  updatedAt: number
  lastReportedPosition: number | null
  lastReportedAt: number
  lastAdvancedAt: number
}

export interface PlaybackTimes {
  startTimestamp: number
  endTimestamp: number
}

type ParsedPlaybackMessage = PlaybackUpdate | PlaybackEnd
type PlayerLocation = Pick<Location, 'pathname' | 'href'>

function visibleFrame(frame: HTMLIFrameElement | null): frame is HTMLIFrameElement {
  if (!frame?.isConnected || !frame.getAttribute('src'))
    return false

  const view = frame.ownerDocument?.defaultView
  for (let current: Element | null = frame; current; current = current.parentElement) {
    if (current.hasAttribute('hidden') || current.getAttribute('aria-hidden') === 'true')
      return false
    const style = view?.getComputedStyle?.(current)
    if (style && (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0))
      return false
  }

  const rect = frame.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

function activePlayerFrame(document: Document): HTMLIFrameElement | null {
  const frames = Array.from(document.querySelectorAll<HTMLIFrameElement>(PLAYER_FRAME_SELECTOR))
  for (let index = frames.length - 1; index >= 0; index -= 1) {
    const frame = frames[index]
    if (frame && visibleFrame(frame))
      return frame
  }
  return null
}

function seconds(value: unknown): number | null {
  if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '')
    return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= MAX_DURATION_SECONDS ? parsed : null
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function parsePlaybackMessage(value: unknown): ParsedPlaybackMessage | null {
  let rootValue = value
  if (typeof rootValue === 'string') {
    try {
      rootValue = JSON.parse(rootValue) as unknown
    }
    catch {
      return null
    }
  }

  const root = objectValue(rootValue)
  if (!root)
    return null

  const rootType = typeof root.type === 'string' ? root.type : ''
  const nested = objectValue(root.detail) || objectValue(root.payload) || objectValue(root.data) || objectValue(root.event)
  const event = objectValue(root.event)
  const eventName = typeof event?.name === 'string' ? event.name.toLowerCase() : ''
  const statusValue = nested?.player_status ?? root.player_status
  const status = typeof statusValue === 'string' ? statusValue.toLowerCase() : ''
  const typeNames = [
    root.type,
    typeof root.event === 'string' ? root.event : '',
    root.action,
    nested?.type,
    nested?.event,
    nested?.name,
    status,
  ].map(item => String(item || '').toLowerCase().replace(/[^a-z]/g, ''))

  let state: PlaybackEventState = null
  let kind: PlaybackUpdateKind = 'position'
  if (rootType.startsWith('vidrift:')) {
    if (rootType === 'vidrift:ended')
      return { ended: true }
    if (!['vidrift:progress', 'vidrift:paused', 'vidrift:unpaused'].includes(rootType))
      return null
    if (rootType === 'vidrift:paused')
      state = 'paused'
    if (rootType === 'vidrift:unpaused')
      state = 'playing'
  }
  else if (rootType === 'PLAYER_EVENT') {
    if (status === 'completed')
      return { ended: true }
    if (status === 'playing')
      state = 'playing'
    else if (status === 'paused')
      state = 'paused'
    else if (status === 'seeked')
      kind = 'seek'
    else if (!typeNames.some(name => name.includes('timeupdate')))
      return null
  }
  else if (rootType === 'player.event') {
    if (['end', 'ended'].includes(eventName))
      return { ended: true }
    if (['play', 'playing'].includes(eventName))
      state = 'playing'
    else if (['pause', 'paused'].includes(eventName))
      state = 'paused'
    else if (['seek', 'seeked'].includes(eventName))
      kind = 'seek'
    else if (!['position', 'timeupdate'].includes(eventName))
      return null
  }
  else if (!typeNames.some(name => name.includes('timeupdate'))) {
    return null
  }

  const rawPosition = root.currentTime ?? root.position ?? root.time
    ?? nested?.player_progress ?? nested?.currentTime ?? nested?.position ?? nested?.time
    ?? event?.position ?? event?.currentTime ?? event?.time
  const rawDuration = root.duration ?? nested?.player_duration ?? nested?.duration ?? event?.duration
  const position = seconds(rawPosition)
  const rawDurationSeconds = seconds(rawDuration)

  if (position === null && rawDurationSeconds === null && state === null)
    return null

  return {
    position,
    duration: rawDurationSeconds !== null && rawDurationSeconds > 0 ? rawDurationSeconds : null,
    state,
    kind,
  }
}

function estimatedPosition(record: PlaybackRecord, now: number): number {
  if (record.state === 'playing') {
    return record.position + Math.max(0, now - record.updatedAt) / 1000
  }
  if (record.state === 'unknown' && record.lastAdvancedAt) {
    return record.position + Math.max(0, now - record.updatedAt) / 1000
  }
  return record.position
}

/**
 * Accepts only time messages from the currently visible watch-page iframe,
 * matching the origin and source checks used by TommyLiveTV's player.
 */
export class PlaybackTracker {
  private frame: HTMLIFrameElement | null = null
  private frameSrc = ''
  private record: PlaybackRecord | null = null

  reset(frame: HTMLIFrameElement | null = null): void {
    this.frame = frame
    this.frameSrc = frame?.src || ''
    this.record = null
  }

  private currentFrame(document: Document, location: PlayerLocation): HTMLIFrameElement | null {
    if (!WATCH_ROUTE.test(location.pathname || '')) {
      this.reset()
      return null
    }

    const frame = activePlayerFrame(document)
    if (!frame) {
      this.reset()
      return null
    }
    if (frame !== this.frame || frame.src !== this.frameSrc)
      this.reset(frame)
    return frame
  }

  handleMessage(event: MessageEvent, document: Document, location: PlayerLocation): void {
    const frame = this.currentFrame(document, location)
    if (!frame || event.source !== frame.contentWindow)
      return

    let origin = ''
    try {
      origin = new URL(frame.src, location.href).origin
    }
    catch {
      return
    }
    if (!origin || event.origin !== origin)
      return

    const update = parsePlaybackMessage(event.data)
    if (!update)
      return
    if ('ended' in update) {
      this.record = null
      return
    }

    const now = Date.now()
    const previous = this.record
    const oldPosition = previous ? estimatedPosition(previous, now) : null
    const position = update.position ?? oldPosition
    const duration = update.duration ?? previous?.duration ?? null
    if (position === null || duration === null || duration <= 0 || position > duration + 2) {
      if (position !== null || duration !== null)
        this.record = null
      return
    }

    const state: PlayerState = update.state || 'unknown'
    let lastAdvancedAt = previous?.lastAdvancedAt || 0
    if (state === 'playing') {
      lastAdvancedAt = now
    }
    else if (state === 'paused' || update.kind === 'seek') {
      lastAdvancedAt = 0
    }
    else if (update.position !== null && previous?.lastReportedPosition !== null && previous?.lastReportedPosition !== undefined) {
      const elapsedSeconds = Math.max(0, now - previous.lastReportedAt) / 1000
      const delta = update.position - previous.lastReportedPosition
      if (delta > 0.05 && delta <= elapsedSeconds + 5)
        lastAdvancedAt = now
      else if (delta < -0.25)
        lastAdvancedAt = 0
    }

    this.record = {
      position: Math.min(position, duration),
      duration,
      state,
      updatedAt: now,
      lastReportedPosition: update.position ?? previous?.lastReportedPosition ?? null,
      lastReportedAt: update.position !== null ? now : previous?.lastReportedAt ?? now,
      lastAdvancedAt,
    }
  }

  read(document: Document, location: PlayerLocation, now = Date.now()): PlaybackTimes | null {
    const frame = this.currentFrame(document, location)
    if (!frame || !this.record)
      return null

    const record = this.record
    if (record.state === 'playing' && now - record.updatedAt > REPORT_STALE_MS)
      return null
    if (record.state === 'unknown' && (!record.lastAdvancedAt
      || now - record.lastAdvancedAt > INFERRED_PLAYING_MS
      || now - record.updatedAt > REPORT_STALE_MS)) {
      return null
    }

    const position = Math.min(record.duration, Math.max(0, estimatedPosition(record, now)))
    if (position >= record.duration) {
      return null
    }
    return {
      startTimestamp: now - position * 1000,
      endTimestamp: now + (record.duration - position) * 1000,
    }
  }
}
