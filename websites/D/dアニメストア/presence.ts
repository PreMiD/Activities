import { ActivityType, Assets, getTimestamps, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '611012705306017792',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const video = pathname.startsWith('/animestore/sc_d_pc')
    ? document.querySelector<HTMLVideoElement>('#video')
    : null
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/d%E3%82%A2%E3%83%8B%E3%83%A1%E3%82%B9%E3%83%88%E3%82%A2/assets/logo.png',
  }

  if (video) {
    const [isThumbnailEnabled, isTitleEnabled, playbackStrings] = await Promise.all([
      presence.getSetting<boolean>('thumbnail'),
      presence.getSetting<boolean>('showTitle'),
      strings,
    ])
    const isPlaying = !video.paused && !video.ended
    const title = document.querySelector('.pauseInfoTxt1')?.textContent?.trim()
    const epNum = document.querySelector('.pauseInfoTxt2')?.textContent?.trim()
    const epTitle = document.querySelector('.pauseInfoTxt3')?.textContent?.trim()
    const episodeParts = [epNum, epTitle].filter(Boolean)

    presenceData = {
      ...presenceData,
      type: ActivityType.Watching,
      details: title || undefined,
      state: episodeParts.join(' / ') || undefined,
      largeImageText: [title, episodeParts.join(' - ')]
        .filter(Boolean)
        .join(' / ') || undefined,
      smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
      smallImageText: isPlaying ? playbackStrings.play : playbackStrings.pause,
    }

    if (isThumbnailEnabled) {
      const bgImage = document.querySelector<HTMLElement>('#backThumb')?.style.backgroundImage
      const thumbnail = bgImage?.match(/url\(["']?([^"']*)["']?\)/)?.[1]
      if (thumbnail)
        presenceData.largeImageKey = thumbnail
    }

    const partId = new URLSearchParams(document.location.search).get('partId')
    if (partId) {
      const workId = partId.slice(0, 5)
      presenceData.detailsUrl = `https://animestore.docomo.ne.jp/animestore/ci_pc?workId=${workId}`
      presenceData.stateUrl = `https://animestore.docomo.ne.jp/animestore/ci_pc?workId=${workId}&partId=${partId}`
      presenceData.largeImageUrl = presenceData.stateUrl
    }

    if (isTitleEnabled)
      presenceData.statusDisplayType = StatusDisplayType.Details

    if (
      isPlaying
      && video.readyState > 0
      && Number.isFinite(video.duration)
      && video.duration > 0
      && video.playbackRate > 0
    ) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
        video.currentTime / video.playbackRate,
        video.duration / video.playbackRate,
      )
    }
  }
  else if (pathname === '/animestore/tp_pc') {
    presenceData.details = 'ホーム'
  }
  else if (pathname === '/animestore/ci_pc') {
    const params = new URLSearchParams(document.location.search)

    if (params.has('workId') && params.has('partId')) {
      presenceData.details = document.querySelector('.headerText')?.textContent?.trim()
      const number = document.querySelector('.episodeTitle > .number')?.textContent?.trim()
      const title = document.querySelector('.episodeTitle > .title')?.textContent?.trim()
      presenceData.state = [number, title].filter(Boolean).join(' / ')
      presenceData.detailsUrl = `https://animestore.docomo.ne.jp/animestore/ci_pc?workId=${params.get('workId')}`
      presenceData.stateUrl = document.location.href
    }
    else if (params.has('workId')) {
      presenceData.details = document.querySelector('.titleWrap > h1')?.textContent?.trim()
      presenceData.detailsUrl = document.location.href
    }
    else {
      presence.clearActivity()
      return
    }
  }
  else if (/^\/animestore\/CF\/.*/.test(pathname)) {
    presenceData.details = document.querySelector('#breadCrumb_b > a > span')?.textContent?.trim()
    presenceData.detailsUrl = document.location.href
  }
  else if (/^\/animestore\/CP\/.*/.test(pathname)) {
    presenceData.details = document.querySelector('#breadCrumb_c > a > span')?.textContent?.trim()
    presenceData.detailsUrl = document.location.href
  }
  else if (/^\/animestore\/mpa?_/.test(pathname)) {
    presenceData.details = 'マイページ'
  }
  else {
    presenceData.details = 'ページを閲覧中'
  }

  presence.setActivity(presenceData)
})
