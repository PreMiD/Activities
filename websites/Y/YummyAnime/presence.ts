import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1140596411956744202',
})

interface VideoState {
  duration: number
  currentTime: number
  paused: boolean
}

interface IframeData extends VideoState {
  referrer?: string
}

let iframeVideo: VideoState = {
  duration: 0,
  currentTime: 0,
  paused: true,
}

let lastPathname = document.location.pathname

presence.on('iFrameData', (data: IframeData) => {
  if (data.referrer) {
    try {
      const refUrl = new URL(data.referrer)
      const currentUrl = new URL(document.location.href)

      if (refUrl.origin !== currentUrl.origin)
        return
    }
    catch {
      // ignore parsing errors
    }
  }

  iframeVideo = {
    duration: data.duration ?? 0,
    currentTime: data.currentTime ?? 0,
    paused: data.paused ?? true,
  }
})

function getKnownDuration(video: HTMLVideoElement): number {
  const d = video.duration
  if (Number.isFinite(d) && d > 0 && d !== Number.POSITIVE_INFINITY)
    return d

  try {
    if (video.seekable?.length) {
      const end = video.seekable.end(video.seekable.length - 1)
      if (Number.isFinite(end) && end > 0)
        return end
    }
  }
  catch {
    // ignore
  }

  try {
    if (video.buffered?.length) {
      const end = video.buffered.end(video.buffered.length - 1)
      if (Number.isFinite(end) && end > 0)
        return end
    }
  }
  catch {
    // ignore
  }
  return Number.NaN
}

function isVideoMostlyVisible(video: HTMLVideoElement): boolean {
  const r = video.getBoundingClientRect()
  if (r.width > 0 && r.height > 0)
    return r.width >= 32 && r.height >= 18
  return video.videoWidth > 0 && video.videoHeight > 0
}

function collectVideos(root: Document | ShadowRoot): HTMLVideoElement[] {
  const out: HTMLVideoElement[] = []
  for (const v of root.querySelectorAll('video')) out.push(v)

  for (const el of root.querySelectorAll('*')) {
    if (el.shadowRoot)
      out.push(...collectVideos(el.shadowRoot))
  }
  return out
}

function pickBestVideoFromPage(): HTMLVideoElement | null {
  const videos = collectVideos(document).filter(isVideoMostlyVisible)
  if (!videos.length)
    return null

  const withDuration = videos.filter((v) => {
    const d = getKnownDuration(v)
    return Number.isFinite(d) && d > 0
  })

  if (!withDuration.length) {
    const playing = videos.filter(v => !v.paused && v.currentTime > 0)
    if (playing.length)
      return playing[0] ?? null
  }

  const pool = withDuration.length ? withDuration : videos

  return pool.reduce((a, b) => {
    const da = getKnownDuration(a)
    const db = getKnownDuration(b)
    const ad = Number.isFinite(da) ? da : 0
    const bd = Number.isFinite(db) ? db : 0
    return bd >= ad ? b : a
  })
}

function mainPageVideoState(): VideoState | null {
  const video = pickBestVideoFromPage()
  if (!video)
    return null

  const duration = getKnownDuration(video)

  if ((!Number.isFinite(duration) || duration <= 0) && !video.paused) {
    return {
      duration: 0,
      currentTime: video.currentTime,
      paused: video.paused,
    }
  }

  if (!Number.isFinite(duration) || duration <= 0)
    return null

  return {
    duration,
    currentTime: video.currentTime,
    paused: video.paused,
  }
}

function getPlaybackVideo(): VideoState | null {
  if (iframeVideo.duration > 0 || !iframeVideo.paused)
    return iframeVideo

  return mainPageVideoState()
}

function isAnimeItemPage(pathname: string): boolean {
  if (document.querySelector('.poster-block'))
    return true

  if (pathname.includes('/catalog/item/'))
    return true

  return (
    /\/item\/\d+/i.test(pathname)
    || /\/catalog\/\d+/i.test(pathname)
    || /\/anime\//i.test(pathname)
    || /\/watch\//i.test(pathname)
    || /\/serial\//i.test(pathname)
    || /\/title\//i.test(pathname)
    || /\/release\//i.test(pathname)
  )
}

function getProfileUserId(pathname: string): string | null {
  const match = pathname.match(/^\/users\/id(\d+)\/?$/i)
  return match?.[1] ?? null
}

function getProfileNickname(): string {
  const nick = document.querySelector('span.k2[data-tooltip-id="old-nicks-t"]')
  return nick?.textContent?.trim() ?? ''
}

function getSvgImageHref(el: SVGImageElement): string | null {
  return el.getAttribute('href') || el.getAttribute('xlink:href')
}

function findProfileAvatarSvgImage(): SVGImageElement | null {
  const images = document.querySelectorAll<SVGImageElement>('image')
  for (const img of images) {
    const href = getSvgImageHref(img)
    if (!href)
      continue
    if (href.includes('/users/big/') || href.includes('DefaultAva')) {
      return img
    }
  }
  return null
}

