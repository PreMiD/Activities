const presence = new Presence({
		clientId: "1139510267311562842",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

const enum Assets {
	Logo = "https://i.imgur.com/BzZw6aQ.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
		},
		[titleLang] = await Promise.all([presence.getSetting("title")]),
		{ pathname, href } = document.location;

	if (pathname === "/" || pathname === "/en/") {
		presenceData.details = "Browsing Homepage";
		presenceData.startTimestamp = browsingTimestamp;
	} else if (pathname.includes("/id/"))
		presenceData.details = "Browsing Anime/Manga";
	else if (pathname.includes("/profile/")) {
		presenceData.details =
			document.querySelector("h1.font-karla.font-bold.text-2xl.pt-7")
				?.textContent || "Getting data...";
		presenceData.state = "Viewing profile";
	} else if (pathname === "/en/anime/trending/") {
		presenceData.details = "Browsing trending Anime";
		presenceData.startTimestamp = browsingTimestamp;
	} else if (pathname === "/en/anime/popular/") {
		presenceData.details = "Browsing popular Anime";
		presenceData.startTimestamp = browsingTimestamp;
	} else if (
		pathname.includes("/anime/") &&
		!pathname.includes("/watch/") &&
		!pathname.includes("/search/")
	) {
		if (document.querySelector('img[alt="404"]')) {
			presenceData.state = "404 | Not Found";
			presenceData.details = "Browsing Anime/Manga";
		} else {
			let title;
			switch (titleLang) {
				case 0: {
					title = document
						.querySelector('meta[name="title"]')
						?.getAttribute("data-title-romaji");

					break;
				}
				case 1: {
					title =
						document
							.querySelector('meta[name="title"]')
							?.getAttribute("data-title-english") ||
						document
							.querySelector('meta[name="title"]')
							?.getAttribute("data-title-romaji");

					break;
				}
				case 2: {
					title =
						document
							.querySelector('meta[name="title"]')
							?.getAttribute("data-title-native") ||
						document
							.querySelector('meta[name="title"]')
							?.getAttribute("data-title-romaji");

					break;
				}
			}

			presenceData.largeImageKey =
				document
					.querySelector('img[alt="poster anime"]')
					?.getAttribute("src") || Assets.Logo;
			presenceData.details = title || "Getting data...";
			presenceData.state = "Viewing info";

			if (title) {
				presenceData.buttons = [
					{
						label: "View Anime",
						url: href,
					},
				];
			}
		}
	} else if (
		pathname.includes("/manga/") &&
		!pathname.includes("/read/") &&
		!pathname.includes("/search/")
	) {
		if (document.querySelector('img[alt="404"]')) {
			presenceData.state = "404 | Not Found";
			presenceData.details = "Browsing Anime/Manga";
		} else {
			const title = document.querySelector("h1.title")?.textContent;
			presenceData.largeImageKey =
				document.querySelector('img[alt="cover image"]')?.getAttribute("src") ||
				Assets.Logo;
			presenceData.details = title || "Getting data...";
			presenceData.state = "Viewing info";

			if (title) {
				presenceData.buttons = [
					{
						label: "View Manga",
						url: href,
					},
				];
			}
		}
	} else if (pathname.includes("/watch/")) {
		if (document.querySelector('img[alt="404"]')) {
			presenceData.state = "404 | Not Found";
			presenceData.details = "Browsing Anime/Manga";
		} else {
			const playingEpisode = document
					.querySelector("h3")
					?.textContent?.replace("Episode ", ""),
				video: HTMLVideoElement = document.querySelector("video");
			if (video && !Number.isNaN(Number(video.duration))) {
				presenceData.endTimestamp = presence
					.getTimestampsfromMedia(video)
					.pop();
				if (video.paused) {
					presenceData.smallImageText = "Paused";
					presenceData.smallImageKey = Assets.Pause;
					delete presenceData.startTimestamp;
					delete presenceData.endTimestamp;
				} else {
					presenceData.smallImageText = "Playing";
					presenceData.smallImageKey = Assets.Play;
				}
			}

			const total = document
				.querySelector("div.grid.w-full.pl-5")
				?.getAttribute("data-episode");

			let title;
			switch (titleLang) {
				case 0: {
					title = document
						.querySelector('meta[name="title"]')
						?.getAttribute("data-title-romaji");

					break;
				}
				case 1: {
					title =
						document
							.querySelector('meta[name="title"]')
							?.getAttribute("data-title-english") ||
						document
							.querySelector('meta[name="title"]')
							?.getAttribute("data-title-romaji");

					break;
				}
				case 2: {
					title =
						document
							.querySelector('meta[name="title"]')
							?.getAttribute("data-title-native") ||
						document
							.querySelector('meta[name="title"]')
							?.getAttribute("data-title-romaji");

					break;
				}
			}

			if (title) {
				presenceData.buttons = [
					{
						label: "Stream Anime",
						url: href,
					},
				];
			}
			presenceData.largeImageKey =
				document.querySelector('img[alt="Anime Cover"]')?.getAttribute("src") ||
				Assets.Logo;
			presenceData.details = title || "Getting data...";
			if (playingEpisode) {
				presenceData.state = `Episode ${playingEpisode} of ${
					total === "0" ? "???" : total
				}`;
			}
		}
	} else if (pathname.includes("/read/")) {
		const title = document
			.querySelector("title")
			?.textContent.replace("Manga - ", "");

		presenceData.largeImageKey =
			document
				.querySelector('meta[id="CoverImage"]')
				.getAttribute("data-manga-cover") || Assets.Logo;
		presenceData.details = title || "Getting data...";
		presenceData.state = `Reading Chapter ${document
			.querySelector('input[id="chapter-progress"]')
			.getAttribute("value")}`;
		presenceData.smallImageKey = Assets.Reading;
		presenceData.smallImageText = "Reading";

		if (title) {
			presenceData.buttons = [
				{
					label: "Read Manga",
					url: href,
				},
			];
		}
	} else if (pathname.includes("/search/") && pathname.includes("/anime/")) {
		presenceData.details = "Browsing Anime";
		presenceData.state = "Searching...";
		presenceData.smallImageKey = Assets.Search;
	} else if (pathname.includes("/search/") && pathname.includes("/manga/")) {
		presenceData.details = "Browsing Manga";
		presenceData.state = "Searching...";
		presenceData.smallImageKey = Assets.Search;
	} else {
		presence.clearActivity();
		presenceData.details = "Browsing Anime/Manga";
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
