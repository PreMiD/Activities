import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1209858023279820931',
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
      readingChannel: 'general.readingChannel',
      searchSomething: 'general.searchSomething',
      viewAccount: 'general.viewAccount',
      viewHome: 'general.viewHome',
      viewPage: 'general.viewPage',
      viewSeries: 'general.viewSeries',
      watchingLive: 'general.watchingLive',
      watchingVid: 'general.watchingVid',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'ABEMA',
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/ABEMA/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const [buttons, newLang, privacy, showTimestamps, videoPic] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('videoPic'),
  ])
  const { pathname, href } = document.location
  const pageTitle = document.querySelector('.com-a-PageTitle')?.textContent

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  switch (pathname) {
    case '/': {
      presenceData.details = strings.viewHome
      break
    }
    case '/mylist':
    case '/viewing-history':
    case '/purchased/payperview': {
      presenceData.details = strings.viewPage
      presenceData.state = pageTitle
      break
    }
    case '/account':
    case '/gifts':
    case '/coupon-code/registration':
    case '/mailnotify':
    case '/subscription/status': {
      presenceData.details = strings.viewAccount
      break
    }
    case '/timetable': {
      presenceData.details = strings.viewPage
      presenceData.state = document.querySelector(
        'a[href=\'/timetable\'] > div > span > span',
      )?.textContent
      break
    }
    default:
      if (pathname.includes('/now-on-air')) {
        if (privacy) {
          presenceData.details = strings.watchingLive
        }
        else {
          if (videoPic) {
            presenceData.largeImageKey = document
              .querySelector<HTMLImageElement>(
                '.com-tv-LinearChannelListItem.com-tv-LinearChannelListItem--active > div > a > div > div > div > img',
              )
              ?.src
              .replace(/\.jpg.*$/, '.jpg')
          }
          presenceData.details = document.querySelector<HTMLImageElement>(
            '.com-tv-TVScreenPoster__channel-logo-wrapper img',
          )?.alt
          presenceData.state = document.querySelector(
            '.com-tv-LinearFooter__feed-super-text',
          )?.textContent
          presenceData.buttons = [
            { label: strings.buttonWatchStream, url: href },
          ]
          presenceData.smallImageKey = Assets.Live
          presenceData.smallImageText = strings.live
        }
      }
      else if (pathname.includes('/video/episode')) {
        if (privacy) {
          presenceData.details = strings.watchingVid
        }
        else {
          if (videoPic) {
            presenceData.largeImageKey = `https://image.p-c2-x.abema-tv.com/image/series/${
              pathname.split('/')[3]?.split('_')[0]
            }/thumb.png`
          }
          presenceData.details = document.querySelector(
            '.com-video-EpisodeTitle__series-info',
          )?.textContent
          presenceData.state = document.querySelector(
            '.com-video-EpisodeTitle__episode-title',
          )?.textContent
          const { duration, currentTime, paused } = document.querySelector<HTMLVideoElement>('video')!
          delete presenceData.startTimestamp
          if (!paused) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(currentTime, duration)
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
      else if (pathname.includes('/video/genre')) {
        presenceData.details = strings.viewPage
        if (!privacy)
          presenceData.state = pageTitle
      }
      else if (pathname.includes('/video/title')) {
        presenceData.details = strings.viewSeries
        if (!privacy) {
          if (videoPic) {
            presenceData.largeImageKey = document
              .querySelector<HTMLImageElement>('.com-m-PortraitThumbnail__img')
              ?.src
              .replace(/\.png.*$/, '.png')
          }
          presenceData.state = document.querySelector(
            '.com-video-TitleSection__title',
          )?.textContent
        }
      }
      else if (pathname.includes('/timetable/channels')) {
        presenceData.details = strings.readingChannel
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
