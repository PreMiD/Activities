const presence = new Presence({
		clientId: "844106861711196179",
	}),
	strings = presence.getStrings({
		play: "general.playing",
		pause: "general.paused",
		live: "general.live",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000),
	containsTerm = (term: string) => {
		if (document.location.pathname.includes(term))
			return document.location.pathname;
	};

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "logo",
		},
		video = document.querySelector<HTMLVideoElement>(".iIZX3IGkM2eBzzWle1QQ"),
		showCover = await presence.getSetting<boolean>("cover"),
		mainTitle = document.querySelector(".bodyTitle___HwRP2");

	switch (document.location.pathname) {
		case "/mes-videos/":
			presenceData.state = "Mes Vidéos";
			break;
		case "/chaines/":
			presenceData.state = "Chaînes";
			break;
		case "/programme-tv/":
			presenceData.state = "Programme TV";
			break;
		case "/cinema/":
			presenceData.state = "Films";
			break;
		case "/series/":
			presenceData.state = "Séries";
			break;
		case "/live/":
			presenceData.state = "Chaînes en direct";
			break;
	}

	if (video && !isNaN(video.duration)) {
		const titleTvShows = document.querySelectorAll(".MGrm26svmXpUhj6dfbGN");
		let channelID = new URLSearchParams(window.location.search).get("channel");
		switch (document.location.pathname) {
			case containsTerm("live"):
				channelID = `${channelID.charAt(0)} ${channelID.substring(1)}`;
				presenceData.details = document.querySelector(
					".A6AH2oNkXUuOKJN5IYrL"
				).textContent;
				presenceData.state = `sur ${
					document.querySelector<HTMLImageElement>(
						`#\\3${channelID} > a > div > div > div > div > div > img`
					).alt
				}`;
				[presenceData.startTimestamp, presenceData.endTimestamp] =
					presence.getTimestamps(video.currentTime, video.duration);
				presenceData.largeImageKey = showCover
					? document.querySelector<HTMLImageElement>(
							`#\\3${channelID} > a > div > div > div > div > div > img`
					  ).src
					: "logo";
				presenceData.smallImageKey = "live";
				presenceData.smallImageText = "En direct";
				delete presenceData.startTimestamp;
				delete presenceData.endTimestamp;
				presenceData.startTimestamp = browsingTimestamp;
				break;
			case containsTerm("cinema"):
				presenceData.details = document.querySelector(
					".A6AH2oNkXUuOKJN5IYrL"
				).textContent;
				[presenceData.startTimestamp, presenceData.endTimestamp] =
					presence.getTimestamps(video.currentTime, video.duration);
				presenceData.largeImageKey = showCover
					? (presenceData.largeImageKey =
							document.querySelector<HTMLMetaElement>(
								"[property='og:image']"
							)?.content)
					: "logo";
				presenceData.smallImageKey = video.paused ? "pause" : "play";
				presenceData.smallImageText = video.paused
					? (await strings).pause
					: (await strings).play;
				break;
			case containsTerm("series"):
				presenceData.details = titleTvShows[0].textContent.trim();
				presenceData.state = titleTvShows[1].textContent.trim();
				[presenceData.startTimestamp, presenceData.endTimestamp] =
					presence.getTimestamps(video.currentTime, video.duration);
				presenceData.largeImageKey = showCover
					? (presenceData.largeImageKey =
							document.querySelector<HTMLMetaElement>(
								"[property='og:image']"
							)?.content)
					: "logo";
				presenceData.smallImageKey = video.paused ? "pause" : "play";
				presenceData.smallImageText = video.paused
					? (await strings).pause
					: (await strings).play;
				break;
		}
		if (video.paused) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;
		}
	} else if (mainTitle) {
		presenceData.details = "Regarde...";
		presenceData.state = mainTitle.textContent;
	} else presenceData.details = "Navigue...";

	presence.setActivity(presenceData);
});
