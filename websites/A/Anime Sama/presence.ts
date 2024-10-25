const presence = new Presence({ clientId: "1016797607370162256" }),
	browsingTimestamp = Math.floor(Date.now() / 1000),
	staticPages: { [name: string]: string } = {
		"": "Visionne la page d'accueil",
		planning: "Regarde le planning des sorties",
		aide: "Lit la page d'aide",
		profil: "visionne son profil",
		catalogue: "Parcourir le catalogue",
	};

const enum Assets {
	Logo = "https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Sama/assets/logo.png",
}

interface IFrameData {
	duration: number;
	currentTime: number;
	paused: boolean;
}

let duration: number,
	currentTime: number,
	paused = true;

presence.on("iFrameData", (data: IFrameData) => {
	({ duration, currentTime, paused } = data);
});

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			type: ActivityType.Watching,
			largeImageKey: Assets.Logo,
			startTimestamp: browsingTimestamp,
		},
		{ pathname, href } = document.location,
		pathArr = pathname.split("/"),
		[showButtons, privacyMode, showCover] = await Promise.all([
			presence.getSetting<boolean>("buttons"),
			presence.getSetting<boolean>("privacy"),
			presence.getSetting<boolean>("cover"),
		]);

	if (Object.keys(staticPages).includes(pathArr[1]) && pathArr.length <= 3) {
		presenceData.details = staticPages[pathArr[1]];
		if (privacyMode)
			presenceData.details = "Navigue...";
	} else if (pathArr.length === 4) {
		const pageTitle = document.querySelector("h2.border-slate-500")?.textContent;
		presenceData.details =
			pageTitle === "Anime"
				? "Regarde la page de l'anime"
				: "Regarde la page du manga";
		presenceData.state = document
			.querySelector("#titreOeuvre")
			.textContent.trim();
		presenceData.buttons = [{ label: "Voir la Page", url: href }];
		presenceData.largeImageKey =
			document.querySelector<HTMLMetaElement>("[property='og:image']")
				?.content ?? Assets.Logo;
		if (privacyMode) {
			delete presenceData.state;
			presenceData.details =
				pageTitle === "Anime"
					? "Regarde la page d'un anime"
					: "Regarde la page d'un manga";
		}
	} else if (document.querySelector<HTMLSelectElement>("#selectEpisodes")) {
		const season = document.querySelector("#avOeuvre").textContent,
			selectEps = document.querySelector<HTMLSelectElement>("#selectEpisodes"),
			selectLecteur =
				document.querySelector<HTMLSelectElement>("#selectLecteurs");
		presenceData.details = `Regarde ${
			document.querySelector("#titreOeuvre").textContent
		}`;
		presenceData.state = `${season ? `${season} - ` : ""}${
			selectEps.options[selectEps.selectedIndex].value
		}`;

		presenceData.buttons = [{ label: "Voir l'Anime", url: href }];
		presenceData.smallImageKey = Assets.Pause;
		presenceData.smallImageText =
			selectLecteur.options[selectLecteur.selectedIndex].value;
		presenceData.largeImageKey =
			document.querySelector<HTMLMetaElement>("[property='og:image']")
				?.content ?? Assets.Logo;
		if (!paused) {
			[presenceData.startTimestamp, presenceData.endTimestamp] =
				presence.getTimestamps(currentTime, duration);
			presenceData.smallImageKey = Assets.Play;
		}
		if (privacyMode) {
			delete presenceData.state;
			delete presenceData.smallImageKey;
			presenceData.details = "Regarde un anime";
		}
	} else {
		const selectChapitres =
			document.querySelector<HTMLSelectElement>("#selectChapitres");
		presenceData.details = `Lit ${
			document.querySelector("#titreOeuvre").textContent
		}`;
		presenceData.state =
			selectChapitres.options[selectChapitres.selectedIndex].value.trim();
		const selectLecteur =
			document.querySelector<HTMLSelectElement>("#selectLecteurs");
		presenceData.smallImageKey = Assets.Reading;
		presenceData.smallImageText =
			selectLecteur.options[selectLecteur.selectedIndex].value;
		presenceData.buttons = [{ label: "Voir le Scan", url: href }];
		presenceData.largeImageKey =
			document.querySelector<HTMLMetaElement>("[property='og:image']")
				?.content ?? Assets.Logo;
		if (privacyMode) {
			delete presenceData.state;
			delete presenceData.smallImageKey;
			presenceData.details = "Lit un manga";
		}
	}

	if (!showButtons || privacyMode) delete presenceData.buttons;
	if (!showCover || privacyMode) presenceData.largeImageKey = Assets.Logo;
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
