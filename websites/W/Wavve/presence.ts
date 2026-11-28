import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  // Replace with the Application ID of your own Discord application (named "Wavve")
  clientId: '1571883155588386826',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  // metadata.json 의 "logo" 와 같은 이미지 주소(i.imgur.com)를 넣어요.
  Logo = 'https://i.postimg.cc/W3ywPFxH/channels4-profile.jpg',
}

/**
 * 웨이브 재생 화면 구조. 실제 화면에서 확인한 값이에요.
 * 웨이브가 화면을 바꿔서 제목이 안 나오면 여기만 고치면 돼요.
 */
const SELECTORS = {
  video: 'video',
  // 에피소드 목록에서 지금 재생 중인 항목
  currentEpisode: '.vod-list.selected-list',
  // 그 항목 안의 에피소드 제목 / 회차("1회2022-07-29(금)")
  episodeName: '.title',
  episodeNumber: '.player-sub-title',
  // 영상 위쪽 제목 줄 ("빅마우스 2회"). 에피소드 목록이 닫혀 있어도 항상 있어요.
  topInfo: '.top-area-hd .text-info',
  // 플레이어의 숨은 포스터 이미지 (지금 재생 중인 영상의 이미지)
  poster: 'img.poster',
  // 클립 화면의 클립 카드 이미지 (alt 에 클립 제목이 들어 있어요)
  clipThumbnail: 'img.clip-thumbnail',
}

/** PreMiD 공식 공통 문구(general.*)를 사용자의 언어로 가져와요. 직접 번역을 만들 필요가 없어요. */
async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    search: 'general.searchSomething',
    watchingVid: 'general.watchingVid',
    watchingMovie: 'general.watchingMovie',
    watchingLive: 'general.watchingLive',
  })
}

type PlayerKind = 'vod' | 'movie' | 'live' | 'clip'

function getPlayerKind(pathname: string): PlayerKind | null {
  // 클립 영상은 /player/clip?contentid=... 화면에서 바로 재생돼요.
  if (pathname.includes('/player/clip'))
    return 'clip'
  // 실제 재생 화면 주소 예: /player/stream/vod?contentid=..., /player/stream/movie?movieid=...
  // (/player/vod?programid=... 는 프로그램 소개 페이지라서 재생 중으로 보지 않아요)
  if (!pathname.includes('/player/stream/'))
    return null
  if (pathname.endsWith('/movie') || pathname.includes('/movie'))
    return 'movie'
  if (pathname.endsWith('/live') || pathname.includes('/live'))
    return 'live'
  // 그 밖의 재생 화면은 회차가 있는 영상(vod)으로 처리
  return 'vod'
}

