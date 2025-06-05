import { ActivityType, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1126923786600583339',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/Navidrome/assets/logo.png',
}

let isUploading = false
const uploadedImages: Record<string, string> = {}
async function uploadImage(urlToUpload: string): Promise<string> {
  if (isUploading)
    return ActivityAssets.Logo

  if (uploadedImages[urlToUpload])
    return uploadedImages[urlToUpload]
  isUploading = true

  return new Promise((resolve) => {
    fetch(urlToUpload)
      .then(res => res.blob())
      .then((blob) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          isUploading = false

          const result = reader.result as string
          uploadedImages[urlToUpload] = result

          resolve(result)
        }
      })
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Listening,
  }

  const [
    artistAsTitle,
    cover,
  ] = await Promise.all([
    presence.getSetting<boolean>('artistAsTitle'),
    presence.getSetting<boolean>('cover'),
  ])

  // Determine player state
  let playerState
  // Check if audio-title has any content
  if (document.querySelector('.audio-title')?.textContent) {
    if (document.querySelector('.react-jinke-music-player-pause-icon'))
      playerState = 'playing'
    else playerState = 'paused'
  }
  else {
    playerState = 'notInitialized'
  }

  // Check if music-player-panel initialized || Check if any music is playing/paused
  if (playerState === 'playing' || playerState === 'paused') {
    // Grab song information

    const timestamps = getTimestamps(
      timestampFromFormat(
        document.querySelector('.current-time')?.textContent ?? '',
      ),
      timestampFromFormat(
        document.querySelector('.duration')?.textContent ?? '',
      ),
    )

    const artwork = navigator.mediaSession.metadata?.artwork

    // Set gathered data
    presenceData.details = navigator.mediaSession?.metadata?.title
    presenceData.state = navigator.mediaSession?.metadata?.artist
    if (artistAsTitle) {
      presenceData.name = document.querySelector('.songArtist')?.textContent ?? 'Navidrome'
    }
    if (cover) {
      presenceData.largeImageKey = await uploadImage(artwork?.[artwork.length - 1]?.src
        ?? ActivityAssets.Logo)
    }
    // Set timestamp if playing
    if (playerState === 'playing')
      [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps
  }
  else if (playerState === 'notInitialized') {
    presenceData.details = 'Browsing...'
    presenceData.startTimestamp = browsingTimestamp
  }
  presence.setActivity(presenceData)
})
