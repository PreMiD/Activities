const presence = new Presence({
		clientId: "1066684228726698014",
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
			largeImageKey: "https://i.imgur.com/f3zxOuL.png",
			startTimestamp: browsingTimestamp,
		},
		{ pathname } = document.location,
		title =
			document.querySelector('[class="b-b-title center"]') ??
			document.querySelector('[itemprop="name"]'),
		search = document.querySelector<HTMLInputElement>('[name="ystext"]'),
		mangaTitle = document
			.querySelector("#the_manga_title")
			?.textContent.split(":"),
		video = document.querySelector<HTMLVideoElement>(
			'[id="my-player_html5_api"]'
		),
		name = document.querySelector("#dle-content > div > h1 > span");

	switch (true) {
		case !!search?.value:
			presenceData.details = "Ищет по запросу";
			presenceData.state = `«${search.value}»`;
			break;
		case pathname === "/":
			presenceData.details = "На домашней странице";
			break;
		case pathname === "/pm/":
			presenceData.details = "Просматривает сообщения";
			break;
		case !!pathname.match(/read-[0-9]*/gm):
			presenceData.details = "Учавствует в переписке";
			break;
		case !!pathname.match(/\/user\//):
			presenceData.details = "Смотрит профиль";
			presenceData.state = pathname.split("/")[2].replace(/\+/g, " ");
			break;
		case !!pathname.match(/\/rewards\//):
			presenceData.details = "Смотрит награды пользователя";
			presenceData.state = pathname.split("/")[2].replace(/\+/g, " ");
			break;
		case !!pathname.match(/\/tests\//):
			presenceData.details = "Проходит тест";
			break;
		case pathname === "/anime/":
			presenceData.details = "Смотрит список аниме";
			break;
		case pathname === "/manga/":
			presenceData.details = "Смотрит список манги Наруто";
			break;
		case pathname === "/novels/":
			presenceData.details = "Смотрит список новелл";
			break;
		case !!mangaTitle:
			presenceData.details = `Читает мангу «${mangaTitle[0]}»`;
			presenceData.state = mangaTitle[1];
			break;
		case !!video: {
			delete presenceData.startTimestamp;

			if (!video.paused && !isNaN(Number(video.duration))) {
				presenceData.endTimestamp = presence.getTimestampsfromMedia(video)[1];
				presenceData.smallImageKey = Assets.Play;
				presenceData.smallImageText = "Воспроизводится";
			} else {
				delete presenceData.endTimestamp;
				presenceData.smallImageKey = Assets.Pause;
				presenceData.smallImageText = "Приостановлено";
			}
			const titles = name.textContent
				.replace(/смотреть\s/i, "")
				.replace(/([0-9]* сезон)?\s?[0-9]* серия|[0-9] фильм/g, "")
				.trim();
			presenceData.details = `Смотрит аниме «${titles}»`;
			presenceData.state = name.textContent
				.replace(/смотреть\s/i, "")
				.replace(titles, "");
			break;
		}
		case !!title:
			presenceData.details = "Смотрит страницу аниме";
			presenceData.state = title.attributes.getNamedItem("content").value;
	}
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
