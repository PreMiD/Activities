import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1515468425487581234',
})

const LOGO = 'https://spicyamll.online/icon.png'

const formatTime = (ms: number): string => {
  const totalSecs = Math.floor(ms / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

// ── Artwork cache ──
// Caches resolved iTunes artwork URLs by Apple Music track ID to avoid repeated API calls.
const artworkCache = new Map<string, string>()
let artworkFetchInFlight: string | null = null

/**
 * Check if a URL is a valid, externally-accessible HTTP(S) URL.
 * Rejects blob:, data:, relative paths, and empty strings.
 */
function isValidExternalUrl(url: string | null | undefined): url is string {
  return !!url && (url.startsWith('http://') || url.startsWith('https://')) && !url.startsWith('blob:')
}

/**
 * Extract a URL from a CSS background-image value like `url("...")`.
 */
function extractBgUrl(bgImage: string | undefined): string | null {
  if (!bgImage || bgImage === 'none') return null
  const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/)
  return match?.[1] ?? null
}

/**
 * Asynchronously fetch the artwork URL for an Apple Music track ID
 * from the iTunes lookup API and cache it.
 */
async function fetchAndCacheArtwork(trackId: string): Promise<void> {
  if (artworkCache.has(trackId) || artworkFetchInFlight === trackId) return
  artworkFetchInFlight = trackId

  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${trackId}`)
    if (!res.ok) return

    const data = await res.json()
    const result = data?.results?.[0]
    const rawUrl: string | undefined = result?.artworkUrl100

    if (rawUrl) {
      // Upscale from 100x100 to 600x600 for better quality
      const highResUrl = rawUrl.replace('100x100', '600x600')
      artworkCache.set(trackId, highResUrl)
    }
  } catch {
    // Silently fail — next update cycle will retry
  } finally {
    if (artworkFetchInFlight === trackId) artworkFetchInFlight = null
  }
}

presence.on('UpdateData', () => {
  try {
    const songNameEl = document.getElementById('song-name')
    const artistEl = document.getElementById('artists')
    const albumArtEl = document.getElementById('album-art')
    const nowBar = document.getElementById('now-bar')

    const isPlayerPage = nowBar !== null

    if (!isPlayerPage) {
      presence.setActivity({
        name: 'Spicy AMLL Player',
        type: ActivityType.Listening,
        largeImageKey: LOGO,
        largeImageText: 'Spicy AMLL Player',
        details: 'Browsing Catalog',
        state: 'Ready to play',
        startTimestamp: browsingTimestamp,
      })
      return
    }

    const title = songNameEl?.querySelector('span')?.textContent?.trim() || 'Unknown Track'
    const artist = artistEl?.textContent?.trim() || 'Unknown Artist'
    const songId = nowBar?.getAttribute('data-am-track-id')
    const albumName = nowBar?.getAttribute('data-album-name')?.trim() || ''

    if (!title || title === 'Loading...') {
      presence.setActivity({
        name: 'Spicy AMLL Player',
        type: ActivityType.Listening,
        largeImageKey: LOGO,
        largeImageText: 'Spicy AMLL Player',
        details: 'Loading track...',
        startTimestamp: browsingTimestamp,
      })
      return
    }

    // ── Resolve cover art URL (priority order) ──
    let coverUrl: string | null = null

    // 1. data-art-url attribute (set by player from DB — valid CDN URL for AM tracks)
    const dataArtUrl = nowBar?.getAttribute('data-art-url') ?? null
    if (isValidExternalUrl(dataArtUrl)) {
      coverUrl = dataArtUrl
    }

    // 2. CSS background-image on the album art container
    if (!coverUrl) {
      const bgUrl = extractBgUrl(albumArtEl?.style.backgroundImage)
      if (isValidExternalUrl(bgUrl)) {
        coverUrl = bgUrl
      }
    }

    // 3. Cached iTunes artwork (fetched asynchronously in a previous cycle)
    if (!coverUrl && songId && /^\d+$/.test(songId)) {
      const cached = artworkCache.get(songId)
      if (cached) {
        coverUrl = cached
      } else {
        // Kick off an async fetch — the result will be available on the next update cycle
        fetchAndCacheArtwork(songId)
      }
    }

    // 4. Final fallback: app logo
    if (!coverUrl) {
      coverUrl = LOGO
    }

    // Playback state
    const isPlaying = !albumArtEl?.classList.contains('paused')

    // Read position and duration attributes
    const positionMs = parseFloat(nowBar?.getAttribute('data-position') || '0')
    const durationMs = parseFloat(nowBar?.getAttribute('data-duration') || '0')

    // Build state line
    const stateText = artist

    const data: PresenceData = {
      name: 'Spicy AMLL Player',
      type: ActivityType.Listening,
      largeImageKey: coverUrl,
      details: title,
      state: stateText,
      smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
      smallImageText: isPlaying ? 'Playing' : 'Paused',
    }

    if (albumName && albumName.toLowerCase() !== title.toLowerCase()) {
      data.largeImageText = albumName
    }

    // Set timestamps if playing — Discord renders these as a Spotify-style progress bar
    if (isPlaying && durationMs > 0) {
      const now = Date.now()
      data.startTimestamp = Math.floor((now - positionMs) / 1000)
      data.endTimestamp = Math.floor((now + (durationMs - positionMs)) / 1000)
    } else {
      data.startTimestamp = null
      data.endTimestamp = null
    }

    // Add buttons only if we have a valid song ID and it's not a local file
    if (songId && /^\d+$/.test(songId)) {
      data.buttons = [
        {
          label: 'Listen on Spicy Player',
          url: `https://spicyamll.online/#${songId}`,
        },
        {
          label: 'Listen on Apple Music',
          url: `https://music.apple.com/song/${songId}`,
        },
      ]
    }

    presence.setActivity(data)
  } catch (err) {
    console.error('Error in Spicy AMLL Presence:', err)
    // Fallback to browsing if error happens on main player page
    presence.setActivity({
      name: 'Spicy AMLL Player',
      type: ActivityType.Listening,
      largeImageKey: LOGO,
      largeImageText: 'Spicy AMLL Player',
      details: 'Browsing Catalog',
      state: 'Ready to play',
      startTimestamp: browsingTimestamp,
    })
  }
})
