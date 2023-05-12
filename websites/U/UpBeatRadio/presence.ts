const presence = new Presence({
		clientId: "682781181863133220",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

enum Assets {
	Play = "https://i.imgur.com/q57RJjs.png",
	Pause = "https://i.imgur.com/mcEXiZk.png",
	Stop = "https://i.imgur.com/aLYu3Af.png",
	Search = "https://i.imgur.com/B7FxcD4.png",
	Question = "https://i.imgur.com/pIIJniP.png",
	Live = "https://i.imgur.com/0HVm46z.png",
	Reading = "https://i.imgur.com/5m10TTT.png",
	Writing = "https://i.imgur.com/Pa00qZh.png",
	Call = "https://i.imgur.com/PFdbnIf.png",
	Vcall = "https://i.imgur.com/6wG9ZvM.png",
	Downloading = "https://i.imgur.com/ryrDrz4.png",
	Uploading = "https://i.imgur.com/SwNDR5U.png",
	Repeat = "https://i.imgur.com/Ikh95KU.png",
	RepeatOne = "https://i.imgur.com/wh885z3.png",
	Premiere = "https://i.imgur.com/Zf8FSUR.png",
	PremiereLive = "https://i.imgur.com/yC4j9Lg.png",
	Viewing = "https://i.imgur.com/fpZutq6.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/xFz6AU3.png",
		},
		[format1, format2, elapsed, format, info, dj] = await Promise.all([
			presence.getSetting<string>("sFormatNoDj1"),
			presence.getSetting<string>("sFormatNoDj2"),
			presence.getSetting<boolean>("tElapsed"),
			presence.getSetting<string>("sFormat"),
			presence.getSetting<boolean>("sInfo"),
			presence.getSetting<boolean>("sDJ"),
		]);
	let djType;

	if (elapsed) presenceData.startTimestamp = browsingTimestamp;

	if (info) {
		if (document.location.pathname.includes("/UpBeat.Home")) {
			if (
				document
					.querySelector("#radioPlayer > span > i")
					.className.includes("fa-play")
			) {
				presenceData.details = "Viewing the main page...";
				presenceData.smallImageKey = Assets.Pause;
				presenceData.smallImageText = format
					.replace("%song%", document.querySelector(".stats-song").textContent)
					.replace(
						"%artist%",
						document.querySelector(".stats-artist").textContent
					);
			} else {
				if (document.querySelector(".stats-djName").textContent === "UpBeat")
					djType = "AutoDJ - ";
				else djType = "DJ: ";

				presenceData.smallImageKey = Assets.Play;

				if (dj) {
					presenceData.details = format
						.replace(
							"%song%",
							document.querySelector(".stats-song").textContent
						)
						.replace(
							"%artist%",
							document.querySelector(".stats-artist").textContent
						);
					presenceData.state =
						djType + document.querySelector(".stats-djName").textContent;
				} else {
					presenceData.details = format1
						.replace(
							"%song%",
							document.querySelector(".stats-song").textContent
						)
						.replace(
							"%artist%",
							document.querySelector(".stats-artist").textContent
						);
					presenceData.state = format2
						.replace(
							"%song%",
							document.querySelector(".stats-song").textContent
						)
						.replace(
							"%artist%",
							document.querySelector(".stats-artist").textContent
						);
				}
			}
		} else if (document.location.pathname.includes("/News.Article")) {
			presenceData.details = `Reading article: ${document
				.querySelector("#newsTitle")
				.textContent.trim()}`;
			presenceData.state = `Written by: ${document
				.querySelector("#newsInfo > a")
				.textContent.trim()}`;
			presenceData.smallImageKey = Assets.Reading;
		} else if (document.location.pathname.includes("/Account.Profile")) {
			presenceData.details = "Viewing profile of:";
			presenceData.state = document.querySelector(
				".profileName > span"
			).textContent;
			presenceData.smallImageKey = Assets.Reading;
		} else if (document.location.pathname.includes("/Account.Settings")) {
			presenceData.details = "Changing their settings...";
			presenceData.smallImageKey = Assets.Writing;
		} else if (document.location.pathname.includes("/Radio.RecentlyPlayed")) {
			presenceData.details = "Viewing the";
			presenceData.state = "recently played songs";
			presenceData.smallImageKey = Assets.Reading;
		} else if (document.location.pathname.includes("Radio.SongProfile")) {
			presenceData.details = "Viewing song";
			presenceData.state = `${
				document.querySelector(
					"#mainContent > div > div:nth-child(1) > div > div.row.equal.p-md.d-flex > div.col-md-9 > div.infoContainer > div > div.song"
				).textContent
			} by ${
				document.querySelector(
					"#mainContent > div > div:nth-child(1) > div > div.row.equal.p-md.d-flex > div.col-md-9 > div.infoContainer > div > div.artist"
				).textContent
			}`;
		} else if (document.location.pathname.includes("/UpBeat.AboutUs")) {
			presenceData.details = "Reading about UpBeat";
			presenceData.smallImageKey = Assets.Reading;
		} else if (document.location.pathname.includes("/UpBeat.OurAffiliates")) {
			presenceData.details = "Viewing the";
			presenceData.state = "UpBeat affiliates";
			presenceData.smallImageKey = Assets.Reading;
		} else if (document.location.pathname.includes("/Community.Members")) {
			let type = document
				.querySelector("#mainContent > div.m-b-md.m-t-sm > ul > .active > a")
				.textContent.toLowerCase();
			if (type === "vip's") type = "VIP";
			presenceData.details = "Viewing the";
			presenceData.state = `${type} members`;
			presenceData.smallImageKey = Assets.Reading;
		} else if (document.querySelector(".bigTitle")) {
			let type = document.querySelector(".bigTitle").textContent.toLowerCase();
			if (type === "faq's") type = "FAQ's";
			if (type === "all media") type = "Articles List";
			presenceData.details = "Viewing the";
			presenceData.state = type;
			presenceData.smallImageKey = Assets.Reading;
		}

		if (document.querySelector("#modalrequestFormModal")) {
			presenceData.details = "Sending in a request...";
			presenceData.smallImageKey = Assets.Writing;
		} else if (document.querySelector("#modalundefined")) {
			presenceData.details = "Sending in feedback...";
			presenceData.smallImageKey = Assets.Writing;
		} else if (document.querySelector("#modaldjAppButton")) {
			presenceData.details = "Applying for:";
			presenceData.state = "Radio Presenter";
			presenceData.smallImageKey = Assets.Writing;
		} else if (document.querySelector("#modalmediaAppButton")) {
			presenceData.details = "Applying for:";
			presenceData.state = "News Reporter";
			presenceData.smallImageKey = Assets.Writing;
		} else if (document.querySelector("#accountBio")) {
			presenceData.details = "Editing their bio";
			presenceData.smallImageKey = Assets.Writing;
		} else if (document.querySelector("#modalcontactUsButton")) {
			presenceData.details = "Sending in a";
			presenceData.state = "general enquiry";
			presenceData.smallImageKey = Assets.Writing;
		} else if (document.querySelector("#modalpartnerEnquiryButton")) {
			presenceData.details = "Sending in a";
			presenceData.state = "partner enquiry";
			presenceData.smallImageKey = Assets.Writing;
		}
	} else {
		if (document.querySelector(".stats-djName").textContent === "UpBeat")
			djType = "AutoDJ - ";
		else djType = "DJ: ";

		if (dj) {
			presenceData.details = format
				.replace("%song%", document.querySelector(".stats-song").textContent)
				.replace(
					"%artist%",
					document.querySelector(".stats-artist").textContent
				);
			presenceData.state =
				djType + document.querySelector(".stats-djName").textContent;
		} else {
			presenceData.details = format1
				.replace("%song%", document.querySelector(".stats-song").textContent)
				.replace(
					"%artist%",
					document.querySelector(".stats-artist").textContent
				);
			presenceData.state = format2
				.replace("%song%", document.querySelector(".stats-song").textContent)
				.replace(
					"%artist%",
					document.querySelector(".stats-artist").textContent
				);
		}

		presenceData.smallImageKey = Assets.Play;
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
