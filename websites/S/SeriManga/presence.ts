const presence = new Presence({
		clientId: "836589763896541195",
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
			largeImageKey: "https://i.imgur.com/vWBdu2A.png",
			startTimestamp: browsingTimestamp,
		},
		{ pathname, search } = document.location;

	if (pathname === "/") presenceData.details = "Ana Sayfa";
	else if (pathname === "/fansublar")
		presenceData.details = "Çeviri Gruplarına Bakıyor";
	else if (pathname.startsWith("/fansub")) {
		presenceData.details = "Çeviri Grubu Görüntüleniyor:";
		presenceData.state = document.querySelector(
			".d-table > .d-cell > h1"
		).textContent;
	} else if (pathname === "/sikca-sorulan-sorular")
		presenceData.details = "Çeviri Sıkça Sorulan Sorular";
	else if (
		pathname.startsWith("/manga/") &&
		window.location.search.substr(0, 5) === "?page"
	) {
		presenceData.details = document.querySelector(".back").textContent;
		presenceData.state = `📖 Bölüm ${pathname.substring(
			pathname.lastIndexOf("/") + 1
		)} 📄 ${document
			.querySelector("#pageSelect > option:checked")
			.textContent.replace("\n", "")
			.replace("SAYFA", "")}`;
		presenceData.smallImageKey = Assets.Reading;
		presenceData.buttons = [
			{ label: "Sayfaya Git", url: window.location.href },
		];
	} else if (pathname.startsWith("/manga/")) {
		presenceData.buttons = [
			{ label: "Sayfaya Git", url: window.location.href },
		];
		presenceData.details = "Çeviri mangaya:";
		presenceData.state = document.querySelector(".name").textContent;
		presenceData.smallImageKey = "view";
	} else if (pathname === "/mangalar" && search?.substr(0, 7) === "?search") {
		presenceData.details = "Arıyor:";
		presenceData.state = new URLSearchParams(search).get("search");
		presenceData.smallImageKey = Assets.Search;
	} else if (pathname === "/mangalar")
		presenceData.details = "Mangaya Göz Atıyor";
	else if (pathname.startsWith("/kategori")) {
		presenceData.details = "Mangaya Göz Atıyor";
		presenceData.state = `Tür: ${
			document.querySelector(".page__title").textContent
		}`;
	}
	presence.setActivity(presenceData);
});
