const presence = new Presence({
		clientId: "1221562084253499452",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

const enum Assets {
	Logo = "https://i.imgur.com/QyfS9WR.png",
}

const staticPages: Record<string, PresenceData> = {
	"/": {
		details: "Viewing the homepage",
	},
	"/purchase.htm": {
		details: "Viewing the purchase page",
	}
};

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
			startTimestamp: browsingTimestamp,
		},
		{ pathname } = document.location,
		pathList = pathname.split("/").filter(Boolean),
		pageTitle = document.querySelector("h3");

	if (staticPages[pathname]) {
		Object.assign(presenceData, staticPages[pathname]);
	} else if (pathname.startsWith("/intro")) {
		presenceData.details = "Reading the introduction";
		presenceData.state = pageTitle;
	} else if (pathname.startsWith("/features")) {
		presenceData.details = "Viewing the features";
		presenceData.state = pageTitle;
	} else if (pathname.startsWith("/gallery")) {
		presenceData.details = "Viewing the gallery";
		presenceData.state = pageTitle;
	} else if (pathname.startsWith("/downloads")) {
		presenceData.details = "Viewing the downloads";
		presenceData.state = pageTitle;
	} else if (pathname.startsWith("/support")) {
		presenceData.details = "Viewing support resources";
		presenceData.state = pageTitle;
	} else if (pathList[0] === "ppc") {

	} else {
		presenceData.details = "Viewing a page";
		presenceData.state = pageTitle;
	}

	presence.setActivity(presenceData);
});
