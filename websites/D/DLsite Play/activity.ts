import { ActivityType, Assets, getTimestamps, StatusDisplayType } from 'premid'
import { defaultMessages } from './i18n.js'

export type ContentCategory = 'manga' | 'illustration' | 'novel' | 'voiceComic' | 'audio' | 'music' | 'video' | 'unknown'
export type ContentRating = 'general' | 'r15' | 'r18' | 'unknown'

export interface WorkInfo {
  id: string
  category: ContentCategory
  rating: ContentRating
  title?: string
  trackTitle?: string
  circle?: string
  artworkUrl?: string
  workUrl?: string
}

export interface PlaybackInfo {
  currentTime: number
  duration: number
  paused: boolean
  ended: boolean
  seeking: boolean
  readyState: number
  playbackRate: number
  sampledAt?: number
}

export interface SiteSnapshot {
  work: WorkInfo | null
  playback: PlaybackInfo | null
}

// Identifiers and age values from the public client.RPAsYWcg bundle.
const categories: Record<string, ContentCategory> = {
  COM: 'manga',
  MDC: 'manga',
  MNG: 'manga',
  SCM: 'manga',
  WBT: 'manga',
  GSH: 'illustration',
  ICG: 'illustration',
  IST: 'illustration',
  IN2: 'novel',
  INV: 'novel',
  NR2: 'novel',
  NRE: 'novel',
  KSV: 'novel',
  VCM: 'voiceComic',
  SOU: 'audio',
  MUS: 'music',
  MOV: 'video',
}

export function resolveContentCategory(value: unknown): ContentCategory {
  return typeof value === 'string' && Object.hasOwn(categories, value) ? categories[value]! : 'unknown'
}

export function resolveContentRating(value: unknown): ContentRating {
  if (value === 'all')
    return 'general'
  return value === 'r15' || value === 'r18' ? value : 'unknown'
}

export function getViewerWorkId(pathname: string): string | null {
  // Tree and work detail pages are browsing, not reading sessions.
  const match = pathname.match(/^\/(?:dllibrary\/)?work\/([^/]+)\/(?:view\/[^/]+|viewer(?:\/.*)?)\/?$/)
    ?? pathname.match(/^\/viewer\/(?:free|sample)\/([^/]+)\/?$/)
  return match?.[1] ?? null
}

export function resolveCanonicalWorkUrl(id: string, siteId: unknown, inservice: unknown): string | null {
  // The site's url.BOaaVP9- helper uses these exact public destinations.
  if (inservice !== 1 || !/^[A-Z]{2}\d+$/.test(id) || typeof siteId !== 'string')
    return null
  if (siteId === 'comic')
    return `https://www.comipo.app/product/${id}`
  const site = siteId.replace(/-?touch$/, '')
  return /^[a-z]+$/.test(site) ? `https://www.dlsite.com/${site}/work/=/product_id/${id}.html` : null
}

export function resolveArtworkUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim())
    return null
  try {
    const url = new URL(value, 'https://play.dlsite.com')
    // Only public cover CDN images; never signed playback or library URLs.
    if (url.protocol !== 'https:' || url.hostname !== 'img.dlsite.jp'
      || url.port || url.username || url.password || url.search || url.hash
      || !/\.(?:jpe?g|png|webp)$/i.test(url.pathname)) {
      return null
    }
    return url.href
  }
  catch {
    return null
  }
}

export function shouldApplyPrivacy(work: WorkInfo, privacyMode: boolean): boolean {
  return privacyMode || work.rating !== 'general' || work.category === 'unknown'
}

export function getActivityType(category: ContentCategory): ActivityType.Playing | ActivityType.Listening | ActivityType.Watching {
  if (category === 'audio' || category === 'music')
    return ActivityType.Listening
  return category === 'unknown' ? ActivityType.Playing : ActivityType.Watching
}

export class WorkSession {
  private id: string | null = null
  private startedAt = 0

  update(id: string | null, now = Date.now()): number {
    if (id !== this.id) {
      this.id = id
      this.startedAt = id === null ? 0 : Math.floor(now / 1000)
    }
    return this.startedAt
  }
}

export function buildBrowsingPresence(): PresenceData {
  return {
    name: 'DLsite Play',
    type: ActivityType.Playing,
    statusDisplayType: StatusDisplayType.Name,
  }
}

