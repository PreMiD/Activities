const presence = new Presence({
		clientId: "754149249335296010",
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
			largeImageKey: "https://i.imgur.com/YWrUCdh.png",
		},
		pathname = document.location.pathname.split("/").splice(1),
		queryString = document.location.search.substring(1);
	presenceData.startTimestamp = browsingTimestamp;

	//Sets BaseUrl
	const BaseUrl = "https://jstris.jezevec10.com",
		//Inits temporary button array that is to be applied to presenceData later.
		tempButtons = new Array(0),
		//Sets button for joining.
		joinLinkArr = document.querySelectorAll(".joinLink"),
		//Sets username
		username = getUsername();

	if (joinLinkArr.length !== 0) {
		tempButtons.push({
			label: "Join",
			url: joinLinkArr[joinLinkArr.length - 1].textContent,
		});
	}
	//Sets button for viewing profile.

	if (typeof username !== "undefined") {
		tempButtons.push({
			label: "View Profile",
			url: `${BaseUrl}/u/${username}`,
		});
	}

	switch (pathname[0]) {
		//Play Modes
		case "":
			presenceData.smallImageKey = Assets.Play;
			presenceData.smallImageText = "Ingame...";
			if (queryString) {
				const queryObj = parseQuery(queryString);
				switch (queryObj.play) {
					case "1":
						presenceData.details = "Sprint";
						if (queryObj.rule) presenceData.state = "Special Ruleset";
						else presenceData.state = sprintLineMode(queryObj.mode);

						break;
					case "2":
						presenceData.details = "Practice";
						break;
					case "3":
						presenceData.details = "Cheese Race";
						break;
					case "4":
						presenceData.details = "Survival";
						break;
					case "5":
						presenceData.details = "Ultra";
						break;
					case "6":
						presenceData.details = "Playing Custom Map";
						presenceData.state = `Map ID: ${queryObj.map}`;
						if (tempButtons.length !== 2) {
							tempButtons.unshift({
								label: "Play Map",
								url: `${BaseUrl}/?play=6&map=${queryObj.map}`,
							});
						}
						break;
					case "7":
						presenceData.details = "20TSD";
						break;
					case "8":
						presenceData.details = "PC Mode";
						break;
				}
			} else presenceData.details = "Live";

			break;
		//Leaderboards
		case "sprint":
			presenceData.details = leaderboardText("Sprint");
			break;
		case "cheese":
			presenceData.details = leaderboardText("Cheese Race");
			break;
		case "survival":
			presenceData.details = leaderboardText("Survival");
			break;
		case "ultra":
			presenceData.details = leaderboardText("Ultra");
			break;
		case "20TSD":
			presenceData.details = leaderboardText("20TSD");
			break;
		case "PC-mode":
			presenceData.details = leaderboardText("PC Mode");
			break;
		//Maps
		case "maps":
			presenceData.details = "Browsing Maps";
			break;
		case "map":
			presenceData.details = `Viewing Map: ${
				document.querySelector("h1").textContent
			}`;
			presenceData.state = `Map ID: ${pathname[1]}`;
			break;
		//User
		case "u":
			presenceData.details = `Viewing User: ${pathname[1]}`;
			presenceData.state =
				document.querySelector<HTMLElement>(".col-md-8").textContent;
			break;
		default:
			//Idle
			presenceData.details = "Idling";
			break;
	}

	//Sets the buttons:
	if (tempButtons.length !== 0 && tempButtons.length <= 2)
		presenceData.buttons = tempButtons as [ButtonData, ButtonData?];

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});

function getUsername() {
	try {
		return document
			.querySelectorAll(".navbar-right")[0]
			.querySelectorAll(".dropdown-toggle")[1]
			.textContent.replace(/\n/g, "");
	} catch (err) {
		return;
	}
}

function parseQuery(search: string) {
	return JSON.parse(
		`{"${search.replaceAll("&", '","').replaceAll("=", '":"')}"}`,
		function (key, value) {
			return key === "" ? value : decodeURIComponent(value);
		}
	);
}

function leaderboardText(innerText: string) {
	return `Browsing ${innerText} Leaderboards`;
}

function sprintLineMode(mode: string) {
	switch (mode) {
		case "1":
			return "40 Lines";
			break;
		case "2":
			return "20 Lines";
			break;
		case "3":
			return "100 Lines";
			break;
		case "4":
			return "1000 Lines";
			break;
	}
}
