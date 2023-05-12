const presence = new Presence({
		clientId: "721986767322087464",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

enum Assets {
	Play = "https://i.imgur.com/q57RJjs.png",
	Pause = "https://i.imgur.com/mcEXiZk.png",
	Stop = "https://i.imgur.com/aLYu3Af.png",
	Search = "https://i.imgur.com/B7FxcD4.png",
	Question = "https://i.imgur.com/pIIJniP.png",
	Live = "https://i.imgur.com/0HVm46z.png",
	Reading = "https://i.imgur.com/5m10TTT.png",
	Writing = "https://i.imgur.com/Pa00qZh.png",
	Call = "https://i.imgur.com/y4YKRZG.png",
	Vcall = "https://i.imgur.com/6wG9ZvM.png",
	Downloading = "https://i.imgur.com/ryrDrz4.png",
	Uploading = "https://i.imgur.com/SwNDR5U.png",
	Repeat = "https://i.imgur.com/Ikh95KU.png",
	RepeatOne = "https://i.imgur.com/qkODaWg.png",
	Premiere = "https://i.imgur.com/Zf8FSUR.png",
	PremiereLive = "https://i.imgur.com/yC4j9Lg.png",
	Viewing = "https://i.imgur.com/fpZutq6.png",
}
let currentURL = new URL(document.location.href),
	currentPath = currentURL.pathname.replace(/^\/|\/$/g, "").split("/"),
	presenceData: PresenceData = {
		details: "Viewing an unsupported page",
		largeImageKey: "https://i.imgur.com/9OFSS6T.png",
		startTimestamp: browsingTimestamp,
	};
const updateCallback = {
		_function: null as () => void,
		get function(): () => void {
			return this._function;
		},
		set function(parameter) {
			this._function = parameter;
		},
		get present(): boolean {
			return this._function !== null;
		},
	},
	/**
	 * Initialize/reset presenceData.
	 */
	resetData = (
		defaultData: PresenceData = {
			details: "Viewing an unsupported page",
			largeImageKey: "https://i.imgur.com/9OFSS6T.png",
			startTimestamp: browsingTimestamp,
		}
	): void => {
		currentURL = new URL(document.location.href);
		currentPath = currentURL.pathname.replace(/^\/|\/$/g, "").split("/");
		presenceData = { ...defaultData };
	},
	/**
	 * Search for URL parameters.
	 * @param urlParam The parameter that you want to know about the value.
	 */
	getURLParam = (urlParam: string): string => {
		return currentURL.searchParams.get(urlParam);
	};

((): void => {
	if (
		currentURL.hostname === "tm-exchange.com" ||
		currentURL.hostname === "www.tm-exchange.com"
	)
		presenceData.details = "On the home page";
	else if (currentURL.hostname === "blog.tm-exchange.com") {
		if (currentPath[0] === "post") {
			presenceData.details = "Reading a blog post";
			presenceData.state = document.querySelector(".WindowHeader1").textContent;
		} else if (currentPath[0] === "archive.aspx")
			presenceData.details = "Viewing the blog archive";
		else presenceData.details = "Viewing the blog";
	} else {
		let pageType: string,
			idPrefix = "ctl03";

		/*

		This part figures out the page type.
		There are three ways for getting it's type.

		The old structure are done as below.

		1. From the "action" parameter on the current URL.
		2. From the "action" parameter on the URL located on the "External Link" part on the top left corner.
		3. From the "Location" part on the top left corner, specifically the bolded part.

		The new structure (only TMNF and TMUF) are done as below.

		1. From the "action" path on the URL located on the "External Link" part on the top left corner.
		2. From the "Location" part on the top left corner, specifically the bolded part.
		3. From the "action" path on the current URL. (This is done last because the unrealibilty of the URL in some cases.)

		*/

		const locationType: { [index: string]: string } = {
			Home: "home",
			Login: "login", // action guessed
			Registration: "register", // action guessed
			"Lost Login": "forget", // action guessed
			"Track Info": "trackshow",
			"Search Tracks": "tracksearch",
			"Nadeo Tracks": "tracksearch",
			"Your AOI": "tracksearch",
			"User's Tracks": "tracksearch",
			"Track Signs": "tracksigns",
			"Track Upload": "trackuploadtrack",
			"Submit Replays": "recordmassupload",
			Leaderboards: "userrecords",
			"Your Tracks": "tracksearch",
			"Your Replays": "tracksearch",
			"Your Downloads": "tracksearch",
			PlayPal: "playpal",
			"PlayPal On-Line": "playpalonline",
			TrackBeta: "trackbeta",
			"Find Users": "usersearch",
			"User Info": "usershow",
			"User Packs": "trackpacksearch",
			"Pack Info": "trackpackshow",
			"Your Account": "usershow",
			"Send Private Message": "postupdate",
			"Edit Post": "postedit",
			"Report Problem": "reportproblem",
			"News Archive": "newssearch",
			"Track Replay Info": "trackreplayshow",
		};

		if (
			currentURL.host === "united.tm-exchange.com" ||
			currentURL.host === "tmnforever.tm-exchange.com"
		) {
			if (document.querySelector(".BookmarkCell a")) {
				currentURL = new URL(
					document.querySelector(".BookmarkCell a").textContent
				);
				currentPath = currentURL.pathname.replace(/^\/|\/$/g, "").split("/");
				[pageType] = currentPath;
			} else {
				try {
					pageType =
						locationType[
							document.querySelector(".NavigatorCell b").textContent
						];
				} catch (e) {
					pageType = currentPath[0] || null;
				}
			}
		} else if (
			getURLParam("action") !== null &&
			getURLParam("action") !== "auto#auto"
		)
			pageType = getURLParam("action");
		else if (document.querySelector(".BookmarkCell a")) {
			currentURL = new URL(
				document.querySelector(".BookmarkCell a").textContent
			);
			pageType = getURLParam("action");
		} else {
			try {
				pageType =
					locationType[document.querySelector(".NavigatorCell b").textContent];
			} catch (e) {
				pageType = null;
			}
		}

		if (document.querySelector(".NavigatorCell b").textContent === "Login")
			pageType = "login";

		/* This parts gives suffix to the top text of the activity (aka details), to differentiate the different sites on the network. */

		switch (currentURL.host) {
			case "united.tm-exchange.com":
				presenceData.smallImageKey = "united";
				presenceData.smallImageText = "United (TMUF-X)";
				idPrefix = "_ctl1";
				break;
			case "tmnforever.tm-exchange.com":
				presenceData.smallImageKey = "nforever";
				presenceData.smallImageText = "Nations Forever (TMNF-X)";
				idPrefix = "ctl01";
				break;
			case "nations.tm-exchange.com":
				presenceData.smallImageKey = "nations";
				presenceData.smallImageText = "Nations";
				break;
			case "sunrise.tm-exchange.com":
				presenceData.smallImageKey = "sunrise";
				presenceData.smallImageText = "Sunrise";
				break;
			case "original.tm-exchange.com":
				presenceData.smallImageKey = "original";
				presenceData.smallImageText = "Original";
				break;
		}

		/* This part sets the details to be given to PreMID. */

		if (
			currentPath[0] === "error" ||
			currentPath[0] === "errorhandler" ||
			(document.querySelector(".WindowTitle") &&
				document.querySelector(".WindowTitle").textContent === "Error") ||
			(document.querySelector("h1") &&
				document.querySelector("h1").textContent === "Server Error")
		)
			presenceData.details = "On a non-existent page";
		else {
			switch (pageType) {
				case "home": {
					presenceData.details = "On the home page";
					break;
				}
				case "login": {
					presenceData.details = "Logging in";
					break;
				}
				case "register": {
					presenceData.details = "Registering an account";
					break;
				}
				case "forget": {
					presenceData.details = "Figuring out the password";
					break;
				}
				case "trackshow": {
					presenceData.details = document.querySelector(
						`#${idPrefix}_ShowTrackName`
					).textContent;
					presenceData.state = document.querySelector(
						"tr.WindowTableCell1:nth-child(3) > td:nth-child(2) > a:nth-child(3)"
					).textContent;

					break;
				}
				case "tracksearch": {
					let searchSummary: string;
					if (
						document.querySelector(`#${idPrefix}_ShowSummary > b:nth-child(1)`)
							.textContent === "tracks"
					) {
						searchSummary = document
							.querySelector(`#${idPrefix}_ShowSummary`)
							.textContent.slice(15, this.length - 4);
					} else {
						searchSummary = document
							.querySelector(`#${idPrefix}_ShowSummary`)
							.textContent.slice(8, this.length - 4);
					}
					presenceData.details = "Searching for a track";
					if (document.querySelector(".TextFilter")) {
						presenceData.state = `${document
							.querySelector(".TextFilter")
							.textContent.slice(9, this.length - 1)}, ${searchSummary}`;
					} else {
						presenceData.state =
							searchSummary[0].toUpperCase() + searchSummary.slice(1);
					}

					break;
				}
				case "tracksigns": {
					presenceData.details = "Viewing track signs";
					break;
				}
				case "trackuploadtrack": {
					presenceData.details = "Uploading a track";
					break;
				}
				case "recordmassupload": {
					presenceData.details = "Submitting replays";
					break;
				}
				case "userrecords": {
					const searchSummary = document
						.querySelector(`#${idPrefix}_ShowSummary`)
						.textContent.slice(16, this.length - 4);
					presenceData.details = "Viewing the leaderboards";
					if (
						(document.querySelector(`#${idPrefix}_GetUser`) as HTMLInputElement)
							.value
					) {
						presenceData.state = `${
							(
								document.querySelector(
									`#${idPrefix}_GetUser`
								) as HTMLInputElement
							).value
						}, ${searchSummary}`;
					} else {
						presenceData.state =
							searchSummary[0].toUpperCase() + searchSummary.slice(1);
					}

					break;
				}
				case "forumshow":
				case "forumsshow": {
					presenceData.details = "Viewing the forums";
					if (pageType === "forumshow") {
						presenceData.state = document
							.querySelector(".WindowTitle")
							.textContent.trim();
					}

					break;
				}
				case "threadshow": {
					presenceData.details = "Viewing a thread";
					presenceData.state = document.querySelector(
						`#${idPrefix}_ShowSubject`
					).textContent;

					break;
				}
				case "playpal": {
					presenceData.details = "Viewing PlayPal";
					break;
				}
				case "playpalonline": {
					presenceData.details = "Viewing PlayPal Online";
					break;
				}
				case "trackbeta": {
					presenceData.details = "Viewing TrackBeta";
					break;
				}
				case "usersearch": {
					const searchSummary = document
						.querySelector(`#${idPrefix}_ShowSummary`)
						.textContent.slice(15, this.length - 4);
					presenceData.details = "Searching for a user";
					if (document.querySelector(`#${idPrefix}_ShowName`)) {
						presenceData.state = `${
							document.querySelector(`#${idPrefix}_ShowName`).textContent
						}, ${searchSummary}`;
					} else {
						presenceData.state =
							searchSummary[0].toUpperCase() + searchSummary.slice(1);
					}

					break;
				}
				case "usershow": {
					presenceData.details = "Viewing a user's info";
					presenceData.state = document.querySelector(
						`#${idPrefix}_ShowLoginId`
					).textContent;

					break;
				}
				case "trackpacksearch": {
					const searchSummary = document
						.querySelector(`#${idPrefix}_ShowSummary`)
						.textContent.slice(20, this.length - 4);
					presenceData.details = "Searching for a user pack";
					if (document.querySelector(`#${idPrefix}_ShowName`)) {
						presenceData.state = `${
							document.querySelector(`#${idPrefix}_ShowName`).textContent
						}, ${searchSummary}`;
					} else {
						presenceData.state =
							searchSummary[0].toUpperCase() + searchSummary.slice(1);
					}

					break;
				}
				case "postupdate": {
					presenceData.details = "Writing a private message";
					break;
				}
				case "trackpackshow": {
					presenceData.details = "Viewing a track pack";
					presenceData.state = `${
						document.querySelector(`#${idPrefix}_ShowPackName`).textContent
					} by ${
						document.querySelector(
							"#Table7 > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(3)"
						).textContent
					}`;

					break;
				}
				case "postedit": {
					presenceData.details = "Editing a post";
					break;
				}
				case "reportproblem": {
					presenceData.details = "Reporting something";
					break;
				}
				case "newssearch": {
					presenceData.details = "Viewing the news archive";
					break;
				}
				case "trackreplayshow": {
					presenceData.details = "Viewing the replay history";
					presenceData.state = document.querySelector(
						`#${idPrefix}_Windowrow10 a`
					).textContent;

					break;
				}
				// No default
			}
		}
	}
})();

if (updateCallback.present) {
	const defaultData = { ...presenceData };
	presence.on("UpdateData", async () => {
		resetData(defaultData);
		updateCallback.function();
		presence.setActivity(presenceData);
	});
} else {
	presence.on("UpdateData", async () => {
		presence.setActivity(presenceData);
	});
}
