const presence = new Presence({
		clientId: "861582205028794418",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

const enum Assets { // Other default assets can be found at index.d.ts
	Logo = "masuru",
	Bot = "logo",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			startTimestamp: browsingTimestamp,
		},
		{ pathname, hostname, href } = document.location;
	switch (hostname.replace("www.", "")) {
		case "masuru.in.th": {
			const title = document.querySelector("title").textContent;
			if (title) {
				presenceData.details = title;
				(presenceData.largeImageKey = Assets.Logo),
					// Add Button View Page
					(presenceData.buttons = [
						{
							label: "View Page",
							url: href,
						},
					]);
				presence.setActivity(presenceData);
			}
			break;
		}
		case "bot.masuru.in.th": {
			const title = document.querySelector("title").textContent;
			if (title) {
				presenceData.details = title;
				presenceData.largeImageKey = Assets.Bot;
				const pathname_ = pathname.replace("/th", "").replace("/en", "");
				switch (pathname_) {
					case "/":
						presenceData.details = `Home - ${title}`;
						break;
					case "/status":
						presenceData.details = `Status - ${title}`;
						break;
					default:
						if (pathname_.startsWith("/dashboard")) {
							presenceData.details = `Dashboard - ${title}`;
							presenceData.state = pathname_.split("/").reverse()[0];
							if (presenceData.state === "discovery") {
								presenceData.buttons = [
									{
										label: "Discovery Page",
										url: "https://masuru.in.th/discovery",
									},
								];
							}
						}
				}
				presence.setActivity(presenceData);
			}
			break;
		}
		case "cloud.masuru.in.th": {
			const title = document.querySelector("title").textContent;
			if (title) {
				presenceData.details = title;
				presenceData.largeImageKey = Assets.Logo;
				presence.setActivity(presenceData);
			}
			break;
		}
	}
});
