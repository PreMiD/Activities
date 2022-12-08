const presence = new Presence({
		clientId: "846282107462352927",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	let presenceData: PresenceData;
	if ("mediaSession" in navigator && navigator.mediaSession.metadata !== null && !document.querySelector<HTMLAudioElement>("audio")?.paused) {
		presenceData = {
			largeImageKey: navigator.mediaSession.metadata.artwork[0].src,
			details: navigator.mediaSession.metadata.title,
			state: navigator.mediaSession.metadata.artist,
		};
	} else {
		presenceData = {
			startTimestamp: browsingTimestamp,
			largeImageKey: "https://i.imgur.com/C8eRVDU.jpg",
		};

		switch (location.pathname.replace("/", "")) {
			case "history":
				presenceData.details = "Schaut die Historie an";
				break;
			case "bots":
				presenceData.details = "Interresiert sich für die Bots";
				break;
			case "status":
				presenceData.details = "Schaut sich den Status an";
				presenceData.state = `${document.querySelectorAll("[class=\"online\"]")?.length} von ${document.querySelectorAll("[class=\"monitor\"]")?.length} Services Online`;
				break;
			case "impressum":
				presenceData.details = "Schaut sich das Impressum an";
				break;
			case "changelog":
				presenceData.details = "Schaut sich die Änderungen an";
				break;
			case "dashboard":
				presenceData.details = "Schaut sich im Dashboard um";
				break;
			case "datenschutz":
				presenceData.details = "Schaut sich den Datenschutz an";
				break;
			default:
				presenceData.details = "Durch Stöbert die Webseite";
				break;
		}
	}
	presenceData.buttons = [
		{
			label: "Listen",
			url: location.href,
		},
	];
	presence.setActivity(presenceData);

})
;
