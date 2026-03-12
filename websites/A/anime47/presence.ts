import { Assets } from 'premid'

const presence = new Presence({
  clientId: '640990409224486971',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/anime47/assets/logo.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
let title: string
let iFrameVideo: boolean
let currentTime: number
let duration: number
let paused: boolean

interface IFrameData {
  iframeVideo: {
    dur: number
    iFrameVideo: boolean
    paused: boolean
    currTime: number
  }
}

presence.on('iFrameData', (data: unknown) => {
  const data2 = data as IFrameData
  if (data2.iframeVideo.dur) {
    ({
      iFrameVideo,
      paused,
      currTime: currentTime,
      dur: duration,
    } = data2.iframeVideo)
  }
})

presence.on('UpdateData', async () => {
  const [startTimestamp, endTimestamp] = presence.getTimestamps(
    Math.floor(currentTime),
    Math.floor(duration),
  )
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (
    document.querySelector(
      'body > div.container > div:nth-child(3) > div > div.movie-info > div > div.block-wrapper.page-single > div > div.block-movie-info.movie-info-box > div > div.col-6.movie-detail > h1 > span.title-1',
    )
  ) {
    presenceData.details = 'Đang xem:'
    presenceData.state = document.querySelector(
      'body > div.container > div:nth-child(3) > div > div.movie-info > div > div.block-wrapper.page-single > div > div.block-movie-info.movie-info-box > div > div.col-6.movie-detail > h1 > span.title-1',
    )?.textContent ?? ''
    presenceData.smallImageKey = Assets.Reading
  }
  else if (
    document.querySelector(
      'body > div.container > ol > li:nth-child(5) > a > span',
    )
  ) {
    if (iFrameVideo === true && !Number.isNaN(duration)) {
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused
        ? (await strings).pause
        : (await strings).play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = [
        startTimestamp,
        endTimestamp,
      ];

      [presenceData.details, presenceData.state] = document
        .querySelector('head > title')
        ?.textContent
        ?.split('- ') ?? ['', '']

      if (paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else if (!iFrameVideo && Number.isNaN(duration)) {
      presenceData.details = 'Đang xem: '
      title = document.querySelector('head > title')?.textContent ?? ''

      presenceData.state = title
      presenceData.smallImageKey = Assets.Reading
    }
  }
  else if (document.location.pathname === '/') {
    presenceData.details = 'Đang xem trang chủ'
  }
  else if (document.URL.includes('/the-loai/')) {
    presenceData.details = 'Đang xem danh mục:'
    presenceData.state = document
      ?.querySelector(
        'body > div.container > div:nth-child(5) > div > div.movie-list-index.home-v2 > h1 > span',
      )
      ?.textContent
      ?.split(':')[1]
      ?.replace(' - Anime Vietsub Online', '') ?? ''
  }
  else {
    presenceData.details = 'Đang xem:'
    presenceData.state = document.querySelector('head > title')?.textContent ?? ''
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
