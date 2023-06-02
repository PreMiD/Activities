const presence = new Presence({
		clientId: "632013978608074764",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

let user: HTMLElement | Element | string,
	title: HTMLElement | Element | string,
	search: HTMLElement | Element | string,
	playing: boolean,
	paused: boolean,
	progress: HTMLElement | Element | string | number,
	lastState: HTMLElement | Element | string;

lastState = null;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "https://cdn.rcd.gg/PreMiD/websites/M/Monstercat/assets/logo.png",
	};

	if (document.location.hostname === "www.monstercat.com") {
		progress = document.querySelector(".progress"); //Catches the progress bar
		progress = (progress as HTMLStyleElement).style.cssText
			.replace("width: ", "")
			.replace("%;", ""); //Replace everything so only "x.xxxx" is left (x standing for numbers)
		if (lastState === progress && progress !== "0" && progress !== "100") {
			playing = true;
			paused = true;
		} else if (progress === "0" || progress === "100") {
			playing = false;
			paused = true;
		} else {
			lastState = progress;
			playing = true;
			paused = false;
		}

		progress = Number(progress);
		progress = Math.round(progress);

		if (playing === true && paused === false) {
			title = document.querySelector(
				"body > header > div.container.player > div.flex.controls.push-right.playing > a > span"
			);
			presenceData.details = (title as HTMLElement).textContent;
			presenceData.state = `${progress}% progressed`;
			presenceData.smallImageKey = Assets.Play;
			presenceData.smallImageText = "Playing";
		} else if (playing === true && paused === true) {
			title = document.querySelector(
				"body > header > div.container.player > div.flex.controls.push-right.playing > a > span"
			);
			presenceData.details = (title as HTMLElement).textContent;
			presenceData.state = `${progress}% progressed`;
			presenceData.smallImageKey = Assets.Pause;
			presenceData.smallImageText = "Paused";
		} else {
			//If there is no song playing display site information
			presenceData.startTimestamp = browsingTimestamp;
			if (document.location.pathname.includes("/release/")) {
				title = document.querySelector(
					"body > section > div:nth-child(1) > div.container.flex > div > h1"
				);
				user = document.querySelector(
					"body > section > div:nth-child(1) > div.container.flex > div > h3"
				);
				presenceData.details = "Viewing release:";
				presenceData.state = `${(title as HTMLElement).textContent} by ${
					(user as HTMLElement).textContent
				}`;
			} else if (document.location.pathname.includes("/artist/")) {
				user = document.querySelector(
					"body > section > div.top-banner > div.container.flex > div > div > h1"
				);
				presenceData.details = "Viewing artist:";
				presenceData.state = (user as HTMLElement).textContent;
			} else if (document.location.pathname.includes("/music"))
				presenceData.details = "Browsing music releases...";
			else if (document.location.pathname.includes("/browse"))
				presenceData.details = "Browsing...";
			else if (document.location.pathname.includes("/catalog"))
				presenceData.details = "Viewing catalog";
			else if (document.location.pathname.includes("/artists"))
				presenceData.details = "Viewing artists";
			else if (document.location.pathname.includes("/playlist/")) {
				title = document.querySelector("body > section > div > h1");
				presenceData.details = "Viewing playlist:";
				presenceData.state = (title as HTMLElement).textContent;
			} else if (document.location.pathname.includes("/playlists"))
				presenceData.details = "Viewing their playlists";
			else if (document.location.pathname.includes("/events"))
				presenceData.details = "Viewing events";
			else if (document.location.pathname.includes("/event/")) {
				title = document.querySelector(
					"body > section > div.event-page-header > div > div.container.container--event-header.flex > div > a.silent.no-hover > h1"
				);
				presenceData.details = "Reading about event:";
				if ((title as HTMLElement).textContent.length > 128) {
					presenceData.state = `${(title as HTMLElement).textContent.substring(
						0,
						125
					)}...`;
				} else presenceData.state = (title as HTMLElement).textContent;

				presenceData.smallImageKey = Assets.Reading;
			} else if (document.location.pathname.includes("/publishing"))
				presenceData.details = "Viewing publishing";
			else if (document.location.pathname.includes("/cotw"))
				presenceData.details = "Viewing radio";
			else if (document.location.pathname.includes("/gold"))
				presenceData.details = "Viewing Monstercat Gold";
			else if (document.location.pathname.includes("/account"))
				presenceData.details = "Viewing their account";
			else if (document.location.pathname.includes("/blog/")) {
				if (document.location.pathname.includes("/tags/")) {
					title = document.querySelector("head > title");
					title = (title as HTMLElement).textContent.replace(
						" Posts - Monstercat",
						""
					);
					presenceData.details = "Blog - Viewing tag:";
					presenceData.state = title;
				} else {
					title = document.querySelector(
						"body > section > div.panel.panel--article > header > h1"
					);
					presenceData.details = "Reading article:";
					if ((title as HTMLElement).textContent.length > 128) {
						presenceData.state = `${(
							title as HTMLElement
						).textContent.substring(0, 125)}...`;
					} else presenceData.state = (title as HTMLElement).textContent;

					presenceData.smallImageKey = Assets.Reading;
				}
			} else if (document.location.pathname.includes("/blog"))
				presenceData.details = "Viewing blog posts";
			else if (document.location.pathname.includes("/search")) {
				search = document.querySelector(
					"body > header > div.container.player > div.col-xs-hidden.col-md-visible.global-search > form > input[type=text]"
				);
				presenceData.details = "Searching for:";
				presenceData.state = (search as HTMLInputElement).value;
				presenceData.smallImageKey = Assets.Search;
			} else if (document.location.pathname === "/")
				presenceData.details = "Viewing homepage";
		}
	} else if (document.location.hostname === "shop.monstercat.com") {
		presenceData.startTimestamp = browsingTimestamp;
		if (document.location.pathname.includes("/products/")) {
			presenceData.details = "Shop - Viewing product:";
			title = document.querySelector(
				"#product-description > div:nth-child(1) > h1"
			);
			if ((title as HTMLElement).textContent.length > 128) {
				presenceData.state = `${(title as HTMLElement).textContent.substring(
					0,
					125
				)}...`;
			} else presenceData.state = (title as HTMLElement).textContent;
		} else if (document.location.pathname.includes("/collections/")) {
			presenceData.details = "Shop - Viewing collection:";
			title = document.querySelector("#collection-description > h1");
			presenceData.state = (title as HTMLElement).textContent;
		} else if (document.location.pathname.includes("/cart"))
			presenceData.details = "Shop - Viewing cart";
		else if (document.location.pathname === "/")
			presenceData.details = "Viewing store front";
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
