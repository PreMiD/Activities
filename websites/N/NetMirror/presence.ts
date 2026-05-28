import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia, StatusDisplayType } from 'premid'

interface IFrameVideoData {
  duration: number
  currentTime: number
  paused: boolean
  seriesId?: string | null
  title?: string | null
  eptitle?: string | null
  epnum?: string | null
  senum?: string | null
  maindesc?: string | null
  epDesc?: string | null
  hasVideo?: boolean
}

const presence = new Presence({
  clientId: '1377295092578123926',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let videoData: IFrameVideoData = {
  duration: 0,
  currentTime: 0,
  paused: true,
  hasVideo: false,
}

presence.on('iFrameData', (data: IFrameVideoData) => {
  videoData = { ...data }
})

enum ActivityAssets {
  Logo = 'https://netmirror.io/images/icon-512.png',
}

function cleanText(text?: string | null): string | undefined {
  const cleaned = text
    ?.replace(/\s+/g, ' ')
    .replace(/\s*(?:-|\|)\s*(?:Net22\.cc|NetMirror|Net Mirror).*$/i, '')
    .trim()

  if (!cleaned || /^(?:NetMirror|Net22\.cc|Verify I.?m Human|Just a moment\.{3})$/i.test(cleaned))
    return undefined

  return cleaned
}

function limitText(text?: string): string | undefined {
  if (!text)
    return undefined

  return text.length > 128 ? `${text.slice(0, 125)}...` : text
}

function getMetaContent(selector: string): string | undefined {
  return cleanText(document.querySelector<HTMLMetaElement>(selector)?.content)
}

function getTextFromSelectors(selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const text = cleanText(document.querySelector(selector)?.textContent)
    if (text)
      return text
  }

  return undefined
}

function getPageTitle(): string | undefined {
  return getTextFromSelectors([
    'h1',
    '[data-testid="title"]',
    '[data-testid*="title" i]',
    '.movie-title',
    '.show-title',
    '.video-title',
    '.watch-title',
    '.detail-title',
    '.title h1',
  ])
  ?? getMetaContent('meta[property="og:title"]')
  ?? cleanText(document.title)
}

function getSynopsis(): string | undefined {
  return limitText(
    getTextFromSelectors([
      '[data-testid*="overview" i]',
      '[data-testid*="description" i]',
      '.overview',
      '.description',
      '.synopsis',
      '.plot',
      'p',
    ])
    ?? getMetaContent('meta[property="og:description"]')
    ?? getMetaContent('meta[name="description"]'),
  )
}

function isUsableImage(src?: string | null): src is string {
  return !!src && /^https?:\/\//.test(src) && !/favicon|icon-|logo|avatar/i.test(src)
}

function getCoverImage(): string | undefined {
  const selectors = [
    '.poster img',
    '.movie-poster img',
    '.show-poster img',
    '.cover img',
    '.detail img',
    '[class*="poster" i] img',
    '[class*="cover" i] img',
  ]

  for (const selector of selectors) {
    const src = document.querySelector<HTMLImageElement>(selector)?.src
    if (isUsableImage(src))
      return src
  }

  const metaImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
  return isUsableImage(metaImage) ? metaImage : undefined
}

async function processCoverImage(coverImage?: string): Promise<string | Blob | undefined> {
  if (!coverImage) return undefined

  if (coverImage.includes('imgcdn.kim') || coverImage.includes('img.nfmirrorcdn') || coverImage.includes('netmirror')) {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = coverImage
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve))
        if (blob) return blob
      }
    } catch {
      // Fallback
    }
  }

  return coverImage
}

function getSearchQuery(): string | undefined {
  const params = new URLSearchParams(document.location.search)
  const query = ['q', 'query', 'search', 'keyword', 's']
    .map(key => cleanText(params.get(key)))
    .find(Boolean)

  if (query)
    return query

  return cleanText(
    document.querySelector<HTMLInputElement>(
      'input[type="search"], input[placeholder*="search" i], input[name*="search" i]',
    )?.value,
  )
}

function getSelectedOption(selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const option = document.querySelector<HTMLSelectElement>(selector)?.selectedOptions[0]
    const text = cleanText(option?.textContent)
    if (text)
      return text.replace(/^(?:season|episode)\s*/i, '')
  }

  return undefined
}

