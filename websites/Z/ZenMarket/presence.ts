const presence = new Presence({
		clientId: "971483473024004157",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

const enum Assets {
	Logo = "https://i.ibb.co/n3h8QbV/zenlogo-sm.png",
}

// Function to remove the lang prefixes that occur with different languages
async function removeLangPath(path: string) {
	const splitPath = path.split("/");
	const locales: Set<string> = new Set(["en", "ru", "de", "ua", "ja", "cn", "tw", "es", "fr", "ms", "vi", "ar", "id" , "th", "it", "pt", "tr", "pl", "ko"]);

	if (locales.has(splitPath[1])) return splitPath.filter(part => !locales.has(part)).join("/");
	else return path;
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: Assets.Logo,
		startTimestamp: browsingTimestamp,
		details: "Browsing ZenMarket",
	};

	const path = await removeLangPath(document.location.pathname);

	// Home

	if (path === "/") presenceData.details = "Viewing Main Page";

	// Profile

	if (path === "/profile/" || path === "/profile/default.aspx") {
		const warehouseTable: HTMLTableElement = document.querySelector(
			"#productsBought > div:nth-child(1) > table"
		),
		cartTable: HTMLTableElement = document.querySelector(".shop-stripped");

		// remove one from cartItems as there is an information table row which isn"t one of the items
		const cartItems = cartTable ? cartTable.rows.length - 1 : 0,
		warehouseItems = warehouseTable ? warehouseTable.rows.length : 0;

		presenceData.details = "Viewing Account";
		presenceData.state = `${warehouseItems > 1 || warehouseItems === 0 ? `${warehouseItems} items` : `${warehouseItems} item`} in warehouse || ${cartItems > 1 || cartItems === 0 ? `${cartItems} items` : `${cartItems} item`} in cart`;
	}

	if (path === "/profile/messages.aspx" || path === "/profile/support.aspx") presenceData.details = "Viewing Messages";

	if (path === "/profile/actions.aspx") presenceData.details = "Looking at Events";

	if (path === "/profile/watchlist.aspx") {
		if (document.location.search.includes("tab=auctions") && !document.location.search.includes("history") || !document.location.search) {
			const products = document.querySelector(
                "#auctions > div:nth-child(2) > .col-md-12"
            ),
			watchCount = products ? products.children.length - 1 : 0;

			presenceData.details = "Looking at watched auction items";
			presenceData.state = `${watchCount > 1 || watchCount === 0 ? `${watchCount} items` : `${watchCount} item`} on the watchlist`;
		}
		else if (document.location.search.includes("tab=auctions") && document.location.search.includes("history")) presenceData.details = "Viewing history of watched auction items";
		else if (document.location.search.includes("tab=products")) {
			const products = document.querySelector(
                "#products > div:nth-child(2) > .col-md-12"
            ),
			watchCount = products ? products.children.length : 0;

			presenceData.details = "Looking at watched items";
			presenceData.state = `${watchCount > 1 || watchCount === 0 ? `${watchCount} items` : `${watchCount} item`} on the watchlist`;
		}
		else if (document.location.search.includes("tab=sellers")) presenceData.details = "Viewing watched sellers";
		else if (document.location.search.includes("tab=recent")) presenceData.details = "Looking at recently viewed items";
	}

	if (path === "/profile/parcel.aspx") presenceData.details = "Viewing parcels";

	if (path === "/profile/payments.aspx") presenceData.details = "Viewing transactions";

	if (path === "/profile/levels.aspx") {
		presenceData.details = "Checking current level";
		presenceData.state = `Current Level: ${(document.querySelector("#lblCurrentTier") as HTMLSpanElement).textContent}`;
	}

	if (path === "/profile/settings.aspx") presenceData.details = "Viewing settings";

	// Product view

	if (path === "/auction.aspx" && document.location.search.includes("itemCode")) {
		const itemTitle: HTMLSpanElement = document.querySelector("#itemTitle"),
		price: HTMLSpanElement = document.querySelector("#lblPriceY"),
		bids: HTMLSpanElement = document.querySelector("#bidNum"),
		condition: HTMLSpanElement = document.querySelector("#lblItemStatus"),
		seller: HTMLSpanElement = document.querySelector("#seller"),
		url: HTMLAnchorElement = document.querySelector("#productPage");

		presenceData.details = `Looking at ${itemTitle.textContent}`;
		presenceData.state = `Price: ${price.textContent} || Bids: ${bids.textContent} || Condition: ${condition.textContent} || Seller: ${seller.textContent}`;
		presenceData.buttons = [
			{
				label: "View on ZenMarket",
				url: document.location.href,
			},
			{
				label: "View on Yahoo Auctions",
				url: url.href,
			}
		];
	}

	if (path === "/yshoppingproduct.aspx") {
		const itemTitle: HTMLSpanElement = document.querySelector("#itemTitle"),
		price: HTMLSpanElement = document.querySelector("#lblPrice"),
		condition: HTMLSpanElement = document.querySelector("#lblItemCondition"),
		seller: HTMLSpanElement = document.querySelector("#seller"),
		url: HTMLAnchorElement = document.querySelector("#productPage");

		presenceData.details = `Looking at ${itemTitle.textContent}`;
		presenceData.state = `Price: ${price.textContent} || Condition: ${condition.textContent} || Seller: ${seller.textContent}`;
		presenceData.buttons = [
			{
				label: "View on ZenMarket",
				url: document.location.href,
			},
			{
				label: "View on Yahoo Shopping",
				url: url.href,
			}
		];
	}

	if (path === "/mercariproduct.aspx") {
		const itemTitle: HTMLSpanElement = document.querySelector("#itemTitle"),
		price: HTMLSpanElement = document.querySelector("#lblPrice"),
		seller: HTMLSpanElement = document.querySelector("#seller"),
		url: HTMLAnchorElement = document.querySelector("#productPage");

		presenceData.details = `Looking at ${itemTitle.textContent}`;
		presenceData.state = `Price: ${price.textContent} || Seller: ${seller.textContent}`;
		presenceData.buttons = [
			{
				label: "View on ZenMarket",
				url: document.location.href,
			},
			{
				label: "View on Mercari",
				url: url.href,
			}
		];
	}

	if (path === "/rakumaproduct.aspx") {
		const itemTitle: HTMLSpanElement = document.querySelector("#itemTitle"),
		price: HTMLSpanElement = document.querySelector("#lblPrice"),
		seller: HTMLSpanElement = document.querySelector("#seller"),
		url: HTMLAnchorElement = document.querySelector("#productPage");

		presenceData.details = `Looking at ${itemTitle.textContent}`;
		presenceData.state = `Price: ${price.textContent} || Seller: ${seller.textContent}`;
		presenceData.buttons = [
			{
				label: "View on ZenMarket",
				url: document.location.href,
			},
			{
				label: "View on Rakuma",
				url: url.href,
			}
		];
	}

	if (path === "/rakutenproduct.aspx") {
		const itemTitle: HTMLSpanElement = document.querySelector("#itemTitle"),
		price: HTMLSpanElement = document.querySelector("#lblPrice"),
		seller: HTMLSpanElement = document.querySelector("#seller"),
		url: HTMLAnchorElement = document.querySelector("#productPage");

		presenceData.details = `Looking at ${itemTitle.textContent}`;
		presenceData.state = `Price: ${price.textContent} || Seller: ${seller.textContent}`;
		presenceData.buttons = [
			{
				label: "View on ZenMarket",
				url: document.location.href,
			},
			{
				label: "View on Rakuten",
				url: url.href,
			}
		];
	}

	if (path === "/amazonproduct.aspx") {
		const itemTitle: HTMLSpanElement = document.querySelector("#itemTitle"),
		price: HTMLSpanElement = document.querySelector("#lblPrice"),
		condition: HTMLSpanElement = document.querySelector("#lblConditionName"),
		url: HTMLAnchorElement = document.querySelector("#productPage");

		presenceData.details = `Looking at ${itemTitle.textContent}`;
		presenceData.state = `Price: ${price.textContent} ${condition ? `|| Condition: ${condition.textContent}` : ""}`;
		presenceData.buttons = [
			{
				label: "View on ZenMarket",
				url: document.location.href,
			},
			{
				label: "View on Amazon",
				url: url.href,
			}
		];
	}

	if (path === "/othershopproduct.aspx") {
		const itemTitle: HTMLSpanElement = document.querySelector("#itemTitle"),
		price: HTMLSpanElement = document.querySelector("#lblPrice"),
		url: HTMLAnchorElement = document.querySelector("#productPage");

		presenceData.details = `Looking at ${itemTitle.textContent}`;
		presenceData.state = `Price: ${price.textContent}`;
		presenceData.buttons = [
			{
				label: "View on ZenMarket",
				url: document.location.href,
			},
			{
				label: "View on original page",
				url: url.href,
			}
		];
	}

	if (path.includes("/s/") && path.split("/").length === 4 && document.querySelector("#itemTitle")) {
		const itemTitle: HTMLSpanElement = document.querySelector("#itemTitle"),
		price: HTMLSpanElement = document.querySelector("#lblPrice"),
		seller: HTMLSpanElement = document.querySelector("#aSeller");

		presenceData.details = `Looking at ${itemTitle.textContent}`;
		presenceData.state = `Price: ${price.textContent} || Seller: ${seller.textContent}`;
		presenceData.buttons = [
			{
				label: "View on ZenMarket",
				url: document.location.href,
			},
			{
				label: "View on ZenPlus",
				url: (document.querySelector("#itemUrl") as HTMLAnchorElement).href,
			}
		];
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
