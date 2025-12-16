import type { Resolver } from '../util/index.js'
import { getVideoID } from './default.js'

function isActive(): boolean {
  return (
    !!document.querySelector('.watch-title')
    && document.location.pathname.includes('/watch')
    && !!getTitle()
    && !!getUploader()
    && !!getVideoID()
    && !!getChannelURL()
  )
}

function getChannelURL(): string | undefined {
  return document.querySelector<HTMLLinkElement>(
    '#top-row ytd-video-owner-renderer > a',
  )?.href
}

function getTitle(): string | undefined {
  return document.querySelector('.watch-title')?.textContent?.trim()
}

function getUploader(): string | undefined {
  return document.querySelector('#owner-name a')?.textContent?.trim()
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
