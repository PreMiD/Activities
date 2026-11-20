import type { Resolver } from '../util/index.js'
import { getVideoID } from './default.js'

function isActive(): boolean {
  return !!getTitle() && !!getUploader() && !!getVideoID() && !!getChannelURL()
}

function getTitle(): string | undefined {
  return (
    document
      .querySelector('.title.style-scope.ytd-video-primary-info-renderer')
      ?.textContent
      ?.trim()
      || document.querySelector('div.ytp-title-text > a')?.textContent?.trim()
  )
}

function getUploader(): string | undefined {
  return document
    .querySelector('.style-scope.ytd-channel-name > a')
    ?.textContent
    ?.trim()
}

function getChannelURL(): string | undefined {
  return document
    .querySelector<HTMLAnchorElement>('.style-scope.ytd-channel-name > a')
    ?.href
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
