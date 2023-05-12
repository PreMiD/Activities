/* eslint-disable no-eval */
const presence = new Presence({
		clientId: "799885664538853417",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000),
	URLMap: { [index: string]: string[] } = {
		SignUp: ['"Registering an account"', '""'],
		AccountValidation: ['"Activating account"', '""'],
		SignIn: ['"Signing in"', '""'],
		Tutorial: ['"Playing tutorial"', '""'],
		"gameUpdates.jsp:": ['"Reading the patch note"', '""'],
		Disconnect: ['"Disconnected"', '""'],
		Profile: [
			'"Viewing profile"',
			'getText(".mainContent > h2:nth-child(2)") + "(" + getText(".mainContent > p:nth-child(3) > span:nth-child(1)") + ")"',
		],
		History: ['"Viewing history"', '""'],
		Avatars: ['"Customizing avatar"', '""'],
		CardSkins: ['"Customizing card skins"', '""'],
		ProfileSkins: ['"Customizing profile skin"', '""'],
		FrameSkins: ['"Customizing frame skin"', '""'],
		Settings: ['"Viewing settings"', '""'],
		Staff: ['"Viewing staff"', '""'],
		Quests: ['"Viewing quests"', '""'],
		Bundle: ['"Viewing bundle"', '""'],
		CardSkinsShop: ['"Browsing card skins shop"', '""'],
		CosmeticsShop: ['"Browsing cosmetics shop"', '""'],
		Artifacts: ['"Browsing artifacts shop"', '""'],
		Packs: ['"Browsing packs shop"', '""'],
		Shop: ['"Browsing UCP shop"', '""'],
		Decks: ['"Building decks"', '""'],
		Crafting: ['"Crafting cards"', '""'],
		Hub: ['"Viewing hub"', '""'],
		Friendship: ['"Viewing friendship"', '""'],
		GamesList: ['"Viewing games list"', '""'],
		Play: ['"Finding a game..."'],
		Game: ['"Playing a game"', '"vs "+ getText("#enemyUsername")'],
		Spectate: [
			'"Spectating a game"',
			'(getText("#yourUsername") || "Loading...") + " vs " + (getText("#enemyUsername") || "Loading...")',
		],
	};
function getText(selector: string) {
	return document.querySelector(selector).textContent;
}

enum Assets {
	Play = "https://i.imgur.com/q57RJjs.png",
	Pause = "https://i.imgur.com/mcEXiZk.png",
	Stop = "https://i.imgur.com/aLYu3Af.png",
	Search = "https://i.imgur.com/B7FxcD4.png",
	Question = "https://i.imgur.com/pIIJniP.png",
	Live = "https://i.imgur.com/0HVm46z.png",
	Reading = "https://i.imgur.com/5m10TTT.png",
	Writing = "https://i.imgur.com/Pa00qZh.png",
	Call = "https://i.imgur.com/y4YKRZG.png",
	Vcall = "https://i.imgur.com/6wG9ZvM.png",
	Downloading = "https://i.imgur.com/ryrDrz4.png",
	Uploading = "https://i.imgur.com/SwNDR5U.png",
	Repeat = "https://i.imgur.com/Ikh95KU.png",
	RepeatOne = "https://i.imgur.com/qkODaWg.png",
	Premiere = "https://i.imgur.com/Zf8FSUR.png",
	PremiereLive = "https://i.imgur.com/yC4j9Lg.png",
	Viewing = "https://i.imgur.com/fpZutq6.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/xahtF8Y.png",
		startTimestamp: browsingTimestamp,
	};
	if (document.location.pathname === "/")
		presenceData.details = "Viewing homepage";
	else {
		const [, path] = document.location.pathname.match(
			new RegExp("^/([a-zA-Z.]+)")
		);
		if (Object.prototype.hasOwnProperty.call(URLMap, path)) {
			presenceData.details = eval(URLMap[path][0]);
			presenceData.state = eval(URLMap[path][1]);
		} else if (path.endsWith(".jsp")) {
			presenceData.details = "Viewing page";
			presenceData.state = getText(".mainContent > h2:nth-child(2)");
		} else presenceData.details = "Browsing...";
	}
	if (!presenceData.details) presence.setActivity();
	else presence.setActivity(presenceData);
});
