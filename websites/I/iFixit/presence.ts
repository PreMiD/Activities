import { fetchGuideMetadata, guideMetadata } from "./functions/fetchMetadata";
import { getClosestStep } from "./functions/getClosestStep";

const presence = new Presence({
	clientId: "1323729326696566835",
});

const enum LargImages {
	Logo = "https://imgur.com/JIjO52r.png",
}

enum DifficultyIcons {
	veryeasy = "https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/very_easy.png",
	easy = "https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/easy.png",
	moderate = "https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/intermediate.png",
	difficult = "https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/difficult.png",
}

presence.on("UpdateData", async () => {
	const [showThumbnails, showStepTitle] = await Promise.all([
			presence.getSetting<boolean>("showThumbnails"),
			presence.getSetting<boolean>("showStepTitle"),
		]),
		{ pathname, search, href } = document.location,
		path = pathname.split("/");
	path.shift();

	if (["en-eu", "en-ca", "fr-fr", "en-gb", "de-de"].includes(path[0]))
		path.shift();

	switch (path[0]) {
		case "":
			return await presence.setActivity({
				details: "Browsing: Home",
			});
		case "Search":
			return await presence.setActivity({
				details: "Searching for",
				state: decodeURIComponent(search.match(/query=([A-z0-9%]+)/)[1]),
				smallImageKey: Assets.Search,
				smallImageText: "Searching",
			});
		case "Guide":
			if (path.length > 1) {
				await fetchGuideMetadata(path[2]);

				if (guideMetadata?.data) {
					const { data } = guideMetadata,
						{ title, category: device, image, steps, url } = data,
						{ stepLink, stepNumber, stepTitle } = await getClosestStep();

					return await presence.setActivity({
						name: `${title.replaceAll(device, "")} — iFixit`,
						details: device,
						state: showStepTitle
							? `${stepTitle} (${stepNumber.replaceAll("Step ", "")}/${
									steps.length
							  }) `
							: `${stepNumber} out of ${steps.length}`,
						largeImageKey: showThumbnails ? image.standard : LargImages.Logo,
						smallImageKey:
							DifficultyIcons[
								`${document
									.querySelector(".guide-difficulty")
									?.textContent.replaceAll(" ", "")
									.toLowerCase()}` as keyof typeof DifficultyIcons
							],
						smallImageText:
							document.querySelector(".guide-difficulty")?.textContent,
						buttons: [
							{
								label: "View guide",
								url: url + stepLink,
							},
							{
								label: "View device",
								url: `https://www.ifixit.com/Device/${device.replaceAll(
									" ",
									"_"
								)}`,
							},
						],
					});
				}
			}

			return await presence.setActivity({
				details: "Browsing: Guides",
			});
		case "Device":
			return await presence.setActivity({
				details: "Browsing device",
				state: decodeURIComponent(
					pathname.replace("/Device/", "").replaceAll("_", " ")
				),
				largeImageKey: showThumbnails
					? document
							.querySelector(".banner-small-photo img")
							?.getAttribute("src")
					: LargImages.Logo,
			});
		case "Troubleshooting":
			return await presence.setActivity({
				name: path[2].replaceAll("+", " "),
				details: `Troubleshooting ${path[1]}`,
				state: document.querySelector("a.css-1fppiwp").textContent,
				buttons: [
					{
						label: "View troubleshooting",
						url: href,
					},
				],
			});
		//case "Wiki":
		//case "Answers":
		//case "Community":

		case "Store":
			return await presence.setActivity({
				details: "Browsing: Store",
			});
		case "Parts":
		case "Tools":
			return await presence.setActivity({
				details: "Shopping for",
				state: `${path[1]?.replaceAll("_", " ") ?? ""} ${path[0]}`,
			});
		case "products": {
			const image = document.querySelector(
				"div[data-testid*='product-gallery-desktop'] img"
			);

			return await presence.setActivity({
				details: "Buying item",
				state: image?.getAttribute("alt"),
				largeImageKey: showThumbnails
					? image?.getAttribute("src")
					: LargImages.Logo,
				buttons: [
					{
						label: "View product",
						url: href,
					},
				],
			});
		}
	}
});
