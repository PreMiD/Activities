const presence = new Presence({
		clientId: "996516483150663721",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	let presenceData = {
		smallImageKey: "https://i.imgur.com/B5iUj20.png",
		largeImageKey: "https://i.imgur.com/yOolF4f.png",
		largeImageText: "Browsing Currys",
		startTimestamp: browsingTimestamp,
		details: "Browsing",
		state: "Currys Website",
	};
	const { pathname } = document.location;

	switch (true) {
		case !!document.querySelector(".amp-herobanner-headline"):
			presenceData.state = document.querySelector(
				".amp-herobanner-headline"
			).textContent;
			break;
		case !!document.querySelector(".plp-heading"):
			presenceData.state = document.querySelector(".plp-heading").textContent;
			break;
		case !!document.querySelector("#clp-row-1 > div > div > h1"):
			presenceData.state = document.querySelector(
				"#clp-row-1 > div > div > h1"
			).textContent;
			break;
		case !!document.querySelector("#clp-row-1 > div > h1"):
			presenceData.state = document.querySelector(
				"#clp-row-1 > div > h1"
			).textContent;
			break;
		case pathname.includes("/products/") &&
			!!document.querySelector(".product-name"):
			presenceData.state = document.querySelector(".product-name").textContent;
			break;
		default:
			break;
	}

	const pages: Record<string, PresenceData> = {
		"/account": { details: "Viewing", state: "My Account" },
		"/wishlist-show": { details: "Viewing", state: "Wishlist" },
		"/order": { details: "Viewing", state: "Orders" },
		"/manage-your-details": { details: "Managing", state: "Account Details" },
		"/cart": { details: "Viewing", state: "Basket" },
		"/store-finder": { details: "Finding", state: "Stores" },
		"/services/": { details: "Viewing", state: "Services" },
	};

	for (const [path, data] of Object.entries(pages))
		if (pathname.includes(path)) presenceData = { ...presenceData, ...data };

	// Search Term
	if (location.href.includes("search")) {
		// Searching product
		const replaced = document
			.querySelector(".plp-heading")
			.textContent.replace(/["]/g, " ")
			.replace("Showing results for", "");

		presenceData.details = "Searching for:";
		presenceData.state = replaced;
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
