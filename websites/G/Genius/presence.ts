const presence = new Presence({
		clientId: "809133308604055622",
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
async function getStrings() {
	return presence.getStrings(
		{
			play: "general.playing",
			pause: "general.paused",
			watch: "general.watching",
			search: "general.searchFor",
			searching: "general.search",
			profile: "general.viewProfile",
			article: "general.readingArticle",
			reading: "general.reading",
			lyrics: "genius.lyrics",
			viewLyrics: "genius.viewLyrics",
			home: "genius.viewHome",
			viewAlbum: "genius.viewAlbum",
			buttonAlbum: "general.buttonViewAlbum",
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}

let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null;

presence.on("UpdateData", async () => {
	const newLang = await presence.getSetting<string>("lang").catch(() => "en"),
		buttons = await presence.getSetting<boolean>("buttons");

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}

	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/C2J5rrN.png",
			startTimestamp: browsingTimestamp,
		},
		path = document.location.pathname;

	if (path === "/") presenceData.details = strings.home;
	else if (path.startsWith("/a/")) {
		let article = document.querySelector("h1.article_title").textContent;
		if (article.length > 128) article = `${article.substring(0, 125)}...`;

		presenceData.details = strings.article;
		presenceData.state = article;
		presenceData.smallImageKey = Assets.Reading;
		presenceData.smallImageText = strings.reading;
	} else if (path.startsWith("/artists/")) {
		presenceData.details = strings.profile;
		[presenceData.state] = document
			.querySelector("h1.profile_identity-name_iq_and_role_icon")
			.textContent.split("<");
	} else if (path.startsWith("/albums/")) {
		presenceData.details = strings.viewAlbum;
		presenceData.state = document.querySelector(
			"h1.header_with_cover_art-primary_info-title"
		).textContent;
		if (buttons) {
			presenceData.buttons = [
				{
					label: strings.buttonAlbum,
					url: document.URL,
				},
			];
		}
	} else if (
		document.querySelector("div[class*='SongPageGrid']") !== null ||
		document.querySelector(".song_body-lyrics") !== null
	) {
		presenceData.details = strings.lyrics;
		presenceData.state = `${
			document
				.querySelector("a[class*='SongHeaderdesktop__Artist-sc-1effuo1-11']")
				?.textContent.trim() ||
			document
				.querySelector("a[class*='SongHeadermobile__Artist-sc-1hu0heo-10']")
				?.textContent.trim()
		} - ${
			document
				.querySelector(
					"span[class*='SongHeaderdesktop__HiddenMask-sc-1effuo1-10']"
				)
				?.textContent.trim() ||
			document
				.querySelector(
					"span[class*='SongHeadermobile__HiddenMask-sc-1hu0heo-9']"
				)
				?.textContent.trim()
		}`;
		if (buttons) {
			presenceData.buttons = [
				{
					label: strings.viewLyrics,
					url: document.URL,
				},
			];
		}
	} else if (
		document.querySelector(".profile_identity-name_iq_and_role_icon") !== null
	) {
		presenceData.details = strings.profile;
		[presenceData.state] = document
			.querySelector("h1.profile_identity-name_iq_and_role_icon")
			.textContent.split("<");
	} else if (path.startsWith("/videos/")) {
		const video: HTMLVideoElement = document.querySelector("video.vjs-tech");
		let title = document.querySelector("h1.article_title").textContent;
		if (title.length > 128) title = `${title.substring(0, 125)}...`;

		presenceData.details = strings.watch;
		presenceData.state = title;
		if (video && !isNaN(video.duration)) {
			[presenceData.startTimestamp, presenceData.endTimestamp] =
				presence.getTimestampsfromMedia(video);

			presenceData.smallImageKey = video.paused ? "pause" : "play";
			presenceData.smallImageText = video.paused ? strings.pause : strings.play;

			if (video.paused) {
				delete presenceData.startTimestamp;
				delete presenceData.endTimestamp;
			}
		}
	} else if (path.startsWith("/search")) {
		presenceData.details = strings.search;
		presenceData.state = document.querySelector(
			"h2.search_results_page-header"
		).textContent;
		presenceData.smallImageKey = Assets.Search;
		presenceData.smallImageText = strings.searching;
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
