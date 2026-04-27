const presence = new Presence({
	clientId: "1449057122469019749"
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
	Logo = "https://i.imgur.com/4lU3x0V.png"
}

interface PageInfo {
	animeName: string;
	season: number | null;
	episode: number | null;
	poster: string | null;
}

function getPageInfo(): PageInfo {
	const info: PageInfo = {
		animeName: "Anime",
		season: null,
		episode: null,
		poster: null
	};

	const path = document.location.pathname;

	// /battle-through-the-heavens-5-sezon-196-bolum-turkce-altyazi/
	const withSeason = path.match(/\/(.+?)-(\d+)-sezon-(\d+)-bolum/i);
	// /spy-x-family-5-bolum/
	const noSeason = path.match(/\/(.+?)-(\d+)-bolum/i);

	if (withSeason) {
		info.season = parseInt(withSeason[2], 10);
		info.episode = parseInt(withSeason[3], 10);
	} else if (noSeason) {
		info.episode = parseInt(noSeason[2], 10);
	}

	// "Battle Through The Heavens 5.Sezon 196.Bölüm Türkçe Altyazı - Asya Animeleri"
	const cleanTitle = (document.title ?? "")
		.replace(/\s*[-–|]\s*Asya Animeleri.*/i, "")
		.replace(/\s+\d+\.?\s*[Ss]ezon.*/i, "")
		.replace(/\s+\d+\.?\s*[Bb]ölüm.*/i, "")
		.replace(/\s+[Ss]eason\s*\d+.*/i, "")
		.replace(/\s+[Ee]pisode\s*\d+.*/i, "")
		.trim();

	if (cleanTitle) info.animeName = cleanTitle;

	// img.thumbnel or img.tb is the series cover on episode pages
	const poster =
		document.querySelector<HTMLImageElement>("img.thumbnel") ??
		document.querySelector<HTMLImageElement>("img.tb") ??
		document.querySelector<HTMLImageElement>("img.wp-post-image");

	if (poster?.src) info.poster = poster.src;

	return info;
}

type PageType = "episode" | "series" | "home" | "other";

function getPageType(): PageType {
	const path = document.location.pathname;
	if (path === "/" || path === "") return "home";
	if (/\/series\//.test(path)) return "series";
	if (/-bolum/.test(path)) return "episode";
	return "other";
}

presence.on("UpdateData", async () => {
	const [showEpisode, showTimestamp, showBrowsing] = await Promise.all([
		presence.getSetting<boolean>("showEpisode"),
		presence.getSetting<boolean>("showTimestamp"),
		presence.getSetting<boolean>("showBrowsing")
	]);

	const pageType = getPageType();

	const presenceData: PresenceData = {
		largeImageKey: ActivityAssets.Logo,
		largeImageText: "Asya Animeleri",
		smallImageKey: ActivityAssets.Logo,
		smallImageText: "Asya Animeleri",
		type: ActivityType.Watching
	};

	if (pageType === "episode") {
		const info = getPageInfo();

		presenceData.largeImageKey = info.poster ?? ActivityAssets.Logo;
		presenceData.largeImageText = info.animeName;
		presenceData.details = info.animeName;

		if (showEpisode && info.season && info.episode)
			presenceData.state = `Season ${info.season}, Episode ${info.episode}`;
		else if (showEpisode && info.episode)
			presenceData.state = `Episode ${info.episode}`;
		else
			presenceData.state = "Watching";

		if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;
		else delete presenceData.startTimestamp;

	} else if (pageType === "series") {
		if (!showBrowsing) { presence.setActivity(); return; }

		const title = (document.title ?? "")
			.replace(/\s*[-–|]\s*Asya Animeleri.*/i, "")
			.trim();

		presenceData.largeImageText = title;
		presenceData.details = title || "Anime Page";
		presenceData.state = "Browsing series";

		if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;
		else delete presenceData.startTimestamp;

	} else if (pageType === "home") {
		if (!showBrowsing) { presence.setActivity(); return; }

		presenceData.details = "Asya Animeleri";
		presenceData.state = "Browsing home page";

		if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;
		else delete presenceData.startTimestamp;

	} else {
		if (!showBrowsing) { presence.setActivity(); return; }

		const label = (document.title ?? "")
			.replace(/\s*[-–|]\s*Asya Animeleri.*/i, "")
			.trim();

		presenceData.details = label || "Asya Animeleri";
		presenceData.state = "Browsing";

		if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;
		else delete presenceData.startTimestamp;
	}

	presence.setActivity(presenceData);
});
