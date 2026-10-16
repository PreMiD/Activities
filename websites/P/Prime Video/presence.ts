import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '705139844883677224',
})

const strings = presence.getStrings({
  paused: 'general.paused',
  playing: 'general.playing',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Prime%20Video/assets/logo.png',
}

let cacheUrl: { thumbnailUrl: string, type: number } | null = null
let generatedImage: string
export async function getThumbnail(thumbnailUrl: string, type: number): Promise<string> {
  if (cacheUrl?.thumbnailUrl === thumbnailUrl && cacheUrl.type === type)
    return generatedImage

  if (type !== 0 && type !== 1) {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = thumbnailUrl
      img.onload = () => resolve(thumbnailUrl)
      img.onerror = () => resolve(thumbnailUrl)
    })
  }

  return new Promise((resolve) => {
    const img = new Image()
    const wh = 320
    img.crossOrigin = 'anonymous'
    img.src = thumbnailUrl

    img.onload = () => {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = wh
      tempCanvas.height = wh
      const ctx = tempCanvas.getContext('2d')

      if (ctx) {
        let sx = 0
        let sy = 0
        let sw = img.width
        let sh = img.height

        if (type === 0) {
          const cropSize = 600
          sw = Math.min(cropSize, img.width)
          sh = Math.min(cropSize, img.height)

          sx = Math.max(0, img.width - sw)
          sy = Math.max(0, (img.height - sh) / 2)
        }

        let newWidth: number
        let newHeight: number
        let offsetX: number
        let offsetY: number

        if (sw > sh) {
          newWidth = wh
          newHeight = (wh / sw) * sh
          offsetX = 0
          offsetY = (wh - newHeight) / 2
        }
        else {
          newHeight = wh
          newWidth = (wh / sh) * sw
          offsetX = (wh - newWidth) / 2
          offsetY = 0
        }

        ctx.drawImage(img, sx, sy, sw, sh, offsetX, offsetY, newWidth, newHeight)
      }

      cacheUrl = { thumbnailUrl, type }
      generatedImage = tempCanvas.toDataURL('image/png')
      resolve(generatedImage)
    }

    img.onerror = () => {
      resolve(thumbnailUrl)
    }
  })
}

let playbackVideo: HTMLVideoElement | null = null
let playbackKey = ''
let playbackSource = ''
let playbackTitle = ''
let playerTitle = ''
let playbackSubtitle = ''
let previousSubtitle = ''
let blockedSubtitle = ''
let blockedPageKey = ''
let playerObserver: MutationObserver | null = null
let playbackTime = 0
let mediaReset = false
let playbackRoot: Element | null = null
let metadataVersion = 0
let updateSequence = 0

