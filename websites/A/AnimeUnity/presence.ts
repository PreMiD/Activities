const presence = new Presence({
	clientId: "1264199486910234725",
});

const enum Assets {
	Logo = "https://i.imgur.com/0Ak30uP.png",
}

async function getStrings() {
	return presence.getStrings(
		{
			paused: "general.paused",
			play: "general.playing",
			search: "general.searchFor",
			viewCategory: "general.viewCategory",
			viewHome: "general.viewHome",
			viewShow: "general.viewShow",
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}

let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null,
	current: number,
	duration: number,
	paused: boolean;

presence.on(
	"iFrameData",
	(data: { current: number; duration: number; paused: boolean }) => {
		({ current, duration, paused } = data);
	}
);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
		},
		[newLang, cover] = await Promise.all([
			presence.getSetting<string>("lang").catch(() => "en"),
			presence.getSetting<boolean>("cover"),
		]),
		{ pathname } = document.location;

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}
	if (document.querySelector("input.search-bar")) {
		presenceData.details = `${strings.search} ${
			(document.querySelector(".search-bar") as HTMLInputElement).value
		}`;
	} else {
		if (pathname === "/") presenceData.details = strings.viewHome;

		if (pathname.startsWith("/archivio"))
			presenceData.details = "Viewing Archive";

		if (pathname.startsWith("/calendario"))
			presenceData.details = "Viewing Schedule";

		if (pathname.startsWith("/top-anime")) {
			let top3 = "";
			for (let i = 0; i < 3; i++) {
				top3 += `${i + 1}° ${
					document.querySelectorAll(".name")[i].innerHTML
				}\n`;
			}
			presenceData.details = `Viewing top-anime: ${
				document.querySelector(".nav-link.active").innerHTML
			}`;
			presenceData.state = top3;
		}

		if (pathname.startsWith("/anime")) {
			delete presenceData.startTimestamp;
			presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play;
			presenceData.smallImageText = paused ? strings.paused : strings.play;

			presenceData.details = document.querySelector(".title").innerHTML;
			presenceData.state = `Episode ${
				document
					.querySelector(".episode.episode-item.active.seen")
					.querySelector("a").textContent
			}`;
			presenceData.largeImageKey = cover
				? (presenceData.largeImageKey = document
						.querySelector(".cover")
						.getAttribute("src"))
				: Assets.Logo;

			if (!isNaN(duration) && !paused) {
				[, presenceData.endTimestamp] = presence.getTimestamps(
					current,
					duration
				);
			}
		}
	}

	presence.setActivity(presenceData);
});
