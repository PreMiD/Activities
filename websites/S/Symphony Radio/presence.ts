import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1449503984996974745',
})

const API_URL = 'https://panel.symphradio.live/api/stats'

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
      is_live?: boolean
      avatar?: string
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

let statsCache: {
  data: ApiResponse | null
  fetchedAt: number
  promise: Promise<ApiResponse | null> | null
} = {
  data: null,
  fetchedAt: 0,
  promise: null,
}

const CACHE_TTL = 1000

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

presence.on('UpdateData', async () => {
  const browsing = await presence.getSetting<boolean>('browsing')

  if (!document.location.hostname.includes('symphonyradio.co.uk')) {
    if (browsing) {
      presence.setActivity({
        type: ActivityType.Listening,
        details: 'Browsing Symphony Radio',
        largeImageKey: 'https://panel.symphradio.live/avatars/logo-premid-512.png',
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
    largeImageKey: data.nowPlaying?.track?.artwork?.url ?? 'https://panel.symphradio.live/avatars/logo-premid-512.png',
    largeImageText: artist,
    smallImageKey: presenter?.avatar ?? undefined,
    smallImageText: isLive ? djName : 'Symphony',
    startTimestamp: lastStart || undefined,
    endTimestamp: end || undefined,
    buttons: [
      {
        label: 'Listen Live',
        url: 'https://symphonyradio.co.uk',
      },
    ],
  })
})