/** 페이지 제목에서 " : 웨이브", " - Wavve" 같은 꼬리표를 떼요. 웨이브 공통 제목만 남으면 빈 문자열이에요. */
function cleanTitle(raw: string | null | undefined): string {
  const title = (raw ?? '')
    .replace(/\s*[-|·:]\s*(?:wavve|웨이브).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  return /^(?:wavve|웨이브)(?:\s*\(.*\))?$/i.test(title) ? '' : title
}

function textOf(element: Element | null | undefined): string {
  return (element?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function truncate(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function toAbsoluteUrl(value: string | null | undefined): string {
  if (!value)
    return ''
  try {
    const url = new URL(value, document.location.href)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : ''
  }
  catch {
    return ''
  }
}

/** 주소의 영상 번호. 예: ?contentid=M_EP202207227706.1 → M_EP202207227706 */
function getContentId(): string {
  const params = new URLSearchParams(document.location.search)
  return (params.get('contentid') ?? params.get('movieid') ?? '').split('.')[0] ?? ''
}

/**
 * 에피소드 목록에서 지금 재생 중인 항목.
 * 1) 영상 번호가 들어 있는 항목을 먼저 찾고,
 * 2) 번호가 없는 콘텐츠(방송사 영상 등)는 위쪽 제목 줄의 회차("1회")와 같은 항목을 찾아요.
 */
function getCurrentEpisodeItem(contentId: string, topNumber: string): Element | null {
  const items = [...document.querySelectorAll(SELECTORS.currentEpisode)]
  const byId = contentId ? items.find(item => item.innerHTML.includes(contentId)) : undefined
  if (byId)
    return byId
  return items.find(item => topNumber && textOf(item.querySelector(SELECTORS.episodeNumber)).startsWith(topNumber)) ?? null
}

/** 웨이브 이미지 주소의 크기 부분(320_180)을 더 큰 480_270 으로 바꿔요. 웨이브 화면이 쓰는 크기예요. */
function toLargerThumbnail(url: string): string {
  return url.replace(/\/thumbnails\/\d+_\d+_/, '/thumbnails/480_270_')
}

/** 지금 보고 있는 콘텐츠의 썸네일: 영상 포스터 > 주소의 영상 번호가 들어간 이미지 > 플레이어 포스터, 없으면 빈 문자열 */
function getThumbnail(video: HTMLVideoElement | null, clipTitle = ''): string {
  const poster = toAbsoluteUrl(video?.poster)
  if (poster)
    return poster

  const contentId = getContentId()
  if (contentId) {
    const image = [...document.querySelectorAll('img')].find(img => img.src.includes(contentId))
    const url = toAbsoluteUrl(image?.src)
    if (url)
      return toLargerThumbnail(url)
  }

  const playerPoster = toAbsoluteUrl(document.querySelector<HTMLImageElement>(SELECTORS.poster)?.src)
  if (playerPoster)
    return toLargerThumbnail(playerPoster)

  // 클립 화면: 제목(alt)이 같은 클립 카드의 이미지
  if (clipTitle) {
    const card = [...document.querySelectorAll<HTMLImageElement>(SELECTORS.clipThumbnail)]
      .find(img => (img.alt ?? '').replace(/\s+/g, ' ').trim() === clipTitle)
    const url = toAbsoluteUrl(card?.src)
    if (url)
      return toLargerThumbnail(url)
  }
  return ''
}

/** 한 번 읽은 에피소드 제목을 기억해 둬요. 목록 패널을 닫아도 계속 보여주기 위해서예요. */
const episodeCache = new Map<string, string>()

function getTitles(): { title: string, episode: string } {
  const title = cleanTitle(document.title)
  const contentId = getContentId()

  // 영상 위쪽 제목 줄("빅마우스 2회")에서 회차만 읽어요. 에피소드 목록이 닫혀 있어도 항상 있어요.
  const info = textOf(document.querySelector(SELECTORS.topInfo))
  const topNumber = title && info.startsWith(title)
    ? info.slice(title.length).trim()
    : (/\S+$/.exec(info)?.[0] ?? '')

  // 1) 에피소드 목록이 열려 있으면: "1회 · 에피소드 제목"
  const item = getCurrentEpisodeItem(contentId, topNumber)
  if (item) {
    const name = textOf(item.querySelector(SELECTORS.episodeName))
    const subTitle = textOf(item.querySelector(SELECTORS.episodeNumber))
    // "1회2022-07-29(금)" → "1회"
    const number = (subTitle.split(/\d{4}-\d{2}-\d{2}/)[0] ?? subTitle).trim()
    const episode = truncate([number, name].filter(Boolean).join(' · '))
    if (episode && contentId)
      episodeCache.set(contentId, episode)
    return { title, episode }
  }

  // 2) 이미 한 번 읽은 에피소드면 기억해 둔 값을 써요.
  const cached = contentId ? episodeCache.get(contentId) : undefined
  if (cached)
    return { title, episode: cached }

  // 3) 목록이 없으면 위쪽 제목 줄의 회차만 써요.
  return { title, episode: truncate(topNumber) }
}

presence.on('UpdateData', async () => {
  const [privacy, showTimestamp, showBrowsing, showCover] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('browsing'),
    presence.getSetting<boolean>('cover'),
  ])

  // 확장 프로그램이 언어 설정에 맞는 문구를 알아서 효율적으로 가져와 줘요.
  const strings = await getStrings()

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    // 디스코드 맨 윗줄에 표시되는 플랫폼 이름
    name: 'Wavve',
    largeImageKey: ActivityAssets.Logo,
  }

  const { pathname } = document.location
  const kind = getPlayerKind(pathname)

  if (kind) {
    const video = document.querySelector<HTMLVideoElement>(SELECTORS.video)
    const titles = getTitles()
    // 클립은 페이지 제목이 이전 화면 값으로 남아 있을 수 있어서, 위쪽 제목 줄의 제목을 써요.
    const clipTitle = kind === 'clip' ? textOf(document.querySelector(SELECTORS.topInfo)) : ''
    const title = clipTitle ? truncate(clipTitle) : titles.title
    const episode = titles.episode

    if (privacy) {
      presenceData.details = kind === 'movie'
        ? strings.watchingMovie
        : kind === 'live'
          ? strings.watchingLive
          : strings.watchingVid
    }
    else {
      presenceData.details = title || strings.watchingVid

      if (showCover) {
        const thumbnail = getThumbnail(video, clipTitle)
        if (thumbnail)
          presenceData.largeImageKey = thumbnail
      }

      // 두 줄만 표시: 콘텐츠 제목(details) + 에피소드 제목(state). 에피소드가 없으면 한 줄만 나와요.
      if (kind === 'vod' && episode)
        presenceData.state = episode
    }

    if (video) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? strings.pause : strings.play

      if (showTimestamp && !video.paused) {
        if (kind === 'live' || !Number.isFinite(video.duration)) {
          // Live streams have no fixed end, so only show elapsed time
          presenceData.startTimestamp = browsingTimestamp
        }
        else {
          const [start, end] = getTimestampsFromMedia(video)
          presenceData.startTimestamp = start
          presenceData.endTimestamp = end
        }
      }
    }
  }
  else {
    if (!showBrowsing) {
      presence.clearActivity()
      return
    }

    presenceData.startTimestamp = browsingTimestamp
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = strings.browse

    if (pathname.includes('/search')) {
      presenceData.details = strings.search
      presenceData.smallImageKey = Assets.Search
    }
    else {
      presenceData.details = strings.browse
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
