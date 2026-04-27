var presence = new Presence({
	clientId: "1449057122469019749"
});

var browsingTimestamp = Math.floor(Date.now() / 1000);

var ActivityAssets = {
	Logo: "https://i.imgur.com/4lU3x0V.png"
};

function getPageInfo() {
	var info = { animeName: "Anime", season: null, episode: null, poster: null };
	var path = document.location.pathname;

	var withSeason = path.match(/\/(.+?)-(\d+)-sezon-(\d+)-bolum/i);
	var noSeason   = path.match(/\/(.+?)-(\d+)-bolum/i);

	if (withSeason) {
		info.season  = parseInt(withSeason[2], 10);
		info.episode = parseInt(withSeason[3], 10);
	} else if (noSeason) {
		info.episode = parseInt(noSeason[2], 10);
	}

	var cleanTitle = (document.title || "")
		.replace(/\s*[-–|]\s*Asya Animeleri.*/i, "")
		.replace(/\s+\d+\.?\s*[Ss]ezon.*/i, "")
		.replace(/\s+\d+\.?\s*[Bb]ölüm.*/i, "")
		.replace(/\s+[Ss]eason\s*\d+.*/i, "")
		.trim();

	if (cleanTitle) info.animeName = cleanTitle;

	var poster =
		document.querySelector("img.thumbnel") ||
		document.querySelector("img.tb") ||
		document.querySelector("img.wp-post-image");

	if (poster && poster.src) info.poster = poster.src;

	return info;
}

function getPageType() {
	var path = document.location.pathname;
	if (path === "/" || path === "") return "home";
	if (/\/series\//.test(path)) return "series";
	if (/-bolum/.test(path)) return "episode";
	return "other";
}

presence.on("UpdateData", async function() {
	var showEpisode   = await presence.getSetting("showEpisode");
	var showTimestamp = await presence.getSetting("showTimestamp");
	var showBrowsing  = await presence.getSetting("showBrowsing");

	var pageType = getPageType();

	var presenceData = {
		largeImageKey:  ActivityAssets.Logo,
		largeImageText: "Asya Animeleri",
		smallImageKey:  ActivityAssets.Logo,
		smallImageText: "Asya Animeleri",
		type: 3
	};

	if (pageType === "episode") {
		var info = getPageInfo();

		presenceData.largeImageKey  = info.poster || ActivityAssets.Logo;
		presenceData.largeImageText = info.animeName;
		presenceData.details        = info.animeName;

		if (showEpisode && info.season && info.episode)
			presenceData.state = "Season " + info.season + ", Episode " + info.episode;
		else if (showEpisode && info.episode)
			presenceData.state = "Episode " + info.episode;
		else
			presenceData.state = "Watching";

		if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;
		else delete presenceData.startTimestamp;

	} else if (pageType === "series") {
		if (!showBrowsing) { presence.setActivity(); return; }
		var t = (document.title || "").replace(/\s*[-–|]\s*Asya Animeleri.*/i, "").trim();
		presenceData.largeImageText = t;
		presenceData.details        = t || "Anime Page";
		presenceData.state          = "Browsing series";
		if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;
		else delete presenceData.startTimestamp;

	} else if (pageType === "home") {
		if (!showBrowsing) { presence.setActivity(); return; }
		presenceData.details = "Asya Animeleri";
		presenceData.state   = "Browsing home page";
		if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;
		else delete presenceData.startTimestamp;

	} else {
		if (!showBrowsing) { presence.setActivity(); return; }
		var lbl = (document.title || "").replace(/\s*[-–|]\s*Asya Animeleri.*/i, "").trim();
		presenceData.details = lbl || "Asya Animeleri";
		presenceData.state   = "Browsing";
		if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;
		else delete presenceData.startTimestamp;
	}

	presence.setActivity(presenceData);
});
