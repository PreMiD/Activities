import { ActivityType, Assets, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '514771696134389760',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/V/VK/assets/logo.png',
}

let lastTrack = ''
let startTime = 0

presence.on('UpdateData', async () => {
  const [showTS, hidePaused, showCover, displayType] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<number>('displayType').catch(() => 0),
  ])

  const titleEl = document.querySelector('[data-testid="TopAudioPlayer_Title"]')
  const fullText = titleEl?.textContent?.trim() || ''
  if (!fullText) {
    return presence.clearActivity()
  }

  const separator = fullText.indexOf('—')
  let title = separator !== -1 ? fullText.substring(separator + 1).trim() : fullText
  const artist = separator !== -1 ? fullText.substring(0, separator).trim() : ''

  // Get remix/version info from the title element itself (not from anywhere else)
  const titleContainer = document.querySelector('[data-testid="audioplayeraudioinfo-title"]')
  if (titleContainer) {
    const titleText = titleContainer.textContent?.trim() || ''
    // If titleContainer has more than just the link (remix info), use full title
    if (titleText.includes(title) && titleText !== title) {
      title = titleText
    }
  }

  const isPlaying = document.querySelector('[data-testid="TopAudioPlayer_TogglePlayAction"]')
    ?.getAttribute('data-testactive') === 'true'

  if (!title || !artist) {
    return presence.clearActivity()
  }

  if (hidePaused && !isPlaying) {
    return presence.clearActivity()
  }

  const trackId = `${title}|${artist}`
  if (trackId !== lastTrack) {
    lastTrack = trackId
    startTime = Math.floor(Date.now() / 1000)
  }

  // Get cover image
  let coverUrl = ''
  if (showCover) {
    const coverImg = document.querySelector('[data-testid="audio-player-block-audio-cover"] img')
    coverUrl = coverImg?.getAttribute('src') || ''
  }

  // Set status display type
  let statusDisplayType: StatusDisplayType | undefined
  switch (displayType) {
    case 0: // Activity Name
      statusDisplayType = StatusDisplayType.Name
      break
    case 1: // Artist Name
      statusDisplayType = StatusDisplayType.State
      break
    case 2: // Song Title
      statusDisplayType = StatusDisplayType.Details
      break
  }

  presence.setActivity({
    name: 'VK Music',
    type: ActivityType.Listening,
    details: title,
    state: artist,
    largeImageKey: coverUrl || ActivityAssets.Logo,
    smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
    smallImageText: isPlaying ? 'Playing' : 'Paused',
    statusDisplayType,
    ...(showTS && isPlaying && { startTimestamp: startTime }),
  })
})