function getProfileAvatarUrl(userId: string): string {
  const svgImg = findProfileAvatarSvgImage()
  if (svgImg) {
    const href = getSvgImageHref(svgImg)
    if (href)
      return resolveAbsoluteUrl(href)
  }

  // fallback
  return `https://static.yani.tv/users/big/${userId}.webp`
}

function episodeFromUrl(pathname: string, search: string): string {
  const params = new URLSearchParams(search)
  for (const key of ['episode', 'ep', 'serie', 's']) {
    const v = params.get(key)
    if (v && /^\d+$/.test(v))
      return v
  }

  const m = pathname.match(/(?:episode|ep|ser(?:iya)?)[-_]?(\d+)/i)
  if (m?.[1])
    return m[1]

  return ''
}

function getActiveEpisode(pathname: string, search: string): string {
  const fromUrl = episodeFromUrl(pathname, search)
  if (fromUrl)
    return fromUrl

  const oldBtn = document.querySelector('div[class*="pQCG"]')
  if (oldBtn) {
    const text = oldBtn.textContent?.trim()
    if (text && !Number.isNaN(Number(text)))
      return text
  }

  const activeSelectors = [
    'div.wB div[data-selected="1"]',
    '[aria-current="true"]',
    '[aria-selected="true"]',
    '[aria-current="page"]',
    '[data-selected="1"]',
    '[data-active="true"]',
    '[data-current="true"]',
    '.episodes-container .active',
    '.episodes-list .active',
    '.series-list .active',
    '[class*="episode"][class*="active"]',
    '[class*="Episode"][class*="Active"]',
  ]

  for (const sel of activeSelectors) {
    const el = document.querySelector(sel)
    if (el) {
      const text = el.textContent?.trim()
      if (text && text.length < 20) {
        if (/^\d+$/.test(text))
          return text
        const num = text.match(/\d+/)
        if (num)
          return num[0]
      }
    }
  }
  return ''
}

function resolveAbsoluteUrl(url: string): string {
  const t = url.trim()
  if (t.startsWith('//'))
    return `https:${t}`
  if (t.startsWith('/'))
    return `${location.origin}${t}`
  if (t.startsWith('http://') || t.startsWith('https://'))
    return t
  return `${location.origin}/${t.replace(/^\//, '')}`
}

function isSkippableImageUrl(url: string): boolean {
  const u = url.toLowerCase()
  if (!u || u.length < 8)
    return true
  if (u.includes('favicon'))
    return true
  if (u.includes('icon-32') || u.includes('icon-16'))
    return true
  if (u.includes('gravatar'))
    return true
  if (/\bavatars?\b/.test(u) || /\bavatar[._/-]/i.test(u))
    return true
  return false
}

function posterUrlForDiscord(raw: string): string {
  return resolveAbsoluteUrl(raw)
}

function imgEffectiveSrc(img: HTMLImageElement): string {
  return (
    img.getAttribute('src')
    || img.getAttribute('data-src')
    || img.getAttribute('data-lazy-src')
    || img.getAttribute('data-original')
    || img.currentSrc
    || img.src
    || ''
  ).trim()
}

function applyPosterImage(presenceData: Record<string, unknown>): void {
  const tryAssign = (img: HTMLImageElement | null | undefined): boolean => {
    if (!img)
      return false
    const raw = imgEffectiveSrc(img)
    if (!raw || isSkippableImageUrl(raw))
      return false
    presenceData.largeImageKey = posterUrlForDiscord(raw)
    return true
  }

  if (
    tryAssign(document.querySelector<HTMLImageElement>('div.poster-block img'))
  ) {
    return
  }
  const posterish = document.querySelectorAll<HTMLImageElement>(
    'img[src*="imgproxy.yani.tv/posters"], img[data-src*="imgproxy.yani.tv/posters"]',
  )
  for (const img of posterish) {
    if (tryAssign(img))
      return
  }

  if (
    tryAssign(
      document.querySelector('div[class*="d4"] img') as HTMLImageElement,
    )
  ) {
    return
  }

  if (
    tryAssign(document.querySelector('[class*="d4"] img') as HTMLImageElement)
  )
    return

  if (
    tryAssign(
      document.querySelector('main div[class*="d4"] img') as HTMLImageElement,
    )
  ) {
    return
  }

  if (
    tryAssign(
      document.querySelector('img[itemprop="image"]') as HTMLImageElement,
    )
  ) {
    return
  }

  for (const metaSel of [
    'meta[property="og:image"]',
    'meta[property="og:image:url"]',
    'meta[property="og:image:secure_url"]',
    'meta[name="twitter:image"]',
    'meta[name="twitter:image:src"]',
  ]) {
    const content = document
      .querySelector(metaSel)
      ?.getAttribute('content')
      ?.trim()
    if (content && !isSkippableImageUrl(content)) {
      presenceData.largeImageKey = posterUrlForDiscord(content)
      return
    }
  }
}

