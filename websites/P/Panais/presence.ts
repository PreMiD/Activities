import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1399774169536921660',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Panais/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    largeImageUrl: 'https://panais.xyz',
    buttons: [
      {
        label: 'Panais Dashboard',
        url: 'https://panais.xyz/',
      },
    ],
  }

  const setDetails = (details: string, smallKey?: string) => {
    presenceData.details = details
    if (smallKey)
      presenceData.smallImageKey = smallKey
  }

  const { pathname } = document.location

  if (pathname.endsWith('/terms-of-service')) {
    setDetails('Reading terms of service', Assets.Reading)
  }
  else if (pathname.endsWith('/privacy-policy')) {
    setDetails('Reading privacy policy', Assets.Reading)
  }
  else if (pathname.endsWith('/profile')) {
    setDetails('Viewing a profile')
  }
  else if (pathname.endsWith('/invite')) {
    setDetails('Viewing an invite')
  }
  else if (pathname.endsWith('/panais-canary/servers')) {
    setDetails('Viewing the dashboard')
  }
  else if (/\/panais-canary\/\d+\//.test(pathname)) {
    setDetails('Viewing dashboard')

    const musicTitle = document.querySelector('.text-sm.font-medium.truncate')?.textContent?.trim() || null
    const musicArtist = document.querySelector('.text-xs.text-muted-foreground.truncate')?.textContent?.trim() || null

    const elapsedTimeElement = document.querySelector('[data-id="elapsedTime"]')
    const durationTimeElement = document.querySelector('[data-id="durationTime"]')
    const elapsedTime = elapsedTimeElement?.textContent?.trim()
    const durationTime = durationTimeElement?.textContent?.trim()

    const playButton = document.querySelector('.lucide.lucide-play.h-6.w-6')
    const pauseButton = document.querySelector('.lucide.lucide-pause.h-6.w-6')
    const isPlaying = pauseButton !== null
    const isPaused = playButton !== null

    if (musicTitle || musicArtist) {
      if (elapsedTime && durationTime && isPlaying) {
        try {
          const elapsedSeconds = timestampFromFormat(elapsedTime)
          const durationSeconds = timestampFromFormat(durationTime)
          const [startTimestamp, endTimestamp] = getTimestamps(elapsedSeconds, durationSeconds)
          presenceData.startTimestamp = startTimestamp
          presenceData.endTimestamp = endTimestamp
        }
        catch {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }

      if (isPlaying) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Playing'
      }
      else if (isPaused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'

        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
      else {
        delete presenceData.smallImageKey
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      if (musicTitle && musicArtist) {
        presenceData.details = musicTitle
        presenceData.state = musicArtist
      }
      else if (musicTitle) {
        presenceData.details = musicTitle
        presenceData.state = 'Unknown Artist'
      }
      else {
        presenceData.details = 'Playing: Unknown Song'
        presenceData.state = musicArtist!
      }
    }
    else {
      delete presenceData.state
      delete presenceData.smallImageKey
    }
  }
  else if (pathname.endsWith('')) {
    setDetails('Viewing home page')
  }

  presence.setActivity(presenceData)
})
