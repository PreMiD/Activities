const presence = new Presence({
		clientId: "768437292486361129",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", () => {
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/VshdY7t.png"
		startTimestamp: browsingTimestamp,
	};

	if (document.location.hostname === "hacktoberfest.digitalocean.com") {
		if (document.location.pathname.includes("/faq")) {
			presenceData.details = "Reading Page:";
			presenceData.state = "FAQ";
		} else if (document.location.pathname.includes("/profile")) {
			presenceData.details = "Viewing Page:";
			presenceData.state = "Checking Profile";
		} else if (document.location.pathname.includes("/details")) {
			presenceData.details = "Reading Page:";
			presenceData.state = "Resources";
		} else if (document.location.pathname.includes("/events")) {
			presenceData.details = "Viewing Page:";
			presenceData.state = "All events";
		} else if (document.location.pathname.includes("/eventkit")) {
			presenceData.details = "Viewing Page:";
			presenceData.state = "Event Organizer Kit";
		} else if (document.location.pathname.includes("/updates")) {
			presenceData.details = "Reading Page:";
			presenceData.state = "Hacktoberfest Update";
		} else if (document.location.pathname.includes("/login")) {
			presenceData.details = "Viewing Page:";
			presenceData.state = "Login";
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
