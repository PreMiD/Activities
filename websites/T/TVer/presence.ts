import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1206601150607134780',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
async function getStrings() {
  return presence.getStrings(
    {
      buttonWatchStream: 'general.buttonWatchStream',
      buttonWatchVideo: 'general.buttonWatchVideo',
      live: 'general.live',
      pause: 'general.paused',
      paused: 'general.paused',
      play: 'general.playing',
      playing: 'general.playing',
      readingArticle: 'general.readingArticle',
      search: 'general.search',
      searchFor: 'general.searchFor',
      searchSomething: 'general.searchSomething',
      upload: 'youtube.upload',
      viewHome: 'general.viewHome',
      viewList: 'general.viewList',
      viewSeries: 'general.viewSeries',
      waitingLive: 'general.waitingLive',
      waitingLiveThe: 'general.waitingLiveThe',
      watchingLive: 'general.watchingLive',
      watchingVid: 'general.watchingVid',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Tver',
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TVer/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const [
    buttons,
    liveDetail,
    liveState,
    newLang,
    privacy,
    showTimestamps,
    vidDetail,
    vidState,
    videoPic,
  ] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<string>('liveDetail'),
    presence.getSetting<string>('liveState'),
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<string>('vidDetail'),
    presence.getSetting<string>('vidState'),
    presence.getSetting<boolean>('videoPic'),
  ])
  const { pathname, href } = document.location
  const title = document.querySelector(
    '[class^=\'titles_container\'] h1',
  )?.textContent
  const seriesTitle = document.querySelector(
    '[class^=\'titles_container\'] h2',
  )?.textContent

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  switch (pathname) {
    case '/': {
      presenceData.details = strings.viewHome
      break
    }
    case '/mypage/fav':
    case '/mypage/later':
    case '/mypage/resume': {
      presenceData.details = document.querySelector(
        '[class*=\'mypage-page-main_selectedTab\']',
      )?.textContent
      break
    }
    default:
      if (pathname.includes('/live')) {
        const isScheduled = document.querySelector(
          '[class^=\'live-scheduled_host\']',
        )
        const tvStation = document.querySelector(
          '[class^=\'description_metaDetail\'] > span',
        )?.textContent
        if (privacy) {
          if (isScheduled)
            presenceData.details = strings.waitingLive
          else presenceData.details = strings.watchingLive
        }
        else {
          if (videoPic) {
            presenceData.largeImageKey = document
              .querySelector<HTMLImageElement>(
                '[class*=\'live_active\'] > div > img',
              )
              ?.src
              .replace(/(thumbnail\/live\/)[^/]+/, '$1small')
              .replace(/\.jpg.*$/, '.jpg')
          }
          if (isScheduled) {
            presenceData.details = strings.waitingLiveThe
          }
          else {
            presenceData.details = liveDetail
              .replace('%tvStation%', tvStation ?? '')
              .replace('%seriesTitle%', seriesTitle ?? '')
              .replace('%title%', title ?? '')
          }
          presenceData.state = liveState
            .replace('%tvStation%', tvStation ?? '')
            .replace('%seriesTitle%', seriesTitle ?? '')
            .replace('%title%', title ?? '')
          presenceData.buttons = [
            { label: strings.buttonWatchStream, url: href },
          ]
          if (
            !document.querySelector('[class^=\'live-finished_host\']')
            && !isScheduled
          ) {
            presenceData.smallImageKey = Assets.Live
            presenceData.smallImageText = strings.live
          }
        }
      }
      else if (pathname.includes('/episodes')) {
        if (privacy) {
          presenceData.details = strings.watchingVid
        }
        else {
          if (videoPic) {
            presenceData.largeImageKey = `https://statics.tver.jp/images/content/thumbnail/episode/small/${
              pathname.split('/')[2]
            }.jpg`
          }
          const tvStation = document.querySelector(
            '[class^=\'description_meta\'] > div:nth-child(1)',
          )?.textContent
          presenceData.details = vidDetail
            .replace('%tvStation%', tvStation ?? '')
            .replace('%seriesTitle%', seriesTitle ?? '')
            .replace('%title%', title ?? '')
          presenceData.state = vidState
            .replace('%tvStation%', tvStation ?? '')
            .replace('%seriesTitle%', seriesTitle ?? '')
            .replace('%title%', title ?? '')
          const { paused } = document.querySelector<HTMLVideoElement>('video')!
          if (!paused) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(
              document.querySelector<HTMLVideoElement>('video')!,
            )
          }
          presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
          presenceData.smallImageText = paused
            ? strings.paused
            : strings.playing
          presenceData.buttons = [
            { label: strings.buttonWatchVideo, url: href },
          ]
        }
      }
      else if (pathname.includes('/series')) {
        presenceData.details = strings.viewSeries
        if (!privacy) {
          presenceData.state = document.querySelector(
            '[class^=\'series-main_title\']',
          )?.textContent
        }
      }
      else if (pathname.includes('/specials')) {
        presenceData.details = strings.readingArticle
        if (!privacy) {
          presenceData.state = document.querySelector(
            '[class^=\'special-feature-page-main_title\']',
          )?.textContent
        }
      }
      else if (pathname.includes('/rankings/episode')) {
        presenceData.details = strings.viewList
        if (!privacy) {
          presenceData.state = document.querySelector(
            '[class^=\'select-tabs-switch-list_container\']',
          )?.textContent
        }
      }
      else if (pathname.includes('/search')) {
        presenceData.details = strings.searchSomething
      }
      else {
        presenceData.details = strings.viewHome
      }
  }

  if (!showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (!buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
