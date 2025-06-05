import type { Resolver } from '../util/index.js'

function isActive(): boolean {
  return !!getTitle() && !!getUploader() && !!getVideoID() && !!getChannelURL()
}

function getTitle(): string | undefined {
  return document.querySelector('.ytd-miniplayer .title')?.textContent?.trim()
}

function getUploader(): string | undefined {
  return document.querySelector('#owner-name')?.textContent?.trim()
}

function getVideoID(): string | undefined {
  const link = document.querySelector<HTMLAnchorElement>('#video-title-link')?.href
  if (!link)
    return undefined

  return new URL(link).searchParams.get('v') ?? undefined
}

function getChannelURL(): string | undefined {
  return document.querySelector<HTMLAnchorElement>(
    '#ytd-player .ytp-ce-channel-title.ytp-ce-link',
  )?.href
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
