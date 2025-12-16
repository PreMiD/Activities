import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '705139844883677224',
})

const strings = presence.getStrings({
  paused: 'general.paused',
  playing: 'general.playing',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Prime%20Video/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const usePresenceName = await presence.getSetting<boolean>('usePresenceName')

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const video = document.querySelector<HTMLVideoElement>('#dv-web-player video')
    || document.querySelector<HTMLVideoElement>('#dv-web-player .atvwebplayersdk-video-surface video')
    || document.querySelector<HTMLVideoElement>('video')

  const title = document.querySelector('.atvwebplayersdk-player-container .fpqiyer .ffszj3z .f124tp54 h1')?.textContent || document.querySelector<HTMLImageElement>('.DVWebNode-detail-atf-wrapper picture img')?.alt

  const title2 = document.querySelector('.DVWebNode-detail-atf-wrapper .BaLbyy h1')?.textContent || document.querySelector<HTMLImageElement>('.DVWebNode-detail-atf-wrapper picture img')?.alt

  const bannerImg = document.querySelector<HTMLImageElement>('.BNTHjF img')?.src

  const subtitle = document.querySelector<HTMLElement>('.atvwebplayersdk-subtitle-text')

  if (video && !video.className.includes('tst') && title) {
    const contentTitle = title
    if (usePresenceName) {
      presenceData.name = contentTitle
    }
    presenceData.details = contentTitle

    if (subtitle && subtitle.textContent && subtitle.textContent.trim() !== contentTitle?.trim()) {
      presenceData.state = subtitle.textContent
    }

    if (bannerImg) {
      presenceData.largeImageKey = bannerImg
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
  else if (video && !video.className.includes('tst') && title2) {
    const contentTitle = title2

    if (usePresenceName) {
      presenceData.name = contentTitle
    }
    presenceData.details = contentTitle

    if (subtitle && subtitle.textContent && subtitle.textContent.trim() !== contentTitle?.trim()) {
      presenceData.state = subtitle.textContent
    }

    if (bannerImg) {
      presenceData.largeImageKey = bannerImg
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

  if (pathname.includes('/storefront')) {
    presenceData.details = 'Viewing Home'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/movie')) {
    presenceData.details = 'Viewing Movies'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/tv')) {
    presenceData.details = 'Viewing TV-Series'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/sports')) {
    presenceData.details = 'Viewing Sports'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/categories')) {
    presenceData.details = 'Viewing Categories'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/kids/')) {
    presenceData.details = 'Viewing Movies for kids'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/search/') && document.querySelector('.av-refine-bar-summaries')) {
    presenceData.details = 'Searching for:';
    [presenceData.state] = document
      .querySelector('.av-refine-bar-summaries')
      ?.textContent
      ?.split(/["„]/)[1]
      ?.split(/[”"]/) ?? []
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/genre/')) {
    presenceData.details = 'Viewing Genres'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('shop')) {
    presenceData.details = 'Browsing the store...'
  }

  presence.setActivity(presenceData)
})
