const presence = new Presence({
		clientId: "712269360206708766",
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
		largeImageKey: "https://i.imgur.com/8E6QIMT.png",
		startTimestamp: browsingTimestamp,
	};

	if (document.location.pathname.includes("/lounge")) {
		presenceData.details = "Searching for a room";
		presenceData.state = `Username: ${
			document.querySelector(".name").textContent
		}`;
		presenceData.smallImageKey = Assets.Search;
	} else if (document.location.pathname.includes("/create_room"))
		presenceData.details = "Creating a room";
	else if (document.location.pathname.includes("/room/")) {
		presenceData.details = `In a room: ${
			document.querySelector(".room-title-name").textContent
		}`;
		presenceData.state = `Members: ${
			document.querySelector(".room-title-capacity").textContent
		}`;
		presenceData.smallImageKey = "chat";
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
