const presence = new Presence({
		clientId: "1106990410838065172",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const assets = {
			phindLogo: "https://i.imgur.com/fakWcYA.png",
			search: "https://i.imgur.com/a5qsEbL.png",
		},
		presenceData: PresenceData = {
			largeImageKey: assets.phindLogo,
			details: "Browsing Phind",
		},
		pathDetailsMap = {
			"/default": "Viewing how to set Phind as default",
			"/bangs": "Viewing !Bangs",
			"/mobile": "Viewing Mobile Page",
			"/hotkeys": "Viewing Hotkeys",
			"/history": "Viewing Search History",
			"/about": "Viewing About Page",
			"/tutorial": "Viewing Tutorial",
			"/privacy": "Viewing Privacy Policy",
			"/terms": "Viewing Terms",
		},
		{ pathname, href } = document.location,
		pathDetails = Object.entries(pathDetailsMap).find(([pathPrefix]) =>
			pathname.startsWith(pathPrefix)
		),
		searchResults = document.querySelectorAll("div.row[name^='answer-']"),
		[displayTime, displaySearch, shareSearch, privateMode] = await Promise.all([
			presence.getSetting("displayTime"), // shows/hides the time spent on the site
			presence.getSetting("displaySearch"), // shows/hides your search query text
			presence.getSetting("shareSearch"), // shares your search with a button
			presence.getSetting("privateMode"), // hides the querry, button and what exact page you are on
		]);

	if (displayTime) presenceData.startTimestamp = browsingTimestamp;

	if (pathDetails) {
		presenceData.details = pathDetails[1]; // display text of /path
		presenceData.state = pathname; // display /path
	} else if (searchResults.length > 0 && !privateMode) {
		// we must be on /search and arn't in private mode
		// presenceData.details = "Searching";
		presenceData.details = displaySearch ? "Searching for:" : "Searching";
		presenceData.smallImageKey = assets.search;
		presenceData.smallImageText = "Searching";
		if (displaySearch) {
			// share search query text
			presenceData.state = searchResults[
				searchResults.length - 1
			].querySelector("span.fw-bold.fs-3.mb-3").textContent;
		}
		if (shareSearch) {
			// share search query with button
			presenceData.buttons = [
				{
					label: "Open Search Result",
					url: href,
				},
			];
		}
	}

	if (privateMode) {
		// hide everything except the large image and site name
		presenceData.details = "Browsing Phind";
		delete presenceData.state;
		delete presenceData.smallImageKey;
		delete presenceData.smallImageText;
		delete presenceData.buttons;
		delete presenceData.startTimestamp;
		delete presenceData.endTimestamp;
	}

	presence.setActivity(presenceData);
});
