const presence = new Presence({
	clientId: "1191450515670843533",
});

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			details: "Где-то на сайте",
			largeImageKey: "https://i.imgur.com/0gTpbcv.png",
		},
		contentType = document
			.querySelector("meta[property='og:url']")
			.getAttribute("content")
			.split("/")[3],
		currentType =
			contentType === "films"
				? "фильм"
				: contentType === "series"
				? "сериал"
				: contentType === "cartoons"
				? "мультфильм"
				: "чего-то";

	if (document.location.pathname === "/")
		presenceData.details = "На главной странице";

	if (
		document.location.pathname === "/films" ||
		document.location.pathname === "/series" ||
		document.location.pathname === "/cartoons" ||
		document.location.pathname.match(/\/(films|series|cartoons)\//)
	) {
		if (document.location.pathname.match(/\/(films|series|cartoons)\/.+/)) {
			presenceData.details = `Смотрит ${currentType}`;
			presenceData.state = `${
				document.querySelector(".b-post__title h1").textContent
			}`;
			presenceData.largeImageKey =
				document.querySelector<HTMLImageElement>(".b-sidecover a img").src;
			presenceData.smallImageKey = "https://i.imgur.com/0gTpbcv.png";
			presenceData.buttons = [
				{
					label: "Открыть страницу",
					url: document
						.querySelector("meta[property='og:url']")
						.getAttribute("content"),
				},
			];
		} else {
			presenceData.details = `Ищет ${currentType}`;
			presenceData.smallImageKey =
				"https://cdn.discordapp.com/app-assets/1191450515670843533/1191452075100479498.png?size=512";
		}
	}
	presence.setActivity(presenceData);
});
