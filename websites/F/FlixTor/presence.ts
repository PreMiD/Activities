import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1001112348192423946',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Unknown page',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/FlixTor/assets/logo.png',
  }
  const video = document.querySelector<HTMLVideoElement>(
    '#player > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
  )

  const playback = !!video

  if (!playback) {
    presenceData.details = 'Browsing...'
    presenceData.startTimestamp = browsingTimestamp

    presence.setActivity(presenceData)
  }

  if (video && !Number.isNaN(video.duration)) {
    const videoTitle = document.querySelector(
      'div.watch-header.h4.mb-0.font-weight-normal.link.hidden-sm-down',
    )
    const season = document.querySelector(
      '#playercontainer span.outPes',
    )
    const episode = document.querySelector(
      '#playercontainer span.outPep',
    )
    presenceData.largeImageKey = document
      .querySelector<HTMLMetaElement>('meta[property="og:image"]')
      ?.getAttribute('content')
      ?.replace('https:https:', 'https:')

    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).pause
      : (await strings).play;
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )

    if (season && episode) {
      presenceData.details = videoTitle
        ? videoTitle.textContent
        : 'Title not found...'
      presenceData.state = `Season ${season.textContent} Episode ${episode.textContent}`
      presenceData.buttons = [
        {
          label: presenceData.details!.length >= 30
            ? 'View Now'
            : presenceData.details,
          url: document.location.href.split('/season/')[0]!,
        },
        {
          label: presenceData.state,
          url: document.location.href,
        },
      ]
    }
    else if (!season && episode) {
      presenceData.details = videoTitle
        ? videoTitle.textContent
        : 'Title not found...'
      presenceData.state = `Episode ${episode.textContent}`
      presenceData.buttons = [
        {
          label: presenceData.details!.length >= 30
            ? 'View Now'
            : presenceData.details,
          url: document.location.href.split('/episode/')[0]!,
        },
        {
          label: presenceData.state,
          url: document.location.href,
        },
      ]
    }
    else {
      presenceData.details = 'Watching'
      presenceData.state = videoTitle
        ? videoTitle.textContent
        : 'Title not found...'
      presenceData.buttons = [
        {
          label: presenceData.state!.length >= 30 ? 'Watch Now' : presenceData.state,
          url: document.location.href,
        },
      ]
    }

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
    if (videoTitle)
      presence.setActivity(presenceData, !video.paused)
  }
})
