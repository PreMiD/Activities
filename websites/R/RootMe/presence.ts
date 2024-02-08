const presence = new Presence({
	clientId: "673322920809988120",
});

function parseQueryString(queryString?: string): { [key: string]: string } {
	queryString ??= window.location.search.substring(1);

	const params: { [key: string]: string } = {},
		queries = queryString.split("&");
	for (const indexQuery of queries) {
		const indexPair = indexQuery.split("=");
		params[decodeURIComponent(indexPair[0])] = decodeURIComponent(
			indexPair.length > 1 ? indexPair[1] : ""
		);
	}
	return params;
}

const enum Assets {
	Logo = "https://cdn.rcd.gg/PreMiD/websites/R/RootMe/assets/logo.png",
	Ctf = "https://cdn.discordapp.com/app-assets/673322920809988120/673324293567938590.png?size=512",
	Chall = "https://cdn.discordapp.com/app-assets/673322920809988120/673324321489551383.png?size=512",
	Commu = "https://cdn.discordapp.com/app-assets/673322920809988120/684073937268768814.png?size=512",
	Docu = "https://cdn.discordapp.com/app-assets/673322920809988120/684078044599550048.png?size=512",
	Infos = "https://cdn.discordapp.com/app-assets/673322920809988120/684080348782788608.png?size=512",
	Tools = "https://cdn.discordapp.com/app-assets/673322920809988120/684081622722936856.png?size=512",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
		},
		route = document.location.pathname.split("/");

	if (document.location.pathname === "/") {
		presenceData.details = "Home";
		if (!parseQueryString(document.location.hash).page)
			presenceData.state = "Watching home page";
		else if (parseQueryString(document.location.hash).page === "news") {
			presenceData.state = parseQueryString(document.location.hash).inc
				? `Watching ${parseQueryString(document.location.hash).page} page (${
						document.querySelector("dl.tabs > dd.active").textContent
				  } )`
				: `Watching ${parseQueryString(document.location.hash).page} page`;
		} else if (parseQueryString(document.location.hash).page === "structure") {
			if (
				parseQueryString(document.location.hash).inc === "inclusions/services"
			)
				presenceData.state = document.querySelector(".row > h1").textContent;
			else {
				presenceData.state =
					document.querySelector(".ajaxbloc > h1").textContent;
			}
		} else if (parseQueryString(document.location.hash).page === "contact")
			presenceData.state = document.querySelector(".t-body > h1").textContent;
		else if (parseQueryString(document.location.hash).page === "plan")
			presenceData.state = document.querySelector(".t-body > h1").textContent;
		else if (parseQueryString(document.location.hash).page === "faq")
			presenceData.state = document.querySelector("h1.crayon").textContent;

		presenceData.smallImageKey = Assets.Reading;
		switch (
			document.querySelector("img.grayscale").getAttribute("alt") ||
			document.querySelector("img.grayscale").getAttribute("title")
		) {
			case "fr":
				presenceData.smallImageText = "Language : français";
				break;
			case "es":
				presenceData.smallImageText = "Language : espanol";
				break;
			case "de":
				presenceData.smallImageText = "Language : deutsch";
				break;
			case "en":
				presenceData.smallImageText = "Language : english";
				break;
			default:
				break;
		}
	} else if (document.location.pathname.includes("/Challenges/")) {
		presenceData.smallImageKey = Assets.Chall;
		presenceData.smallImageText = "Challenges";
		presenceData.details = route[3]
			? `${route[2]} - ${route[3].replaceAll("-", " ")}`
			: `${route[2]}`;
		presenceData.state = !route[4]
			? "Navigating..."
			: document.querySelector(".crayon").textContent;
	} else if (document.location.pathname.includes("/Capture-The-Flag/")) {
		presenceData.smallImageKey = Assets.Ctf;
		presenceData.smallImageText = "Capture The Flag";
		presenceData.details = route[3]
			? `${route[2].replaceAll("-", " ")} - ${route[3].replaceAll("-", " ")}`
			: route[2].replaceAll("-", " ");
		presenceData.state = "Navigating...";
	} else if (
		document.location.pathname.includes("/Communaute/") ||
		document.location.pathname.includes("/Comunidad/") ||
		document.location.pathname.includes("/Community/")
	) {
		presenceData.smallImageKey = Assets.Commu;
		presenceData.smallImageText = "Communaute";
		presenceData.details = route[3]
			? `${route[2]} - ${route[3].replaceAll("-", " ")}`
			: route[2];
		presenceData.state = "Navigating...";
	} else if (
		document.location.pathname.includes("/Documentation/") ||
		document.location.pathname.includes("/Materialien/") ||
		document.location.pathname.includes("/Documentacion/") ||
		document.location.pathname.includes("/Docs/")
	) {
		presenceData.smallImageKey = Assets.Docu;
		presenceData.smallImageText = "Documentation";
		if (route[3] !== "Reseaux") {
			presenceData.details = route[3]
				? `${route[2]} - ${route[3].replaceAll("-", " ")}`
				: `${route[2]}`;
			presenceData.state = !route[4]
				? "Navigating..."
				: route[4].replaceAll("-", " ");
		} else {
			presenceData.details = route[4]
				? `${route[2]} - ${route[3]} > ${route[4]}`
				: `${route[2]} - ${route[3]}`;
			presenceData.state = !route[5]
				? "Navigating..."
				: route[5].replaceAll("-", " ");
		}
	} else if (
		document.location.pathname.includes("/Informations/") ||
		document.location.pathname.includes("/Information/") ||
		document.location.pathname.includes("/Info/")
	) {
		presenceData.smallImageKey = Assets.Infos;
		presenceData.smallImageText = "Informations";
		presenceData.details = `${route[2]}`;
		presenceData.state = !route[3]
			? "Navigating..."
			: document.querySelector(".crayon").textContent;
	} else if (
		document.location.pathname.includes("/Tools/") ||
		document.location.pathname.includes("/Herramientas/") ||
		document.location.pathname.includes("/Outils/")
	) {
		presenceData.smallImageKey = Assets.Tools;
		presenceData.smallImageText = "Tools";
		presenceData.details = route[3]
			? `${route[2]} - ${route[3].replaceAll("-", " ")}`
			: `${route[2]}`;
		presenceData.state = route[4] ?? "Navigating...";
	} else {
		presenceData.details = `Watching member : ${
			document.querySelector("span.forum").textContent
		}`;
		presenceData.state = parseQueryString(document.location.hash).inc
			? `Page : ${parseQueryString(document.location.hash).inc}`
			: "Page : profil";
	}

	if (!presenceData.details) presence.setActivity();
	else {
		if (!presenceData.state) presenceData.state = "Navigating...";

		presence.setActivity(presenceData);
	}
});
