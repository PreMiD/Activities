import { Assets } from 'premid'

class Weverse extends Presence {
  constructor(options: PresenceOptions) {
    super(options)
  }

  getArtistName(): string {
    return (
      document
        .querySelector('[class*=LiveArtistProfileView_name_item]')
        ?.textContent
        ?.trim() ?? 'Unknown Artist'
    )
  }

  getStreamTitle(): string {
    const titleElement = document.querySelector('h2[class*=TitleView_title]')
    if (titleElement) {
      const titleTextNodes = Array.from(titleElement.childNodes).filter(
        node =>
          !(
            node instanceof HTMLElement
            && node.matches('[class*=LiveBadgeView_badge]')
          ),
      )
      return (
        titleTextNodes
          .map(node => node.textContent)
          .join('')
          .trim() || 'Unknown Title'
      )
    }
    return 'Unknown Title'
  }

  getThumbnailUrl(): string | undefined {
    return document.querySelector<HTMLImageElement>(
      '[class*=ProfileThumbnailView_thumbnail_wrap] img',
    )?.src
  }

  getCommunityName(): string {
    return (
      document
        .querySelector('[class*=HeaderCommunityDropdownWrapperView_name]')
        ?.textContent
        ?.trim() ?? 'Unknown Community'
    )
  }

  getCommunityImageUrl(): string | undefined {
    return document.querySelector<HTMLImageElement>(
      '[class*=CommunityAsideWelcomeView_thumbnail] img',
    )?.src
  }

  getArtistPageName(): string {
    return (
      document
        .querySelector('[class*=HeaderCommunityDropdownWrapperView_name]')
        ?.textContent
        ?.trim() ?? 'Unknown Artist'
    )
  }

  getMomentThumbnailUrl(): string | undefined {
    return document.querySelector<HTMLImageElement>(
      'a[class*=PostHeaderView_thumbnail_wrap] img',
    )?.src
  }

  getMomentNickname(): string {
    return (
      document
        .querySelector('[class*=PostHeaderView_nickname]')
        ?.textContent
        ?.trim() ?? 'Unknown User'
    )
  }

  getProfileName(): string {
    return (
      document
        .querySelector('h3[class*=CommunityProfileInfoView_profile_name]')
        ?.textContent
        ?.trim() ?? 'Unknown User'
    )
  }

  getProfileThumbnailUrl(): string | undefined {
    return document.querySelector<HTMLImageElement>(
      'a[class*=CommunityProfileInfoView_link_thumbnail] img',
    )?.src
  }

  getFanPostNickname(): string {
    const nicknameElement = document.querySelector(
      '#modal [class*=PostHeaderView_nickname]',
    )
    if (nicknameElement) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = nicknameElement.innerHTML

      for (const el of Array.from(tempDiv.querySelectorAll('em, span')))
        el.remove()

      return tempDiv.textContent?.trim() ?? 'Unknown User'
    }
    return 'Unknown User'
  }

  getFanPostThumbnailUrl(): string | undefined {
    return document.querySelector<HTMLImageElement>(
      '#modal [class*=ProfileThumbnailView_thumbnail] img',
    )?.src
  }
}

const presence = new Weverse({
  clientId: '1284048129414402109',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const privacy = await presence.getSetting<boolean>('privacy')
  const showButtons = await presence.getSetting<boolean>('buttons')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Weverse/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (privacy) {
    presence.setActivity(presenceData)
    return
  }

  if (document.location.pathname.includes('/live/')) {
    const thumbnailUrl = presence.getThumbnailUrl()
    presenceData.details = presence.getStreamTitle()
    presenceData.state = presence.getArtistName()

    const video = document.querySelector('video')
    if (document.querySelector('[class*=LiveBadgeView_-replay]') !== null) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Replay'
      if (showButtons) {
        presenceData.buttons = [
          {
            label: `Watch ${presence.getArtistName()} Replay`,
            url: document.location.href,
          },
        ]
      }
    }
    else if (video) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Live
      presenceData.smallImageText = video.paused ? 'Paused' : 'Live'
      if (showButtons) {
        presenceData.buttons = [
          {
            label: `Visit ${presence.getArtistName()} Live`,
            url: document.location.href,
          },
        ]
      }
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
      if (showButtons) {
        presenceData.buttons = [
          {
            label: `Watch ${presence.getArtistName()} Replay`,
            url: document.location.href,
          },
        ]
      }
    }

    if (thumbnailUrl)
      presenceData.largeImageKey = thumbnailUrl
  }
  else if (document.location.pathname === '/') {
    presenceData.details = 'Browsing Weverse'
  }
  else if (document.location.pathname.includes('/feed')) {
    presenceData.details = 'Viewing Community Feed'
    presenceData.state = presence.getCommunityName()
    const communityImageUrl = presence.getCommunityImageUrl()
    if (communityImageUrl)
      presenceData.largeImageKey = communityImageUrl
  }
  else if (document.location.pathname.includes('/artist')) {
    presenceData.details = 'Viewing Artist'
    presenceData.state = presence.getArtistPageName()
  }
  else if (document.location.pathname.includes('/moment')) {
    presenceData.details = 'Viewing Moment'
    presenceData.state = presence.getMomentNickname()
    const momentThumbnailUrl = presence.getMomentThumbnailUrl()
    if (momentThumbnailUrl)
      presenceData.largeImageKey = momentThumbnailUrl
  }
  else if (document.location.pathname.includes('/media')) {
    presenceData.details = 'Viewing Media'
    presenceData.state = presence.getCommunityName()
  }
  else if (document.location.pathname.includes('/profile')) {
    presenceData.details = `Viewing Profile of ${presence.getProfileName()}`
    presenceData.state = `Community: ${presence.getCommunityName()}`
    const profileThumbnailUrl = presence.getProfileThumbnailUrl()
    if (profileThumbnailUrl)
      presenceData.largeImageKey = profileThumbnailUrl
  }
  else if (document.location.pathname.includes('/fanpost/')) {
    presenceData.details = 'Viewing Fan Post'
    presenceData.state = presence.getFanPostNickname()
    const fanPostThumbnailUrl = presence.getFanPostThumbnailUrl()
    if (fanPostThumbnailUrl)
      presenceData.largeImageKey = fanPostThumbnailUrl
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
