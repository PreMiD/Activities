import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1530302862490341386',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/6t0ss9m.png',
}

// Real static routes on velora.tv. Anything else is Next's `[username]`
// catch-all route, even for usernames that don't exist.
const STATIC_ROUTES = new Set(['', 'browse', 'login', 'register', 'settings', 'about'])

function formatSlug(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

const CHANNEL_CACHE_TTL = 15_000

interface VeloraStreamInfo {
  title: string
  category: string
  categoryName?: string
  viewerCount: number
  startedAt: string
  thumbnail?: string
  sessionTags?: string[]
  identityTags?: string[]
}

const MATURE_TAGS = new Set(['mature', 'nsfw', '18+', 'adult'])

// CONTRIBUTING.md requires generic text/art when explicit content warnings
// are available, so we check Velora's own tag data rather than showing the
// real title/thumbnail for streams tagged as mature.
function isMatureStream(streamInfo: VeloraStreamInfo): boolean {
  const tags = [...(streamInfo.sessionTags ?? []), ...(streamInfo.identityTags ?? [])]
  return tags.some(tag => MATURE_TAGS.has(tag.toLowerCase()))
}

interface VeloraUser {
  username: string
  displayName: string
  avatarUrl?: string
  bio?: string
  isLive: boolean
  streamInfo?: VeloraStreamInfo
}

function extractBioText(bio: string): string {
  const text = new DOMParser().parseFromString(bio, 'text/html').body.textContent ?? ''
  return text.replace(/\s+/g, ' ').trim()
}

const channelCache = new Map<string, { data: VeloraUser | null, fetchedAt: number }>()

async function getChannel(username: string): Promise<VeloraUser | null> {
  const cached = channelCache.get(username)
  if (cached && Date.now() - cached.fetchedAt < CHANNEL_CACHE_TTL)
    return cached.data

  let data: VeloraUser | null = null
  try {
    const res = await fetch(`https://api.velora.tv/api/users/${username}`)
    if (res.ok)
      data = await res.json() as VeloraUser
  }
  catch (e) {
    presence.error(`Failed to fetch Velora channel data: ${e}`)
  }

  channelCache.set(username, { data, fetchedAt: Date.now() })
  return data
}

// WebRTC playback uses a MediaStream via srcObject; LL-HLS uses a regular
// src/currentSrc URL. Reading the existing player's element on the tick
// PreMiD already runs is enough - no need to patch fetch/RTCPeerConnection.
function detectStreamFormat(): 'webrtc' | 'll-hls' | undefined {
  const video = document.querySelector('video')
  if (!video)
    return undefined
  if (video.srcObject)
    return 'webrtc'
  if (video.currentSrc || video.src)
    return 'll-hls'
  return undefined
}

presence.on('UpdateData', async () => {
  try {
    await updateActivity()
  }
  catch (e) {
    presence.error(`Velora activity failed: ${e}`)
    presence.setActivity({
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
      details: 'Browsing...',
    })
  }
})

async function updateActivity(): Promise<void> {
  const [privacy, showBrowsingStatus, showCover, usePresenceName, showCategory, showViewerCount, showTimestamps, showSmallImage, showButtons, showDashboardStatus] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showBrowsingStatus'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('showCategory'),
    presence.getSetting<boolean>('showViewerCount'),
    presence.getSetting<boolean>('showTimestamps'),
    presence.getSetting<boolean>('showSmallImage'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showDashboardStatus'),
  ])

  const [firstSegment] = document.location.pathname.split('/').filter(Boolean)
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Browsing...',
  }

  if (firstSegment === 'dashboard') {
    if (showDashboardStatus) {
      const [, dashboardPage] = document.location.pathname.split('/').filter(Boolean)
      presenceData.details = 'Managing their channel'
      if (!privacy && dashboardPage)
        presenceData.state = formatSlug(dashboardPage)
    }

    if (!showBrowsingStatus)
      return presence.clearActivity()

    presence.setActivity(presenceData)
    return
  }

  if (!firstSegment || STATIC_ROUTES.has(firstSegment)) {
    if (firstSegment === 'browse')
      presenceData.details = 'Browsing streams'

    if (!showBrowsingStatus)
      return presence.clearActivity()

    presence.setActivity(presenceData)
    return
  }

  const channel = await getChannel(firstSegment)

  if (!channel) {
    if (!showBrowsingStatus)
      return presence.clearActivity()

    presence.setActivity(presenceData)
    return
  }

  if (channel.isLive && channel.streamInfo) {
    (presenceData as PresenceData).type = ActivityType.Watching

    const mature = isMatureStream(channel.streamInfo)
    const hide = privacy || mature

    presenceData.details = hide ? 'Watching a livestream' : (channel.streamInfo.title || 'Untitled stream')

    if (!hide) {
      if (usePresenceName) {
        presenceData.name = channel.displayName
        const bioText = channel.bio ? extractBioText(channel.bio) : ''
        if (bioText)
          presenceData.state = bioText
      }
      else {
        presenceData.state = channel.displayName
      }

      const tag = [
        showCategory ? channel.streamInfo.categoryName : undefined,
        showViewerCount ? `${channel.streamInfo.viewerCount} viewers` : undefined,
      ].filter(Boolean).join(' • ')
      if (tag)
        (presenceData as PresenceData).largeImageText = tag
    }

    if (showCover) {
      presenceData.largeImageKey = !mature && channel.streamInfo.thumbnail
        ? channel.streamInfo.thumbnail
        : (channel.avatarUrl || ActivityAssets.Logo)
    }

    if (showSmallImage) {
      const format = detectStreamFormat()
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = format === 'webrtc'
        ? 'Ultra Low Latency (WebRTC)'
        : format === 'll-hls'
          ? 'Low Latency (LL-HLS)'
          : 'Live'
    }

    if (showTimestamps && !hide)
      presenceData.startTimestamp = Math.floor(new Date(channel.streamInfo.startedAt).getTime() / 1000)
    else
      delete presenceData.startTimestamp

    if (showButtons && !hide) {
      presenceData.buttons = [
        {
          label: 'Watch Stream',
          url: document.location.href,
        },
      ]
    }
  }
  else {
    if (!privacy) {
      if (usePresenceName) {
        presenceData.name = channel.displayName
        presenceData.details = 'Browsing their channel'
        const bioText = channel.bio ? extractBioText(channel.bio) : ''
        if (bioText)
          presenceData.state = bioText
      }
      else {
        presenceData.state = `${channel.displayName}'s channel`
      }
    }
    if (showCover)
      presenceData.largeImageKey = channel.avatarUrl || ActivityAssets.Logo

    if (!showBrowsingStatus)
      return presence.clearActivity()
  }

  presence.setActivity(presenceData)
}
