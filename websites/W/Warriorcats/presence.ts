const presence = new Presence({
		clientId: "936630095035113522",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

function getPostNumber() {
	return document
		.querySelector("article")
		.getAttribute("id")
		.replace(/post-/, "");
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			details: "Stöbert auf der Warrior Cats Seite",
			largeImageKey:
				"https://cdn.rcd.gg/PreMiD/websites/W/Warriorcats/assets/logo.jpg",
			startTimestamp: browsingTimestamp,
		},
		{ href, pathname } = document.location;
	switch (pathname) {
		case "/": {
			presenceData.details = "auf der Startseite";
			break;
		}
		case "/beutehaufen-uebersicht/": {
			presenceData.details = "Beutehaufen Übersicht";
			break;
		}
		case "/nachrichten-vom-baumgeviert/": {
			presenceData.details = "lesen der Nachrichten";
			break;
		}
		case "/nutzerkonto/": {
			presenceData.details = "im Nutzerkonto";
			break;
		}
		case "/dein-clanlager/": {
			presenceData.details = "im  Clan Camp";
			break;
		}
		case "/deine-clankatze/": {
			presenceData.details = "mit der eigenen Katze";
			break;
		}
		case "/graphic-novel/": {
			presenceData.details = "in den Graphic Novels";
			presenceData.buttons = [
				{
					label: "Buch ansehen",
					url: href,
				},
			];
			break;
		}
		case "/alle-baende/": {
			presenceData.details = "in der Liste aller Bände";
			break;
		}
		case "/erin-hunter/": {
			presenceData.details = "auf der Erin Hunter Seite";
			break;
		}
		case "/welt-der-warrior-cats/": {
			presenceData.details = "betrachtet die Welt";
			break;
		}
		case "/zeitstrahl/": {
			presenceData.details = "die Lore der Warrior Cats";
			break;
		}
		case "/wiki/": {
			presenceData.details = "im Wiki lesen";
			break;
		}
		default: {
			presenceData.details = "unbekannte Seite";
		}
	}

	if (
		pathname.startsWith("/beute/staffel-") ||
		pathname.startsWith("/beute/")
	) {
		const postNumber = getPostNumber();

		presenceData.state = `Viewing ${getBuchName(postNumber)}`;
		presenceData.details = getStaffelName(postNumber);
		presenceData.buttons = [
			{
				label: "Buch ansehen",
				url: href,
			},
		];
		presenceData.largeImageKey = getBuchImage(postNumber);
	} else if (pathname.startsWith("/staffel-")) {
		presenceData.buttons = [
			{
				label: "Staffel ansehen",
				url: href,
			},
		];
		presenceData.details = `Staffel ${pathname.split("/")[1].split("-")[1]}`;
	}

	function getStaffelName(postNumber: string) {
		const staffelName = document.querySelector(
				`#post-${postNumber} > div > div.entry-content > div > div.wc-biblio > div.wc-staffel`
			).textContent,
			result3 = staffelName
				.replace(/^Warrior Cats \| /, "")
				.replace(/Staffel /, "")
				.replace(pathname.split("/")[2].split("-")[1].toUpperCase(), "");
		return result3.replace(/[^a-zA-Z ]/g, "").trim();
	}

	function getBuchName(postNumber: string) {
		return document
			.querySelector(
				`#post-${postNumber} > div > div.entry-content > div > div.wc-biblio > div.wc-band`
			)
			.textContent.replace(/.*:/, "");
	}

	function getBuchImage(postNumber: string) {
		return document
			.querySelector(
				`#post-${postNumber} > div > div.entry-content > div > div.wc-article-thumbnail > a > img`
			)
			.getAttribute("src");
	}

	presence.setActivity(presenceData);
});
