import type { Resolver } from '../util/index.js'
import { getChannelURL, getVideoID } from './default.js'

function isActive(): boolean {
  return (
    document.location.pathname.includes('/embed')
    && !!getTitle()
    && !!getUploader()
    && !!getVideoID()
    && !!getChannelURL()
  )
}

function getTitle(): string | undefined {
  return document
    .querySelector('[class="reel-video-in-sequence style-scope ytd-shorts"]')
    ?.querySelector(
      '[class="title style-scope ytd-reel-player-header-renderer"]',
    )
    ?.textContent
    ?.trim()
}

function getUploader(): string | undefined {
  return document
    .querySelector('div.ytp-title-expanded-heading > h2 > a')
    ?.textContent
    ?.trim()
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
