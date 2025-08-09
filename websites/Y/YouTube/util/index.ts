import { timestampFromFormat } from 'premid'

export const presence = new Presence({
  clientId: '463097721130188830',
})

export function truncateAfter(str: string, pattern: string): string {
  return str.slice(0, str.indexOf(pattern))
}

export interface Resolver {
  isActive: () => boolean
  getTitle: () => string | undefined
  getUploader: () => string | undefined
  getChannelURL: () => string | undefined
  getVideoID: () => string | undefined
  isMusic: () => boolean
}

const stringMap = {
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
  ad: 'youtube.ad',
  search: 'general.searchFor',
  browsingTypeVideos: 'youtube.browsingTypeVideos',
  browseShorts: 'youtube.browsingShorts',
  browsingVid: 'youtube.browsingVideos',
  browsingPlayl: 'youtube.browsingPlaylists',
  viewCPost: 'youtube.viewingCommunityPost',
  ofChannel: 'youtube.ofChannel',
  readChannel: 'youtube.readingChannel',
  searchChannel: 'youtube.searchChannel',
  trending: 'youtube.trending',
  browsingThrough: 'youtube.browsingThrough',
  subscriptions: 'youtube.subscriptions',
  library: 'youtube.library',
  history: 'youtube.history',
  purchases: 'youtube.purchases',
  reports: 'youtube.reportHistory',
  upload: 'youtube.upload',
  viewChannel: 'general.viewChannel',
  viewAllPlayL: 'youtube.viewAllPlaylist',
  viewEvent: 'youtube.viewLiveEvents',
  viewLiveDash: 'youtube.viewLiveDashboard',
  viewAudio: 'youtube.viewAudioLibrary',
  studioVid: 'youtube.studio.viewContent',
  studioEdit: 'youtube.studio.editVideo',
  studioAnaly: 'youtube.studio.videoAnalytics',
  studioComments: 'youtube.studio.videoComments',
  studioTranslate: 'youtube.studio.videoTranslations',
  studioTheir: 'youtube.studio.viewTheir',
  studioCAnaly: 'youtube.studio.channelAnalytics',
  studioCComments: 'youtube.studio.channelComments',
  studioCTranslate: 'youtube.studio.channelTranslations',
  studioArtist: 'youtube.studio.artistPage',
  studioDash: 'youtube.studio.dashboard',
  viewPlaylist: 'general.viewPlaylist',
  readAbout: 'general.readingAbout',
  viewAccount: 'general.viewAccount',
  viewHome: 'general.viewHome',
  watchVid: 'general.watchingVid',
  watchLive: 'general.watchingLive',
  browsing: 'general.browsing',
  searchSomething: 'general.searchSomething',
  watchStreamButton: 'general.buttonWatchStream',
  watchVideoButton: 'general.buttonWatchVideo',
  viewChannelButton: 'general.buttonViewChannel',
  perVideoPrivacyToolTip1: 'youtube.perVideoPrivacy.tooltip.1',
  perVideoPrivacyToolTip2: 'youtube.perVideoPrivacy.tooltip.2',
}

// eslint-disable-next-line import/no-mutable-exports
export let strings: typeof stringMap

let oldLang: string | null = null
let currentTargetLang: string | null = null
let fetchingStrings = false
let stringFetchTimeout: number | null = null

function fetchStrings() {
  if (oldLang === currentTargetLang && strings)
    return
  if (fetchingStrings)
    return
  const targetLang = currentTargetLang
  fetchingStrings = true
  stringFetchTimeout = setTimeout(() => {
    presence.error(`Failed to fetch strings for ${targetLang}.`)
    fetchingStrings = false
  }, 5e3)
  presence.info(`Fetching strings for ${targetLang}.`)
  presence
    .getStrings(stringMap)
    .then((result) => {
      if (targetLang !== currentTargetLang)
        return
      if (stringFetchTimeout)
        clearTimeout(stringFetchTimeout)
      strings = result
      fetchingStrings = false
      oldLang = targetLang
      presence.info(`Fetched strings for ${targetLang}.`)
    })
    .catch(() => null)
}

setInterval(fetchStrings, 3000)
fetchStrings()

/**
 * Sets the current language to fetch strings for and returns whether any strings are loaded.
 */
export function checkStringLanguage(lang: string): boolean {
  currentTargetLang = lang
  return !!strings
}

const settingsFetchStatus: Record<string, number> = {}
const cachedSettings: Record<string, unknown> = {}

function startSettingGetter(setting: string) {
  if (!settingsFetchStatus[setting]) {
    let success = false
    settingsFetchStatus[setting] = setTimeout(() => {
      if (!success)
        presence.error(`Failed to fetch setting '${setting}' in time.`)
      delete settingsFetchStatus[setting]
    }, 2000)
    presence
      .getSetting(setting)
      .then((result) => {
        cachedSettings[setting] = result
        success = true
      })
      .catch(() => null)
  }
}

