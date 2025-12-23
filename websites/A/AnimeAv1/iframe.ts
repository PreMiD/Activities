const iframe = new iFrame();

let lastSent: any = null;

function sanitizeImage(url: string | null) {
	if (!url) return null;
	try {
		url = String(url);
		if (/^data:/i.test(url)) return null;
		if (/^https?:\/\//i.test(url)) return url;
	} catch {
		return null;
	}
	return null;
}

function shouldSendUpdate(info: any): boolean {
	if (!lastSent) return true;
	if (info.paused !== lastSent.paused) return true;
	if (Math.abs((info.currentTime || 0) - (lastSent.currentTime || 0)) >= 1)
		return true;
	if ((info.duration || 0) !== (lastSent.duration || 0)) return true;

	return false;
}

iframe.on("UpdateData", async () => {
	const video = document.querySelector("video");

	if (!video) {
		iframe.send({});
		return;
	}

	try {
		const info: any = {
			duration: video.duration,
			currentTime: video.currentTime,
			paused: video.paused,
		};

		if (!isNaN(info.duration) && !isNaN(info.currentTime)) {
			if (shouldSendUpdate(info)) {
				iframe.send(info);
				lastSent = info;
			}
		} else iframe.send({});
	} catch {
		iframe.send({});
	}
});