type StaticPagesType = Record<string, PresenceData>;

const presence = new Presence({
		clientId: "1164189020922843257",
		appMode: true,
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000),
	staticPages: StaticPagesType = {
		"/": {
			details: "Viewing the homepage",
			buttons: [{ label: "View Website", url: "https://wiki.hylia.dev" }],
		},
		"/faq": {
			details: "Viewing the FAQ",
			buttons: [{ label: "View Website", url: "https://wiki.hylia.dev/faq" }],
		},
		"/api": {
			details: "Viewing the API",
			buttons: [{ label: "View Website", url: "https://wiki.hylia.dev/api" }],
		},
	}; // Took this from websites/S/Shoob but I rewrote some of it. :heart:

function fNumber(number: number): string {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

presence.on("UpdateData", async () => {
	const { pathname, href } = window.location,
		pathSplit = pathname.split("/").slice(1),
		pageTitle = document.title.split(" | ")[0]?.trim();

	let presenceData: PresenceData = {
		largeImageKey:
			"https://pbs.twimg.com/profile_images/1713923311858593792/doH2HOXp_400x400.png",
		startTimestamp: browsingTimestamp,
	};

	for (const [path, data] of Object.entries(staticPages))
		if (pathname.startsWith(path)) presenceData = { ...presenceData, ...data };

	switch (pathSplit[0]) {
		case "wiki":
			switch (pathSplit[1]) {
				case "vtubers":
					if (pathSplit[2]) {
						presenceData.largeImageKey = `https://wiki.hylia.dev/vtubers/${pathSplit[2]}/photo.jpg`;
						presenceData.details = "Viewing a Vuber";
						presenceData.state = `${pageTitle} • ${
							document.querySelector("#vtuber-desc")?.textContent
						}`;
						presenceData.buttons = [
							{ label: `View ${pathSplit[2]}`, url: href },
						];
						presenceData.smallImageKey =
							document.querySelector<HTMLImageElement>(".author-avatar")?.src;
						presenceData.smallImageText = `Written by github.com/${
							document.querySelector<HTMLImageElement>(".author-avatar")?.alt
						}`;
					} else {
						presenceData.details = `Viewing ${fNumber(
							document.querySelector(".amoumt-count")
								?.textContent as unknown as number
						)} Vtubers`;
					}

					break;
				case "software":
					if (pathSplit[2]) {
						presenceData.largeImageKey =
							"https://wiki.hylia.dev/images/premid/9081.png";
						presenceData.details = "Viewing Software";
						presenceData.state = `${pageTitle}`;
						presenceData.buttons = [
							{ label: `View ${pathSplit[2]}`, url: href },
						];
						presenceData.smallImageKey =
							document.querySelector<HTMLImageElement>(".author-avatar")?.src;
						presenceData.smallImageText = `Written by github.com/${
							document.querySelector<HTMLImageElement>(".author-avatar")?.alt
						}`;
					} else {
						presenceData.details = `Viewing ${fNumber(
							document.querySelector(".amoumt-count")
								?.textContent as unknown as number
						)} Software`;
					}
						
					break;
				case "guides":
					if (pathSplit[2]) {
						presenceData.largeImageKey =
							"https://wiki.hylia.dev/images/premid/8243.png";
						presenceData.details = "Viewing Guides";
						presenceData.state = `${pageTitle}`;
						presenceData.buttons = [{ label: "View Guide", url: href }];
						presenceData.smallImageKey =
							document.querySelector<HTMLImageElement>(".author-avatar")?.src;
						presenceData.smallImageText = `Written by github.com/${
							document.querySelector<HTMLImageElement>(".author-avatar")?.alt
						}`;
					} else {
						presenceData.details = `Viewing ${fNumber(
							document.querySelector(".amoumt-count")
								?.textContent as unknown as number
						)} Guides`;
					}
					break;
				default:
					presenceData.details = "Viewing The wiki";
					presenceData.state = pageTitle;
					presenceData.buttons = [{ label: "View Wiki", url: href }];
			}
			break;
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
