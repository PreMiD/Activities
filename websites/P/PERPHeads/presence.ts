const presence = new Presence({
		clientId: "798312419260104705",
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

let user: HTMLElement, search: HTMLElement, title: HTMLElement;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/Zbr5ofa.png",
		startTimestamp: browsingTimestamp,
	};
	if (document.location.hostname === "perpheads.com") {
		title = document.querySelector(
			"div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1"
		);
	}
	if (document.location.pathname.includes("/threads/")) {
		title = document.querySelector(
			"div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1"
		);
		if (title) {
			title = document.querySelector(
				"div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1"
			);
			presenceData.state = title.textContent;
			presenceData.details = "Forums, viewing thread:";

			delete presenceData.smallImageKey;
			presence.setActivity(presenceData);
		} else {
			presenceData.details = "Forums, Browsing...";
			delete presenceData.state;
			delete presenceData.smallImageKey;
			presence.setActivity(presenceData);
		}
	} else if (document.location.pathname.includes("/forums/")) {
		title = document.querySelector(
			"div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1"
		);
		if (title) {
			title = document.querySelector(
				"div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1"
			);
			presenceData.state = title.textContent;
			presenceData.details = "Forums, viewing category:";

			delete presenceData.smallImageKey;
			presence.setActivity(presenceData);
		} else {
			presenceData.details = "Forums, Browsing...";
			delete presenceData.state;
			delete presenceData.smallImageKey;
			presence.setActivity(presenceData);
		}
	} else if (
		document.location.pathname.includes("/whats-new/") &&
		document.location.pathname.includes("/profile-posts/")
	) {
		presenceData.details = "Forums, viewing the list of";
		presenceData.state = "latest profile posts";
		delete presenceData.smallImageKey;

		presence.setActivity(presenceData);
	} else if (
		document.location.pathname.includes("/whats-new/") &&
		document.location.pathname.includes("/posts/")
	) {
		presenceData.details = "Forums, viewing the list of";
		presenceData.state = "latest posts";

		delete presenceData.smallImageKey;

		presence.setActivity(presenceData);
	} else if (document.location.pathname.includes("/search/")) {
		search = document.querySelector(
			"div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1 > a > em"
		);
		if (search) {
			presenceData.details = "Forums, searching for:";
			presenceData.state = search.textContent;

			presenceData.smallImageKey = Assets.Search;

			presence.setActivity(presenceData);
		}
	} else if (document.location.pathname.includes("/members/")) {
		user = document.querySelector(
			"div.p-body-content > div.block > div.block-container > div.block-body > div.memberHeader > div.memberProfileBanner > div.memberHeader-mainContent > div.memberHeader-content > h1 > span > span > span > span"
		);
		presenceData.details = "Forums, viewing user:";
		presenceData.state = user.textContent;

		delete presenceData.smallImageKey;

		presence.setActivity(presenceData);
	} else if (document.location.pathname.includes("/account/")) {
		presenceData.details = "Forums, account settings";
		delete presenceData.state;

		delete presenceData.smallImageKey;

		presence.setActivity(presenceData);
	} else if (document.location.pathname.includes("/watched/")) {
		if (document.location.pathname.includes("/threads")) {
			presenceData.details = "Forums, Viewing their";
			presenceData.state = "watched threads";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else {
			presenceData.details = "Forums, Viewing their";
			presenceData.state = "watched forums";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		}
	} else if (document.location.pathname.includes("/conversations/")) {
		if (
			document.querySelector(
				"div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1"
			)
		) {
			title = document.querySelector(
				"div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1"
			);
			presenceData.state = title.textContent;
			presenceData.details = "Forums, Reading a DM";
			presenceData.state = `${title}...`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else {
			presenceData.details = "Forums, Browsing";
			presenceData.state = "through DMs";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		}
	} else if (document.location.hostname === "help.perpheads.com") {
		presenceData.details = "PERPHeads Help";
		delete presenceData.state;

		delete presenceData.smallImageKey;

		presence.setActivity(presenceData);
	} else if (
		document.location.pathname.includes("/pages/") &&
		document.location.pathname.includes("/donate/")
	) {
		presenceData.details = "PERPHeads Donate";
		delete presenceData.state;

		delete presenceData.smallImageKey;

		presence.setActivity(presenceData);
	} else presence.setActivity();
});
