import { Assets } from 'premid'

const presence = new Presence({
  clientId: '770395849041248306',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
})

let elapsed: number, oldUrl: string

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Philo/assets/logo.png',
  }
  const { href, pathname: path } = window.location

  if (href !== oldUrl) {
    oldUrl = href
    elapsed = Math.floor(Date.now() / 1000)
  }

  const video = document.querySelector<HTMLVideoElement>('#player video')

  if (video) {
    const seriesEp = document.querySelector('.season-episode-format')
    const live = document.querySelector('.flag.flag-live')
    const state = seriesEp
      ? `${seriesEp.textContent} ${
        document.querySelector('.player-controls-subtitle-text')?.textContent
      }`
      : live
        ? 'Watching Live'
        : 'Watching'
    const channel = document.querySelector<HTMLImageElement>(
      '.player-controls-subtitle img',
    )

    presenceData.details = document.querySelector(
      '.player-controls-title',
    )?.textContent
    presenceData.state = state
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
    else {
      presenceData.startTimestamp = elapsed
    }

    if (live)
      delete presenceData.endTimestamp

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (!presenceData.endTimestamp)
      delete presenceData.endTimestamp

    if (presenceData.details && presenceData.state.trim()) {
      if (channel && channel.getAttribute('alt'))
        presenceData.state += ` on ${channel.getAttribute('alt')}`

      presence.setActivity(presenceData, !video.paused)
    }
  }
  else {
    presenceData.details = 'Browsing...'
    if (path.includes('/guide'))
      presenceData.details = 'Browsing Guide'

    if (path.includes('/saved'))
      presenceData.details = 'Browsing Saved'

    if (path.includes('/search'))
      presenceData.details = 'Searching...'

    presenceData.startTimestamp = elapsed
    presence.setActivity(presenceData)
  }
})