export function resolveDisplayType(value: unknown): StatusDisplayType {
  if (value === 0)
    return StatusDisplayType.Name
  if (value === 1)
    return StatusDisplayType.Details
  return StatusDisplayType.State
}

export function applyDisplayType(data: PresenceData, displayType: StatusDisplayType): PresenceData {
  const available = (displayType === StatusDisplayType.State && data.state)
    || (displayType === StatusDisplayType.Details && data.details)
  return { ...data, statusDisplayType: available ? displayType : StatusDisplayType.Name }
}

export function buildContentPresence(
  work: WorkInfo,
  playback: PlaybackInfo | null,
  privacyMode: boolean,
  sessionTimestamp: number,
  viewWork: string,
  displayType = StatusDisplayType.State,
  playbackLabels = { paused: defaultMessages.paused },
  openWork = 'DLsite Play',
): PresenceData | null {
  if (work.rating === 'unknown')
    return null
  // Restricted works expose only the service and a separate session clock.
  if (work.rating === 'r18')
    return { ...buildBrowsingPresence(), startTimestamp: sessionTimestamp }
  const base = {
    name: 'DLsite Play',
    type: getActivityType(work.category),
    statusDisplayType: StatusDisplayType.Name,
  }
  // Construct the safe object before ever adding any identifying fields.
  if (shouldApplyPrivacy(work, privacyMode))
    return { ...base, startTimestamp: sessionTimestamp }

  const data: PresenceData = { ...base }
  if (data.type === ActivityType.Listening) {
    if (work.trackTitle)
      data.details = work.trackTitle
    if (work.title)
      data.state = work.title
    if (work.circle)
      data.largeImageText = work.circle
  }
  else {
    if (work.title)
      data.details = work.title
    if (work.circle)
      data.state = work.circle
    if (work.circle && data.type === ActivityType.Watching)
      data.largeImageText = work.circle
  }
  // State is the public work title for every supported content category.
  if (work.title) {
    data.state = work.title
  }
  const artwork = resolveArtworkUrl(work.artworkUrl)
  if (artwork)
    data.largeImageKey = artwork
  // Revalidate public destinations, including inputs supplied by the adapter.
  const link = work.workUrl
  if (link && /^https:\/\/(?:www\.dlsite\.com\/[a-z]+\/work\/=\/product_id\/[A-Z]{2}\d+\.html|www\.comipo\.app\/product\/[A-Z]{2}\d+)$/.test(link)) {
    const linkedId = link.match(/([A-Z]{2}\d+)(?:\.html)?$/)?.[1]
    if (linkedId === work.id) {
      data.largeImageUrl = link
      if (viewWork.trim() && viewWork.length <= 32) {
        data.buttons = [{ label: viewWork, url: link }]
        // This is an unsigned library entry point for owners, never a media URL.
        if (openWork.trim() && openWork.length <= 32)
          data.buttons.push({ label: openWork, url: `https://play.dlsite.com/work/${work.id}` })
      }
    }
  }

  if (['audio', 'music', 'video'].includes(work.category) && playback
    && (playback.paused || playback.ended)) {
    data.smallImageKey = Assets.Pause
    data.smallImageText = playbackLabels.paused
  }

  if (['audio', 'music', 'video'].includes(work.category) && playback
    && !playback.paused && !playback.ended && !playback.seeking && playback.readyState >= 3
    && Number.isFinite(playback.currentTime) && playback.currentTime >= 0
    && Number.isFinite(playback.duration) && playback.duration > playback.currentTime
    && Number.isFinite(playback.playbackRate) && playback.playbackRate > 0) {
    const sampleAge = playback.sampledAt === undefined ? 0 : (Date.now() - playback.sampledAt) / 1000
    // Keep the measured media sample's time origin when the UI repeats a value.
    // Recomputing from "now" would move the bar backwards on every update.
    const position = playback.currentTime / playback.playbackRate + sampleAge
    const duration = playback.duration / playback.playbackRate
    if (Number.isFinite(position) && Number.isFinite(duration) && sampleAge >= 0 && position < duration) {
      const [start, end] = getTimestamps(position, duration)
      if (start > 0 && end > start) {
        data.startTimestamp = start
        data.endTimestamp = end
      }
    }
  }
  return applyDisplayType(data, displayType)
}
