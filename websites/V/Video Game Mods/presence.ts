const presence = new Presence({
		clientId: "1079522783974920212",
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

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			details: "Other",
			largeImageKey: "https://i.imgur.com/zvX0TaN.png",
			startTimestamp: browsingTimestamp,
			buttons: [
				{
					label: "View Page",
					url: document.location.href,
				},
			],
		},
		urlpath = document.location.pathname.split("/");

	switch (true) {
		case !urlpath[1]:
			presenceData.details = "Home";
			break;
		case urlpath[1].startsWith("members"):
			presenceData.details = `In ${
				document.querySelector('[class="data"]')?.textContent
			}`;
			presenceData.state = urlpath[2];
			break;
		case urlpath[1].startsWith("forums"):
			if (urlpath[2]) {
				if (urlpath[2].startsWith("search")) {
					presenceData.details = "Searching for:";
					presenceData.state = decodeURI(urlpath[3]).replace("+", " ");
					break;
				} else {
					presenceData.details = `In a discussion of ${
						document.querySelector<HTMLHeadingElement>("a.bbp-breadcrumb-forum")
							?.textContent
					}:`;
					presenceData.state =
						document.querySelector<HTMLHeadingElement>(
							"h1.entry-title"
						)?.textContent;
					break;
				}
			}
			if (urlpath[3]) {
				presenceData.details = "In forum:";
				presenceData.state = urlpath[4]
					? `${
							document.querySelector<HTMLHeadingElement>(
								"a.bbp-breadcrumb-forum"
							)?.textContent
					  } - ${
							document.querySelector<HTMLHeadingElement>("h1.entry-title")
								?.textContent
					  }`
					: document.querySelector<HTMLHeadingElement>("h1.entry-title")
							?.textContent;
				break;
			}
			presenceData.details = "In Forums";
			break;
		default:
			if (urlpath[1] && !urlpath[2]) {
				switch (urlpath[1]) {
					case "register":
						presenceData.details = "Register a new account";
						break;
					case "wp-login.php":
						presenceData.details = "Login";
						break;
					case "privacy-policy":
						presenceData.details = "Privacy Policy";
						break;
					default:
						presenceData.details = "Viewing Page of";
						presenceData.state =
							document.querySelector<HTMLHeadingElement>("h1")?.textContent;
						break;
				}
			}
			if (urlpath[1] && urlpath[2]) {
				switch (urlpath[2]) {
					case "mods": {
						if (urlpath[3] !== "categories") {
							presenceData.details = `Viewing mod of ${
								document.querySelector<HTMLHeadingElement>("h1")?.textContent
							}`;
							presenceData.state = document.querySelector<HTMLHeadingElement>(
								"div.site-content h1"
							)?.textContent;
							presenceData.largeImageKey = document
								.querySelector<HTMLImageElement>("div.modsmedia img")
								?.getAttribute("src");
							break;
						} else {
							presenceData.details = "Viewing mods of";
							presenceData.state =
								document.querySelector<HTMLHeadingElement>("h1")?.textContent;
							break;
						}
					}
					case "upload-mod":
						presenceData.details = "Uploading mod of";
						presenceData.state =
							document.querySelector<HTMLHeadingElement>("h1")?.textContent;
						break;
					case "manage-mods":
						presenceData.details = "Managing mods of";
						presenceData.state =
							document.querySelector<HTMLHeadingElement>("h1")?.textContent;
						break;
					case "modder":
						presenceData.details = `Viewing ${
							document.querySelector<HTMLHeadingElement>("h1")?.textContent
						} mods by Modder`;
						presenceData.state = document.querySelector<HTMLHeadingElement>(
							"div.modderprofilebox h2"
						)?.textContent;
						break;
					case "category":
						switch (urlpath[3]) {
							case "guides":
								presenceData.details = "Viewing Guides of";
								presenceData.state =
									document.querySelector<HTMLHeadingElement>("h1")?.textContent;
								break;
							case "updates":
								presenceData.details = "Viewing Updates of";
								presenceData.state =
									document.querySelector<HTMLHeadingElement>("h1")?.textContent;
								break;
						}
						break;
					default:
						presenceData.details = `Viewing ${
							document.querySelector<HTMLHeadingElement>("h1")?.textContent
						}`;
						presenceData.largeImageKey =
							document
								.querySelector<HTMLImageElement>("div.post-thumbnail img")
								?.getAttribute("src") ?? "https://i.imgur.com/zvX0TaN.png";
						presenceData.state =
							document.querySelector<HTMLHeadingElement>(
								"h1.entry-title"
							)?.textContent;
				}
				break;
			}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
