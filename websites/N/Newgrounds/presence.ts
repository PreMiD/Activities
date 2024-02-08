const presence = new Presence({
		clientId: "779342189884997633",
	}),
	getTime = (list: string[]): number => {
		let ret = 0;
		for (let index = list.length - 1; index >= 0; index--)
			ret += parseInt(list[index]) * 60 ** index;

		return ret;
	},
	getTimestamps = (audioTime: string, audioDuration: string): number[] => {
		const startTime = Date.now();
		return [
			Math.floor(startTime / 1000),
			Math.floor(startTime / 1000) -
				getTime(audioTime.split(":").reverse()) +
				getTime(audioDuration.split(":").reverse()),
		];
	};

let lastGameChange: number = null,
	lastGame: string = null;

const enum Assets {
	Logo = "https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/logo.jpeg",
	Art = "https://cdn.discordapp.com/app-assets/779342189884997633/779363780319641680.png?size=512",
	Audio = "https://cdn.discordapp.com/app-assets/779342189884997633/779363780349132830.png?size=512",
	Movies = "https://cdn.discordapp.com/app-assets/779342189884997633/779363780504977428.png?size=512",
	Fav = "https://cdn.discordapp.com/app-assets/779342189884997633/779363780605378560.png?size=512",
	AudioPlay = "https://cdn.discordapp.com/app-assets/779342189884997633/779363780709842995.png?size=512",
	AudioPause = "https://cdn.discordapp.com/app-assets/779342189884997633/779363780818763846.png?size=512",
	PM = "https://cdn.discordapp.com/app-assets/779342189884997633/779363780819025920.png?size=512",
	Forum = "https://cdn.discordapp.com/app-assets/779342189884997633/779363802956693545.png?size=512",
	Games = "https://cdn.discordapp.com/app-assets/779342189884997633/779364961558200340.png?size=512",
	MoviesPause = "https://cdn.discordapp.com/app-assets/779342189884997633/779366488745836564.png?size=512",
	MoviesPlay = "https://cdn.discordapp.com/app-assets/779342189884997633/779366488750293042.png?size=512",
	GamesPlay = "https://cdn.discordapp.com/app-assets/779342189884997633/779366488800755783.png?size=512",
	User = "https://cdn.discordapp.com/app-assets/779342189884997633/779372962561392650.png?size=512",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
		},
		itemName = document.querySelector('[itemprop="name"]')
			? document.querySelector('[itemprop="name"]').textContent
			: null,
		buttons = await presence.getSetting<boolean>("buttons");

	if (location.hostname !== "www.newgrounds.com") {
		const userName = document.querySelector(".user-link").textContent;
		presenceData.details = "Viewing a user's profile";
		presenceData.smallImageKey = Assets.User;
		presenceData.smallImageText = "User Profile";

		if (await presence.getSetting<boolean>("showprofilename")) {
			presenceData.state = userName.length < 2 ? `User: ${userName}` : userName;
			if (buttons) {
				presenceData.buttons = [
					{
						label: "View Profile",
						url: location.origin,
					},
				];
			}
		}

		if (document.location.pathname.startsWith("/fans"))
			presenceData.details = "Viewing a user's fans";
		else if (document.location.pathname.startsWith("/news"))
			presenceData.details = "Viewing a user's news posts";
		else if (document.location.pathname.startsWith("/movies"))
			presenceData.details = "Viewing a user's movies";
		else if (document.location.pathname.startsWith("/art"))
			presenceData.details = "Viewing a user's art";
		else if (document.location.pathname.startsWith("/games"))
			presenceData.details = "Viewing a user's games";
		else if (document.location.pathname.startsWith("/audio"))
			presenceData.details = "Viewing a user's audio";
		else if (document.location.pathname.startsWith("/favorites"))
			presenceData.details = "Viewing a user's faves";
		else if (document.location.pathname.startsWith("/reviews"))
			presenceData.details = "Viewing a user's reviews";
		else if (document.location.pathname.startsWith("/trophies"))
			presenceData.details = "Viewing a user's trophies";
	} else if (document.location.pathname.startsWith("/movies")) {
		presenceData.details = "Browsing movies";
		presenceData.smallImageKey = Assets.Movies;
		presenceData.smallImageText = "Movies";
	} else if (document.location.pathname.startsWith("/games")) {
		presenceData.details = "Browsing games";
		presenceData.smallImageKey = Assets.Games;
		presenceData.smallImageText = "Games";
	} else if (document.location.pathname.startsWith("/audio")) {
		presenceData.details = "Browsing audio";
		presenceData.smallImageKey = Assets.Audio;
		presenceData.smallImageText = "Audio";
		if (document.location.pathname.startsWith("/audio/listen")) {
			presenceData.details = "Listening to audio";
			if (await presence.getSetting<boolean>("itemname")) {
				presenceData.state = `${itemName} by ${document
					.querySelector(".item-details-main")
					.textContent.trim()}`;
				if (buttons) {
					presenceData.buttons = [
						{
							label: "Listen",
							url: document.URL,
						},
					];
				}
			}
			presenceData.smallImageKey = Assets.AudioPause;
			presenceData.smallImageText = "Audio - Paused";
			if (
				document.querySelector('#audio-listen-play[style="display: none;"]')
			) {
				if (await presence.getSetting<boolean>("timestamp")) {
					[presenceData.startTimestamp, presenceData.endTimestamp] =
						getTimestamps(
							document.querySelector("#audio-listen-progress").textContent,
							document.querySelector("#audio-listen-duration").textContent
						);
				}
				presenceData.smallImageKey = Assets.AudioPlay;
				presenceData.smallImageText = "Audio - Playing";
			}
		}
	} else if (document.location.pathname.startsWith("/art")) {
		presenceData.details = "Browsing art";
		presenceData.smallImageKey = Assets.Art;
		presenceData.smallImageText = "Art";
		if (document.location.pathname.startsWith("/art/view")) {
			presenceData.details = "Viewing art";
			if (await presence.getSetting<boolean>("itemname")) {
				presenceData.state =
					itemName.length < 2 ? `Art: ${itemName}` : itemName;
				if (buttons) {
					presenceData.buttons = [
						{
							label: "View",
							url: document.URL,
						},
					];
				}
			}
		}
	} else if (document.location.pathname.startsWith("/portal")) {
		presenceData.details = "Viewing the portal";
		if (document.location.pathname.startsWith("/portal/view")) {
			switch (
				document
					.querySelector('meta[property="og:type"]')
					.getAttribute("content")
			) {
				case "movie":
					presenceData.details = "Watching a movie";
					if (await presence.getSetting<boolean>("itemname")) {
						presenceData.state =
							itemName.length < 2 ? `Movie: ${itemName}` : itemName;
						if (buttons) {
							presenceData.buttons = [
								{
									label: "Watch",
									url: document.URL,
								},
							];
						}
					}
					// Some movies might not have the NG player
					if (document.querySelector(".ng-video-player")) {
						presenceData.smallImageKey = Assets.MoviesPause;
						presenceData.smallImageText = "Movies - Paused";
						if (
							document.querySelector(
								'[data-action="play"][style="display: none;"]'
							)
						) {
							if (await presence.getSetting<boolean>("timestamp")) {
								[presenceData.startTimestamp, presenceData.endTimestamp] =
									getTimestamps(
										document.querySelector('[data-value="current-time"]')
											.textContent,
										document.querySelector('[data-value="total-time"]')
											.textContent
									);
							}
							presenceData.smallImageKey = Assets.MoviesPlay;
							presenceData.smallImageText = "Movies - Playing";
						}
					} else {
						presenceData.smallImageKey = Assets.Movies;
						presenceData.smallImageText = "Movies";
					}
					break;
				case "game":
					if (lastGame !== itemName) {
						lastGame = itemName;
						lastGameChange = Date.now();
					}
					presenceData.details = "Playing a game";
					if (await presence.getSetting<boolean>("itemname")) {
						presenceData.state =
							itemName.length < 2 ? `Game: ${itemName}` : itemName;
						if (buttons) {
							presenceData.buttons = [
								{
									label: "Play",
									url: document.URL,
								},
							];
						}
					}
					presenceData.smallImageKey = Assets.GamesPlay;
					presenceData.smallImageText = "Games - Playing";
					if (await presence.getSetting<boolean>("timestamp"))
						presenceData.startTimestamp = lastGameChange;
					break;
			}
		}
	} else if (document.location.pathname.startsWith("/bbs")) {
		presenceData.details = "Browsing the forums";
		presenceData.smallImageKey = Assets.Forum;
		presenceData.smallImageText = "Forums";
		if (document.location.pathname.startsWith("/bbs/search/author/")) {
			const [, userName] = document
				.querySelector(".pod-head > .search")
				.textContent.split('"');
			presenceData.details = "Viewing a user's posts";
			presenceData.smallImageKey = Assets.User;
			presenceData.smallImageText = "User Profile";
			if (await presence.getSetting<boolean>("showprofilename")) {
				presenceData.state =
					userName.length < 2 ? `User: ${userName}` : userName;
			}
		} else if (document.location.pathname.startsWith("/bbs/topic/")) {
			const itemName = document.querySelector(".pod-head h2").textContent;
			presenceData.details = "Viewing a forum topic";
			if (await presence.getSetting<boolean>("topicname")) {
				presenceData.state =
					itemName.length < 2 ? `Topic: ${itemName}` : itemName;
				if (buttons) {
					presenceData.buttons = [
						{
							label: "View Topic",
							url: document.URL,
						},
					];
				}
			}
		}
	} else if (document.location.pathname.startsWith("/community"))
		presenceData.details = "Browsing the community";
	else if (document.location.pathname.startsWith("/collection")) {
		presenceData.details = "Browsing collections";
		if (document.location.pathname.split("/")[2]) {
			const itemName = document.querySelector(
				".column.wide .pod-head h2"
			).textContent;
			presenceData.details = "Viewing a collection";
			if (await presence.getSetting<boolean>("itemname")) {
				presenceData.state =
					itemName.length < 2 ? `Collection: ${itemName}` : itemName;
				if (buttons) {
					presenceData.buttons = [
						{
							label: "View Collection",
							url: document.URL,
						},
					];
				}
			}
		}
	} else if (document.location.pathname.startsWith("/social"))
		presenceData.details = "Browsing their feed";
	else if (document.location.pathname.startsWith("/pm")) {
		presenceData.details = "Browsing Private Messages";
		presenceData.smallImageKey = Assets.PM;
		presenceData.smallImageText = "Private Messages";
	} else if (document.location.pathname.startsWith("/dump"))
		presenceData.details = "in Dumping Grounds";
	else if (document.location.pathname.startsWith("/playlists")) {
		presenceData.details = "Browsing playlists";
		if (document.location.pathname.startsWith("/playlists/view")) {
			const itemName = document.querySelector(
				".column.wide .pod-head h2"
			).textContent;
			presenceData.details = "Viewing a playlist";
			if (await presence.getSetting<boolean>("itemname")) {
				presenceData.state =
					itemName.length < 2 ? `Playlist: ${itemName}` : itemName;
				if (buttons) {
					presenceData.buttons = [
						{
							label: "View Playlist",
							url: document.URL,
						},
					];
				}
			}
		}
	} else if (document.location.pathname.startsWith("/chat"))
		presenceData.details = "in Newgrounds Chat";
	else if (document.location.pathname.startsWith("/downloads"))
		presenceData.details = "in Downloads page";
	else if (document.location.pathname.startsWith("/settings"))
		presenceData.details = "in Account Settings";
	else if (document.location.pathname.startsWith("/confirmation"))
		presenceData.details = "in Requests";
	else if (document.location.pathname.startsWith("/calendar"))
		presenceData.details = "Viewing the calendar";
	else if (document.location.pathname.startsWith("/rankings"))
		presenceData.details = "Viewing the rankings";
	else if (document.location.pathname.startsWith("/wiki")) {
		const [, ...subNameSplit] = document
			.querySelector(".column.wide .pod-head h2")
			.textContent.split(": ");
		presenceData.details = "in Newgrounds Wiki";
		presenceData.state = subNameSplit.join(": ");
	} else if (document.location.pathname.startsWith("/search")) {
		presenceData.details = `Searching for ${
			document.querySelector(".current").textContent
		}`;
		presenceData.smallImageKey = Assets.Search;
		presenceData.smallImageText = "Searching";
		if (await presence.getSetting<boolean>("showsearchterm")) {
			const query = new URLSearchParams(document.location.search).get("terms");
			if (query)
				presenceData.state = query.length < 2 ? `Query: ${query}` : query;
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
