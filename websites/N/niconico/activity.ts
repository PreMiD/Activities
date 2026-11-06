import type { Page } from './pages.js'
import type { Strings } from './strings.js'
import { ActivityType, Assets, getTimestamps } from 'premid'

export interface Settings {
  privacy: boolean
  buttons: boolean
  ads: boolean
  pause: boolean
  playback: boolean
}

const logo = 'https://cdn.rcd.gg/PreMiD/websites/N/niconico/assets/logo.png'
const privacyLabels: Partial<Record<Page['kind'], keyof Strings>> = {
  video: 'buttonWatchVideo',
  live: 'buttonWatchStream',
  profile: 'viewProfile',
  channel: 'viewChannel',
  article: 'reading',
  search: 'searchSomething',
}

export function buildActivity(page: Page, settings: Settings, strings: Strings): PresenceData {
  const data: PresenceData = { type: ActivityType.Watching, largeImageKey: logo, details: strings.browse }
  if (settings.privacy) {
    data.details = strings[privacyLabels[page.kind] ?? 'browse']
    return data
  }
  let button: string | undefined

  switch (page.kind) {
    case 'video': {
      if (page.advertisement && settings.ads) {
        data.details = strings.watchingAd
        break
      }
      data.details = page.title
      data.state = `${page.creator || strings.deletedUser} ／ ${page.id}`
      data.largeImageKey = page.image || logo
      button = strings.buttonWatchVideo
      const media = page.playback
      if (media && settings.pause) {
        data.smallImageKey = media.paused ? Assets.Pause : Assets.Play
        data.smallImageText = media.paused ? strings.pause : strings.play
      }
      if (settings.playback && media && !media.paused && Number.isFinite(media.duration) && media.duration > 0 && Number.isFinite(media.currentTime)) {
        [data.startTimestamp, data.endTimestamp] = getTimestamps(media.currentTime, media.duration)
      }
      break
    }
    case 'live': {
      data.details = page.title
      data.state = [page.creator, page.id].filter(Boolean).join(' ／ ')
      data.smallImageKey = Assets.Live
      data.smallImageText = strings.live
      button = strings.buttonWatchStream
      if (settings.playback && page.playback && !page.playback.paused && Number.isFinite(page.playback.currentTime))
        [data.startTimestamp] = getTimestamps(page.playback.currentTime, 0)
      break
    }
    case 'profile':
      data.details = strings.viewProfile
      data.state = `${page.title} ／ ${page.id}`
      data.largeImageKey = page.image || logo
      button = strings.buttonViewProfile
      break
    case 'channel':
      data.details = strings.viewChannel
      data.state = page.title
      data.largeImageKey = page.image || logo
      button = strings.buttonViewChannel
      break
    case 'article':
      data.details = strings.readingArticle
      data.state = page.title
      data.smallImageKey = Assets.Reading
      data.smallImageText = strings.reading
      button = strings.buttonReadArticle
      break
    case 'search':
      data.details = page.query ? strings.searchFor : strings.searchSomething
      data.state = page.query || undefined
      data.smallImageKey = Assets.Search
      data.smallImageText = strings.search
      break
    case 'illustration':
    case 'manga':
      data.details = page.title
      data.state = [page.creator, page.id].filter(Boolean).join(' ／ ')
      break
  }

  if (button && settings.buttons)
    data.buttons = [{ label: button, url: page.url }]
  return data
}
