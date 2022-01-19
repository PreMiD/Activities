const iframe = new iFrame();

iframe.on("UpdateData", async () => {
	if (document.querySelector("video")) {
		const video = document.querySelector<HTMLVideoElement>("video");
		if (video && !isNaN(video.duration)) {
			iframe.send({
				duration: video.duration,
				currentTime: video.currentTime,
				paused: video.paused
			});
		}
	}
});
