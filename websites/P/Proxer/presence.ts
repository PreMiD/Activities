const presence = new Presence({
		clientId: "776479405009666098",
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

class VideoData {
	time: number;
	duration: number;
	paused: boolean;
}

let videoData: VideoData = null;

presence.on("iFrameData", (data: VideoData) => {
	videoData = data;
});

presence.on("UpdateData", () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/jx65gdz.png",
			details: "Idle",
			state: "Browsing Proxer.me",
		},
		path = document.location.pathname;

	if (path.startsWith("/watch")) {
		const ep = getByXpath(
				"//*[@id='wContainer']//*[@class='wEp']",
				e => e.textContent
			),
			maxEp = getByXpath("//*[@id='wContainer']//*[@class='wEp']", e =>
				e.nextSibling.textContent.substr(1).trim()
			),
			lang = getByXpath(
				"//*[@id='wContainer']//*[@class='wLanguage']",
				e => e.textContent
			),
			now = Date.now() / 1000;

		if (videoData) {
			if (!videoData.paused) {
				presenceData.details = "Watching";
				presenceData.startTimestamp = Math.floor(now - videoData.time);
				presenceData.endTimestamp = Math.floor(
					now + videoData.duration - videoData.time
				);
			} else presenceData.details = "Paused";
		} else if (
			getByXpath("//*[@id='wContainer']//*[@class='wStream']/div/@style", e =>
				e.textContent.includes("/images/misc/streamfehlt.png")
			)
		)
			presenceData.details = "Awaiting";
		else {
			presenceData.details = "Watching";
			presenceData.startTimestamp = browsingTimestamp;
		}
		presenceData.details += ` ${
			getByXpath(
				"//*[@id='wContainer']//*[@class='wName']",
				e => e.textContent
			) || "Unknown Anime"
		}`;

		presenceData.state = "";
		if (ep) {
			presenceData.state += ep;
			if (maxEp) presenceData.state += `/${maxEp}`;

			if (lang) presenceData.state += ` (${lang})`;
		}
		/*
    // For the future to make watch together requests
    const id = /(?:\/watch\/)([0-9]*)\/([0-9]*)\/([a-z]*)/.exec(path);
    if (id.length == 3) {
      const animeId = id[0],
       epId = id[1],
       langId = id[2];
    }
    */
	} else if (path.startsWith("/info")) {
		presenceData.details = `Checking out ${document.title.replace(
			/ - Proxer\.Me$/,
			""
		)}`;
	} else if (path.startsWith("/anime") || path.startsWith("/season"))
		presenceData.details = "Checking out Anime";
	else if (path.startsWith("/chat")) presenceData.details = "Chatting";
	else if (path.startsWith("/forum"))
		presenceData.details = "Checking the forum";
	else if (path.startsWith("/gallery"))
		presenceData.details = "Checking the gallery";
	else if (path.startsWith("/news")) presenceData.details = "Checking the news";

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});

function getByXpath<T>(xpath: string, extractor: (e: Node) => T): T | Node {
	try {
		return (extractor || (e => e))(
			document
				.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null)
				.iterateNext()
		);
	} catch (e) {
		return null;
	}
}
