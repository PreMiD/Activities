const presence = new Presence({
		clientId: "941627291304329226"
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);
let search: HTMLInputElement;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "logo",
			startTimestamp: browsingTimestamp
		},
		page = window.location.pathname;

	if (page === "/") presenceData.details = "Bekijkt de homepagina";
	else if (page.includes("zoeken")) {
		search = document.querySelector("#search");
		presenceData.smallImageKey = "search";
		if (search.value) {
			presenceData.details = "Zoekt voor:";
			presenceData.state = search.textContent;
		} else presenceData.details = "Aan het zoeken...";
	} else if (page.includes("/films/")) {
		presenceData.details = document.querySelector<HTMLMetaElement>(
			"meta[property='og:title']"
		).content;
	} else if (page.includes("/series/")) {
		presenceData.details = document.querySelector<HTMLMetaElement>(
			"meta[property='og:title']"
		).content;
	} else if (page.includes("/player/")) {
		delete presenceData.startTimestamp;
		const f = await fetch(
			`https://www.videoland.com/api/v3/titles/${
				window.location.href.split("/")[4]
			}/details`
		).then(x => x.json());
		presenceData.details = await f.showTitle;
		if (f.name.includes("-")) {
			presenceData.state =
				f.name
					.split("-")[0]
					.replace(f.showTitle, "S")
					.replace(".", ":E")
					.replace(" ", "") + f.name.split("-")[1];
		} else {
			presenceData.state = f.name
				.replace(f.showTitle, "S")
				.replace(".", ":E")
				.replace(" ", "");
		}
		if (document.querySelector("video").paused) {
			delete presenceData.endTimestamp;
			presenceData.smallImageKey = "pause";
			presenceData.smallImageText = "Gepauzeerd";
		} else {
			presenceData.endTimestamp = presence.getTimestamps(
				document.querySelector("video").currentTime,
				document.querySelector("video").duration
			)[1];
			presenceData.smallImageKey = "play";
			presenceData.smallImageText = "Aan het afspelen";
		}
	} else if (page.includes("/series")) presenceData.details = "Series";
	else if (page.includes("/films")) presenceData.details = "Films";
	else if (page.includes("/kids")) presenceData.details = "Kids";
	else if (page.includes("/tv-programmas"))
		presenceData.details = "Tv Programma's";
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
