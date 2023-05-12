const presence = new Presence({
		clientId: "1031601950539661363",
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
			largeImageKey: "https://i.imgur.com/lu1BuFT.png",
			startTimestamp: browsingTimestamp,
		},
		pathSplit = window.location.pathname.split("/").slice(1),
		showImages = await presence.getSetting<boolean>("showImages");

	switch (pathSplit[0] ?? "") {
		case "": {
			presenceData.details = "Browsing homepage";
			break;
		}
		case "archive": {
			presenceData.details = "Browsing archived tweets";
			break;
		}
		case "help": {
			if (pathSplit[1]) {
				presenceData.details = "Reading help article";
				presenceData.state = document.querySelector("h1").textContent;
			} else presenceData.details = "Browsing help and FAQ";
			break;
		}
		case "split": {
			presenceData.details = "Extracting a frame from a GIF";
			break;
		}
		default: {
			if (
				document.querySelector<HTMLFormElement>("#main form") ||
				pathSplit[1]
			) {
				presenceData.details = `Using the '${
					document.querySelector("h1").textContent
				}' tool`;
				if (pathSplit[1]) {
					const outputImage =
						document.querySelector<HTMLImageElement>("#output img");
					if (outputImage && showImages)
						presenceData.largeImageKey = outputImage.src;
				}
			} else {
				presenceData.details = "Browsing";
				presenceData.state = document.querySelector("h1").textContent;
			}
		}
	}

	presence.setActivity(presenceData);
});
