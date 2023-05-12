const presence = new Presence({
	clientId: "1005873313551220757",
});

enum Assets {
	Play = "https://i.imgur.com/q57RJjs.png",
	Pause = "https://i.imgur.com/mcEXiZk.png",
	Stop = "https://i.imgur.com/aLYu3Af.png",
	Search = "https://i.imgur.com/B7FxcD4.png",
	Question = "https://i.imgur.com/pIIJniP.png",
	Live = "https://i.imgur.com/0HVm46z.png",
	Reading = "https://i.imgur.com/5m10TTT.png",
	Writing = "https://i.imgur.com/Pa00qZh.png",
	Call = "https://i.imgur.com/y4YKRZG.png",
	Vcall = "https://i.imgur.com/6wG9ZvM.png",
	Downloading = "https://i.imgur.com/ryrDrz4.png",
	Uploading = "https://i.imgur.com/SwNDR5U.png",
	Repeat = "https://i.imgur.com/Ikh95KU.png",
	RepeatOne = "https://i.imgur.com/qkODaWg.png",
	Premiere = "https://i.imgur.com/Zf8FSUR.png",
	PremiereLive = "https://i.imgur.com/yC4j9Lg.png",
	Viewing = "https://i.imgur.com/fpZutq6.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/2ewm9Gc.png",
		},
		[work, tag] = await Promise.all([
			presence.getSetting<string>("work"),
			presence.getSetting<string>("tag"),
		]),
		{ pathname, href } = document.location;
	if (pathname === "/") presenceData.details = "Viewing home page";
	else if (pathname.includes("/tags/")) {
		if (tag) {
			presenceData.details = `Browsing tag: ${
				document.querySelector(".heading > .tag").textContent
			}`;
			presenceData.state = document.querySelector("h2.heading").textContent;
		} else presenceData.details = " Browsing tags...";
	} else if (pathname.includes("/works/")) {
		if (work) {
			presenceData.details = `Reading : ${
				document.querySelector("h2").textContent
			}`;

			presenceData.state = document.querySelector("div.chapter > h3")
				? document.querySelector("div.chapter > h3").textContent
				: "Oneshot";
			presenceData.buttons = [
				{
					label: "View",
					url: href,
				},
			];
		} else presenceData.details = " Reading a work...";
	} else if (pathname.includes("/users"))
		presenceData.details = "Viewing profile...";
	else if (pathname.includes("/series")) {
		presenceData.details = `Viewing Series : ${
			document.querySelector("h2.heading").textContent
		}`;
		presenceData.state = `By ${
			document.querySelector("a[rel=author]").textContent
		}`;
		presenceData.buttons = [
			{
				label: "View",
				url: href,
			},
		];
	} else presenceData.details = "Browsing the website...";
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