function isPlayerVisible(player: Element | null): player is Element {
  if (!player?.isConnected || player.getClientRects().length === 0)
    return false
  const style = window.getComputedStyle(player)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

function getActiveVideo() {
  const key = getPlaybackKey()
  const videos = [...document.querySelectorAll<HTMLVideoElement>('div[id^="dv-web-player"] video')]
    .filter(video => !video.className.includes('tst')
      && (video.currentSrc || video.getAttribute('src'))
      && isPlayerVisible(video.closest('div[id^="dv-web-player"]')))
  return videos.find(video => video.closest('.dv-player-fullscreen'))
    || videos.find(video => !video.paused)
    || videos.find(video => video === playbackVideo)
    || videos[0]
    // Keep metadata during a video-node remount while its player is still open.
    || (isPlayerVisible(playbackRoot) && (!key || !playbackKey || playbackKey === key) ? playbackVideo : null)
}

const ignoredMetadataSelector = [
  '.atvwebplayersdk-captions-text',
  '.atvwebplayersdk-nextupcard-wrapper',
  '.atvwebplayersdk-toast-wrapper',
].join(', ')

function parseEpisode(text: string) {
  const prefix = text.match(/^S(?:eason)?\s*(\d+)\s*E(?:pisode)?\s*(\d+)/i)
  if (!prefix)
    return null
  const identity = `S${Number(prefix[1])} E${Number(prefix[2])}`
  return { identity, text: `${identity} ${text.slice(prefix[0].length).trim()}`.trim() }
}

function getPlaybackKey() {
  const url = new URL(document.location.href)
  // /ref=... and query tracking parameters do not identify the episode.
  const detailId = url.pathname.match(/\/detail\/([^/]+)/)?.[1]
  const gti = url.searchParams.get('gti') || ''
  const asin = url.searchParams.get('asin') || ''
  // Playback can start on /storefront before Prime sets the episode URL.
  // A navigation route is not a content ID; the first actual ID is discovery.
  return detailId || gti || asin ? `${url.origin}${detailId || ''}|${gti}|${asin}` : ''
}

function getPageEpisode() {
  const detailId = document.location.pathname.match(/\/detail\/([^/]+)/)?.[1]
  const season = document.title.match(/(?:Season|Sesong|Staffel|Saison|Temporada)\s+(\d+)\s*$/i)?.[1]
  if (!detailId || !season)
    return ''

  // The detail page can list a whole season. Only use the exact episode URL.
  for (const row of document.querySelectorAll('[data-testid="episode-list-item"]')) {
    const link = row.querySelector<HTMLAnchorElement>('a[data-testid="episodes-playbutton"]')
    if (!link)
      continue
    const episodeId = new URL(link.href, document.location.href).pathname.match(/\/detail\/([^/]+)/)?.[1]
    if (episodeId !== detailId)
      continue
    const text = row.querySelector('[data-automation-id^="ep-title-"] h3')?.textContent?.trim()
    const episode = text?.match(/^(\d+)\.(.*)$/)
    if (episode?.[2]?.trim())
      return `S${season} E${episode[1]} ${episode[2].trim()}`
  }
  return ''
}

function getPlayerMetadata(video: HTMLVideoElement) {
  const player = video.closest('div[id^="dv-web-player"]')
    || (video === playbackVideo ? playbackRoot : null)
  const scope = player || document
  const heading = scope.querySelector('.atvwebplayersdk-player-container h1, .atvwebplayersdk-title-text')
  const title = heading?.textContent?.trim() || ''
  let subtitle = scope.querySelector('.atvwebplayersdk-episode-info')?.textContent?.trim()
    || scope.querySelector('.atvwebplayersdk-subtitle-text')?.textContent?.trim()
    || ''

  // New player layouts use ordinary elements next to the heading, without
  // the old episode-info class. Never search captions, next-up cards or the page.
  let parent = player ? heading?.parentElement : null
  for (let level = 0; parent && level < 2 && !subtitle; level++) {
    for (const sibling of parent.children) {
      if (sibling === heading || (heading && sibling.contains(heading)))
        continue
      if (sibling.closest(ignoredMetadataSelector) || sibling.querySelector(ignoredMetadataSelector))
        continue
      const text = sibling.textContent?.replace(/\s+/g, ' ').trim() || ''
      const episode = parseEpisode(text)
      if (episode && text.length <= 256) {
        subtitle = episode.text
        break
      }
    }
    parent = parent.parentElement
  }

  if (player && !subtitle) {
    let shortestEpisode = ''
    for (const element of player.querySelectorAll('div, span, p, h1, h2, h3')) {
      if (element.closest(ignoredMetadataSelector) || element.querySelector(ignoredMetadataSelector))
        continue
      const text = element.textContent?.replace(/\s+/g, ' ').trim() || ''
      const episode = text.length <= 256 ? parseEpisode(text) : null
      if (episode && (!shortestEpisode || episode.text.length < shortestEpisode.length))
        shortestEpisode = episode.text
    }
    subtitle = shortestEpisode
  }
  return { player, title, subtitle }
}

function resetPlaybackMetadata() {
  // A previous overlay can remain mounted while the next item loads.
  blockedSubtitle = playbackSubtitle || previousSubtitle || blockedSubtitle
  blockedPageKey = playbackKey || blockedPageKey
  playbackTitle = ''
  playbackSubtitle = ''
  playerTitle = ''
  metadataVersion++
}

function markMediaReset() {
  mediaReset = true
}

function updatePlaybackMetadata(video: HTMLVideoElement, fallbackTitle = '') {
  const { player, title, subtitle } = getPlayerMetadata(video)
  const key = getPlaybackKey()
  const source = video.currentSrc || video.src
  const sourceChanged = !!(source && playbackSource && source !== playbackSource)
  const videoChanged = !!(playbackVideo && playbackVideo !== video)
  const keyChanged = !!(playbackKey && key && playbackKey !== key)
  const playbackRestarted = (sourceChanged || videoChanged || mediaReset)
    && playbackTime > 30 && video.currentTime < 30
  // Compare two player titles, never a player title with a page/logo fallback.
  const titleChanged = !!(title && playerTitle && title !== playerTitle)
  if (keyChanged || playbackRestarted || titleChanged) {
    resetPlaybackMetadata()
    playbackKey = key
  }

  if (playbackVideo !== video) {
    playbackVideo?.removeEventListener('loadstart', markMediaReset)
    playbackVideo?.removeEventListener('emptied', markMediaReset)
    playerObserver?.disconnect()
    video.addEventListener('loadstart', markMediaReset)
    video.addEventListener('emptied', markMediaReset)
    if (player) {
      playerObserver = new MutationObserver((mutations) => {
        if (mutations.every(({ target }) => {
          const element = (target as Element).closest ? target as Element : target.parentElement
          return !!element?.closest(ignoredMetadataSelector)
        })) {
          return
        }
        if (playbackVideo === video && isPlayerVisible(player))
          updatePlaybackMetadata(video)
      })
      playerObserver.observe(player, { subtree: true, childList: true, characterData: true })
    }
  }
  playbackVideo = video
  if (player)
    playbackRoot = player
  // Preserve a known ID through generic routes until playback ends or changes.
  if (key)
    playbackKey = key
  if (source)
    playbackSource = source
  playbackTime = video.currentTime
  mediaReset = false
  if (title)
    playerTitle = title
  const currentTitle = title || playbackTitle || fallbackTitle
  if (currentTitle && currentTitle !== playbackTitle) {
    playbackTitle = currentTitle
    metadataVersion++
  }

  // Page metadata is an exact URL fallback. A source refresh at the same
  // playback position is technical; a rewind to the start blocks stale page data.
  const pageEpisode = !playbackSubtitle && blockedPageKey !== key ? getPageEpisode() : ''
  const episode = subtitle || pageEpisode
  const episodeText = parseEpisode(episode)?.text || episode
  // Different series can share an episode label. Require an exact page match
  // under a new detail ID; a changed query parameter cannot confirm stale data.
  const confirmedNewPage = !!pageEpisode
    && key.split('|')[0] !== blockedPageKey.split('|')[0]
    && (parseEpisode(pageEpisode)?.text || pageEpisode) === episodeText
  const isBlocked = !confirmedNewPage
    && episodeText === (parseEpisode(blockedSubtitle)?.text || blockedSubtitle)
  if (episode && episode !== playbackTitle && !isBlocked) {
    // A partially unmounted header must not shorten known episode information.
    const sameEpisode = parseEpisode(episode)?.identity === parseEpisode(playbackSubtitle)?.identity
    const partial = sameEpisode && playbackSubtitle.startsWith(episode) && episode.length < playbackSubtitle.length
    if (!partial && playbackSubtitle !== episode) {
      // A new episode may also appear before its own URL has been assigned.
      if (!key && playbackSubtitle && !sameEpisode)
        playbackKey = ''
      playbackSubtitle = episode
      metadataVersion++
    }
    blockedSubtitle = ''
  }
  if (episode && episode !== playbackTitle)
    previousSubtitle = episode
}

presence.on('UpdateData', async () => {
  const sequence = ++updateSequence
  const { pathname } = document.location

  const [usePresenceName, showCover, imageType] = await Promise.all([
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<number>('imageType'),
  ])
  if (sequence !== updateSequence)
    return

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const video = getActiveVideo()

  const title = document.querySelector('.atvwebplayersdk-player-container .fpqiyer .ffszj3z .f124tp54 h1')?.textContent || document.querySelector<HTMLImageElement>('.DVWebNode-detail-atf-wrapper picture img')?.alt || document.querySelector('.atvwebplayersdk-title-text')?.textContent || document.querySelector('h1[data-automation-id="title"]')?.textContent

  const title2 = document.querySelector('.DVWebNode-detail-atf-wrapper .BaLbyy h1')?.textContent || document.querySelector<HTMLImageElement>('.DVWebNode-detail-atf-wrapper picture img')?.alt || document.querySelector('.atvwebplayersdk-title-text')?.textContent || document.querySelector('h1[data-automation-id="title"]')?.textContent

  const bannerImg = document.querySelector<HTMLImageElement>('main div[data-automation-id="hero-background"] img')?.src

  const currentTitle = title?.trim() || title2?.trim() || ''
  const isPlayback = !!video

  if (isPlayback) {
    updatePlaybackMetadata(video, currentTitle)
  }
  else {
    resetPlaybackMetadata()
    playbackVideo?.removeEventListener('loadstart', markMediaReset)
    playbackVideo?.removeEventListener('emptied', markMediaReset)
    playerObserver?.disconnect()
    playerObserver = null
    playbackVideo = null
    playbackRoot = null
    playbackKey = ''
    playbackSource = ''
    playbackTime = 0
    mediaReset = false
    blockedSubtitle = ''
    previousSubtitle = ''
    blockedPageKey = ''
  }
  const version = metadataVersion

  if (isPlayback && playbackTitle) {
    const contentTitle = playbackTitle
    if (usePresenceName) {
      presenceData.name = contentTitle
    }
    presenceData.details = contentTitle

    if (playbackSubtitle) {
      presenceData.state = playbackSubtitle
    }

    if (bannerImg && showCover) {
      presenceData.largeImageKey = await getThumbnail(bannerImg, imageType)
    }

    if (video.paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = (await strings).paused
      delete presenceData.startTimestamp
    }
    else {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).playing
    }
  }
  else if (pathname.includes('/storefront') || pathname === '/') {
    presenceData.details = 'Viewing Home'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/detail')) {
    presenceData.details = 'Viewing page for:'
    presenceData.state = title || title2 || 'Prime Video'

    if (bannerImg && showCover) {
      presenceData.largeImageKey = await getThumbnail(bannerImg, imageType)
    }
  }
  else if (pathname.includes('/movie')) {
    presenceData.details = 'Viewing Movies'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/tv')) {
    presenceData.details = 'Viewing TV-Series'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/sports')) {
    presenceData.details = 'Viewing Sports'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/categories')) {
    presenceData.details = 'Viewing Categories'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/kids/')) {
    presenceData.details = 'Viewing Movies for kids'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/livetv')) {
    presenceData.details = 'Viewing Live TV'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('/search/') && document.querySelector('.av-refine-bar-summaries')) {
    presenceData.details = 'Searching for:';
    [presenceData.state] = document
      .querySelector('.av-refine-bar-summaries')
      ?.textContent
      ?.split(/["„]/)[1]
      ?.split(/[”"]/) ?? []
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/genre/')) {
    presenceData.details = 'Viewing Genres'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.includes('shop')) {
    presenceData.details = 'Browsing the store...'
  }

  // An older artwork request must never overwrite a newer episode update.
  if (sequence === updateSequence && version === metadataVersion)
    await presence.setActivity(presenceData)
})
