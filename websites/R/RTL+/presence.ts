const presence = new Presence({
		clientId: "1033504954763198545",
	}),
	getStrings = async () => {
		return presence.getStrings(
			{
				play: "general.playing",
				pause: "general.paused",
			},
			await presence.getSetting<string>("lang").catch(() => "en")
		);
	},
	browsingTimestamp = Math.floor(Date.now() / 1000);

let title: string,
	currentTime: number,
	video: HTMLVideoElement,
	duration: number,
	paused: boolean,
	strings: Awaited<ReturnType<typeof getStrings>> = null;

presence.on("UpdateData", async () => {
	const [startTimestamp, endTimestamp] = presence.getTimestamps(
			Math.floor(currentTime),
			Math.floor(duration)
		),
		presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/fMMsZfV.png",
		},
		{ pathname, href } = document.location;

	if (!strings) strings = await getStrings();

	if (document.querySelector("#bitmovinplayer-video-player_container")) {
		video = document.querySelector(
			"#bitmovinplayer-video-player_container"
		) as HTMLVideoElement;
		({ currentTime, duration, paused } = video);

		if (!isNaN(duration)) {
			const footerEles = document.querySelectorAll("li.ng-star-inserted"),
				cover: HTMLImageElement = document.querySelector("img.dvd-cover");

			presenceData.smallImageKey = paused
				? "https://i.imgur.com/C6mbMYz.png"
				: "https://i.imgur.com/crCKEaC.png";
			presenceData.smallImageText = paused ? strings.pause : strings.play;
			presenceData.startTimestamp = startTimestamp;
			presenceData.endTimestamp = endTimestamp;
			presenceData.buttons = [
				{
					label: "View",
					url: href,
				},
			];

			if (pathname.includes("/serien/") || pathname.includes("/shows/")) {
				const season = footerEles[3]
						?.querySelector("a>span")
						?.textContent.replace("Staffel ", "")
						.trim(),
					episode = footerEles[4]
						?.querySelector("span")
						?.textContent.split(" Folge ");

				title = footerEles[2]?.querySelector("a>span")?.textContent.trim();

				presenceData.state = `S${season}:E${episode?.[1]?.trim()} ${episode?.[0]?.trim()}`;
				presenceData.buttons[0].label = "Watch Series";
			} else if (pathname.includes("/filme/")) {
				title = footerEles[2]?.querySelector("a>span")?.textContent.trim();
				presenceData.buttons[0].label = "Watch Movie";
			}

			if (!title) {
				title = document.title
					.replace("im Online Stream | RTL+", "")
					.replace("im Online Stream ansehen | RTL+", "")
					.trim();
			}

			if (cover) presenceData.largeImageKey = cover.src;

			presenceData.details = title;

			if (duration <= 5) {
				delete presenceData.startTimestamp;
				delete presenceData.endTimestamp;

				presenceData.smallImageKey = "https://i.imgur.com/C6mbMYz.png";
				presenceData.smallImageText = strings.pause;
			}
		}
	} else if (pathname === "/") {
		presenceData.details = "Viewing main page";
		presenceData.startTimestamp = browsingTimestamp;
	} else if (pathname.includes("/serien/")) {
		presenceData.details = "Viewing series:";
		presenceData.state =
			document.querySelector(".ng-tns-c96-53")?.textContent ??
			document.title.replace("im Online Stream ansehen | RTL+", "").trim();
		presenceData.startTimestamp = browsingTimestamp;

		presenceData.buttons = [
			{
				label: "View Series",
				url: href,
			},
		];
	} else if (pathname.includes("/shows/")) {
		presenceData.details = "Viewing show:";
		presenceData.state =
			document.querySelectorAll("li.ng-star-inserted span.ng-star-inserted")[1]
				?.textContent ??
			document.title.replace("im Online Stream ansehen | RTL+", "").trim();
		presenceData.startTimestamp = browsingTimestamp;

		presenceData.buttons = [
			{
				label: "View Show",
				url: href,
			},
		];
	} else if (pathname.includes("/serien")) {
		presenceData.details = "Browsing series";
		presenceData.startTimestamp = browsingTimestamp;
	} else if (pathname.includes("/shows")) {
		presenceData.details = "Browsing shows";
		presenceData.startTimestamp = browsingTimestamp;
	} else if (pathname.includes("/filme/")) {
		presenceData.details = "Viewing movie:";
		presenceData.state =
			document.querySelectorAll("li.ng-star-inserted span.ng-star-inserted")[1]
				?.textContent ??
			document.title.replace("im Online Stream ansehen | RTL+", "").trim();
		presenceData.startTimestamp = browsingTimestamp;
		presenceData.buttons = [
			{
				label: "View Movie",
				url: href,
			},
		];
	} else if (pathname.includes("/filme")) {
		presenceData.details = "Browsing movies";
		presenceData.startTimestamp = browsingTimestamp;
	} else if (pathname.includes("/specials/")) {
		presenceData.details = "Viewing special:";
		presenceData.state = document.title;
		presenceData.startTimestamp = browsingTimestamp;
		presenceData.buttons = [
			{
				label: "View Special",
				url: href,
			},
		];
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
