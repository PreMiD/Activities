const presence = new Presence({
		clientId: "698231292172435567",
	}),
	strings = presence.getStrings({
		play: "general.playing",
		pause: "general.paused",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);
let currentTime: number,
	duration: number,
	paused: boolean,
	timestamps: number[];

interface IFrameData {
	iframeVideo: {
		dur: number;
		iFrameVideo: boolean;
		paused: boolean;
		currTime: number;
	};
}

presence.on("iFrameData", (data: IFrameData) => {
	if (data.iframeVideo.dur)
		({ paused, dur: duration, currTime: currentTime } = data.iframeVideo);
});

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/RDkTKRh.png"
	};

	presenceData.startTimestamp = browsingTimestamp;

	if (
		document.location.pathname === "/" ||
		document.location.pathname === "/kisscartoon.html"
	)
		presenceData.details = "Viewing home page";
	else if (document.querySelector(".full.watch_container")) {
		timestamps = presence.getTimestamps(
			Math.floor(currentTime),
			Math.floor(duration)
		);
		if (!isNaN(duration)) {
			presenceData.smallImageKey = paused ? "pause" : "play";
			presenceData.smallImageText = paused
				? (await strings).pause
				: (await strings).play;
			[presenceData.startTimestamp, presenceData.endTimestamp] = timestamps;

			presenceData.details = document
				.querySelector("#adsIfrme > div > div > div > h1 > strong")
				.textContent.replace("Watch ", "")
				.replace(" online free", "");
			presenceData.state = document
				.querySelector("#selectEpisode")
				.textContent.trim();

			if (paused) {
				delete presenceData.startTimestamp;
				delete presenceData.endTimestamp;
			}
		} else if (isNaN(duration)) {
			presenceData.startTimestamp = browsingTimestamp;
			presenceData.details = "Looking at:";
			presenceData.state = `${document
				.querySelector("#adsIfrme > div > div > div > h1 > strong")
				.textContent.replace("Watch ", "")
				.replace(" online free", "")} ${document
				.querySelector("#selectEpisode")
				.textContent.trim()}`;
		}
	} else if (document.location.pathname.includes("/CartoonList"))
		presenceData.details = "Viewing the Cartoon List";
	else if (document.location.pathname.includes("/Cartoon")) {
		presenceData.details = "Viewing Cartoon:";
		presenceData.state = document.querySelector(
			"#leftside > div:nth-child(2) > div.barContent.full > div.full > h1 > a"
		).textContent;
	} else if (document.location.pathname.includes("/ReportError")) {
		presenceData.details = "Reporting an error";
		presenceData.smallImageKey = "writing";
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
