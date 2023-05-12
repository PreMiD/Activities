const presence = new Presence({
		clientId: "966711989533544580",
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

async function getStrings() {
	return presence.getStrings(
		{
			browse: "general.browsing",
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}

enum Assets {
	Logo = "https://i.imgur.com/mqJJ4p9.png",
}

let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
			startTimestamp: browsingTimestamp,
		},
		[newLang, privacy, buttons] = await Promise.all([
			presence.getSetting<string>("lang").catch(() => "en"),
			presence.getSetting<boolean>("privacy"),
			presence.getSetting<boolean>("buttons"),
		]),
		{ href, pathname } = document.location;

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}
	if (privacy) {
		presenceData.details = strings.browse;
		presence.setActivity(presenceData);
		return;
	}
	let title: string;
	const type = document.querySelector(
			"body > main > section > div.row.mb-4 > div.col-12.col-lg.d-flex.align-items-center.mb-3.mb-lg-0 > h1"
		),
		active =
			document.querySelector('[class="nav-link active"]') ??
			document.querySelector('[class="active"]');
	switch (pathname.split("/")[1]) {
		case "": {
			presenceData.details = "Homepage";
			break;
		}
		case "affiliate": {
			presenceData.buttons = [
				{
					label: "View Affiliates",
					url: href,
				},
			];
			presenceData.details = "Viewing affiliates";
			break;
		}
		case "dashboard": {
			presenceData.details = "Viewing the dashboard";
			presenceData.buttons = [
				{
					label: "View Dashboard",
					url: href,
				},
			];
			break;
		}
		case "link": {
			presenceData.state =
				document.querySelector('[aria-expanded="true"]')?.textContent ?? "";
			if (pathname.endsWith("statistics")) {
				presenceData.details = `Viewing statistics of link: ${
					document.querySelector('[id="link_url"]')?.textContent
				}`;
			} else {
				presenceData.details = `Editing link: ${
					document.querySelector("#link_url").textContent
				}`;
			}
			break;
		}
		case "tools": {
			if (active) presenceData.details = `Using ${active.textContent}`;
			else presenceData.details = "Viewing all tools";
			break;
		}
		default: {
			if (document.querySelector("body").className.includes("open")) {
				title = document
					.querySelectorAll('[class="modal-title"]')[1]
					.textContent.replace("Edit", "");
				presenceData.details = title;
				presenceData.state =
					document.querySelector<HTMLInputElement>("#update_name").value;
			} else if (type && !active) {
				title = type.textContent.trim();
				presenceData.buttons = [
					{
						label: "View All",
						url: href,
					},
				];
				presenceData.details = `Viewing all ${title}`;
			} else if (active) presenceData.details = active.textContent.trim();
		}
	}
	if (!buttons && presenceData.buttons) delete presenceData.buttons;

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
