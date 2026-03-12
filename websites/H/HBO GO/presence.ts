import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '605437254776651786',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

function convertToTitleCase(str: string): string {
  if (!str)
    return ''

  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Browsing...',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HBO%20GO/assets/logo.png',
    type: ActivityType.Watching,
  }
  const video = document.querySelector<HTMLVideoElement>('video')

  if (video && !Number.isNaN(video.duration) && !!document.querySelector('div.movie-title')) {
    const title = convertToTitleCase(
      document.querySelector('div.movie-title')!.textContent!,
    )
    if (document.location.pathname.includes('/series/')) {
      const match = title.match(
        /(?<series>.+?)\sS(?<season>\d+)\s(?<episode>\d{2})(?::\s*(?<title>.+))?/,
      )!

      match.groups!.episode = Number.parseInt(match.groups!.episode!).toString()

      presenceData.name = match.groups!.series
      presenceData.details = match.groups!.title || `Episode ${match.groups!.episode}`
      presenceData.state = `Season ${match.groups!.season}, Episode ${match.groups!.episode}`
    }
    else {
      presenceData.details = title
      presenceData.state = document.location.pathname.includes('/movies/')
        ? 'Movie'
        : 'Extra'
    }

    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).pause
      : (await strings).play;
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }

  presence.setActivity(presenceData)
})
