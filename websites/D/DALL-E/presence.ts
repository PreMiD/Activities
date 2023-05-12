const presence = new Presence({
		clientId: "1037407267336753152",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000),
	slideshow = presence.createSlideshow();

async function getListImages() {
	return await Promise.all(
		[
			...document.querySelectorAll<HTMLDivElement>(
				".image-prompt-overlay-container"
			),
		].map(async container => [
			await getShortURL(
				container.querySelector<HTMLImageElement>(".generated-image > img").src
			),
			container.querySelector<HTMLDivElement>(".image-prompt-overlay")
				.textContent,
		])
	);
}

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

const shortenedURLs: Record<string, string> = {};
async function getShortURL(url: string) {
	if (url.length < 256) return url;
	if (shortenedURLs[url]) return shortenedURLs[url];
	try {
		const pdURL = await (
			await fetch(`https://pd.premid.app/create/${url}`)
		).text();
		shortenedURLs[url] = pdURL;
		return pdURL;
	} catch (err) {
		presence.error(err);
		return url;
	}
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/i6UPLX2.png",
			startTimestamp: browsingTimestamp,
		},
		{ pathname, href } = window.location,
		showImages = await presence.getSetting<boolean>("showImages");

	if (pathname === "/") {
		const input = document.querySelector<HTMLInputElement>(
			".image-prompt-input"
		);
		if (input.value) {
			presenceData.details = "Crafting a prompt";
			presenceData.state = input.value;
		} else presenceData.details = "Thinking of a prompt";
	} else if (pathname.startsWith("/history")) {
		if (showImages) {
			const images = await getListImages();
			if (images.length > 0) {
				for (const [i, [image, text]] of images.entries()) {
					slideshow.addSlide(
						i.toString(),
						{
							...presenceData,
							details: "Viewing history",
							state: text,
							largeImageKey: image,
						},
						5000
					);
				}
			} else presenceData.details = "Viewing history";
		} else presenceData.details = "Viewing history";
	} else if (pathname.startsWith("/c/")) {
		if (showImages) {
			const images = await getListImages();
			if (images.length === 0) {
				presenceData.details = "Viewing a collection";
				presenceData.state =
					document.querySelector<HTMLDivElement>("[class*=h3]").textContent;
			} else {
				for (const [i, [image, text]] of images.entries()) {
					const slide = {
						...presenceData,
						details: `Viewing collection: ${
							document.querySelector<HTMLDivElement>("[class*=h3]").textContent
						}`,
						state: text,
						largeImageKey: image,
					};
					if (
						!document.querySelector<HTMLDivElement>(
							".collection-layout-private"
						) &&
						!pathname.includes("/private")
					) {
						slide.buttons = [
							{
								label: "View Collection",
								url: href,
							},
						];
					}
					slideshow.addSlide(i.toString(), slide, 5000);
				}
			}
		} else {
			presenceData.details = "Viewing a collection";
			presenceData.state =
				document.querySelector<HTMLDivElement>("[class*=h3]").textContent;
		}
	} else if (pathname.startsWith("/collections"))
		presenceData.details = "Viewing collections";
	else if (pathname.startsWith("/account"))
		presenceData.details = "Viewing their account";
	else if (pathname.startsWith("/e/")) {
		const input = document.querySelector<HTMLInputElement>(
			".image-prompt-input"
		)?.value;
		if (showImages) {
			const images = await Promise.all(
					[
						...document.querySelectorAll<HTMLImageElement>(
							".task-page-generations-img .generated-image > img"
						),
					].map(image => getShortURL(image.src))
				),
				centeredImage = document.querySelector<HTMLImageElement>(
					".edit-page-image .generated-image > img"
				);
			if (images.length === 0 && !centeredImage) {
				presenceData.details = "Generating images";
				presenceData.state = input;
			} else if (centeredImage) {
				presenceData.details = "Viewing an image";
				presenceData.largeImageKey = await getShortURL(centeredImage.src);
			} else {
				for (const [i, image] of images.entries()) {
					slideshow.addSlide(
						i.toString(),
						{
							...presenceData,
							details: "Viewing a generation",
							state: input,
							largeImageKey: image,
						},
						5000
					);
				}
			}
		} else {
			presenceData.details = "Viewing a generation";
			presenceData.state = input;
		}
	} else if (pathname.startsWith("/s/")) {
		presenceData.details = "Viewing an image";
		presenceData.state = document.querySelector<HTMLHeadingElement>(
			".gen-detail-caption"
		).textContent;
		presenceData.buttons = [{ label: "View Image", url: href }];
		if (showImages) {
			presenceData.largeImageKey = await getShortURL(
				document.querySelector<HTMLImageElement>(".generated-image > img").src
			);
		}
	} else if (pathname.startsWith("/editor"))
		presenceData.details = "Using the image editor";
	else {
		presenceData.details = "Browsing";
		presenceData.state = document.title.match(/^(.*)?( \| DALL·E)?$/)[1];
	}

	if (presenceData.details) {
		presence.setActivity(presenceData);
		slideshow.deleteAllSlides();
	} else if (slideshow.getSlides().length > 0) presence.setActivity(slideshow);
	else presence.setActivity();
});
