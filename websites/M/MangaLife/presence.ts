const presence = new Presence({ clientId: "906057236927893576" }),
	browsingStamp = Math.floor(Date.now() / 1000);

	const enum Assets {
		Logo =
		"https://cdn.rcd.gg/PreMiD/websites/M/MangaLife/assets/logo.png",
		LogoPng = "https://cdn.discordapp.com/app-assets/906057236927893576/923858941421682698.png?size=512",
		Subscriptions = "https://cdn.discordapp.com/app-assets/906057236927893576/927164464074223676.png?size=512",
		Discussions = "https://cdn.discordapp.com/app-assets/906057236927893576/927165805198737470.png?size=512",
		Contact = "https://cdn.discordapp.com/app-assets/906057236927893576/927166569887461376.png?size=512",
		Privacy = "https://cdn.discordapp.com/app-assets/906057236927893576/927167543930671105.png?size=512",
		Hot = "https://cdn.discordapp.com/app-assets/906057236927893576/927187328043221024.png?size=512",
		Bookmark = "https://cdn.discordapp.com/app-assets/906057236927893576/927194790536282132.png?size=512",
		Home = "https://cdn.discordapp.com/app-assets/906057236927893576/930123335071850506.png?size=512",
		Settings = "https://cdn.discordapp.com/app-assets/906057236927893576/932989087936286730.png?size=512",
	}

presence.on("UpdateData", async () => {
	const [privacy, cover, timestamps, buttons] = await Promise.all([
			presence.getSetting<boolean>("privacy"),
			presence.getSetting<boolean>("cover"),
			presence.getSetting<boolean>("timestamps"),
			presence.getSetting<boolean>("buttons"),
		]),
		path = document.location.pathname,
		pages: Record<string, PresenceData> = {
			"/manga/": {
				details: "Viewing a Manga...",
				state: document.title.split(" | MangaLife")[0],
			},
			"/read-online/": {
				smallImageKey: Assets.Reading,
			},
			"/search": {
				smallImageKey: Assets.Search,
				details: "Searching...",
			},
			"/discussion": {
				smallImageKey: !privacy ? Assets.Discussions : "",
				state: "Discussions",
			},
			"hot.php": {
				smallImageKey: !privacy ? Assets.Hot : "",
				state: "Hot Manga Updates",
				buttons: [{ label: "Hot Manga Updates", url: `${document.location}` }],
			},
			"subscription.php": {
				smallImageKey: !privacy ? Assets.Subscriptions : "",
				state: "Subscriptions",
			},
			"feed.php": {
				smallImageKey: !privacy ? Assets.Subscriptions : "",
				state: "Subscriptions Feed",
			},
			"bookmark.php": {
				smallImageKey: !privacy ? Assets.Bookmark : "",
				state: "Bookmarks",
			},
			"settings.php": {
				smallImageKey: Assets.Settings,
				details: "Editing...",
				state: "User Settings",
			},
			"/contact": {
				smallImageKey: !privacy ? Assets.Contact: "",
				state: "Contact Page",
			},
			"/privacy": {
				smallImageKey: !privacy ? Assets.Privacy : "",
				state: "Privacy Policy Page",
			},
		};
	let presenceData: PresenceData = {
		largeImageKey: Assets.Logo,
		smallImageKey: !privacy ? Assets.Home  : "",
		details: "Browsing...",
		state: "Home Page",
		startTimestamp: browsingStamp,
	};

	for (const [path, data] of Object.entries(pages)) {
		if (
			document.location.pathname.startsWith(path) ||
			document.location.pathname.includes(path)
		)
			presenceData = { ...presenceData, ...data };
	}

	switch (true) {
		case path.startsWith("/manga/"):
			presenceData.largeImageKey =
				!privacy && cover
					? `https://cover.nep.li/cover/${path.split("/manga/")[1]}.jpg`
					: Assets.Logo
			presenceData.smallImageKey = !privacy && cover ? Assets.LogoPng:Assets.Search
			presenceData.buttons = [
				{
					label:
						(presenceData.state as string).length >= 30
							? "View Manga"
							: presenceData.state,
					url: `${document.location}`,
				},
			];
			break;
		case path.startsWith("/read-online/"):
			presenceData.largeImageKey =
				!privacy && cover
					? `https://cover.nep.li/cover/${
							path.split("/read-online/")[1].split("-chapter-")[0]
					  }.jpg`
					: Assets.Logo
			presenceData.details = !privacy
				? document.querySelector(".col-12 > a").textContent.trim()
				: "Reading a Manga...";
			presenceData.state = path.includes("-page-")
				? `Chapter ${path.split("-chapter-")[1].split("-page-")[0]} | Page ${
						path.split("-page-")[1].split(".html")[0]
				  }`
				: `Chapter ${path.split("-chapter-")[1].split(".html")[0]}`;
			presenceData.buttons = [
				{
					label:
						presenceData.details.length >= 30
							? "View Manga"
							: presenceData.details,
					url: `${document.location.origin}/manga/${
						path.split("/read-online/")[1].split("-chapter-")[0]
					}`,
				},
				{
					label: `${presenceData.state.replace("|", " ")}`,
					url: `${document.location}`,
				},
			];
			break;
		case path.startsWith("/search"):
			// todo show state as search query, for now just delete state
			delete presenceData.state;
			break;
	}

	if (!timestamps) delete presenceData.startTimestamp;
	if (privacy) delete presenceData.state;
	if (privacy || !buttons) delete presenceData.buttons;
	if (privacy && !presenceData.smallImageKey) delete presenceData.smallImageKey;

	presence.setActivity(presenceData);
});
