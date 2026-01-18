import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1449503984996974745',
})

const API_URL = 'https://staff.symphonyrad.io/api/stats'
const LOGO_512 = 'https://cdn.rcd.gg/PreMiD/websites/S/Symphony%20Radio/assets/logo.png'

let lastTrackId: string | null = null
let lastStart = 0

interface ApiResponse {
  song?: {
    track?: string
    artist?: string
  }
  nowPlaying?: {
    track?: {
      artwork?: {
        url?: string
      }
    }
  }
  onAir?: {
    presenter?: {
      name?: string
      avatar?: string
      is_live?: boolean
    }
  }
  listeners?: {
    current?: number
  }
  timing?: {
    startedAt?: number
    finishAt?: number
  }
}

interface UserApiResponse {
  success: boolean
  data?: {
    id: number
    username: string
    avatar?: string
  }
}

const statsCache: {
  data: ApiResponse | null
  fetchedAt: number
  promise: Promise<ApiResponse | null> | null
} = {
  data: null,
  fetchedAt: 0,
  promise: null,
}

const profileCache: {
  data: Record<string, UserApiResponse['data'] | null>
  promise: Record<string, Promise<UserApiResponse['data'] | null>>
} = {
  data: {},
  promise: {},
}

const CACHE_TTL = 72_000

async function fetchStats(): Promise<ApiResponse | null> {
  const now = Date.now()

  if (statsCache.data && now - statsCache.fetchedAt < CACHE_TTL) {
    return statsCache.data
  }

  if (statsCache.promise) {
    return statsCache.promise
  }

  statsCache.promise = (async () => {
    try {
      const res = await fetch(API_URL)

      if (!res.ok) {
        return null
      }

      const json = (await res.json()) as ApiResponse

      statsCache.data = json
      statsCache.fetchedAt = Date.now()

      return json
    }
    catch {
      return null
    }
    finally {
      statsCache.promise = null
    }
  })()

  return statsCache.promise
}

async function fetchProfile(username: string): Promise<UserApiResponse['data'] | null> {
  if (profileCache.data[username]) {
    return profileCache.data[username]
  }

  if (profileCache.promise[username]) {
    return profileCache.promise[username]
  }

  profileCache.promise[username] = (async () => {
    try {
      const res = await fetch(
        `https://staff.symphonyrad.io/api/user?username=${encodeURIComponent(username)}`,
      )

      if (!res.ok) {
        return null
      }

      const json = (await res.json()) as UserApiResponse

      if (!json.success || !json.data) {
        return null
      }

      profileCache.data[username] = json.data

      return json.data
    }
    catch {
      return null
    }
    finally {
      delete profileCache.promise[username]
    }
  })()

  return profileCache.promise[username]
}

presence.on('UpdateData', async () => {
  const browsing = await presence.getSetting<boolean>('browsing')
  const { hostname, pathname } = document.location

  if (hostname.includes('symphonyrad.io') && pathname.startsWith('/profile/')) {
    const username = pathname.split('/profile/')[1]?.trim()

    if (username) {
      const profile = await fetchProfile(username)

      presence.setActivity({
        type: ActivityType.Watching,
        details: 'Viewing profile',
        state: profile?.username ?? username,
        largeImageKey: profile?.avatar || LOGO_512,
        largeImageText: profile?.username || 'Symphony Radio',
      })

      return
    }
  }

  if (!hostname.includes('symphonyrad.io')) {
    if (browsing) {
      presence.setActivity({
        type: ActivityType.Listening,
        details: 'Browsing Symphony Radio',
        largeImageKey: LOGO_512,
        largeImageText: 'Symphony Radio',
      })
    }
    else {
      presence.clearActivity()
    }

    return
  }

  const data = await fetchStats()

  if (!data) {
    return
  }

  const getArtwork = (api: ApiResponse, fallback: string): string => {
    return api.nowPlaying?.track?.artwork?.url || fallback
  }

  const getDjart = (api: ApiResponse, fallback: string): string => {
    return api.onAir?.presenter?.avatar || fallback
  }

  const track = data.song?.track ?? 'Live Radio'
  const artist = data.song?.artist ?? 'Symphony Radio'

  const presenter = data.onAir?.presenter
  const isLive = presenter?.is_live === true
  const djName = presenter?.name ?? 'Symphony'

  const listeners = data.listeners?.current ?? 0
  const start = Number(data.timing?.startedAt ?? 0)
  const end = Number(data.timing?.finishAt ?? 0)

  const trackId = `${track}-${artist}`

  if (trackId !== lastTrackId) {
    lastTrackId = trackId
    lastStart = start
  }

  presence.setActivity({
    type: ActivityType.Listening,
    details: track,
    state: `${isLive ? `🎙️ ${djName}` : '🤖 Symphony'} • ${listeners} listening`,
    largeImageKey: getArtwork(data, LOGO_512),
    largeImageText: artist,
    smallImageKey: getDjart(data, LOGO_512),
    smallImageText: isLive ? `DJ ${djName}` : 'DJ Symphony',
    startTimestamp: lastStart || undefined,
    endTimestamp: end || undefined,
  })
})
