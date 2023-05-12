const presence = new Presence({
		clientId: "875631338663870485",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

enum Assets {
	Play = "https://i.imgur.com/q57RJjs.png",
	Pause = "https://i.imgur.com/mcEXiZk.png",
	Stop = "https://i.imgur.com/aLYu3Af.png",
	Search = "https://i.imgur.com/B7FxcD4.png",
	Question = "https://i.imgur.com/pIIJniP.png",
	Live = "https://i.imgur.com/0HVm46z.png",
	Reading = "https://i.imgur.com/5m10TTT.png",
	Writing = "https://i.imgur.com/Pa00qZh.png",
	Call = "https://i.imgur.com/PFdbnIf.png",
	Vcall = "https://i.imgur.com/6wG9ZvM.png",
	Downloading = "https://i.imgur.com/ryrDrz4.png",
	Uploading = "https://i.imgur.com/SwNDR5U.png",
	Repeat = "https://i.imgur.com/Ikh95KU.png",
	RepeatOne = "https://i.imgur.com/wh885z3.png",
	Premiere = "https://i.imgur.com/Zf8FSUR.png",
	PremiereLive = "https://i.imgur.com/yC4j9Lg.png",
	Viewing = "https://i.imgur.com/fpZutq6.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/ugI6cCC.png",
			startTimestamp: browsingTimestamp,
		},
		{ pathname, href } = document.location,
		[privacy, buttons, time] = await Promise.all(
			["privacy", "buttons", "time"].map(async setting => {
				const s = await presence.getSetting<boolean>(setting);
				return s;
			})
		);

	if (privacy) presenceData.details = "Using BitChute";
	else if (pathname === "/") {
		const tab = document.querySelector<HTMLLIElement>(
			"ul.nav.nav-tabs.nav-tabs-list > li.active"
		);
		presenceData.details = "At HomePage";
		if (tab) presenceData.state = `Viewing ${tab.textContent} Videos`;
	} else if (pathname.startsWith("/video")) {
		const title = document.querySelector<HTMLHeadingElement>("h1#video-title"),
			channelName = document.querySelector<HTMLAnchorElement>(
				".details > .name > a"
			),
			video = document.querySelector<HTMLVideoElement>("video#player");
		if (title) presenceData.details = `Watching ${title.textContent}`;
		if (channelName) {
			presenceData.state = `By ${channelName.textContent}`;
			if (buttons) {
				presenceData.buttons = [
					{
						label: "Watch Video",
						url: href,
					},
					{
						label: "View Channel",
						url: channelName.href,
					},
				];
			}
		}
		if (time && video && !video.paused) {
			[, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video);
			presenceData.smallImageText = presenceData.smallImageKey = Assets.Play;
		}
	} else if (pathname.startsWith("/channel")) {
		const name = document.querySelector<HTMLAnchorElement>(
			".details > .name > a"
		);
		presenceData.details = "Viewing Channel";
		if (name) {
			presenceData.state = name.textContent;
			if (buttons)
				presenceData.buttons = [{ label: "View Channel", url: href }];
		} else presenceData.details = "Viewing All Channels";
	} else if (pathname.startsWith("/category")) {
		const name = document.querySelector<HTMLHeadingElement>("h1.page-title");
		if (name) {
			presenceData.details = `Viewing Category: ${name.textContent}`;
			const tab = document.querySelector<HTMLLIElement>(
				"ul.nav.nav-tabs.nav-tabs-list > li.active"
			);
			if (tab) presenceData.state = `Looking at ${tab.textContent} videos`;
		}
	} else {
		switch (pathname) {
			case "/accounts/register": {
				presenceData.details = "Registering Account";
				break;
			}
			case "/accounts/login": {
				presenceData.details = "Logging In";
				break;
			}
			case "/profile/": {
				presenceData.details = "Viewing Profile";
				break;
			}
			case "/settings/": {
				presenceData.details = "Viewing Settings";
				break;
			}
			case "/notifications/": {
				presenceData.details = "Viewing Notifications";
				break;
			}
			default:
				if (pathname.startsWith("/playlist/")) {
					const playlistName =
						document.querySelector<HTMLHeadingElement>("h1#playlist-title");
					presenceData.details = "Viewing Playlist";
					if (playlistName) presenceData.state = playlistName.textContent;
				} else if (pathname.includes("monetization"))
					presenceData.details = "Looking at Monetization options";
				else if (pathname === "/help-us-grow/")
					presenceData.details = "At funding page";
				else if (pathname.startsWith("/search")) {
					const { search } = location;
					presenceData.details = `Searching for ${search.substring(
						7,
						search.includes("&") ? search.indexOf("&") : search.length
					)}`;
				}
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
