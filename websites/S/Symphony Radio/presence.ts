import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1449503984996974745',
})

const API_URL = 'https://panel.symphradio.live/api/stats'

let lastTrackId: string | null = null
let lastStart = 0

async function fetchStats() {
  try {
    const res = await fetch(API_URL)

    if (!res.ok) {
      return null
    }

    return await res.json()
  } catch {
    return null
  }
}

presence.on('UpdateData', async () => {
  const browsing = await presence.getSetting<boolean>('browsing')

  if (!document.location.hostname.includes('symphonyradio.co.uk')) {
    if (browsing) {
      presence.setActivity({
        type: ActivityType.Listening,
        details: 'Browsing Symphony Radio',
        largeImageKey: 'logo',
        largeImageText: 'Symphony Radio',
      })
    } else {
      presence.clearActivity()
    }

    return
  }

  const data = await fetchStats()

  if (!data?.nowPlaying) {
    return
  }

  const track = data.song?.track ?? 'Live Radio'
  const artist = data.song?.artist ?? 'Symphony Radio'

  const presenter = data.onAir?.presenter
  const isLive = presenter?.is_live === true
  const djName = presenter?.name || 'Symphony'

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
    largeImageKey: data.nowPlaying.track?.artwork?.url,
    largeImageText: artist,
    smallImageKey: presenter?.avatar,
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
