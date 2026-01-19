import { ActivityType, Assets, getTimestampsFromMedia, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '611012705306017792',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

presence.on('UpdateData', async () => {
  const { pathname } = location
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/d%E3%82%A2%E3%83%8B%E3%83%A1%E3%82%B9%E3%83%88%E3%82%A2/assets/logo.png',
  }

  if (
    pathname.startsWith('/animestore/sc_d_pc')
    && document.querySelector('#video')
  ) {
    const video = document.querySelector<HTMLVideoElement>('#video')
    const isPlaying = video && !video.paused
    const title = document.querySelector('.pauseInfoTxt1')?.textContent
    const epNum = document.querySelector('.pauseInfoTxt2')?.textContent
    const epTitle = document.querySelector('.pauseInfoTxt3')?.textContent

    presenceData.details = title
    presenceData.state = `${epNum} / ${epTitle}`
    presenceData.largeImageText = `${title} / ${epNum} - ${epTitle}` as any

    const isThumbnailEnabled = await presence.getSetting<boolean>('thumbnail')

    const thumbElement = document.querySelector<HTMLElement>('#backThumb')
    const bgImage = thumbElement?.style.backgroundImage
    if (bgImage && isThumbnailEnabled) {
      const match = bgImage.match(/url\(["']?([^"']*)["']?\)/)
      if (match && match[1])
        presenceData.largeImageKey = match[1]
    }

    const partId = new URLSearchParams(location.search).get('partId')
    if (partId) {
      const workId = partId.slice(0, 5)
      presenceData.detailsUrl = `https://animestore.docomo.ne.jp/animestore/ci_pc?workId=${workId}`
      presenceData.stateUrl = `https://animestore.docomo.ne.jp/animestore/ci_pc?workId=${workId}&partId=${partId}`
      presenceData.largeImageUrl = presenceData.stateUrl
    }

    presenceData.smallImageKey = isPlaying ? Assets.Play : Assets.Pause

    presenceData.smallImageText = isPlaying
      ? (await strings).play
      : (await strings).pause

    presenceData.type = ActivityType.Watching as any
    presenceData.statusDisplayType = StatusDisplayType.Details

    if (isPlaying) {
      const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)
      presenceData.startTimestamp = startTimestamp
      presenceData.endTimestamp = endTimestamp
    }

    presence.setActivity(presenceData)
  }
  else if (pathname === '/animestore/tp_pc') {
    presenceData.details = 'ホーム'
    presence.setActivity(presenceData)
  }
  else if (pathname === '/animestore/ci_pc') {
    const params = new URLSearchParams(location.search)

    if (params.has('workId') && params.has('partId')) {
      presenceData.details = document.querySelector('.headerText')?.textContent?.trim()
      const number = document.querySelector('.episodeTitle > .number')?.textContent?.trim()
      const title = document.querySelector('.episodeTitle > .title')?.textContent?.trim()
      presenceData.state = [number, title].filter(Boolean).join(' / ')
      presenceData.detailsUrl = `https://animestore.docomo.ne.jp/animestore/ci_pc?workId=${params.get('workId')}`
      presenceData.stateUrl = location.href
      presence.setActivity(presenceData)
    }
    else if (params.has('workId')) {
      presenceData.details = document.querySelector('.titleWrap > h1')?.textContent?.trim()
      presenceData.detailsUrl = location.href
      presence.setActivity(presenceData)
    }
    else {
      presence.clearActivity()
    }
  }
  else if (/^\/animestore\/CF\/.*/.test(pathname)) {
    presenceData.details = document.querySelector('#breadCrumb_b > a > span')?.textContent?.trim()
    presenceData.detailsUrl = location.href
    presence.setActivity(presenceData)
  }
  else if (/^\/animestore\/CP\/.*/.test(pathname)) {
    presenceData.details = document.querySelector('#breadCrumb_c > a > span')?.textContent?.trim()
    presenceData.detailsUrl = location.href
    presence.setActivity(presenceData)
  }
  else if (/^\/animestore\/mpa?_/.test(pathname)) {
    presenceData.details = 'マイページ'
    presence.setActivity(presenceData)
  }
  else {
    presenceData.details = 'ページを閲覧中'
    presence.setActivity(presenceData)
  }
})
