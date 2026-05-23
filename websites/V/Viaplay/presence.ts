import { ActivityType, Assets, getTimestamps } from 'premid'

const presence: Presence = new Presence({
  clientId: '632618001824219167',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const startTimestamp = Math.floor(Date.now() / 1000)

function capitalise(splitStr: string[]): string {
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i]!.charAt(0).toUpperCase() + splitStr[i]!.substring(1)
    splitStr[i] = splitStr[i]!
      .replace('Sasong', 'Season')
      .replace('Avsnitt', 'Episode')
  }
  return splitStr.join(' ')
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Viaplay/assets/logo.png',
    startTimestamp,
    type: ActivityType.Watching,
  }
  const url = window.location.href
  if (url.includes('/player/')) {
    const video = document.querySelector('video')!
    const timestamps = getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )
    const tokens = url.split('/')
    presenceData = {
      details: capitalise(tokens[6]?.split('-') ?? []),
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Viaplay/assets/logo.png',
      smallImageKey: video.paused ? Assets.Pause : Assets.Play,
      smallImageText: video.paused
        ? (await strings).pause
        : (await strings).play,
      startTimestamp: timestamps[0],
      endTimestamp: timestamps[1],
    }

    if (tokens.length > 8) {
      presenceData.state = `${capitalise(tokens[7]?.split('-') ?? [])} ${capitalise(
        tokens[8]?.split('-') ?? [],
      )}`
    }

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else if (url.includes('#search')) {
    presenceData.details = 'Searching...'
    presenceData.smallImageKey = Assets.Search
  }
  else {
    presenceData.details = 'Browsing'
  }

  presence.setActivity(presenceData)
})
