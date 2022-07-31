const presence = new Presence({
		clientId: "1003092862285651968",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		startTimestamp: browsingTimestamp,
		largeImageKey: "https://i.imgur.com/SUZJZEX.png",
	};
	if (document.location.pathname === "/")
		presenceData.details = "Viewing the home page";
	else if (document.location.pathname.startsWith("/games/")) {
		if (document.location.pathname.includes("/lib/")) {
			presenceData.details = "Viewing popular games";
		} else {
			presenceData.details = `Viewing ${document
				.querySelector("#game-profile h1")
				.textContent.trim()}`;
			presenceData.state = `Made by ${document
				.querySelectorAll("#game-profile #game-body .sub-title a")[1]
				.textContent.trim()}`;
		}
	} else if (document.location.pathname.includes("/search/")) {
		presenceData.details = `Searching 🔎`;
		presenceData.state = `${document
			.querySelector("#search-title h1")
			.textContent.trim()}`;
	} else if (document.location.pathname.includes("/about/"))
		presenceData.details = "Viewing the about page";
	else if (document.location.pathname.includes("/settings/"))
		presenceData.details = "Editing their profile/account settings";
	else if (document.location.pathname.includes("/changelog/"))
		presenceData.details = "Viewing the Changelog";
	else if (document.location.pathname.includes("/contact/"))
		presenceData.details = "Viewing the contact form";
	else if (document.location.pathname.includes("/roadmap/"))
		presenceData.details = "Viewing the Backloggd Roadmap";
	else if (document.location.pathname.includes("/backers/"))
		presenceData.details = "Viewing the Supporters Page";
	else if (document.location.pathname.startsWith("/about/")) {
		if (document.location.pathname.endsWith("terms-of-service"))
			presenceData.details = "Viewing the Terms of Service";
		else if (document.location.pathname.endsWith("privacy"))
			presenceData.details = "Viewing the Privacy Policy";
	} else if (document.location.pathname.startsWith("/users/")) {
		if (document.location.pathname.endsWith("sign_in"))
			presenceData.details = "Signing In";
		else if (document.location.pathname.endsWith("sign_up"))
			presenceData.details = "Signing Up";
		else if (document.location.pathname.endsWith("password/new"))
			presenceData.details = "Resetting Password";
	} else if (document.location.pathname.startsWith("/u/")) {
		presenceData.details = `Viewing ${document
			.querySelector("#profile-header h3")
			.textContent.trim()}'s Profile`;
		presenceData.largeImageKey = `${
			document.querySelector<HTMLImageElement>("#profile-header img").src
		}`;
	} else {
		presenceData.details = "Viewing an unsupported page.";
	}
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
