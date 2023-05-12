const presence = new Presence({
		clientId: "843711390539841577",
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

presence.on("UpdateData", async () => {
	let presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/6Nl9N2E.jpeg",
		details: "Viewing 📰 page:",
		state: "🛑 Unsupported",
	};
	const { pathname, href, host } = document.location,
		[showTimestamp, showButtons] = await Promise.all([
			presence.getSetting<boolean>("timestamp"),
			presence.getSetting<boolean>("buttons"),
		]),
		pages: Record<string, PresenceData> = {
			"/about": {
				details: "📚 About",
				buttons: [{ label: "View Page", url: href }],
			},
			"/premium": {
				details: "💎 Premium",
				buttons: [{ label: "View Page", url: href }],
			},
		};

	for (const [path, data] of Object.entries(pages))
		if (pathname.includes(path)) presenceData = { ...presenceData, ...data };

	if (host === "dsc.gg") {
		if (pathname === "/") {
			presenceData.state = "🏡 Home";
			if (
				document.querySelector("h1.text-5xl")?.textContent === "Search Results"
			) {
				presenceData.details = `🔎 Searching for: ${document
					.querySelector("input.py-4")
					?.getAttribute("searching")}`;
				presenceData.state = `${
					document.querySelector("h2.text-lg")?.textContent
				}`;
				presenceData.smallImageKey = Assets.Search;
			}
		} else {
			switch (pathname) {
				case "/dashboard": {
					presenceData.details = "Viewing ⚙️ dashboard";
					presenceData.state = "🔗 Links";
					if (
						document.querySelector("h1.text-2xl")?.textContent ===
						"Create a new link"
					) {
						presenceData.details = "New link creation";
						presenceData.state = `${
							document.querySelector("input.p-2")?.getAttribute("value") ||
							"Loading..."
						}`;
					}
					break;
				}
				default:
					if (pathname.includes("/dashboard/l/")) {
						const [, link] = pathname.split("/dashboard/l/");
						presenceData.details = `Editing 🔗 ${link.split("/")[0]} link`;
						presenceData.state = `🏓 Tab: ${link.split("/")[1]}`;
						presenceData.buttons = [
							{
								label: "Visit Link",
								url: `https://dsc.gg/${link.split("/")[0]}`,
							},
						];
					}
			}
		}
	} else if (host === "docs.dsc.gg") {
		switch (pathname) {
			case "/": {
				presenceData.details = "Viewing 📑 Documentation";
				presenceData.state = `🌐 Content: ${
					location.href.includes("#")
						? location.href.replace("https://docs.dsc.gg/#", " ")
						: "📧 Introduction"
				}`;

				break;
			}
			case "/endpoints": {
				presenceData.details = "Viewing 🔗 endpoints";
				presenceData.state = `🌐 Content: ${
					location.href.includes("#")
						? location.href.replace("https://docs.dsc.gg/endpoints#", " ")
						: "None"
				}`;

				break;
			}
			case "/widgets": {
				presenceData.details = "Viewing 🖼️ widgets";
				presenceData.state = `🌐 Content: ${
					location.href.includes("#")
						? location.href.replace("https://docs.dsc.gg/widgets#", " ")
						: "None"
				}`;

				break;
			}
		}
	}

	if (!showButtons) delete presenceData.buttons;
	if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
