import { Assets } from 'premid'

const presence = new Presence({
  clientId: '768710795449335818',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
})

/**
 * Get the current state text
 * @param {boolean} paused Is the video paused
 * @param {boolean} live Is it a live video
 */
function getStateText(paused: boolean, live: boolean) {
  return live ? 'Live Broadcast' : paused ? 'Paused' : 'Watching'
}

let elapsed: number, oldUrl: string

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Starz/assets/logo.png',
  }
  const { href, pathname: path } = window.location

  if (href !== oldUrl) {
    oldUrl = href
    elapsed = Math.floor(Date.now() / 1000)
  }

  const video = document.querySelector<HTMLVideoElement>(
    '.bitmovinplayer-container video',
  )

  if (video) {
    const title = document.querySelector('title')?.textContent
    const live = video.duration === Infinity

    presenceData.details = title
    presenceData.state = getStateText(video.paused, live)
    presenceData.smallImageKey = live
      ? Assets.Live
      : video.paused
        ? Assets.Pause
        : Assets.Play
    presenceData.smallImageText = live
      ? (await strings).live
      : video.paused
        ? (await strings).pause
        : (await strings).play
    if (!live) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
    }
    else if (live) {
      delete presenceData.endTimestamp
    }

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (title)
      presence.setActivity(presenceData, !video.paused)
  }
  else {
    presenceData.details = 'Browsing...'
    if (path.includes('/series'))
      presenceData.details = 'Browsing Series'

    if (path.includes('/movies'))
      presenceData.details = 'Browsing Movies'

    if (path.includes('/playlist'))
      presenceData.details = 'Browsing Playlist'

    if (path.includes('/schedule'))
      presenceData.details = 'Browsing Schedule'

    if (path.includes('/search'))
      presenceData.details = 'Searching...'

    presenceData.startTimestamp = elapsed
    presence.setActivity(presenceData)
  }
})
