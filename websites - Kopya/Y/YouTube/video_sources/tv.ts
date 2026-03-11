import type { Resolver } from '../util/index.js'
import { truncateAfter } from '../util/index.js'
import { getChannelURL, getVideoID } from './default.js'

function isActive(): boolean {
  return (
    !!document.querySelector('.player-video-title')
    && !!getTitle()
    && !!getUploader()
    && !!getVideoID()
    && !!getChannelURL()
  )
}

function getTitle(): string | undefined {
  return document.querySelector('.player-video-title')?.textContent?.trim()
}

function getUploader(): string | undefined {
  let title = document
    .querySelector('.player-video-details')
    ?.textContent
    ?.trim()
  if (title)
    title = truncateAfter(title, '•')
  return title
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
