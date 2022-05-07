const presence = new Presence({
		clientId: "972073369564483584"
	}),
	browsingStamp = Math.floor(Date.now() / 1000);

async function getStrings() {
	return presence.getStrings(
		{
			play: "general.playing",
			pause: "general.paused",
			search: "general.search",
			episode: "general.episode",
			browsing: "general.browsing",
			viewHome: "general.viewHome",
			viewChannel: "general.viewChannel",
			watchingVid: "general.watchingVid",
			viewCategory: "general.viewCategory",
			readingAbout: "general.readingAbout",
			searchSomething: "general.searchSomething",
			buttonWatchVideo: "general.buttonWatchVideo",
			buttonViewEpisode: "general.buttonViewEpisode"
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}
let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null;

presence.on("UpdateData", async () => {
	const [newLang] = await Promise.all([
			presence.getSetting<string>("lang").catch(() => "en")
		]),
		presenceData: PresenceData = {
			largeImageKey: "main",
			startTimestamp: browsingStamp
		},
		title =
			document.querySelector(
				"div.layout-body.media-width > div > ul > li:nth-child(3) > span"
			)?.textContent ||
			document.querySelector(
				"div.layout-normal > div.layout-body.media-width > div > ul > li:nth-child(2) > a"
			)?.textContent,
		playing = document.querySelector(
			"img.player-mobile-icon.player-mobile-pause-icon.player-mobile-active"
		);
	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}
	// Main Site
	if (document.location.hostname === "www.bilibili.tv") {
		switch (document.location.pathname.toString().toLowerCase().split("/")[2]) {
			case "video": {
				presenceData.details = strings.watchingVid;
				presenceData.state = title;
				presenceData.startTimestamp = browsingStamp;
				presenceData.smallImageKey = playing ? "pause" : "play";
				presenceData.smallImageText = playing ? strings.play : strings.pause;
				presenceData.largeImageKey = document
					.querySelector<HTMLImageElement>('meta[name="og:image"]')
					.getAttribute("content")
					.split("@")[0];
				presenceData.buttons = [
					{
						label: strings.buttonWatchVideo,
						url: document
							.querySelector('meta[name="og:url"]')
							.getAttribute("content")
					}
				];
				break;
			}
			case "play": {
				let ep;
				if (
					document.querySelector("span.series-text.active") &&
					!document
						.querySelector("div.video-info__title-wrap > h1 > a")
						.textContent.includes(
							document.querySelector("span.series-text.active").textContent
						)
				) {
					ep = `${document
						.querySelector("span.series-text.active")
						.textContent.replace(/ *\([^)]*\) */g, "")} | ${strings.episode} ${
						title.match(/\d+/g)[0]
					}`;
				} else ep = `${strings.episode} ${title.match(/\d+/g)[0]}`;
				presenceData.details = `${
					document.querySelector("div.video-info__title-wrap > h1 > a")
						.textContent
				}`;
				presenceData.state = `${ep}`;
				presenceData.smallImageKey = playing ? "pause" : "play";
				presenceData.smallImageText = !playing ? strings.play : strings.pause;
				presenceData.largeImageKey = document
					.querySelector<HTMLImageElement>('meta[name="og:image"]')
					.getAttribute("content")
					.split("@")[0];
				presenceData.buttons = [
					{
						label: strings.buttonViewEpisode,
						url: document
							.querySelector('meta[name="og:url"]')
							.getAttribute("content")
					}
				];
				break;
			}
			case "media": {
				presenceData.details = strings.readingAbout.replace(":", "");
				presenceData.state = document.querySelector(
					".media-detail__title"
				).textContent;
				presenceData.smallImageKey = "reading";
				presenceData.smallImageText = strings.browsing;
				break;
			}
			case "popular": {
				presenceData.details = strings.viewCategory.replace(":", "");
				presenceData.state = "Popular";
				presenceData.smallImageKey = "reading";
				presenceData.smallImageText = strings.browsing;
				break;
			}
			case "space": {
				presenceData.details = strings.viewChannel.replace(":", "");
				presenceData.state = `${
					document.querySelector(".space-info__name")?.textContent ??
					strings.searchSomething
				}`;
				break;
			}
			case "index": {
				presenceData.details = strings.search;
				presenceData.state =
					document.querySelector(
						"a.router-link-exact-active.router-link-active.anime-radio__tag.anime-radio__tag--active"
					)?.textContent ?? strings.searchSomething;
				presenceData.smallImageKey = "search";
				presenceData.smallImageText = strings.browsing;
				break;
			}
			default: {
				presenceData.details = strings.viewHome;
				presenceData.smallImageKey = "reading";
				presenceData.smallImageText = strings.browsing;
				break;
			}
		}
		// Studio
	} else if (document.location.hostname === "studio.bilibili.tv") {
		if (document.location.pathname.toString().toLowerCase().split("/")[1]) {
			presenceData.details =
				document.querySelector(".is-active")?.textContent ?? "?";
		} else {
			presenceData.details =
				document.querySelector(".nav-menu__menu-title")?.textContent ?? "?";
		}
		presenceData.state = "Bilibili Studio";
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