function getEpisodeState(): string | undefined {
  const params = new URLSearchParams(document.location.search)
  const season = cleanText(params.get('season') ?? params.get('s'))
    ?? getSelectedOption([
      'select[name*="season" i]',
      'select[id*="season" i]',
      'select[x-model*="Season" i]',
    ])
  const episode = cleanText(params.get('episode') ?? params.get('ep') ?? params.get('e'))
    ?? getSelectedOption([
      'select[name*="episode" i]',
      'select[id*="episode" i]',
      'select[x-model*="Episode" i]',
    ])
  const episodeTitle = getTextFromSelectors([
    '.episode-title',
    '.episode-name',
    '[data-testid*="episode" i]',
  ])
  const language = cleanText(params.get('lang') ?? params.get('language') ?? params.get('audio'))
  const pieces: string[] = []

  if (season && episode)
    pieces.push(`S${season}E${episode}`)
  else if (episode)
    pieces.push(`Ep. ${episode}`)

  if (episodeTitle && episodeTitle !== getPageTitle())
    pieces.push(episodeTitle)
  if (language)
    pieces.push(language)

  return limitText(pieces.join(' - ')) || undefined
}

function getSection(pathname: string): { details: string, smallImageKey: string, state?: string } {
  const searchQuery = getSearchQuery()

  if (/^\/(?:verify2?|captcha)\b/i.test(pathname)) {
    return {
      details: 'Verifying session',
      smallImageKey: Assets.Viewing,
    }
  }

  if (/^\/(?:login2?|sign-?in|sign-?up)\b/i.test(pathname)) {
    return {
      details: 'Signing in',
      smallImageKey: Assets.Viewing,
    }
  }

  if (/search/i.test(pathname) || searchQuery) {
    return {
      details: limitText(searchQuery ? `Searching for "${searchQuery}"` : 'Searching') ?? 'Searching',
      smallImageKey: Assets.Search,
    }
  }

  if (/watchlist|my[-_ ]?list|favorites|continue/i.test(pathname)) {
    return {
      details: 'Viewing watchlist',
      smallImageKey: Assets.Viewing,
    }
  }

  if (/settings|account|profile|@me/i.test(pathname)) {
    return {
      details: 'Viewing account',
      smallImageKey: Assets.Viewing,
    }
  }

  if (/movies?/i.test(pathname)) {
    return {
      details: 'Browsing movies',
      smallImageKey: Assets.Reading,
    }
  }

  if (/tv|series|shows/i.test(pathname)) {
    return {
      details: 'Browsing TV series',
      smallImageKey: Assets.Reading,
    }
  }

  if (/^\/(?:home)?\/?$/i.test(pathname)) {
    return {
      details: 'Browsing home',
      state: 'Finding something to watch',
      smallImageKey: Assets.Reading,
    }
  }

  return {
    details: 'Browsing NetMirror',
    smallImageKey: Assets.Reading,
  }
}

function isDetailsPage(pathname: string): boolean {
  return /title|detail|watch|play|stream|movie|series|show|tv/i.test(pathname) && !/^\/(?:movies?|tv|series|shows?)\/?$/i.test(pathname)
}

