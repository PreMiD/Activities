const presence = new Presence({
		clientId: "1027249400738750625",
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
			largeImageKey: "https://i.imgur.com/Zzh3YNq.png",
			startTimestamp: browsingTimestamp,
		},
		{ pathname, hostname, href } = window.location,
		pathSplit = pathname.split("/").filter(x => x),
		locationName = document.querySelector<HTMLSpanElement>(
			"[class*='--locationName--']"
		)?.textContent,
		pageTitle = document.querySelector("h1")?.textContent;

	function setNewsPresenceData(subPath: string[], type: string) {
		if ((subPath ?? "") === "")
			presenceData.details = `Browsing ${type} stories`;
		else if (subPath.includes("video")) {
			presenceData.details = `Watching a ${type} video`;
			presenceData.state = pageTitle;
			presenceData.buttons = [{ label: "Watch Video", url: href }];
		} else if (subPath.includes("news")) {
			presenceData.details = `Reading a ${type} article`;
			presenceData.state = pageTitle;
			presenceData.buttons = [{ label: "Read Article", url: href }];
		}
	}

	if (hostname === "weather.com") {
		switch (pathSplit[0] ?? "") {
			case "": {
				presenceData.details = "Browsing homepage";
				break;
			}
			case "deals": {
				setNewsPresenceData(pathSplit, "deal");
				break;
			}
			case "forecast": {
				switch (pathSplit[1]) {
					case "air-quality": {
						presenceData.details = "Viewing air quality forecast";
						presenceData.state = locationName;
						break;
					}
					case "allergy": {
						presenceData.details = "Viewing allergy forecast";
						presenceData.state = `${
							document.querySelector("h2").textContent
						} for ${locationName}`;
						break;
					}
					case "cold-flu": {
						presenceData.details = "Viewing cold & flu forecasts";
						break;
					}
					default: {
						setNewsPresenceData(pathSplit.slice(1), "forecast");
					}
				}
				break;
			}
			case "health": {
				if (pathSplit[1] === "cold-flu")
					setNewsPresenceData(pathSplit.slice(2), "cold & flu");
				else setNewsPresenceData(pathSplit.slice(1), "health");
				break;
			}
			case "slideshows":
			case "photos": {
				setNewsPresenceData(pathSplit.slice(1), "photo");
				if (pathSplit[1] === "news") {
					presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
						"[id*='int-image'] img"
					).src;
				}
				break;
			}
			case "promos": {
				setNewsPresenceData(pathSplit.slice(1), "promo");
				break;
			}
			case "login":
			case "signup": {
				presenceData.details = "Logging in";
				break;
			}
			case "maps": {
				presenceData.details = "Viewing a map";
				presenceData.state = pageTitle;
				presenceData.buttons = [{ label: "View Map", url: href }];
				break;
			}
			case "member": {
				presenceData.details = "Managing account";
				break;
			}
			case "news": {
				setNewsPresenceData(pathSplit.slice(1), "news");
				break;
			}
			case "safety": {
				setNewsPresenceData(pathSplit.slice(1), "safety");
				break;
			}
			case "science": {
				setNewsPresenceData(pathSplit.slice(1), "science");
				break;
			}
			case "sports-recreation": {
				if (pathSplit[1] === "fishing")
					setNewsPresenceData(pathSplit.slice(2), "fishing");
				else setNewsPresenceData(pathSplit.slice(1), "sports & recreation");
				break;
			}
			case "storms": {
				switch (pathSplit[1]) {
					case "tornado": {
						setNewsPresenceData(pathSplit.slice(2), "tornado");
						break;
					}
					case "hurricane": {
						setNewsPresenceData(pathSplit.slice(2), "hurricane");
						break;
					}
				}
				break;
			}
			case "subscribe": {
				presenceData.details = "Subscribing";
				break;
			}
			case "travel": {
				setNewsPresenceData(pathSplit.slice(1), "travel");
				break;
			}
			case "weather": {
				switch (pathSplit[1]) {
					case "today": {
						presenceData.details = "Browsing today's weather forecast";
						presenceData.state = locationName;
						break;
					}
					case "hourbyhour": {
						presenceData.details = "Browsing hourly weather forecast";
						presenceData.state = locationName;
						break;
					}
					case "tenday": {
						presenceData.details = "Browsing 10-day weather forecast";
						presenceData.state = locationName;
						break;
					}
					case "weekend": {
						presenceData.details = "Browsing weekend weather forecast";
						presenceData.state = locationName;
						break;
					}
					case "monthly": {
						presenceData.details = "Browsing monthly weather forecast";
						presenceData.state = locationName;
						break;
					}
					case "radar": {
						presenceData.details = "Viewing weather radar";
						presenceData.state = locationName;
						break;
					}
				}
				break;
			}
			default: {
				presenceData.details = "Browsing";
				presenceData.state = document.title.match(
					/^(.*?)( \| The Weather Channel)?$/
				)[1];
				break;
			}
		}
	} else if (hostname === "features.weather.com") {
		if (pathSplit[0] === "") {
			presenceData.details = "Browsing";
			presenceData.state = "All features and stories";
		} else if (pathSplit[0] === "category") {
			presenceData.details = "Browsing category";
			presenceData.state = pageTitle.match(/: (.*)$/)[1];
		} else {
			presenceData.details = "Reading an article";
			presenceData.state = pageTitle;
			presenceData.buttons = [{ label: "Read Article", url: href }];
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
