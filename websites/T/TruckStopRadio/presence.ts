const presence = new Presence({
		clientId: "854817731161489449"
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000),
	dj = document.querySelector("#presenter-name") as HTMLElement;

let title: HTMLElement, artist: HTMLElement, player: HTMLAudioElement;

presence.on("UpdateData", async () => {
	player = document.querySelector(".uil-pause");
	title = document.querySelector("#song-title");
	artist = document.querySelector("#song-artist");

	const presenceData: PresenceData = {
		largeImageKey: "largelogo"
	};

	if (player) {
		presenceData.startTimestamp = browsingTimestamp;
		presenceData.details = `Listening to ${title.textContent} by ${artist.textContent}`;
		presenceData.state = `Presented by ${dj.textContent}`;
		presence.setActivity(presenceData);
	} else if (document.location.pathname === "/home") {
		presenceData.startTimestamp = browsingTimestamp;
		presenceData.details = "Viewing";
		presenceData.state = "Recently Played";
		presenceData.smallImageKey = "reading";
		presence.setActivity(presenceData);
	} else if (document.location.pathname === "/timetable") {
		presenceData.startTimestamp = browsingTimestamp;
		presenceData.details = "Viewing";
		presenceData.state = "Timetable";
		presenceData.smallImageKey = "reading";
		presence.setActivity(presenceData);
	} else if (document.location.pathname === "/team") {
		presenceData.startTimestamp = browsingTimestamp;
		presenceData.details = "Viewing";
		presenceData.state = "Team Page";
		presenceData.smallImageKey = "reading";
		presence.setActivity(presenceData);
	} else if (document.location.pathname === "/applications") {
		presenceData.startTimestamp = browsingTimestamp;
		presenceData.details = "Viewing";
		presenceData.state = "Apply to become a presenter";
		presenceData.smallImageKey = "reading";
		presence.setActivity(presenceData);
	} else if (document.location.pathname === "/contact") {
		presenceData.startTimestamp = browsingTimestamp;
		presenceData.details = "Viewing";
		presenceData.state = "Contact Page";
		presenceData.smallImageKey = "reading";
		presence.setActivity(presenceData);
	}
});