presence.on('UpdateData', async () => {
  const [privacyMode, showTimestamps, showButtons, showCover] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('showTimestamps'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showCover'),
  ])

  const { href, pathname } = document.location
  const video = document.querySelector<HTMLVideoElement>('video')
  const player = document.getElementById('player')
  const isPlayerOpen = (player && !player.classList.contains('hide')) || !!document.querySelector('.player-iframe')
  const isIframeVideo = !video && isPlayerOpen && videoData.hasVideo

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    name: 'NetMirror',
    startTimestamp: browsingTimestamp,
    statusDisplayType: StatusDisplayType.Details,
    type: ActivityType.Watching,
  }

  if (privacyMode) {
    const isStreaming = video || (isPlayerOpen && videoData.hasVideo)
    const isPaused = isIframeVideo ? videoData.paused : video?.paused
    presenceData.details = isStreaming ? 'Streaming on NetMirror' : 'Browsing NetMirror'
    presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Viewing
    presenceData.smallImageText = isPaused ? 'Paused' : undefined
    return presence.setActivity(presenceData)
  }

  if (video || (isPlayerOpen && videoData.hasVideo)) {
    let title: string | undefined
    if (isIframeVideo && videoData.title) {
      title = cleanText(videoData.title)
    }
    else {
      title = getPageTitle()
    }

    let episodeState: string | undefined
    if (isIframeVideo && videoData.title) {
      const pieces: string[] = []
      const season = cleanText(videoData.senum)
      const episode = cleanText(videoData.epnum)
      const episodeTitle = cleanText(videoData.eptitle)

      if (season && episode) {
        pieces.push(`S${season}E${episode}`)
      }
      else if (episode) {
        pieces.push(`Ep. ${episode}`)
      }

      if (episodeTitle && episodeTitle !== title) {
        pieces.push(episodeTitle)
      }
      episodeState = limitText(pieces.join(' - ')) || undefined
    }
    else {
      episodeState = getEpisodeState()
    }

    presenceData.details = limitText(title) ?? 'Streaming on NetMirror'
    presenceData.state = episodeState

    const isPaused = isIframeVideo ? videoData.paused : video!.paused
    presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = isPaused ? 'Paused' : 'Playing'
    delete presenceData.startTimestamp

    let coverUrl: string | undefined
    if (isIframeVideo && videoData.seriesId) {
      coverUrl = `https://imgcdn.kim/poster/341/${videoData.seriesId}.jpg`
    }
    else {
      coverUrl = getCoverImage()
    }

    const processedCover = await processCoverImage(coverUrl)

    if (showCover && processedCover) {
      presenceData.largeImageKey = processedCover as any
      presenceData.largeImageText = title
    }

    const currentVideoTime = isIframeVideo ? videoData.currentTime : video!.currentTime
    const currentVideoDuration = isIframeVideo ? videoData.duration : video!.duration

    if (!isPaused && Number.isFinite(currentVideoDuration) && showTimestamps) {
      if (isIframeVideo) {
        const [startTimestamp, endTimestamp] = getTimestamps(
          Math.floor(currentVideoTime),
          Math.floor(currentVideoDuration),
        )
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
      else {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video!)
      }
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Watch Now',
          url: href,
        },
      ]
    }

    return presence.setActivity(presenceData)
  }

  // Check if the modal is open
  const modalMain = document.getElementById('modal-main')
  const isModalOpen = modalMain && !modalMain.classList.contains('hide') && !modalMain.classList.contains('modal-placeholder')

  if (isModalOpen && !isDetailsPage(pathname)) {
    const titleText = cleanText(modalMain.querySelector('.model-title')?.textContent) || getPageTitle()
    const descriptionText = cleanText(modalMain.querySelector('.model-description')?.textContent) || getSynopsis()

    // Grab the image from the modal
    let coverImage = modalMain.querySelector<HTMLImageElement>('.modal-img, .previewModal--player-videoImage, .previewModal--boxart, .modal-poster img')?.src

    // Fallback to generating it if the element doesn't have it yet
    const postId = modalMain.getAttribute('data-post')
    if (!coverImage && postId) {
      coverImage = `https://imgcdn.kim/poster/h/${postId}.jpg`
    }

    if (!coverImage) {
      coverImage = getCoverImage() || ''
    }

    const processedCover = await processCoverImage(coverImage)

    presenceData.details = titleText ? `Viewing ${titleText}` : 'Viewing details'
    presenceData.state = limitText(descriptionText) || 'Reading synopsis'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing'

    if (showCover && processedCover && (processedCover instanceof Blob || isUsableImage(processedCover))) {
      presenceData.largeImageKey = processedCover as any
      // Don't set largeImageText as per PreMiD guidelines since V2 unless requested, but V1 allows it
      presenceData.largeImageText = titleText || 'Details'
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'View Title',
          url: href, // The URL doesn't update, but we still point to current page
        },
      ]
    }

    return presence.setActivity(presenceData)
  }

  if (isDetailsPage(pathname)) {
    const title = getPageTitle()
    const coverUrl = getCoverImage()

    const processedCover = await processCoverImage(coverUrl)

    presenceData.details = title ? 'Viewing title' : 'Viewing content'
    presenceData.state = limitText(title) ?? getSynopsis()
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing'

    if (showCover && processedCover) {
      presenceData.largeImageKey = processedCover as any
      presenceData.largeImageText = title
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'View Title',
          url: href,
        },
      ]
    }

    return presence.setActivity(presenceData)
  }

  const section = getSection(pathname)
  presenceData.details = section.details
  presenceData.state = section.state
  presenceData.smallImageKey = section.smallImageKey
  presenceData.smallImageText = section.details

  presence.setActivity(presenceData)
})
