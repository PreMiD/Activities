const presence = new Presence({
		clientId: "616754182858342426"
	}),
	strings = presence.getStrings({
		play: "presence.playback.playing",
		pause: "presence.playback.paused"
	});

let lastPlaybackState,
	playback: boolean,
	browsingTimestamp = Math.floor(Date.now() / 1000);

if (lastPlaybackState !== playback) {
	lastPlaybackState = playback;
	browsingTimestamp = Math.floor(Date.now() / 1000);
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			details: "Unknown page",
			largeImageKey: "lg"
		},
		video: HTMLVideoElement = document.querySelector(
			"#player > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video"
		);

	playback = !!video;

	if (!playback) {
		presenceData.details = "Browsing...";
		presenceData.startTimestamp = browsingTimestamp;

		presence.setActivity(presenceData);
	}

	if (video && !isNaN(video.duration)) {
		const videoTitle: HTMLElement = document.querySelector(
				"div.watch-header.h4.mb-0.font-weight-normal.link.hidden-sm-down"
			),
			season: HTMLElement = document.querySelector(
				"#playercontainer span.outPes"
			),
			episode: HTMLElement = document.querySelector(
				"#playercontainer span.outPep"
			);
		presenceData.largeImageKey = document
			.querySelector<HTMLMetaElement>('meta[property="og:image"]')
			.getAttribute("content");

		presenceData.smallImageKey = video.paused ? "pause" : "play";
		presenceData.smallImageText = video.paused
			? (await strings).pause
			: (await strings).play;
		[presenceData.startTimestamp, presenceData.endTimestamp] =
			presence.getTimestamps(
				Math.floor(video.currentTime),
				Math.floor(video.duration)
			);

		if (season && episode) {
			presenceData.details = videoTitle
				? videoTitle.textContent
				: "Title not found...";
			presenceData.state = `Season ${season.textContent} Episode ${episode.textContent}`;
			presenceData.buttons = [
				{
					label:
						presenceData.details.length >= 30
							? "View Now"
							: presenceData.details,
					url: document.location.href.split("/season/")[0]
				},
				{
					label: presenceData.state,
					url: document.location.href
				}
			];
		} else if (!season && episode) {
			presenceData.details = videoTitle
				? videoTitle.textContent
				: "Title not found...";
			presenceData.state = `Episode ${episode.textContent}`;
			presenceData.buttons = [
				{
					label:
						presenceData.details.length >= 30
							? "View Now"
							: presenceData.details,
					url: document.location.href.split("/episode/")[0]
				},
				{
					label: presenceData.state,
					url: document.location.href
				}
			];
		} else {
			presenceData.details = "Watching";
			presenceData.state = videoTitle
				? videoTitle.textContent
				: "Title not found...";
			presenceData.buttons = [
				{
					label:
						presenceData.state.length >= 30 ? "Watch Now" : presenceData.state,
					url: document.location.href
				}
			];
		}

		if (video.paused) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;
		}

		if (videoTitle) presence.setActivity(presenceData, !video.paused);
	}
});
