const presence = new Presence({
  clientId: '1567264207593017354',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/vqklmUN.png', // logo
  Play = 'https://i.imgur.com/3WimqKn.png', // play
  Pause = 'https://i.imgur.com/TQL74Ev.png', // pause
}

const PAUSE_GRACE_MS = 3000

let startTimestamp: number | undefined
let lastPlayingAt = 0

function getText(id: string): string | undefined {
  const text = document.getElementById(id)?.textContent?.trim()
  return text || undefined
}

function detectPlaying(): boolean {
  const audio = document.querySelector<HTMLAudioElement>('audio')
  if (audio)
    return !audio.paused && !audio.ended

  const state = document
    .querySelector<HTMLElement>('[data-state="playing"], [data-state="idle"]')
    ?.getAttribute('data-state')
    ?.toLowerCase()
  return state === 'playing'
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  if (detectPlaying())
    lastPlayingAt = Date.now()

  const isPlaying = Date.now() - lastPlayingAt < PAUSE_GRACE_MS

  if (isPlaying) {
    const trackName = getText('title')
    const artistName = getText('artist')
    const djName = getText('onair-name')

    presenceData.details = `${artistName} - ${trackName}`
      ? `${artistName} - ${trackName}`
      : trackName ?? 'Listening to haul.fm'
    presenceData.state = djName ? `Presented by ${djName}` : undefined
    presenceData.smallImageKey = ActivityAssets.Play
    presenceData.smallImageText = 'Playing'

    startTimestamp ??= Math.floor(Date.now() / 1000)
    presenceData.startTimestamp = startTimestamp
  }
  else {
    startTimestamp = undefined

    presenceData.details = 'Browsing haul.fm'
    presenceData.smallImageKey = ActivityAssets.Pause
    presenceData.smallImageText = 'Paused'
  }

  presence.setActivity(presenceData)
})
