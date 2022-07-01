const iframe = new iFrame();
iframe.on("UpdateData", async () => {
	const videoElement: HTMLVideoElement =
		document.querySelector("#player video");
	if (
		!document.querySelector<HTMLAnchorElement>("div.ytp-title-text > a") ||
		!videoElement
	)
		return;
	iframe.send({
		title: videoElement.textContent,
		duration: videoElement.duration ?? null,
		currentTime: videoElement.currentTime,
		paused: videoElement.paused,
	});
});
