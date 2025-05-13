import type {
  Resolver,
} from './util/index.js'
import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'
import {
  checkStringLanguage,
  getMobileChapter,
  getQuerySelectors,
  getSetting,
  getThumbnail,
  presence,
  strings,
} from './util/index.js'
import { pvPrivacyUI } from './util/pvPrivacyUI.js'
import youtubeApiResolver from './video_sources/api.js'
import youtubeResolver from './video_sources/default.js'
import youtubeEmbedResolver from './video_sources/embed.js'
import youtubeMiniplayerResolver from './video_sources/miniplayer.js'
import youtubeMobileResolver from './video_sources/mobile_default.js'
import youtubeMobileShortsResolver from './video_sources/mobile_shorts.js'
import youtubeMoviesResolver from './video_sources/movies.js'
import youtubeOldResolver from './video_sources/old.js'
import youtubeShortsResolver from './video_sources/shorts.js'
import youtubeTVResolver from './video_sources/tv.js'

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum YouTubeAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Y/YouTube/assets/logo.png',
  Studio = 'https://cdn.rcd.gg/PreMiD/websites/Y/YouTube/assets/0.png',
  Shorts = 'https://cdn.rcd.gg/PreMiD/websites/Y/YouTube/assets/1.png',
}

enum LogoMode {
  YouTubeLogo = 0,
  Thumbnail = 1,
  Channel = 2,
}

enum ShowListening {
  Never = 0,
  WhenMusic = 1,
  Always = 2,
}

const nullResolver: Resolver = {
  isActive: () => true,
  getTitle: () => document.title,
  getUploader: () => '',
  getChannelURL: () => '',
  getVideoID: () => '',
  isMusic: () => false,
}

