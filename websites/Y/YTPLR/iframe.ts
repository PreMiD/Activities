const ytplr_iframe = new iFrame();
ytplr_iframe.on("UpdateData", async () => {
	const videoElement: HTMLVideoElement =
		document.querySelector(".video-stream");
	if (!videoElement) return;

	ytplr_iframe.send({
		title: document.querySelector<HTMLAnchorElement>("div.ytp-title-text > a")
			.textContent,
		duration: videoElement.duration,
		currentTime: videoElement.currentTime,
		paused: videoElement.paused,
	});
});
