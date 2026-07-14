import { ActivityType, Assets } from 'premid'
import type { PluginSettings } from './types.js'
import { fetchAnime } from './functions/fetchAnime.js'
import { fetchUser } from './functions/fetchUser.js'
import {
  ActivityAssets,
  BASE_URL,
  findEpisode,
  findSeason,
  formatEpisodeState,
  getAnimeTitle,
  getPageTitle,
  getProfileUsernameFromDom,
  parsePathSegments,
  resolveCoverImage,
} from './functions/helpers.js'
import { getStrings, PROFILE_TABS, type PresenceStrings } from './functions/strings.js'

const presence = new Presence({
  clientId: '1124065204200820786',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let strings: PresenceStrings
let oldLang: string | null = null

async function getSettings(): Promise<PluginSettings> {
  const [
    lang,
    privacy,
    showCover,
    showTimestamp,
    showBrowsingStatus,
    showButtons,
    showProfiles,
    showSmallImages,
  ] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showBrowsingStatus'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showProfiles'),
    presence.getSetting<boolean>('showSmallImages'),
  ])

  return {
    lang,
    privacy,
    showCover,
    showTimestamp,
    showBrowsingStatus,
    showButtons,
    showProfiles,
    showSmallImages,
  }
}

async function applyCover(
  presenceData: PresenceData,
  showCover: boolean,
  preferred?: string,
  fallback?: string,
): Promise<void> {
  if (!showCover) {
    presenceData.largeImageKey = ActivityAssets.Logo
    return
  }

  presenceData.largeImageKey = await resolveCoverImage(preferred, fallback)
}

function applyButtons(
  presenceData: PresenceData,
  settings: PluginSettings,
  buttons?: ButtonData[],
): void {
  if (settings.showButtons && !settings.privacy && buttons?.length)
    presenceData.buttons = buttons.slice(0, 2) as [ButtonData, ButtonData?]
}

function getProfileTabLabel(tab: string | undefined, localized: PresenceStrings): string | undefined {
  if (!tab)
    return undefined
  const key = PROFILE_TABS[tab]
  return key ? localized[key] : tab
}

function getVideoElement(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>('#video-container video')
    ?? document.querySelector<HTMLVideoElement>('video.plyr')
    ?? document.querySelector<HTMLVideoElement>('video')
}

function setBrowsingActivity(presenceData: PresenceData, settings: PluginSettings): void {
  presenceData.details = strings.browse
  presenceData.largeImageKey = ActivityAssets.Logo
  presenceData.startTimestamp = browsingTimestamp
  presenceData.smallImageKey = Assets.Reading
  presenceData.smallImageText = strings.browse
  delete presenceData.state

  if (!settings.showBrowsingStatus)
    presence.clearActivity()
  else
    presence.setActivity(presenceData)
}

