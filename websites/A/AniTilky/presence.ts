import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'
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
  getProfileImageFromDom,
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
  title?: string,
  ...candidates: Array<string | undefined>
): Promise<void> {
  if (!showCover) {
    presenceData.largeImageKey = ActivityAssets.Logo
    return
  }

  presenceData.largeImageKey = await resolveCoverImage(title, ...candidates)
}

function applyButtons(
  presenceData: PresenceData,
  settings: PluginSettings,
  buttons: ButtonData[],
): void {
  if (!settings.showButtons || settings.privacy || !buttons.length)
    return

  const valid = buttons
    .filter(button => typeof button.label === 'string' && button.label.length > 0 && button.label.length <= 32)
    .filter(button => typeof button.url === 'string' && /^https?:\/\//.test(button.url))
    .slice(0, 2)

  if (valid.length)
    presenceData.buttons = valid as [ButtonData, ButtonData?]
}

function getProfileTabLabel(tab: string | undefined, localized: PresenceStrings): string | undefined {
  if (!tab)
    return undefined
  const key = PROFILE_TABS[tab]
  return key ? localized[key] : tab
}

function getVideoElement(): HTMLVideoElement | null {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'))
  return videos.find(video => video.readyState > 0 || !Number.isNaN(video.duration) || video.currentSrc)
    ?? document.querySelector<HTMLVideoElement>('#video-container video')
    ?? document.querySelector<HTMLVideoElement>('video.plyr')
    ?? null
}

function applyWatchPlayback(
  presenceData: PresenceData,
  settings: PluginSettings,
  video: HTMLVideoElement | null,
): void {
  if (!video) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
    return
  }

  const paused = video.paused || video.ended
  const hasDuration = Number.isFinite(video.duration) && video.duration > 0

  if (settings.showSmallImages) {
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? strings.pause : strings.play
  }

  if (settings.showTimestamp && !paused && hasDuration) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
  }
  else {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
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
    if (pathname.startsWith('/watch/')) {
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

  switch (true) {
    case pathname === '/': {
      presenceData.details = 'AniTilky'
      presenceData.state = strings.home
      break
    }

    case pathname === '/animes': {
      const searchValue = document.querySelector<HTMLInputElement>('input[type="text"], input[type="search"]')?.value?.trim()
      presenceData.details = strings.animeList
      presenceData.state = searchValue || strings.browse
      break
    }

    case pathname === '/schedule' || pathname === '/takvim': {
      presenceData.details = strings.schedule
      presenceData.state = strings.viewPage
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
      await applyCover(
        presenceData,
        settings.showCover,
        userInfo?.username,
        userInfo?.profileImage,
        getProfileImageFromDom(),
      )

      applyButtons(presenceData, settings, [
        { label: (strings.viewProfile || 'Profile Git').slice(0, 32), url: `${BASE_URL}/profile` },
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

      await applyCover(
        presenceData,
        settings.showCover,
        userInfo?.username,
        userInfo?.profileImage,
        getProfileImageFromDom(),
      )

      applyButtons(presenceData, settings, [
        { label: (strings.viewProfile || 'Profile Git').slice(0, 32), url: `${BASE_URL}/u/${username}` },
      ])
      break
    }

    case pathname.startsWith('/watch/'): {
      const animeId = segments[1] || ''
      const params = new URLSearchParams(search)
      const seasonNumber = Number.parseInt(params.get('season') || '1', 10) || 1
      const episodeNumber = Number.parseInt(params.get('episode') || '1', 10) || 1
      const anime = await fetchAnime(animeId)
      const season = findSeason(anime, seasonNumber)
      const episode = findEpisode(season, episodeNumber)
      const title = getAnimeTitle(anime) || getPageTitle() || 'AniTilky'
      const video = getVideoElement()
      const animeUrl = `${BASE_URL}/anime/${anime?.slug || anime?._id || animeId}`
      const episodeUrl = `${BASE_URL}/watch/${anime?.slug || anime?._id || animeId}?season=${seasonNumber}&episode=${episodeNumber}`

      presenceData.type = ActivityType.Watching
      presenceData.details = title
      presenceData.state = formatEpisodeState(seasonNumber, episodeNumber, episode?.title)

      await applyCover(
        presenceData,
        settings.showCover,
        title,
        anime?.coverImage,
        anime?.bannerImage,
      )

      applyWatchPlayback(presenceData, settings, video)

      applyButtons(presenceData, settings, [
        { label: 'Bölüme Git', url: episodeUrl || href },
        { label: 'Anime Sayfası', url: animeUrl },
      ])

      return presence.setActivity(presenceData)
    }

    case pathname.startsWith('/anime/'): {
      const animeId = segments[1] || ''
      const anime = await fetchAnime(animeId)
      const title = getAnimeTitle(anime) || getPageTitle() || 'AniTilky'
      const animeUrl = `${BASE_URL}/anime/${anime?.slug || anime?._id || animeId}`

      presenceData.details = strings.viewingAnime
      presenceData.state = title
      await applyCover(
        presenceData,
        settings.showCover,
        title,
        anime?.coverImage,
        anime?.bannerImage,
      )

      applyButtons(presenceData, settings, [
        { label: 'Anime Sayfası', url: animeUrl },
        { label: 'İzlemeye Git', url: `${BASE_URL}/watch/${anime?.slug || anime?._id || animeId}` },
      ])
      break
    }

    default: {
      if (!settings.showBrowsingStatus)
        return presence.clearActivity()

      presenceData.details = strings.browse
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
