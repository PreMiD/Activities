const presence = new Presence({
		clientId: "1017504807822561290",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

// TODO:
// edit history, open edits, creations, collections, annotations, etc.

presence.on("UpdateData", () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/Fty4eZ8.png",
			startTimestamp: browsingTimestamp,
		},
		{ pathname, href, search } = window.location,
		pathRegex = /^\/[\w-]+\/.*?\/(.*?)\/?$/;

	switch (pathname.split("/")[1]) {
		case "": {
			presenceData.details = "Browsing home page";
			break;
		}
		case "account": {
			presenceData.details = "Managing account preferences";
			break;
		}
		case "area": {
			const areaName = document.querySelector("bdi").textContent;
			presenceData.details = "Viewing area";
			presenceData.buttons = [
				{
					label: "View Area",
					url: href,
				},
			];
			switch ((pathname.match(pathRegex) || [])[1]) {
				case "aliases":
				case "events":
				case "labels":
				case "users":
				case "works":
				case "places":
				case "artists":
				case "releases":
				case "recordings":
				case "tags":
				case "details": {
					presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${areaName}`;
					break;
				}
				default: {
					presenceData.state = areaName;
				}
			}
			break;
		}
		case "artist": {
			const artistName = document.querySelector("bdi").textContent;
			presenceData.details = "Viewing artist";
			presenceData.buttons = [
				{
					label: "View Artist",
					url: href,
				},
			];
			switch ((pathname.match(pathRegex) || [])[1]) {
				case "works":
				case "recordings":
				case "events":
				case "relationships":
				case "aliases":
				case "tags":
				case "ratings":
				case "details":
				case "releases": {
					presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${artistName}`;
					break;
				}
				case "edit": {
					presenceData.state = "Editing artist";
					presenceData.state = artistName;
					delete presenceData.buttons;
					break;
				}
				default: {
					presenceData.state = artistName;
				}
			}
			break;
		}
		case "collection": {
			const collectionName = document.querySelector("bdi").textContent;
			presenceData.details = "Viewing label";
			if (
				!document
					.querySelector<HTMLParagraphElement>(".subheader")
					.textContent.includes("Private collection")
			) {
				presenceData.buttons = [
					{
						label: "View Collection",
						url: href,
					},
				];
			}
			switch ((pathname.match(pathRegex) || [])[1]) {
				case "edit": {
					presenceData.details = "Editing collection";
					presenceData.state = collectionName;
					delete presenceData.buttons;
					break;
				}
				default: {
					presenceData.state = collectionName;
				}
			}
			break;
		}
		case "doc": {
			presenceData.details = "Viewing documentation";
			presenceData.state = document.querySelector<HTMLAnchorElement>(
				".hierarchy-links > a"
			).textContent;
			break;
		}
		case "event": {
			const eventName = document.querySelector("bdi").textContent;
			presenceData.details = "Viewing event";
			presenceData.buttons = [
				{
					label: "View Event",
					url: href,
				},
			];
			switch ((pathname.match(pathRegex) || [])[1]) {
				case "aliases":
				case "tags":
				case "ratings":
				case "details": {
					presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${eventName}`;
					break;
				}
				case "edit": {
					presenceData.details = "Editing event";
					presenceData.state = eventName;
					delete presenceData.buttons;
					break;
				}
				case "edit_annotation": {
					presenceData.details = "Editing event annotation";
					presenceData.state = eventName;
					delete presenceData.buttons;
					break;
				}
				default: {
					presenceData.state = eventName;
				}
			}
			break;
		}
		case "genre": {
			const genreName = document.querySelector("bdi").textContent;
			presenceData.details = "Viewing genre";
			presenceData.buttons = [
				{
					label: "View Genre",
					url: href,
				},
			];
			switch ((pathname.match(pathRegex) || [])[1]) {
				case "aliases":
				case "details": {
					presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${genreName}`;
					break;
				}
				default: {
					presenceData.state = genreName;
				}
			}
			break;
		}
		case "instrument": {
			const instrumentName = document.querySelector("bdi").textContent;
			presenceData.details = "Viewing instrument";
			presenceData.buttons = [
				{
					label: "View Instrument",
					url: href,
				},
			];
			switch ((pathname.match(pathRegex) || [])[1]) {
				case "aliases":
				case "artists":
				case "releases":
				case "recordings":
				case "tags":
				case "details": {
					presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${instrumentName}`;
					break;
				}
				default: {
					presenceData.state = instrumentName;
				}
			}
			break;
		}
		case "label": {
			const labelName = document.querySelector("bdi").textContent;
			presenceData.details = "Viewing label";
			presenceData.buttons = [
				{
					label: "View Label",
					url: href,
				},
			];
			switch ((pathname.match(pathRegex) || [])[1]) {
				case "aliases":
				case "tags":
				case "relationships":
				case "ratings":
				case "details": {
					presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${labelName}`;
					break;
				}
				case "edit": {
					presenceData.details = "Editing label";
					presenceData.state = labelName;
					delete presenceData.buttons;
					break;
				}
				case "annotations": {
					presenceData.details = "Viewing annotation history";
					presenceData.state = labelName;
					delete presenceData.buttons;
					break;
				}
				case "edit_annotation": {
					presenceData.details = "Editing label annotation";
					presenceData.state = labelName;
					delete presenceData.buttons;
					break;
				}
				default: {
					presenceData.state = labelName;
				}
			}
			break;
		}
		case "recording": {
			const recordingName = document.querySelector("bdi").textContent;
			presenceData.details = "Viewing recording";
			presenceData.smallImageKey = "https://i.imgur.com/ybpozZ6.png";
			presenceData.smallImageText = `Artist: '${
				document.querySelector(".artist bdi")?.textContent
			}' Length: ${
				document.querySelector<HTMLDivElement>(".length")?.textContent
			}`;
			presenceData.buttons = [
				{
					label: "View Recording",
					url: href,
				},
			];
			switch ((pathname.match(pathRegex) || [])[1]) {
				case "fingerprints":
				case "aliases":
				case "tags":
				case "reviews":
				case "details": {
					presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${recordingName}`;
					break;
				}
				case "edit": {
					presenceData.details = "Editing release";
					presenceData.state = recordingName;
					delete presenceData.buttons;
					break;
				}
				default: {
					presenceData.state = recordingName;
				}
			}
			break;
		}
		case "release": {
			const releaseName = document.querySelector("bdi").textContent,
				coverArtImage = document.querySelector<HTMLImageElement>(
					".cover-art-image > img"
				);
			presenceData.details = "Viewing release";
			presenceData.buttons = [
				{
					label: "View Release",
					url: href,
				},
			];
			if (coverArtImage) presenceData.largeImageKey = coverArtImage.src;

			switch ((pathname.match(/^\/release\/.*?\/(.*?)(\/.*?)?$/) || [])[1]) {
				case "discids": {
					presenceData.state = `Disc IDs for '${releaseName}'`;
					break;
				}
				case "cover-art": {
					presenceData.state = `Cover art for '${releaseName}'`;
					break;
				}
				case "aliases":
				case "tags":
				case "details": {
					presenceData.state = presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${releaseName}`;
					break;
				}
				case "add-cover-art":
				case "edit-cover-art": {
					presenceData.state = `Editing cover art for '${releaseName}'`;
					delete presenceData.buttons;
					break;
				}
				case "edit": {
					presenceData.details = "Editing release";
					presenceData.state = releaseName;
					delete presenceData.buttons;
					break;
				}
				case "edit-relationships": {
					presenceData.details = "Editing release relationships";
					presenceData.state = releaseName;
					delete presenceData.buttons;
					break;
				}
				default: {
					presenceData.state = releaseName;
				}
			}
			break;
		}
		case "release-group": {
			const releaseGroupName = document.querySelector("bdi").textContent,
				coverArtImage = document.querySelector<HTMLImageElement>(
					".cover-art-image > img"
				);
			presenceData.details = "Viewing release group";
			presenceData.buttons = [
				{
					label: "View Release Group",
					url: href,
				},
			];
			if (coverArtImage) presenceData.largeImageKey = coverArtImage.src;

			switch ((pathname.match(pathRegex) || [])[1]) {
				case "aliases":
				case "tags":
				case "ratings":
				case "details": {
					presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${releaseGroupName}`;
					break;
				}
				case "set-cover-art": {
					presenceData.details = "Setting release group cover art";
					presenceData.state = releaseGroupName;
					delete presenceData.buttons;
					break;
				}
				case "edit": {
					presenceData.details = "Editing release group";
					presenceData.state = releaseGroupName;
					delete presenceData.buttons;
					break;
				}
				case "edit_annotation": {
					presenceData.details = "Editing release group annotation";
					presenceData.state = releaseGroupName;
					delete presenceData.buttons;
					break;
				}
				default: {
					presenceData.state = releaseGroupName;
				}
			}
			break;
		}
		case "search": {
			presenceData.details = "Searching";
			presenceData.state = new URLSearchParams(search).get("query");
			break;
		}
		case "series": {
			const seriesName = document.querySelector("bdi").textContent;
			presenceData.details = "Viewing series";
			presenceData.buttons = [
				{
					label: "View Series",
					url: href,
				},
			];
			switch ((pathname.match(pathRegex) || [])[1]) {
				case "aliases":
				case "tags":
				case "details": {
					presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${seriesName}`;
					break;
				}
				case "edit": {
					presenceData.details = "Editing series";
					presenceData.state = seriesName;
					delete presenceData.buttons;
					break;
				}
				case "edit_annotation": {
					presenceData.details = "Editing series annotation";
					presenceData.state = seriesName;
					delete presenceData.buttons;
					break;
				}
				default: {
					presenceData.state = seriesName;
				}
			}
			break;
		}
		case "tag": {
			const tagName =
				document.querySelector<HTMLAnchorElement>("h1 > a").textContent;
			presenceData.details = "Viewing tag";
			presenceData.buttons = [
				{
					label: "View Tag",
					url: href,
				},
			];
			switch ((pathname.match(pathRegex) || [])[1]) {
				case "artist":
				case "release-group":
				case "release":
				case "recording":
				case "work":
				case "label":
				case "place":
				case "area":
				case "instrument":
				case "series":
				case "event": {
					presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${tagName}`;
					break;
				}
				default: {
					presenceData.state = tagName;
				}
			}
			break;
		}
		case "url": {
			if (pathname.endsWith("/edit")) presenceData.details = "Editing URL";
			else presenceData.details = "Viewing URL";

			presenceData.state = document.querySelector("bdi").textContent;
			break;
		}
		case "user": {
			const [, profilePath] = pathname.match(pathRegex) || [],
				username = document.querySelector("bdi").textContent;
			presenceData.details = "Viewing user profile";
			switch (profilePath) {
				case "ratings":
				case "subscribers":
				case "collections": {
					presenceData.state = `${username}'s ${profilePath}`;
					break;
				}
				case "tags": {
					presenceData.state = document.querySelector("h2").textContent;
					break;
				}
				default: {
					if (profilePath?.startsWith("subscriptions/")) {
						presenceData.state = `${username}'s ${
							profilePath.match(/^subscriptions\/(.*?)\/?$/)[1][1]
						} subscriptions`;
					} else presenceData.state = username;
				}
			}
			break;
		}
		case "work": {
			const workName = document.querySelector("bdi").textContent;
			presenceData.details = "Viewing work";
			presenceData.buttons = [
				{
					label: "View Work",
					url: href,
				},
			];
			switch ((pathname.match(pathRegex) || [])[1]) {
				case "aliases":
				case "tags":
				case "details": {
					presenceData.state = `${document.querySelector(
						".sel bdi"
					)} for ${workName}`;
					break;
				}
				case "edit": {
					presenceData.details = "Editing work";
					presenceData.state = workName;
					delete presenceData.buttons;
					break;
				}
				case "edit_annotation": {
					presenceData.details = "Editing work annotation";
					presenceData.state = workName;
					delete presenceData.buttons;
					break;
				}
				default: {
					presenceData.state = workName;
				}
			}
			break;
		}
		default: {
			presenceData.details = "Browsing...";
			presenceData.state = document.title.split(" - MusicBrainz")[0];
		}
	}

	presence.setActivity(presenceData);
});
