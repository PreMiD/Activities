const presence = new Presence({
		clientId: "813392002526871592",
	}),
	getStrings = async () =>
		presence.getStrings(
			{
				play: "general.playing",
				paused: "general.paused",
				browse: "general.browsing",
				viewSeries: "general.viewSeries",
				searchSomething: "general.searchSomething",
				buttonViewEpisode: "general.buttonViewEpisode",
			},
			await presence.getSetting<string>("lang").catch(() => "en")
		),
	browsingTimestamp = Math.floor(Date.now() / 1000),
	shortenedURLs: Record<string, string> = {};

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

async function shortenURL(url: string) {
	if (!url || url.length < 256) return url;
	if (shortenedURLs[url]) return shortenedURLs[url];
	try {
		const pdURL = await (
			await fetch(`https://pd.premid.app/create/${url}`)
		).text();
		return (shortenedURLs[url] = pdURL);
	} catch (err) {
		presence.error(err);
		return url;
	}
}

let oldLang: string = null,
	strings: Awaited<ReturnType<typeof getStrings>>;

presence.on("UpdateData", async () => {
	const { pathname } = document.location,
		[newLang, showButton, cover] = await Promise.all([
			presence.getSetting<string>("lang").catch(() => "en"),
			presence.getSetting<boolean>("buttons"),
			presence.getSetting<boolean>("cover"),
		]);

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}

	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/F2sWIqN.png",
		startTimestamp: browsingTimestamp,
		details: strings.browse,
	};

	if (pathname.includes("/drama/")) {
		const video = document.querySelector("video"),
			title = document
				.querySelector("h2.font-700.text-24.break-all")
				.textContent.split("："),
			episodeTitle = title.pop(); // eslint-disable-line no-one-time-vars/no-one-time-vars

		if (video) {
			presenceData.details = title.join("：");
			presenceData.state = episodeTitle;

			[presenceData.startTimestamp, presenceData.endTimestamp] =
				presence.getTimestampsfromMedia(video);

			presenceData.largeImageKey = cover
				? await shortenURL(
						document.querySelector<HTMLImageElement>(
							`img[alt='${title.join("：")}']`
						).src
				  )
				: "linetv_logo";

			presenceData.smallImageKey = video.paused ? "pause" : "play";
			presenceData.smallImageText = video.paused
				? strings.paused
				: strings.play;

			if (video.paused) {
				delete presenceData.startTimestamp;
				delete presenceData.endTimestamp;
			}

			if (showButton) {
				presenceData.buttons = [
					{
						label: strings.buttonViewEpisode,
						url: location.href,
					},
				];
			} else delete presenceData.buttons;
		} else {
			presenceData.details = strings.viewSeries;
			presenceData.state = title.join("：");
		}
	} else if (pathname.includes("/search")) {
		presenceData.details = strings.searchSomething;
		presenceData.smallImageKey = Assets.Search;
	}

	presence.setActivity(presenceData);
});
