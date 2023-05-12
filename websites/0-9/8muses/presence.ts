const presence = new Presence({
		clientId: "717563140300210196",
	}),
	strings = presence.getStrings({
		search: "general.searching",
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
		largeImageKey: "https://i.imgur.com/GQF8Kiq.png",
		startTimestamp: browsingTimestamp,
	};
	if (new URLSearchParams(window.location.search).has("s")) {
		presenceData.details = "Searching for:";
		presenceData.state = document.title.split(" -").shift();
		presenceData.smallImageKey = Assets.Search;
		presenceData.smallImageText = (await strings).search;
	} else if (document.location.pathname === "/")
		presenceData.details = "Browsing Homepage";
	else if (document.location.pathname.includes("/category/")) {
		presenceData.details = "Viewing a category:";
		presenceData.state = (
			document.querySelector(
				"#top-menu > div.top-menu-breadcrumb > ol > li:nth-child(2) > a"
			) as HTMLAnchorElement
		).text;
	} else if (document.location.href.includes("/#")) {
		const comicName = (
				document.querySelector("head > meta:nth-child(17)") as HTMLMetaElement
			).content,
			issueNumber = document
				.querySelector("#left-menu > ol > li:nth-child(3) > div > span")
				.textContent.trim();
		if (document.location.pathname.split("/")[2].includes("")) {
			presenceData.details = `${comicName} - ${document.location.pathname
				.split("/")[2]
				.replaceAll("_", " ")}`;
			presenceData.state = issueNumber;
			presenceData.smallImageKey = Assets.Reading;
		} else {
			presenceData.details = comicName;
			presenceData.state = issueNumber;
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
