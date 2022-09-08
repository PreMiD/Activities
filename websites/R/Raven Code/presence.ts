const presence = new Presence({ clientId: "1000041677035163779" }),
	startTimestamp = Math.floor(Date.now() / 1000);
let languages: { key: string; page: string; text: string }[] = [];

setInterval(
	async () =>
		(languages = await fetch("https://premid.ravencode.live").then(res =>
			res.json()
		)),
	15_000
);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "logo",
			details: "Geziniyor",
			buttons: [{ label: "Sayfaya git", url: document.location.href }],
			startTimestamp,
		},
		{ pathname, search, host } = document.location,
		searchParams = new URLSearchParams(search);

	if (host === "docs.ravencode.live") {
		presenceData.details = "docs.ravencode.live";
		presenceData.state = document.title.replaceAll("-", "—");
	} else if (host === "ravencode.live") {
		switch (pathname) {
			case "/":
				presenceData.details = "Anasayfayı görüntülüyor";
				if (searchParams.has("user_id")) {
					const image = document.querySelector<HTMLImageElement>(
							"[data-premid-useravatar]"
						)?.src,
						userTag = document.querySelector<HTMLElement>(
							"[data-premid-usertag]"
						)?.textContent;
					if (image && userTag) {
						presenceData.details = "Kullanıcıyı görüntülüyor:";
						presenceData.state = userTag;
						presenceData.largeImageKey = image;
					}
				} else if (searchParams.has("invite_code")) {
					const image = document.querySelector<HTMLImageElement>(
							"[data-premid-guildicon]"
						)?.src,
						guildName = document.querySelector<HTMLElement>(
							"[data-premid-guildname]"
						)?.textContent;
					if (image && guildName) {
						presenceData.details = "Daveti görüntülüyor:";
						presenceData.state = guildName;
						presenceData.largeImageKey = image;
					}
				}
				break;
			case "/share":
				presenceData.details = "Kod paylaşıyor";
				break;

			case "/profile":
				presenceData.details = "Profil görüntüleniyor:";
				presenceData.state = document.title.split("— ")[1];

				presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
					"[data-premid-avatar]"
				).src;
				break;

			case "/codes":
				presenceData.details = "Kodlar sayfasını görüntülüyor";
				if (searchParams.get("search"))
					presenceData.state = `Arama: ${searchParams.get("search")}`;
				break;
		}

		if (pathname.startsWith("/code/")) {
			presenceData.details = "Kod görüntüleniyor:";
			presenceData.state = document.title.split("— ")[1];

			for (const language of languages) {
				if (pathname.includes(language.page)) {
					presenceData.smallImageKey = language.key;
					presenceData.smallImageText = `Kategori — ${language.text}`;
				}
			}

			if (
				document.activeElement === document.querySelector('input[id="comment"]')
			)
				presenceData.details = "Yorum yapılıyor:";
		}
	}

	presence.setActivity(presenceData);
});
