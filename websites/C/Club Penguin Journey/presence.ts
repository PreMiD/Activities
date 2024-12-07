const presence = new Presence({
		clientId: "620721262112538625",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/2MUm0oA.jpeg",
		startTimestamp: browsingTimestamp,
	};

	switch (document.location.hostname) {
		case "cpjourney.net": {
			if (document.location.pathname === "/") {
				presenceData.details = "Waddling around";
				presenceData.state = "Viewing Home";
			} else if (document.location.pathname.startsWith("/news/")) {
				presenceData.details = "Reading post:";
				presenceData.state = document.querySelector(
					"[class*=post_title]"
				).textContent;
			} else if (document.location.pathname.startsWith("/news")) {
				presenceData.details = "Waddling around";
				presenceData.state = "Scrolling through the news";
			} else presenceData.details = "Waddling around";
			break;
		}
		case "play.cpjourney.net":
			{
				if (document.location.pathname === "/") {
					presenceData.details = "Waddling around";
					presenceData.state = "Playing Club Penguin Journey";
				}
			}
			break;
	}

	presence.setActivity(presenceData);
});