export function getSetting<E extends string | boolean | number>(
  setting: string,
  fallback: E | null = null,
): E {
  startSettingGetter(setting)
  return (cachedSettings[setting] as E) ?? fallback
}

let generatedId: string
let generatedImage: string
export async function getThumbnail(videoId: string): Promise<string> {
  if (generatedId === videoId)
    return generatedImage
  return new Promise((resolve) => {
    const img = new Image()
    const wh = 320
    img.crossOrigin = 'anonymous'
    img.src = `https://i3.ytimg.com/vi/${videoId}/mqdefault.jpg`

    img.onload = () => {
      let newWidth: number
      let newHeight: number
      let offsetX: number
      let offsetY: number

      if (img.width > img.height) {
        newWidth = wh
        newHeight = (wh / img.width) * img.height
        offsetX = 0
        offsetY = (wh - newHeight) / 2
      }
      else {
        newHeight = wh
        newWidth = (wh / img.height) * img.width
        offsetX = (wh - newWidth) / 2
        offsetY = 0
      }
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = wh
      tempCanvas.height = wh

      tempCanvas
        .getContext('2d')
        ?.drawImage(img, offsetX, offsetY, newWidth, newHeight)

      generatedId = videoId
      generatedImage = tempCanvas.toDataURL('image/png')
      resolve(generatedImage)
    }
    img.onerror = () => {
      resolve(`https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg`)
    }
  })
}

const desktopSelectors = {
  searchInput: '#search-input > div > div:nth-child(2) > input,#search-input > input',
  userName: '#author-text.ytd-backstage-post-renderer',
  userName2: '#text.ytd-channel-name',
  userTab: '[class="style-scope ytd-tabbed-page-header"] [aria-selected="true"]',
  userVideoTab: '[class="style-scope ytd-feed-filter-chip-bar-renderer iron-selected"]',
  postThumbnail: '#post #main img',
  postChannelImage: '#post img',
  postAuthor: '#author-text',
  channelImage: '.yt-spec-avatar-shape img',
  playlistTitle: '#text-displayed,ytd-playlist-header-renderer yt-dynamic-sizing-formatted-string.ytd-playlist-header-renderer,#title > yt-formatted-string > a',
  videoPlaylistTitle: '#content #header-description > h3:nth-child(1) > yt-formatted-string > a',
  videoChannelImage: '#avatar.ytd-video-owner-renderer > img',
  videoLive: '.ytp-live',
  privacyParentBox: '.ytp-chrome-controls .ytp-right-controls',
  chapterTitle: '.ytp-chapter-title-content',
}
const mobileSelectors: Record<keyof typeof desktopSelectors, string> = {
  searchInput: '.yt-searchbox-input',
  userName: 'h1',
  userName2: 'h1',
  userTab: '[class*=tab-selected]',
  userVideoTab: '.selected[class*=chip]',
  postThumbnail: 'ytm-backstage-post-renderer ytm-backstage-image-renderer img',
  postChannelImage: 'ytm-backstage-post-renderer yt-post-header img',
  postAuthor: '.ytPostHeaderHostAuthorText',
  channelImage: 'yt-page-header-view-model [class*=yt-spec-avatar-shape] img',
  playlistTitle: '#playlist-title',
  videoPlaylistTitle: '.playlist-panel-list-title',
  videoChannelImage: '[class*=owner-icon-and-title] .ytProfileIconImage',
  videoLive: '.ytwPlayerTimeDisplayContentLiveDot',
  privacyParentBox: '[class*=video-action-bar-actions]',
  chapterTitle: '.ytwPlayerTimeDisplayTimeMacro',
}

export function getQuerySelectors(
  isMobile: boolean,
): Record<keyof typeof desktopSelectors, string> {
  return isMobile ? mobileSelectors : desktopSelectors
}

export function getMobileChapter(videoTime: number): string | null {
  const crawlerChapterData = document.querySelector<HTMLSpanElement>('.crawler-full-description > span')?.children
  if (!crawlerChapterData) {
    return null
  }
  let isChapterSection = false
  let isExpectingChapterTimestamp = true
  let currentChapterTitle = ''
  for (let i = 0; i < crawlerChapterData.length; i++) {
    const item = crawlerChapterData[i]!
    if (item.textContent?.trim() === 'CHAPTERS:') {
      isChapterSection = true
      continue
    }
    if (isChapterSection) {
      if (isExpectingChapterTimestamp) {
        isExpectingChapterTimestamp = false
        const timestamp = item.textContent!.trim().split('\n')[0] ?? ''
        const timestampTime = timestampFromFormat(timestamp)
        if (timestampTime === 0 && !timestamp.startsWith('00:')) {
          break
        }

        // check if timestamp is after current time
        if (timestampTime > videoTime) {
          return currentChapterTitle
        }
      }
      else {
        isExpectingChapterTimestamp = true
        currentChapterTitle = item.textContent!.trim()
      }
    }
  }
  if (currentChapterTitle) {
    return currentChapterTitle // final chapter
  }
  return null
}
