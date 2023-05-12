const presence = new Presence({
		clientId: "843731213893107713",
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

presence.on("UpdateData", async function () {
	const setting = {
			timeElapsed: await presence.getSetting<boolean>("timeElapsed"),
			showButtons: await presence.getSetting<boolean>("showButtons"),
		},
		urlpath = window.location.pathname.split("/"),
		presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/vvHuXVu.jpg",
		};

	if (setting.timeElapsed) presenceData.startTimestamp = browsingTimestamp;

	if (document.location.host === "www.wizardingworld.com") {
		if (!urlpath[1]) presenceData.details = "Home";
		else {
			switch (urlpath[1]) {
				case "news":
				case "features": {
					presenceData.details = urlpath[1] === "news" ? "News" : "Features";

					if (urlpath[2]) {
						presenceData.state =
							document.querySelector("h1.ArticleHero_title__cOam6")
								?.textContent || "Unknown";

						if (setting.showButtons) {
							presenceData.buttons = [
								{
									label: "View Article",
									url: window.location.href,
								},
							];
						}
					}

					break;
				}
				case "quiz": {
					presenceData.details = "Quiz";

					if (urlpath[2]) {
						presenceData.state =
							document.querySelector("h1.ArticleHero_title__cOam6")
								?.textContent || "Unknown";

						if (setting.showButtons) {
							presenceData.buttons = [
								{
									label: "View Quiz",
									url: window.location.href,
								},
							];
						}
					}

					break;
				}
				case "writing-by-jk-rowling": {
					presenceData.details = "J.K. Rowling Originals";

					if (urlpath[2]) {
						const post = document.querySelector("h1.ArticleHero_title__cOam6"),
							label =
								post?.textContent.length >= 15
									? `${post?.textContent.substring(0, 15)}...`
									: post?.textContent;

						presenceData.state = post?.textContent || "Unknown";

						if (setting.showButtons && post) {
							presenceData.buttons = [
								{
									label: `View: ${label}`,
									url: window.location.href,
								},
							];
						}
					}

					break;
				}
				case "discover": {
					presenceData.details = "Discover";

					if (
						urlpath[2] === "books" ||
						urlpath[2] === "films" ||
						urlpath[2] === "portkey-games" ||
						urlpath[2] === "on-stage" ||
						urlpath[2] === "experiences"
					) {
						if (urlpath[3]) {
							let ctopic = "Loading...";

							presenceData.state =
								document.querySelector("h1.Header_productName__8oV2G")
									?.textContent || "Unknown";

							switch (urlpath[2]) {
								case "books": {
									ctopic = "Book";
									break;
								}
								case "films": {
									ctopic = "Film";
									break;
								}
								case "portkey-games": {
									ctopic = "Game";
									break;
								}
								case "experiences":
									{
										ctopic = "Experience";
										// No default
									}
									break;
							}

							if (setting.showButtons && urlpath[2] !== "on-stage") {
								presenceData.buttons = [
									{
										label: `View ${ctopic}`,
										url: window.location.href,
									},
								];
							}
						} else {
							presenceData.state =
								document.querySelector("h1.DiscoverListHeader_header__3ivqr")
									?.textContent || "Unknown";
						}
					}

					break;
				}
				case "collections": {
					presenceData.details = "Collections";

					if (urlpath[2]) {
						presenceData.state =
							document.querySelector("h1.CollectionHero_header__3rDGu")
								?.textContent || "Unknown";

						if (setting.showButtons) {
							presenceData.buttons = [
								{
									label: "View Collection",
									url: window.location.href,
								},
							];
						}
					}

					break;
				}
				case "harry-potter-fan-club": {
					presenceData.details = "Fan Club";
					break;
				}
				default:
					presenceData.details = "Other";
			}
		}
	} else if (document.location.host === "my.wizardingworld.com") {
		if (urlpath[1] === "passport") presenceData.details = "Passport";

		if (document.querySelector("span.HogwartsHouse_houseName__CykI1")) {
			presenceData.smallImageKey = document
				.querySelector("span.HogwartsHouse_houseName__CykI1")
				?.textContent.toLocaleLowerCase();
			presenceData.smallImageText = document.querySelector(
				"span.HogwartsHouse_houseName__CykI1"
			)?.textContent;
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
