import type { Resolver } from '../util/index.js'

function isActive(): boolean {
  return !!getTitle() && !!getUploader() && !!getVideoID() && !!getChannelURL()
}

function getTitle(): string | undefined {
  return getBaseSection()
    ?.querySelector('h1 yt-formatted-string.ytd-video-primary-info-renderer')
    ?.textContent
    ?.trim()
}

function getUploader(): string | undefined {
  return getBaseSection()
    ?.querySelector('a.ytd-video-description-infocards-section-renderer #title')
    ?.textContent
    ?.trim()
}

export function getVideoID(): string | undefined {
  return (
    getBaseSection()
      ?.querySelector('#page-manager > [video-id]')
      ?.getAttribute('video-id')
      ?? new URLSearchParams(document.location.search).get('v')
  ) ?? undefined
}

export function getChannelURL(): string | undefined {
  return getBaseSection()?.querySelector<HTMLAnchorElement>(
    'a.ytd-video-description-infocards-section-renderer',
  )?.href
}

function getBaseSection(): HTMLElement | null {
  return document.querySelector('.ytd-page-manager:not([hidden])')
}

function isMusic(): boolean {
  const microformat = JSON.parse(document.querySelector('#microformat script[type="application/ld+json"]')?.textContent || '{}')
  return microformat?.genre === 'Music'
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
