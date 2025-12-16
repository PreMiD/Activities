import type { Resolver } from '../util/index.js'

function isActive(): boolean {
  return (
    document.location.pathname.includes('/shorts/')
    && document.location.hostname === 'm.youtube.com'
    && !!getTitle()
    && !!getUploader()
    && !!getChannelURL()
    && !!getVideoID()
  )
}

function getTitle(): string | undefined {
  return getShortsElement()?.querySelector(
    '.ytShortsVideoTitleViewModelShortsVideoTitle',
  )?.textContent ?? undefined
}

function getUploader(): string | undefined {
  return getShortsElement()
    ?.querySelector<HTMLAnchorElement>(
      '.ytReelChannelBarViewModelChannelName a',
    )
    ?.textContent
    ?.replace(/^@/, '')
}

function getChannelURL(): string | undefined {
  const shortsLink = getShortsElement()?.querySelector<HTMLAnchorElement>(
    '.ytReelChannelBarViewModelChannelName a',
  )
  if (shortsLink) {
    const split = shortsLink.href.split('/')
    split.pop() // remove last item
    return split.join('/').replace(/^@/, '')
  }
  return undefined
}

export function getVideoID(): string {
  return document.location.pathname.split('/shorts/')[1]!
}

function getShortsElement(): HTMLElement | null {
  return document.querySelector(
    '.ytShortsCarouselCarouselItem[aria-hidden=false] shorts-video',
  )
}

function isMusic(): boolean {
  return false
}

const resolver: Resolver = {
  isActive,
  getTitle,
  getUploader,
  getChannelURL,
  getVideoID,
  isMusic,
}

export default resolver
