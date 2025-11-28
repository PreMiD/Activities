import { Assets } from 'premid'

const presence = new Presence({
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

  const path = document.location.pathname

  const groupMatch = path.match(/\/([^/]+)\/(?:feed|highlight|artist)/)
  const groupSlug = groupMatch ? groupMatch[1] : null
  const cachedThumb = groupSlug ? localStorage.getItem(`weverse_thumb_${groupSlug}`) : null
  const cachedName = groupSlug ? localStorage.getItem(`weverse_name_${groupSlug}`) : null

  if (path.includes('/live/')) {
    const titleElement = document.querySelector('h3[class*="media-post-header-_-title"]')
    const artistElement = document.querySelector('span[class*="media-post-profile-_-profile"]')
    const thumbElement = document.querySelector<HTMLImageElement>('.live-post-detail-layout-_-post_profiles img[class*="avatar-_-image"]')

    presenceData.details = titleElement?.textContent?.trim() || 'Unknown Title'
    presenceData.state = artistElement?.textContent?.trim() || 'Unknown Artist'

    if (thumbElement)
      presenceData.largeImageKey = thumbElement.src

    const video = document.querySelector('video')
    const isReplay = !!document.querySelector('[class*=LiveBadgeView_-replay]')

<<<<<<< HEAD
    if (isReplay) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Replay'
      if (showButtons) {
        presenceData.buttons = [{ label: `Watch Replay`, url: document.location.href }]
      }
    }
    else if (video) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Live
      presenceData.smallImageText = video.paused ? 'Paused' : 'Live'
      if (showButtons) {
        presenceData.buttons = [{ label: `Visit Live`, url: document.location.href }]
      }
    }
    else {
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live'
      if (showButtons) {
        presenceData.buttons = [{ label: `Visit Live`, url: document.location.href }]
      }
    }

    presence.setActivity(presenceData)
    return
  }

  if (path.includes('/highlight') || path.includes('/feed')) {
    const nameElement = document.querySelector('h3[class*="about-module-v2-_-title"]') || document.querySelector('[class*=HeaderCommunityDropdownWrapperView_name]')
    let thumbElement = document.querySelector<HTMLImageElement>('.about-module-v2-_-avatar img[class*="avatar-_-image"]') || document.querySelector<HTMLImageElement>('[class*=CommunityAsideWelcomeView_thumbnail] img')
=======
	getProfileThumbnailUrl(): string | undefined {
		return document.querySelector<HTMLImageElement>(
			"a[class*=CommunityProfileInfoView_link_thumbnail] img"
		)?.src;
	}

	getFanPostNickname(): string {
		const nicknameElement = document.querySelector(
			"#modal [class*=PostHeaderView_nickname]"
		);
		if (nicknameElement) {
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = nicknameElement.innerHTML;

			for (const el of Array.from(tempDiv.querySelectorAll("em, span")))
				el.remove();

			return tempDiv.textContent?.trim() ?? "Unknown User";
		}
		return "Unknown User";
	}

	getFanPostThumbnailUrl(): string | undefined {
		return document.querySelector<HTMLImageElement>(
			"#modal [class*=ProfileThumbnailView_thumbnail] img"
		)?.src;
	}
}

