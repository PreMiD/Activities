var presence = new Presence({
    clientId: "758753662079729764"
})

var browsingStamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
    const presenceData: PresenceData = {
		largeImageKey: "icon"
	};
    
	if (document.location.hostname == "milkandcookies.games") {
		if (document.location.pathname == "/") {
			presenceData.startTimestamp = browsingStamp;
			presenceData.details = "Viendo la página principal";
		}
		else if (document.location.pathname.includes("/awards")) {
			presenceData.startTimestamp = browsingStamp;
			presenceData.details = "Viendo la sección de Awards"
		}
	}
	if (presenceData.details == null) {
		presence.setTrayTitle();
		presence.setActivity();
	}
	else {
		presence.setActivity(presenceData);
	}
});