presence.on('UpdateData', async () => {
  const settings = await getSettings()

  if (oldLang !== settings.lang || !strings) {
    oldLang = settings.lang
    strings = await getStrings(presence, settings.lang)
  }

  const { pathname, href, search } = document.location
  const segments = parsePathSegments(pathname)
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  } as PresenceData

  if (settings.privacy) {
    const video = getVideoElement()
    if (pathname.startsWith('/watch/') && video && !Number.isNaN(video.duration)) {
      return presence.setActivity({
        type: ActivityType.Watching,
        details: strings.privacyWatching,
        largeImageKey: ActivityAssets.Logo,
      })
    }

    if (settings.showBrowsingStatus) {
      return presence.setActivity({
        details: strings.privacyBrowsing,
        largeImageKey: ActivityAssets.Logo,
        startTimestamp: browsingTimestamp,
      })
    }

    return presence.clearActivity()
  }

  if (pathname.startsWith('/manga'))
    return setBrowsingActivity(presenceData, settings)

  switch (true) {
    case pathname === '/': {
      presenceData.details = 'AniTilky'
      presenceData.state = strings.home
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = strings.browse
      break
    }

    case pathname === '/animes': {
      const searchValue = document.querySelector<HTMLInputElement>('input[type="text"], input[type="search"]')?.value?.trim()
      presenceData.details = strings.animeList
      presenceData.state = searchValue || strings.browse
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = searchValue ? strings.search : strings.viewPage
      break
    }

    case pathname === '/schedule' || pathname === '/takvim': {
      presenceData.details = strings.schedule
      presenceData.state = strings.viewPage
      presenceData.smallImageKey = Assets.Reading
      break
    }

    case pathname === '/users': {
      presenceData.details = strings.users
      presenceData.state = strings.browse
      break
    }

    case pathname === '/notifications': {
      presenceData.details = strings.notifications
      presenceData.state = strings.viewPage
      break
    }

    case pathname === '/settings': {
      presenceData.details = strings.settings
      presenceData.smallImageKey = Assets.Viewing
      break
    }

    case pathname === '/login': {
      presenceData.details = strings.login
      break
    }

    case pathname.startsWith('/register'): {
      presenceData.details = strings.register
      break
    }

    case pathname.startsWith('/donation'): {
      presenceData.details = strings.donation
      presenceData.state = strings.viewPage
      break
    }

    case pathname.startsWith('/admin'): {
      presenceData.details = strings.admin
      presenceData.state = getPageTitle() || strings.viewPage
      presenceData.type = ActivityType.Playing
      break
    }

    case pathname.startsWith('/profile'): {
      if (!settings.showProfiles)
        return presence.clearActivity()

      const tab = segments[1]
      const username = getProfileUsernameFromDom()
      const userInfo = username ? await fetchUser(username) : null

      presenceData.details = strings.ownProfile
      presenceData.state = userInfo?.username || getProfileTabLabel(tab, strings) || strings.viewPage
      await applyCover(presenceData, settings.showCover, userInfo?.profileImage)

      if (settings.showSmallImages && userInfo?.profileImage) {
        presenceData.smallImageKey = userInfo.profileImage
        presenceData.smallImageText = userInfo.username
      }

      applyButtons(presenceData, settings, [
        { label: strings.viewProfile, url: `${BASE_URL}/profile` },
      ])
      break
    }

    case pathname.startsWith('/u/'): {
      if (!settings.showProfiles)
        return presence.clearActivity()

      const username = segments[1] || ''
      const tab = segments[2]
      const userInfo = await fetchUser(username)

      presenceData.details = strings.viewingProfile
      presenceData.state = userInfo?.username || username
      if (tab) {
        const tabLabel = getProfileTabLabel(tab, strings)
        if (tabLabel)
          presenceData.state = `${presenceData.state} · ${tabLabel}`
      }

      await applyCover(presenceData, settings.showCover, userInfo?.profileImage)

      if (settings.showSmallImages && userInfo?.profileImage) {
        presenceData.smallImageKey = userInfo.profileImage
        presenceData.smallImageText = userInfo.username
      }

      applyButtons(presenceData, settings, [
        { label: strings.viewProfile, url: `${BASE_URL}/u/${username}` },
      ])
      break
    }

    case /^\/watch\/[^/]+$/.test(pathname): {
      const animeId = segments[1] || ''
      const params = new URLSearchParams(search)
      const seasonNumber = Number.parseInt(params.get('season') || '1', 10)
      const episodeNumber = Number.parseInt(params.get('episode') || '1', 10)
      const anime = await fetchAnime(animeId)
      const season = findSeason(anime, seasonNumber)
      const episode = findEpisode(season, episodeNumber)
      const title = getAnimeTitle(anime) || getPageTitle() || 'AniTilky'
      const video = getVideoElement()

      presenceData.type = ActivityType.Watching
      presenceData.details = title
      presenceData.state = formatEpisodeState(
        strings.seasonEpisode,
        seasonNumber,
        episodeNumber,
        episode?.title,
      )

      await applyCover(
        presenceData,
        settings.showCover,
        anime?.coverImage,
        anime?.bannerImage,
      )

      if (anime)
        presenceData.largeImageText = [anime.type, anime.status].filter(Boolean).join(' · ')

      if (video && !Number.isNaN(video.duration)) {
        const { paused } = video
        if (settings.showSmallImages) {
          presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
          presenceData.smallImageText = paused ? strings.pause : strings.play
        }

        if (settings.showTimestamp && !paused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
        }
        else {
          delete presenceData.startTimestamp
        }
      }
      else {
        delete presenceData.startTimestamp
      }

      applyButtons(presenceData, settings, [
        { label: strings.watchEpisode, url: href },
        {
          label: strings.viewSeries,
          url: `${BASE_URL}/anime/${anime?.slug || anime?._id || animeId}`,
        },
      ])

      return presence.setActivity(presenceData)
    }

    case /^\/anime\/[^/]+$/.test(pathname): {
      const animeId = segments[1] || ''
      const anime = await fetchAnime(animeId)
      const title = getAnimeTitle(anime) || getPageTitle() || 'AniTilky'

      presenceData.details = strings.viewingAnime
      presenceData.state = title
      await applyCover(
        presenceData,
        settings.showCover,
        anime?.coverImage,
        anime?.bannerImage,
      )

      if (anime) {
        const genrePreview = anime.genres?.slice(0, 2).join(', ')
        presenceData.largeImageText = [anime.type, anime.status, genrePreview].filter(Boolean).join(' · ')
      }

      applyButtons(presenceData, settings, [
        { label: strings.viewSeries, url: `${BASE_URL}/anime/${anime?.slug || anime?._id || animeId}` },
      ])
      break
    }

    default:
      return setBrowsingActivity(presenceData, settings)
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
