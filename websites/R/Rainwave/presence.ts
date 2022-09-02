const presence = new Presence({
		clientId: "618233809481236491",
	}),
	timeElapsed = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "rainwv",
	};
	if (document.location.pathname.startsWith("/pages/playback_history"))
		presenceData.details = "Looking at playback history...";
	else if (document.location.pathname.startsWith("/forums"))
		presenceData.details = "Browsing the forums...";
	else if (document.location.pathname.startsWith("/api4"))
		presenceData.details = "Looking at the API...";
	else if (
		!document.querySelector("div#r4_audio_player.unselectable.playing")
	) {
		presenceData.details = "Not listening.";
		presenceData.smallImageKey = "pause";
	} else {
		presenceData.details = `${
			document.querySelector<HTMLDivElement>(
				"div.song.now_playing > div.song_content > div.title"
			).textContent
		} by ${
			document.querySelector<HTMLDivElement>(
				"div.song.now_playing > div.song_content > div.artist"
			).textContent
		}`;
		presenceData.state = `Listening on ${
			document.querySelector(
				"a.station.selected_station > div.station_details > div.station_name"
			).textContent
		}`;
		presenceData.smallImageKey = "live";
		presenceData.startTimestamp = timeElapsed;
	}
	presence.setActivity(presenceData);
});
