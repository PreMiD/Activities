import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '705139844883677224',
})
const strings = presence.getStrings({
  paused: 'general.paused',
  playing: 'general.playing',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Prime%20Video/assets/logo.png',
  }
  const usePresenceName = await presence.getSetting<boolean>('usePresenceName')
  presenceData.startTimestamp = browsingTimestamp
  const title = document.querySelector(
    '.webPlayerSDKUiContainer > div > div > div > div:nth-child(2) > div > div:nth-child(4) > div > div:nth-child(2) > div:nth-child(2) > div > div > div > h1',
  )?.textContent
  || document.querySelector('.atvwebplayersdk-title-text')?.textContent
  const title2 = document.querySelector('.av-detail-section > div > h1')?.textContent
    || document.querySelector<HTMLImageElement>(
      '.av-detail-section > div > h1 > div > img',
    )?.alt
  if (title || title2) {
    let video = document.querySelector<HTMLVideoElement>(
      '.scalingVideoContainer > div.scalingVideoContainerBottom > div > video',
    ) || document.querySelector<HTMLVideoElement>('#dv-web-player video')

    if (video === null || Number.isNaN(video.duration))
      video = document.querySelector('video')

    if (video === null || Number.isNaN(video.duration))
      video = document.querySelector('video:nth-child(2)')

    const subtitle = document.querySelector<HTMLElement>(
      '.webPlayerSDKUiContainer > div > div > div > div:nth-child(2) > div > div:nth-child(4) > div > div:nth-child(2) > div:nth-child(2) > div > div > div > h2',
    )
    || document.querySelector<HTMLElement>('.atvwebplayersdk-subtitle-text')

    if (video && title && !video.className.includes('tst')) {
      presenceData.details = title

      if (usePresenceName)
        presenceData.name = title

      if (
        subtitle
        && subtitle.textContent
        && subtitle.textContent.trim() !== title.trim()
      ) {
        presenceData.state = subtitle.textContent
      }

      if (video.paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = (await strings).paused
        delete presenceData.startTimestamp
      }
      else {
        const [unformattedCurrentTime, unformattedDuration] = document
          .querySelector('.atvwebplayersdk-timeindicator-text')
          ?.textContent
          ?.trim()
          .split(' / ') ?? [];
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          timestampFromFormat(unformattedCurrentTime ?? ''),
          timestampFromFormat(unformattedDuration ?? '')
          + timestampFromFormat(unformattedCurrentTime ?? ''),
        )
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = (await strings).playing
      }
    }
    else if (video && !video.className.includes('tst')) {
      if (title2 !== '')
        presenceData.details = title2

      if (usePresenceName)
        presenceData.name = title2

      if (video.paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = (await strings).paused
        delete presenceData.startTimestamp
      }
      else {
        const [unformattedCurrentTime, unformattedDuration] = document
          .querySelector('.atvwebplayersdk-timeindicator-text')
          ?.textContent
          ?.trim()
          .split(' / ') ?? [];
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          timestampFromFormat(unformattedCurrentTime ?? ''),
          timestampFromFormat(unformattedDuration ?? '')
          + timestampFromFormat(unformattedCurrentTime ?? ''),
        )
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = (await strings).playing
      }
    }
    else if (title2) {
      presenceData.details = 'Viewing:'
      presenceData.state = title2
    }
    else if (document.location.pathname.includes('shop')) {
      presenceData.details = 'Browsing the store...'
    }
    else {
      presenceData.details = 'Browsing...'
    }
  }
  else if (document.location.pathname.includes('/home/')) {
    presenceData.details = 'Browsing...'
  }
  else if (document.location.pathname.includes('shop')) {
    presenceData.details = 'Browsing the store...'
  }
  else if (document.location.pathname.includes('/tv/')) {
    presenceData.details = 'Browsing TV-Series'
  }
  else if (document.location.pathname.includes('/movie/')) {
    presenceData.details = 'Browsing Movies'
  }
  else if (document.location.pathname.includes('/kids/')) {
    presenceData.details = 'Browsing Movies for kids'
  }
  else if (
    document.location.pathname.includes('/search/')
    && document.querySelector('.av-refine-bar-summaries')
  ) {
    presenceData.details = 'Searching for:';
    [presenceData.state] = document
      .querySelector('.av-refine-bar-summaries')
      ?.textContent
      ?.split(/["„]/)[1]
      ?.split(/[”"]/) ?? []
    presenceData.smallImageKey = Assets.Search
  }
  else {
    presenceData.details = 'Browsing a page'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
