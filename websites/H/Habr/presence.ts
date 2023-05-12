const presence = new Presence({
		clientId: "1064607977996296262",
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
	Call = "https://i.imgur.com/PFdbnIf.png",
	Vcall = "https://i.imgur.com/6wG9ZvM.png",
	Downloading = "https://i.imgur.com/ryrDrz4.png",
	Uploading = "https://i.imgur.com/SwNDR5U.png",
	Repeat = "https://i.imgur.com/Ikh95KU.png",
	RepeatOne = "https://i.imgur.com/wh885z3.png",
	Premiere = "https://i.imgur.com/Zf8FSUR.png",
	PremiereLive = "https://i.imgur.com/yC4j9Lg.png",
	Viewing = "https://i.imgur.com/fpZutq6.png",
}

async function getStrings() {
	return presence.getStrings(
		{
			buttonViewPage: "general.buttonViewPage",
			chapter: "general.chapter",
			reading: "general.reading",
			readingPost: "general.readingPost",
			search: "general.search",
			searchFor: "general.searchFor",
			searchSomething: "general.searchSomething",
			viewHome: "general.viewHome",
			viewing: "general.viewing",
			viewPage: "general.viewPage",
		},
		await presence.getSetting<string>("lang").catch(() => "ru")
	);
}

let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null;

enum Assets {
	Logo = "https://i.imgur.com/DrxgYIA.png",
	Search = "https://i.imgur.com/B7FxcD4.png",
	Reading = "https://i.imgur.com/5m10TTT.png",
	Viewing = "https://i.imgur.com/fpZutq6.png",
}

function textContent(tags: string) {
	return document.querySelector(tags)?.textContent?.trim();
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			details: "Где-то на сайте",
			largeImageKey: Assets.Logo,
		},
		[newLang, privacy, logo, time, buttons] = await Promise.all([
			presence.getSetting<string>("lang").catch(() => "ru"),
			presence.getSetting<boolean>("privacy"),
			presence.getSetting<boolean>("logo"),
			presence.getSetting<boolean>("time"),
			presence.getSetting<boolean>("buttons"),
		]),
		{ pathname, href } = document.location,
		path = pathname.split("/");

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}

	switch (path[2]) {
		case "all":
		case "flows":
		case "news":
		case "hubs":
		case "companies":
		case "feed":
			presenceData.details = privacy
				? strings.viewHome
				: `${strings.viewing} ${strings.chapter.toLowerCase()} ${textContent(
						".tm-section-name__text"
				  )}`;
			presenceData.state = document.querySelector(
				".tm-tabs__tab-link_active"
			)?.firstChild?.textContent;
			presenceData.smallImageKey = Assets.Viewing;
			presenceData.smallImageText = strings.viewing;

			if (path[3] === "t") {
				presenceData.details = strings.reading;
				presenceData.state = textContent(".tm-article-snippet__title");
				presenceData.smallImageKey = Assets.Reading;
				presenceData.smallImageText = strings.reading;
				presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
					".tm-entity-image__pic"
				)?.src;
				presenceData.buttons = [
					{
						label: strings.buttonViewPage,
						url: href,
					},
				];
			}
			break;

		case "users":
			presenceData.details = privacy
				? strings.viewHome
				: `${strings.viewing} ${strings.chapter.toLowerCase()} ${textContent(
						".tm-section-name__text"
				  )}`;
			presenceData.state = document.querySelector(
				".tm-tabs__tab-link_active"
			)?.firstChild?.textContent;
			presenceData.smallImageKey = Assets.Viewing;
			presenceData.smallImageText = strings.viewing;

			if (path[3]) {
				presenceData.details = `${strings.viewPage} ${
					!privacy ? textContent(".tm-user-card__title a") : ""
				}`;
				presenceData.state = document.querySelector(
					".tm-tabs__tab-link_active"
				)?.firstChild?.textContent;
				presenceData.largeImageKey =
					document.querySelector<HTMLImageElement>(
						".tm-user-card__header-data .tm-entity-image__pic"
					)?.src || Assets.Logo;
				presenceData.buttons = [
					{
						label: strings.buttonViewPage,
						url: href,
					},
				];
			}
			break;

		case "auth":
			presenceData.details = `${strings.viewing} ${textContent(
				".tm-section-name__text"
			)}`;
			presenceData.state = textContent(".tm-tabs__tab-link_active");
			presenceData.smallImageKey = Assets.Viewing;
			presenceData.smallImageText = strings.viewing;
			break;

		case "hub":
			presenceData.details = `${strings.viewing} хаб`;
			presenceData.state = textContent(".tm-hub-card__name span");
			presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
				".tm-entity-image__pic"
			)?.src;
			presenceData.smallImageKey = Assets.Viewing;
			presenceData.smallImageText = strings.viewing;
			break;

		case "company":
			presenceData.details = `${strings.viewPage} ${
				!privacy ? textContent(".tm-company-card__name") : ""
			}`;
			presenceData.state = document.querySelector(
				".tm-tabs__tab-link_active"
			)?.firstChild?.textContent;
			presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
				".tm-company-card__header .tm-entity-image__pic"
			)?.src;
			presenceData.smallImageKey = Assets.Viewing;
			presenceData.smallImageText = strings.viewing;
			presenceData.buttons = [
				{
					label: strings.buttonViewPage,
					url: href,
				},
			];

			if (path[5]) {
				presenceData.details = `${strings.reading} ${
					!privacy ? textContent(".router-link-active") : ""
				}`;
				presenceData.state = document.querySelector(
					".tm-article-snippet__title"
				)?.firstChild?.textContent;
				presenceData.smallImageKey = Assets.Reading;
				presenceData.smallImageText = strings.reading;
			}
			break;

		case "post":
			presenceData.details = strings.readingPost;
			presenceData.state = textContent(".tm-article-snippet__title");
			presenceData.smallImageKey = Assets.Reading;
			presenceData.smallImageText = strings.reading;
			presenceData.buttons = [
				{
					label: strings.buttonViewPage,
					url: href,
				},
			];
			break;

		case "search":
			presenceData.details = privacy
				? strings.searchSomething
				: strings.searchFor;
			presenceData.state =
				document.querySelector<HTMLInputElement>("input")?.value;
			presenceData.smallImageKey = Assets.Search;
			presenceData.smallImageText = strings.search;
			break;
	}

	if (!logo || privacy) presenceData.largeImageKey = Assets.Logo;
	if (!buttons || privacy) delete presenceData.buttons;
	if (time) presenceData.startTimestamp = browsingTimestamp;
	if (privacy) delete presenceData.state;
	presence.setActivity(presenceData);
});
