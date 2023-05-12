const presence = new Presence({
	clientId: "661889916635971616",
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
		largeImageKey: "https://i.imgur.com/5tOAWM7.png",
	};

	if (document.querySelector(".controls").ariaLabel.includes("Playing")) {
		presenceData.details =
			document.querySelector("div.episode > span").textContent;
		presenceData.state = document.querySelector(
			"div.podcast-title-date > span"
		).textContent;

		const time = document
			.querySelector(
				".TimeTextstyled__TimeTextWrapper-sc-1yzkn0m-0.lmVDeu.current-time"
			)
			.textContent.split(":")
			.map(Number);
		presenceData.smallImageKey = Assets.Play;
		if (time.length === 3) {
			presenceData.startTimestamp =
				Date.now() - (time[0] * 3600 + time[1] * 60 + time[2]) * 1000;
		} else {
			presenceData.startTimestamp =
				Date.now() - (time[0] * 60 + time[1]) * 1000;
		}
	} else if (document.querySelector(".controls").ariaLabel.includes("Paused")) {
		presenceData.details =
			document.querySelector("div.episode > span").textContent;
		presenceData.state = document.querySelector(
			"div.podcast-title-date > span"
		).textContent;
		presenceData.smallImageKey = Assets.Pause;
		delete presenceData.startTimestamp;
	}
	if (document.querySelector(".controls").ariaLabel.includes("Paused")) {
		if (document.location.pathname === "/podcasts")
			presenceData.details = "Viewing subscriptions";
		else if (
			document.location.pathname.startsWith("/podcasts/") ||
			document.location.pathname.startsWith("/discover/podcast/")
		) {
			presenceData.details = "Viewing podcast";
			presenceData.state =
				document.querySelectorAll(
					".title-and-actions"
				)[0].children[0].textContent;
		} else if (document.location.pathname === "/discover")
			presenceData.details = "Viewing discover page";
		else if (document.location.pathname.startsWith("/discover/list/")) {
			presenceData.details = "Viewing discover page";
			presenceData.state = document.querySelectorAll("h1")[0].textContent;
		} else {
			switch (document.location.pathname) {
				case "/new-releases": {
					presenceData.details = "Viewing new releases";
					break;
				}
				case "/in-progress": {
					presenceData.details = "Viewing in-progress episodes";
					break;
				}
				case "/starred": {
					presenceData.details = "Viewing starred episodes";
					break;
				}
				case "/profile": {
					presenceData.details = "Viewing profile";
					break;
				}
				case "/uploaded-files": {
					presenceData.details = "Viewing uploaded files";
					break;
				}
				case "/history": {
					presenceData.details = "Viewing listening history";
					break;
				}
				case "/stats": {
					presenceData.details = "Viewing listening stats";
					presenceData.state = `Listened for ${
						document.querySelectorAll(".styled__TimeListened-sc-1nd51k4-2")[0]
							.textContent
					}`;

					break;
				}
				default:
					if (document.location.pathname.startsWith("/settings/"))
						presenceData.details = "Changing settings";
			}
		}
	}
	presence.setActivity(presenceData);
});
