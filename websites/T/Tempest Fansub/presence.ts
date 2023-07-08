const presence = new Presence({
		clientId: "1047102386478534727",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000),
	defaultLogo =
		"https://cdn.rcd.gg/PreMiD/websites/T/Tempest%20Fansub/assets/logo.png",
	ecchilogo = "https://imgur.com/BtQLEdY.png";

presence.on("UpdateData", async () => {
	const { pathname, hostname, href } = document.location,
		presenceData: PresenceData = {
			startTimestamp: browsingTimestamp,
			largeImageKey: defaultLogo,
		},
		searchParams = new URLSearchParams(location.search);
	if (
		hostname === "tempestfansub.com" ||
		hostname === "ecchi.tempestfansub.com"
	) {
		//Manga-----------------------------------------------------------------------
		if (hostname.startsWith("ecchi")) presenceData.largeImageKey = ecchilogo;
		else presenceData.largeImageKey = defaultLogo;
		//Manga arama
		if (searchParams.get("s")) {
			if (hostname.startsWith("ecchi"))
				presenceData.details = "Bir ecchi manga arıyor.";
			else presenceData.details = "Bir manga arıyor.";
			presenceData.state = searchParams.get("s");
			//Mangalar
		} else if (pathname.endsWith("/manga/") || pathname === "/") {
			if (hostname.startsWith("ecchi"))
				presenceData.details = "Ecchi Mangalara göz atıyor.";
			else presenceData.details = "Mangalara göz atıyor.";
			//Bir Manga
		} else if (pathname.includes("/manga/")) {
			if (hostname.startsWith("ecchi"))
				presenceData.details = "Bir Ecchi mangaya bakıyor.";
			else presenceData.details = "Bir Mangaya bakıyor.";
			presenceData.state = document
				.querySelector("h1.entry-title")
				?.textContent.trim();
			presenceData.buttons = [
				{
					label: "Mangayı Aç",
					url: href,
				},
			];
			presenceData.largeImageKey = document
				.querySelector("div.thumb > img")
				.getAttribute("src");
			//Manga a-z listesi
		} else if (pathname.includes("/az-listesi/"))
			presenceData.details = "Manga A-Z Listesine bakıyor.";
		//Takvim
		else if (pathname.includes("/takvim/"))
			presenceData.details = "Takvime bakıyor.";
		//kitaplik
		else if (pathname.includes("/kitaplik/")) {
			if (hostname.startsWith("ecchi"))
				presenceData.details = "Ecchi manga kitaplığına bakıyor.";
			else presenceData.details = "Manga kitaplığına bakıyor.";
			//Manga EkipBaşvuru
		} else if (
			pathname.includes("basvuru") ||
			pathname.includes("ekip-alimlari")
		)
			presenceData.details = "Manga ekip başvurusuna bakıyor.";
		//Manga okuyor
		else if (document.querySelector("div.chapterbody")) {
			try {
				const title = document
						.querySelector("h1.entry-title")
						?.textContent.trim(),
					tsplited = title.split(" "),
					_manga = document.querySelectorAll("div.allc > a");
				for (const element of _manga) {
					if (element.getAttribute("href")) {
						presenceData.buttons = [
							{
								label: "Bölümü Aç",
								url: href,
							},
							{
								label: "Mangayı Aç",
								url: element.getAttribute("href"),
							},
						];
						break;
					}
				}
				presenceData.details = title
					.replace(tsplited[tsplited.length - 1], "")
					.replace("#", "");
				presenceData.state = `Bölüm ${tsplited[tsplited.length - 1]} Okuyor.`;
				const panels = document.querySelectorAll("div[id='readerarea'] > img");
				if (panels) presenceData.largeImageKey = panels[0].getAttribute("src");
			} catch {
				presenceData.details = "Bilinmeyen Adres.";
				presenceData.state = null;
				presenceData.buttons = null;
			}
		} else {
			presenceData.details = "Bilinmeyen Adres.";
			presenceData.state = null;
			presenceData.buttons = null;
		}
	} else if (hostname === "anime.tempestfansub.com") {
		//Anime-----------------------------------------------------------------------
		if (searchParams.get("s")) {
			presenceData.details = "Bir anime arıyor.";
			presenceData.state = searchParams.get("s");
			//Animeler
		} else if (pathname === "/" || pathname.endsWith("/anime/"))
			presenceData.details = "Animelere göz atıyor.";
		//Bir anime
		else if (!pathname.endsWith("/anime/") && pathname.includes("/anime/")) {
			presenceData.details = "Bir animeye bakıyor.";
			presenceData.state = document
				.querySelector("h1.entry-title")
				?.textContent.trim();
			const imgs = document.querySelectorAll(
				"#content > div > div > article > div:nth-child(2) > div > div.thumbook > div > img"
			);
			for (const element of imgs) {
				if (element.getAttribute("src"))
					presenceData.largeImageKey = element.getAttribute("src");
			}
			presenceData.buttons = [
				{
					label: "Animeyi Aç",
					url: href,
				},
			];
			//Anime a-z listesi
		} else if (pathname.includes("/a-z-listesi/"))
			presenceData.details = "Anime A-Z Listesine bakıyor.";
		//Anime takvim
		else if (pathname.includes("/takvim/"))
			presenceData.details = "Anime Takvimine bakıyor.";
		//Anime kitaplık
		else if (pathname.includes("/kitaplik/"))
			presenceData.details = "Anime kitaplığına bakıyor.";
		//Anime EkipBaşvuru
		else if (pathname.includes("/ekip-basvuru/"))
			presenceData.details = "Anime ekip başvurusuna bakıyor.";
		else {
			presenceData.details = "Bilinmeyen Adres.";
			presenceData.state = null;
			presenceData.buttons = null;
		}
	} else {
		presenceData.details = "Bilinmeyen Adres.";
		presenceData.state = null;
		presenceData.buttons = null;
	}
	presence.setActivity(presenceData);
});
