const presence = new Presence({
		clientId: "844109006679179265",
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

enum Assets {
	Logo = "https://i.imgur.com/KuPkyx2.png",
	Search = "https://i.imgur.com/B7FxcD4.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
			startTimestamp: browsingTimestamp,
		},
		{ href, pathname } = document.location,
		[privacy, buttons, covers] = await Promise.all([
			presence.getSetting<boolean>("privacy"),
			presence.getSetting<boolean>("buttons"),
			presence.getSetting<boolean>("covers"),
		]),
		title = document.querySelector<HTMLMetaElement>(
			'[property="og:title"]'
		)?.content,
		search = document.querySelector<HTMLInputElement>(
			'[id="global-search-input"]'
		),
		splitPathname = pathname.split("/");

	if (privacy) presenceData.details = "Browsing";
	else if (search?.value) {
		presenceData.details = "Searching for";
		presenceData.state = search?.value;
		presenceData.smallImageKey = Assets.Search;
	} else if (
		pathname === `/${document.querySelector("html").getAttribute("lang")}`
	)
		presenceData.details = "Viewing watchlist";
	else {
		switch (splitPathname[2]) {
			case "show": {
				switch (splitPathname[3]) {
					case "explore": {
						if (!document.querySelector('[id="shows-results"]')) {
							presenceData.details = "Exploring Shows";
							presenceData.buttons = [
								{
									label: "Explore Shows",
									url: href,
								},
							];
						} else {
							presenceData.details = "Viewing search results for";
							presenceData.state = document
								.querySelector('[id="shows-results"]')
								.textContent.split('"')[1];
						}
						break;
					}
					case "browse": {
						const hrefSplit = href
							.split("?")[1]
							.replace("filter=", "")
							.replace(/_/gm, " ");
						presenceData.details = "Viewing shows filtered by";
						presenceData.state = `${hrefSplit
							.at(0)
							.toUpperCase()}${hrefSplit.slice(1)}`;
						break;
					}
					default: {
						presenceData.details = "Viewing";
						presenceData.state = title;
						presenceData.largeImageKey =
							document
								.querySelector('img[src*="/poster/"]')
								?.getAttribute("src") ??
							document
								.querySelector('[property="og:image"]')
								?.getAttribute("content") ??
							Assets.Logo;
						if (title.match(/S[0-9]*E[0-9]/gm)) {
							presenceData.buttons = [
								{
									label: "View Episode",
									url: href,
								},
							];
						} else {
							presenceData.buttons = [
								{
									label: "View Show",
									url: href,
								},
							];
						}
						break;
					}
				}
				break;
			}
			case "actor": {
				presenceData.details = "Viewing";
				presenceData.state = title;
				presenceData.largeImageKey =
					document
						.querySelector('[property="og:image"]')
						?.getAttribute("content") ?? Assets.Logo;
				presenceData.buttons = [
					{
						label: "View Actor",
						url: href,
					},
				];
				break;
			}
			case "upcoming": {
				presenceData.details = "Viewing upcoming shows";
				presenceData.buttons = [
					{
						label: "View Upcoming Shows",
						url: href,
					},
				];
				break;
			}
			case "explore": {
				if (!document.querySelector('[id="shows-results"]')) {
					presenceData.details = "Exploring Shows";
					presenceData.buttons = [
						{
							label: "Explore Shows",
							url: href,
						},
					];
				} else {
					presenceData.details = "Viewing search results for";
					presenceData.state = document
						.querySelector('[id="shows-results"]')
						.textContent.split('"')[1];
				}
				break;
			}
			case "user": {
				switch (splitPathname[4]) {
					case "profile": {
						presenceData.details = `Viewing ${title}'s ${
							document
								.querySelector('[class="profile-nav"]')
								.querySelector('[class*="active"]')?.textContent ?? "Profile"
						}`;
						presenceData.largeImageKey =
							document
								.querySelector('[class="avatar"]')
								?.firstElementChild?.firstElementChild?.getAttribute("src") ??
							document
								.querySelector('[class="avatar"]')
								?.firstElementChild?.getAttribute("src");
						break;
					}
					case "calendar": {
						presenceData.details = "Viewing Calendar for";
						presenceData.state = `${
							document.querySelector('[class="month-label"]').textContent
						} ${
							document.querySelector('[class="day-number"]').textContent
						} (${document
							.querySelector('[class="relative-date"]')
							.textContent.trim()})`;
						presenceData.buttons = [
							{
								label: "View Calendar",
								url: href,
							},
						];
						break;
					}
					case "account": {
						presenceData.details = `Managing ${
							document.querySelector('[class*="active"]').textContent
						} account settings`;
						break;
					}
				}
				break;
			}
		}
	}
	if (!covers) presenceData.largeImageKey = Assets.Logo;
	if (!buttons) delete presenceData.buttons;
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
