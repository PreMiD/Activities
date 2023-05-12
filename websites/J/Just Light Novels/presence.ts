const presence = new Presence({
	clientId: "631595418085490689",
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

function capitalize(string: string): string {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

const elapsed = Math.floor(Date.now() / 1000);
let stext;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/O2Xalve.png",
	};

	presenceData.startTimestamp = elapsed;

	if (document.location.pathname === "/") {
		presenceData.details = "Browsing novels";
		presenceData.state = "at Homepage";
	} else if (document.location.pathname === "//") {
		stext = document.location.search.split("=");
		presenceData.details = "Searching novels";
		presenceData.state = `Keyword: ${capitalize(
			stext[1].split("+").join(" ")
		)}`;
	} else if (document.location.pathname.startsWith("/category/")) {
		stext = document.location.pathname.split("/");
		presenceData.details = "Searching novels ";
		presenceData.state = `${capitalize(stext[1])}: ${capitalize(
			stext[2].split("-").join(" ")
		)}`;
	} else if (
		["/reviews/", "/ln-fest-series/"].includes(document.location.pathname)
	) {
		presenceData.details = "Browsing site";
		presenceData.state = `looking at ${capitalize(
			document.location.pathname.split("/").join("").split("-").join(" ")
		)}`;
	} else {
		const d = document.location.pathname.split("/");
		if (d.length === 5) {
			presenceData.details = `Reading ${capitalize(
				d[3].split("-").join(" ")
			)}(${d[1]})`;
			presenceData.state = `Looking at ${
				document.location.hash.length === 0
					? "Novel"
					: capitalize(document.location.hash.replace("#", ""))
			}`;
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
