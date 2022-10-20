const presence = new Presence({
	clientId: "608065709741965327",
});

async function getStrings() {
	return presence.getStrings(
		{
			play: "general.playing",
			pause: "general.paused",
			browse: "general.browsing",
			reading: "general.reading",
			viewManga: "general.viewManga",
			viewPage: "general.viewPage",
			watchEpisode: "general.buttonViewEpisode",
			viewSeries: "general.buttonViewSeries",
			manga: "general.manga",
			chapter: "general.chapter",
			page: "general.page",
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}

let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null,
	lastPlaybackState = null,
	playback: boolean,
	browsingTimestamp = Math.floor(Date.now() / 1000);

if (lastPlaybackState !== playback) {
	lastPlaybackState = playback;
	browsingTimestamp = Math.floor(Date.now() / 1000);
}

let iFrameVideo: boolean,
	currentTime: number,
	duration: number,
	paused: boolean;

interface iFrameData {
	iFrameVideoData: {
		iFrameVideo: boolean;
		currTime: number;
		dur: number;
		paused: boolean;
	};
}

enum Assets {
	Logo = "https://i.imgur.com/yeWzAvq.png",
	OpenBook = "https://i.imgur.com/vUGLDRM.png",
	Pause = "https://i.imgur.com/0A75vqT.png",
	Play = "https://i.imgur.com/Dj5dekr.png",
	Search = "https://i.imgur.com/C3CetGw.png",
}

presence.on("iFrameData", (data: iFrameData) => {
	playback = data.iFrameVideoData !== null ? true : false;

	if (playback) {
		({
			iFrameVideo,
			currTime: currentTime,
			dur: duration,
			paused,
		} = data.iFrameVideoData);
	}
});

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
		},
		{ href, pathname } = window.location,
		[newLang, showCover] = await Promise.all([
			presence.getSetting<string>("lang").catch(() => "en"),
			presence.getSetting<boolean>("cover"),
		]);

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}

	if (pathname.includes("/manga")) {
		if (pathname.includes("/read")) {
			const queryTitle =
				document.querySelector<HTMLHeadingElement>(".chapter-header h1");
			presenceData.details = queryTitle.children[0].textContent.trim();
			presenceData.state = `${
				strings.reading
			} ${queryTitle.lastChild.textContent.trim()}`;
			presenceData.startTimestamp = browsingTimestamp;
			presenceData.smallImageKey = Assets.OpenBook;
			const pageNumber: string =
				document.querySelector<HTMLOutputElement>(
					".first-page-number"
				).textContent;
			presenceData.smallImageText = `${strings.page} ${
				pageNumber === "" ? "1" : pageNumber
			}/${document.querySelector<HTMLOListElement>(".images").children.length}`;
			presenceData.buttons = [
				{
					label: `Read ${strings.chapter}`,
					url: href,
				},
			];
		} else if (pathname.includes("/volumes")) {
			presenceData.details = strings.viewManga;
			presenceData.state = document
				.querySelector<HTMLHeadingElement>(".ellipsis")
				.textContent.split("Manga > ")[1];
			presenceData.buttons = [
				{
					label: `View ${strings.manga}`,
					url: href,
				},
			];
		} else {
			presenceData.details = strings.browse;
			presenceData.startTimestamp = browsingTimestamp;

			delete presenceData.state;
			delete presenceData.smallImageKey;
		}
	} else {
		presenceData.details = strings.browse;
		presenceData.startTimestamp = browsingTimestamp;

		delete presenceData.state;
		delete presenceData.smallImageKey;
	}

	if (
		iFrameVideo !== false &&
		!isNaN(duration) &&
		!pathname.includes("/series")
	) {
		const videoTitle =
			document.querySelector<HTMLHeadingElement>("a > h4").textContent;
		presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play;
		presenceData.smallImageText = paused ? strings.pause : strings.play;
		[, presenceData.endTimestamp] = presence.getTimestamps(
			Math.floor(currentTime),
			Math.floor(duration)
		);

		presenceData.details = videoTitle ?? "Title not found...";
		presenceData.state =
			document.querySelector<HTMLHeadingElement>("h1.title").textContent;

		presenceData.largeImageKey =
			document.querySelector<HTMLMetaElement>("[property='og:image']")
				?.content ?? Assets.Logo;

		if (paused) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;
		}

		if (videoTitle) {
			presenceData.buttons = [
				{
					label: strings.watchEpisode,
					url: href,
				},
				{
					label: strings.viewSeries,
					url: document.querySelector<HTMLAnchorElement>(".show-title-link")
						.href,
				},
			];
		}
	} else if (pathname.includes("/series")) {
		presenceData.details = strings.viewPage;
		presenceData.state =
			document.querySelector<HTMLHeadingElement>("h1.title").textContent;
		presenceData.largeImageKey =
			document.querySelector<HTMLMetaElement>("[property='og:image']")
				?.content ?? Assets.Logo;
		presenceData.buttons = [
			{
				label: strings.viewSeries,
				url: href,
			},
		];
	}

	if (!showCover) presenceData.largeImageKey = Assets.Logo;

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
