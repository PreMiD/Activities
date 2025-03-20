import type { Resolver } from '../util/index.js'
import { getChannelURL, getVideoID } from './default.js'

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

const resolver: Resolver = {
  isActive,
  getTitle,
  getUploader,
  getChannelURL,
  getVideoID,
}

export default resolver
