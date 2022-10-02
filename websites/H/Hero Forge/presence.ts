const presence = new Presence({
		clientId: "1026195572354449428",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

let characterCreatorMenu: string[] = ["Species"];

setInterval(() => {
	if (window.location.pathname === "/") {
		const menuA = Array.from(
				document.querySelectorAll<HTMLLIElement>("#menuA > li")
			)
				.find(listItem => {
					return getComputedStyle(listItem).backgroundImage !== "none";
				})
				.textContent.trim(),
			menuB = Array.from(
				document.querySelectorAll<HTMLLIElement>("#menuB > li")
			)
				.find(listItem => {
					return getComputedStyle(listItem).backgroundImage !== "none";
				})
				.textContent.trim(),
			menuC = Array.from(
				document.querySelectorAll<HTMLLIElement>("#menuC > li")
			)
				.find(listItem => {
					return getComputedStyle(listItem).backgroundImage !== "none";
				})
				.textContent.trim()
				.toLowerCase();
		characterCreatorMenu = [menuA, menuB, menuC];
	}
}, 1000);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/gr29ZQz.png",
			startTimestamp: browsingTimestamp,
		},
		{ pathname } = window.location,
		pathSplit = pathname.split("/").filter(x => x);

	switch (pathSplit[0] ?? "") {
		case "": {
			if (
				document.querySelector<HTMLImageElement>(
					"[src='/static/svg/bug-white.svg']"
				)
			) {
				presenceData.details = "Creating a bug report";
			} else {
				const characterName = document
						.querySelector<HTMLDivElement>(
							"img[src='/static/svg/character-menu/character.svg'] + div"
						)
						.textContent.match(/^(.*?)\*?$/)[1],
					chosenItemContainer = document.querySelector<HTMLSpanElement>(
						"#view span[style*='/static/svg/item-selected.svg']"
					),
					chosenItemImage =
						chosenItemContainer.firstElementChild as HTMLImageElement,
					chosenItemName = chosenItemImage?.alt.match(/^(.*?) Add Part$/)[1];

				let mainState: string, subState: string;
				presenceData.details = `Modifying Character: ${characterName}`;
				switch (characterCreatorMenu[0]) {
					case "species": {
						mainState = "Species";
						if (chosenItemContainer) {
							subState = `${
								// TODO: fix this
								/Femle_thumb/.test(chosenItemImage.src) ? "Femle" : "Mle"
							} ${
								chosenItemContainer.parentElement.nextElementSibling.textContent
							}`;
						}
						break;
					}
					case "head": {
						mainState = "Facial Features";
						if (chosenItemContainer) {
							subState = `${characterCreatorMenu[1]} - ${chosenItemName}`;
						} else {
							subState = characterCreatorMenu[1];
						}
						break;
					}
					case "body": {
						mainState = "Body Features";
						if (characterCreatorMenu[1] === "measure") {
							subState = "Measurements";
						} else {
							if (chosenItemContainer) {
								subState = `${characterCreatorMenu[1]} - ${chosenItemName}`;
							} else {
								subState = characterCreatorMenu[1];
							}
						}
						break;
					}
					case "clothing": {
						mainState = "Clothing";
						if (characterCreatorMenu[1] === "outfit") {
							subState = "Outfit";
						} else {
							if (chosenItemContainer) {
								subState = `${characterCreatorMenu[1]} - ${chosenItemName}`;
							} else {
								subState = characterCreatorMenu[1];
							}
						}
					}
				}
				presenceData.state = `${mainState}: ${subState}`;
			}
			break;
		}
		case "account": {
			presenceData.details = "Managing account settings";
			presenceData.state = document.querySelector<HTMLAnchorElement>(
				"[class*=sidenavContainer] [class*=itemActive]"
			).textContent;
			break;
		}
		case "intro": {
			presenceData.details = "Browsing";
			presenceData.state = "Sample characters and introduction";
			break;
		}
		case "media-request": {
			presenceData.details = "Creating a media request";
			presenceData.state = document.querySelector<HTMLLabelElement>(
				"#issue_choices input:checked + label"
			).textContent;
			break;
		}
		case "suggest": {
			presenceData.details = "Suggesting a feature";
			break;
		}
		default: {
			if (pathSplit[0].startsWith("load_config")) {
				presenceData.details = "Loading character";
			} else {
				presenceData.details = "Browsing";
				presenceData.state = document.title.match(
					/^(.*?)(?: \| Hero Forge®)?$/
				)[1];
			}
		}
	}

	presence.setActivity(presenceData);
});
