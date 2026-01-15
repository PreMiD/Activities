import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia, timestampFromFormat } from 'premid'

const presence = new Presence({ clientId: '639591760791732224' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const urlpath = document.location.pathname.split('/')

enum CustomAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/bilibili/assets/logo.png',
}

let uploader: HTMLElement | null,
  uploaderName: string,
  uploaderLink: string,
  title: HTMLElement | null,
  iFrameTitle: string,
  iFrameRoomOwnerName: string,
  videoPaused: boolean,
  currentTime: number,
  duration: number,
  timestamps: number[],
  isMusicVideo: boolean | undefined,
  vid: string | undefined

presence.on('iFrameData', (data: any) => {
  iFrameTitle = data.details
  iFrameRoomOwnerName = data.state
})

presence.on('UpdateData', async () => {
  const [privacy, showCover] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('cover'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: privacy || !showCover
      ? CustomAssets.Logo
      : navigator.mediaSession.metadata?.artwork[0]?.src
        ?? CustomAssets.Logo,
    type: ActivityType.Watching,
  }
  const strings = await presence.getStrings({
    watchingVideo: 'general.watchingVid',
    watchingPlaylist: 'bilibili.watchingPlaylist',
    watchingEpisode: 'general.viewEpisode',
    readingAPost: 'general.readingAPost',
    browsingMyFeed: 'bilibili.browsingMyFeed',
    viewingMessages: 'bilibili.viewingMessages',
    viewingAnUser: 'general.viewAnUser',
    viewingUserSpace: 'general.viewUser',
    watchingStream: 'bilibili.watchingStream',
    searchingFor: 'bilibili.searchingFor',
    watchVideo: 'general.buttonWatchVideo',
    viewChannel: 'general.buttonViewChannel',
    viewPlaylist: 'general.buttonViewPlaylist',
    viewEpisode: 'general.buttonViewEpisode',
    watchStream: 'general.buttonWatchStream',
    viewingTheHomepage: 'bilibili.viewingTheHomepage',
    multiUploaderName: 'bilibili.multiUploaderName',
    browsingSearchCategory: 'bilibili.browsingSearchCategory',
    articleTypePost: 'bilibili.articleTypePost',
    articleTypeColumn: 'bilibili.articleTypeColumn',
    viewingArticle: 'bilibili.viewingArticle',
    searchingForSomething: 'bilibili.searchingForSomething',
  })

  async function internalGetTimestamps() {
    let video = document.querySelector<HTMLVideoElement>('bpx-player-container')
    if (!video) {
      video = document.querySelector<HTMLVideoElement>('video')!
      videoPaused = video.paused
      timestamps = getTimestampsFromMedia(video)
    }
    else {
      videoPaused = document.querySelector('.bpx-state-paused') === null
      currentTime = timestampFromFormat(
        document.querySelector('.bpx-player-ctrl-time-current')?.textContent ?? '',
      )
      duration = timestampFromFormat(
        document.querySelector('.bpx-player-ctrl-time-duration')?.textContent ?? '',
      )
      timestamps = getTimestamps(currentTime, duration)
    }

    [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps

    presenceData.smallImageKey = videoPaused ? Assets.Pause : Assets.Play

    if (videoPaused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }

  async function setVideoStatus() {
    if (privacy) {
      presenceData.details = strings.watchingVideo
      return
    }

    internalGetTimestamps()

    if (document.querySelector('div.membersinfo-normal')) {
      uploader = document.querySelector('.staff-name')

      uploaderName = strings.multiUploaderName
        .replace('{MainUploaderName}', uploader?.textContent?.trim() ?? '')
        .replace('{RemainingNumberOfPersonnel}', String(Number.parseInt(
          document
            .querySelector('.staff-amt')
            ?.textContent
            ?.trim()
            ?.replaceAll('人', '') ?? '',
        ) - 1))
    }
    else {
      uploader = document.querySelector('.up-name')
      // "\n      <USERNAME>\n      " -> "<USERNAME>"
      uploaderName = uploader?.textContent?.trim() ?? ''
    }

    uploaderLink = uploader?.getAttribute('href') ?? ''
    title = document.querySelector('.video-title')
    const newVid = document.location.href.match(/BV[^&]{10}|(?<=av)\d+/)?.[0]
    if (vid !== newVid) {
      vid = newVid
      const idType = vid?.startsWith('BV') ? 'bvid' : 'aid'
      const response = await (fetch(
        `https://api.bilibili.com/x/web-interface/view?${idType}=${vid}`,
      ).then(e => e.json()))
      const tagNames = (response?.data?.tname ?? '') + (response?.data?.tname_v2 ?? '')
      isMusicVideo = /音乐|翻唱|MV|VOCALOID|电台/.test(tagNames)
    }

    presenceData.type = isMusicVideo ? ActivityType.Listening : ActivityType.Watching
    presenceData.name = uploaderName
    presenceData.state = null
    presenceData.details = title?.getAttribute('title')
    presenceData.buttons = [
      {
        label: strings.watchVideo,
        url: `https://www.bilibili.com/video/${urlpath[2]}`,
      },
      {
        label: strings.viewChannel,
        url: `https:${uploaderLink}`,
      },
    ]
  }
  switch (document.location.hostname) {
    case 'www.bilibili.com': {
      switch (urlpath[1]) {
        case 'video': {
          setVideoStatus()
          break
        }
        case 'opus': {
          if (privacy) {
            presenceData.details = strings.readingAPost
            break
          }
          const type
            = document.querySelector('.opus-module-title') === null
              ? strings.articleTypePost
              : strings.articleTypeColumn
          presenceData.details
            = type === strings.articleTypePost
              ? null
              : document.querySelector('.opus-module-title')?.textContent?.trim()
          presenceData.state = strings.viewingArticle
            .replace('{UserName}', document
              ?.querySelector('.opus-module-author__name')
              ?.textContent
              ?.trim() ?? '')
            ?.replace('{ArticleType}', type)
          presenceData.buttons = [
            {
              label: strings.watchVideo,
              url: `https://www.bilibili.com/opus/${urlpath[2]}`,
            },
          ]
          presenceData.startTimestamp = browsingTimestamp
          const uploaderAvatar = document.querySelector('.opus-module-author picture img')
          if (uploaderAvatar instanceof HTMLImageElement) {
            presenceData.largeImageKey = uploaderAvatar.src
          }
          break
        }
        case 'list': {
          if (privacy) {
            presenceData.details = strings.watchingPlaylist
            break
          }
          if (urlpath[2] === 'watchlater') {
            setVideoStatus()
            break
          }
          internalGetTimestamps()
          presenceData.details = document
            ?.querySelector('.list-title')
            ?.textContent
            ?.trim()
          presenceData.state = document
            ?.querySelector('.video-title')
            ?.textContent
            ?.trim()
          presenceData.buttons = [
            {
              label: strings.viewPlaylist,
              url: `https://www.bilibili.com/list/${urlpath[2]}`,
            },
            {
              label: strings.watchVideo,
              url: `https:${document
                ?.querySelector('.video-title-href')
                ?.getAttribute('href')}`,
            },
          ]
          break
        }
        case 'bangumi': {
          if (privacy) {
            presenceData.details = strings.watchingEpisode
            break
          }
          internalGetTimestamps()
          presenceData.details = document
            ?.querySelector('.mediainfo_mediaTitle__Zyiqh')
            ?.textContent
            ?.trim()
          presenceData.state = `${strings.watchingEpisode}: ${document
            ?.querySelector('.numberListItem_select__WgCVr')
            ?.getAttribute('title')
            ?.trim()}`
          presenceData.buttons = [
            {
              label: strings.viewEpisode,
              url: `https://www.bilibili.com/bangumi/play/${urlpath[3]}`,
            },
          ]
          break
        }
        default: {
          presenceData.startTimestamp = browsingTimestamp
          presenceData.details = strings.viewingTheHomepage
          break
        }
      }
      break
    }
    case 'space.bilibili.com': {
      if (privacy) {
        presenceData.details = strings.viewingAnUser
        break
      }
      uploader = document.querySelector('.nickname')
      presenceData.details = strings.viewingUserSpace
      presenceData.state = `${uploader?.textContent} | UID:${urlpath[1]}`
      presenceData.buttons = [
        {
          label: strings.viewChannel,
          url: `https://space.bilibili.com/${urlpath[1]}`,
        },
      ]
      const avatarImage = document.querySelector('.avatar img')
      if (avatarImage instanceof HTMLImageElement) {
        presenceData.largeImageKey = avatarImage.src
      }
      break
    }
    case 't.bilibili.com': {
      presenceData.details = strings.browsingMyFeed
      presenceData.startTimestamp = browsingTimestamp
      break
    }
    case 'message.bilibili.com': {
      presenceData.details = strings.viewingMessages
      presenceData.startTimestamp = browsingTimestamp
      break
    }
    case 'live.bilibili.com': {
      if (privacy) {
        presenceData.details = strings.watchingStream
        break
      }
      const presenceDetails = document.querySelector('.small-title') === null
        ? presenceData.details = document
          .querySelector('.smaller-title')
          ?.textContent
          ?.trim()
        : presenceData.details = document
          .querySelector('.small-title')
          ?.textContent
          ?.trim()
      const presenceState = document.querySelector('.room-owner-username')
        ?.textContent
        ?.trim()
      const isCompetition = presenceDetails === undefined && presenceState === undefined
      if (isCompetition === true) {
        if (iFrameTitle === undefined || iFrameRoomOwnerName === undefined) {
          return
        }
        presenceData.details = iFrameTitle
        presenceData.state = iFrameRoomOwnerName
      }
      else {
        presenceData.details = presenceDetails
        presenceData.state = presenceState
      }
      presenceData.buttons = [
        {
          label: strings.watchStream,
          url: `https://live.bilibili.com/${urlpath[1]}`,
        },
      ]
      break
    }
    case 'search.bilibili.com': {
      if (privacy) {
        presenceData.details = strings.searchingForSomething
        break
      }
      presenceData.details = strings.searchingFor
        .replace('{Keyword}', document
          .querySelector('.search-input-el')
          ?.getAttribute('value') ?? '')
      presenceData.state = strings.browsingSearchCategory
        .replace('{CategoryName}', document
          .querySelector('.vui_tabs--nav-item-active')
          ?.textContent ?? '')

      presenceData.startTimestamp = browsingTimestamp
      break
    }
  }

  presence.setActivity(presenceData)
})
