const presence = new Presence({
		clientId: "966334543789424781",
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
			largeImageKey: "https://i.imgur.com/NHoj4QX.png",
			startTimestamp: browsingTimestamp,
		},
		path = document.location.pathname.toLowerCase();
	if (path === "/" || path === "/online")
		presenceData.details = "Przegląda stronę główną...";
	else if (path.includes("/movies")) {
		presenceData.details = "Ogląda film:";
		presenceData.state = document.title.split(" ").slice(0, -9).join(" ");
	} else if (path.includes("/serial-online/") && path.split("/").length === 5) {
		presenceData.details = "Ogląda serial:";
		presenceData.state = `${document.title.split(" ").slice(0, -9).join(" ")}`;
	} else if (path.includes("/serial-online")) {
		presenceData.details = "Sprawdza serial:";
		presenceData.state = document.title.split(" ").slice(0, -9).join(" ");
	} else if (path.includes("/filmy-online-pl"))
		presenceData.details = "Przegląda listę filmów";
	else if (path.includes("/seriale-online-pl"))
		presenceData.details = "Przegląda listę seriali";
	else if (path.includes("/dla-dzieci-pl"))
		presenceData.details = 'Przegląda "Dla dzieci"';
	else if (path.includes("/popularne"))
		presenceData.details = "Przegląda popularne filmy i seriale";
	else if (path.includes("/tag")) {
		presenceData.details = "Przegląda tag:";
		presenceData.state = path.split("/")[2];
	} else if (path.includes("/wyszukiwarka")) {
		presenceData.details = "Szuka:";
		presenceData.state = document.title.split(" ").slice(4, -9).join(" ");
	} else if (path.includes("/regulamin"))
		presenceData.details = "Czyta regulamin";
	else if (path.includes("/pomoc")) presenceData.details = "Czyta FAQ";
	else if (path.includes("/poszukiwane"))
		presenceData.details = "Przegląda poszukiwane filmy i seriale...";

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
