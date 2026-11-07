import { Assets } from 'premid'
import { ActivityAssets } from '../constants.js'
import { setMode } from '../state/presence-state.js'

import anime from './handlers/Anime.js'
import home from './handlers/Home.js'
import schedule from './handlers/Schedule.js'
import search from './handlers/Search.js'
import watch from './handlers/Watch.js'

export interface RouteContext {
  presence: Presence
  privacy: boolean
  showButtons: boolean
  displayType: number
  href: string
  resolvedUrl: URL
  animeTitle: string
  poster: string
  browsingTimestamp: number
  // Search-specific
  searchQuery?: string
  // Watch-specific
  episode?: string
  language?: string
  episodeLabel?: string
  watchingStateLabel?: string
  detailUrl?: string | null
  seasonEpisodeText?: string | undefined
  currentTime?: number
  duration?: number
  paused?: boolean
}

type RouteHandler = (context: RouteContext) => void
type RouteType = Record<string, RouteHandler>

const routes: RouteType = {
  home,
  search,
  schedule,
  anime,
  watch,
}

function cleanText(text?: string | null): string {
  return text?.replace(/\s+/g, ' ').trim() ?? ''
}

function fallback(context: RouteContext) {
  setMode('browse')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  presenceData.details = 'Browsing Re:ANIME'
  if (!context.privacy)
    presenceData.state = cleanText(document.title) || 'Exploring'
  presenceData.startTimestamp = context.browsingTimestamp
  presenceData.smallImageKey = Assets.Viewing
  presenceData.smallImageText = 'Browsing'
  context.presence.setActivity(presenceData)
}

export function route(routeName: string, context: RouteContext) {
  const dispatch = routes[routeName]
  if (dispatch) {
    dispatch(context)
    return
  }

  fallback(context)
}
