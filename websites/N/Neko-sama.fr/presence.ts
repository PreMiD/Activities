const presence = new Presence({
	clientId: "1014298173314961481",
});

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

interface Video {
	time: number;
	duration: number;
	paused: boolean;
}

function timeToString(nbr: number): string {
	let nbrCopy = nbr,
		nbrString = "",
		quotient = 0,
		remainder = 0;
	if (nbrCopy >= 3600) {
		quotient = Math.floor(nbrCopy / 3600);
		if (isNaN(quotient)) quotient = 0;
		remainder = nbrCopy % 3600;
		if (quotient > 9) nbrString += `${quotient.toString()}:`;
		else nbrString += `0${quotient.toString()}:`;

		nbrCopy = remainder;
	}
	quotient = Math.floor(nbrCopy / 60);
	if (isNaN(quotient)) quotient = 0;
	remainder = nbrCopy % 60;
	if (quotient > 9) nbrString += `${quotient.toString()}:`;
	else nbrString += `0${quotient.toString()}:`;

	nbrCopy = remainder;
	if (isNaN(nbrCopy)) nbrCopy = 0;
	if (nbrCopy > 9) nbrString += nbrCopy.toString();
	else nbrString += `0${nbrCopy.toString()}`;

	return nbrString;
}

let video: Video = null;

presence.on("iFrameData", (data: Video) => {
	video = data;
});

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/xC6MpG3.png",
			details: "Navigue sur Neko-sama",
		},
		{ pathname } = document.location,
		pathSplit = pathname.split("/");

	switch (pathSplit[1]) {
		case "anime":
			switch (pathSplit[2]) {
				case "episode": {
					const episodeImage: string = document.querySelector<HTMLMetaElement>(
						'meta[property="og:image"]'
					).content;
					if (video === null) {
						presenceData.details = `Regarde ${
							document.querySelector<HTMLMetaElement>(
								'meta[property="og:title"]'
							).content
						}`;
						presenceData.largeImageKey =
							episodeImage ===
							"https://neko-sama.fr/images/default_thumbnail.png"
								? "nekosama-icon"
								: episodeImage;
						presenceData.buttons = [
							{
								label: "Voir Épisode",
								url: document.URL,
							},
						];
						break;
					}
					const { paused, time, duration } = video;
					if (!paused) {
						const timestamps = presence.getTimestamps(time, duration);
						presenceData.startTimestamp = timestamps[0];
						presenceData.endTimestamp = timestamps[1];
					}
					presenceData.state = `${timeToString(
						Math.floor(time)
					)}/${timeToString(Math.floor(duration))}`;
					presenceData.details = `Regarde ${
						document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
							.content
					}`;
					presenceData.largeImageKey =
						episodeImage === "https://neko-sama.fr/images/default_thumbnail.png"
							? "nekosama-icon"
							: episodeImage;
					presenceData.smallImageKey = paused ? "pause" : "play";
					presenceData.smallImageText = paused
						? "En pause"
						: "Lecture en cours";
					presenceData.buttons = [
						{
							label: "Voir Épisode",
							url: document.URL,
						},
					];
					break;
				}
				case "info": {
					const animeImage: string = document.querySelector<HTMLMetaElement>(
						'meta[property="og:image"]'
					).content;
					presenceData.details = "Regarde la page d'un animé :";
					presenceData.state =
						document.querySelector("h1").firstChild.textContent;
					presenceData.largeImageKey =
						animeImage === "https://neko-sama.fr/images/default_thumbnail.png"
							? "nekosama-icon"
							: animeImage;
					presenceData.buttons = [
						{
							label: "Voir Animé",
							url: document.URL,
						},
					];
					break;
				}
				default:
					presenceData.details = "Cherche un animé en VOSTFR";
					break;
			}
			break;
		case "anime-vf":
			presenceData.details = "Cherche un animé en VF";
			break;
	}

	presence.setActivity(presenceData);
});
