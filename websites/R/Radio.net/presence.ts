const presence = new Presence({
	clientId: "634124614544392193",
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

let oldLang: string,
	newLang: string,
	strings: Awaited<ReturnType<typeof getStrings>>,
	timestamp: number;

presence.on("UpdateData", async () => {
	const host = window.location.hostname.split("."),
		path = window.location.pathname.split("/").slice(1),
		presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/3IBLlpc.png",
		};

	oldLang = newLang;
	newLang = await presence.getSetting<string>("lang").catch(() => "en");
	if (!strings || oldLang !== newLang) strings = await getStrings(newLang);

	if (host[0] === "corporate") {
		// Corporate page
		switch (path[0]) {
			// About us, Broadcasters, Advertising, Press, Jobs, Contact
			case "about-us":
			case "ueber-uns":
			case "broadcasters":
			case "sender":
			case "advertising":
			case "werbung":
			case "press":
			case "presse":
			case "jobs":
			case "contact":
			case "kontakt": {
				const item: string =
					document.querySelector<HTMLLIElement>(
						".current_page_item"
					).textContent;

				presenceData.details = `${host.join(".")} corporate`;
				presenceData.state =
					item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
				break;
			}
			default:
				return presence.setActivity();
		}
	} else {
		// Main page
		switch (path[0]) {
			// Radio station
			case "s":
				// Check if the animation icon is shown
				if (
					document.querySelector<HTMLSpanElement>(".player__animate-icon").style
						.display !== "none"
				) {
					// Radio is playing / buffering
					timestamp ||= Date.now();

					presenceData.details =
						document.querySelector<HTMLHeadingElement>("h1").textContent;
					presenceData.state =
						document.querySelector<HTMLDivElement>(".player__song").textContent;
					presenceData.largeImageKey = (
						document.querySelector<HTMLDivElement>("#station").children[3]
							.children[1].firstChild.firstChild.firstChild as HTMLImageElement
					).src;
					presenceData.smallImageText = strings.play;
					presenceData.smallImageKey = Assets.Play;
					presenceData.startTimestamp = timestamp;
				} else {
					// Radio is paused
					timestamp = 0;

					presenceData.details =
						document.querySelector<HTMLHeadingElement>("h1").textContent;
					presenceData.largeImageKey = (
						document.querySelector<HTMLDivElement>("#station").children[3]
							.children[1].firstChild.firstChild.firstChild as HTMLImageElement
					).src;
					presenceData.smallImageText = strings.pause;
					presenceData.smallImageKey = Assets.Pause;
				}
				break;
			// Podcast
			case "p":
				// Check if the animation icon is shown
				if (
					document.querySelector<HTMLSpanElement>(".player__animate-icon").style
						.display !== "none"
				) {
					// Podcast is playing / buffering
					const times = document
							.querySelector<HTMLDivElement>(".player__timing-wrap")
							.textContent.split("|"),
						timestamps = presence.getTimestamps(
							presence.timestampFromFormat(times[0]),
							presence.timestampFromFormat(times[1])
						);

					presenceData.details =
						document.querySelector<HTMLHeadingElement>("h1").textContent;
					presenceData.state =
						document.querySelector<HTMLDivElement>(".player__song").textContent;
					presenceData.largeImageKey = (
						document.querySelector<HTMLDivElement>("#podcast").children[1]
							.children[1].firstChild.firstChild.firstChild as HTMLImageElement
					).src;
					presenceData.smallImageText = strings.play;
					presenceData.smallImageKey = Assets.Play[
						(presenceData.startTimestamp, presenceData.endTimestamp)
					] = timestamps;
				} else {
					// Podcast is paused
					presenceData.details =
						document.querySelector<HTMLHeadingElement>("h1").textContent;
					presenceData.state =
						document.querySelector<HTMLDivElement>(".player__song").textContent;
					presenceData.largeImageKey = (
						document.querySelector<HTMLDivElement>("#podcast").children[1]
							.children[1].firstChild.firstChild.firstChild as HTMLImageElement
					).src;
					presenceData.smallImageText = strings.pause;
					presenceData.smallImageKey = Assets.Pause;
				}
				break;
			// Search
			case "search":
				presenceData.details = new URLSearchParams(window.location.search).get(
					"q"
				);
				presenceData.state =
					document.querySelector<HTMLHeadingElement>("h1").textContent;
				presenceData.smallImageText = strings.search;
				presenceData.smallImageKey = Assets.Search;
				break;
			// Genre, Topic, Country, City, Local stations, Top stations
			case "genre":
			case "topic":
			case "country":
			case "city":
			case "local-stations":
			case "top-stations":
				presenceData.details =
					document.querySelector<HTMLHeadingElement>("h1").textContent;
				presenceData.smallImageText = strings.browsing;
				presenceData.smallImageKey = Assets.Reading;
				break;
			// Choose your country, Contact, App, Terms and conditions, Privacy policy, Imprint
			case "country-selector":
			case "contact":
			case "app":
			case "terms-and-conditions":
			case "privacy-policy":
			case "imprint":
				presenceData.details = document.title;
				break;
			// Startpage, Unknown
			default:
				return presence.setActivity();
		}
	}
});

async function getStrings(lang: string) {
	return presence.getStrings(
		{
			play: "general.playing",
			pause: "general.paused",
			search: "general.searching",
			browsing: "general.browsing",
		},
		lang
	);
}
