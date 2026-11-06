export interface Playback {
  paused: boolean
  currentTime: number
  duration: number
}

export type Page = { url: string } & (
  | { kind: 'browsing' }
  | { kind: 'search', query: string }
  | { kind: 'profile', id: string, title: string, image?: string }
  | { kind: 'channel', title: string, image?: string }
  | { kind: 'article', title: string }
  | { kind: 'video', id: string, title: string, creator?: string, image?: string, playback?: Playback, advertisement: boolean }
  | { kind: 'live', id: string, title: string, creator?: string, playback?: Playback }
  | { kind: 'illustration' | 'manga', id: string, title: string, creator?: string }
)

function text(root: ParentNode, selector: string) {
  return root.querySelector(selector)?.textContent?.trim() || undefined
}

function playback(media: HTMLVideoElement | null): Playback | undefined {
  if (!media || media.readyState === 0)
    return
  return { paused: media.paused, currentTime: media.currentTime, duration: media.duration }
}

function image(document: Document) {
  return document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content || undefined
}

function matchesDocument(url: URL, document: Document) {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href
    || document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content
  return !canonical || new URL(canonical, url).pathname.replace(/\/$/, '') === url.pathname.replace(/\/$/, '')
}

function readVideo(url: URL, document: Document, id: string): Page {
  const browsing: Page = { kind: 'browsing', url: url.href }
  if (url.pathname.startsWith('/shorts/')) {
    const entry = document.querySelector('[data-playlist-type="shorts"][data-playlist-state="active"]')
    if (entry?.getAttribute('data-playlist-entry-id') !== id)
      return browsing
    const thumbnail = entry.querySelector<HTMLImageElement>('img[src*="/nicovideo/thumbnails/"]')
    const title = thumbnail?.alt.trim()
    if (!title)
      return browsing
    return {
      kind: 'video',
      url: `https://www.nicovideo.jp/shorts/${id}`,
      id,
      title,
      creator: entry.querySelector<HTMLImageElement>('a[data-anchor-area="video_action"][href^="/user/"] img')?.alt.trim() || undefined,
      image: thumbnail?.src,
      playback: playback(entry.querySelector('video')),
      advertisement: false,
    }
  }

  if (!matchesDocument(url, document))
    return browsing
  const title = text(document, 'main h1')
  if (!title)
    return browsing
  const media = document.querySelector<HTMLVideoElement>('video[data-name="video-content"]')
  const thumbnailId = media?.poster.match(/\/nicovideo\/thumbnails\/(\d+)\//)?.[1]
  if (thumbnailId && thumbnailId !== id.replace(/^\D+/, ''))
    return browsing
  // The ad container stays mounted; its parent is opaque only during an ad.
  const adContainer = document.getElementById('nv_watch_VideoAdContainer')?.parentElement
  const advertisement = !!adContainer && document.defaultView?.getComputedStyle(adContainer).opacity === '1'
  const creator = Array.from(document.querySelectorAll('a[data-anchor-area="video_information"][href*="/user/"], a[data-anchor-area="video_information"][href*="ch.nicovideo.jp/"]'))
    .map(element => element.textContent?.trim())
    .find(Boolean)
  return {
    kind: 'video',
    url: `https://www.nicovideo.jp/watch/${id}`,
    id,
    title,
    creator,
    image: image(document),
    playback: advertisement ? undefined : playback(media),
    advertisement,
  }
}

export function readPage(url: URL, document: Document): Page {
  const browsing: Page = { kind: 'browsing', url: url.href }
  const { hostname, pathname } = url
  if (hostname === 'www.nicovideo.jp') {
    const videoId = pathname.match(/^\/(?:watch|shorts)\/((?:sm|so|nm|ss)\d+)\/?$/)?.[1]
    if (videoId)
      return readVideo(url, document, videoId)

    const userId = pathname.match(/^\/user\/(\d+)(?:\/|$)/)?.[1]
    if (userId) {
      const title = text(document, '.UserDetailsHeader-nickname')
      if (!title)
        return browsing
      const background = document.querySelector<HTMLElement>('.UserDetailsHeader .UserIcon-image')?.style.backgroundImage
      return {
        kind: 'profile',
        url: `https://www.nicovideo.jp/user/${userId}`,
        id: userId,
        title,
        image: background?.match(/url\(["']?([^"')]+)["']?\)/)?.[1],
      }
    }

    const search = pathname.match(/^\/(?:search|tag|search_shorts|tag_shorts|mylist_search|user_search|series_search)\/(.*)$/)?.[1]
    if (search !== undefined) {
      try {
        return { kind: 'search', url: url.href, query: decodeURIComponent(search).trim() }
      }
      catch {
        return browsing
      }
    }
  }
  else if (hostname === 'dic.nicovideo.jp') {
    const heading = document.querySelector('#article-title-box h1.article_title_inline')
    if (heading && document.querySelector('#article')) {
      const title = Array.from(heading.childNodes)
        .filter(node => !(node instanceof Element && node.classList.contains('st-label_title-category')))
        .map(node => node.textContent)
        .join('')
        .trim()
      if (title) {
        return {
          kind: 'article',
          url: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || `${url.origin}${pathname}`,
          title,
        }
      }
    }
  }
  else if (hostname === 'ch.nicovideo.jp') {
    const title = text(document, '.channel_name')
    if (title && matchesDocument(url, document)) {
      return {
        kind: 'channel',
        url: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || `${url.origin}${pathname}`,
        title,
        image: image(document),
      }
    }
  }
  else if (hostname === 'live.nicovideo.jp' || hostname === 'live2.nicovideo.jp') {
    const id = pathname.match(/^\/watch\/(lv\d+)\/?$/)?.[1]
    if (id) {
      const title = text(document, '[class^="___program-title___"] span')
      if (!title || !matchesDocument(url, document))
        return browsing
      return {
        kind: 'live',
        url: `${url.origin}/watch/${id}`,
        id,
        title,
        creator: text(document, 'a.label, a.channel-name-anchor'),
        playback: playback(document.querySelector('video')),
      }
    }
  }
  else if (hostname === 'seiga.nicovideo.jp') {
    const match = pathname.match(/^\/(?:seiga\/(im\d+)|watch\/(mg\d+))\/?$/)
    const id = match?.[1] || match?.[2]
    if (id) {
      const title = text(document, '.title')
      if (!title || !matchesDocument(url, document))
        return browsing
      return {
        kind: match?.[1] ? 'illustration' : 'manga',
        url: `${url.origin}${pathname}`,
        id,
        title,
        creator: text(document, match?.[1] ? '#ko_watchlist_header.user .user_name strong' : '.author_name'),
      }
    }
  }
  return browsing
}
