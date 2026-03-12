import { Assets } from 'premid'

const presence = new Presence({
  clientId: '614388233886760972',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
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

if (document.location.pathname.includes('.html')) {
  presence.on('iFrameData', (inc: unknown) => {
    const data = inc as IFrameData
    if (data.iframeVideo.dur) {
      ({
        iFrameVideo,
        paused,
        currTime: currentTime,
        dur: duration,
      } = data.iframeVideo)
    }
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Kshow123/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (
    document.location.pathname.includes('.html')
    && document.location.pathname.includes('/pages/')
  ) {
    presenceData.details = 'Reading the FAQs'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('.html')) {
    if (iFrameVideo === true && !Number.isNaN(duration)) {
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused
        ? (await strings).pause
        : (await strings).play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(Math.floor(currentTime), Math.floor(duration))

      const views = document.querySelector(
        '#player > div.alert.alert-info.hidden-xs > div.media > div > p:nth-child(7)',
      )
      presenceData.details = document.querySelector(
        '#player > div.alert.alert-info.hidden-xs > div.media > div > a > h1',
      )?.textContent

      const air = document.querySelector(
        '#player > div.alert.alert-info.hidden-xs > div.media > div > p:nth-child(9)',
      )
      const air2 = document.querySelector(
        '#player > div.alert.alert-info.hidden-xs > div.media > div > p:nth-child(8)',
      )

      if (air?.textContent && air.textContent.includes('Air on:')) {
        presenceData.state = `${views?.textContent?.replace(
          'Status: ',
          '',
        )}, ${air.textContent.replace('Air', 'Aired')}`
      }
      else if (air2?.textContent && air2.textContent.includes('Air on:')) {
        presenceData.state = `${views?.textContent?.replace(
          'Status: ',
          '',
        )}, ${air2.textContent.replace('Air', 'Aired')}`
      }
      else {
        presenceData.state = views?.textContent
      }

      if (paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else if (iFrameVideo === null && Number.isNaN(duration)) {
      presenceData.details = 'Looking at: '
      presenceData.state = document.querySelector(
        '#player > div.alert.alert-info.hidden-xs > div.media > div > a > h1',
      )?.textContent
      presenceData.smallImageKey = Assets.Reading
    }
  }
  else {
    switch (document.location.pathname) {
      case '/': {
        presenceData.details = 'Browsing through'
        presenceData.state = 'the main page'
        presenceData.smallImageKey = Assets.Reading

        break
      }
      case '/show/latest/': {
        presenceData.details = 'Browsing through'
        presenceData.state = 'the latest shows'
        presenceData.smallImageKey = Assets.Reading

        break
      }
      case '/show/popular/': {
        presenceData.details = 'Browsing through'
        presenceData.state = 'the most popular shows'
        presenceData.smallImageKey = Assets.Reading

        break
      }
      case '/show/rated/': {
        presenceData.details = 'Browsing through'
        presenceData.state = 'the highest rated shows'
        presenceData.smallImageKey = Assets.Reading

        break
      }
      case '/show/': {
        presenceData.details = 'Browsing through'
        presenceData.state = 'a list of all shows'
        presenceData.smallImageKey = Assets.Reading

        break
      }
      default:
        if (document.location.pathname.includes('/show/')) {
          presenceData.details = 'Browsing through all episodes of:'
          presenceData.state = document.querySelector(
            '#info > div.media > div > h1 > a',
          )?.textContent
          presenceData.smallImageKey = Assets.Reading

          presence.setActivity(presenceData)
        }
        else if (document.location.pathname.includes('/search/')) {
          presenceData.details = 'Searching for:'
          presenceData.state = document.querySelector(
            '#featured > div.page-header > h3',
          )?.textContent
          presenceData.smallImageKey = Assets.Search
        }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
