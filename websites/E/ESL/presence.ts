const presence = new Presence({
		clientId: "623229289864626195" // CLIENT ID FOR YOUR PRESENCE
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);
let item: HTMLElement,
	admin: HTMLElement,
	item2: HTMLElement,
	item3: HTMLImageElement;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "esl",
		startTimestamp: browsingTimestamp
	};

	admin = document.querySelector("#adminEnableLink > div");
	if (document.location.hostname === "fantasy.eslgaming.com") {
		presenceData.details = "ESL Fantasy";
		delete presenceData.state;

		delete presenceData.smallImageKey;

		presence.setActivity(presenceData);
	} else if (document.location.hostname === "pro.eslgaming.com") {
		if (document.location.pathname.includes("/standings/")) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = `${item.textContent} standings, ${item2.textContent}`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (
			document.location.pathname.includes("/scores-schedule/") ||
			document.location.pathname.includes("/matches/")
		) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = `${item.textContent} scores & schedule, ${item2.textContent}`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/top-player-stats/")) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = `${item.textContent} statistics, ${item2.textContent}`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/teams/")) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = `${item.textContent} teams, ${item2.textContent}`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/brackets/")) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = `${item.textContent} brackets, ${item2.textContent}`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/partners/")) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = `${item.textContent} partners, ${item2.textContent}`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/sponsors/")) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = `${item.textContent} sponsors, ${item2.textContent}`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/rules/")) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = `${item.textContent} rules, ${item2.textContent}`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/contact/")) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = `${item.textContent} contact, ${item2.textContent}`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/videos/")) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = `${item.textContent} videos, ${item2.textContent}`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/players/")) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = `${item.textContent} players, ${item2.textContent}`;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (
			document.location.pathname.includes("/news/") ||
			document.location.pathname.includes("/news-2/")
		) {
			item = document.querySelector(
				"#site-navigation-wrap > nav > ul > li > a > span > span"
			);
			item2 = document.querySelector(
				"#networkbar > esl-div > esl-div > esl-span"
			);
			presenceData.details = "ESL Pros, reading:";
			presenceData.state = `${item.textContent} news, ${item2.textContent}`;

			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);
		} else if (
			document.querySelector("#content > article > header > h2") !== null
		) {
			item = document.querySelector("#content > article > header > h2");
			presenceData.details = "ESL Pros, reading:";
			if (item.textContent.length > 128)
				presenceData.state = `${item.textContent.substring(0, 125)}...`;
			else presenceData.state = item.textContent;

			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/tour/")) {
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = "ESL Pro Tour";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else {
			presenceData.details = "ESL Pros, viewing:";
			presenceData.state = "Pro Tournament Overview";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		}
	} else if (document.location.hostname === "intelgrandslam.eslgaming.com") {
		if (document.location.pathname.includes("/rules/")) {
			presenceData.details = "ESL Intel Grand Slam";
			presenceData.state = "Reading the rules";

			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/history/")) {
			presenceData.details = "ESL Intel Grand Slam";
			presenceData.state = "Viewing the history";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (
			document.querySelector(
				"#content > div > div > div > section > div > div > div > div > div > div > div > h1"
			) !== null
		) {
			item = document.querySelector(
				"#content > div > div > div > section > div > div > div > div > div > div > div > h1"
			);
			presenceData.details = "ESL Intel Grand Slam, reading:";
			if (item.textContent.length > 128)
				presenceData.state = `${item.textContent.substring(0, 125)}...`;
			else presenceData.state = item.textContent;

			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);
		} else {
			presenceData.details = "ESL Intel Grand Slam";
			delete presenceData.state;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		}
	} else if (document.location.hostname === "www.intelextrememasters.com") {
		if (document.location.pathname.includes("/season-")) {
			item3 = document.querySelector("#site-logo-inner > a > img");
			if (item) {
				presenceData.details = "ESL Intel Extreme Masters";
				presenceData.state = `Viewing: ${item3.alt}`;

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			} else {
				presenceData.details = "ESL Intel Extreme Masters";
				delete presenceData.state;

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			}
		} else if (document.location.pathname.includes("/tickets/")) {
			presenceData.details = "ESL Intel Extreme Masters";
			presenceData.state = "Viewing ticket sale";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/iempc/")) {
			presenceData.details = "ESL Intel Extreme Masters";
			presenceData.state = "Viewing IEM PC";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/news/")) {
			presenceData.details = "ESL Intel Extreme Masters";
			presenceData.state = "Viewing the latest news";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/video/")) {
			presenceData.details = "ESL Intel Extreme Masters";
			presenceData.state = "Browsing through video's";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/legacy/")) {
			presenceData.details = "ESL Intel Extreme Masters";
			presenceData.state = "Viewing the legacy";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/about/")) {
			presenceData.details = "ESL Intel Extreme Masters";
			presenceData.state = "Viewing the about page";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/sponsors/")) {
			presenceData.details = "ESL Intel Extreme Masters";
			presenceData.state = "Viewing the sponsors";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/contact/")) {
			presenceData.details = "ESL Intel Extreme Masters";
			presenceData.state = "Viewing the contact form";

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (
			document.querySelector("#content > article > header > h2") !== null
		) {
			item = document.querySelector("#content > article > header > h2");
			presenceData.details = "ESL Intel Extreme Masters, reading:";
			if (item.textContent.length > 128)
				presenceData.state = `${item.textContent.substring(0, 125)}...`;
			else presenceData.state = item.textContent;

			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);
		} else {
			presenceData.details = "ESL Intel Extreme Masters";
			delete presenceData.state;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		}
	} else if (document.location.hostname === "www.esl-one.com") {
		item2 = document.querySelector("head > title");
		if (document.location.pathname.includes("/legal/")) {
			presenceData.details = "ESL ONE";
			presenceData.state = "Reading legal stuff";

			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);
		} else if (
			document.querySelector("#content > article > header > h2") !== null
		) {
			item = document.querySelector("#content > article > header > h2");
			presenceData.details = "ESL ONE, reading:";
			if (item.textContent.length > 128)
				presenceData.state = `${item.textContent.substring(0, 125)}...`;
			else presenceData.state = item.textContent;

			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);
		} else if (item2.textContent.includes(" - ")) {
			if (item2.textContent.split(" - ")[0].includes("ESL")) {
				presenceData.details = "ESL ONE viewing: ";
				[presenceData.state] = item2.textContent.split(" - ");

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			} else if (item2.textContent.split(" - ")[1].includes("ESL")) {
				presenceData.details = "ESL ONE viewing: ";
				[, presenceData.state] = item2.textContent.split(" - ");

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			}
		} else presence.setActivity();
	} else if (document.location.hostname === "photos.eslgaming.com") {
		presenceData.details = "ESL Photos";
		delete presenceData.state;

		delete presenceData.smallImageKey;

		presence.setActivity(presenceData);
	} else if (document.location.hostname === "brand.eslgaming.com") {
		presenceData.details = "ESL Brand";
		delete presenceData.state;

		delete presenceData.smallImageKey;

		presence.setActivity(presenceData);
	} else if (document.location.hostname === "about.eslgaming.com") {
		presenceData.details = "ESL About";
		delete presenceData.state;

		delete presenceData.smallImageKey;

		presence.setActivity(presenceData);
	} else if (document.location.hostname === "shop.eslgaming.com") {
		if (document.location.pathname.includes("/products/")) {
			item = document.querySelector(
				"#shopify-section-product-template > div > div > div > div > div:nth-child(2) > div > h1"
			);
			presenceData.details = "ESL Shop, viewing product:";
			presenceData.state = item.textContent;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/collections/")) {
			item = document.querySelector(
				"#shopify-section-collection-header > div > header > h1"
			);
			presenceData.details = "ESL Shop, viewing collection:";
			presenceData.state = item.textContent;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/cart")) {
			presenceData.details = "ESL Shop, viewing cart";
			delete presenceData.state;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/search")) {
			item = document.querySelector(
				"#MainContent > div > div > div > form > input.input-group-field"
			);
			presenceData.details = "ESL Shop, searching for:";
			presenceData.state = item.textContent;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else {
			presenceData.details = "ESL Shop";
			delete presenceData.state;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		}
	} else if (document.location.hostname === "tv.eslgaming.com") {
		if (
			document.querySelector(
				"#videoplayer_embed_container > div.videoplayer_embed_inner.ng-scope > h3"
			) !== null
		) {
			item = document.querySelector(
				"#videoplayer_embed_container > div.videoplayer_embed_inner.ng-scope > h3"
			);
			presenceData.details = "ESL TV, watching:";
			presenceData.state = item.textContent;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else {
			presenceData.details = "ESL TV";
			delete presenceData.state;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		}
	} else if (document.location.hostname === "play.eslgaming.com") {
		item2 = document.querySelector("head > title");
		if (document.location.pathname.includes("/games")) {
			presenceData.details = "Browsing through games";
			delete presenceData.state;

			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/help")) {
			presenceData.details = "Viewing customer support";
			delete presenceData.state;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/team/")) {
			item = document.querySelector(
				"body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > div:nth-child(3) > table.playerprofile_stammdaten > tbody > tr:nth-child(1) > td:nth-child(2)"
			);
			presenceData.details = "ESL Play, viewing team:";
			presenceData.state = item.textContent;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/player/")) {
			item = document.querySelector(
				"body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > div:nth-child(2) > div:nth-child(4) > table > tbody > tr:nth-child(2) > td:nth-child(2)"
			);
			presenceData.details = "ESL Play, viewing player:";
			presenceData.state = item.textContent;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/search/")) {
			item = document.querySelector(
				"body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > div:nth-child(1) > div:nth-child(1) > form > input[type=text]:nth-child(6)"
			);
			presenceData.details = "ESL Play, searching for:";
			presenceData.state = item.textContent;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/search")) {
			presenceData.details = "ESL Play - Search";
			delete presenceData.state;

			delete presenceData.smallImageKey;
			//disable Presence on admin settings
			presence.setActivity(presenceData);
		} else if (admin) {
			if (admin.textContent === "Admin") presence.setActivity();
			else {
				item = document.querySelector("head > title");
				presenceData.details = "ESL Play, viewing:";
				[presenceData.state] = item.textContent.split(" | ESL Play");
				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			}
		} else if (item2.textContent.includes(" | ESL Play")) {
			presenceData.details = "ESL Play, viewing:";
			[presenceData.state] = item2.textContent.split(" | ESL Play");

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else presence.setActivity();
	} else if (document.location.hostname === "www.eslgaming.com") {
		if (document.location.pathname.includes("/article/")) {
			item = document.querySelector("#content > article > header > h2");
			presenceData.details = "ESL News, reading:";
			if (item.textContent.length > 128)
				presenceData.state = `${item.textContent.substring(0, 125)}...`;
			else presenceData.state = item.textContent;

			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/category/")) {
			presenceData.details = "Browsing category:";
			[presenceData.state] = document.location.pathname.split("category/");

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else presence.setActivity();
	} else if (document.location.hostname === "forum.eslgaming.com") {
		if (document.location.pathname.includes("/discussion/")) {
			item = document.querySelector(
				"#vanilla_discussion_index > section > div > main > div.MessageList.Discussion > div > h1"
			);
			presenceData.details = "ESL Forums, reading:";
			if (item.textContent.length > 128)
				presenceData.state = `${item.textContent.substring(0, 125)}...`;
			else presenceData.state = item.textContent;

			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/categories/")) {
			presenceData.details = "ESL Forums, Browsing category:";
			[, presenceData.state] = document.location.pathname.split("categories/");

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/categories")) {
			presenceData.details = "ESL Forums, viewing:";
			presenceData.state = "all categories";
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/profile/comments")) {
			presenceData.details = "ESL Forums, viewing profile:";
			[, , , , presenceData.state] = document.location.pathname.split("/");
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/profile/discussions")) {
			presenceData.details = "ESL Forums, viewing profile:";
			[, , , , presenceData.state] = document.location.pathname.split("/");
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/profile")) {
			presenceData.details = "ESL Forums, viewing profile:";
			[, , , presenceData.state] = document.location.pathname.split("/");
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/discussions")) {
			presenceData.details = "ESL Forums, viewing:";
			presenceData.state = "the lastest discussions";
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else {
			presenceData.details = "ESL Forums";
			delete presenceData.state;
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		}
	} else if (document.location.hostname === "www.schulmeisterschaft.de") {
		if (document.location.pathname.includes("/news")) {
			item = document.querySelector(
				"body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > table > tbody > tr:nth-child(2) > td > div.TitleNews"
			);
			presenceData.details = "ESL - Schulmeisterschaft";
			presenceData.state = `Reading: ${item.textContent}`;
			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/team/")) {
			item = document.querySelector(
				"body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > div:nth-child(3) > table.playerprofile_stammdaten > tbody > tr:nth-child(1) > td:nth-child(2)"
			);
			presenceData.details = "ESL Schulmeisterschaft, viewing team:";
			presenceData.state = item.textContent;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/player/")) {
			item = document.querySelector(
				"body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > div:nth-child(2) > div:nth-child(4) > table > tbody > tr:nth-child(2) > td:nth-child(2)"
			);
			presenceData.details = "ESL Schulmeisterschaft, viewing player:";
			presenceData.state = item.textContent;

			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/streams")) {
			presenceData.details = "ESL - Schulmeisterschaft";
			presenceData.state = "Viewing stream page";
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/about")) {
			presenceData.details = "ESL - Schulmeisterschaft";
			presenceData.state = "Viewing about page";
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/support")) {
			presenceData.details = "ESL - Schulmeisterschaft";
			presenceData.state = "Viewing support page";
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("/games")) {
			presenceData.details = "ESL - Schulmeisterschaft";
			presenceData.state = "Viewing all games";
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (document.location.pathname.includes("play-es")) {
			presenceData.details = "ESL - Schulmeisterschaft";
			presenceData.state = "Viewing: play-eS";
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		} else if (admin) {
			if (admin.textContent === "Admin") presence.setActivity();
			else {
				item = document.querySelector("head > title");
				presenceData.details = "ESL - Schulmeisterschaft";
				presenceData.state = `Viewing: ${
					item.textContent.split(" | Schulmeisterschaft")[0]
				}`;
				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			}
		} else {
			item = document.querySelector("head > title");
			presenceData.details = "ESL - Schulmeisterschaft";
			presenceData.state = `Viewing: ${
				item.textContent.split(" | Schulmeisterschaft")[0]
			}`;
			delete presenceData.smallImageKey;

			presence.setActivity(presenceData);
		}
	} else presence.setActivity();
});
