const presence = new Presence({
		clientId: "626462884649500686", // CLIENT ID FOR YOUR PRESENCE
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);
let user: Element | HTMLElement | string,
	search: Element | HTMLElement | string,
	title: Element | HTMLElement | string;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/yPLG6pu.png",
		startTimestamp: browsingTimestamp,
	};

	switch (document.location.hostname) {
		case "www.minecraftforge.net": {
			if (document.location.pathname.includes("/topic/")) {
				title = document.querySelector(
					"body > main > div.sidebar-wrapper-content > div.ipsPageHeader.ipsClearfix > div.ipsPhotoPanel.ipsPhotoPanel_small.ipsPhotoPanel_notPhone.ipsClearfix > div > h1 > span > span"
				);

				presenceData.details = "Forums, viewing thread:";
				if (title.textContent.length > 128)
					presenceData.state = `${title.textContent.substring(0, 125)}...`;
				else presenceData.state = title.textContent;

				delete presenceData.smallImageKey;
				presence.setActivity(presenceData);
			} else if (document.location.pathname.includes("/search/")) {
				search = document.querySelector(
					"body > main > div > div:nth-child(2) > div.ipsResponsive_hidePhone.ipsResponsive_block.ipsPageHeader > p"
				);
				presenceData.details = "Forums, searching for:";
				[presenceData.state] = search.textContent.split("'");

				presenceData.smallImageKey = "search";

				presence.setActivity(presenceData);
			} else if (document.location.pathname.includes("/profile/")) {
				user = document.querySelector(
					"#elProfileHeader > div.ipsColumns.ipsColumns_collapsePhone > div.ipsColumn.ipsColumn_fluid > div > h1"
				);
				presenceData.details = "Forums, viewing user:";
				presenceData.state = user.textContent;

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			} else if (document.location.pathname.includes("/online/")) {
				presenceData.details = "Forums, viewing list of:";
				presenceData.state = "all online users";

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			} else if (document.location.pathname.includes("/staff/")) {
				presenceData.details = "Forums, viewing list of:";
				presenceData.state = "all staff members";

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			} else if (document.location.pathname.includes("/forum/")) {
				title = document.querySelector<HTMLElement>(
					"body > main > div.sidebar-wrapper-content > div.forum-header > div:nth-child(1) > h1"
				);
				if (title) {
					presenceData.details = "Forums, viewing category:";
					presenceData.state = title.textContent;

					delete presenceData.smallImageKey;

					presence.setActivity(presenceData);
				} else {
					presenceData.details = "Forums, Browsing...";
					delete presenceData.state;

					delete presenceData.smallImageKey;

					presence.setActivity(presenceData);
				}
			} else presence.setActivity();

			break;
		}
		case "files.minecraftforge.net": {
			title = document.querySelector<HTMLElement>(
				"body > main > div.sidebar-sticky-wrapper-content > div.promos-wrapper > div.promos-content > h1"
			);
			if (title) {
				presenceData.details = "Files, viewing Forge for:";
				presenceData.state = title.textContent.replace(
					"Downloads for Minecraft Forge - ",
					""
				);

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			} else {
				presenceData.details = "Files, Browsing...";
				delete presenceData.state;

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			}

			break;
		}
		case "mcforge.readthedocs.io": {
			title = document.querySelector<HTMLElement>(
				"body > main > div.sidebar-sticky-wrapper-content > article > h1"
			);
			presenceData.details = "Docs, reading:";
			presenceData.state = title.textContent;

			presenceData.smallImageKey = "reading";

			presence.setActivity(presenceData);

			break;
		}
		case "forgedev.flocker.tv": {
			if (document.location.pathname.includes("/cart")) {
				presenceData.details = "Merch, viewing:";
				presenceData.state = "Shopping Cart";

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			} else if (document.location.pathname.includes("/products/")) {
				title = document.querySelector<HTMLElement>(
					"body > div:nth-child(18) > div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content > div.ant-modal-body > div.creatorhub__product-modal-content > div > div.creatorhub__product-modal-title-wrapper > h1"
				);
				presenceData.details = "Merch, viewing:";
				presenceData.state = title.textContent;

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			} else {
				presenceData.details = "Merch, Browsing...";
				delete presenceData.state;

				delete presenceData.smallImageKey;

				presence.setActivity(presenceData);
			}

			break;
		}
		default:
			presence.setActivity();
	}
});