const presence = new Weverse({
		clientId: "1284048129414402109",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const privacy = await presence.getSetting<boolean>("privacy"),
		showButtons = await presence.getSetting<boolean>("buttons"),
		presenceData: PresenceData = {
			largeImageKey:
				"https://cdn.rcd.gg/PreMiD/websites/W/Weverse/assets/logo.png",
			startTimestamp: browsingTimestamp,
		};

	if (privacy) {
		presence.setActivity(presenceData);
		return;
	}
>>>>>>> 253495078cdbbe89610fac695a53445d8fc59045

    // Cache thumb and name for same community
    if (groupSlug && !thumbElement && cachedThumb) {
      thumbElement = { src: cachedThumb } as HTMLImageElement
    }
    else if (thumbElement && groupSlug) {
      localStorage.setItem(`weverse_thumb_${groupSlug}`, thumbElement.src)
    }

<<<<<<< HEAD
    let communityName = nameElement?.textContent?.trim() || 'Unknown Community'
    if (groupSlug && !nameElement && cachedName) {
      communityName = cachedName
    }
    else if (nameElement && groupSlug) {
      localStorage.setItem(`weverse_name_${groupSlug}`, communityName)
    }

    presenceData.details = `Viewing ${communityName} Community Feed`
    presenceData.state = communityName

    if (thumbElement)
      presenceData.largeImageKey = thumbElement.src

    if (showButtons) {
      presenceData.buttons = [{ label: `Visit ${communityName}`, url: document.location.href }]
    }

    presence.setActivity(presenceData)
    return
  }

  if (path.includes('/artist')) {
    const nameElement = document.querySelector('[class*=HeaderCommunityDropdownWrapperView_name]')
    let thumbElement = document.querySelector<HTMLImageElement>('[class*=CommunityAsideWelcomeView_thumbnail] img')

    if (groupSlug && !thumbElement && cachedThumb) {
      thumbElement = { src: cachedThumb } as HTMLImageElement
    }
    else if (thumbElement && groupSlug) {
      localStorage.setItem(`weverse_thumb_${groupSlug}`, thumbElement.src)
    }

    let communityName = nameElement?.textContent?.trim() || 'Unknown Artist'
    if (groupSlug && !nameElement && cachedName) {
      communityName = cachedName
    }
    else if (nameElement && groupSlug) {
      localStorage.setItem(`weverse_name_${groupSlug}`, communityName)
    }

    presenceData.details = 'Viewing Artist'
    presenceData.state = communityName

    if (thumbElement)
      presenceData.largeImageKey = thumbElement.src

    if (showButtons) {
      presenceData.buttons = [{ label: `View ${communityName}`, url: document.location.href }]
    }

    presence.setActivity(presenceData)
    return
  }

  if (path.includes('/moment')) {
    const nicknameElement = document.querySelector('[class*=PostHeaderView_nickname]')
    const thumbElement = document.querySelector<HTMLImageElement>('a[class*=PostHeaderView_thumbnail_wrap] img')

    presenceData.details = 'Viewing Moment'
    presenceData.state = nicknameElement?.textContent?.trim() || 'Unknown User'

    if (thumbElement)
      presenceData.largeImageKey = thumbElement.src

    if (showButtons) {
      presenceData.buttons = [{ label: `View Moment`, url: document.location.href }]
    }

    presence.setActivity(presenceData)
    return
  }

  if (path.includes('/media')) {
    const communityName = document.querySelector('[class*=HeaderCommunityDropdownWrapperView_name]')?.textContent?.trim() || 'Unknown Community'
    presenceData.details = 'Viewing Media'
    presenceData.state = communityName

    if (showButtons) {
      presenceData.buttons = [{ label: `View Media`, url: document.location.href }]
    }

    presence.setActivity(presenceData)
    return
  }

  if (path.includes('/profile')) {
    const profileName = document.querySelector('h3[class*=CommunityProfileInfoView_profile_name]')?.textContent?.trim() || 'Unknown User'
    const communityName = document.querySelector('[class*=HeaderCommunityDropdownWrapperView_name]')?.textContent?.trim() || 'Unknown Community'
    const thumbElement = document.querySelector<HTMLImageElement>('a[class*=CommunityProfileInfoView_link_thumbnail] img')

    presenceData.details = `Viewing Profile of ${profileName}`
    presenceData.state = `Community: ${communityName}`

    if (thumbElement)
      presenceData.largeImageKey = thumbElement.src

    if (showButtons) {
      presenceData.buttons = [{ label: `View Profile`, url: document.location.href }]
    }

    presence.setActivity(presenceData)
    return
  }

  if (path.includes('/fanpost/')) {
    const nicknameElement = document.querySelector('#modal [class*=PostHeaderView_nickname]')
    const thumbElement = document.querySelector<HTMLImageElement>('#modal [class*=ProfileThumbnailView_thumbnail] img')

    let nickname = 'Unknown User'
    if (nicknameElement) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = nicknameElement.innerHTML
      for (const el of Array.from(tempDiv.querySelectorAll('em, span'))) el.remove()
      nickname = tempDiv.textContent?.trim() || 'Unknown User'
    }

    presenceData.details = 'Viewing Fan Post'
    presenceData.state = nickname

    if (thumbElement)
      presenceData.largeImageKey = thumbElement.src

    if (showButtons) {
      presenceData.buttons = [{ label: `View Fan Post`, url: document.location.href }]
    }

    presence.setActivity(presenceData)
    return
  }

  presenceData.details = 'Browsing Weverse'
  presence.setActivity(presenceData)
})
=======
		const video = document.querySelector("video");
		if (document.querySelector("[class*=LiveBadgeView_-replay]") !== null) {
			presenceData.smallImageKey = Assets.Play;
			presenceData.smallImageText = "Replay";
			if (showButtons) {
				presenceData.buttons = [
					{
						label: `Watch ${presence.getArtistName()} Replay`,
						url: document.location.href,
					},
				];
			}
		} else if (video) {
			presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Live;
			presenceData.smallImageText = video.paused ? "Paused" : "Live";
			if (showButtons) {
				presenceData.buttons = [
					{
						label: `Visit ${presence.getArtistName()} Live`,
						url: document.location.href,
					},
				];
			}
		} else {
			presenceData.smallImageKey = Assets.Play;
			presenceData.smallImageText = "Playing";
			if (showButtons) {
				presenceData.buttons = [
					{
						label: `Watch ${presence.getArtistName()} Replay`,
						url: document.location.href,
					},
				];
			}
		}

		if (thumbnailUrl) presenceData.largeImageKey = thumbnailUrl;
	} else if (document.location.pathname === "/")
		presenceData.details = "Browsing Weverse";
	else if (document.location.pathname.includes("/feed")) {
		presenceData.details = "Viewing Community Feed";
		presenceData.state = presence.getCommunityName();
		const communityImageUrl = presence.getCommunityImageUrl();
		if (communityImageUrl) presenceData.largeImageKey = communityImageUrl;
	} else if (document.location.pathname.includes("/artist")) {
		presenceData.details = "Viewing Artist";
		presenceData.state = presence.getArtistPageName();
	} else if (document.location.pathname.includes("/moment")) {
		presenceData.details = "Viewing Moment";
		presenceData.state = presence.getMomentNickname();
		const momentThumbnailUrl = presence.getMomentThumbnailUrl();
		if (momentThumbnailUrl) presenceData.largeImageKey = momentThumbnailUrl;
	} else if (document.location.pathname.includes("/media")) {
		presenceData.details = "Viewing Media";
		presenceData.state = presence.getCommunityName();
	} else if (document.location.pathname.includes("/profile")) {
		presenceData.details = `Viewing Profile of ${presence.getProfileName()}`;
		presenceData.state = `Community: ${presence.getCommunityName()}`;
		const profileThumbnailUrl = presence.getProfileThumbnailUrl();
		if (profileThumbnailUrl) presenceData.largeImageKey = profileThumbnailUrl;
	} else if (document.location.pathname.includes("/fanpost/")) {
		presenceData.details = "Viewing Fan Post";
		presenceData.state = presence.getFanPostNickname();
		const fanPostThumbnailUrl = presence.getFanPostThumbnailUrl();
		if (fanPostThumbnailUrl) presenceData.largeImageKey = fanPostThumbnailUrl;
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
>>>>>>> 253495078cdbbe89610fac695a53445d8fc59045
