import type { Resolver } from '../util/index.js'

function isActive(): boolean {
  return (
    document.location.hostname === 'm.youtube.com'
    && !!getTitle()
    && !!getUploader()
    && !!getVideoID()
    && !!getChannelURL()
  )
}

function getTitle(): string | undefined {
  return document
    .querySelector('h2[class*=video-information-title]')
    ?.textContent
    ?.trim()
}

function getUploader(): string | undefined {
  return document
    .querySelector('[class*=owner-channel-name]')
    ?.textContent
    ?.trim()
}

export function getVideoID(): string | undefined {
  return new URLSearchParams(document.location.search).get('v') ?? undefined
}

export function getChannelURL(): string | undefined {
  return document.querySelector<HTMLAnchorElement>(
    'a[class*=owner-icon-and-title]',
  )?.href
}

function isMusic(): boolean {
  return (document.getElementById('app') as any)
    ?.data
    ?.playerResponse
    ?.microformat
    ?.playerMicroformatRenderer
    ?.category === 'Music'
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
