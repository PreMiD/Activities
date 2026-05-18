import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1506049886175629322',
})

enum ActivityAssets {
  Logo = 'https://raw.githubusercontent.com/DevRayro/Activities/add-sound4all-presence/websites/S/Sound4All/assets/logo.png',
}

let lastTitle = ''
let lastArtist = ''
let lastIsPlaying = false
let startTimestamp = 0
let endTimestamp = 0

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Sound4All',
    type: ActivityType.Listening,
  }

  const playerData = getPlayerData()

  if (!playerData || !playerData.title) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Exploring library'
    presence.setActivity(presenceData)
    return
  }

  const {
    title,
    artist,
    coverUrl,
    isPlaying,
    currentTime,
    duration,
  } = playerData

  if (
    title !== lastTitle
    || artist !== lastArtist
    || isPlaying !== lastIsPlaying
  ) {
    if (isPlaying && duration > 0) {
      const now = Date.now()
      startTimestamp = now - currentTime * 1000
      endTimestamp = now + (duration - currentTime) * 1000
    }
    else {
      startTimestamp = 0
      endTimestamp = 0
    }

    lastTitle = title
    lastArtist = artist
    lastIsPlaying = isPlaying
  }

  presenceData.details = title
  presenceData.state = artist

  if (coverUrl) {
    presenceData.smallImageKey = coverUrl
    presenceData.smallImageText = 'Cover'
  }

  if (isPlaying && duration > 0) {
    presenceData.startTimestamp = startTimestamp
    presenceData.endTimestamp = endTimestamp
  }
  else if (!isPlaying) {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'
  }

  presence.setActivity(presenceData)
})

interface PlayerData {
  title: string
  artist: string
  coverUrl: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
}

function getPlayerData(): PlayerData | null {
  try {
    const globalState = (window as unknown as {
      __SOUND4ALL_PLAYER_STATE__?: {
        queue?: Array<{
          title?: string
          artist?: string
          coverUrl?: string
          durationSec?: number
        }>
        index?: number
        isPlaying?: boolean
        currentTime?: number
        duration?: number
      }
    }).__SOUND4ALL_PLAYER_STATE__

    if (globalState) {
      const track = globalState.queue?.[globalState.index ?? 0]
      if (track) {
        return {
          title: track.title || 'Unknown Title',
          artist: track.artist || 'Unknown Artist',
          coverUrl: track.coverUrl || null,
          isPlaying: globalState.isPlaying || false,
          currentTime: globalState.currentTime || 0,
          duration: globalState.duration || track.durationSec || 0,
        }
      }
    }

    const titleElement = document.querySelector('.truncate.text-sm.font-medium, .text-xl.font-bold.leading-tight')
    const artistElement = document.querySelector('.truncate.text-xs.text-text-muted, .text-white\\/70.mt-1.truncate')
    const playButton = document.querySelector('button[aria-label*="Pause"], button[aria-label*="Play"], button[aria-label*="Lecture"]')
    const progressBar = document.querySelector<HTMLInputElement>('input[type="range"]')
    const coverImg = document.querySelector<HTMLImageElement>('img[alt], .aspect-square img')

    if (!titleElement || !artistElement)
      return null

    const title = titleElement.textContent?.trim() || 'Unknown Title'
    const artist = artistElement.textContent?.trim() || 'Unknown Artist'
    const isPlaying = playButton?.getAttribute('aria-label')?.includes('Pause') || false
    const currentTime = progressBar ? Number.parseFloat(progressBar.value) : 0
    const duration = progressBar ? Number.parseFloat(progressBar.max) : 0
    const coverUrl = coverImg?.src || null

    return {
      title,
      artist,
      coverUrl,
      isPlaying,
      currentTime,
      duration,
    }
  }
  catch (error) {
    presence.error(`Error getting player data: ${error}`)
    return null
  }
}
