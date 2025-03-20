import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '721740741570986016',
})
const strings = presence.getStrings({
  paused: 'general.paused',
  browse: 'general.browsing',
})

function updateLogo() {
  const trackCoverartDiv = document.querySelector('.track-coverart')
  if (trackCoverartDiv) {
    const style = trackCoverartDiv.getAttribute('style')
    if (style) {
      const match = decodeURIComponent(style).match(/url\("([^"]+)"\)/)
      if (match && match[1]) {
        let url = match[1]
        url = url.replace(/&size=\d+/, '')
        return url
      }
    }
  }
  return 'https://cdn.rcd.gg/PreMiD/websites/A/Anghami/assets/logo.png'
}

function calculateEndTimestamp(
  startTime: string,
  remainingTime: string,
): string {
  const [startMinutes, startSeconds] = startTime.trim().split(':').map(Number)
  const [remainingMinutes, remainingSeconds] = remainingTime
    .trim()
    .split(':')
    .map(Number)
  const endTotalSeconds = (startMinutes ?? 0) * 60
    + (startSeconds ?? 0)
    + (remainingMinutes ?? 0) * 60
    + (remainingSeconds ?? 0)

  let endMinutes = Math.floor(endTotalSeconds / 60)
  let endSeconds = endTotalSeconds % 60

  if (endSeconds === 60) {
    endSeconds = 0
    endMinutes++
  }
  return `${endMinutes}:${endSeconds.toString().padStart(2, '0')}`
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: updateLogo(),
    type: ActivityType.Listening,
  }
  const playback = !!document.querySelector('anghami-player')

  if (playback) {
    const selectors: NodeListOf<Node> = document.querySelectorAll('.duration-text')
    const playing: boolean = document.querySelector('anghami-player svg[title=\'pause-shape\']')
      !== null
    let selector: Node | null = document.querySelector(
      'anghami-player .action-title .trim',
    )
    presenceData.details = (selector && selector.textContent) || null
    selector = document.querySelector('anghami-player .action-artist .trim')
    presenceData.state = (selector && selector.textContent) || null

    if (!playing) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
    const duration = presence.timestampFromFormat(
      calculateEndTimestamp(
        selectors[0]?.textContent ?? '',
        selectors[1]?.textContent ?? '',
      ),
    )
    const timestamps = presence.getTimestamps(
      presence.timestampFromFormat(selectors[0]?.textContent ?? ''),
      duration,
    )

    presenceData.startTimestamp = timestamps[0]
    presenceData.endTimestamp = timestamps[1]

    if (!playing) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presence.setActivity(presenceData)
  }
  else {
    presenceData.details = (await strings).browse
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = (await strings).browse
    presence.setActivity(presenceData)
  }
})
