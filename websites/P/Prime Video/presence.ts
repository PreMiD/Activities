import { ActivityType, Assets, getTimestamps } from 'premid'

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

  const [usePresenceName, showCover] = await Promise.all([
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('cover'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const body = document.querySelector('body')
  const bodyStyle = window.getComputedStyle(body!)

  const video = document.querySelector<HTMLVideoElement>('div[id^=dv-web-player] video[src]')
    || document.querySelector<HTMLVideoElement>('#dv-web-player video')
    || document.querySelector<HTMLVideoElement>('#dv-web-player .atvwebplayersdk-video-surface video')
    || document.querySelector<HTMLVideoElement>('video')

  const title = document.querySelector('.atvwebplayersdk-player-container .fpqiyer .ffszj3z .f124tp54 h1')?.textContent || document.querySelector<HTMLImageElement>('.DVWebNode-detail-atf-wrapper picture img')?.alt || document.querySelector('.atvwebplayersdk-title-text')?.textContent || document.querySelector('h1[data-automation-id="title"]')?.textContent

  const title2 = document.querySelector('.DVWebNode-detail-atf-wrapper .BaLbyy h1')?.textContent || document.querySelector<HTMLImageElement>('.DVWebNode-detail-atf-wrapper picture img')?.alt || document.querySelector('.atvwebplayersdk-title-text')?.textContent || document.querySelector('h1[data-automation-id="title"]')?.textContent

  const bannerImg = document.querySelector<HTMLImageElement>('main div[data-automation-id="hero-background"] img')?.src

  const subtitle = document.querySelector<HTMLElement>('.atvwebplayersdk-episode-info') || document.querySelector<HTMLElement>('.atvwebplayersdk-subtitle-text')

  if (video && !video.className.includes('tst') && title && bodyStyle.overflow === 'hidden') {
    const contentTitle = title
    if (usePresenceName) {
      presenceData.name = contentTitle
    }
    presenceData.details = contentTitle

    if (subtitle && subtitle.textContent && subtitle.textContent.trim() !== contentTitle?.trim()) {
      presenceData.state = subtitle.textContent
    }

    if (bannerImg && showCover) {
      presenceData.largeImageKey = bannerImg
    }

    if (video.paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = (await strings).paused
      delete presenceData.startTimestamp
    }
    else {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).playing
    }
  }
  else if (video && !video.className.includes('tst') && title2 && bodyStyle.overflow === 'hidden') {
    const contentTitle = title2

    if (usePresenceName) {
      presenceData.name = contentTitle
    }
    presenceData.details = contentTitle

    if (subtitle && subtitle.textContent && subtitle.textContent.trim() !== contentTitle?.trim()) {
      presenceData.state = subtitle.textContent
    }

    if (bannerImg && showCover) {
      presenceData.largeImageKey = bannerImg
    }

    if (video.paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = (await strings).paused
      delete presenceData.startTimestamp
    }
    else {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).playing
    }
  }
  else if (pathname.includes('/storefront') || pathname === '/') {
    presenceData.details = 'Viewing Home'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/detail')) {
    presenceData.details = 'Viewing page for:'
    presenceData.state = title || title2 || 'Prime Video'

    if (bannerImg && showCover) {
      presenceData.largeImageKey = bannerImg
    }
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
  else if (pathname.includes('/livetv')) {
    presenceData.details = 'Viewing Live TV'
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
