const presence = new Presence({
		clientId: "1073167802296438875",
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
			largeImageKey: "https://i.imgur.com/U0FQhL3.png",
			startTimestamp: browsingTimestamp,
		},
		{ pathname, href, search } = document.location;

	switch (pathname.split("/")[1]) {
		case "search": {
			presenceData.details = "Searching something to buy";
			presenceData.state = new URLSearchParams(search).get("q");
			break;
		}
		case "categories": {
			presenceData.details = "Browsing a category";
			presenceData.state =
				document.querySelector<HTMLHeadingElement>("title").textContent;
			presenceData.buttons = [
				{
					label: "View Category",
					url: href,
				},
			];
			break;
		}
		case "offer": {
			presenceData.details = "Viewing an offer";
			presenceData.state =
				document.querySelector<HTMLHeadingElement>("title").textContent;
			presenceData.buttons = [
				{
					label: "View Offer",
					url: href,
				},
			];
			break;
		}
		case "seller": {
			presenceData.details = "Selling something";
			break;
		}
		case "chat": {
			presenceData.details = "Chatting with a sellet";
			break;
		}
		case "account": {
			presenceData.details = "Viewing their account";
			break;
		}
		case "trending": {
			presenceData.details = "Viewing a trending offer";
			presenceData.state =
				document.querySelector<HTMLDivElement>("div.text-h4").textContent;
			presenceData.buttons = [
				{
					label: "View Trending",
					url: href,
				},
			];
			break;
		}
		case "secure": {
			presenceData.details = `Buying ${
				document.querySelector<HTMLDivElement>("div.col-8.row").textContent
			}`;
			break;
		}
		default: {
			const elem = pathname.split("/")[1];
			if (elem === "") {
				presenceData.details = "Viewing the homepage";
				presenceData.state = "Browsing...";
			} else {
				presenceData.details = `Viewing ${elem}'s profile`;
				presenceData.buttons = [
					{
						label: "View Profile",
						url: href,
					},
				];
			}
			break;
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
