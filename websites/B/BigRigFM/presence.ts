const presence = new Presence({
		clientId: "985821439829622825",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);
presence.on("UpdateData", () => {
	const presenceData: PresenceData = {
		largeImageKey: "brfmlogo",
		startTimestamp: browsingTimestamp,
	},
	spotifyUrl = document
		.querySelector(".player-artist-text a")
		.getAttribute("href");

	presenceData.details = `${
		document.querySelector(".player-artist-text").textContent
	} - ${document.querySelector(".player-title-text").textContent}`;
	presenceData.state = document.querySelector(".live-name").textContent
		? document.querySelector(".live-name").textContent
		: "AutoDJ";

	presenceData.buttons = [
		{
			label: "Tune into BRFM",
			url: "https://bigrig.fm/listen",
		},
	];

	if (spotifyUrl) {
		presenceData.buttons.push({
			label: "Listen on Spotify",
			url: spotifyUrl,
		});
	}

	presence.setActivity(presenceData);
});
