import { ActivityType, Assets, getTimestamps, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1570463278058962964',
})

const LOGO = 'https://i.imgur.com/uPX8Y4N.png'
// Shown when Privacy Mode and Hide Website Name enabled
const HIDDEN_LOGO = 'https://i.imgur.com/LDonhZk.png'

interface IFramePayload {
  active?: boolean
  currentTime?: number
  duration?: number
  paused?: boolean
}

interface StoredVideo {
  currentTime: number
  duration: number
  paused: boolean
  receivedAt: number
}

const MAX_DATA_AGE_MS = 5000
const browsingTimestamp = Math.floor(Date.now() / 1000)

let video: StoredVideo | null = null
let wasProgressOn = true

presence.on('iFrameData', (data: unknown) => {
  const payload = data as IFramePayload | null

  if (
    !payload?.active
    || typeof payload.currentTime !== 'number'
    || typeof payload.duration !== 'number'
  ) {
    video = null
    return
  }

  video = {
    currentTime: payload.currentTime,
    duration: payload.duration,
    paused: !!payload.paused,
    receivedAt: Date.now(),
  }
})

function titleCase(text: string): string {
  return text.replace(/\b\w/g, c => c.toUpperCase())
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function titleFromSlug(rawSlug: string): string {
  let slug = rawSlug
  try {
    slug = decodeURIComponent(rawSlug)
  }
  catch {}

  const parts = slug
    .replace(/-(eng|english)-sub(bed)?$/i, '')
    .split('-')
    .filter(Boolean)

  const last = parts[parts.length - 1]
  if (parts.length > 1 && last && /^[a-z0-9]{4,6}$/i.test(last) && /\d/.test(last))
    parts.pop()

  return titleCase(parts.join(' ').trim())
}

function cleanPageTitle(text: string | null | undefined): string {
  return (text ?? '')
    .split(/\s[|–—-]\s/)[0]!
    .replace(/^watch\s+/i, '')
    .replace(/\s+(online|free|full movie)$/i, '')
    .replace(/\s*\(\d{4}\)$/, '')
    .trim()
}

function getTitle(slugTitle: string): string {
  const candidates = [
    document.querySelector('h1')?.textContent,
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content,
    document.title,
  ].map(cleanPageTitle)

  const key = normalize(slugTitle)
  return candidates.find(c => c && normalize(c) === key) || slugTitle || 'Unknown title'
}

function getInfo() {
  const match = /^[/]watch[/](movie|film|tv|series|show)-([^/]+)/i.exec(document.location.pathname)
  if (!match)
    return null

  const kind = (match[1] ?? '').toLowerCase()
  const slugTitle = titleFromSlug(match[2] ?? '')

  return {
    title: getTitle(slugTitle),
    isSeries: ['tv', 'series', 'show'].includes(kind),
  }
}

function toSquare(url: string): string {
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=512&h=512&fit=contain&cbg=0000&output=png`
}

function getBackdrop(): string | undefined {
  const og = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
  return og?.startsWith('http') ? toSquare(og) : undefined
}

function getPoster(): string | undefined {
  const src = document.querySelector<HTMLImageElement>('.watch-sidebar-poster img')?.src
  if (!src?.startsWith('http'))
    return undefined
  return toSquare(src.replace('/w300/', '/w500/'))
}

presence.on('UpdateData', async () => {
  const [privacy, hideWebsite, progressSetting, largeImage] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('hideWebsite'),
    presence.getSetting<boolean>('progress'),
    presence.getSetting<number>('largeImage'),
  ])

  const showProgress = progressSetting && !privacy

  // Clear activity to remove progress bar
  if (wasProgressOn && !showProgress) {
    wasProgressOn = false
    presence.clearActivity()
    return
  }
  wasProgressOn = showProgress

  const info = getInfo()
  const mediaWord = info?.isSeries ? 'series' : 'movie'

  const logoImage = privacy && hideWebsite ? HIDDEN_LOGO : LOGO

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    name: hideWebsite ? `a ${mediaWord}` : 'PressPlay',
    statusDisplayType: StatusDisplayType.Details,
    largeImageKey: logoImage,
  }

  if (!hideWebsite)
    presenceData.largeImageText = 'PressPlay'

  if (!info) {
    video = null
    presenceData.details = 'Browsing...'
    presence.setActivity(presenceData)
    return
  }

  if (!privacy) {
    if (largeImage === 0)
      presenceData.largeImageKey = getPoster() ?? logoImage
    else if (largeImage === 1)
      presenceData.largeImageKey = getBackdrop() ?? logoImage
  }

  const fresh = video && Date.now() - video.receivedAt < MAX_DATA_AGE_MS ? video : null

  presenceData.details = privacy ? `Watching a ${mediaWord}` : info.title

  if (fresh) {
    if (fresh.paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'

      if (showProgress) {
        const elapsed = (Date.now() - fresh.receivedAt) / 1000
        const current = Math.min(fresh.currentTime + elapsed, fresh.duration)
        const [start, end] = getTimestamps(Math.floor(current), Math.floor(fresh.duration))
        presenceData.startTimestamp = start
        presenceData.endTimestamp = end
      }
    }
  }
  else if (!privacy) {
    presenceData.startTimestamp = browsingTimestamp
  }

  presence.setActivity(presenceData)
})
