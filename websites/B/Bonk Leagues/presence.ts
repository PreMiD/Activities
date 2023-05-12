const presence = new Presence({
	clientId: "779118675491815434",
});

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
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/NSmuGT9.png",
	};

	if (document.location.pathname.startsWith("/skins.html")) {
		presenceData.details = "in Skin Manager";
		if (
			document.querySelector(
				'#smpskinscat[style*="block"],#smpskins[style*="block"]'
			)
		) {
			const skinCategory = document.querySelector(
				'#smpskins[style*="block"] #smpcatid'
			);
			presenceData.state = skinCategory
				? `Adding a ${skinCategory.textContent} skin`
				: "Adding a skin";
		} else if (document.querySelector('#addskinslot[style*="block"]'))
			presenceData.state = "Adding a bonk2.io skin";
	} else if (document.location.pathname.startsWith("/editor.html"))
		presenceData.details = "in Skin Editor";
	else if (document.location.pathname.startsWith("/xpchecker.html"))
		presenceData.details = "in Player XP Checker";
	else if (document.location.pathname.startsWith("/mapchecker.html"))
		presenceData.details = "in Quick Play Map Checker";
	else if (document.location.pathname.startsWith("/serverstatus.html"))
		presenceData.details = "Viewing Server Status";

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
