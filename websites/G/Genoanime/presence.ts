const presence = new Presence({
		clientId: "810203651317432351",
	}),
	strings = presence.getStrings({
		play: "general.playing",
		pause: "general.paused",
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

let video: HTMLVideoElement,
	currentTime: number,
	duration: number,
	paused: boolean,
	iFrameVideo: boolean,
	playback: boolean,
	animeBreadcumb: string;

presence.on(
	"iFrameData",
	(data: {
		iFrameVideo: {
			duration: number;
			iFrameVideo: boolean;
			currTime: number;
			paused: boolean;
		};
	}) => {
		playback = data.iFrameVideo.duration !== null ? true : false;
		if (playback) {
			({ iFrameVideo, duration, paused } = data.iFrameVideo);
			currentTime = data.iFrameVideo.currTime;
		}
	}
);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/44orW6Y.png",
		startTimestamp: browsingTimestamp,
	}; //title of the page
	if (document.location.pathname === "/")
		presenceData.details = "Exploring Genoanime";
	else if (document.location.pathname.includes("/browse")) {
		presenceData.details = "Exploring Genoanime library";
		presenceData.buttons = [
			{
				label: "View Library",
				url: document.location.href,
			},
		];
	} else if (document.location.pathname.includes("/details")) {
		presenceData.details = "Checking Synopsis";
		presenceData.state = document.querySelector(
			".anime__details__title h3"
		).textContent;
		animeBreadcumb = document.querySelector<HTMLAnchorElement>(
			"#container > section > div > div.anime__details__content > div > div.col-lg-9 > div > div.anime__details__btn > a.watch-btn"
		).href;
		presenceData.buttons = [
			{
				label: "Watch It",
				url: animeBreadcumb,
			},
			{
				label: "Check Synopsis",
				url: document.location.href,
			},
		];
	} else if (document.location.pathname.includes("/watch")) {
		presenceData.details = document.title.slice(0, -13);
		presenceData.state = `Episode ${
			document.location.href.split("episode=")[1]
		}`;
		animeBreadcumb = document.querySelector<HTMLAnchorElement>(
			"#anime_details_breadcrumbs"
		).href;
		presenceData.buttons = [
			{
				label: "Watch Episode",
				url: document.location.href,
			},
			{
				label: "Check Synopsis",
				url: animeBreadcumb,
			},
		];
		if (iFrameVideo) {
			[, presenceData.endTimestamp] = presence.getTimestamps(
				Math.floor(currentTime),
				Math.floor(duration)
			);
		} else {
			video = document.querySelector("div > div.plyr__video-wrapper > video");
			if (video) {
				({ currentTime, duration, paused } = video),
					([, presenceData.endTimestamp] = presence.getTimestamps(
						Math.floor(currentTime),
						Math.floor(duration)
					));
			}
		}

		if (!isNaN(duration)) {
			presenceData.smallImageKey = paused ? "pause" : "play";
			presenceData.smallImageText = paused
				? (await strings).pause
				: (await strings).play;
			if (paused) delete presenceData.endTimestamp;
		}
	} else if (document.location.pathname.includes("/search")) {
		presenceData.details = "Searching For...";
		presenceData.state = (
			document.querySelector("#search-anime") as HTMLInputElement
		).value;
	} else if (document.location.pathname.includes("/amv")) {
		presenceData.details = "Watching AMV videos";
		presenceData.buttons = [
			{
				label: "Watch Video",
				url: document.location.href,
			},
		];
	} else if (document.location.pathname.includes("/favorite"))
		presenceData.details = "Browsing Favourites";
	else if (document.location.pathname.includes("/schedule")) {
		presenceData.details = "Checking Schedule";
		presenceData.state = document.querySelector(
			"#container > section > div > div:nth-child(1) > div > h3"
		).textContent;
		presenceData.buttons = [
			{
				label: "View Schedule",
				url: document.location.href,
			},
		];
	}
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
