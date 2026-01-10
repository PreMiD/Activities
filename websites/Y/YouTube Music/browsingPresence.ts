import type { Strings } from './i18n.js'
import { ActivityType } from 'premid'
import { ActivityAssets } from './constants.js'

export function createBrowsingPresence(
  pathname: string,
  search: string,
  href: string,
  startTimestamp: number,
  strings: Strings,
  privacyMode: boolean,
): PresenceData {
  const basePresence: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: ActivityAssets.Logo,
    details: strings.browsing,
    startTimestamp,
  }

  if (pathname === '/')
    return { ...basePresence, details: strings.browsingHome }

  if (pathname === '/explore')
    return { ...basePresence, details: strings.browsingExplore }

  if (pathname.match(/\/library\//)) {
    const tabText = document.querySelector('#tabs .iron-selected .tab')?.textContent?.trim()
    return {
      ...basePresence,
      details: strings.browsingLibrary,
      state: privacyMode ? undefined : (tabText && tabText.length > 0 ? tabText : undefined),
    }
  }

  if (pathname.match(/^\/playlist/)) {
    if (privacyMode) {
      return {
        ...basePresence,
        type: ActivityType.Listening,
        details: strings.browsingAPlaylist,
      }
    }

    const isAlbum = document.querySelector('.strapline')

    const playlistOwnerText = document
      .querySelector<HTMLSpanElement>(
        isAlbum ? '.strapline a' : '#contents ytmusic-responsive-header-renderer yt-avatar-stack-view-model span',
      )
      ?.textContent
      ?.trim()
    const playlistOwner = playlistOwnerText && playlistOwnerText.length > 0
      ? playlistOwnerText
      : undefined

    const playlistTitleText = document.querySelector<HTMLHeadingElement>(
      '#contents ytmusic-responsive-header-renderer h1 .title',
    )?.textContent?.trim()
    const playlistTitle = playlistTitleText && playlistTitleText.length > 0 ? playlistTitleText : undefined

    const playlistPresence: PresenceData = {
      ...basePresence,
      type: ActivityType.Listening,
      details: isAlbum ? strings.browsingAlbum : strings.browsingPlaylist,
      largeImageKey:
        document.querySelector<HTMLImageElement>(isAlbum ? '.thumbnail img' : '.thumbnail:nth-child(2) img')
          ?.src
          || ActivityAssets.Logo,
      ...(playlistTitle ? { largeImageText: playlistTitle } : {}),
      smallImageKey:
        document.querySelector<HTMLImageElement>(
          isAlbum
            ? '.strapline .strapline-thumbnail img'
            : '#contents ytmusic-responsive-header-renderer yt-avatar-shape img',
        )?.src ?? ActivityAssets.SmallLogo,
      ...(playlistOwner ? { smallImageText: playlistOwner } : {}),
    }

    if (search === '?list=LM') {
      playlistPresence.state = strings.likedMusic
    }
    else {
      const metadataTitle = document.querySelector('.metadata .title')?.textContent?.trim()
      if (metadataTitle && metadataTitle.length > 0) {
        playlistPresence.state = metadataTitle
      }
      playlistPresence.buttons = [
        {
          label: isAlbum ? strings.viewAlbum : strings.showPlaylist,
          url: href,
        },
      ]
    }

    return playlistPresence
  }

  if (pathname.match(/^\/search/)) {
    const searchValue = document.querySelector<HTMLInputElement>('.search-container input')?.value?.trim()
    return {
      ...basePresence,
      details: privacyMode ? strings.searchingMusic : strings.searching,
      state: privacyMode ? undefined : (searchValue && searchValue.length > 0 ? searchValue : undefined),
      buttons: privacyMode
        ? undefined
        : [
            {
              label: strings.viewSearch,
              url: href,
            },
          ],
    }
  }

  if (pathname.match(/^\/channel/)) {
    const channelTitle = document.querySelector('#header .title')?.textContent?.trim()
    return {
      ...basePresence,
      details: privacyMode ? strings.browsingAChannel : strings.browsingChannel,
      state: privacyMode ? undefined : (channelTitle && channelTitle.length > 0 ? channelTitle : undefined),
      buttons: privacyMode
        ? undefined
        : [
            {
              label: strings.showChannel,
              url: href,
            },
          ],
    }
  }

  if (pathname.match(/^\/new_releases/)) {
    return {
      ...basePresence,
      details: strings.browsingNewReleases,
      buttons: privacyMode
        ? undefined
        : [
            {
              label: strings.showNewReleases,
              url: href,
            },
          ],
    }
  }

  if (pathname.match(/^\/charts/)) {
    return {
      ...basePresence,
      details: strings.browsingCharts,
      buttons: privacyMode
        ? undefined
        : [
            {
              label: strings.showCharts,
              url: href,
            },
          ],
    }
  }

  if (pathname.match(/^\/moods_and_genres/)) {
    return {
      ...basePresence,
      details: strings.browsingMoodsGenres,
      buttons: privacyMode
        ? undefined
        : [
            {
              label: strings.showMoodsGenres,
              url: href,
            },
          ],
    }
  }

  return basePresence
}