function isPlayerBlockInView(): boolean {
  const selectors = [
    '#video',
    'video',
    '[class*="Player"]',
    '[class*="player"]',
    '[class*="VideoContainer"]',
    '[class*="video-container"]',
    '[id*="player"]',
    '[id*="video"]',
  ]
  const viewHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight,
  )
  for (const sel of selectors) {
    const els = document.querySelectorAll(sel)
    for (const el of els) {
      const rect = el.getBoundingClientRect()
      if (rect.width < 400 || rect.height < 200)
        continue
      const centerY = rect.top + rect.height / 2
      if (centerY > 0 && centerY < viewHeight) {
        return true
      }
    }
  }

  const iframes = document.querySelectorAll('iframe')
  for (const iframe of iframes) {
    const src = iframe.src || iframe.getAttribute('data-src') || ''
    if (
      src.includes('video')
      || src.includes('player')
      || src.includes('stream')
      || src.includes('yani')
      || src.includes('sibnet')
      || src.includes('vk.com')
    ) {
      const rect = iframe.getBoundingClientRect()
      if (rect.width < 400 || rect.height < 200)
        continue
      const centerY = rect.top + rect.height / 2
      if (centerY > 0 && centerY < viewHeight) {
        return true
      }
    }
  }
  return false
}

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    mainPage: 'general.viewHome',
    choosingAnime: 'yummyanime.choosingAnime',
    watchingProfilePrefix: 'general.viewAProfile',
    watchingProfileGeneric: 'general.viewAProfile',
    onSite: 'yummyanime.onSite',
    watchingAnime: 'general.watchingAnime',
    watchingEpisodePrefix: 'general.viewEpisode',
    watchingNoEpisode: 'general.watchingVid',
    pausedEpisodePrefix: 'general.episode',
    pausedEpisodeSuffix: 'yummyanime.pausedEpisodeSuffix',
    pausedNoEpisode: 'general.paused',
    preparingEpisodePrefix: 'yummyanime.preparingEpisodePrefix',
    readingDescription: 'yummyanime.readingDescription',
  })

  if (lastPathname !== document.location.pathname) {
    lastPathname = document.location.pathname
    iframeVideo = {
      duration: 0,
      currentTime: 0,
      paused: true,
    }
  }

  const { pathname, search } = document.location

  const presenceData: Record<string, unknown> = {
    largeImageKey: 'https://i.imgur.com/397AqsF.png',
    largeImageText: 'YummyAnime',
    type: ActivityType.Watching,
  }

  if (pathname === '/') {
    presenceData.details = strings.mainPage
    presenceData.state = strings.choosingAnime
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/catalog') && !pathname.includes('/item/')) {
    presenceData.details = strings.onSite
    presenceData.state = strings.choosingAnime
    presence.setActivity(presenceData)
    return
  }

  const profileUserId = getProfileUserId(pathname)
  if (profileUserId) {
    const nickname = getProfileNickname()
    if (nickname) {
      presenceData.details = nickname
      presenceData.state = strings.watchingProfilePrefix
    }
    else {
      presenceData.details = strings.watchingProfileGeneric
      presenceData.state = ''
    }
    presenceData.largeImageKey = getProfileAvatarUrl(profileUserId)
    delete presenceData.smallImageKey
    delete presenceData.smallImageText
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp

    presence.setActivity(presenceData)
    return
  }

  if (!isAnimeItemPage(pathname)) {
    presenceData.details = strings.onSite

    const pageTitle = document.querySelector('h1')?.textContent?.trim()

    if (pageTitle)
      presenceData.state = pageTitle
    else delete presenceData.state

    delete presenceData.startTimestamp
    delete presenceData.endTimestamp

    presence.setActivity(presenceData)
    return
  }

  const titleHeader = document.querySelector('h1')
  if (titleHeader)
    presenceData.details = titleHeader.textContent?.trim()
  else presenceData.details = strings.watchingAnime

  applyPosterImage(presenceData)

  const currentEpisode = getActiveEpisode(pathname, search)
  const playback = getPlaybackVideo()

  if (playback && (playback.duration > 0 || !playback.paused)) {
    if (!playback.paused) {
      presenceData.state = currentEpisode
        ? `${strings.watchingEpisodePrefix} ${currentEpisode}`
        : strings.watchingNoEpisode

      if (playback.duration > 0) {
        [presenceData.startTimestamp, presenceData.endTimestamp]
          = getTimestamps(playback.currentTime, playback.duration)
      }
      else {
        presenceData.startTimestamp = Date.now() - playback.currentTime * 1000
        delete presenceData.endTimestamp
      }

      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.play
    }
    else {
      presenceData.state = currentEpisode
        ? `${strings.pausedEpisodePrefix} ${currentEpisode} ${strings.pausedEpisodeSuffix}`
        : strings.pausedNoEpisode

      delete presenceData.startTimestamp
      delete presenceData.endTimestamp

      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.pause
    }
  }
  else {
    delete presenceData.smallImageKey
    delete presenceData.smallImageText

    if (currentEpisode && isPlayerBlockInView())
      presenceData.state = `${strings.preparingEpisodePrefix} ${currentEpisode}`
    else presenceData.state = strings.readingDescription

    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
