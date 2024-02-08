const presence = new Presence({
		clientId: "660882722839068702",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

let iFrameVideo: boolean,
	currentTime: number,
	duration: number,
	paused: boolean,
	usernamewl,
	username,
	hentainame,
	episodenumber,
	timestamps;

interface IFrameData {
	iframeVideo: {
		duration: number;
		iFrameVideo: boolean;
		paused: boolean;
		currTime: number;
	};
}

presence.on("iFrameData", (data: IFrameData) => {
	if (data.iframeVideo.duration) {
		({ iFrameVideo, duration, paused } = data.iframeVideo);
		currentTime = data.iframeVideo.currTime;
	}
});

const enum Assets {
	Logo = "https://cdn.rcd.gg/PreMiD/websites/H/HentaiWorld/assets/logo.png",
	Clock = "https://cdn.discordapp.com/app-assets/660882722839068702/676816350886363157.png?size=512",
	Home = "https://cdn.discordapp.com/app-assets/660882722839068702/676816351234490380.png?size=512",
	Contacts = "https://cdn.discordapp.com/app-assets/660882722839068702/676816351599263774.png?size=512",
	New = "https://cdn.discordapp.com/app-assets/660882722839068702/676816351779881020.png?size=512",
	Notifications = "https://cdn.discordapp.com/app-assets/660882722839068702/676816352505495558.png?size=512",
	Userwl = "https://cdn.discordapp.com/app-assets/660882722839068702/676816352543244297.png?size=512",
	User = "https://cdn.discordapp.com/app-assets/660882722839068702/676816352635518986.png?size=512",
	Settings = "https://cdn.discordapp.com/app-assets/660882722839068702/676816352656228354.png?size=512",
	Schedule = "https://cdn.discordapp.com/app-assets/660882722839068702/676816352777863178.png?size=512",
	Wlsettings = "https://cdn.discordapp.com/app-assets/660882722839068702/676816654025490442.png?size=512",
	Archive = "https://cdn.discordapp.com/app-assets/660882722839068702/676816655803875329.png?size=512",
}

presence.on("UpdateData", () => {
	const presenceData: PresenceData = {
		largeImageKey: Assets.Logo,
	};

	presenceData.startTimestamp = browsingTimestamp;

	if (!navigator.language.includes("it-IT")) {
		// English
		if (document.location.pathname === "/") {
			presenceData.smallImageKey = Assets.Home;
			presenceData.details = "Browsing in the homepage";
		} else if (document.location.pathname.startsWith("/contact")) {
			// Contact the Staff
			presenceData.smallImageKey = Assets.Contacts;
			presenceData.details = "Contacting the Staff";
		} else if (document.location.pathname.startsWith("/user/")) {
			// User Settings
			if (document.location.pathname.startsWith("/user/settings")) {
				// General Settings
				presenceData.smallImageKey = Assets.Settings;
				presenceData.details = "In the settings";
			} else if (document.location.href.includes("watchlist")) {
				// WatchList
				presenceData.smallImageKey = Assets.Wlsettings;
				presenceData.details = "Editing the WatchList";
			} else if (document.location.pathname.startsWith("/user/import")) {
				// Import WL
				presenceData.smallImageKey = Assets.Downloading;
				presenceData.details = "Importing the";
				presenceData.state = "WatchList from MAL";
			} else if (document.location.pathname.startsWith("/user/notifications")) {
				// Notifications
				presenceData.smallImageKey = Assets.Notifications;
				presenceData.details = "Browsing the";
				presenceData.state = Assets.Notifications;
			} else presenceData.smallImageKey = Assets.Settings;
			presenceData.details = "In the settings";
		} else if (document.location.pathname.startsWith("/profile")) {
			// Profile
			if (document.location.href.includes("watchlist")) {
				usernamewl = document.querySelector("span.site-name > b").textContent;
				presenceData.smallImageKey = Assets.Userwl;
				presenceData.details = `Watching the ${usernamewl}'s`;
				presenceData.state = "WatchList";
			} else {
				username = document
					.querySelector("div.ruolo-aw2")
					.textContent.replace("Hey ", "")
					.replace(" Benvenuto!", "");
				presenceData.smallImageKey = Assets.User;
				presenceData.details = `Watching the ${username}'s`;
				presenceData.state = "profile";
			}
		} else if (document.location.pathname.startsWith("/genre")) {
			// Genre
			if (document.location.href.includes("?page=")) {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "Browsing the genre:";
				presenceData.state = `${document.title.split('"')[1]}Page: ${
					document.location.href.split("=")[1]
				}`;
			} else {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = `Browsing the genre:${
					document.title.split('"')[1]
				}`;
				presenceData.state = `${document.title.split('"')[1]}Page: 1`;
			}
		} else if (document.location.pathname.startsWith("/newest")) {
			// Newest
			if (
				document.location.href.startsWith(
					"https://www.hentaiworld.eu/newest?page="
				)
			) {
				presenceData.smallImageKey = Assets.New;
				presenceData.details = "Browsing the new Hentai";
				presenceData.state = `Page: ${document.location.href.replace(
					"https://www.hentaiworld.eu/newest?page=",
					""
				)}`;
			} else {
				presenceData.smallImageKey = Assets.New;
				presenceData.details = "Browsing the new Hentai";
				presenceData.state = "Page: 1";
			}
		} else if (document.location.pathname.startsWith("/updated")) {
			// Updated
			if (
				document.location.href.startsWith(
					"https://www.hentaiworld.eu/updated?page="
				)
			) {
				presenceData.smallImageKey = Assets.New;
				presenceData.details = "Browsing the new episodes";
				presenceData.state = `Page: ${document.location.href.replace(
					"https://www.hentaiworld.eu/newest?page=",
					""
				)}`;
			} else {
				presenceData.smallImageKey = Assets.New;
				presenceData.details = "Browsing the new episodes";
				presenceData.state = "Page: 1";
			}
		} else if (document.location.pathname.startsWith("/ongoing")) {
			// On Going
			if (
				document.location.href.startsWith(
					"https://www.hentaiworld.eu/ongoing?page="
				)
			) {
				presenceData.smallImageKey = Assets.Schedule;
				presenceData.details = "Browsing the on going";
				presenceData.state = `Hentai. Page: ${document.location.href.replace(
					"https://www.hentaiworld.eu/ongoing?page=",
					""
				)}`;
			} else {
				presenceData.smallImageKey = Assets.Schedule;
				presenceData.details = "Browsing the on going";
				presenceData.state = "Hentai. Page: 1";
			}
		} else if (document.location.pathname.startsWith("/upcoming")) {
			// Upcoming
			presenceData.smallImageKey = Assets.Clock;
			presenceData.details = "Browsing the upcoming";
			presenceData.state = "Hentai";
		} else if (document.location.pathname.startsWith("/az-list")) {
			// A-Z List
			if (document.location.href.includes("?page=")) {
				presenceData.smallImageKey = Assets.Archive;
				presenceData.details = "Browsing the archive";
				presenceData.state = `Page: ${document.location.href.split("=")[1]}`;
			} else presenceData.smallImageKey = Assets.Archive;
			presenceData.details = "Browsing the archive";
			presenceData.state = "Page: 1";
		} else if (document.location.pathname.startsWith("/search")) {
			// Search
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Searching:";
			presenceData.state = document.title.replace("HentaiWorld: ", "");
		} else if (
			document.location.href.startsWith("https://www.hentaiworld.eu/filter")
		) {
			// Accurate Research
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Doing an advanced";
			presenceData.state = "search";
		} else if (document.location.pathname.startsWith("/tv-series")) {
			// Categories
			// TV-Series
			if (
				document.location.href.startsWith(
					"https://www.hentaiworld.eu/tv-series?page="
				)
			) {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: Hentai";
				presenceData.state = `Page: ${document.location.href.replace(
					"https://www.hentaiworld.eu/tv-series?page=",
					""
				)}`;
			} else {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: Hentai";
				presenceData.state = "Page: 1";
			}
		} else if (document.location.pathname.startsWith("/movies")) {
			// Movies
			if (
				document.location.href.startsWith(
					"https://www.hentaiworld.eu/movies?page="
				)
			) {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: Movies";
				presenceData.state = `Page: ${document.location.href.replace(
					"https://www.hentaiworld.eu/movies?page=",
					""
				)}`;
			} else {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: Movies";
				presenceData.state = "Page: 1";
			}
		} else if (document.location.pathname.startsWith("/ova")) {
			// OVA
			if (
				document.location.href.startsWith(
					"https://www.hentaiworld.eu/ova?page="
				)
			) {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: OVA";
				presenceData.state = `Page: ${document.location.href.replace(
					"https://www.hentaiworld.eu/ova?page=",
					""
				)}`;
			} else {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: OVA";
				presenceData.state = "Page: 1";
			}
		} else if (document.location.pathname.startsWith("/ona")) {
			// ONA
			if (
				document.location.href.startsWith(
					"https://www.hentaiworld.eu/ona?page="
				)
			) {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: ONA";
				presenceData.state = `Page: ${document.location.href.replace(
					"https://www.hentaiworld.eu/ona?page=",
					""
				)}`;
			} else {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: ONA";
				presenceData.state = "Page: 1";
			}
		} else if (document.location.pathname.startsWith("/specials")) {
			// Specials
			if (
				document.location.href.startsWith(
					"https://www.hentaiworld.eu/specials?page="
				)
			) {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: Specials";
				presenceData.state = `Page: ${document.location.href.replace(
					"https://www.hentaiworld.eu/specials?page=",
					""
				)}`;
			} else {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: Specials";
				presenceData.state = "Page: 1";
			}
		} else if (document.location.pathname.startsWith("/preview")) {
			// Preview
			if (
				document.location.href.startsWith(
					"https://www.hentaiworld.eu/preview?page="
				)
			) {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: Preview";
				presenceData.state = `Page: ${document.location.href.replace(
					"https://www.hentaiworld.eu/preview?page=",
					""
				)}`;
			} else {
				presenceData.smallImageKey = Assets.Search;
				presenceData.details = "In the category: Preview";
				presenceData.state = "Page: 1";
			}
		} else if (document.location.pathname.startsWith("/watch")) {
			// End Categories
			// Hentai Episode
			[hentainame] = document.title
				.replace("HentaiWorld: ", "")
				.split(" Episodio");
			[, episodenumber] = document
				.querySelector("a#downloadLink.btn.btn-sm.btn-primary")
				.textContent.split("Ep ");
			timestamps = presence.getTimestamps(
				Math.floor(currentTime),
				Math.floor(duration)
			);
			if (iFrameVideo === true && !isNaN(duration)) {
				presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play;
				presenceData.details = `Watching: ${hentainame}`;
				presenceData.state = paused
					? `Ep. ${episodenumber}｜Paused`
					: `Ep. ${episodenumber}｜Playing`;
				presenceData.startTimestamp = paused ? null : timestamps[0];
				presenceData.endTimestamp = paused ? null : timestamps[1];
			} else {
				presenceData.smallImageKey = Assets.Viewing;
				presenceData.details = ` Is going to watch: ${hentainame}`;
				presenceData.state = `Episode: ${episodenumber}`;
			}
		}
	} else if (document.location.pathname === "/") {
		presenceData.smallImageKey = Assets.Home;
		presenceData.details = "Nella homepage";
	} else if (document.location.pathname.startsWith("/contact")) {
		// Contact the Staff
		presenceData.smallImageKey = Assets.Contacts;
		presenceData.details = "Sta contattando lo";
		presenceData.state = "Staff";
	} else if (document.location.pathname.startsWith("/user/")) {
		// User Settings
		if (document.location.pathname.startsWith("/user/settings")) {
			// General Settings
			presenceData.smallImageKey = Assets.Settings;
			presenceData.details = "Nelle sue impostazioni";
		} else if (document.location.href.includes("watchlist")) {
			// WatchList
			presenceData.smallImageKey = Assets.Wlsettings;
			presenceData.details = "Sta modificando la";
			presenceData.state = "sua WatchList";
		} else if (document.location.pathname.startsWith("/user/import")) {
			// Import WL
			presenceData.smallImageKey = Assets.Downloading;
			presenceData.details = "Sta importando la sua";
			presenceData.state = "WatchList da MAL";
		} else if (document.location.pathname.startsWith("/user/notifications")) {
			// Notifications
			presenceData.smallImageKey = Assets.Notifications;
			presenceData.details = "Sfoglia le notifiche";
		} else presenceData.smallImageKey = Assets.Settings;
		presenceData.details = "Nelle impostazioni";
	} else if (document.location.pathname.startsWith("/profile")) {
		// Profile
		if (document.location.href.includes("watchlist")) {
			usernamewl = document.querySelector("span.site-name > b").textContent;
			presenceData.smallImageKey = Assets.Userwl;
			presenceData.details = "Guarda la WatchList di:";
			presenceData.state = usernamewl;
		} else {
			username = document
				.querySelector("div.ruolo-aw2")
				.textContent.replace("Hey ", "")
				.replace(" Benvenuto!", "");
			presenceData.smallImageKey = Assets.User;
			presenceData.details = "Guarda il profilo di:";
			presenceData.state = username;
		}
	} else if (document.location.pathname.startsWith("/genre")) {
		// Genre
		if (document.location.href.includes("?page=")) {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = `Nel genere: ${document.title.split('"')[1]}`;
			presenceData.state = `Pagina: ${document.location.href.split("=")[1]}`;
		} else {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = `Nel genere: ${document.title.split('"')[1]}`;
			presenceData.state = "Pagina: 1";
		}
	} else if (document.location.pathname.startsWith("/newest")) {
		// Newest
		if (
			document.location.href.startsWith(
				"https://www.hentaiworld.eu/newest?page="
			)
		) {
			presenceData.smallImageKey = Assets.New;
			presenceData.details = "Sfoglia le nuove aggiunte";
			presenceData.state = `Pagina: ${document.location.href.replace(
				"https://www.hentaiworld.eu/newest?page=",
				""
			)}`;
		} else {
			presenceData.smallImageKey = Assets.New;
			presenceData.details = "Sfoglia le nuove aggiunte";
			presenceData.state = "Pagina: 1";
		}
	} else if (document.location.pathname.startsWith("/updated")) {
		// Updated
		if (
			document.location.href.startsWith(
				"https://www.hentaiworld.eu/updated?page="
			)
		) {
			presenceData.smallImageKey = Assets.New;
			presenceData.details = "Sfoglia i nuovi episodi";
			presenceData.state = `Pagina: ${document.location.href.replace(
				"https://www.hentaiworld.eu/newest?page=",
				""
			)}`;
		} else {
			presenceData.smallImageKey = Assets.New;
			presenceData.details = "Sfoglia i nuovi episodi";
			presenceData.state = "Pagina: 1";
		}
	} else if (document.location.pathname.startsWith("/ongoing")) {
		// On Going
		if (
			document.location.href.startsWith(
				"https://www.hentaiworld.eu/ongoing?page="
			)
		) {
			presenceData.smallImageKey = Assets.Schedule;
			presenceData.details = "Sfoglia gli hentai in corso";
			presenceData.state = `Pagina: ${document.location.href.replace(
				"https://www.hentaiworld.eu/ongoing?page=",
				""
			)}`;
		} else {
			presenceData.smallImageKey = Assets.Schedule;
			presenceData.details = "Sfoglia gli hentai in corso";
			presenceData.state = "Pagina: 1";
		}
	} else if (document.location.pathname.startsWith("/upcoming")) {
		// Upcoming
		presenceData.smallImageKey = Assets.Clock;
		presenceData.details = "Sfoglia le prossime";
		presenceData.state = "uscite";
	} else if (document.location.pathname.startsWith("/az-list")) {
		// A-Z List
		if (document.location.href.includes("?page=")) {
			presenceData.smallImageKey = Assets.Archive;
			presenceData.details = "Sfoglia tutti gli hentai";
			presenceData.state = `Pagina: ${document.location.href.split("=")[1]}`;
		} else presenceData.smallImageKey = Assets.Archive;
		presenceData.details = "Sfoglia tutti gli hentai";
		presenceData.state = "Pagina: 1";
	} else if (document.location.pathname.startsWith("/search")) {
		// Search
		presenceData.smallImageKey = Assets.Search;
		presenceData.details = "Sta cercando:";
		presenceData.state = document.title.replace("HentaiWorld: ", "");
	} else if (
		document.location.href.startsWith("https://www.hentaiworld.eu/filter")
	) {
		// Accurate Research
		presenceData.smallImageKey = Assets.Search;
		presenceData.details = "Sta facendo una ricerca";
		presenceData.state = "avanzata";
	} else if (document.location.pathname.startsWith("/tv-series")) {
		// Categories
		// TV-Series
		if (
			document.location.href.startsWith(
				"https://www.hentaiworld.eu/tv-series?page="
			)
		) {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: Hentai";
			presenceData.state = `Pagina: ${document.location.href.replace(
				"https://www.hentaiworld.eu/tv-series?page=",
				""
			)}`;
		} else {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: Hentai";
			presenceData.state = "Pagina: 1";
		}
	} else if (document.location.pathname.startsWith("/movies")) {
		// Movies
		if (
			document.location.href.startsWith(
				"https://www.hentaiworld.eu/movies?page="
			)
		) {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: Film";
			presenceData.state = `Pagina: ${document.location.href.replace(
				"https://www.hentaiworld.eu/movies?page=",
				""
			)}`;
		} else {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: Film";
			presenceData.state = "Pagina: 1";
		}
	} else if (document.location.pathname.startsWith("/ova")) {
		// OVA
		if (
			document.location.href.startsWith("https://www.hentaiworld.eu/ova?page=")
		) {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: OVA";
			presenceData.state = `Pagina: ${document.location.href.replace(
				"https://www.hentaiworld.eu/ova?page=",
				""
			)}`;
		} else {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: OVA";
			presenceData.state = "Pagina: 1";
		}
	} else if (document.location.pathname.startsWith("/ona")) {
		// ONA
		if (
			document.location.href.startsWith("https://www.hentaiworld.eu/ona?page=")
		) {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: ONA";
			presenceData.state = `Pagina: ${document.location.href.replace(
				"https://www.hentaiworld.eu/ona?page=",
				""
			)}`;
		} else {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: ONA";
			presenceData.state = "Pagina: 1";
		}
	} else if (document.location.pathname.startsWith("/specials")) {
		// Specials
		if (
			document.location.href.startsWith(
				"https://www.hentaiworld.eu/specials?page="
			)
		) {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: Specials";
			presenceData.state = `Pagina: ${document.location.href.replace(
				"https://www.hentaiworld.eu/specials?page=",
				""
			)}`;
		} else {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: Specials";
			presenceData.state = "Pagina: 1";
		}
	} else if (document.location.pathname.startsWith("/preview")) {
		// Preview
		if (
			document.location.href.startsWith(
				"https://www.hentaiworld.eu/preview?page="
			)
		) {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: Preview";
			presenceData.state = `Pagina: ${document.location.href.replace(
				"https://www.hentaiworld.eu/preview?page=",
				""
			)}`;
		} else {
			presenceData.smallImageKey = Assets.Search;
			presenceData.details = "Nella categoria: Preview";
			presenceData.state = "Pagina: 1";
		}
	} else if (document.location.pathname.startsWith("/watch")) {
		// End Categories
		// Hentai Episode
		[hentainame] = document.title
			.replace("HentaiWorld: ", "")
			.split(" Episodio");
		[, episodenumber] = document
			.querySelector("a#downloadLink.btn.btn-sm.btn-primary")
			.textContent.split("Ep ");
		timestamps = presence.getTimestamps(
			Math.floor(currentTime),
			Math.floor(duration)
		);
		if (iFrameVideo === true && !isNaN(duration)) {
			presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play;
			presenceData.details = `Guardando: ${hentainame}`;
			presenceData.state = paused
				? `Ep. ${episodenumber}｜In pausa`
				: `Ep. ${episodenumber}｜In riproduzione`;
			presenceData.startTimestamp = paused ? 0 : timestamps[0];
			presenceData.endTimestamp = paused ? 0 : timestamps[1];
		} else {
			presenceData.smallImageKey = Assets.Viewing;
			presenceData.details = `Sta per guardare: ${hentainame}`;
			presenceData.state = `Episodio: ${episodenumber}`;
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
