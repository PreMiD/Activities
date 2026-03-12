import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '809093093600133165',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let cached: {
  videoURL: string
  video: HTMLVideoElement
}

async function getStrings() {
  return presence.getStrings(
    {
      playing: 'general.playing',
      paused: 'general.paused',
      live: 'general.live',
      browse: 'general.browsing',
      forYou: 'tiktok.forYou',
      following: 'tiktok.following',
      buttonViewProfile: 'general.buttonViewProfile',
      viewProfile: 'general.viewProfile',
      viewAProfile: 'general.viewAProfile',
      viewTikTok: 'tiktok.viewing',
      buttonViewTikTok: 'tiktok.buttonViewTikTok',
      browseThrough: 'tiktok.browseThrough',
      watchingLive: 'general.watchingLive',
      readingADM: 'general.readingADM',
      exploringWithTag: 'tiktok.exploringWithTag',
      viewAPlaylist: 'general.viewAPlaylist',
      buttonWatchStream: 'general.buttonWatchStream',
    },

  )
}

function getVideo(video: HTMLVideoElement | null) {
  const videoURL = video?.src

  if (
    videoURL
    && (!cached?.videoURL || !cached?.video || cached?.videoURL !== videoURL)
  ) {
    cached = {
      videoURL,
      video,
    }
  }
  else if (!video && cached.video) {
    return cached.video
  }
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TikTok/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const [newLang, privacy, buttons, showProfileUsernames] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('show-profile-usernames'),
  ])
  const { pathname, hostname, href } = document.location
  const lang = document.querySelector('html')?.getAttribute('lang')
  const username = document.querySelector('[data-e2e="user-profile-nickname"]')
    ?.textContent
    ?? document.querySelector('[data-e2e="user-subtitle"]')?.textContent
    ?? document
      .querySelector('[data-e2e="browser-nickname"]')
      ?.querySelector('[class*="SpanNickName"]')
      ?.textContent
      ?? document.querySelector('[data-e2e="browser-nickname"]')?.firstElementChild?.textContent // Username
  const userid = document.querySelector('[data-e2e="user-profile-uid"]')?.textContent
    ?? document.querySelector('[data-e2e="user-title"]')?.textContent
    ?? document.querySelector('[data-e2e="browse-username"]')?.textContent // Userid (so @userid)
  const description = document.querySelector('[data-e2e="user-profile-live-title"]')
    ?.textContent
    ?? document.querySelector('[data-e2e="browse-video-desc"]')?.textContent // Video/livestream description

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  switch (true) {
    case pathname === '/following':
    case pathname.includes('foryou'):
    case pathname === '/':
    case pathname === `/${lang}`:
    case pathname === `/${lang}/`: {
      if (!privacy)
        delete presenceData.startTimestamp
      const videos = Array.from(document.querySelectorAll('video')).find(
        video => !video.paused,
      )
      let video: HTMLVideoElement | null | undefined
      if (videos) {
        video = videos
        getVideo(videos)
      }
      else {
        video = getVideo(null)
      }

      const baseEl = video?.closest(
        '[data-e2e="recommend-list-item-container"]',
      )
      const userId = baseEl?.querySelector('h3[data-e2e="video-author-uniqueid"]')
      const tiktokURL = `https://www.tiktok.com/@${userId?.textContent}/video/${
        video
          ?.closest('[class="tiktok-web-player no-controls"]')
          ?.getAttribute('id')
          ?.split('-')?.[2]
      }`
      const creatorURL = `https://${hostname}${
        userId?.parentElement?.getAttribute('href') ?? ''
      }/`
      const tiktokURLMatch = tiktokURL.match(
        /https:\/\/www\.tiktok\.com\/@.*\/video\/\d{19}/,
      )
      const creatorURLMatch = creatorURL.match(
        /http(s)?:\/\/(www\.)?tiktok\.com\/@([\w.]{0,23}\w)(?:\/\S*)?\//,
      )?.[0]
      const paused = video
        ?.closest('div[data-e2e="feed-video"]')
        ?.querySelector('[data-e2e="video-play"]')
        ?.getAttribute('aria-label')
        ?.toLowerCase() === 'pause'

      presenceData.details = privacy
        ? strings.browseThrough
        : userId
          && baseEl?.querySelector('[data-e2e="video-author-nickname"]')
            ?.textContent
          ? `${
            baseEl?.querySelector('[data-e2e="video-author-nickname"]')
              ?.textContent
          } (@${userId?.textContent})`
          : strings.browseThrough
      presenceData.state = baseEl?.querySelector(
        '[data-e2e="video-desc"]',
      )?.textContent
      if (tiktokURLMatch && creatorURLMatch) {
        presenceData.buttons = [
          { label: strings.buttonViewTikTok, url: tiktokURL },
          {
            label: strings.buttonViewProfile,
            url: creatorURL,
          },
        ]
      }
      else if (creatorURLMatch) {
        presenceData.buttons = [
          {
            label: strings.buttonViewProfile,
            url: creatorURL,
          },
        ]
      }
      else if (tiktokURLMatch) {
        presenceData.buttons = [
          { label: strings.buttonViewTikTok, url: tiktokURL },
        ]
      }

      if (!paused && video?.duration && video?.currentTime) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
      }
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? strings.paused : strings.playing

      break
    }
    case pathname.includes('/video/'): {
      if (!privacy)
        delete presenceData.startTimestamp
      const vidEl = document.querySelector('video')
      let video: {
        paused: boolean
        currentTime: number
        duration: number
      }
      if (!vidEl) {
        video = {
          paused: !!document.querySelector('[aria-label="Pause"]')
            || !!document.querySelector('[class*=\'DivPlayIconContainer\']'),
          currentTime: presence.timestampFromFormat(
            document
              .querySelector('[class*=\'DivSeekBarTimeContainer\']')
              ?.textContent
              ?.split('/')[0] ?? '',
          ),
          duration: presence.timestampFromFormat(
            document
              .querySelector('[class*=\'DivSeekBarTimeContainer\']')
              ?.textContent
              ?.split('/')[1] ?? '',
          ),
        }
      }
      else {
        video = {
          paused: vidEl?.paused,
          currentTime: vidEl.currentTime,
          duration: vidEl.duration,
        }
      }
      presenceData.details = privacy
        ? strings.browseThrough
        : `${username} (@${userid})`
      presenceData.state = description
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused
        ? strings.paused
        : strings.playing
      if (!video.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
      }
      presenceData.buttons = [
        { label: strings.buttonViewTikTok, url: href },
        {
          label: strings.buttonViewProfile,
          url: `https://www.tiktok.com/@${userid}`,
        },
      ]
      break
    }
    case pathname === '/live': {
      const videos = Array.from(document.querySelectorAll('video')).find(
        video => !video.paused,
      )
      let video: HTMLVideoElement | null | undefined
      if (videos) {
        video = videos
        getVideo(videos)
      }
      else {
        video = getVideo(null)
      }

      presenceData.details = privacy
        ? strings.watchingLive
        : `${strings.watchingLive} - ${
          video?.parentElement?.querySelector('[class*="SpanNickName"]')
            ?.textContent
        }`
      presenceData.state = video?.parentElement?.querySelectorAll(
        '[class="css-1g1mtx-DivDetailsLine eawfp3g1"]',
      )?.[1]?.textContent
      presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Live
      presenceData.smallImageText = video?.paused
        ? strings.paused
        : strings.live
      presenceData.buttons = [
        {
          label: strings.buttonWatchStream,
          url: `https://www.tiktok.com/${
            video?.parentElement?.querySelector('[class*="SpanNickName"]')
              ?.textContent
          }/live`,
        },
        {
          label: strings.buttonViewProfile,
          url: `https://www.tiktok.com/${
            video?.parentElement?.querySelector('[class*="SpanNickName"]')
              ?.textContent
          }`,
        },
      ]
      break
    }
    case pathname.includes('/live'): {
      const video = document.querySelector('video')
      presenceData.details = privacy
        ? strings.watchingLive
        : `${strings.watchingLive} - ${username} (@${userid})`
      presenceData.state = description
      presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Live
      presenceData.smallImageText = video?.paused
        ? strings.paused
        : strings.live
      presenceData.buttons = [
        { label: strings.buttonWatchStream, url: href },
        {
          label: strings.buttonViewProfile,
          url: href?.split('/live')?.[0] || '',
        },
      ]
      break
    }
    case pathname.includes('/@'): {
      const playlistMenu = document
        .querySelector('[class*="DivModalContainer eo04fh215"]')
        ?.querySelector('[class*="Title"]')
      presenceData.details = privacy || !showProfileUsernames
        ? strings.viewAProfile
        : `${strings.viewProfile} ${username} (@${userid})`
      if (showProfileUsernames) {
        presenceData.buttons = [
          { label: strings.buttonViewProfile, url: href },
        ]
      }

      presenceData.state = playlistMenu
        ? `${strings.viewAPlaylist} - ${playlistMenu?.textContent}`
        : document.querySelector('p[aria-selected="true"]')?.textContent

      break
    }
    case pathname.includes('/explore'): {
      presenceData.details = privacy
        ? strings.browseThrough
        : strings.exploringWithTag
      presenceData.state = document.querySelector(
        '.css-1hs87dt-ButtonCategoryItemContainer',
      )?.textContent
      break
    }
    case pathname.includes('/messages'): {
      presenceData.details = privacy
        ? strings.browseThrough
        : strings.readingADM
      break
    }
  }

  if ((!buttons || privacy) && presenceData.buttons)
    delete presenceData.buttons
  if (privacy && presenceData.state)
    delete presenceData.state
  if (privacy && presenceData.endTimestamp)
    delete presenceData.endTimestamp
  if (privacy && presenceData.smallImageKey)
    delete presenceData.smallImageKey

  presence.setActivity(presenceData)
})
