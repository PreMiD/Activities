import { Assets } from 'premid'

const presence = new Presence({
  clientId: '721747730774491187',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
})

interface VideoData {
  duration: number
  currentTime: number
  paused: boolean
}

let video: VideoData = {
  duration: 0,
  currentTime: 0,
  paused: true,
}

presence.on('iFrameData', (data: unknown) => {
  video = data as typeof video
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/OKanime/assets/logo.png',
  }

  if (video && !Number.isNaN(video.duration) && video.duration > 0) {
    presenceData.details = document.querySelector(
      'body div.summary-block > p > a',
    )?.textContent
    if (
      document
        .querySelector('body div.summary-block > p')
        ?.firstChild
        ?.textContent
        ?.includes('حلقة')
    ) {
      presenceData.state = document
        .querySelector('body div.summary-block > p')
        ?.firstChild
        ?.textContent
        ?.substr(
          0,
          document
            .querySelector('body div.summary-block > p')
            ?.firstChild
            ?.textContent
            ?.indexOf('من'),
        )
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

    presence.setActivity(presenceData, !video.paused)
  }
  else {
    presenceData.details = (await strings).browsing
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = (await strings).browsing

    presence.setActivity(presenceData)
  }
})
