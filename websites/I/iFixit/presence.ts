import { fetchGuideMetadata, guideMetadata } from "./functions/fetchMetadata";
import { getClosestStep } from "./functions/getClosestStep";

const presence = new Presence({
	clientId: "1323729326696566835",
});

const enum LargImages {
	Logo = "https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/ifixit.png",
}

enum Icons {
	veryeasy = "https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/very_easy.png",
	easy = "https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/easy.png",
	moderate = "https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/intermediate.png",
	difficult = "https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/difficult.png",
	time = "https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/time.png",
}

presence.on("UpdateData", async () => {
	const [thumbnailType, iconType, showStepTitle] = [
			presence.getSetting<number>("thumbnailType"),
			presence.getSetting<number>("iconType"),
			presence.getSetting<boolean>("showStepTitle"),
		],
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
				details: "Searching:",
				state: decodeURIComponent(search.match(/query=([A-z0-9%]+)/)[1]),
				smallImageKey: Assets.Search,
				smallImageText: "Searching",
			});
		case "Guide":
			if (path.length > 1) {
				await fetchGuideMetadata(path[2]);

				if (guideMetadata?.data) {
					const { data } = guideMetadata,
						{ title, category: device, steps, image, url } = data,
						{ stepLink, stepImage, stepNumber, stepTitle } =
							await getClosestStep();

					return await presence.setActivity({
						name: "iFixit",
						details: title.replaceAll(device, ""),
						state: (await showStepTitle)
							? `${stepTitle} (${stepNumber.replaceAll("Step ", "")}/${
									steps.length
							  }) `
							: `${stepNumber} out of ${steps.length}`,
						...((await thumbnailType) && {
							largeImageKey:
								(await thumbnailType) === 1
									? image.standard
									: (stepImage as HTMLImageElement),
						}),

						...((await iconType) && {
							smallImageKey:
								(await iconType) === 1
									? Icons.time
									: Icons[
											`${document
												.querySelector(".guide-difficulty")
												?.textContent.replaceAll(" ", "")
												.toLowerCase()}` as keyof typeof Icons
									  ],
							smallImageText:
								(await iconType) === 1
									? document.querySelector(".guide-time-required")?.textContent
									: document.querySelector(".guide-difficulty")?.textContent,
						}),

						buttons: [
							{
								label: "View guide",
								url: url.split("#")[0] + stepLink,
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
				details: `Browsing: ${decodeURIComponent(
					pathname.replace("/Device/", "").replaceAll("_", " ")
				)}`,
				largeImageKey: thumbnailType
					? document
							.querySelector(".banner-small-photo img")
							?.getAttribute("src")
					: LargImages.Logo,
			});
		case "Troubleshooting":
			return await presence.setActivity({
				name: path[2].replaceAll("+", " "),
				details: `Troubleshooting ${path[1].replaceAll("_", " ")}`,
				state: (await showStepTitle)
					? `${document.querySelector("a.css-1fppiwp .css-0")?.textContent} (${
							document.querySelector("a.css-1fppiwp div")?.textContent
					  }/${
							Array.from(document.querySelectorAll("div.css-19tnq1g")).pop()
								?.textContent
					  }) `
					: `Step ${
							document.querySelector("a.css-1fppiwp div")?.textContent
					  } out of ${
							Array.from(document.querySelectorAll("div.css-19tnq1g")).pop()
								?.textContent
					  }`,
				...(thumbnailType && {
					largeImageKey: document
						.querySelector("[data-testid*='troubleshooting-header'] img")
						?.getAttribute("src"),
				}),
				buttons: [
					{
						label: "View troubleshooting",
						url:
							href.split("#")[0] +
							document.querySelector("a.css-1fppiwp")?.getAttribute("href"),
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
				details: "Shopping:",
				state: `${path[1]?.replaceAll("_", " ") ?? ""} ${path[0]}`,
			});
		case "products": {
			const image = document.querySelector(
				"div[data-testid*='product-gallery-desktop'] img"
			);

			return await presence.setActivity({
				details: `Buying: ${image?.getAttribute("alt")}`,
				largeImageKey: thumbnailType
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
