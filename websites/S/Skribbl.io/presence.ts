const presence = new Presence({
	clientId: "808664560936026122"
});
async function getStrings() {
	return presence.getStrings(
		{
			buttonJoinGame: "kahoot.buttonJoinGame",
			viewHome: "general.viewHome"
		},
		await presence.getSetting("lang").catch(() => "en")
	);
}

let strings = getStrings(),
	oldLang: string = null;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "logo"
		},
		inGame =
			document.querySelector("#containerGamePlayers").textContent === ""
				? false
				: true,
		inLobby =
			document.querySelector("#round").textContent === "" ? false : true,
		buttons = await presence.getSetting("buttons"),
		newLang = await presence.getSetting("lang").catch(() => "en");

	oldLang ??= newLang;
	if (oldLang !== newLang) {
		oldLang = newLang;
		strings = getStrings();
	}

	if (inGame && !inLobby) {
		const round = document.querySelector("#round").textContent;
		presenceData.details = round;
		if (buttons) {
			presenceData.buttons = [
				{
					label: (await strings).buttonJoinGame.replace(": {0}", ""),
					url: document.location.href
				}
			];
		}
		presenceData.startTimestamp = Math.floor(Date.now() / 1000);
	} else presenceData.details = (await strings).viewHome;
	presence.setActivity(presenceData);
});