presence.on('UpdateData', async () => {
  const [
    newLang,
    privacy,
    privacyTtl,
    privacyButtonShown,
    time,
    vidDetail,
    vidState,
    channelPic,
    logo,
    buttons,
    hideHome,
    hidePaused,
    showListening,
  ] = [
    getSetting<string>('lang', 'en'),
    getSetting<boolean>('privacy', true),
    getSetting<number>('privacy-ttl', 1),
    getSetting<boolean>('privacy-shown', true),
    getSetting<boolean>('time', true),
    getSetting<string>('vidDetail', '%title%'),
    getSetting<string>('vidState', '%uploader%'),
    getSetting<boolean>('channelPic', false),
    getSetting<number>('largeImage', 0),
    getSetting<boolean>('buttons', true),
    getSetting<boolean>('hideHome', false),
    getSetting<boolean>('hidePaused', true),
    getSetting<number>('showListening', 0),
  ]
  const { pathname, hostname, search, href } = document.location
  const isMobile = hostname === 'm.youtube.com'
  const selectors = getQuerySelectors(isMobile)

  // Update strings if user selected another language.
  if (!checkStringLanguage(newLang))
    return

  // If there is a vid playing
  const video = Array.from(
    document.querySelectorAll<HTMLVideoElement>('.video-stream'),
  ).find(video => video.duration)

  if (video) {
    const { mediaSession } = navigator
    if (mediaSession.playbackState !== 'playing' && hidePaused)
      return presence.clearActivity()

    const resolver = [
      youtubeEmbedResolver,
      youtubeShortsResolver,
      youtubeOldResolver,
      youtubeTVResolver,
      youtubeResolver,
      youtubeMiniplayerResolver,
      youtubeMoviesResolver,
      youtubeMobileResolver,
      youtubeMobileShortsResolver,
      youtubeApiResolver,
      nullResolver,
    ].find(resolver => resolver.isActive())!
    const title = resolver.getTitle()!
    const uploaderName = resolver.getUploader()!

    let pfp: string | undefined

    const live = !!document.querySelector(selectors.videoLive)
    const isPlaylistLoop = document
      .querySelector('#playlist-actions .yt-icon-button#button')
      ?.getAttribute('aria-pressed') === 'true'
    const playlistTitle = document
      .querySelector(selectors.videoPlaylistTitle)
      ?.textContent
      ?.trim() ?? ''
    const playlistQueueElements = document.querySelectorAll<HTMLSpanElement>(
      '#content #publisher-container > div > yt-formatted-string > span',
    )
    let playlistQueue: string | undefined
    if (playlistTitle) {
      if (playlistQueueElements.length > 1) {
        playlistQueue = `${playlistQueueElements[0]?.textContent} / ${playlistQueueElements[2]?.textContent}`
      }
      else if (isMobile) {
        playlistQueue = document
          .querySelector(selectors.videoPlaylistTitle)
          ?.nextSibling
          ?.textContent
          ?.replace(/^ • /, '')
      }
      else {
        playlistQueue = document.querySelector<HTMLSpanElement>(
          '#content #publisher-container > div > span',
        )?.textContent ?? undefined
      }
    }

    let chapter = document.querySelector(selectors.chapterTitle)?.textContent
    if (isMobile && !chapter) {
      chapter = getMobileChapter(video.currentTime)
    }

    if (logo === LogoMode.Channel) {
      pfp = resolver === youtubeMiniplayerResolver
        ? ''
        : document
          .querySelector<HTMLImageElement>(selectors.videoChannelImage)
          ?.src
          .replace(/=s\d+/, '=s512')
    }
    const unlistedPathElement = document.querySelector<SVGPathElement>(
      'g#privacy_unlisted > path',
    )
    const unlistedBadgeElement = document.querySelector<SVGPathElement>(
      'h1.title+ytd-badge-supported-renderer path',
    )
    const unlistedVideo = unlistedPathElement
      && unlistedBadgeElement
      && unlistedPathElement?.getAttribute('d')
      === unlistedBadgeElement?.getAttribute('d')
    const videoId = resolver.getVideoID()!
    const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)
    const listening = showListening === ShowListening.Always
      || (showListening === ShowListening.WhenMusic && resolver.isMusic())
    const presenceData: PresenceData = {
      type: listening
        ? ActivityType.Listening
        : ActivityType.Watching,
      details: vidDetail
        .replace('%title%', title.trim())
        .replace('%uploader%', uploaderName.trim())
        .replace('%playlistTitle%', playlistTitle.trim())
        .replace('%playlistQueue%', playlistQueue?.trim() ?? '')
        .replace('%chapter%', chapter ?? ''),
      state: vidState
        .replace('%title%', title.trim())
        .replace('%uploader%', uploaderName.trim())
        .replace('%playlistTitle%', playlistTitle.trim())
        .replace('%playlistQueue%', playlistQueue?.trim() ?? '')
        .replace('%chapter%', chapter ?? ''),
      largeImageKey: unlistedVideo || logo === LogoMode.YouTubeLogo || pfp === ''
        ? YouTubeAssets.Logo
        : logo === LogoMode.Thumbnail
          ? await getThumbnail(videoId)
          : pfp,
      smallImageKey: video.paused
        ? Assets.Pause
        : video.loop
          ? Assets.RepeatOne
          : isPlaylistLoop
            ? Assets.Repeat
            : Assets.Play,
      smallImageText: video.paused
        ? strings.pause
        : video.loop
          ? 'On loop'
          : isPlaylistLoop
            ? 'Playlist on loop'
            : strings.play,
      startTimestamp,
      endTimestamp,
    }

    if (vidState.includes('{0}'))
      delete presenceData.state

    // Remove timestamps if paused or live
    if (video.paused || live) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp

      if (live) {
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = strings.live
      }
    }

    let perVideoPrivacy = privacy
    if (resolver === youtubeResolver || resolver === youtubeMobileResolver) {
      if (privacyButtonShown) {
        perVideoPrivacy = pvPrivacyUI(
          privacy,
          new URLSearchParams(search).get('v')!,
          privacyTtl,
        )
      }
      else {
        const enablePrivacyElement = document.querySelector('#pmdEnablePrivacy')

        if (enablePrivacyElement) {
          enablePrivacyElement.remove()
          document.querySelector('#pmdEnablePrivacyTooltip')?.remove()
        }
      }
    }

    // Update title to indicate when an ad is being played
    if (document.querySelector('.ytp-ad-player-overlay')) {
      presenceData.details = strings.ad
      delete presenceData.state
    }
    else if (perVideoPrivacy) {
      // defaults to privacy setting, but allows it to be overwritten
      if (live)
        presenceData.details = strings.watchLive
      else presenceData.details = strings.watchVid

      delete presenceData.state
      presenceData.largeImageKey = YouTubeAssets.Logo
      presenceData.startTimestamp = browsingTimestamp
      delete presenceData.endTimestamp
    }
    else if (buttons && !unlistedVideo) {
      presenceData.buttons = [
        {
          label: live ? strings.watchStreamButton : strings.watchVideoButton,
          url: href.includes('/watch?v=')
            ? href.split('&')[0]!
            : `https://www.youtube.com/watch?v=${videoId}`,
        },
        {
          label: strings.viewChannelButton,
          url: resolver.getChannelURL()!,
        },
      ]
    }
    if (!time) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (resolver === youtubeShortsResolver) {
      presenceData.largeImageKey = YouTubeAssets.Shorts
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? strings.pause : strings.play
    }

    if (!presenceData.details)
      presence.setActivity()
    else presence.setActivity(presenceData)
  }
  else if (
    hostname === 'www.youtube.com'
    || hostname === 'youtube.com'
    || hostname === 'm.youtube.com'
  ) {
    const presenceData: PresenceData = {
      largeImageKey: YouTubeAssets.Logo,
      startTimestamp: browsingTimestamp,
      type: ActivityType.Watching,
    }
    let searching = false

    switch (true) {
      case pathname === '/': {
        const child = document.querySelector(
          '[class="style-scope ytd-feed-filter-chip-bar-renderer iron-selected"]',
        ) ?? null // Select selected child
        if (
          child?.parentElement
          && Array.prototype.indexOf.call(child.parentElement.children, child) > 0
        ) {
          // Get index of child element from parent
          // if the current child index is bigger than 0 continue
          presenceData.details = strings.browsingTypeVideos.replace(
            '{0}',
            child?.textContent?.trim().toLowerCase() ?? '',
          )
        }
        else if (hideHome) {
          return presence.clearActivity()
        }
        else {
          presenceData.details = strings.viewHome
        }
        break
      }
      case pathname.includes('/results'): {
        searching = true

        presenceData.details = strings.search
        presenceData.state = document.querySelector<HTMLInputElement>(
          selectors.searchInput,
        )?.value
        presenceData.smallImageKey = Assets.Search
        break
      }
      case pathname.includes('/@'):
      case pathname.includes('/channel'):
      case pathname.includes('/c'):
      case pathname.includes('/user'): {
        const documentTitle = document.title.substring(
          0,
          document.title.lastIndexOf(' - YouTube'),
        )

        let user: string | undefined | null
        // Get channel name when viewing a community post
        if (
          documentTitle.includes(
            document.querySelector(selectors.userName)?.textContent?.trim() ?? '',
          )
        ) {
          user = document.querySelector(selectors.userName)?.textContent
        }
        // Get channel name when viewing a channel
        else if (
          documentTitle.includes(
            document.querySelector(selectors.userName2)?.textContent ?? '',
          )
          && document.querySelector(selectors.userName2)?.textContent
        ) {
          user = document.querySelector(selectors.userName2)?.textContent
        }
        // Get channel name from website's title
        else if (/\([^)]+\)/.test(documentTitle)) {
          user = documentTitle.replace(/\([^)]+\)/, '')
        }
        else {
          user = documentTitle
        }

        if (
          !user
          || user.replace(/\s+/g, '') === ''
          || user.replace(/\s+/g, '') === '\u200C'
        ) {
          user = 'null'
        }

        if (pathname.includes('/videos')) {
          presenceData.details = `${strings.browsingThrough} ${document
            .querySelector(selectors.userVideoTab)
            ?.textContent
            ?.trim()} ${document
            .querySelector(selectors.userTab)
            ?.textContent
            ?.trim()
            .toLowerCase()}`
          presenceData.state = `${strings.ofChannel} ${user}`
        }
        else if (pathname.includes('/shorts')) {
          presenceData.details = strings.browseShorts
          presenceData.state = `${strings.ofChannel} ${user}`
        }
        else if (pathname.includes('/playlists')) {
          presenceData.details = strings.browsingPlayl
          presenceData.state = `${strings.ofChannel} ${user}`
        }
        else if (pathname.includes('/community')) {
          presenceData.details = strings.viewCPost
          presenceData.state = `${strings.ofChannel} ${user}`
          presenceData.largeImageKey = logo === LogoMode.Thumbnail
            ? document.querySelector<HTMLImageElement>(
              selectors.postThumbnail,
            )?.src
            : logo === LogoMode.Channel
              ? document.querySelector<HTMLImageElement>(
                selectors.postChannelImage,
              )?.src
              : YouTubeAssets.Logo
        }
        else if (pathname.includes('/about')) {
          presenceData.details = strings.readChannel
          presenceData.state = user
          presenceData.smallImageKey = Assets.Reading
        }
        else if (pathname.includes('/search')) {
          searching = true

          presenceData.details = strings.searchChannel.replace('{0}', user)
          presenceData.state = new URLSearchParams(search).get('query')
          presenceData.smallImageKey = Assets.Search
        }
        else {
          presenceData.details = strings.viewChannel
          presenceData.state = user
        }
        if (channelPic) {
          const channelImg = (
            // Self channel
            document.querySelector<HTMLImageElement>(
              'yt-img-shadow.ytd-channel-avatar-editor > img',
            )
            ?? document.querySelector<HTMLImageElement>(
              '#avatar.ytd-c4-tabbed-header-renderer > img',
            )
            // When viewing a community post
            ?? document.querySelector<HTMLImageElement>(
              selectors.postChannelImage,
            )
            // When viewing a channel on the normal channel page
            ?? document.querySelector<HTMLImageElement>(selectors.channelImage)
          )?.src.replace(/=s\d+/, '=s512') ?? YouTubeAssets.Logo
          if (channelImg)
            presenceData.largeImageKey = channelImg
        }
        break
      }
      case pathname.includes('/post'): {
        presenceData.details = strings.viewCPost
        const selector = document.querySelector(selectors.postAuthor)
        if (selector)
          presenceData.state = `${strings.ofChannel} ${selector.textContent}`
        break
      }
      case pathname.includes('/feed/trending'): {
        presenceData.details = strings.trending
        break
      }
      case pathname.includes('/feed/subscriptions'): {
        presenceData.details = strings.browsingThrough
        presenceData.state = strings.subscriptions
        break
      }
      case pathname.includes('/feed/library'): {
        presenceData.details = strings.browsingThrough
        presenceData.state = strings.library
        break
      }
      case pathname.includes('/feed/history'): {
        presenceData.details = strings.browsingThrough
        presenceData.state = strings.history
        break
      }
      case pathname.includes('/feed/purchases'): {
        presenceData.details = strings.browsingThrough
        presenceData.state = strings.purchases
        break
      }
      case pathname.includes('/playlist'): {
        presenceData.details = strings.viewPlaylist
        presenceData.state = document
          .querySelector(selectors.playlistTitle)
          ?.textContent
          ?.trim()
        break
      }
      case pathname.includes('/premium'): {
        presenceData.details = strings.readAbout
        presenceData.state = 'Youtube Premium'
        presenceData.smallImageKey = Assets.Reading
        break
      }
      case pathname.includes('/gaming'): {
        presenceData.details = strings.browsingThrough
        presenceData.state = 'Youtube Gaming'
        presenceData.smallImageKey = Assets.Reading
        break
      }
      case pathname.includes('/account'): {
        presenceData.details = strings.viewAccount
        break
      }
      case pathname.includes('/reporthistory'): {
        presenceData.details = strings.reports
        break
      }
      case pathname.includes('/intl'): {
        presenceData.details = strings.readAbout
        presenceData.state = document.title.substring(
          0,
          document.title.lastIndexOf(' - YouTube'),
        )
        presenceData.smallImageKey = Assets.Reading
        break
      }
      case pathname.includes('/upload'): {
        presenceData.details = strings.upload
        presenceData.smallImageKey = Assets.Writing
        break
      }
      case pathname.includes('/view_all_playlists'): {
        presenceData.details = strings.viewAllPlayL
        break
      }
      case pathname.includes('/my_live_events'): {
        presenceData.details = strings.viewEvent
        break
      }
      case pathname.includes('/live_dashboard'): {
        presenceData.details = strings.viewLiveDash
        break
      }
      case pathname.includes('/audiolibrary'): {
        presenceData.details = strings.viewAudio
        break
      }
    }

    if (privacy) {
      if (searching) {
        presenceData.details = strings.searchSomething
        delete presenceData.state
      }
      else {
        presenceData.details = strings.browsing
        delete presenceData.state
        delete presenceData.smallImageKey
      }
    }

    if (!time) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (!presenceData.details)
      presence.setActivity()
    else presence.setActivity(presenceData)
  }
  else if (hostname === 'studio.youtube.com') {
    const presenceData: PresenceData = {
      largeImageKey: YouTubeAssets.Logo,
      smallImageKey: YouTubeAssets.Studio,
      smallImageText: 'Youtube Studio',
      startTimestamp: browsingTimestamp,
    }

    switch (true) {
      case pathname.includes('/videos'): {
        presenceData.details = strings.studioVid
        break
      }
      case pathname.includes('/video'): {
        const title = document.querySelector('#entity-name')
        if (pathname.includes('/edit')) {
          presenceData.details = strings.studioEdit
          presenceData.state = title?.textContent
        }
        else if (pathname.includes('/analytics')) {
          presenceData.details = strings.studioAnaly
          presenceData.state = title?.textContent
        }
        else if (pathname.includes('/comments')) {
          presenceData.details = strings.studioComments
          presenceData.state = title?.textContent
        }
        else if (pathname.includes('/translations')) {
          presenceData.details = strings.studioTranslate
          presenceData.state = title?.textContent
        }
        break
      }
      case pathname.includes('/analytics'): {
        presenceData.details = strings.studioTheir
        presenceData.state = strings.studioCAnaly
        break
      }
      case pathname.includes('/comments'): {
        presenceData.details = strings.studioTheir
        presenceData.state = strings.studioCComments
        break
      }
      case pathname.includes('/translations'): {
        presenceData.details = strings.studioTheir
        presenceData.state = strings.studioCTranslate
        break
      }
      case pathname.includes('/channel'): {
        presenceData.details = strings.studioDash
        break
      }
      case pathname.includes('/artist'): {
        presenceData.details = strings.studioTheir
        presenceData.state = strings.studioArtist
        break
      }
    }

    if (privacy) {
      presenceData.details = strings.browsing
      delete presenceData.state
      delete presenceData.smallImageKey
    }

    if (!time) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (!presenceData.details)
      presence.setActivity()
    else presence.setActivity(presenceData)
  }
})
