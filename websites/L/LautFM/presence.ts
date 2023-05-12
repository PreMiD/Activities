const presence = new Presence({
		clientId: "640997739689279498",
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
		largeImageKey: "https://i.imgur.com/rncpOUV.png",
	};

	switch (
		document
			.querySelectorAll(".btn.playbutton")[0]
			.getAttributeNode("data-trackingaction").textContent
	) {
		case "stop": {
			presenceData.details = `Playing ${
				document.querySelector(
					"#app > div.fixed.fixed--top > div > a > div > div > span > b"
				).textContent
			}`;
			presenceData.state = document.querySelector(
				"#app > div.fixed.fixed--top > div > a > div > div > div"
			).textContent;
			break;
		}
		case "play": {
			presenceData.startTimestamp = browsingTimestamp;
			if (document.location.pathname === "/genres")
				presenceData.state = "Schaut nach Genres";
			else if (document.location.pathname.includes("/stations/genre/"))
				presenceData.state = "Sucht Stationen";
			else if (document.location.pathname.includes("/stations/location"))
				presenceData.state = "Sucht lokale Stationen";
			else if (document.location.pathname === "/stations/all")
				presenceData.state = "Sucht nach Top-Sender";
			else {
				presenceData.details = "Befindet sich bei Station";
				presenceData.state = document.querySelector(
					"#app > section > header > div.fm-station-header__col.fm-station-header__col--name > h1"
				).textContent;
			}
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
